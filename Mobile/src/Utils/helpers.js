import { Platform, PermissionsAndroid } from 'react-native';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check and request notification permissions
export const requestNotificationPermission = async () => {
  // For iOS
  if (Platform.OS === 'ios') {
    const authStatus = await notifee.requestPermission();
    return authStatus.authorizationStatus >= 1;
  }
  
  // For Android
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  
  return false;
};

// Format notification data
export const formatNotification = (notification) => {
  return {
    id: notification.id,
    title: notification.title || 'New Notification',
    body: notification.body || '',
    timestamp: notification.timestamp || new Date().toISOString(),
    appName: notification.appName || 'Unknown App',
    type: notification.type || 'general',
    read: notification.read || false,
  };
};

// Store notification settings
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
};

// Get notification settings
export const getNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : getDefaultSettings();
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return getDefaultSettings();
  }
};

// Get default notification settings
export const getDefaultSettings = () => {
  return {
    email: true,
    calls: true,
    messages: true,
    applications: {
      whatsapp: true,
      telegram: true,
      facebook: true,
      instagram: true,
      gmail: true,
    },
    doNotDisturb: false,
    doNotDisturbHours: {
      start: '22:00',
      end: '07:00',
    },
  };
};

// Generate a random session ID
export const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Check if current time is within do not disturb hours
export const isDoNotDisturbActive = async () => {
  const settings = await getNotificationSettings();
  if (!settings.doNotDisturb) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  const start = settings.doNotDisturbHours.start.split(':');
  const end = settings.doNotDisturbHours.end.split(':');
  
  const startHour = parseInt(start[0]);
  const startMinutes = parseInt(start[1]);
  const endHour = parseInt(end[0]);
  const endMinutes = parseInt(end[1]);
  
  const currentTime = currentHour * 60 + currentMinutes;
  const startTime = startHour * 60 + startMinutes;
  const endTime = endHour * 60 + endMinutes;
  
  if (startTime > endTime) {
    // Overnight schedule (e.g. 22:00 - 07:00)
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    // Same day schedule (e.g. 08:00 - 17:00)
    return currentTime >= startTime && currentTime <= endTime;
  }
};