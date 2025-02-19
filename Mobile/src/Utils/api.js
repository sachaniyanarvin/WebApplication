import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://your-backend-api.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const verifyQrCode = async (qrData) => {
  try {
    const response = await api.post('/auth/verify-qrcode', { qrData });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const updateUserSettings = async (settings) => {
  try {
    const response = await api.put('/user/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default api;