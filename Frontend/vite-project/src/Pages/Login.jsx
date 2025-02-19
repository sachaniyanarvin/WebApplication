import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import QRCodeScanner from '../components/QRCodeScanner';
import { useAuth } from '../context/authContext';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f9fc;
  padding: 20px;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
`;

const Divider = styled.div`
  border-top: 1px solid #eee;
  margin: 20px 0;
  position: relative;
  
  &::after {
    content: 'or';
    background: white;
    padding: 0 10px;
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    color: #999;
  }
`;

const ManualLoginButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e1e1e1;
  }
`;

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSessionCreated = () => {
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500); // Short delay to show success message before redirecting
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>Connect to SmartConnect</Title>
        <Subtitle>Scan the QR code with your phone to connect</Subtitle>
        
        <QRCodeScanner onSessionCreated={handleSessionCreated} />
        
        <Divider />
        
        <ManualLoginButton>
          Log in with username and password
        </ManualLoginButton>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;