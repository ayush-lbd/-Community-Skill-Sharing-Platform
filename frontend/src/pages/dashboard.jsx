import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Plus, BookOpen } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { Settings, Lock } from 'lucide-react';
import CreateSessionModal from '../components/CreateSessionModal';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [mySessions, setMySessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Development', duration: '' });
  const [image, setImage] = useState(null);
  
  const fetchMySessions = async () => {
    try {
      setIsLoadingSessions(true);
      // Adjust this route if your backend uses something specific like '/sessions/me'
      const res = await API.get(`/sessions?hostId=${user._id}`); 
      
      // Look closely at this line! We must add .sessions at the end
      const extractedSessionsArray = res.data?.data?.sessions || []; 
      
      // Save ONLY the array to the state
      setMySessions(extractedSessionsArray);
      
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchMySessions();
    }
  }, [user]);

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

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* 1. Profile Banner Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover Image Banner */}
        <div className="h-48 md:h-64 w-full bg-indigo-50 relative">
          {user.coverImage ? (
            <img 
              src={user.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-indigo-500 to-purple-600"></div>
          )}
        </div>

        <div className="px-6 sm:px-10 pb-8">
          {/* Avatar & Basic Info */}
          <div className="relative flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white object-cover bg-white shadow-md"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-4xl text-slate-500 shadow-md">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mb-4">
              {/* Change Password Button */}
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 bg-white shadow-sm"
              >
                <Lock className="w-4 h-4" /> Password
              </button>

              {/* Edit Profile Button */}
              <button 
                onClick={() => setShowEditProfile(true)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 bg-white shadow-sm"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-500 font-medium">{user.email}</p>
            {user.bio && <p className="text-sm text-slate-600 mt-2 max-w-2xl">{user.bio}</p>}
          </div>

          {/* Quick Skills Tags (From Registration) */}
          {user.skillsToTeach && user.skillsToTeach.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Core Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {user.skillsToTeach.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
    {/* My Scheduled Sessions Section */}
        <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">My Scheduled Sessions</h2>
            <button 
            onClick={() => setShowSessionModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
            + Schedule Session
            </button>
        </div>

        {isLoadingSessions ? (
            <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        ) : mySessions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySessions.map((session) => (
                <div key={session._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                {/* Thumbnail */}
                <div className="h-40 bg-slate-100 relative">
                    {session.thumbnail ? (
                    <img src={session.thumbnail} alt={session.title} className="w-full h-full object-cover" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                    )}
                    <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-700 rounded shadow-sm uppercase tracking-wider">
                    {session.category}
                    </span>
                </div>
                
                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{session.title}</h3>
                    
                    <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        {session.sessionLocation === 'online' ? (
                        <><Video className="w-4 h-4 text-slate-400" /> Online Meeting</>
                        ) : (
                        <><MapPin className="w-4 h-4 text-slate-400" /> In-Person</>
                        )}
                    </div>
                    </div>
                </div>
                
                {/* Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                    <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Edit</button>
                    <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Cancel Session</button>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium mb-2">You haven't scheduled any sessions yet.</p>
            </div>
        )}
        </div>

      {/* 2. User Detailed Skill Offerings Listing */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> My Active Offerings
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Offering
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            My Hosted Sessions
        </h2>
        <button 
            onClick={() => setShowSessionModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
            + Schedule Session
        </button>
        </div>

        {mySkills.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySkills.map((skill) => (
              <div key={skill._id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                  {skill.category}
                </span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{skill.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3 mt-2">{skill.description}</p>
                {skill.duration && (
                  <p className="text-xs font-medium text-slate-500 mt-4 flex items-center gap-1">
                    ⏱️ {skill.duration}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-10 text-center rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">You have not listed any detailed offerings yet.</p>
            <p className="text-slate-400 text-sm mt-1">Click "Add Offering" to post your first structured skill.</p>
          </div>
        )}
      </div>

      {/* 3. Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Offer a New Skill</h3>
            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skill Title</label>
                <input
                  type="text"
                  placeholder="e.g., Advanced React Patterns"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="What will someone learn from this?"
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Languages">Languages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hrs/wk"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Publish Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal 
          user={user} 
          onClose={() => setShowEditProfile(false)} 
          onUpdateSuccess={() => {
            setShowEditProfile(false);
            // Force a hard refresh to immediately show new images/data
            window.location.reload(); 
          }}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}

      {showSessionModal && (
        <CreateSessionModal 
          onClose={() => setShowSessionModal(false)}
          onSuccess={() => {
            setShowSessionModal(false);
            fetchMySessions(); 
          }}
        />
      )}
    </div>
  );
}