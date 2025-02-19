import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, verifyQrCode } from '../utils/api';
import { generateSessionId } from '../utils/helpers';

export const signIn = async (email, password) => {
  try {
    const response = await login(email, password);
    
    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userId', response.user.id.toString());
      return { success: true, user: response.user };
    }
    
    return { 
      success: false, 
      error: 'Authentication failed. Please check your credentials.'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Authentication failed. Please try again.'
    };
  }
};

export const signUp = async (userData) => {
  try {
    const response = await register(userData);
    
    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userId', response.user.id.toString());
      return { success: true, user: response.user };
    }
    
    return { 
      success: false, 
      error: 'Registration failed. Please try again.'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Registration failed. Please try again.'
    };
  }
};

export const signOut = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('connectedDevices');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Sign out failed. Please try again.'
    };
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  } catch (error) {
    return false;
  }
};

export const connectWithQR = async (qrData) => {
  try {
    const response = await verifyQrCode(qrData);
    
    if (response.success) {
      const sessionId = generateSessionId();
      
      // Store connected device info
      const storedDevices = await AsyncStorage.getItem('connectedDevices');
      const devices = storedDevices ? JSON.parse(storedDevices) : [];
      
      devices.push({
        deviceId: response.deviceId,
        deviceName: response.deviceName,
        deviceType: response.deviceType,
        sessionId,
        connectedAt: new Date().toISOString()
      });
      
      await AsyncStorage.setItem('connectedDevices', JSON.stringify(devices));
      
      return { 
        success: true, 
        sessionId,
        deviceInfo: {
          deviceId: response.deviceId,
          deviceName: response.deviceName,
          deviceType: response.deviceType
        }
      };
    }
    
    return { 
      success: false, 
      error: 'QR code verification failed. Please try again.'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'QR code verification failed. Please try again.'
    };
  }
};

export const disconnectDevice = async (deviceId) => {
  try {
    const storedDevices = await AsyncStorage.getItem('connectedDevices');
    
    if (!storedDevices) {
      return { success: true };
    }
    
    const devices = JSON.parse(storedDevices);
    const updatedDevices = devices.filter(device => device.deviceId !== deviceId);
    
    await AsyncStorage.setItem('connectedDevices', JSON.stringify(updatedDevices));
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Failed to disconnect device. Please try again.'
    };
  }
};

export const getConnectedDevices = async () => {
  try {
    const storedDevices = await AsyncStorage.getItem('connectedDevices');
    return storedDevices ? JSON.parse(storedDevices) : [];
  } catch (error) {
    console.error('Error getting connected devices:', error);
    return [];
  }
};