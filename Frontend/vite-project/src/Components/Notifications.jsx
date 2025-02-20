import React from 'react';
import styled from 'styled-components';
import { useNotifications } from '../context/notificationContext';
import { formatTimestamp, getNotificationIcon } from '../Utils/helper';

const NotificationContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding: 10px 0;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background-color: ${props => props.read ? 'transparent' : 'rgba(76, 132, 255, 0.05)'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
  min-width: 30px;
  text-align: center;
`;

const NotificationTitle = styled.h4`
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 500;
`;

const NotificationMessage = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: #999;
  display: block;
  margin-top: 5px;
`;

const AppBadge = styled.span`
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: #999;
  
  svg {
    margin-bottom: 10px;
    opacity: 0.5;
  }
  
  p {
    margin-top: 10px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
`;

const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

const Notifications = () => {
  const { notifications, markAsRead, clearNotifications } = useNotifications();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="card">
      <NotificationHeader>
        <h3>Notifications</h3>
        {notifications.length > 0 && (
          <ClearButton onClick={clearNotifications}>
            Clear All
          </ClearButton>
        )}
      </NotificationHeader>
      
      <NotificationContainer>
        {notifications.length === 0 ? (
          <EmptyState>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#999" strokeWidth="2"/>
              <path d="M8 15H16" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9H9.01" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 9H15.01" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No notifications yet</p>
          </EmptyState>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              read={notification.read}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationIcon>
                {getNotificationIcon(notification.type)}
              </NotificationIcon>
              <NotificationContent>
                <NotificationTitle>
                  {notification.title}
                  {notification.appName && (
                    <AppBadge>{notification.appName}</AppBadge>
                  )}
                </NotificationTitle>
                <NotificationMessage>
                  {notification.body}
                </NotificationMessage>
                <TimeStamp>{formatTimestamp(notification.timestamp)}</TimeStamp>
              </NotificationContent>
            </NotificationItem>
          ))
        )}
      </NotificationContainer>
    </div>
  );
};

export default Notifications;