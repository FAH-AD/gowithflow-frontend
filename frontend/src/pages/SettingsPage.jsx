import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchEventbriteOrgs, setPreferredOrg } from '../services/eventApi';

export default function SettingsPage() {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');

  const loadOrgs = async () => {
    try {
      const { data } = await fetchEventbriteOrgs();
      setOrgs(data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Connect Eventbrite first');
    }
  };

  useEffect(() => {
    if (window.location.search.includes('eventbrite=connected')) {
      toast.success('Eventbrite connected');
      loadOrgs();
    }
  }, []);

  const connect = () => {
    window.location.href = 'http://localhost:5000/api/integrations/eventbrite/connect';
  };

  const saveOrg = async () => {
    try {
      await setPreferredOrg(selectedOrg);
      toast.success('Preferred org saved');
    } catch (err) {
      toast.error('Unable to save org');
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={connect}>
        Connect Eventbrite
      </button>
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <button className="border px-3 py-2 rounded" onClick={loadOrgs}>
            Load Organizations
          </button>
          <select
            className="border p-2 rounded"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            <option value="">Select organization</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={saveOrg}>
            Save Preferred Org
          </button>
        </div>
      </div>
    </div>
  );
}
