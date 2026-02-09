import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  getEventbriteUploadInstructions,
  uploadEventbriteFileToStorage,
  notifyEventbriteUpload,
  createEventbriteEvent,
  createEventbriteTicket,
  publishEventbriteEvent,
} from '../services/eventbriteAdminApi';
import Navbar from '../components/Navbar';

const AdminEventbriteCreateEvent = () => {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Event Details
  const [eventDetails, setEventDetails] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    timezone: 'America/New_York',
    online_event: false,
  });

  // Step 2: Image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [logoId, setLogoId] = useState(null);
  const [uploadFlow, setUploadFlow] = useState({
    upload_url: '',
    upload_data: null,
    file_parameter_name: '',
    upload_token: '',
  });

  // Step 3: Tickets
  const [ticketDetails, setTicketDetails] = useState({
    ticket_name: 'General Admission',
    free: true,
    price: 0,
    quantity: null,
  });

  // Step 4: Review & Results
  const [createdEventId, setCreatedEventId] = useState(null);
  const [eventUrl, setEventUrl] = useState(null);

  // Check admin authorization
  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login', {
        state: { from: '/admin/eventbrite/create-event', message: 'Admin access required' },
      });
    }
  }, [user, navigate]);

  // Timezone options
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 2: Upload image
  const handleUploadImage = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Step 1/3: Getting upload instructions...');
      const instrRes = await getEventbriteUploadInstructions();
      const instr = instrRes.data;
      if (!instr?.upload_url || !instr?.upload_token) {
        throw new Error('Invalid upload instructions response');
      }
      setUploadFlow(instr);

      toast.dismiss();
      toast.loading('Step 2/3: Uploading file to storage...');
      const upRes = await uploadEventbriteFileToStorage({
        upload_url: instr.upload_url,
        upload_data: instr.upload_data,
        file_parameter_name: instr.file_parameter_name,
        file: imageFile,
      });

      toast.dismiss();
      toast.loading('Step 3/3: Finalizing upload with Eventbrite...');
      const notifyRes = await notifyEventbriteUpload(instr.upload_token);
      const logo_id = notifyRes.data?.id;
      if (!logo_id) {
        throw new Error('Notify upload failed (no logo_id returned)');
      }

      setLogoId(logo_id);
      toast.dismiss();
      toast.success('Image uploaded successfully!');
      setCurrentStep(3);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.dismiss();
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Create event, ticket, and publish
  const handleCreateAndPublish = async () => {
    try {
      setLoading(true);

      // Step 1: Create event
      toast.loading('Creating event...');
      const eventPayload = {
        ...eventDetails,
        logo_id: logoId,
      };
      const eventResponse = await createEventbriteEvent(eventPayload);
      
      if (!eventResponse.data?.success) {
        throw new Error(eventResponse.data?.message || 'Failed to create event');
      }

      const eventId = eventResponse.data.data.event_id;
      setCreatedEventId(eventId);
      toast.dismiss();
      toast.success('Event created! Creating ticket...');

      // Step 2: Create ticket
      const ticketPayload = {
        event_id: eventId,
        ...ticketDetails,
      };
      const ticketResponse = await createEventbriteTicket(ticketPayload);
      
      if (!ticketResponse.data?.success) {
        throw new Error(ticketResponse.data?.message || 'Failed to create ticket');
      }
      toast.dismiss();
      toast.success('Ticket created! Publishing event...');

      // Step 3: Publish event
      const publishResponse = await publishEventbriteEvent(eventId);
      
      if (!publishResponse.data?.success) {
        throw new Error(publishResponse.data?.message || 'Failed to publish event');
      }

      setEventUrl(publishResponse.data.data.event_url);
      toast.dismiss();
      toast.success('Event published successfully!');
    } catch (error) {
      console.error('Create event error:', error);
      toast.dismiss();
      toast.error(error?.response?.data?.message || error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = () => {
    return (
      eventDetails.title &&
      eventDetails.description &&
      eventDetails.start_datetime &&
      eventDetails.end_datetime &&
      eventDetails.timezone
    );
  };

  const canProceedToStep4 = () => {
    return logoId !== null;
  };

  const canCreateEvent = () => {
    return ticketDetails.ticket_name && createdEventId === null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Eventbrite Event
          </h1>
          <p className="text-gray-600 mb-8">Complete all steps to create and publish your event</p>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="relative">
              {/* Background line spanning full width */}
              <div className="absolute top-5 left-10 right-10 h-1 bg-gray-300" />
              
              {/* Active progress line */}
              <div
                className="absolute top-5 h-1 bg-[#12a1e2] transition-all duration-300"
                style={{
                  left: '2.5rem',
                  width: currentStep > 1 ? `${((currentStep - 1) / 3) * 100}%` : '0%',
                  maxWidth: 'calc(100% - 5rem)',
                }}
              />
              
              {/* Step numbers and labels */}
              <div className="relative flex justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    {/* Step number circle */}
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 ${
                        currentStep >= step
                          ? 'bg-[#12a1e2] border-[#12a1e2] text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {step}
                    </div>
                    {/* Step label */}
                    <span className="mt-2 text-sm text-gray-600 text-center whitespace-nowrap">
                      {step === 1 && 'Event Details'}
                      {step === 2 && 'Upload Image'}
                      {step === 3 && 'Tickets'}
                      {step === 4 && 'Publish'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Event Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventDetails.title}
                  onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={eventDetails.description}
                  onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDetails.start_datetime}
                    onChange={(e) => setEventDetails({ ...eventDetails, start_datetime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDetails.end_datetime}
                    onChange={(e) => setEventDetails({ ...eventDetails, end_datetime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone *
                </label>
                <select
                  value={eventDetails.timezone}
                  onChange={(e) => setEventDetails({ ...eventDetails, timezone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="online_event"
                  checked={eventDetails.online_event}
                  onChange={(e) => setEventDetails({ ...eventDetails, online_event: e.target.checked })}
                  className="w-4 h-4 text-[#12a1e2] border-gray-300 rounded focus:ring-[#12a1e2]"
                />
                <label htmlFor="online_event" className="ml-2 text-sm text-gray-700">
                  This is an online event
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2()}
                  className={`px-6 py-2 rounded-lg font-medium text-white ${
                    canProceedToStep2()
                      ? 'bg-[#12a1e2] hover:bg-[#0f8bc4]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Next: Upload Image
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Upload Image */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Upload Event Image</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-md h-64 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              {logoId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✓ Image uploaded successfully! Logo ID: {logoId}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleUploadImage}
                  disabled={!imageFile || loading}
                  className={`px-6 py-2 rounded-lg font-medium text-white ${
                    imageFile && !loading
                      ? 'bg-[#12a1e2] hover:bg-[#0f8bc4]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Uploading...' : logoId ? 'Continue' : 'Upload Image'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Tickets */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Ticket Configuration</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Name *
                </label>
                <input
                  type="text"
                  value={ticketDetails.ticket_name}
                  onChange={(e) => setTicketDetails({ ...ticketDetails, ticket_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                  placeholder="e.g., General Admission"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="free_ticket"
                  checked={ticketDetails.free}
                  onChange={(e) => setTicketDetails({ ...ticketDetails, free: e.target.checked, price: 0 })}
                  className="w-4 h-4 text-[#12a1e2] border-gray-300 rounded focus:ring-[#12a1e2]"
                />
                <label htmlFor="free_ticket" className="ml-2 text-sm text-gray-700">
                  Free ticket
                </label>
              </div>

              {!ticketDetails.free && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ticketDetails.price}
                    onChange={(e) => setTicketDetails({ ...ticketDetails, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  min="1"
                  value={ticketDetails.quantity || ''}
                  onChange={(e) => setTicketDetails({ ...ticketDetails, quantity: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#12a1e2]"
                  placeholder="Unlimited"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!ticketDetails.ticket_name}
                  className={`px-6 py-2 rounded-lg font-medium text-white ${
                    ticketDetails.ticket_name
                      ? 'bg-[#12a1e2] hover:bg-[#0f8bc4]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Next: Review & Publish
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Review & Publish</h2>
              
              {eventUrl ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    ✓ Event Published Successfully!
                  </h3>
                  <p className="text-green-800 mb-4">
                    Your event has been created and published on Eventbrite.
                  </p>
                  <a
                    href={eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 bg-[#12a1e2] text-white rounded-lg font-medium hover:bg-[#0f8bc4]"
                  >
                    View Event on Eventbrite →
                  </a>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Event Title</h3>
                      <p className="text-gray-700">{eventDetails.title}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{eventDetails.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Start</h3>
                        <p className="text-gray-700">
                          {new Date(eventDetails.start_datetime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">End</h3>
                        <p className="text-gray-700">
                          {new Date(eventDetails.end_datetime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Type</h3>
                      <p className="text-gray-700">
                        {eventDetails.online_event ? 'Online Event' : 'Physical Event'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ticket</h3>
                      <p className="text-gray-700">
                        {ticketDetails.ticket_name} -{' '}
                        {ticketDetails.free ? 'Free' : `$${ticketDetails.price.toFixed(2)}`}
                        {ticketDetails.quantity ? ` (${ticketDetails.quantity} available)` : ' (Unlimited)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateAndPublish}
                      disabled={loading || !canCreateEvent()}
                      className={`px-6 py-2 rounded-lg font-medium text-white ${
                        canCreateEvent() && !loading
                          ? 'bg-[#12a1e2] hover:bg-[#0f8bc4]'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {loading ? 'Creating...' : 'Create & Publish Event'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventbriteCreateEvent;
