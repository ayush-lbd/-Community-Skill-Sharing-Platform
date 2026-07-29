import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react'; // Using Lucide for the brand icon

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Kick the user back to the landing page after logging out
  };

  return (
    <nav className="border-b bg-white border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl hover:opacity-80 transition-opacity">
            <BookOpen className="w-6 h-6" />
            <span>SkillCraft</span>
          </Link>

          {/* Desktop Navigation - TODO: Add a hamburger menu for mobile screens later */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/skills" className="text-slate-600 hover:text-indigo-600 font-medium">
              Explore Skills
            </Link>
            

            <Link 
            to="/sessions" 
            className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
            Explore Sessions
            </Link>
            {/* Conditional Auth Rendering */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                {/* Display a fallback initial if the user hasn't uploaded a profile picture */}
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium">
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;