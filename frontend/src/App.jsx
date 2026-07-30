import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ProtectedRoute from './components/protectedRoute';
import PublicProfile from './pages/PublicProfile';
import ExploreSessions from './pages/ExploreSessions'; 
import SessionDetails from './pages/SessionDetails';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';

export default function App() {
  
  const { loading } = useAuth(); 

 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:targetUserId" element={<PublicProfile />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Platform-Public: Only registered users can view and rate others */}
              <Route path="/user/:id" element={<PublicProfile />} />
              <Route path="/sessions" element={<ExploreSessions />} />
              <Route path="/sessions/:sessionId" element={<SessionDetails />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}