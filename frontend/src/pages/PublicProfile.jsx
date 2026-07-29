import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios'; 
import { Star, Award, ArrowLeft, User, Calendar, MapPin, Video } from 'lucide-react';

export default function PublicProfile() {
  // Grab the specific parameter name you set in your App.jsx route
  const { targetUserId } = useParams(); 
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessMessage, setRatingSuccessMessage] = useState("");

  const handleRateUser = async (score) => {
    setIsSubmittingRating(true);
    setRatingSuccessMessage("");
    
    try {
      // Make sure this route matches your backend rating route!
      await API.post(`/users/rate/${targetUserId}`, { score });
      
      setRatingSuccessMessage("Thank you for rating!");
      
      // If you have your fetchUserProfile function extracted, you can call it here to refresh the UI
      // If not, simply reload the page to see the new rating
      window.location.reload(); 
      
    } catch (err) {
      console.error('Failed to submit rating:', err);
      alert(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Calls your backend route: /profile/:targetUserId
        const res = await API.get(`/users/profile/${targetUserId}`); 
        
        // Assuming your backend uses the ApiResponse class which puts data inside res.data.data
        setProfile(res.data?.data); 
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [targetUserId]);

  if (isLoading) return <div className="text-center py-12 text-slate-600 font-medium">Loading profile...</div>;
  if (!profile) return <div className="text-center py-12 text-slate-600 font-medium">User not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-8 mb-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 border-b border-slate-100 pb-8">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
            {/* If you add profile pictures later, replace this icon with an <img> tag */}
            <User className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
            
            {/* Rating Display using your backend variable names */}
            <div className="flex items-center gap-1 mt-2 text-amber-500 font-medium bg-amber-50 w-fit px-3 py-1 rounded-full text-sm border border-amber-100">
              <Star className="w-4 h-4 fill-current" />
              <span>{profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "New"} Rating</span>
              <span className="text-amber-700/60 ml-1">({profile.totalRatings} reviews)</span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-600">Rate this host:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starNumber) => (
                  <button
                    key={starNumber}
                    disabled={isSubmittingRating}
                    onMouseEnter={() => setHoverRating(starNumber)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRateUser(starNumber)}
                    className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star 
                      className={`w-6 h-6 transition-colors ${
                        (hoverRating || 0) >= starNumber 
                          ? 'fill-amber-400 text-amber-400' // Hover state (filled)
                          : 'text-slate-300' // Default empty state
                      }`} 
                    />
                  </button>
                ))}
                
                {/* Loading/Success feedback */}
                {isSubmittingRating && <span className="ml-3 text-sm text-slate-500 animate-pulse">Saving...</span>}
                {ratingSuccessMessage && <span className="ml-3 text-sm text-green-600 font-medium">{ratingSuccessMessage}</span>}
              </div>
            </div>

          </div>
        </div>

        {/* Skills & Bio Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left Column: Skills (Core Competencies) */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Skills to Teach
            </h2>
            {profile.skillsToTeach && profile.skillsToTeach.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skillsToTeach.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No skills listed yet.</p>
            )}
          </div>

          {/* Right Column: Bio */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About {profile.name}</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {profile.bio || "This user hasn't written a bio yet."}
            </p>
          </div>
        </div>
      </div>

      {/* Hosted Sessions Section */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Sessions Hosted by {profile.name}
      </h2>

      {profile.hostedSessions && profile.hostedSessions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.hostedSessions.map(session => (
            <Link 
              to={`/sessions/${session._id}`} 
              key={session._id}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
            >
              <div className="p-6 flex-1">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide mb-4">
                  {session.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {session.title}
                </h3>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    {new Date(session.date).toLocaleDateString()} at {session.time}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    {session.sessionLocation === 'online' ? (
                      <><Video className="w-4 h-4 mr-2 text-slate-400" /> Online Meeting</>
                    ) : (
                      <><MapPin className="w-4 h-4 mr-2 text-slate-400" /> In-Person</>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm font-semibold text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                View Details &rarr;
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">{profile.name} doesn't have any scheduled sessions right now.</p>
        </div>
      )}
    </div>
  );
}