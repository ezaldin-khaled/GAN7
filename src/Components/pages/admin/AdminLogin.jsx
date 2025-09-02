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
        admin_login: "true"
      });

      const response = await axiosInstance.post('/api/admin/login/', {
        email: credentials.email,
        password: credentials.password,
        admin_login: "true"
      });

      const data = response.data;
      console.log('Login response:', data);
      console.log('=== DETAILED LOGIN RESPONSE ===');
      console.log('is_dashboard:', data.is_dashboard);
      console.log('is_staff:', data.is_staff);
      console.log('access token exists:', !!data.access);
      console.log('refresh token exists:', !!data.refresh);
      console.log('email:', data.email);
      console.log('first_name:', data.first_name);
      console.log('last_name:', data.last_name);
      console.log('is_talent:', data.is_talent);
      console.log('is_background:', data.is_background);
      console.log('email_verified:', data.email_verified);
      console.log('=== END LOGIN RESPONSE ===');

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
      const userInfo = {
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        isTalent: data.is_talent,
        isBackground: data.is_background,
        isDashboard: data.is_dashboard,
        isDashboardAdmin: data.is_dashboard_admin,
        isStaff: data.is_staff,
        emailVerified: data.email_verified
      };
      
      console.log('=== STORING USER INFO ===');
      console.log('User info to store:', userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Set admin login flag for protected routes
      // Both staff users and dashboard users should have admin access
      if (data.is_staff === true || data.is_dashboard === true || data.is_dashboard_admin === true) {
        localStorage.setItem('adminLoggedIn', 'true');
        console.log('Set adminLoggedIn flag to true (user is admin/dashboard user)');
      } else {
        console.log('User is not admin/dashboard user, adminLoggedIn flag not set');
      }

      // Show email verification warning if needed
      if (!data.email_verified && data.message) {
        console.warn('Email verification warning:', data.message);
      }

      // Redirect based on user type
      console.log('=== REDIRECT DECISION ===');
      console.log('data.is_staff:', data.is_staff);
      console.log('data.is_dashboard:', data.is_dashboard);
      console.log('data.is_dashboard_admin:', data.is_dashboard_admin);
      
      // Check if user should go to admin dashboard
      // Admin users can have is_staff: true OR is_dashboard: true OR is_dashboard_admin: true
      const isAdminUser = data.is_staff === true || data.is_dashboard === true || data.is_dashboard_admin === true;
      
      console.log('=== ADMIN DETECTION LOGIC ===');
      console.log('data.is_staff === true:', data.is_staff === true);
      console.log('data.is_dashboard === true:', data.is_dashboard === true);
      console.log('data.is_dashboard_admin === true:', data.is_dashboard_admin === true);
      console.log('Final isAdminUser result:', isAdminUser);
      
      if (isAdminUser) {
        // Admin user - go to admin dashboard
        console.log('Admin login successful, redirecting to admin dashboard');
        console.log('Current location before redirect:', window.location.href);
        console.log('Navigating to /admin/dashboard');
        navigate('/admin/dashboard');
        console.log('Navigate called for admin dashboard');
      } else {
        // Regular user - go to regular dashboard
        console.log('Regular user login successful, redirecting to dashboard');
        console.log('Current location before redirect:', window.location.href);
        console.log('Navigating to /dashboard');
        navigate('/dashboard');
        console.log('Navigate called for regular dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error status text:', err.response?.statusText);
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
        setError(`Login failed (${err.response?.status}): ${JSON.stringify(data) || 'Invalid credentials'}`);
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
        
        {/* Debug Info */}
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          margin: '10px 0', 
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong><br/>
          Current URL: {window.location.href}<br/>
          User Agent: {navigator.userAgent}<br/>
          React Router Version: {React.version}
        </div>
        
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