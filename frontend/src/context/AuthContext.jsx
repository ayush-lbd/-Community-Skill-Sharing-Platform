import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios.js'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("App loaded: Checking for active session cookie...");
      
        // Hit your protected route. Axios automatically sends the HTTP-only cookie!
        const response = await API.get('/users/current-user'); 
        
        // Restore the user state with the data from your database
        // Adjust this based on how your backend formats the response (e.g., response.data.data)
        setUser(response.data.data || response.data.user || response.data);
      } catch (error) {
        console.log('No active session or token expired.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const response = await API.post('/users/login', credentials);
    // The backend sets the cookie automatically. We just need to save the user data.
    console.log("Backend Login Response:", response.data);
    setUser(response.data.user || response.data);
    return response.data;
  };

  const register = async (formData) => {
    const response = await API.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Again, the backend sets the cookie. Just update the user state.
    setUser(response.data.user || response.data);
    return response.data;
  };

  const logout = async () => {
    console.log("Logging user out...");
    try {
      // We should have a backend route that clears the cookie
      await API.post('/users/logout'); 
    } catch (error) {
      console.error("Logout error", error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);