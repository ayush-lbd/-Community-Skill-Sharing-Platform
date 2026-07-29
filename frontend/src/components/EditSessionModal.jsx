import { useState, useEffect } from 'react';
import API from '../api/axios';
import { X, Calendar, MapPin, Video, FileText } from 'lucide-react';

export default function EditSessionModal({ session, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: session?.title || '',
    description: session?.description || '',
    category: session?.category || 'Development',
    sessionLocation: session?.sessionLocation || 'online',
    meetingUrl: session?.meetingUrl || '',
    physicalLocation: session?.physicalLocation || '',
    status: session?.status || 'Open',
    duration: session?.duration || 60,
    maxAttendees: session?.maxAttendees || 10,
    // Format the date correctly for the datetime-local input
    date: session?.date ? new Date(session.date).toISOString().slice(0, 16) : ''
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Development', 'Design', 'Electronics', 'Languages', 'Other'];
  const statuses = [
    { label: 'Open (Accepting Attendees)', value: 'open' },
    { label: 'Full', value: 'full' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Frontend Validation
    if (formData.sessionLocation === 'online' && !formData.meetingUrl) {
      setError("Meeting URL is required for online sessions.");
      setIsLoading(false);
      return;
    }
    if (formData.sessionLocation === 'in-person' && !formData.physicalLocation) {
      setError("Physical location is required for in-person sessions.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Send text details as JSON (Matches your updateSessionDetails controller)
      // Note: Verify this URL perfectly matches your Express router (e.g., PATCH /sessions/:id)
      await API.patch(`/sessions/${session._id}`, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        sessionLocation: formData.sessionLocation,
        meetingUrl: formData.sessionLocation === 'online' ? formData.meetingUrl : "",
        physicalLocation: formData.sessionLocation === 'in-person' ? formData.physicalLocation : "",
        date: formData.date,
        status: formData.status,
        duration: Number(formData.duration),
        maxAttendees: Number(formData.maxAttendees)
      });

      // 2. If a new image was selected, upload it immediately after
      // Note: Verify this URL matches your Express router (e.g., PATCH /sessions/:id/thumbnail)
      if (thumbnail) {
        const imageData = new FormData();
        imageData.append('thumbnail', thumbnail);
        
        await API.patch(`/sessions/${session._id}/thumbnail`, imageData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSuccess(); // Triggers the dashboard to re-fetch and close modal
    } catch (err) {
      console.error('Failed to update session:', err);
      setError(err.response?.data?.message || 'Failed to update session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Edit Session</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form id="edit-session-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                required
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            
               {/* 5. NEW: 4-Column Grid for Date, Duration, Capacity, Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    min="15"
                    step="15"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Attendees</label>
                  <input
                    type="number"
                    name="maxAttendees"
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
            </div>

            <hr className="border-slate-100 my-4" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Session Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionLocation"
                    value="online"
                    checked={formData.sessionLocation === 'online'}
                    onChange={handleChange}
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-slate-700">Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionLocation"
                    value="in-person"
                    checked={formData.sessionLocation === 'in-person'}
                    onChange={handleChange}
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-slate-700">In-Person</span>
                </label>
              </div>
            </div>

            {formData.sessionLocation === 'online' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting URL</label>
                <input
                  type="url"
                  name="meetingUrl"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.meetingUrl}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  name="physicalLocation"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.physicalLocation}
                  onChange={handleChange}
                />
              </div>
            )}

            <hr className="border-slate-100 my-4" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Update Thumbnail (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-session-form"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}