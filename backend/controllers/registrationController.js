import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors.array();
    throw err;
  }
};

export const registerInternal = async (req, res, next) => {
  try {
    validate(req);
    const { eventId } = req.params;
    const evt = await Event.findById(eventId);
    if (!evt || !evt.isPublished) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const existing = await Registration.findOne({ userId: req.user._id, eventId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }
    if (evt.capacity > 0) {
      const count = await Registration.countDocuments({ eventId, status: { $ne: 'cancelled' } });
      if (count >= evt.capacity) {
        return res.status(400).json({ success: false, message: 'Event is at capacity' });
      }
    }
    const reg = await Registration.create({
      userId: req.user._id,
      eventId,
      provider: 'internal',
      status: 'confirmed',
    });
    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
};

export const cancelInternal = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const reg = await Registration.findOne({ userId: req.user._id, eventId });
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    reg.status = 'cancelled';
    await reg.save();
    res.json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
};

export const myRegistrations = async (req, res, next) => {
  try {
    const regs = await Registration.find({ userId: req.user._id, provider: 'internal' })
      .populate('eventId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: regs });
  } catch (err) {
    next(err);
  }
};

export const eventbriteIntent = async (req, res, next) => {
  try {
    validate(req);
    const { eventbriteEventId, internalEventId, eventTitle, eventUrl } = req.body;
    const record = await Registration.create({
      userId: req.user._id,
      provider: 'eventbrite',
      eventbriteEventId,
      eventId: internalEventId || undefined,
      status: 'intent',
    });
    res.status(201).json({ success: true, data: { ...record.toObject(), eventTitle, eventUrl } });
  } catch (err) {
    next(err);
  }
};

export const eventbriteList = async (req, res, next) => {
  try {
    const regs = await Registration.find({ userId: req.user._id, provider: 'eventbrite' }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: regs });
  } catch (err) {
    next(err);
  }
};

export const handleEventbriteWebhook = async (req, res, next) => {
  try {
    const secret = process.env.EVENTBRITE_WEBHOOK_SECRET;
    if (secret && req.headers['x-eventbrite-signature'] !== secret) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
    const { api_url: apiUrl, config } = req.body;
    const eventbriteEventId = config?.object_id;

    if (!eventbriteEventId) {
      return res.status(400).json({ success: false, message: 'Missing event id' });
    }

    const reg = await Registration.findOne({ eventbriteEventId });
    if (reg) {
      reg.status = 'confirmed';
      await reg.save();
    } else {
      await Registration.create({
        provider: 'eventbrite',
        eventbriteEventId,
        status: 'external_confirmed',
      });
    }
    res.json({ success: true, received: true, apiUrl });
  } catch (err) {
    next(err);
  }
};
