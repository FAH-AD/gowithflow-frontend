import { post } from './ApiEndpoint.js';
import axios from 'axios';

// WARNING: Exposing Eventbrite tokens in the frontend is not safe for production.
// For local/admin-only tools it's acceptable but be careful not to commit the token.
const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';
const EVENTBRITE_ACCESS_TOKEN = 'IDQRBCL7BJZE3WGWKWW3';

const eventbriteClient = () =>
  axios.create({
    baseURL: EVENTBRITE_API_BASE,
    headers: {
      Authorization: `Bearer ${EVENTBRITE_ACCESS_TOKEN}`,
    },
  });

// Step 1: get upload instructions directly from Eventbrite
export const getEventbriteUploadInstructions = async () => {
  const client = eventbriteClient();
  const res = await client.get('/media/upload/', {
    params: { type: 'image-event-logo' },
  });
  return res;
};

// Step 2: upload file directly to upload_url
export const uploadEventbriteFileToStorage = async ({
  upload_url,
  upload_data,
  file_parameter_name,
  file,
}) => {
  const formData = new FormData();
  // Add Eventbrite-provided fields
  if (upload_data && typeof upload_data === 'object') {
    Object.keys(upload_data).forEach((key) => {
      formData.append(key, upload_data[key]);
    });
  }
  // Add the file using the provided field name
  formData.append(file_parameter_name, file);

  const res = await axios.post(upload_url, formData, {
    headers: {
      // Do NOT send our Authorization header here; upload_url is usually S3
      ...formData.getHeaders?.(), // in browser this is undefined, safe to spread
    },
  });
  return res;
};

// Step 3: notify Eventbrite to get logo_id directly
export const notifyEventbriteUpload = async (upload_token) => {
  const client = eventbriteClient();
  const res = await client.post('/media/upload/', {
    upload_token,
    type: 'image-event-logo',
  });
  return res;
};

/**
 * Create Eventbrite event (draft)
 * @param {Object} eventData - Event data
 * @returns {Promise} Response with event_id
 */
export const createEventbriteEvent = async (eventData) => {
  return post('/api/admin/eventbrite/create-event', eventData);
};

/**
 * Create ticket class for Eventbrite event
 * @param {Object} ticketData - Ticket data
 * @returns {Promise} Response with ticket_id
 */
export const createEventbriteTicket = async (ticketData) => {
  return post('/api/admin/eventbrite/create-ticket', ticketData);
};

/**
 * Publish Eventbrite event
 * @param {string} eventId - Event ID to publish
 * @returns {Promise} Response with published event data
 */
export const publishEventbriteEvent = async (eventId) => {
  return post('/api/admin/eventbrite/publish-event', { event_id: eventId });
};
