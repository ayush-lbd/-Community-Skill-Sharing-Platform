import axios from 'axios';

const api = axios.create({
  baseURL: 'https://community-skill-sharing-platform-sp39.onrender.com', 
  withCredentials: true, 
});

// The Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Identify auth endpoints that should NEVER attempt a token refresh
    const isAuthRoute = 
      originalRequest.url?.includes('/users/refresh-token') ||
      originalRequest.url?.includes('/users/login') ||
      originalRequest.url?.includes('/users/register');

    // 2. Only attempt refresh if it's a 401, not retried, and NOT an auth route
    if (
      error.response && 
      error.response.status === 401 &&
      !originalRequest._retry && 
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        console.log("Access token expired. Attempting silent refresh...");
        await api.post('/users/refresh-token'); 
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired. Logging out.");
        
        // CRITICAL FIX: Removed window.location.href
        // By returning Promise.reject, we let AuthContext handle the failure gracefully
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;