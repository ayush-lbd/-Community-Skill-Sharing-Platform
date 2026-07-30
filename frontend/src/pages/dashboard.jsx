import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Plus, BookOpen } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { Settings, Lock } from 'lucide-react';
import CreateSessionModal from '../components/CreateSessionModal';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import EditSessionModal from '../components/EditSessionModal';

export default function Dashboard() {
  const { user } = useAuth();
  //const [mySkills, setMySkills] = useState([]);
  //const [showAddModal, setShowAddModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [mySessions, setMySessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Development', duration: '' });
  const [image, setImage] = useState(null);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [isLoadingJoined, setIsLoadingJoined] = useState(true);
  
  const handleDeleteSession = async (sessionId) => {
    // Show a browser confirmation popup before deleting
    if (!window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return;
    }

    try {
      // Ensure this route matches your Express delete controller route
      await API.delete(`/sessions/${sessionId}`);
      fetchMySessions(); // Refresh the grid instantly
    } catch (err) {
      console.error("Failed to delete session:", err);
      alert("Failed to delete the session. Please try again.");
    }
  };
  
  const fetchJoinedSessions = async () => {
    try {
      setIsLoadingJoined(true);
      // Fetch using the new backend filter we just added
      const res = await API.get(`/sessions?attendeeId=${user._id}`);
      setJoinedSessions(res.data?.data?.sessions || []);
    } catch (err) {
      console.error('Failed to fetch joined sessions:', err);
    } finally {
      setIsLoadingJoined(false);
    }
  };

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
  
  const handleLeaveDashboardSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to leave this session?")) return;
    try {
      await API.post(`/sessions/${sessionId}/leave`); 
      fetchJoinedSessions(); // Refresh the grid instantly without reloading the page
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave session.");
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchMySessions();
      fetchJoinedSessions();
    }
  }, [user]);

  // useEffect(() => {
  //   const fetchUserSkills = async () => {
  //     try {
  //       const { data } = await API.get('/skills/user');
  //       setMySkills(data);
  //     } catch (err) {
  //       console.error('Failed to load user skills', err);
  //     }
  //   };
  //   fetchUserSkills();
  // }, []);

  // const handleCreateSkill = async (e) => {
  //   e.preventDefault();
  //   const data = new FormData();
  //   Object.keys(formData).forEach((key) => data.append(key, formData[key]));
  //   if (image) data.append('image', image);

  //   try {
  //     const res = await API.post('/skills', data, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  //     setMySkills([...mySkills, res.data]);
  //     setShowAddModal(false);
  //     setFormData({ title: '', description: '', category: 'Development', duration: '' });
  //     setImage(null);
  //   } catch (err) {
  //     alert(err.response?.data?.message || 'Failed to create skill offering');
  //   }
  // }

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        {/* Cover Image Banner */}
        <div className="h-40 sm:h-48 w-full bg-slate-200 relative border-b-2 border-slate-200">
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
      
      <hr className="my-12 border-t-2 border-slate-100 rounded-full" />

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
                {/* Edit Session Modal */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                    <button 
                    onClick={() => {
                        console.log("Edit button clicked! Session data:", session); // ADD THIS
                        setEditingSession(session);
                    }}
                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                    Edit
                    </button>
                    <button 
                    onClick={() => handleDeleteSession(session._id)} 
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                    Delete
                    </button>
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
      
      <hr className="my-12 border-t-2 border-slate-100 rounded-full" />

      {/* NEW SECTION: SESSIONS I AM ATTENDING           */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Sessions I'm Attending</h2>
        
        {isLoadingJoined ? (
          <p>Loading...</p>
        ) : joinedSessions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
            You haven't joined any sessions yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedSessions.map((session) => (
              <div key={session._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                
                {/* Thumbnail */}
                <div className="h-32 bg-slate-100 relative cursor-pointer">
                  {session.thumbnail ? (
                    <img src={session.thumbnail} alt={session.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                </div>
                
                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg">{session.title}</h3>
                  <div className="text-sm text-slate-600 mt-2">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Leave Button Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  
                  {/* Primary Action: Join Meeting / In-Person Tag */}
                  {session.sessionLocation === 'online' && session.meetingUrl ? (
                    <a 
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      <Video className="w-4 h-4 mr-2" /> Join Meeting
                    </a>
                  ) : (
                    <div className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200/70 border border-slate-300 rounded-lg">
                      <MapPin className="w-4 h-4 mr-2" /> In-Person Event
                    </div>
                  )}

                  {/* Secondary Action: Leave Session */}
                  <button 
                    onClick={() => handleLeaveDashboardSession(session._id)}
                    className="inline-flex justify-center items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shrink-0"
                  >
                    Leave
                  </button>
                  
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
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

      {/* Edit Session Modal */}
      {editingSession && (
        <EditSessionModal 
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSuccess={() => {
            setEditingSession(null);
            fetchMySessions(); // Refreshes the grid with updated info
          }}
        />
      )}

    </div>
  );
}