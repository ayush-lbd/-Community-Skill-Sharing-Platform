import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { Star, BookOpen, Award, CheckCircle2 } from 'lucide-react';

export default function PublicProfile() {
  const { id: userId } = useParams();
  
  const [profileUser, setProfileUser] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rating State
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Adjust endpoint to match your 'get user profile' backend route
        const res = await API.get(`/users/profile/${userId}`);
        const responseData = res.data.data || res.data;

        // Handles setups returning user and skills combined or single profile object
        setProfileUser(responseData.user || responseData);
        setUserSkills(responseData.skills || []);

        // If your backend sends the existing rating given by the logged-in user
        if (responseData.myRating) {
          setUserRating(responseData.myRating);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err.response?.data?.message || 'User profile not found.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleRateUser = async (ratingValue) => {
    setIsSubmittingRating(true);
    setRatingSuccessMsg('');

    try {
      // Adjust path to match your backend 'rate user' route (e.g. /users/rate/:id or /users/:id/rate)
      const res = await API.post(`/users/rate/${userId}`, { score: ratingValue });

      setUserRating(ratingValue);
      setRatingSuccessMsg('Rating submitted successfully!');

      // Dynamically update the average rating if backend returns updated numbers
      if (res.data?.data?.averageRating !== undefined) {
        setProfileUser((prev) => ({
          ...prev,
          averageRating: res.data.data.averageRating,
          totalRatings: res.data.data.totalRatings,
        }));
      }
    } catch (err) {
      console.error('Failed to rate user:', err);
      alert(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 text-red-700 rounded-xl text-center border border-red-200">
        <p className="font-semibold">{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header & Cover Image */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-48 md:h-64 w-full bg-indigo-50 relative">
          {profileUser.coverImage ? (
            <img
              src={profileUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-indigo-500 to-purple-600"></div>
          )}
        </div>

        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
            <div className="relative">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white object-cover bg-white shadow-md"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-4xl text-slate-500 shadow-md">
                  {profileUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Rating Summary Display */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-amber-900 text-sm">
                {profileUser.averageRating ? profileUser.averageRating.toFixed(1) : 'New'}
              </span>
              {profileUser.totalRatings !== undefined && (
                <span className="text-xs text-amber-700">({profileUser.totalRatings})</span>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              {profileUser.name}
              <CheckCircle2 className="w-5 h-5 text-indigo-600 inline" />
            </h1>
            <p className="text-slate-500 font-medium text-sm">{profileUser.email}</p>
            {profileUser.bio && (
              <p className="text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
                {profileUser.bio}
              </p>
            )}
          </div>

          {/* Core Competencies */}
          {profileUser.skillsToTeach && profileUser.skillsToTeach.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.skillsToTeach.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* 2. Left Column: Interactive Rating Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Rate Instructor
            </h3>
            <p className="text-xs text-slate-500">
              Have you learned from {profileUser.name}? Rate their expertise and teaching clarity.
            </p>

            {/* Interactive Star Picker */}
            <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-xl border border-slate-100">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmittingRating}
                  onClick={() => handleRateUser(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || userRating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {ratingSuccessMsg && (
              <p className="text-xs font-medium text-emerald-600 text-center bg-emerald-50 py-1.5 rounded-lg">
                {ratingSuccessMsg}
              </p>
            )}
          </div>
        </div>

        {/* 3. Right Column: Offered Skills List */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" /> Offerings by {profileUser.name}
            </h2>

            {userSkills.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {userSkills.map((skill) => (
                  <div
                    key={skill._id}
                    className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                      {skill.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{skill.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 mt-2">
                      {skill.description}
                    </p>
                    {skill.duration && (
                      <p className="text-xs font-medium text-slate-500 mt-3">
                        ⏱️ {skill.duration}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-8 text-center rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm">
                  This instructor has not listed any structured offerings yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}