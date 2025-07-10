import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in when component mounts
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      console.log('🔍 Checking auth status...');
      const token = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 Token found:', !!token);
      console.log('🔍 User data found:', !!userData);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 Parsed user data:', parsedUser);
        setUser(parsedUser);
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