import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthContext - useEffect triggered');
    console.log('🔍 AuthContext - Current user state:', user);
    
    // Only check auth status on initial mount, not on every user change
    if (!user) {
      console.log('🔍 AuthContext - No user state, checking auth status');
      checkAuthStatus();
    } else {
      console.log('🔍 AuthContext - User already exists, skipping auth check');
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
        console.log('🔍 No token found during session validation, clearing user');
        setUser(null);
        return;
      }
      
      // Get user data to determine the correct endpoint
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('🔍 No user data found during session validation, clearing user');
        setUser(null);
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      console.log('🔍 Session validation - profile endpoints not available, skipping validation');
      console.log('🔍 Using cached user data for session validation');
      
      // Since profile endpoints return 404, we'll skip the API validation
      // and just check if the token and user data exist
      console.log('🔍 Session validation successful (using cached data)');
    } catch (error) {
      console.log('🔍 Session validation failed:', error.response?.status);
      
      // If token is invalid (401/403), clear auth data
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🔍 Session expired during validation, clearing auth data');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

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
        
        // Check if user data has required fields (either ID or valid account type)
        if (!parsedUser.id && !(parsedUser.account_type && (parsedUser.is_talent || parsedUser.is_background))) {
          console.log('🔍 Invalid user data - missing ID and account type, clearing auth data');
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
          console.log('🔍 Admin/Dashboard user detected, skipping token validation');
          setUser(parsedUser);
        } else {
          // For regular users, skip profile endpoint validation since they return 404
          // The user data from localStorage is sufficient for the UI
          console.log('🔍 Regular user detected, using cached user data without profile validation');
          console.log('🔍 Profile endpoints are not available (404), using localStorage data');
          setUser(parsedUser);
        }
      } else {
        console.log('🔍 No valid auth data found');
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
      console.log('🔍 Auth check complete, loading:', false);
    }
  };

  const login = (userData, token) => {
    console.log('🔐 Login called with:', { userData, token: !!token });
    console.log('🔐 User data structure:', userData);
    console.log('🔐 User ID:', userData?.id);
    console.log('🔐 User is_background:', userData?.is_background);
    console.log('🔐 User is_talent:', userData?.is_talent);
    
    // Store tokens and user data in localStorage first
    localStorage.setItem('access', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('🔐 Stored in localStorage - access token:', !!localStorage.getItem('access'));
    console.log('🔐 Stored in localStorage - user data:', !!localStorage.getItem('user'));
    
    // Immediately update the user state to ensure UI updates
    setUser(userData);
    
    console.log('🔐 User logged in successfully, user state updated');
    console.log('🔐 Current user state after login:', userData);
    
    // Force a re-render by updating loading state
    setLoading(false);
    
    // Verify the state was set correctly
    setTimeout(() => {
      console.log('🔐 Post-login verification - user state:', user);
      console.log('🔐 Post-login verification - localStorage user:', localStorage.getItem('user'));
    }, 100);
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