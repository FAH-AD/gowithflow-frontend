import React, { useEffect, useState } from 'react';
import { listEventbriteIntents, myRegistrations } from '../services/eventApi';
import toast from 'react-hot-toast';

export default function MyRegistrationsPage() {
  const [internalRegs, setInternalRegs] = useState([]);
  const [ebRegs, setEbRegs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [internal, eb] = await Promise.all([myRegistrations(), listEventbriteIntents()]);
      setInternalRegs(internal.data.data || []);
      setEbRegs(eb.data.data || []);
    } catch (err) {
      toast.error('Unable to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Registrations</h1>
      {loading && <p>Loading...</p>}
      <div>
        <h2 className="font-semibold mb-2">Internal</h2>
        <div className="grid gap-2">
          {internalRegs.map((reg) => (
            <div key={reg._id} className="border rounded p-3">
              <div className="font-semibold">{reg.eventId?.title}</div>
              <div className="text-xs text-gray-500">Status: {reg.status}</div>
            </div>
          ))}
          {!loading && internalRegs.length === 0 && <p className="text-sm">No registrations.</p>}
        </div>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Eventbrite</h2>
        <div className="grid gap-2">
          {ebRegs.map((reg) => (
            <div key={reg._id} className="border rounded p-3">
              <div className="font-semibold">Event ID: {reg.eventbriteEventId}</div>
              <div className="text-xs text-gray-500">Status: {reg.status}</div>
            </div>
          ))}
          {!loading && ebRegs.length === 0 && <p className="text-sm">No Eventbrite intents.</p>}
        </div>
      </div>
    </div>
  );
}
