import { useState } from 'react';
import API from '../api/axios';
import { X, Calendar, MapPin, Video, FileText } from 'lucide-react';

export default function CreateSessionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development', // Default category
    sessionLocation: 'online', // Default to online
    meetingUrl: '',
    physicalLocation: '',
    date: '',
    duration: 60, // Default duration in minutes
    maxAttendees: 10, // Default max attendees
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Development', 'Design', 'Electronics', 'Languages', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Frontend Validation matching backend requirements
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
    if (!thumbnail) {
      setError("A thumbnail image is required.");
      setIsLoading(false);
      return;
    }

    try {
      const sessionData = new FormData();
      sessionData.append('title', formData.title);
      sessionData.append('description', formData.description);
      sessionData.append('category', formData.category);
      sessionData.append('sessionLocation', formData.sessionLocation);
      sessionData.append('date', formData.date);
      sessionData.append('duration', formData.duration);
      sessionData.append('maxAttendees', formData.maxAttendees);
      
      // Conditionally append the correct location data
      if (formData.sessionLocation === 'online') {
        sessionData.append('meetingUrl', formData.meetingUrl);
      } else {
        sessionData.append('physicalLocation', formData.physicalLocation);
      }

      // Append mandatory file
      sessionData.append('thumbnail', thumbnail);

      // Make sure this matches your Express router path for createSession
      await API.post('/sessions', sessionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess(); 
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err.response?.data?.message || 'Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Create New Session</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form id="create-session-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Live Code Review"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Description
              </label>
              <textarea
                name="description"
                required
                rows="3"
                placeholder="What will happen in this session?"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Date, Duration, & Capacity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Date & Time
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Duration (Mins)
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max Attendees
                </label>
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
            </div>

            <hr className="border-slate-100 my-4" />

            {/* Location Type Selector */}
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
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 flex items-center gap-1">
                    <Video className="w-4 h-4" /> Online
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionLocation"
                    value="in-person"
                    checked={formData.sessionLocation === 'in-person'}
                    onChange={handleChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> In-Person
                  </span>
                </label>
              </div>
            </div>

            {/* Conditional Inputs based on Session Type */}
            {formData.sessionLocation === 'online' ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting URL</label>
                <input
                  type="url"
                  name="meetingUrl"
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.meetingUrl}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  name="physicalLocation"
                  placeholder="123 Main St, Room 4B"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.physicalLocation}
                  onChange={handleChange}
                />
              </div>
            )}

            <hr className="border-slate-100 my-4" />

            {/* Thumbnail Upload (Mandatory) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Session Thumbnail <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="text-xs text-slate-500 mt-1">Required: Upload an image to represent this session.</p>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-session-form"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Creating...' : 'Create Session'}
          </button>
        </div>

      </div>
    </div>
  );
}