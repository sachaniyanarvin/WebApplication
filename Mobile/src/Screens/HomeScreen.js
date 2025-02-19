import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getConnectedDevices, disconnectDevice, signOut } from '../services/authService';
import notificationService from '../services/notificationService';
import socketService from '../services/socketService';

const HomeScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [listenerId, setListenerId] = useState(null);

  useEffect(() => {
    loadDevices();
    connectSocket();
    
    // Add listener for notification updates to update unread count
    const id = notificationService.addListener(updateUnreadCount);
    setListenerId(id);
    
    // Initial unread count
    updateUnreadCount(notificationService.getNotifications());
    
    return () => {
      if (listenerId !== null) {
        notificationService.removeListener(listenerId);
      }
    };
  }, []);
  
  const connectSocket = async () => {
    await socketService.connect();
    await socketService.syncConnectedDevices();
    
    socketService.on('device_connected', handleDeviceConnected);
    socketService.on('device_disconnected', handleDeviceDisconnected);
  };
  
  const updateUnreadCount = (notifications) => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  };
  
  const loadDevices = async () => {
    const connectedDevices = await getConnectedDevices();
    setDevices(connectedDevices);
  };
  
  const handleDeviceConnected = (deviceInfo) => {
    setDevices(prevDevices => {
      // Check if device already exists
      const existingIndex = prevDevices.findIndex(d => d.deviceId === deviceInfo.deviceId);
      
      if (existingIndex >= 0) {
        // Update existing device
        const updatedDevices = [...prevDevices];
        updatedDevices[existingIndex] = {
          ...updatedDevices[existingIndex],
          ...deviceInfo,
          connectedAt: new Date().toISOString()
        };
        return updatedDevices;
      } else {
        // Add new device
        return [...prevDevices, {
          ...deviceInfo,
          connectedAt: new Date().toISOString()
        }];
      }
    });
  };
  
  const handleDeviceDisconnected = (deviceInfo) => {
    setDevices(prevDevices => 
      prevDevices.filter(device => device.deviceId !== deviceInfo.deviceId)
    );
  };
  
  const handleDisconnect = async (deviceId, deviceName) => {
    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect ${deviceName}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await socketService.sendDisconnectRequest(deviceId);
              await disconnectDevice(deviceId);
              loadDevices();
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect device');
            }
          },
        },
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              socketService.disconnect();
              await signOut();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };
  
  const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
      case 'pc':
        return 'desktop-windows';
      case 'laptop':
        return 'laptop';
      case 'tablet':
        return 'tablet-mac';
      default:
        return 'devices-other';
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const renderDevice = ({ item }) => {
    return (
      <View style={styles.deviceItem}>
        <View style={styles.deviceIconContainer}>
          <Icon
            name={getDeviceIcon(item.deviceType)}
            size={28}
            color="#5c6bc0"
          />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.deviceName}</Text>
          <Text style={styles.deviceType}>{item.deviceType}</Text>
          <Text style={styles.connectionTime}>
            Connected {formatTime(item.connectedAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={() => handleDisconnect(item.deviceId, item.deviceName)}
        >
          <Icon name="link-off" size={20} color="#ff5252" />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../../assets/no-devices.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyText}>No devices connected</Text>
        <Text style={styles.emptySubText}>
          Scan QR code on your computer to connect
        </Text>
        <TouchableOpacity
          style={styles.qrCodeButton}
          onPress={() => navigation.navigate('QRCode')}
        >
          <Text style={styles.qrCodeButtonText}>Show QR Code</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connected Devices</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="settings" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications" size={24} color="#333" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.deviceId}
        contentContainerStyle={styles.deviceList}
        ListEmptyComponent={renderEmptyState}
      />

      {devices.length > 0 && (
        <TouchableOpacity
          style={styles.qrCodeFloatingButton}
          onPress={() => navigation.navigate('QRCode')}
        >
          <Icon name="qr-code" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="exit-to-app" size={20} color="#ff5252" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff5252',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deviceList: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    padding: 16,
    elevation: 1,
  },
  deviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  connectionTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  disconnectButton: {
    padding: 10,
  },
  qrCodeFloatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5c6bc0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  logoutText: {
    marginLeft: 8,
    color: '#ff5252',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrCodeButton: {
    backgroundColor: '#5c6bc0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  qrCodeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;