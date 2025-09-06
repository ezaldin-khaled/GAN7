import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

/**
 * Custom hook for fetching dashboard analytics data
 * Provides loading state, error handling, and data management
 */
const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching analytics data...');
      
      const response = await axiosInstance.get('/api/dashboard/analytics/');
      
      console.log('✅ Analytics data received:', response.data);
      setAnalytics(response.data);
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      
      // Handle specific error cases
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

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics
  };
};

export default useAnalytics;
