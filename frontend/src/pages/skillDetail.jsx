import { useState, useEffect } from 'react';
import { useParams } from 'react'
import API from '../api/axios';
import { Star, Clock, User, MessageSquare } from 'lucide-react';

export default function SkillDetail() {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const { data } = await API.get(`/skills/${id}`);
        setSkill(data);
      } catch (err) {
        console.error('Failed to load skill details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [id]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(`/skills/${id}/ratings`, { rating, comment });
      setSkill(data.skill || skill);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) return <div className="text-center py-12">Loading skill...</div>;
  if (!skill) return <div className="text-center py-12">Skill not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {skill.image && <img src={skill.image} alt={skill.title} className="w-full h-64 object-cover" />}
        <div className="p-6">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{skill.category}</span>
          <h1 className="text-3xl font-bold text-slate-900 mt-1 mb-4">{skill.title}</h1>

          <div className="flex items-center gap-6 text-sm text-slate-600 mb-6 border-y border-slate-100 py-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Instructor: <strong className="text-slate-800">{skill.teacher?.name}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{skill.duration || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{skill.rating ? skill.rating.toFixed(1) : 'No reviews'}</span>
            </div>
          </div>

          <p className="text-slate-700 leading-relaxed mb-6">{skill.description}</p>

          <button
            onClick={() => alert('Connection request sent!')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            Request Skill Exchange
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" /> Reviews & Ratings
        </h2>

        <form onSubmit={handleRatingSubmit} className="mb-6 space-y-3 bg-slate-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-700">Leave Feedback</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>{num} Stars</option>
              ))}
            </select>
          </div>
          <textarea
            rows="2"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md text-sm outline-hidden"
            required
          />
          <button type="submit" className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-slate-800">
            Submit Review
          </button>
        </form>

        <div className="space-y-3">
          {skill.reviews && skill.reviews.length > 0 ? (
            skill.reviews.map((rev, index) => (
              <div key={index} className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{rev.userName || 'Student'}</span>
                  <span className="text-amber-500 font-bold">{rev.rating} ★</span>
                </div>
                <p className="text-sm text-slate-600">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No reviews yet for this skill.</p>
          )}
        </div>
      </div>
    </div>
  );
}