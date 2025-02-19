import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/authContext';
import { useNotifications } from '../context/notificationContext';
import Notifications from '../components/Notifications';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
`;

const Logo = styled.div`
  padding: 20px;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
`;

const NavItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const NavItem = styled.li`
  a {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    color: #666;
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f7f7f7;
      color: #4C84FF;
    }
    
    &.active {
      background-color: #f0f7ff;
      color: #4C84FF;
      font-weight: 500;
      border-left: 3px solid #4C84FF;
    }
    
    svg {
      margin-right: 10px;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
  color: #666;
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
  
  p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  p:first-child {
    font-weight: 500;
  }
  
  p:last-child {
    font-size: 12px;
    color: #999;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  
  &:hover {
    color: #f44336;
  }
`;

const Content = styled.div`
  flex: 1;
  margin-left: 240px;
  padding: 20px;
  background-color: #f7f9fc;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  color: #333;
`;

const DeviceStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  background-color: ${props => props.connected ? '#e7f7ed' : '#ffe0e0'};
  color: ${props => props.connected ? '#129a4a' : '#d73a49'};
  padding: 6px 12px;
  border-radius: 50px;
  
  svg {
    margin-right: 5px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const StatValue = styled.h2`
  font-size: 28px;
  color: #333;
  margin-bottom: 5px;
`;

const StatChange = styled.span`
  font-size: 12px;
  color: ${props => props.positive ? '#129a4a' : '#d73a49'};
`;

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const { notifications } = useNotifications();
  
  const [deviceConnected, setDeviceConnected] = useState(false);
  
  useEffect(() => {
    // Check device connection status when notifications are updated
    if (currentUser) {
      setDeviceConnected(currentUser.deviceConnected || false);
    }
  }, [currentUser, notifications]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <Logo>SmartConnect</Logo>
        <NavItems>
          <NavItem>
            <Link to="/dashboard" className="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Settings
            </Link>
          </NavItem>
        </NavItems>
        
        <UserSection>
          <UserAvatar>
            {getInitials(currentUser?.name)}
          </UserAvatar>
          <UserInfo>
            <p>{currentUser?.name || 'User'}</p>
            <p>{currentUser?.deviceName || 'No device'}</p>
          </UserInfo>
          <LogoutButton onClick={logout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </LogoutButton>
        </UserSection>
      </Sidebar>
      
      <Content>
        <Header>
          <PageTitle>Dashboard</PageTitle>
          <DeviceStatus connected={deviceConnected}>
            {deviceConnected ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Device Connected
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Device Disconnected
              </>
            )}
          </DeviceStatus>
        </Header>
        
        <StatsGrid>
          <StatCard>
            <StatTitle>Total Notifications</StatTitle>
            <StatValue>{notifications.length}</StatValue>
            <StatChange positive>+12% from last week</StatChange>
          </StatCard>
          
          <StatCard>
            <StatTitle>Unread Notifications</StatTitle>
            <StatValue>
              {notifications.filter(n => !n.read).length}
            </StatValue>
            <StatChange>-3% from last week</StatChange>
          </StatCard>
          
          <StatCard>
            <StatTitle>Connected Apps</StatTitle>
            <StatValue>
              {currentUser?.installedApps?.length || 0}
            </StatValue>
            <StatChange positive>+2 new apps</StatChange>
          </StatCard>
          
          <StatCard>
            <StatTitle>Last Connected</StatTitle>
            <StatValue style={{ fontSize: '18px' }}>
              {currentUser?.lastConnected ? 
                new Date(currentUser.lastConnected).toLocaleString() : 
                'Never'}
            </StatValue>
          </StatCard>
        </StatsGrid>
        
        <Notifications />
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;