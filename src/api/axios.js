import axios from 'axios';
import api_config from './axios.config';

const axiosInstance = axios.create({
  baseURL: '',  // Use empty string to avoid overriding full URLs in requests
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: false, // Disable credentials for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      timeout: config.timeout
    });
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => {
    // Log successful response
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  error => {
    // Log error details
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        timeout: error.config?.timeout
      }
    });

    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      } else if (error.response.status === 409) {
        // Handle profile not found case
        console.error('Profile not found. Please create your profile first.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;