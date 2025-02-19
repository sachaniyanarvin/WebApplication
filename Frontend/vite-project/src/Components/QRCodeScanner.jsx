import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import { useAuth } from '../context/authContext';
import { api } from '../utils/api';
import { generateSessionId } from '../utils/helpers';

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const QRCodeWrapper = styled.div`
  border: 2px solid #f0f0f0;
  padding: 15px;
  background-color: white;
  border-radius: 5px;
  margin-bottom: 15px;
`;

const InstructionText = styled.p`
  text-align: center;
  margin: 15px 0;
  color: #666;
  max-width: 300px;
`;

const StatusText = styled.p`
  text-align: center;
  margin-top: 15px;
  font-weight: 500;
  color: ${props => props.success ? '#4caf50' : props.error ? '#f44336' : '#2196f3'};
`;

const RefreshButton = styled.button`
  background: transparent;
  border: none;
  color: #4C84FF;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const QRCodeScanner = ({ onSessionCreated }) => {
  const { login } = useAuth();
  const [qrValue, setQrValue] = useState('');
  const [status, setStatus] = useState('generating');
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [tempSessionId, setTempSessionId] = useState(null);

  const generateQRCode = async () => {
    try {
      setStatus('generating');
      setError(null);
      
      // Clear any existing polling
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      
      // Generate temporary session ID
      const newTempSessionId = generateSessionId();
      setTempSessionId(newTempSessionId);
      
      // Get QR code from server
      const response = await api.post('/auth/generate-qr', {
        tempSessionId: newTempSessionId
      });
      
      if (response.data.qrData) {
        setQrValue(response.data.qrData);
        setStatus('waiting');
        
        // Start polling for authentication status
        const interval = setInterval(() => checkAuthStatus(newTempSessionId), 2000);
        setPollingInterval(interval);
      } else {
        setError('Failed to generate QR code');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('An error occurred. Please try again.');
      setStatus('error');
    }
  };

  const checkAuthStatus = async (sessionIdToCheck) => {
    try {
      const response = await api.get(`/auth/check-qr-status?tempSessionId=${sessionIdToCheck}`);
      
      if (response.data.status === 'authenticated') {
        // Stop polling
        clearInterval(pollingInterval);
        setStatus('success');
        
        // Login with session data
        await login(response.data.sessionData);
        
        // Notify parent component
        if (onSessionCreated) {
          onSessionCreated(response.data.sessionData);
        }
      } else if (response.data.status === 'expired') {
        clearInterval(pollingInterval);
        setError('QR code expired. Please refresh.');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    }
  };

  // Initialize QR code on component mount
  useEffect(() => {
    generateQRCode();
    
    // Cleanup polling interval on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  return (
    <QRCodeContainer>
      <h3>Connect Your Phone</h3>
      <InstructionText>
        Scan this QR code with your phone to connect it to this computer
      </InstructionText>
      
      {status === 'generating' && <p>Generating QR code...</p>}
      
      {status === 'waiting' && (
        <QRCodeWrapper>
          <QRCode value={qrValue} size={200} />
        </QRCodeWrapper>
      )}
      
      {status === 'waiting' && (
        <StatusText>Waiting for phone connection...</StatusText>
      )}
      
      {status === 'success' && (
        <StatusText success>
          Connected successfully! Redirecting...
        </StatusText>
      )}
      
      {status === 'error' && (
        <>
          <StatusText error>{error}</StatusText>
          <RefreshButton onClick={generateQRCode}>
            Refresh QR Code
          </RefreshButton>
        </>
      )}
    </QRCodeContainer>
  );
};

export default QRCodeScanner;