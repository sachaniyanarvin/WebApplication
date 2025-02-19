import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSessionId } from '../utils/helpers';

const { width } = Dimensions.get('window');

const QRCodeGenerator = ({ onQRGenerated }) => {
  const [qrValue, setQrValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    generateQRData();
  }, []);

  const generateQRData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get user ID
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }
      
      // Generate a unique session ID
      const sessionId = generateSessionId();
      
      // Create device info
      const deviceInfo = {
        platform: Platform.OS,
        model: Platform.constants.Model || 'Unknown',
        manufacturer: Platform.constants.Manufacturer || 'Unknown',
        name: Platform.constants.Brand || 'Mobile Device'
      };
      
      // Create QR data object
      const qrData = {
        userId,
        sessionId,
        timestamp: new Date().getTime(),
        deviceInfo
      };
      
      // Stringify and encode QR data
      const qrString = JSON.stringify(qrData);
      const encodedQrString = encodeURIComponent(qrString);
      
      setQrValue(encodedQrString);
      
      if (onQRGenerated) {
        onQRGenerated(qrData);
      }
    } catch (error) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Generating QR Code...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.text}>
          Please make sure you're logged in and try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        {qrValue ? (
          <QRCode
            value={qrValue}
            size={width * 0.7}
            backgroundColor="white"
            color="black"
          />
        ) : (
          <Text style={styles.errorText}>Failed to generate QR code</Text>
        )}
      </View>
      <Text style={styles.instructionText}>
        Scan this QR code with your laptop/desktop to connect devices
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    paddingHorizontal: 20,
  },
});

export default QRCodeGenerator;