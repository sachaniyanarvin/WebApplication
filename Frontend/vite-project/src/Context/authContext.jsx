import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || null);

  useEffect(() => {
    // Check if user is authenticated on load
    const checkAuth = async () => {
      if (sessionId) {
        try {
          const response = await api.get('/auth/check-session', {
            headers: {
              'Session-ID': sessionId
            }
          });
          
          if (response.data.authenticated) {
            setCurrentUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Session expired or invalid
            logout();
          }
        } catch (error) {
          console.error('Authentication check failed', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [sessionId]);

  const login = async (sessionData) => {
    setSessionId(sessionData.sessionId);
    setCurrentUser(sessionData.user);
    setIsAuthenticated(true);
    localStorage.setItem('sessionId', sessionData.sessionId);
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await api.post('/auth/logout', {}, {
          headers: {
            'Session-ID': sessionId
          }
        });
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setSessionId(null);
      localStorage.removeItem('sessionId');
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    sessionId,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};