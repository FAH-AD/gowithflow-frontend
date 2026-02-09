import axios from 'axios';

const API_BASE = 'https://www.eventbriteapi.com/v3';
const DEFAULT_Q = 'technology';

const client = (token) =>
  axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

export const buildAuthUrl = ({ clientId, redirectUri, state = 'evt' }) =>
  `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}`;

export const exchangeCodeForToken = async ({ clientId, clientSecret, code, redirectUri }) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('code', code);
  params.append('redirect_uri', redirectUri);

  const { data } = await axios.post('https://www.eventbrite.com/oauth/token', params);
  return data.access_token;
};

export const listOrganizations = async (token) => {
  const { data } = await client(token).get('/users/me/organizations/');
  return data.organizations || [];
};

export const publishEvent = async ({ token, orgId, payload }) => {
  const api = client(token);
  const { data: event } = await api.post(`/organizations/${orgId}/events/`, payload);
  return event;
};

export const createEventTicket = async ({ token, eventId, capacity }) => {
  const api = client(token);
  const ticketPayload = {
    ticket_class: {
      name: 'General Admission',
      free: true,
      quantity_total: capacity > 0 ? capacity : null,
    },
  };
  await api.post(`/events/${eventId}/ticket_classes/`, ticketPayload);
};

export const normalizeEventbriteEvent = (evt) => ({
  id: evt.id,
  source: 'eventbrite',
  title: evt.name?.text,
  description: evt.description?.text || '',
  categoryTags: [],
  startAt: evt.start?.utc,
  endAt: evt.end?.utc,
  timezone: evt.start?.timezone || 'UTC',
  locationName: evt.venue?.name || '',
  city: evt.venue?.address?.city || '',
  region: evt.venue?.address?.region || '',
  country: evt.venue?.address?.country || '',
  coverImageUrl: evt.logo?.original?.url,
  externalUrl: evt.url,
  isOnline: !!evt.online_event,
  capacity: evt.capacity,
  isPublished: evt.status === 'live',
  ownership: {},
});

// Supported Eventbrite search inputs we expose:
// - q
// - location.address (mapped from `location`)
// - online_events_only (mapped from `onlineOnly`)
// - page
export const searchEventbriteEvents = async ({ token, q, location, onlineOnly, page }) => {
  if (!token) return [];
  const keyword = (q || '').trim();
  const params = {
    q: keyword || DEFAULT_Q,
    sort_by: 'date',
    page: Number(page || 0) + 1,
    expand: 'venue,organizer',
  };

  const address = (location || '').trim();
  if (address) params['location.address'] = address;
  if (onlineOnly === true) params.online_events_only = true;
  if (onlineOnly === false) params.online_events_only = false;

  try {
    const { data } = await client(token).get('/events/search/', { params, timeout: 8000 });
    const events = data.events || [];
    return events.map((evt) => normalizeEventbriteEvent(evt));
  } catch (err) {
    return [];
  }
};

export const getEventbriteEventById = async ({ token, eventId }) => {
  if (!token) return null;
  try {
    const { data } = await client(token).get(`/events/${eventId}/`, {
      params: { expand: 'venue,organizer' },
      timeout: 8000,
    });
    return normalizeEventbriteEvent(data);
  } catch (err) {
    return null;
  }
};
