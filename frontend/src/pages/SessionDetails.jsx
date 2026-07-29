import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { Calendar, MapPin, Video, Users, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SessionDetails() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get(`/sessions/${sessionId}`);
        setSession(res.data?.data);
      } catch (err) {
        console.error('Failed to fetch session details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleJoinSession = async () => {
    try {
      await API.post(`/sessions/${sessionId}/join`);
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join session.");
    }
  };

  const handleLeaveSession = async () => {
    if (!window.confirm("Are you sure you want to leave this session?")) return;
    try {
      await API.post(`/sessions/${sessionId}/leave`); 
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave session.");
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading details...</div>;
  if (!session) return <div className="text-center py-12">Session not found.</div>;

  const isHost = session?.host === user?._id || session?.host?._id === user?._id;
  const isAttendee = session?.attendees?.some(a => a === user?._id || a._id === user?._id);
  const canViewSecretDetails = isHost || isAttendee;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Banner Image */}
        <div className="h-64 bg-slate-100 w-full">
          {session.thumbnail ? (
            <img src={session.thumbnail} alt={session.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No Cover Image</div>
          )}
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide">
                {session.category}
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mt-4">{session.title}</h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2">
                Hosted by 
                <Link 
                  to={`/profile/${session.host?._id}`} // This naturally becomes the targetUserId in the URL!
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                >
                  {session.host?.name}
                </Link>
              </p>
            </div>
            
            {/* REPLACE THE OLD BUTTON WITH THIS: */}
            <div>
              {session.host === user?._id || session.host?._id === user?._id ? (
                <button disabled className="px-6 py-3 bg-slate-100 text-slate-400 font-medium rounded-lg shadow-sm cursor-not-allowed">
                  You are Hosting
                </button>
              ) : session.attendees?.some(attendee => attendee === user?._id || attendee._id === user?._id) ? (
                <button 
                  onClick={handleLeaveSession}
                  className="px-6 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 shadow-sm transition-colors"
                >
                  Leave Session
                </button>
              ) : session.status === 'open' ? (
  
                /* --- 3. SESSION IS OPEN (Allow Join) --- */
                <button 
                    onClick={handleJoinSession}
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                >
                    Join Session
                </button>

                ) : (

                /* --- 4. SESSION IS FULL, COMPLETED, OR CANCELLED --- */
                <button 
                    disabled
                    className="px-6 py-3 bg-slate-200 text-slate-500 font-bold rounded-lg cursor-not-allowed uppercase tracking-wide"
                >
                    {session.status === 'full' ? 'Session Full' : `Session ${session.status}`}
                </button>

                )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-y border-slate-100 py-8">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Date & Time</span>
              <span className="text-slate-900">{new Date(session.date).toLocaleString()}</span>
            </div>
            {/* NEW: Duration */}
            <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                {session.duration} minutes
            </div>

            {/* NEW: Capacity Tracker */}
            <div className="flex items-center text-sm font-medium">
                <Users className="w-4 h-4 mr-2 text-slate-400" />
                <span className={session.attendees.length >= session.maxAttendees ? "text-red-600" : "text-emerald-600"}>
                    {session.attendees.length} / {session.maxAttendees} Spots Filled
                </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                {session.sessionLocation === 'online' ? <Video className="w-4 h-4"/> : <MapPin className="w-4 h-4"/>} 
                Location
              </span>
              <span className="text-slate-900 capitalize">{session.sessionLocation}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Users className="w-4 h-4"/> Attendees</span>
              <span className="text-slate-900">{session.attendees?.length || 0} Joined</span>
            </div>
          </div>
          
          <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl">
            
            {session.sessionLocation === 'online' ? (
              
              /* --- ONLINE SESSIONS (Requires Joining to see Link) --- */
              <>
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Meeting Link</h3>
                {canViewSecretDetails ? (
                  <div className="flex flex-col gap-3">
                    <a 
                      href={session.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-medium hover:underline flex items-center gap-2 w-fit"
                    >
                      <Video className="w-5 h-5" /> Click here to join the meeting
                    </a>
                    
                    {/* Selectable raw URL text box */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 break-all select-all font-mono">
                      {session.meetingUrl || "Link not provided"}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/60 border border-indigo-100 rounded-lg text-sm text-indigo-800 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Join this session to unlock the meeting link.
                  </div>
                )}
              </>

            ) : (

              /* --- IN-PERSON SESSIONS (Visible to Everyone) --- */
              <>
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Exact Location</h3>
                <p className="text-indigo-800 flex items-start gap-2">
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0" /> 
                  
                  {/* UPDATED: Using physicalLocation to match your schema */}
                  <span className="font-medium text-slate-800">
                    {session.physicalLocation || "Location pending or not provided."}
                  </span>
                </p>
                {!canViewSecretDetails && (
                  <p className="text-sm text-indigo-600 mt-3 italic">
                    Review the location above before joining to ensure you can attend!
                  </p>
                )}
              </>
              
            )}
            
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">About this session</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{session.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}