import { Link } from 'react-router-dom';
import { User, Tag } from 'lucide-react'; // Icons for visual flair

const SkillCard = ({ skill }) => {
  // Defensive programming: If no skill data is passed, don't crash the app
  if (!skill) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      
      {/* 
        Image Placeholder/Renderer 
        We use object-cover to ensure images uploaded by users don't stretch out of proportion 
      */}
      <div className="h-48 bg-slate-200 w-full relative">
        {skill.imageUrl ? (
          <img 
            src={skill.imageUrl} 
            alt={skill.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No Image Available
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col grow">
        
        {/* Category Tag */}
        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">
          <Tag className="w-3 h-3" />
          {skill.category || 'Uncategorized'}
        </div>

        {/* Title & Truncated Description */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
          {skill.title}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 grow">
          {skill.description}
        </p>

        <hr className="border-slate-100 my-4" />

        {/* Footer: Instructor & Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="w-4 h-4" />
            {/* Safely access nested instructor data */}
            <span className="truncate max-w-30">
              {skill.instructor?.name || 'Community Member'}
            </span>
          </div>
          
          <Link 
            to={`/skills/${skill._id}`}
            className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors"
          >
            View Details →
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default SkillCard;