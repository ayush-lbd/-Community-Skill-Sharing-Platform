import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log("Found token, verifying session with backend...");
          const response = await API.get('/users/profile');
          // Depending on your backend setup, it might return { user: { ... } } or just { ... }
          setUser(response.data.user || response.data);
        } catch (error) {
          console.error('Session verification failed. Token might be expired.', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log("No token found. User is logged out.");
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    // TODO: Add global toast notification on successful login
    const response = await API.post('/users/login', credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (formData) => {
    const response = await API.post('/users/register', formData, {
      // Required header because this form includes an image file (avatar)
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    console.log("Logging user out...");
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to make importing this context cleaner in our components
export const useAuth = () => useContext(AuthContext);