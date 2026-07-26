import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LogOut, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <BookOpen className="w-6 h-6" />
          <span>SkillCraft</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/skills" className="text-slate-600 hover:text-indigo-600 font-medium">
            Explore Skills
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition"
              >
                <PlusCircle className="w-4 h-4" /> Share Skill
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5">
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}