import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Plus, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Development', duration: '' });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        const { data } = await API.get('/skills/user');
        setMySkills(data);
      } catch (err) {
        console.error('Failed to load user skills', err);
      }
    };
    fetchUserSkills();
  }, []);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (image) data.append('image', image);

    try {
      const res = await API.post('/skills', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMySkills([...mySkills, res.data]);
      setShowAddModal(false);
      setFormData({ title: '', description: '', category: 'Development', duration: '' });
      setImage(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create skill offering');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.name?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {user?.bio && <p className="text-xs text-slate-600 mt-1">{user.bio}</p>}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Skill Offering
        </button>
      </div>

      {/* User Skills Listing */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> My Skill Offerings
        </h2>

        {mySkills.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySkills.map((skill) => (
              <div key={skill._id} className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-indigo-600 uppercase">{skill.category}</span>
                <h3 className="font-bold text-slate-800 text-md mt-1">{skill.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{skill.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 text-sm">
            You have not listed any skills yet. Click "Add Skill Offering" to post your first skill.
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Offer a New Skill</h3>
            <form onSubmit={handleCreateSkill} className="space-y-3">
              <input
                type="text"
                placeholder="Skill Title (e.g., React Basics, Circuit Design)"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-hidden"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                placeholder="Detailed Description"
                required
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-hidden"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Languages">Languages</option>
                  <option value="Electronics">Electronics</option>
                </select>
                <input
                  type="text"
                  placeholder="Duration (e.g. 2 hrs/wk)"
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-hidden"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                className="w-full text-xs text-slate-500"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
                >
                  Publish Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}