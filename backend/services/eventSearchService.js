import Event from '../models/Event.js';
import { normalizeEventbriteEvent } from './eventbriteService.js';

// For now: do not use default tags in search
const DEFAULT_TAGS = [];

export const unifiedMapInternal = (evt, userId) => ({
  id: evt._id.toString(),
  source: 'internal',
  title: evt.title,
  description: evt.description,
  categoryTags: evt.categoryTags?.length ? evt.categoryTags : DEFAULT_TAGS,
  startAt: evt.startAt,
  endAt: evt.endAt,
  timezone: evt.timezone || 'UTC',
  locationName: evt.locationName,
  city: evt.city,
  region: evt.region,
  country: evt.country,
  coverImageUrl: evt.coverImageUrl,
  externalUrl: evt.eventbriteUrl,
  isOnline: !!evt.locationName && evt.locationName.toLowerCase().includes('online'),
  capacity: evt.capacity,
  isPublished: evt.isPublished,
  ownership: { createdByMe: evt.ownership?.createdBy?.toString() === userId?.toString() },
});

export const searchInternalEvents = async ({ q, location, tags, userId }) => {
  const filter = { isPublished: true };
  if (location) {
    const rx = new RegExp(location, 'i');
    filter.$or = [{ city: rx }, { region: rx }, { country: rx }, { locationName: rx }];
  }
  const tagList = tags?.length ? tags : DEFAULT_TAGS;
  if (tagList.length) {
    filter.categoryTags = { $in: tagList };
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const events = await Event.find(filter).sort({ startAt: 1 });
  return events.map((evt) => unifiedMapInternal(evt, userId));
};

export const mergeEvents = (...lists) =>
  lists.flat().filter(Boolean).sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

export const normalizeEventbriteList = (list) => list.map(normalizeEventbriteEvent);

export const fallbackTags = DEFAULT_TAGS;
