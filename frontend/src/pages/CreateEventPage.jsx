import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createEvent } from '../services/eventApi';

const DEFAULT_TAGS = ['AI', 'XR', 'VR', 'AR'];

export default function CreateEventPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryTags: DEFAULT_TAGS,
    startAt: '',
    endAt: '',
    timezone: 'UTC',
    locationName: '',
    city: '',
    region: '',
    country: '',
    capacity: 0,
    coverImageUrl: '',
    isPublished: true,
  });
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setForm((prev) => {
      const exists = prev.categoryTags.includes(tag);
      const updated = exists ? prev.categoryTags.filter((t) => t !== tag) : [...prev.categoryTags, tag];
      return { ...prev, categoryTags: updated.length ? updated : DEFAULT_TAGS };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createEvent(form);
      toast.success('Event created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Create Event</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="datetime-local"
            className="border p-2 rounded"
            value={form.startAt}
            onChange={(e) => setForm({ ...form, startAt: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            className="border p-2 rounded"
            value={form.endAt}
            onChange={(e) => setForm({ ...form, endAt: e.target.value })}
          />
        </div>
        <input
          className="w-full border p-2 rounded"
          placeholder="Timezone (e.g. UTC)"
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Location name"
            value={form.locationName}
            onChange={(e) => setForm({ ...form, locationName: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Region"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>
        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Capacity (0 = unlimited)"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Cover image URL"
          value={form.coverImageUrl}
          onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
        />
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_TAGS.map((tag) => (
            <label key={tag} className="flex items-center space-x-1 text-sm">
              <input type="checkbox" checked={form.categoryTags.includes(tag)} onChange={() => toggleTag(tag)} />
              <span>{tag}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          <span>Published</span>
        </label>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
