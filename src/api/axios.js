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
      console.log('🔑 Adding auth token to request:', config.url);
    } else {
      console.warn('⚠️ No auth token found for request:', config.url);
    }
    
    // Log request details for debugging
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasAuth: !!config.headers.Authorization,
      headers: config.headers
    });
    
    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 401) {
        console.log('🔓 401 Unauthorized - clearing auth data');
        // Clear auth data on unauthorized
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        console.log('🚫 403 Forbidden - checking token validity');
        // Check if token exists and is valid
        const token = localStorage.getItem('access');
        if (!token) {
          console.log('❌ No token found - redirecting to login');
          window.location.href = '/login';
        } else {
          console.log('⚠️ Token exists but access forbidden - may need refresh');
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            console.log('🔄 Attempting token refresh...');
            // Token refresh will be handled by the calling component
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;