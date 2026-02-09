import axios from 'axios';
import crypto from 'crypto';

/**
 * SerpAPI Google Events API integration.
 * @see https://serpapi.com/google-events-api
 *
 * API: GET https://serpapi.com/search?engine=google_events
 * Required: engine=google_events, api_key, q (search query)
 * Optional: location, gl (country), hl (language), start (pagination), htichips (filters)
 */

const SERPAPI_BASE = 'https://serpapi.com/search';
const DEFAULT_Q = 'technology events';

/**
 * Generate a stable id from event link (or title) for deduplication.
 */
const stableId = (link, title, index) => {
  const str = link || title || String(index);
  const hash = crypto.createHash('md5').update(str).digest('hex').slice(0, 12);
  return `serpapi-${index}-${hash}`;
};

/**
 * Normalize a SerpAPI events_results item to our unified event shape.
 * Response fields per docs: title, date (start_date, when), address, link, venue, thumbnail, image, description, ticket_info.
 */
export const normalizeSerpApiEvent = (evt, index) => {
  const venueName = evt.venue?.name || '';
  const addressLines = Array.isArray(evt.address) ? evt.address : [];
  const lastLine = addressLines[addressLines.length - 1] || '';
  // Last line is often "City, ST" or "City, Country" or "Hosted by X" for online events
  const hasCityCountry = lastLine.includes(',') && addressLines.length >= 2;
  const city = hasCityCountry ? lastLine.split(',')[0].trim() : '';
  const country = hasCityCountry ? lastLine.split(',').pop().trim() : '';
  const locationName = addressLines[0] || venueName || (evt.address?.[0] && !venueName ? 'Online' : '');

  // date.start_date (e.g. "Dec 7"), date.when (e.g. "Sun, Dec 7, 8:00 – 9:30 PM CST") – no ISO from API
  const whenStr = evt.date?.when || evt.date?.start_date || '';
  let startAt = new Date().toISOString();
  try {
    const parsed = new Date(whenStr);
    if (!Number.isNaN(parsed.getTime())) startAt = parsed.toISOString();
  } catch (_) {}

  const isOnline =
    /online|virtual|zoom|webinar|hosted by/i.test(evt.title || '') ||
    /online|virtual/i.test(evt.description || '') ||
    (addressLines.length === 1 && /hosted by/i.test(addressLines[0]));

  return {
    id: stableId(evt.link, evt.title, index),
    source: 'serpapi',
    title: evt.title || 'Event',
    description: evt.description || '',
    categoryTags: [],
    startAt,
    endAt: null,
    timezone: 'UTC',
    locationName: locationName || (isOnline ? 'Online' : ''),
    city,
    region: '',
    country,
    coverImageUrl: evt.image || evt.thumbnail,
    externalUrl: evt.link,
    isOnline,
    capacity: null,
    isPublished: true,
    ownership: {},
    organizer: venueName || (addressLines[0] && addressLines[0].startsWith('Hosted by') ? addressLines[0].replace(/^Hosted by\s*/i, '') : ''),
    rating: evt.venue?.rating,
    attendees: evt.venue?.reviews || 0,
  };
};

/**
 * Search events via SerpAPI Google Events API.
 * @see https://serpapi.com/google-events-api
 * @param {Object} opts
 * @param {string} opts.apiKey - SerpAPI API key (required)
 * @param {string} [opts.q] - Search query (required by API; default: "technology events"). Docs: include location in q for best results (e.g. "Events in Austin, TX")
 * @param {string} [opts.location] - Geographic location for search origin (optional)
 * @param {string} [opts.gl] - Country code: us, uk, fr, etc. (default: us)
 * @param {string} [opts.hl] - Language code: en, es, fr, etc. (default: en)
 * @param {boolean} [opts.onlineOnly] - If true, use htichips=event_type:Virtual-Event
 * @param {string} [opts.dateChip] - Optional htichips date filter: date:today, date:week, date:month, date:next_week, date:next_month
 * @param {number} [opts.start] - Result offset for pagination: 0 (default), 10, 20, ...
 * @returns {Promise<Array>} Normalized events array (same shape as Eventbrite for unified UI)
 */
export const searchSerpApiEvents = async ({
  apiKey,
  q,
  location,
  gl = 'us',
  hl = 'en',
  onlineOnly,
  dateChip,
  start = 0,
}) => {
  if (!apiKey) return [];

  // q is required. Docs: "include location inside your search query (e.g. Events in Austin, TX)" for best results
  const query = (q || '').trim() || DEFAULT_Q;
  const loc = (location || '').trim();
  const fullQuery = loc ? `${query} in ${loc}` : query;

  const params = {
    engine: 'google_events',
    q: fullQuery,
    api_key: apiKey,
    hl,
    gl,
    start: Number(start) || 0,
  };
  if (loc) params.location = loc;

  // htichips: event_type:Virtual-Event = online only; date:today, date:week, date:month, etc.
  const chips = [];
  if (onlineOnly === true) chips.push('event_type:Virtual-Event');
  if (dateChip) chips.push(dateChip);
  if (chips.length) params.htichips = chips.join(',');

  try {
    const { data } = await axios.get(SERPAPI_BASE, { params, timeout: 15000 });

    // Docs: search_metadata.status = "Processing" | "Success" | "Error"; error message in data.error
    if (data.error) {
      console.warn('SerpAPI error:', data.error);
      return [];
    }
    const status = data.search_metadata?.status;
    if (status === 'Error') {
      console.warn('SerpAPI search failed:', data.search_metadata);
      return [];
    }

    const results = data.events_results || [];
    return results.map((evt, i) => normalizeSerpApiEvent(evt, start + i));
  } catch (err) {
    console.warn('SerpAPI events search failed:', err.message);
    return [];
  }
};
