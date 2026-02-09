import axios from 'axios';

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const DEFAULT_TAGS = ['AI', 'XR', 'VR', 'AR'];

const normalizeTicketmasterEvent = (item) => {
  const venue = item._embedded?.venues?.[0] || {};
  return {
    id: item.id,
    source: 'ticketmaster',
    title: item.name,
    description: item.info || item.pleaseNote || '',
    categoryTags: item.classifications?.flatMap((c) => [c.genre?.name, c.segment?.name].filter(Boolean)) || DEFAULT_TAGS,
    startAt: item.dates?.start?.dateTime,
    endAt: item.dates?.end?.dateTime,
    timezone: item.dates?.timezone || 'UTC',
    locationName: venue.name || '',
    city: venue.city?.name || '',
    region: venue.state?.name || '',
    country: venue.country?.countryCode || '',
    coverImageUrl: item.images?.[0]?.url,
    externalUrl: item.url,
    capacity: undefined,
    isPublished: true,
    ownership: {},
  };
};

export const searchTicketmaster = async ({ apiKey, q, city, countryCode, tags, page }) => {
  if (!apiKey) return [];
  const keyword = [q, ...(tags?.length ? tags : DEFAULT_TAGS)].filter(Boolean).join(' ');
  const params = {
    apikey: apiKey,
    keyword,
    sort: 'date,asc',
    size: 20,
    page: page || 0,
  };
  if (city) params.city = city;
  if (countryCode) params.countryCode = countryCode;

  try {
    const { data } = await axios.get(BASE_URL, { params, timeout: 5000 });
    const events = data._embedded?.events || [];
    return events.map(normalizeTicketmasterEvent);
  } catch (err) {
    // If Ticketmaster fails (invalid key, rate limit, network), just return empty so app won't crash
    return [];
  }
};
