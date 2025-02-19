import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { getConnectionToken } from '../services/authService';
import socketService from '../services/socketService';

const QRCodeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [connectionToken, setConnectionToken] = useState('');
  const [connectionUrl, setConnectionUrl] = useState('');
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [countDown, setCountDown] = useState(300); // 5 minutes

  useEffect(() => {
    generateConnectionToken();
    
    // Listen for new device connection
    socketService.on('device_connected', handleDeviceConnected);
    
    return () => {
      socketService.off('device_connected', handleDeviceConnected);
    };
  }, []);

  useEffect(() => {
    if (tokenExpiry) {
      const timer = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((tokenExpiry - now) / 1000);
        
        if (diff <= 0) {
          clearInterval(timer);
          generateConnectionToken();
        } else {
          setCountDown(diff);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [tokenExpiry]);

  const generateConnectionToken = async () => {
    setLoading(true);
    try {
      const { token, expiresAt, url } = await getConnectionToken();
      setConnectionToken(token);
      setConnectionUrl(url);
      setTokenExpiry(new Date(expiresAt));
      setCountDown(300); // Reset countdown to 5 minutes
    } catch (error) {
      Alert.alert('Error', 'Failed to generate connection token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceConnected = (deviceInfo) => {
    Alert.alert(
      'Device Connected',
      `${deviceInfo.deviceName} has been connected successfully!`,
      [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  const copyToClipboard = () => {
    Clipboard.setString(connectionUrl);
    Alert.alert('Copied', 'Connection URL copied to clipboard');
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const shareConnectionUrl = async () => {
    try {
      await Share.share({
        message: `Connect to my phone using this link: ${connectionUrl}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share connection URL');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect New Device</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#5c6bc0" />
        ) : (
          <>
            <Text style={styles.instruction}>
              Scan this QR code on your computer's web browser
            </Text>
            
            <View style={styles.qrCodeContainer}>
              <QRCodeGenerator
                value={connectionUrl}
                size={Dimensions.get('window').width * 0.7}
                color="#333"
                backgroundColor="#fff"
              />
            </View>
            
            <Text style={styles.expiryText}>
              Code expires in {formatCountdown(countDown)}
            </Text>
            
            <View style={styles.urlContainer}>
              <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">
                {connectionUrl}
              </Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Icon name="content-copy" size={20} color="#5c6bc0" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={generateConnectionToken}
              >
                <Icon name="refresh" size={20} color="#5c6bc0" />
                <Text style={styles.actionButtonText}>Refresh</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={shareConnectionUrl}
              >
                <Icon name="share" size={20} color="#5c6bc0" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          To connect, open the URL in your browser
        </Text>
      </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  qrCodeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  expiryText: {
    marginTop: 16,
    fontSize: 14,
    color: '#888',
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 1,
    width: '90%',
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  copyButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    elevation: 1,
  },
  actionButtonText: {
    marginLeft: 8,
    color: '#5c6bc0',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default QRCodeScreen;