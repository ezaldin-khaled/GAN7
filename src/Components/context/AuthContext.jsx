import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in when component mounts
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const token = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 Token found:', !!token);
      console.log('🔍 User data found:', !!userData);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 Parsed user data:', parsedUser);
        
        // Verify token is still valid by making a test API call
        try {
          const response = await axiosInstance.get('/api/profile/talent/');
          console.log('🔍 Token validation successful:', response.data);
          
          // Update user data with fresh data from server
          const updatedUser = {
            ...parsedUser,
            ...response.data
          };
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
          console.log('🔍 Token validation failed:', error.response?.status);
          
          // If token is invalid, clear auth data
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🔍 Clearing invalid auth data');
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // For other errors, keep the cached user data
            setUser(parsedUser);
          }
        }
      } else {
        console.log('🔍 No valid auth data found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log('🔍 Auth check complete, loading:', false);
    }
  };

  const login = (userData, token) => {
    console.log('🔐 Login called with:', { userData, token: !!token });
    localStorage.setItem('access', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('🔐 User logged in successfully');
  };

  const logout = () => {
    console.log('🚪 Logout called');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
    console.log('🚪 User logged out successfully');
  };

  const updateUser = (newUserData) => {
    console.log('🔄 Updating user data:', newUserData);
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