import axios from 'axios';

// Use environment variable or fallback to production API
// Temporarily hardcode the correct URL to bypass env var caching issue
const API_BASE_URL = 'https://api.gan7club.com';

// Debug logging to see what's happening
console.log('🔧 Axios Configuration Debug:');
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('API_BASE_URL resolved to:', API_BASE_URL);
console.log('Full baseURL will be:', `${API_BASE_URL}/api/`);

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Function to fetch CSRF token from Django
const fetchCSRFToken = async () => {
  try {
    // Try multiple endpoints to get CSRF token
    const endpoints = [
      '/csrf/',
      '/api/csrf/',
      '/admin/',  // Django admin usually sets CSRF token
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔒 Trying to get CSRF token from: ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json, text/html, */*',
          }
        });
        
        if (response.ok) {
          // Check if response is JSON and contains csrfToken
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.csrfToken) {
              console.log('🔒 CSRF token found in JSON response');
              return data.csrfToken;
            }
          }
          
          // Check if CSRF token was set in cookies after the request
          const csrfFromCookie = getCSRFToken();
          if (csrfFromCookie) {
            console.log('🔒 CSRF token found in cookie after request');
            return csrfFromCookie;
          }
        }
      } catch (err) {
        console.log(`🔒 Failed to get CSRF token from ${endpoint}:`, err.message);
        continue;
      }
    }
  } catch (error) {
    console.warn('Could not fetch CSRF token:', error.message);
  }
  return null;
};

// Create a clean axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,  // Remove /api/ suffix to avoid double prefix
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Enable credentials for CSRF cookies
});

// Request interceptor for logging and token handling
axiosInstance.interceptors.request.use(
  async config => {
    // Add auth token if available
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      let csrfToken = getCSRFToken();
      
      // If no CSRF token in cookies, try to fetch one
      if (!csrfToken) {
        console.log('🔒 No CSRF token found, fetching from server...');
        csrfToken = await fetchCSRFToken();
        if (csrfToken) {
          // Set the token in cookie for future requests
          document.cookie = `csrftoken=${csrfToken}; path=/; SameSite=Lax`;
          console.log('🔒 CSRF token set in cookie');
        }
      }
      
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
        console.log('🔒 Added CSRF token to request headers');
      } else {
        console.warn('⚠️ Could not obtain CSRF token');
      }
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

// Export the configured axios instance with CSRF support
export default axiosInstance;

// Initialize CSRF token on app startup
export const initializeCSRFToken = async () => {
  console.log('🔒 Initializing CSRF token...');
  const token = await fetchCSRFToken();
  if (token) {
    console.log('🔒 CSRF token initialized successfully');
  } else {
    console.warn('⚠️ Could not initialize CSRF token');
  }
  return token;
};

// Export helper functions for manual CSRF token management
export { getCSRFToken, fetchCSRFToken };