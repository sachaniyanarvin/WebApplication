import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include session ID from localStorage
api.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      config.headers['Session-ID'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      if (error.response.status === 401) {
        // Unauthorized - clear local storage and redirect to login
        localStorage.removeItem('sessionId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);