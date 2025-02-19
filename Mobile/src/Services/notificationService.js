import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationSettings, isDoNotDisturbActive, formatNotification } from '../utils/helpers';
import socketService from './socketService';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.init();
  }

  async init() {
    // Create default notification channel for Android
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      
      await notifee.createChannel({
        id: 'calls',
        name: 'Calls',
        importance: AndroidImportance.HIGH,
        sound: 'ringtone',
      });
      
      await notifee.createChannel({
        id: 'messages',
        name: 'Messages',
        importance: AndroidImportance.DEFAULT,
      });
      
      await notifee.createChannel({
        id: 'emails',
        name: 'Emails',
        importance: AndroidImportance.LOW,
      });
    }
    
    // Load saved notifications from storage
    this.loadNotifications();
    
    // Listen to incoming notifications from socket
    this.setupSocketListener();
  }
  
  setupSocketListener() {
    socketService.on('new_notification', this.handleIncomingNotification.bind(this));
  }
  
  async handleIncomingNotification(notification) {
    const settings = await getNotificationSettings();
    const isDndActive = await isDoNotDisturbActive();
    
    if (isDndActive) {
      // Store notification but don't display it
      this.addNotification(notification, false);
      return;
    }
    
    // Check if this notification type is enabled in settings
    let shouldDisplay = true;
    
    if (notification.type === 'email' && !settings.email) {
      shouldDisplay = false;
    } else if (notification.type === 'call' && !settings.calls) {
      shouldDisplay = false;
    } else if (notification.type === 'message' && !settings.messages) {
      shouldDisplay = false;
    } else if (notification.appName && 
              settings.applications && 
              typeof settings.applications[notification.appName.toLowerCase()] !== 'undefined') {
      shouldDisplay = settings.applications[notification.appName.toLowerCase()];
    }
    
    if (shouldDisplay) {
      // Display the notification
      this.displayNotification(notification);
    }
    
    // Always store the notification
    this.addNotification(notification, shouldDisplay);
  }
  
  async displayNotification(notification) {
    try {
      const formattedNotification = formatNotification(notification);
      
      // Select appropriate channel based on notification type
      let channelId = 'default';
      if (formattedNotification.type === 'call') channelId = 'calls';
      if (formattedNotification.type === 'message') channelId = 'messages';
      if (formattedNotification.type === 'email') channelId = 'emails';
      
      await notifee.displayNotification({
        title: formattedNotification.title,
        body: formattedNotification.body,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
        data: {
          notificationId: formattedNotification.id,
          type: formattedNotification.type,
          appName: formattedNotification.appName,
        },
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }
  
  async loadNotifications() {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }
  
  async saveNotifications() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }
  
  addNotification(notification, displayed = true) {
    const formattedNotification = formatNotification(notification);
    formattedNotification.displayed = displayed;
    
    this.notifications.unshift(formattedNotification);
    
    // Limit stored notifications to 100
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    this.saveNotifications();
    this.notifyListeners();
  }
  
  markAsRead(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      this.notifications[index].read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }
  
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
    this.notifyListeners();
  }
  
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }
  
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }
  
  getNotifications() {
    return [...this.notifications];
  }
  
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }
  
  addListener(callback) {
    this.listeners.push(callback);
    return this.listeners.length - 1;
  }
  
  removeListener(id) {
    if (id >= 0 && id < this.listeners.length) {
      this.listeners.splice(id, 1);
    }
  }
  
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.getNotifications());
    });
  }
}

export default new NotificationService();