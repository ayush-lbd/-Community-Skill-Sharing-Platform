import { useState } from 'react';
import API from '../api/axios';

export default function EditProfileModal({ user, onClose, onUpdateSuccess }) {
  // Initialize text state with existing user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    // Convert the array back to a comma-separated string for the input field
    skillsToTeach: user?.skillsToTeach ? user.skillsToTeach.join(', ') : '', 
  });

  // Separate state for files
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Update Basic Text Details
      // Adjust this route to match your exact backend route for 'update account details'
      await API.patch('/users/update-account', {
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      });

      // 2. Update Skills (if changed)
      if (formData.skillsToTeach !== (user.skillsToTeach?.join(', ') || '')) {
        const skillsArray = formData.skillsToTeach
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill !== "");
          
        // THE FIX: Changed the key to 'skills' and removed JSON.stringify()
        await API.patch('/users/update-skills', {
          skills: skillsArray 
        });
      }

      // 3. Update Avatar (if a new file was selected)
      if (avatar) {
        const avatarData = new FormData();
        avatarData.append('avatar', avatar);
        await API.patch('/users/avatar', avatarData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 4. Update Cover Image (if a new file was selected)
      if (coverImage) {
        const coverData = new FormData();
        coverData.append('coverImage', coverImage);
        await API.patch('/users/cover-image', coverData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Close modal and trigger a refresh in the Dashboard
      onUpdateSuccess();
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Profile</h3>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Core Competencies</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.skillsToTeach}
              onChange={(e) => setFormData({ ...formData, skillsToTeach: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">Separate multiple skills with commas.</p>
          </div>

          <hr className="border-slate-100 my-4" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Avatar (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Cover Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => setCoverImage(e.target.files[0])}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}