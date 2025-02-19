import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/authContext';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto 30px;
  line-height: 1.6;
`;

const FeatureSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-bottom: 60px;
`;

const Feature = styled.div`
  flex: 1;
  min-width: 250px;
  max-width: 350px;
  padding: 25px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 15px;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.5;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: #4C84FF;
  color: white;
  font-weight: 600;
  padding: 12px 25px;
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 16px;
  
  &:hover {
    background-color: #3a6fdb;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 132, 255, 0.3);
  }
`;

const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #4C84FF;
  }
`;

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Header>
        <Logo to="/">SmartConnect</Logo>
        <NavLinks>
          <NavLink to="/login">Login</NavLink>
        </NavLinks>
      </Header>
      
      <HomeContainer>
        <Hero>
          <Title>Keep Connected Across All Your Devices</Title>
          <Subtitle>
            SmartConnect seamlessly links your phone to your computer, 
            allowing you to receive notifications, calls, and messages 
            without switching between devices.
          </Subtitle>
          <CTAButton to="/login">Get Started</CTAButton>
        </Hero>
        
        <FeatureSection>
          <Feature>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>Instant Notifications</FeatureTitle>
            <FeatureDescription>
              Receive your phone's notifications directly on your computer, 
              including calls, texts, emails, and app alerts.
            </FeatureDescription>
          </Feature>
          
          <Feature>
            <FeatureIcon>🔐</FeatureIcon>
            <FeatureTitle>Secure Connection</FeatureTitle>
            <FeatureDescription>
              Connect securely with QR code scanning. Your data remains 
              encrypted and private at all times.
            </FeatureDescription>
          </Feature>
          
          <Feature>
            <FeatureIcon>⚙️</FeatureIcon>
            <FeatureTitle>Customizable Settings</FeatureTitle>
            <FeatureDescription>
              Choose which notifications you want to see. Customize app 
              by app for the perfect balance of information.
            </FeatureDescription>
          </Feature>
        </FeatureSection>
        
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
            Ready to stay connected?
          </h2>
          <CTAButton to="/login">Connect Your Phone Now</CTAButton>
        </div>
      </HomeContainer>
    </>
  );
};

export default Home;