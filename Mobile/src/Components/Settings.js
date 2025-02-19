import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getNotificationSettings, saveNotificationSettings } from '../utils/helpers';
import { updateUserSettings } from '../utils/api';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveNotificationSettings(settings);
      await updateUserSettings(settings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }));
  };

  const toggleAppSetting = (appName) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      applications: {
        ...prevSettings.applications,
        [appName]: !prevSettings.applications[appName],
      },
    }));
  };

  const handleTimeChange = (key, selectedTime) => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    setSettings((prevSettings) => ({
      ...prevSettings,
      doNotDisturbHours: {
        ...prevSettings.doNotDisturbHours,
        [key]: timeString,
      },
    }));
  };

  if (loading || !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5c6bc0" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Icon name="email" size={24} color="#5c6bc0" style={styles.icon} />
            <Text style={styles.settingText}>Email Notifications</Text>
          </View>
          <Switch
            value={settings.email}
            onValueChange={() => toggleSetting('email')}
            trackColor={{ false: '#d3d3d3', true: '#a7c7e7' }}
            thumbColor={settings.email ? '#5c6bc0' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Icon name="call" size={24} color="#5c6bc0" style={styles.icon} />
            <Text style={styles.settingText}>Call Notifications</Text>
          </View>
          <Switch
            value={settings.calls}
            onValueChange={() => toggleSetting('calls')}
            trackColor={{ false: '#d3d3d3', true: '#a7c7e7' }}
            thumbColor={settings.calls ? '#5c6bc0' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Icon name="message" size={24} color="#5c6bc0" style={styles.icon} />
            <Text style={styles.settingText}>Message Notifications</Text>
          </View>
          <Switch
            value={settings.messages}
            onValueChange={() => toggleSetting('messages')}
            trackColor={{ false: '#d3d3d3', true: '#a7c7e7' }}
            thumbColor={settings.messages ? '#5c6bc0' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Applications</Text>
        
        {Object.keys(settings.applications).map((app) => (
          <View style={styles.settingItem} key={app}>
            <View style={styles.settingLabel}>
              <Icon name="smartphone" size={24} color="#5c6bc0" style={styles.icon} />
              <Text style={styles.settingText}>
                {app.charAt(0).toUpperCase() + app.slice(1)}
              </Text>
            </View>
            <Switch
              value={settings.applications[app]}
              onValueChange={() => toggleAppSetting(app)}
              trackColor={{ false: '#d3d3d3', true: '#a7c7e7' }}
              thumbColor={settings.applications[app] ? '#5c6bc0' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Do Not Disturb</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Icon name="do-not-disturb" size={24} color="#5c6bc0" style={styles.icon} />
            <Text style={styles.settingText}>Enable Do Not Disturb</Text>
          </View>
          <Switch
            value={settings.doNotDisturb}
            onValueChange={() => toggleSetting('doNotDisturb')}
            trackColor={{ false: '#d3d3d3', true: '#a7c7e7' }}
            thumbColor={settings.doNotDisturb ? '#5c6bc0' : '#f4f3f4'}
          />
        </View>

        {settings.doNotDisturb && (
          <>
            <View style={styles.settingItem}>
              <View style={styles.settingLabel}>
                <Icon name="access-time" size={24} color="#5c6bc0" style={styles.icon} />
                <Text style={styles.settingText}>Start Time</Text>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setStartTimePickerVisible(true)}
              >
                <Text style={styles.timeButtonText}>{settings.doNotDisturbHours.start}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabel}>
                <Icon name="access-time" size={24} color="#5c6bc0" style={styles.icon} />
                <Text style={styles.settingText}>End Time</Text>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setEndTimePickerVisible(true)}
              >
                <Text style={styles.timeButtonText}>{settings.doNotDisturbHours.end}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Settings</Text>
        )}
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={(time) => {
          handleTimeChange('start', time);
          setStartTimePickerVisible(false);
        }}
        onCancel={() => setStartTimePickerVisible(false)}
      />

      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={(time) => {
          handleTimeChange('end', time);
          setEndTimePickerVisible(false);
        }}
        onCancel={() => setEndTimePickerVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 4,
  },
  timeButtonText: {
    color: '#5c6bc0',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#5c6bc0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;