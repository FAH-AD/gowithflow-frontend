import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  deleteEvent,
  fetchEventbriteOrgs,
  listMyEvents,
  publishToEventbrite,
  togglePublish,
} from '../services/eventApi';

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await listMyEvents();
      setEvents(data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteEvent(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to delete');
    }
  };

  const onPublishToggle = async (id, current) => {
    try {
      await togglePublish(id, !current);
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to update');
    }
  };

  const loadOrgs = async () => {
    try {
      const { data } = await fetchEventbriteOrgs();
      setOrgs(data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Connect Eventbrite first');
    }
  };

  const onPublishEB = async (id) => {
    try {
      await publishToEventbrite(id, selectedOrg);
      toast.success('Published to Eventbrite');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to publish');
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">My Events</h1>
      <div className="flex gap-2 items-center">
        <button className="border px-3 py-2 rounded" onClick={loadOrgs}>
          Load Eventbrite Orgs
        </button>
        {orgs.length > 0 && (
          <select
            className="border p-2 rounded"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            <option value="">Select org</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {loading && <p>Loading...</p>}
      <div className="grid gap-3">
        {events.map((evt) => (
          <div key={evt._id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{evt.title}</div>
                <div className="text-xs text-gray-500">{evt.city} {evt.country}</div>
                {evt.eventbriteEventId && (
                  <a className="text-blue-600 text-sm" href={evt.eventbriteUrl} target="_blank" rel="noreferrer">
                    View on Eventbrite
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="border px-3 py-1 rounded"
                  onClick={() => onPublishToggle(evt._id, evt.isPublished)}
                >
                  {evt.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button className="border px-3 py-1 rounded" onClick={() => onDelete(evt._id)}>
                  Delete
                </button>
                <button className="bg-indigo-600 text-white px-3 py-1 rounded" onClick={() => onPublishEB(evt._id)}>
                  Publish to Eventbrite
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!loading && events.length === 0 && <p>No events yet.</p>}
    </div>
  );
}
