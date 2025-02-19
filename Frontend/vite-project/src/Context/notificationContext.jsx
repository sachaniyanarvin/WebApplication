import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './authContext';
import { toast } from 'react-toastify';
import { API_URL } from '../utils/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, sessionId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [settings, setSettings] = useState({
    email: true,
    call: true,
    sms: true,
    apps: {}
  });

  // Connect to socket when authenticated
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      const newSocket = io(API_URL, {
        query: { sessionId }
      });
      
      setSocket(newSocket);
      
      // Clean up socket on unmount
      return () => newSocket.disconnect();
    }
  }, [isAuthenticated, sessionId]);

  // Set up socket listeners
  useEffect(() => {
    if (socket) {
      // Get initial notifications
      socket.emit('get-notifications');
      
      // Listen for new notifications
      socket.on('notification', (notification) => {
        // Check if notification should be shown based on settings
        const shouldShow = shouldShowNotification(notification);
        
        if (shouldShow) {
          // Add to notifications list
          setNotifications(prev => [notification, ...prev]);
          
          // Show toast notification
          toast(
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.body}</p>
            </div>,
            { type: toast.TYPE.INFO }
          );
        }
      });
      
      // Handle notifications history
      socket.on('notifications-history', (notificationsData) => {
        setNotifications(notificationsData);
      });
      
      // Handle settings update
      socket.on('settings-updated', (newSettings) => {
        setSettings(newSettings);
      });
      
      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Connection error. Please try again.');
      });
    }
  }, [socket]);

  // Check if notification should be shown based on settings
  const shouldShowNotification = (notification) => {
    const { type, appId } = notification;
    
    if (type === 'email' && !settings.email) return false;
    if (type === 'call' && !settings.call) return false;
    if (type === 'sms' && !settings.sms) return false;
    
    if (appId && settings.apps && settings.apps[appId] === false) {
      return false;
    }
    
    return true;
  };

  // Update notification settings
  const updateSettings = async (newSettings) => {
    try {
      if (socket) {
        socket.emit('update-settings', newSettings);
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to update settings', error);
      toast.error('Failed to update notification settings');
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit('mark-as-read', notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    if (socket) {
      socket.emit('clear-notifications');
      setNotifications([]);
    }
  };

  const value = {
    notifications,
    settings,
    updateSettings,
    markAsRead,
    clearNotifications
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};