import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEvent, fetchExternalEvent, registerInternal, recordEventbriteIntent } from '../services/eventApi';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

// Dummy related events for "You may also like" section
const RELATED_EVENTS = [
  {
    id: 'rel1',
    title: 'Miami Tech Mixer 2026',
    date: 'Fri, Feb 14, 2026 - 6:00 PM EST',
    organizer: 'Miami Tech Network',
    location: 'Downtown Miami',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
  },
  {
    id: 'rel2',
    title: 'Miami Bitcoiners Meetup @ Magic 13 Brewing Co.',
    date: 'Sat, Feb 15, 2026 - 7:00 PM EST',
    organizer: 'Miami Bitcoiners',
    location: 'Magic 13 Brewing Co.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
  },
  {
    id: 'rel3',
    title: 'South Beach Miami Bitcoin Happy Hour at Monty\'s',
    date: 'Sun, Feb 16, 2026 - 5:00 PM EST',
    organizer: 'Bitcoin Miami',
    location: 'Monty\'s 300 Alton',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  },
];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Try internal event first. If not found/unauthorized, try Eventbrite external event. If both fail, use dummy.
        try {
          const { data } = await fetchEvent(id);
          setEvent(data.data);
        } catch (err) {
          try {
            const { data } = await fetchExternalEvent('eventbrite', id);
            setEvent(data.data);
          } catch (err2) {
            setEvent({
            id: id,
            source: 'internal',
            title: 'How Decentralization Will Shape The Future of Money, Governance & the Law',
            description: 'Join us for an in-depth exploration of decentralized technologies and their profound impact on money, governance, and law. This event brings together experts from around the world to discuss how blockchain, cryptocurrencies, and decentralized systems are reshaping our understanding of traditional institutions.\n\nGovernments worldwide are increasingly interested in understanding these technologies and their potential applications. However, as we embrace these innovations, we must also address critical questions about legal frameworks, regulatory compliance, and social impact.\n\nThis event is part of a series exploring the Future of Money, Governance and the Law, hosted by the Government Blockchain Association.',
            categoryTags: ['Blockchain', 'Decentralized Systems', 'Web 3.0', 'Open Government', 'Open Source'],
            startAt: '2025-10-07T20:00:00.000Z',
            endAt: '2025-10-07T22:00:00.000Z',
            timezone: 'FKT',
            locationName: 'Online Event',
            city: 'Miami',
            region: 'FL',
            country: 'US',
            coverImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
            isOnline: true,
            organizer: 'DLFDECENTRALIZED TRUST',
            organizerProfile: 'c.harter',
            rating: 4.8,
            attendees: 370,
            groupsHosting: 140,
            isNetworkEvent: true,
            speakers: [
              { name: 'Gerard Dache', role: 'Executive Director, Government Blockchain Association' },
              { name: 'Josh Kriger', role: 'Co-Founder of Edge of Company' },
            ],
            attendeesList: [
              { name: 'c.harter', role: 'Host', avatar: 'https://via.placeholder.com/40' },
              { name: 'Jose', role: 'Member', avatar: 'https://via.placeholder.com/40' },
            ],
            });
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRegister = async () => {
    try {
      if (event.source !== 'internal') {
        if (event.source === 'eventbrite' && event.externalUrl) {
          await recordEventbriteIntent({
            eventbriteEventId: event.id,
            eventTitle: event.title,
            eventUrl: event.externalUrl,
          });
        }
        window.open(event.externalUrl, '_blank');
        return;
      }
      await registerInternal(id);
      toast.success('Registered successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to register');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayNum = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timezone = event?.timezone || 'EST';
    return `${day}, ${month} ${dayNum}, ${year} - ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm} ${timezone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#12a1e2] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {event.isNetworkEvent && (
              <span className="text-sm text-gray-600">
                Network event · {event.attendees} attendees from {event.groupsHosting} groups hosting
              </span>
            )}
          </div>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <img 
                    src={event.attendeesList?.[0]?.avatar || 'https://via.placeholder.com/32'} 
                    alt="Host" 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-600">
                    Hosted by <span className="font-medium">{event.organizerProfile || event.organizer}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#12a1e2' }}
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
          </div>

          <div className="text-lg text-gray-700 mb-2">{formatDate(event.startAt)}</div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            {event.coverImageUrl && (
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <img 
                  src={event.coverImageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Details Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Speakers Section */}
            {event.speakers && event.speakers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Speakers</h2>
                <div className="space-y-4">
                  {event.speakers.map((speaker, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {speaker.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{speaker.name}</h3>
                        <p className="text-sm text-gray-600">{speaker.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Topics */}
            {event.categoryTags && event.categoryTags.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Related topics</h2>
                <div className="flex flex-wrap gap-2">
                  {event.categoryTags.map((tag, idx) => (
                    <button
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Report Event */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <button className="hover:text-gray-700">Report event</button>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Floating Event Card */}
            <div className="bg-gray-900 text-white rounded-lg p-6 mb-6 sticky top-4">
              <div className="text-sm font-medium mb-2">{event.organizer}</div>
              {event.speakers && event.speakers.length > 0 && (
                <div className="flex -space-x-2 mb-4">
                  {event.speakers.slice(0, 2).map((speaker, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-900">
                      <span className="text-xs">
                        {speaker.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <h3 className="text-sm font-medium mb-4 line-clamp-2">{event.title}</h3>
              <div className="space-y-2 text-sm text-gray-300 mb-4">
                <div>Date: {new Date(event.startAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                <div>Time: {new Date(event.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
              </div>
              <button 
                className="w-full py-3 rounded-lg font-medium text-white text-center"
                style={{ backgroundColor: '#12a1e2' }}
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* Attendees Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Attendees {event.attendeesList?.length || 0}
            </h2>
            {event.attendeesList && event.attendeesList.length > 0 && (
              <button className="text-sm font-medium" style={{ color: '#12a1e2' }}>
                See all
              </button>
            )}
          </div>
          {event.attendeesList && event.attendeesList.length > 0 ? (
            <div className="flex gap-4">
              {event.attendeesList.map((attendee, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <img 
                    src={attendee.avatar} 
                    alt={attendee.name}
                    className="w-16 h-16 rounded-full mb-2"
                  />
                  <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                  <div className="text-xs text-gray-500">{attendee.role}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No attendees yet.</p>
          )}
        </div>

        {/* Photos Section */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Photos 0</h2>
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500">No photos for now! You'll see them here once they're added.</p>
          </div>
        </div>

        {/* You may also like Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">You may also like</h2>
            <button className="text-sm font-medium" style={{ color: '#12a1e2' }}>
              See all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RELATED_EVENTS.map((relEvent) => (
              <div
                key={relEvent.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/events/${relEvent.id}`)}
              >
                <div className="relative h-40 bg-gray-200">
                  <img
                    src={relEvent.image}
                    alt={relEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{relEvent.date}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relEvent.title}</h3>
                  <div className="text-sm text-gray-600 mb-1">{relEvent.organizer}</div>
                  <div className="text-xs text-gray-500">{relEvent.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
