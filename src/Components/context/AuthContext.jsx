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
        
        // 1. First validate token matches user data
        if (!validateTokenMatch(token, parsedUser)) {
          console.error('❌ Token mismatch detected during auth check');
          console.log('🧹 Clearing mismatched auth data...');
          localStorage.clear();
          setUser(null);
          return;
        }
        
        // 2. Set user immediately from localStorage to avoid delays
        setUser(parsedUser);
        
        // 3. Try to verify token is still valid by making a test API call
        try {
          const response = await axiosInstance.get('/api/profile/talent/');
          console.log('🔍 Token validation successful:', response.data);
          
          // 4. Update user data with fresh data from server
          const updatedUser = {
            ...parsedUser,
            ...response.data
          };
          
          // 5. Validate the updated user data still matches token
          if (!validateTokenMatch(token, updatedUser)) {
            console.error('❌ Token mismatch after profile update');
            console.log('🧹 Clearing mismatched auth data...');
            localStorage.clear();
            setUser(null);
            return;
          }
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
          console.log('🔍 Token validation failed:', error.response?.status);
          
          // If token is invalid (401/403), clear auth data
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🔍 Clearing invalid auth data');
            localStorage.clear();
            setUser(null);
          } else {
            // For other errors (network, server issues), keep the cached user data
            console.log('🔍 Keeping cached user data due to non-auth error');
            // User is already set from localStorage above
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

  // Token validation function
  const validateTokenMatch = (token, userData) => {
    if (!token || !userData) return false;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const tokenUserId = payload.user_id;
        const currentUserId = userData.id;
        
        console.log('🔍 Token validation - Token user ID:', tokenUserId, 'Current user ID:', currentUserId);
        
        if (tokenUserId !== currentUserId) {
          console.error('❌ Token mismatch detected!');
          console.error('❌ Token user ID:', tokenUserId);
          console.error('❌ Current user ID:', currentUserId);
          return false;
        }
        
        console.log('✅ Token validation passed');
        return true;
      }
    } catch (e) {
      console.error('❌ Error validating token:', e);
      return false;
    }
    
    return false;
  };

  const login = (userData, token) => {
    console.log('🔐 Login called with:', { userData, token: !!token });
    
    // 1. Clear all previous data first (prevent mismatches)
    console.log('🧹 Clearing previous auth data...');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('is_talent');
    
    // 2. Validate token matches user data before storing
    if (!validateTokenMatch(token, userData)) {
      console.error('❌ Token validation failed during login');
      alert('Authentication error: Token does not match user data. Please try logging in again.');
      return false;
    }
    
    // 3. Set both token AND user data together
    localStorage.setItem('access', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 4. Set additional flags if available
    if (userData.is_talent !== undefined) {
      localStorage.setItem('is_talent', userData.is_talent.toString());
    }
    
    setUser(userData);
    console.log('🔐 User logged in successfully with validated token');
    return true;
  };

  const logout = () => {
    console.log('🚪 Logout called');
    
    // Clear EVERYTHING to prevent future mismatches
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    
    console.log('🚪 User logged out successfully - all data cleared');
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
    checkAuthStatus,
    validateTokenMatch: () => {
      const token = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        return validateTokenMatch(token, JSON.parse(userData));
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 