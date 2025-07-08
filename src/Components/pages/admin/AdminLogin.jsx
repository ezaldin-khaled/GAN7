import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import './AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', {
        email: credentials.email,
        admin_login: true
      });

      const response = await axiosInstance.post('/admin/login/', {
        email: credentials.email,
        password: credentials.password,
        admin_login: true
      });

      const data = response.data;
      console.log('Login response:', data);

      // Check for required flags
      if (!data.is_dashboard) {
        setError('This account is not registered as a Dashboard user');
        return;
      }
      if (!data.access) {
        setError('No access token received');
        return;
      }

      // Store tokens in localStorage
      localStorage.setItem('access', data.access);
      if (data.refresh) {
        localStorage.setItem('refresh', data.refresh);
      }

      // Store user info
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        isTalent: data.is_talent,
        isBackground: data.is_background,
        isDashboard: data.is_dashboard,
        isStaff: data.is_staff,
        emailVerified: data.email_verified
      }));

      // Set admin login flag for protected routes
      if (data.is_staff) {
        localStorage.setItem('adminLoggedIn', 'true');
      }

      // Show email verification warning if needed
      if (!data.email_verified && data.message) {
        console.warn('Email verification warning:', data.message);
      }

      // Redirect based on user type
      if (data.is_staff) {
        // Admin user - go to admin dashboard
        console.log('Admin login successful, redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else {
        // Regular dashboard user - go to regular dashboard
        console.log('Dashboard login successful, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const data = err.response?.data;
      
      // Handle different types of errors
      if (data?.detail) {
        setError(data.detail);
      } else if (data?.message) {
        setError(data.message);
      } else if (data?.email) {
        setError(data.email[0]);
      } else if (data?.password) {
        setError(data.password[0]);
      } else if (data?.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>Dashboard Login</h1>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="button-spinner"></div>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 