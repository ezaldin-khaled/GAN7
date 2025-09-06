import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

/**
 * Example component demonstrating how to use the Dashboard Analytics API
 * This shows the basic implementation without the custom hook
 */
const AnalyticsExample = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/api/dashboard/analytics/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (status === 403) {
          setError('You do not have permission to view analytics data.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(data?.error || data?.detail || 'Failed to fetch analytics data');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleAnalyticsError = (error) => {
    if (error.status === 401) {
      // Redirect to login
      window.location.href = '/admin/login';
    } else if (error.status === 403) {
      // Show permission denied message
      alert('You do not have permission to view analytics');
    } else {
      // Show generic error message
      alert('Failed to load analytics data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Error Loading Analytics</h3>
        <p>{error}</p>
        <button onClick={fetchAnalytics}>Try Again</button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No analytics data available.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard Analytics Example</h2>
      <p>This is a basic example of fetching analytics data directly from the API.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Total Users</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.total_users?.toLocaleString()}</p>
          <small>+{analytics.users_this_week} this week</small>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Total Media Items</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.total_media_items?.toLocaleString()}</p>
          <small>Content uploaded</small>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Active Users</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.active_users?.toLocaleString()}</p>
          <small>Last 24 hours</small>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Total Revenue</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            ${analytics.total_revenue?.toLocaleString()}
          </p>
          <small>${analytics.revenue_this_month?.toLocaleString()} this month</small>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Raw API Response</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px', 
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(analytics, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AnalyticsExample;
