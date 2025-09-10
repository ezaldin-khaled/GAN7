import axios from 'axios';

// Use environment variable or fallback to production API
// Temporarily hardcode the correct URL to bypass env var caching issue
const API_BASE_URL = 'https://api.gan7club.com';

// Axios configuration for API requests

// Create a clean axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,  // Remove /api/ suffix to avoid double prefix
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for logging and token handling
axiosInstance.interceptors.request.use(
  config => {
    // Add auth token if available
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle multipart form data properly
    if (config.data instanceof FormData) {
      // Don't set Content-Type for FormData - let browser set it with boundary
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 401) {
        // Clear auth data on unauthorized
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        // Check if token exists and is valid
        const token = localStorage.getItem('access');
        if (!token) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;