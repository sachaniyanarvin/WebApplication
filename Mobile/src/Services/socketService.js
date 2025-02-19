import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConnectedDevices } from './authService';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseUrl = 'https://your-backend-api.com';
  }
  
  async connect() {
    if (this.socket && this.isConnected) {
      return true;
    }
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return false;
      }
      
      this.socket = io(this.baseUrl, {
        auth: {
          token
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
      
      this.setupSocketEvents();
      return true;
    } catch (error) {
      console.error('Error connecting to socket server:', error);
      return false;
    }
  }
  
  setupSocketEvents() {
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to socket server');
    });
    
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Disconnected from socket server:', reason);
      
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect automatically
        this.socket.connect();
      }
    });
    
    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('Socket connection error:', error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.socket.disconnect();
      }
    });
    
    // Setup event listeners for the different notification types
    this.socket.on('new_notification', (data) => {
      this.emit('new_notification', data);
    });
    
    this.socket.on('device_connected', (data) => {
      this.emit('device_connected', data);
    });
    
    this.socket.on('device_disconnected', (data) => {
      this.emit('device_disconnected', data);
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
  
  async sendQRData(qrData, deviceInfo) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (!this.isConnected) {
      return { success: false, error: 'Failed to connect to the server' };
    }
    
    return new Promise((resolve) => {
      this.socket.emit('qr_connect', { qrData, deviceInfo }, (response) => {
        resolve(response);
      });
    });
  }
  
  async sendDisconnectRequest(deviceId) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (!this.isConnected) {
      return { success: false, error: 'Failed to connect to the server' };
    }
    
    return new Promise((resolve) => {
      this.socket.emit('disconnect_device', { deviceId }, (response) => {
        resolve(response);
      });
    });
  }
  
  async syncConnectedDevices() {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (!this.isConnected) {
      return false;
    }
    
    const devices = await getConnectedDevices();
    
    return new Promise((resolve) => {
      this.socket.emit('sync_devices', { devices }, (response) => {
        resolve(response.success);
      });
    });
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    return this.listeners[event].length - 1;
  }
  
  off(event, id) {
    if (this.listeners[event] && id >= 0 && id < this.listeners[event].length) {
      this.listeners[event].splice(id, 1);
    }
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(data);
      });
    }
  }
}

export default new SocketService();