import { get, post, put, deleteReq } from './ApiEndpoint';

export const searchEvents = (params) => get('/api/events/search', params);
export const fetchEvent = (id) => get(`/api/events/${id}`);
export const fetchExternalEvent = (source, id) => get(`/api/events/external/${source}/${id}`);
export const createEvent = (data) => post('/api/events', data);
export const updateEvent = (id, data) => put(`/api/events/${id}`, data);
export const deleteEvent = (id) => deleteReq(`/api/events/${id}`);
export const togglePublish = (id, isPublished) => post(`/api/events/${id}/publish`, { isPublished });
export const listMyEvents = () => get('/api/events/mine');

export const registerInternal = (eventId) => post(`/api/registrations/internal/${eventId}`);
export const cancelInternal = (eventId) => post(`/api/registrations/internal/${eventId}/cancel`);
export const myRegistrations = () => get('/api/registrations/me');

export const recordEventbriteIntent = (payload) => post('/api/registrations/eventbrite/intent', payload);
export const listEventbriteIntents = () => get('/api/registrations/eventbrite/me');

export const connectEventbrite = () => get('/api/integrations/eventbrite/connect');
export const fetchEventbriteOrgs = () => get('/api/integrations/eventbrite/orgs');
export const publishToEventbrite = (id, orgId) => post(`/api/integrations/eventbrite/publish/${id}`, { orgId });
export const setPreferredOrg = (orgId) => post('/api/integrations/eventbrite/preferred-org', { orgId });
