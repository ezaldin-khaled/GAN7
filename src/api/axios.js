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

// Token refresh function
const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem('refresh');
    if (!refreshTokenValue) {
      throw new Error('No refresh token found');
    }
    
    console.log('🔄 Attempting token refresh...');
    const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
      refresh: refreshTokenValue
    });
    
    const { access } = response.data;
    localStorage.setItem('access', access);
    console.log('✅ Token refreshed successfully');
    return access;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  }
};

// Response interceptor for error handling with token refresh
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 401) {
        // Clear auth data on unauthorized
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      } else if (error.response.status === 403 && !originalRequest._retry) {
        // Check if this is a token validation error
        const errorDetail = error.response.data?.detail;
        if (errorDetail === 'Given token not valid for any token type' || 
            errorDetail === 'Token is invalid or expired') {
          
          originalRequest._retry = true;
          
          try {
            console.log('🔄 Token invalid, attempting refresh...');
            await refreshToken();
            
            // Retry the original request with new token
            const newToken = localStorage.getItem('access');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed, redirecting to login');
            return Promise.reject(refreshError);
          }
        } else {
          // Other 403 errors (permission denied, etc.)
          console.log('❌ 403 Forbidden - Permission denied');
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;