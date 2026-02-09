import axios from 'axios';
import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import OAuthToken from '../models/OAuthToken.js';
import {
  fallbackTags,
  normalizeEventbriteList,
  searchInternalEvents,
} from '../services/eventSearchService.js';
import { getEventbriteEventById } from '../services/eventbriteService.js';
import { searchSerpApiEvents } from '../services/serpApiService.js';

const DEFAULT_TAGS = fallbackTags;

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors.array();
    throw err;
  }
};

export const createEvent = async (req, res, next) => {
  try {
    handleValidation(req);
    const payload = req.body;
    const event = await Event.create({
      ...payload,
      categoryTags: payload.categoryTags?.length ? payload.categoryTags : DEFAULT_TAGS,
      ownership: { createdBy: req.user._id },
      source: 'internal',
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const evt = await Event.findById(req.params.id);
    if (!evt) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: evt });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    handleValidation(req);
    const evt = await Event.findById(req.params.id);
    if (!evt) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (evt.ownership?.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const updates = req.body;
    if (!updates.categoryTags?.length) {
      updates.categoryTags = DEFAULT_TAGS;
    }
    Object.assign(evt, updates);
    await evt.save();
    res.json({ success: true, data: evt });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const evt = await Event.findById(req.params.id);
    if (!evt) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (evt.ownership?.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    await evt.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const myEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ 'ownership.createdBy': req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const fetchEventbriteOwnedEvents = async (token, page = 1) => {
  const api = axios.create({
    baseURL: 'https://www.eventbriteapi.com/v3',
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data } = await api.get('/users/me/owned_events/', { params: { page } });
  const events = data.events || [];
  // fetch venue details for better location if available
  return normalizeEventbriteList(events);
};

// Events search: SerpAPI (Google Events) only. Params match SerpAPI: q, location, online, page, dateChip, gl, hl.
export const searchEvents = async (req, res, next) => {
  try {
    const { q, location, online, page = 0, dateChip, gl, hl } = req.query;
    const onlineOnly = online === 'online' ? true : online === 'onsite' ? false : undefined;
    const serpApiKey = process.env.SERPAPI_API_KEY;

    if (!serpApiKey) {
      return res.json({ success: true, data: [] });
    }

    const events = await searchSerpApiEvents({
      apiKey: serpApiKey,
      q,
      location,
      gl: gl || 'us',
      hl: hl || 'en',
      onlineOnly,
      dateChip: dateChip || undefined,
      start: Number(page) * 10,
    });

    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

export const internalOnlySearch = searchInternalEvents;

export const getExternalEvent = async (req, res, next) => {
  try {
    const { source, id } = req.params;
    if (source !== 'eventbrite') {
      return res.status(400).json({ success: false, message: 'Unsupported source' });
    }
    const tokenDoc = req.user?._id
      ? await OAuthToken.findOne({ userId: req.user._id, provider: 'eventbrite' })
      : null;
    const token = tokenDoc?.accessToken || process.env.EVENTBRITE_PRIVATE_TOKEN;
    const evt = await getEventbriteEventById({ token, eventId: id });
    if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: evt });
  } catch (err) {
    next(err);
  }
};

export const publishStatus = async (req, res, next) => {
  try {
    const evt = await Event.findById(req.params.id);
    if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });
    if (evt.ownership?.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    evt.isPublished = !!req.body.isPublished;
    await evt.save();
    res.json({ success: true, data: evt });
  } catch (err) {
    next(err);
  }
};
