import axios from 'axios';

// Use environment variable or fallback to production API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.gan7club.com';

// Debug logging to see what's happening
console.log('🔧 Axios Configuration Debug:');
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('API_BASE_URL resolved to:', API_BASE_URL);
console.log('Full baseURL will be:', `${API_BASE_URL}/api/`);

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
    
    // Log request for debugging
    console.log('🚀 Making request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      timeout: config.timeout,
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
    console.log('✅ Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url
    });
    return response;
  },
  error => {
    console.error('❌ Response error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 401) {
        // Clear auth data on unauthorized
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;