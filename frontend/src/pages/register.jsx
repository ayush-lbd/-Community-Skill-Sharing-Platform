import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [avatar, setAvatar] = useState(null);
  // 1. Add state for the optional fields
  const [coverImage, setCoverImage] = useState(null);
  const [skillsToTeach, setSkillsToTeach] = useState(''); 
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      
      if (avatar) {
        data.append('avatar', avatar);
      }
      
      // 2. Append optional fields if the user provided them
      if (coverImage) {
        data.append('coverImage', coverImage);
      }
      if (skillsToTeach) {
        // Convert "React, Node" into an actual array: ["React", "Node"]
        const skillsArray = skillsToTeach
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill !== ""); // Removes empty entries if they type extra commas

        // Stringify the array so your backend JSON.parse() works perfectly!
        data.append('skillsToTeach', JSON.stringify(skillsArray)); 
      }

      await register(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Create an Account</h2>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Optional Skills Input */}
          {/* Optional Skills Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills to Teach (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. React, Node.js, MongoDB"
              value={skillsToTeach}
              onChange={(e) => setSkillsToTeach(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">Separate multiple skills with commas.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture *</label>
            <input 
              type="file" 
              required  
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {/* Optional Cover Image Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors mt-2"
          >
            {isSubmitting ? 'Processing...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-600 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Log in here
          </Link>
        </p>
        
      </div>
    </div>
  );
};

export default Register;