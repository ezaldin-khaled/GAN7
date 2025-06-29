import axios from './axios';

const API_URL = 'http://192.168.0.104:8000/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get talent profiles with media included in the response
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.profile_type - Profile type (default: 'talent')
 * @param {string} searchParams.city - City filter
 * @param {string} searchParams.country - Country filter
 * @param {number} searchParams.page_size - Number of results per page
 * @param {number} searchParams.page - Page number
 * @param {string} searchParams.query - Search query
 * @param {string} searchParams.sort_by - Sort field
 * @param {string} searchParams.sort_order - Sort order (asc/desc)
 * @returns {Promise<Object>} Object containing talentResults and shareableMedia
 */
export const getTalentWithMedia = async (searchParams = {}) => {
  try {
    const params = {
      profile_type: 'talent',
      include_media: 'true',
      page_size: 20,
      ...searchParams
    };
    
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/api/dashboard/search/?${queryString}`);
    
    if (!response.data.success) {
      throw new Error('Search failed: ' + (response.data.error || 'Unknown error'));
    }
    
    const results = response.data.results || [];
    
    // Extract shareable media (exclude test videos)
    const shareableMedia = results.flatMap(talent => 
      talent.media_items?.filter(media => 
        !media.is_test_video && !media.is_about_yourself_video
      ) || []
    );
    
    return {
      talentResults: results,
      shareableMedia: shareableMedia,
      totalCount: response.data.count,
      success: true
    };
  } catch (error) {
    console.error('Error fetching talent with media:', error);
    return {
      talentResults: [],
      shareableMedia: [],
      totalCount: 0,
      success: false,
      error: error.message
    };
  }
};

/**
 * Extract shareable media from search results
 * @param {Array} results - Search results array
 * @returns {Array} Array of shareable media items
 */
export const extractShareableMedia = (results) => {
  return results.flatMap(result => 
    result.media_items?.filter(media => 
      !media.is_test_video && !media.is_about_yourself_video
    ) || []
  );
};

/**
 * Search for any profile type with media included
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} Search results with media
 */
export const searchWithMedia = async (searchParams = {}) => {
  try {
    const params = {
      include_media: 'true',
      page_size: 20,
      ...searchParams
    };
    
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/api/dashboard/search/?${queryString}`);
    
    if (!response.data.success) {
      throw new Error('Search failed: ' + (response.data.error || 'Unknown error'));
    }
    
    const results = response.data.results || [];
    
    // Extract shareable media for all profile types
    const shareableMedia = results.flatMap(result => 
      result.media_items?.filter(media => 
        !media.is_test_video && !media.is_about_yourself_video
      ) || []
    );
    
    return {
      results: results,
      shareableMedia: shareableMedia,
      totalCount: response.data.count,
      success: true
    };
  } catch (error) {
    console.error('Error searching with media:', error);
    return {
      results: [],
      shareableMedia: [],
      totalCount: 0,
      success: false,
      error: error.message
    };
  }
}; 