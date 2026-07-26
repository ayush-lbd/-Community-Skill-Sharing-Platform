import { Link } from 'react-router-dom';
import { Star, Clock, User } from 'lucide-react';

export default function SkillCard({ skill }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col">
      {skill.image && (
        <img src={skill.image} alt={skill.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          <span>{skill.category || 'General'}</span>
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {skill.rating ? skill.rating.toFixed(1) : 'New'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{skill.title}</h3>
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">{skill.description}</p>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {skill.teacher?.avatar ? (
              <img src={skill.teacher.avatar} alt={skill.teacher.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span className="font-medium text-slate-700">{skill.teacher?.name || 'Anonymous'}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{skill.duration || 'Flexible'}</span>
          </div>
        </div>

        <Link
          to={`/skills/${skill._id}`}
          className="mt-4 block text-center bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-medium py-2 rounded-lg text-sm transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}