import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotifications } from '../context/notificationContext';
import { useAuth } from '../context/authContext';
import { toast } from 'react-toastify';

const SettingsContainer = styled.div`
  padding: 10px;
`;

const SettingSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
`;

const OptionGroup = styled.div`
  margin-bottom: 20px;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  margin-right: 10px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #4C84FF;
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const OptionText = styled.span`
  font-size: 15px;
`;

const SaveButton = styled.button`
  background-color: #4C84FF;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
  
  &:hover {
    background-color: #3a6fdb;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const AppList = styled.div`
  margin-top: 15px;
`;

const AppItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AppIcon = styled.div`
  width: 36px;
  height: 36px;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 20px;
`;

const AppName = styled.div`
  flex: 1;
`;

const SettingsComponent = () => {
  const { settings, updateSettings } = useNotifications();
  const { currentUser } = useAuth();
  
  const [localSettings, setLocalSettings] = useState({
    email: true,
    call: true,
    sms: true,
    apps: {}
  });
  
  const [installedApps, setInstalledApps] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Get installed apps from currentUser data when component mounts
  useEffect(() => {
    if (currentUser && currentUser.installedApps) {
      setInstalledApps(currentUser.installedApps);
    }
  }, [currentUser]);

  // Update local settings when settings from context change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleAppToggleChange = (appId, value) => {
    setLocalSettings(prev => ({
      ...prev,
      apps: {
        ...prev.apps,
        [appId]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(localSettings);
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const getAppIcon = (category) => {
    switch (category) {
      case 'social': return '👥';
      case 'messaging': return '💬';
      case 'productivity': return '📊';
      case 'entertainment': return '🎬';
      default: return '📱';
    }
  };

  return (
    <SettingsContainer>
    <SettingSection>
      <SectionTitle>Notification Settings</SectionTitle>
      <OptionGroup>
        <OptionLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={localSettings.email}
              onChange={(e) => handleToggleChange('email', e.target.checked)}
            />
            <Slider />
          </ToggleSwitch>
          <OptionText>Email Notifications</OptionText>
        </OptionLabel>
        
        <OptionLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={localSettings.call}
              onChange={(e) => handleToggleChange('call', e.target.checked)}
            />
            <Slider />
          </ToggleSwitch>
          <OptionText>Call Notifications</OptionText>
        </OptionLabel>
        
        <OptionLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={localSettings.sms}
              onChange={(e) => handleToggleChange('sms', e.target.checked)}
            />
            <Slider />
          </ToggleSwitch>
          <OptionText>SMS Notifications</OptionText>
        </OptionLabel>
      </OptionGroup>
    </SettingSection>
    
    <SettingSection>
      <SectionTitle>App Notifications</SectionTitle>
      <AppList>
        {installedApps.length === 0 ? (
          <p>No apps found on your connected device</p>
        ) : (
          installedApps.map(app => (
            <AppItem key={app.id}>
              <AppIcon>{getAppIcon(app.category)}</AppIcon>
              <AppName>{app.name}</AppName>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={localSettings.apps[app.id] !== false} // Default to true if undefined
                  onChange={(e) => handleAppToggleChange(app.id, e.target.checked)}
                />
                <Slider />
              </ToggleSwitch>
            </AppItem>
          ))
        )}
      </AppList>
    </SettingSection>
    
    <SaveButton 
      onClick={handleSaveSettings}
      disabled={!hasChanges}
    >
      Save Settings
    </SaveButton>
  </SettingsContainer>
);
};

export default SettingsComponent;