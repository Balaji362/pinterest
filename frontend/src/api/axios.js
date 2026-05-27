/**
 * Axios instance with base URL and JWT token interceptor.
 * All API calls should use this instance to ensure proper
 * authentication headers are sent automatically.
 */

import axios from 'axios';

// Create an Axios instance pointed at the FastAPI backend
const api = axios.create({
  baseURL: 'https://pinterest-1-5cxw.onrender.com',
});

// Request interceptor — attaches JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles 401 errors (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
