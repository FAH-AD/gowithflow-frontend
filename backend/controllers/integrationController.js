import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Event from '../models/Event.js';
import OAuthToken from '../models/OAuthToken.js';
import User from '../models/User.js';
import { buildAuthUrl, createEventTicket, exchangeCodeForToken, listOrganizations, publishEvent } from '../services/eventbriteService.js';

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors.array();
    throw err;
  }
};

export const connectEventbrite = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.split(' ')[1];
    const url = buildAuthUrl({
      clientId: process.env.EVENTBRITE_CLIENT_ID,
      redirectUri: process.env.EVENTBRITE_REDIRECT_URI,
      state: bearer || 'evt',
    });
    res.redirect(url);
  } catch (err) {
    next(err);
  }
};

export const eventbriteCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ success: false, message: 'Missing code' });
    if (!state) return res.status(401).json({ success: false, message: 'Missing state' });

    const decoded = jwt.verify(state, process.env.JWT_SECRET || 'freelanceplatformsecret2023');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const token = await exchangeCodeForToken({
      clientId: process.env.EVENTBRITE_CLIENT_ID,
      clientSecret: process.env.EVENTBRITE_CLIENT_SECRET,
      redirectUri: process.env.EVENTBRITE_REDIRECT_URI,
      code,
    });
    await OAuthToken.findOneAndUpdate(
      { userId: user._id, provider: 'eventbrite' },
      { accessToken: token },
      { upsert: true, new: true }
    );
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/settings?eventbrite=connected`);
  } catch (err) {
    next(err);
  }
};

export const listEventbriteOrgs = async (req, res, next) => {
  try {
    const tokenDoc = await OAuthToken.findOne({ userId: req.user._id, provider: 'eventbrite' });
    if (!tokenDoc) return res.status(400).json({ success: false, message: 'Not connected' });
    const orgs = await listOrganizations(tokenDoc.accessToken);
    res.json({ success: true, data: orgs });
  } catch (err) {
    next(err);
  }
};

export const publishToEventbrite = async (req, res, next) => {
  try {
    validate(req);
    const evt = await Event.findById(req.params.internalEventId);
    if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });
    if (evt.ownership?.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    const tokenDoc = await OAuthToken.findOne({ userId: req.user._id, provider: 'eventbrite' });
    if (!tokenDoc) return res.status(400).json({ success: false, message: 'Eventbrite not connected' });

    const orgId = req.body.orgId || req.user.preferredEventbriteOrgId;
    if (!orgId) return res.status(400).json({ success: false, message: 'Missing orgId' });

    const payload = {
      event: {
        name: { html: evt.title },
        description: { html: evt.description || '' },
        start: { timezone: evt.timezone || 'UTC', utc: evt.startAt },
        end: { timezone: evt.timezone || 'UTC', utc: evt.endAt || evt.startAt },
        currency: 'USD',
        listed: true,
      },
    };

    const created = await publishEvent({ token: tokenDoc.accessToken, orgId, payload });
    if (evt.capacity) {
      await createEventTicket({ token: tokenDoc.accessToken, eventId: created.id, capacity: evt.capacity });
    }
    evt.eventbriteEventId = created.id;
    evt.eventbriteUrl = created.url;
    await evt.save();

    res.json({ success: true, data: { eventbriteEventId: created.id, url: created.url } });
  } catch (err) {
    next(err);
  }
};

export const setPreferredOrg = async (req, res, next) => {
  try {
    validate(req);
    const { orgId } = req.body;
    const user = await User.findById(req.user._id);
    user.preferredEventbriteOrgId = orgId;
    await user.save();
    res.json({ success: true, data: { preferredEventbriteOrgId: orgId } });
  } catch (err) {
    next(err);
  }
};
