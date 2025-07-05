import axios from 'axios';

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

const api_config = axios.create({
    baseURL: 'https://api.gan7club.com/api/',  // Backend server IP
    CSRF_TRUSTED_ORIGINS: [
        "https://gan7club.com",
        "https://www.gan7club.com"
    ],
    timeout: 10000, // Increased timeout for debugging
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