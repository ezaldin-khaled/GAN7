import axios from 'axios';

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

// Use environment variable or fallback to production API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.gan7club.com';

const api_config = axios.create({
    baseURL: `${API_BASE_URL}/api/`,  // Use environment variable
    CSRF_TRUSTED_ORIGINS: [
        "https://gan7club.com",
        "https://www.gan7club.com",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    timeout: 30000, // Increased timeout for production
    headers: DEFAULT_HEADERS
});

// Add request interceptor to include credentials
api_config.interceptors.request.use((config) => {
    config.withCredentials = true;
    console.log('Making request to:', config.baseURL + config.url);
    return config;
});

// Add response interceptor for debugging
api_config.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('Request failed:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export { DEFAULT_HEADERS };
export default api_config;