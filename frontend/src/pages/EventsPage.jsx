import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordEventbriteIntent, registerInternal, searchEvents } from '../services/eventApi';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

// For now: no tag filtering; load technology events
const DEFAULT_TECH_Q = 'xr events';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    city: '',
    location: '',
    type: 'all', // 'all' | 'online' | 'onsite' -> SerpAPI onlineOnly / htichips
    date: 'all', // 'all' | 'today' | 'week' | 'month' | 'next_week' | 'next_month' -> SerpAPI dateChip
  });
  const [defaultPlace, setDefaultPlace] = useState({ city: 'United States', location: 'United States' });
  const navigate = useNavigate();

  // SerpAPI location: city, or location string, or default. Docs: include location in q for best results.
  const buildSerpApiLocation = (active) => {
    const loc = (active.location || '').trim();
    const city = (active.city || '').trim();
    if (loc) return loc;
    if (city) return city;
    return 'United States';
  };

  // SerpAPI params: q (query), location (geographic), online (onlineOnly), dateChip, page
  const handleSearch = async (override) => {
    try {
      setLoading(true);
      const active = override || filters;
      const locationStr = buildSerpApiLocation(active);
      const dateChipMap = {
        all: undefined,
        today: 'date:today',
        week: 'date:week',
        month: 'date:month',
        next_week: 'date:next_week',
        next_month: 'date:next_month',
      };
      const params = {
        q: (active.title || '').trim() || DEFAULT_TECH_Q,
        location: locationStr,
        online: active.type,
        dateChip: dateChipMap[active.date] || undefined,
      };

      const { data } = await searchEvents(params);
      setEvents(data?.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Location is defaulted to United States; no geolocation in this mode.

  // Default to United States
  useEffect(() => {
    (async () => {
      const next = { ...filters, city: 'United States', location: 'United States' };
      setDefaultPlace({ city: 'United States', location: 'United States' });
      setFilters(next);
      await handleSearch(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset filters (SerpAPI defaults)
  const handleReset = () => {
    const next = {
      title: '',
      city: defaultPlace.city || 'United States',
      location: defaultPlace.location || 'United States',
      type: 'all',
      date: 'all',
    };
    setFilters(next);
    handleSearch(next);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayNum = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timezone = dateString.includes('EST') ? 'EST' : dateString.includes('EDT') ? 'EDT' : 'UTC';
    return `${day}, ${month} ${dayNum} - ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm} ${timezone}`;
  };

  const onRegister = async (evt) => {
    try {
      if (evt.source !== 'internal') {
        if (evt.source === 'eventbrite' && evt.externalUrl) {
          await recordEventbriteIntent({
            eventbriteEventId: evt.id,
            eventTitle: evt.title,
            eventUrl: evt.externalUrl,
          });
        }
        if (evt.externalUrl) window.open(evt.externalUrl, '_blank');
        return;
      }
      await registerInternal(evt.id);
      toast.success('Registered');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to register');
    }
  };

  // SerpAPI events have no detail page on our backend; open external link. Eventbrite/internal go to /events/:id.
  const onEventCardClick = (evt) => {
    if (evt.source === 'serpapi' && evt.externalUrl) {
      window.open(evt.externalUrl, '_blank');
      return;
    }
    navigate(`/events/${evt.id}`);
  };

  const renderStars = (rating) => {
    const num = typeof rating === 'number' && !Number.isNaN(rating) ? rating : 0;
    const fullStars = Math.floor(num);
    const hasHalfStar = num % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${i < fullStars ? 'text-yellow-400 fill-current' : i === fullStars && hasHalfStar ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {num > 0 && <span className="text-xs text-gray-600 ml-1">{num}</span>}
      </div>
    );
  };

  // Location string for unified format (Eventbrite + SerpAPI): city, region/country, or locationName
  const eventLocation = (evt) => {
    const parts = [];
    if (evt.city) parts.push(evt.city);
    if (evt.region) parts.push(evt.region);
    else if (evt.country) parts.push(evt.country);
    if (parts.length) return parts.join(', ');
    return evt.locationName || (evt.isOnline ? 'Online' : '');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Header */}
     

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title and Filters */}
        <div className="mb-6">
          {/*
            Heading should follow the current search inputs.
            Prefer city (exact), otherwise fall back to location string.
          */}
          {(() => {
            const city = (filters.city || '').trim();
            const loc = (filters.location || '').trim();
            const headingLoc = city || loc;
            return (
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                Technology events{headingLoc ? ` near ${headingLoc}` : ''}
              </h1>
            );
          })()}
          
          {/* Search Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Event Title Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Title
                </label>
                <input
                  type="text"
                  placeholder="Enter event title..."
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="w-full border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                />
              </div>

              {/* City Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                />
              </div>

              {/* Location Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full text-gray-600 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full text-gray-600 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                >
                  <option value="all">All Types</option>
                  <option value="online">Online</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              {/* Date filter (SerpAPI htichips: date:today, date:week, date:month, etc.) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <select
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full text-gray-600 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                >
                  <option value="all">All dates</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="next_week">Next week</option>
                  <option value="next_month">Next month</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: '#12a1e2' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0f8bc4'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#12a1e2'}
              >
                {loading ? 'Searching...' : 'Search Events'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              {!loading && events.length > 0 && (
                <span className="text-sm text-gray-600">
                  {events.length} event{events.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        {/* <div className="mb-6 overflow-x-auto">
          <div className="flex gap-4 pb-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedCategory === cat ? { backgroundColor: '#12a1e2' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div> */}

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#12a1e2] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onEventCardClick(evt)}
              >
                {/* Event Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={evt.coverImageUrl || 'https://via.placeholder.com/400x200'}
                    alt={evt.title || 'Event'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200/12a1e2/FFFFFF?text=Event';
                    }}
                  />
                  {/* Source badge for SerpAPI / Google Events */}
                  <span className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded bg-gray-800/80 text-white">
                    Google Events
                  </span>
                  <button
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Bookmark functionality
                    }}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                {/* Event Content */}
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{evt.startAt ? formatDate(evt.startAt) : ''}</div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{evt.title || 'Event'}</h3>
                  {evt.isOnline && (
                    <span className="inline-block text-xs font-medium px-2 py-1 rounded mb-2" style={{ color: '#12a1e2', backgroundColor: 'rgba(18, 161, 226, 0.1)' }}>
                      Online
                    </span>
                  )}
                  {eventLocation(evt) && (
                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <span>{eventLocation(evt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex-1">
                      {evt.organizer && <div className="text-sm text-gray-600 mb-1">{evt.organizer}</div>}
                      <div className="flex items-center gap-3 flex-wrap">
                        {renderStars(evt.rating)}
                        {typeof evt.attendees === 'number' && evt.attendees >= 0 && (
                          <span className="text-xs text-gray-500">{evt.attendees.toLocaleString()} attending</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="mt-4 w-full text-white py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#12a1e2' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0f8bc4'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#12a1e2'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegister(evt);
                    }}
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">No events found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search filters</p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 text-sm font-medium"
              style={{ color: '#12a1e2' }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
