import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Wait for the initial token verification to finish before making a routing decision
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {/* A simple CSS pulsing dot to indicate background activity */}
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-full"></div>
          <p className="text-slate-500 text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If no user object exists after loading, bounce them to login
  if (!user) {
    console.warn("Unauthorized access attempt. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the child route (e.g., Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;