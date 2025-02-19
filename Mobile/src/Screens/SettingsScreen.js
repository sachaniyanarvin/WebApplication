import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import Settings from '../components/Settings';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    email: true,
    calls: true,
    messages: true,
    social: {
      whatsapp: true,
      facebook: false,
      instagram: false,
      twitter: false,
    },
    otherApps: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [installedApps, setInstalledApps] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);

  useEffect(() => {
    // Fetch user settings
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const userSettings = await notificationService.getUserSettings();
        if (userSettings) {
          setSettings(userSettings);
        }
        
        // Get installed apps that can send notifications
        const apps = await notificationService.getInstalledApps();
        setInstalledApps(apps);
        
        // Get connected devices
        const devices = await authService.getConnectedDevices();
        setConnectedDevices(devices);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        Alert.alert('Error', 'Failed to load settings. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleToggleMainSetting = (key) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key]
    }));
  };

  const handleToggleSocialSetting = (key) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      social: {
        ...prevSettings.social,
        [key]: !prevSettings.social[key]
      }
    }));
  };

  const handleToggleAppNotification = (appId) => {
    setSettings(prevSettings => {
      const updatedOtherApps = prevSettings.otherApps.includes(appId)
        ? prevSettings.otherApps.filter(id => id !== appId)
        : [...prevSettings.otherApps, appId];
      
      return {
        ...prevSettings,
        otherApps: updatedOtherApps
      };
    });
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      await notificationService.updateUserSettings(settings);
      Alert.alert('Success', 'Your settings have been saved successfully.');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
      setIsLoading(false);
    }
  };

  const disconnectDevice = async (deviceId) => {
    try {
      await authService.disconnectDevice(deviceId);
      setConnectedDevices(prevDevices => 
        prevDevices.filter(device => device.id !== deviceId)
      );
      Alert.alert('Success', 'Device disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect device:', error);
      Alert.alert('Error', 'Failed to disconnect device. Please try again.');
    }
  };

  const logOut = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Failed to log out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Emails</Text>
            <Switch
              value={settings.email}
              onValueChange={() => handleToggleMainSetting('email')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Calls</Text>
            <Switch
              value={settings.calls}
              onValueChange={() => handleToggleMainSetting('calls')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Messages</Text>
            <Switch
              value={settings.messages}
              onValueChange={() => handleToggleMainSetting('messages')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          {Object.keys(settings.social).map(app => (
            <View style={styles.settingItem} key={app}>
              <Text style={styles.settingLabel}>{app.charAt(0).toUpperCase() + app.slice(1)}</Text>
              <Switch
                value={settings.social[app]}
                onValueChange={() => handleToggleSocialSetting(app)}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Applications</Text>
          {installedApps.map(app => (
            <View style={styles.settingItem} key={app.id}>
              <Text style={styles.settingLabel}>{app.name}</Text>
              <Switch
                value={settings.otherApps.includes(app.id)}
                onValueChange={() => handleToggleAppNotification(app.id)}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Devices</Text>
          {connectedDevices.map(device => (
            <View style={styles.deviceItem} key={device.id}>
              <View style={styles.deviceInfo}>
                <FontAwesome 
                  name={device.type === 'laptop' ? 'laptop' : 'desktop'} 
                  size={24} 
                  color="#555"
                />
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceLastConnected}>
                    Last connected: {new Date(device.lastConnected).toLocaleString()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={() => disconnectDevice(device.id)}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#555',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deviceLastConnected: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  disconnectButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  disconnectButtonText: {
    color: '#dc3545',
    fontSize: 14,
  },
  logoutContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    width: '50%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;