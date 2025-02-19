jsx
// pages/Setting.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/authContext';
import SettingsComponent from '../components/Settings';

const SettingsContainer = styled.div`
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
  }
`;

const Content = styled.div`
  flex: 1;
  margin-left: 240px;
  padding: 20px;
  background-color: #f7f9fc;
`;

const Settings = () => {
  return (
    <SettingsContainer>
      <Sidebar>
        <Logo>SmartConnect</Logo>
        <NavItems>
          <NavItem>
            <Link to="/dashboard">Dashboard</Link>
          </NavItem>
          <NavItem>
            <Link to="/settings" className="active">Settings</Link>
          </NavItem>
        </NavItems>
      </Sidebar>
      
      <Content>
        <SettingsComponent />
      </Content>
    </SettingsContainer>
  );
};

export default Settings;