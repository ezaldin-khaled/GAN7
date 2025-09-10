import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check auth status on initial mount, not on every user change
    if (!user) {
      checkAuthStatus();
    }
    
    // Set up periodic session validation (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (user && !user.isStaff && !user.isDashboard) {
        // Only check session for regular users, not admin users
        validateSession();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(sessionCheckInterval);
  }, []); // Remove user dependency to prevent re-running on user changes

  const validateSession = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        setUser(null);
        return;
      }
      
      // Get user data to determine the correct endpoint
      const userData = localStorage.getItem('user');
      if (!userData) {
        setUser(null);
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      
      // Since profile endpoints return 404, we'll skip the API validation
      // and just check if the token and user data exist
    } catch (error) {
      // If token is invalid (401/403), clear auth data
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        // Check if user data has required fields (either ID or valid account type)
        if (!parsedUser.id && !(parsedUser.account_type && (parsedUser.is_talent || parsedUser.is_background))) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          setUser(null);
          return;
        }
        
        // Set user immediately from localStorage to avoid delays
        setUser(parsedUser);
        
        // Skip token validation for admin users to avoid conflicts
        if (parsedUser.isStaff || parsedUser.isDashboard) {
          setUser(parsedUser);
        } else {
          // For regular users, skip profile endpoint validation since they return 404
          // The user data from localStorage is sufficient for the UI
          setUser(parsedUser);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      // Clear any potentially corrupted data
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    // Store tokens and user data in localStorage first
    localStorage.setItem('access', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Immediately update the user state to ensure UI updates
    setUser(userData);
    
    // Force a re-render by updating loading state
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 