import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Calendar, MapPin, Video, Users, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ExploreSessions() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const navigate = useNavigate();

  const { user } = useAuth();

  const fetchAllSessions = async (searchQuery = "") => {
    try {
      setIsLoading(true);
      // We attach the query string dynamically!
      const res = await API.get(`/sessions?query=${searchQuery}`);
      setSessions(res.data?.data?.sessions || []);
    } catch (err) {
      console.error('Failed to fetch explore sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. INITIAL LOAD (Runs once when page loads)
  useEffect(() => {
    fetchAllSessions();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevents page reload
    fetchAllSessions(searchInput); // Calls the backend with the typed text
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await API.post(`/sessions/${sessionId}/join`);
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join session.");
    }
  };

  const handleLeaveSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to leave this session?")) return;
    try {
      await API.post(`/sessions/${sessionId}/leave`); 
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave session.");
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading sessions...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Explore Sessions</h1>
      
      {/* NEW SEARCH BAR SECTION                    */}
      <form 
        onSubmit={handleSearchSubmit} 
        className="mb-8 flex flex-col sm:flex-row gap-3 max-w-2xl"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button 
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          Search
        </button>
        
        {/* Optional: Clear button if they want to reset */}
        {searchInput && (
          <button 
            type="button"
            onClick={() => {
              setSearchInput("");
              fetchAllSessions(""); // Instantly fetch all open sessions again
            }}
            className="px-6 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="h-40 bg-slate-100 relative cursor-pointer" onClick={() => navigate(`/sessions/${session._id}`)}>
              {session.thumbnail ? (
                <img src={session.thumbnail} alt={session.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
              )}
              <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 text-xs font-bold text-indigo-700 rounded uppercase">
                {session.category}
              </span>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 
                className="font-bold text-slate-900 text-lg mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => navigate(`/sessions/${session._id}`)}
              >
                {session.title}
              </h3>
              
              {/* Host Info from your $lookup */}
              {session.hostDetails && (
                <p className="text-sm text-slate-500 mb-4">Hosted by {session.hostDetails.name}</p>
              )}

              <div className="space-y-2 mt-auto text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(session.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  {session.sessionLocation === 'online' ? <Video className="w-4 h-4 text-slate-400" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                  {session.sessionLocation === 'online' ? 'Online' : 'In-Person'}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => navigate(`/sessions/${session._id}`)}
                className="flex-1 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Details
              </button>
              
              {/* The Smart Button Logic */}
              {session.host === user?._id || session.hostDetails?._id === user?._id ? (
                <button disabled className="flex-1 py-2 text-sm font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed">
                  Hosting
                </button>
              ) : session.attendees?.some(attendee => attendee === user?._id || attendee._id === user?._id) ? (
                <button 
                  onClick={() => handleLeaveSession(session._id)}
                  className="flex-1 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Leave
                </button>
              ) : (
                <button 
                  onClick={() => handleJoinSession(session._id)}
                  className="flex-1 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}