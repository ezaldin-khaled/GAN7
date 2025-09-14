/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import './UserAccountPage.css';
import './EnhancedTabStyles.css'; // Import the enhanced styles
import axiosInstance from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';
import ProfileTab from './components/ProfileTab';
import MediaTab from './components/MediaTab';
import BillingTab from './components/BillingTab';
import GroupsTab from './components/GroupsTab';
import SettingsTab from './components/SettingsTab';
import SecurityTab from './components/SecurityTab';
import SpecializationTab from './components/SpecializationTab';
import Loader from '../../common/Loader';

const tabs = [
  { label: 'Profile', component: ProfileTab },
  { label: 'Media', component: MediaTab },
  { label: 'Billing', component: BillingTab },
  { label: 'Groups', component: GroupsTab },
  { label: 'Settings', component: SettingsTab },
  { label: 'Security', component: SecurityTab },
  { label: 'specializations', component: SpecializationTab }
];

const UserAccountPage = () => {
  const { user: authUser, updateUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    fullName: '', email: '', role: '', location: '',
    gender: '', dateOfBirth: '', country: '', phoneNumber: '',
    bio: '', groups: [], joinedGroups: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const navigate = useNavigate();

  // Add this useEffect to handle tab close/refresh
  useEffect(() => {
    const handleTabClose = () => {
      localStorage.removeItem('token');
      return null;
    };

    window.addEventListener('beforeunload', handleTabClose);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  // Enhanced token refresh function
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh');
      if (!refreshTokenValue) {
        throw new Error('No refresh token found');
      }
      
      console.log('🔄 Attempting token refresh...');
      const response = await axiosInstance.post('/api/token/refresh/', {
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

  // Enhanced API call with automatic token refresh
  const apiCallWithRefresh = async (apiCall) => {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('🔄 API call failed with auth error, attempting token refresh...');
        try {
          await refreshToken();
          // Retry the original API call with new token
          return await apiCall();
        } catch (refreshError) {
          console.error('❌ Token refresh failed, redirecting to login');
          throw refreshError;
        }
      }
      throw error;
    }
  };

  // Fetch user data on component mount with retry mechanism
  useEffect(() => {
    // Add these constants at the top of the file, after the imports
    const ROLES = {
      TALENT: 'talent',
      BACKGROUND: 'background'
    };
    
    const ROLE_ENDPOINTS = {
      [ROLES.TALENT]: 'profile/talent/',
      [ROLES.BACKGROUND]: 'profile/background/',
      DEFAULT: 'profile/'
    };

    const VALIDATE_ROLE = (userInfo) => {
      const role = (userInfo.role || userInfo.user_type || '').toLowerCase();
      return Object.values(ROLES).includes(role) ? role : null;
    };
    
    // Update the fetchUserData function inside useEffect
    // Update the fetchUserData function to use the correct endpoints based on the login response
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Parse user info from localStorage, including is_talent flag
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('access');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Define all possible endpoint variations to try
        // Update the endpoints array in the fetchUserData function
        const endpoints = [
        'api/profile/talent/',
        'api/profile/background/',
        ];
        
        // Remove these lines since these endpoints don't exist according to the error
        // if (userInfo.is_talent) {
        //   endpoints.unshift('api/talent/me/', 'api/talent/profile/');
        // } else if (userInfo.is_background) {
        //   endpoints.unshift('api/background/me/', 'api/background/profile/');
        // }
        
      
        // Instead, use this approach based on the available endpoints
        if (userInfo.is_talent) {
        endpoints.unshift('api/profile/talent/');
        } else if (userInfo.is_background) {
        endpoints.unshift('api/profile/background/');
        }
        
        // No need to add headers here as they're handled by the interceptor
        
        let response = null;
        let lastError = null;
        
        // Try each endpoint until one succeeds
        for (const endpoint of endpoints) {
          try {
            const url = endpoint.includes('?') ? 
              `${endpoint}&t=${new Date().getTime()}` : 
              `${endpoint}?t=${new Date().getTime()}`;
              
            response = await axiosInstance.get(url);
            break;
          } catch (err) {
            console.error(`Error with endpoint ${endpoint}:`, err);
            // Don't treat 500 errors as critical - just continue
            lastError = err;
          }
        }

        // If all endpoints failed, throw the last error
        if (!response) {
          throw lastError || new Error('All endpoints failed');
        }
        
        // Map API response to our state structure - Updated to match the actual API response fields
        setUserData({
          ...response.data,  // Store the complete response data
          fullName: response.data.full_name || `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim(),
          email: response.data.email || '',
          role: response.data.account_type || '',
          location: `${response.data.city || ''}, ${response.data.country || ''}`.replace(', ,', '').replace(/^, |, $/, ''),
          gender: response.data.gender || '',
          dateOfBirth: response.data.date_of_birth || '',
          country: response.data.country || '',
          phoneNumber: response.data.phone || '',
          bio: response.data.aboutyou || ''
        });
        
        // Set profile image from API response only
        setProfileImage(response.data.profile_picture || null);
        
        setLoading(false);
      } catch (err) {
        // Enhanced error handling
        if (err.response?.status === 404) {
          // Use cached user data from localStorage when API endpoints are not available
          const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (cachedUser && (cachedUser.id || cachedUser.account_type)) {
            setUserData({
              ...cachedUser,
              fullName: cachedUser.name || `${cachedUser.first_name || ''} ${cachedUser.last_name || ''}`.trim(),
              email: cachedUser.email || '',
              role: cachedUser.account_type || '',
              location: `${cachedUser.city || ''}, ${cachedUser.country || ''}`.replace(', ,', '').replace(/^, |, $/, ''),
              gender: cachedUser.gender || '',
              dateOfBirth: cachedUser.date_of_birth || '',
              country: cachedUser.country || '',
              phoneNumber: cachedUser.phone || '',
              bio: cachedUser.aboutyou || ''
            });
            setProfileImage(cachedUser.profilePic || null);
            setError(''); // Clear any previous errors
          } else {
            setError('Unable to load profile data. Please try logging in again.');
          }
        } else if (err.response?.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load user data. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Update the media files fetch effect
  useEffect(() => {
    if (activeTab === 'media') {
      const fetchMediaFiles = async () => {
        try {
          // Get user type to determine correct endpoint
          const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
          const isBackground = userInfo.is_background;
          const endpoint = isBackground ? '/api/profile/background/' : '/api/profile/talent/';
          
          const response = await apiCallWithRefresh(() => 
            axiosInstance.get(endpoint)
          );
          
          if (response.data && response.data.media) {
            setMediaFiles(response.data.media);
          } else {
            setMediaFiles([]);
          }
        } catch (err) {
          console.error('Error fetching media files:', err);
          setError('Failed to load media files. Please try again later.');
        }
      };

      fetchMediaFiles();
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear any error or success messages when changing tabs
    setError('');
    setSuccessMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user type to determine correct endpoint
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isBackground = userInfo.is_background;
      const endpoint = isBackground ? '/api/profile/background/' : '/api/profile/talent/';
      
      const payload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        country: userData.country,
        city: userData.city,
        zipcode: userData.zipcode,
        phone: userData.phone,
        gender: userData.gender,
        date_of_birth: userData.date_of_birth,
        aboutyou: userData.aboutyou || userData.bio
      };
      
      
      const response = await axiosInstance.post(endpoint, payload);
      
      // Update local state with the response data structure
      if (response.data.profile) {
        setUserData({
          ...response.data.profile,
          fullName: response.data.profile.full_name,
          email: response.data.profile.email,
          role: response.data.profile.account_type,
          location: `${response.data.profile.city || ''}, ${response.data.profile.country || ''}`.replace(', ,', '').replace(/^, |, $/, ''),
          gender: response.data.profile.gender,
          dateOfBirth: response.data.profile.date_of_birth,
          country: response.data.profile.country,
          phoneNumber: response.data.profile.phone,
          bio: response.data.profile.aboutyou
        });

        setProfileImage(response.data.profile.profile_picture || null);
        setSuccessMessage(response.data.message || 'Profile updated successfully!');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      setLoading(true);
      
      // Get user type to determine correct endpoint
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isBackground = userInfo.is_background;
      const endpoint = isBackground ? '/api/profile/background/' : '/api/profile/talent/';
      
      // Use POST instead of PUT for updating the profile picture
      const response = await axiosInstance.post(endpoint, formData);
      
      // Update the profile image with the response URL
      const newProfilePicture = response.data.profile_picture;
      setProfileImage(newProfilePicture);
      
      // Update the AuthContext user data with the new profile picture
      if (authUser) {
        const updatedUser = {
          ...authUser,
          profilePic: newProfilePicture
        };
        updateUser(updatedUser);
      }
      
      setSuccessMessage('Profile image updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error uploading profile image:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to upload profile image. Please try again.');
      setLoading(false);
    }
  };

  const handleMediaUpload = async (formData) => {
      try {
        setLoading(true);
        
        // Get user type to determine correct endpoint
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const isBackground = userInfo.is_background;
        const profileEndpoint = isBackground ? '/api/profile/background/' : '/api/profile/talent/';
        const mediaEndpoint = isBackground ? '/api/profile/background/media/' : '/api/profile/talent/media/';
        
        // Ensure name field is present in formData
        if (!formData.get('name')) {
          const file = formData.get('media_file');
          if (file) {
            formData.append('name', file.name);
          }
        }

        const response = await apiCallWithRefresh(() => 
          axiosInstance.post(mediaEndpoint, formData)
        );
        
        // Refresh the media list after successful upload
        const profileResponse = await apiCallWithRefresh(() => 
          axiosInstance.get(profileEndpoint)
        );
        
        if (profileResponse.data && profileResponse.data.media) {
          setMediaFiles(profileResponse.data.media);
          setSuccessMessage('Media file uploaded successfully!');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error uploading media file:', err);
        
        // Enhanced error message extraction
        let errorMessage = 'Failed to upload media file. Please try again.';
        
        if (err.response?.data) {
          const errorData = err.response.data;
          
          // Check for upload limit error specifically
          if (errorData.error && errorData.error.includes('Upload limit reached')) {
            errorMessage = "You've reached the free account upload limit";
          }
          // Check for field-specific errors
          else if (errorData.media_file) {
            errorMessage = `Media file error: ${Array.isArray(errorData.media_file) ? errorData.media_file[0] : errorData.media_file}`;
          } else if (errorData.name) {
            errorMessage = `Name error: ${Array.isArray(errorData.name) ? errorData.name[0] : errorData.name}`;
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else {
            errorMessage = 'Failed to upload media file. Please try again.';
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🗑️ Attempting to delete media with ID:', mediaId);
      
      // Get user type to determine correct endpoint
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isBackground = userInfo.is_background;
      
      // Try multiple deletion endpoints based on user type
      const deleteEndpoints = isBackground ? [
        `/api/profile/background/media/${mediaId}/`,
        `/api/profile/talent/media/${mediaId}/`,
        `/api/media/${mediaId}/delete/`,
        `/api/media/${mediaId}/`,
        `/api/files/${mediaId}/`
      ] : [
        `/api/profile/talent/media/${mediaId}/`,
        `/api/profile/background/media/${mediaId}/`,
        `/api/media/${mediaId}/delete/`,
        `/api/media/${mediaId}/`,
        `/api/files/${mediaId}/`
      ];
      
      let response;
      let lastError;
      
      for (const endpoint of deleteEndpoints) {
        try {
          console.log(`🧪 Trying delete endpoint: ${endpoint}`);
          response = await apiCallWithRefresh(() => 
            axiosInstance.delete(endpoint)
          );
          console.log(`✅ Delete successful with endpoint: ${endpoint}`);
          break;
        } catch (error) {
          console.log(`❌ Endpoint failed: ${endpoint} - Status: ${error.response?.status}`);
          lastError = error;
        }
      }
      
      if (!response) {
        throw lastError || new Error('All deletion endpoints failed');
      }
      
      if (response.status === 204 || response.status === 200) {
        // Remove the deleted media from the local state
        setMediaFiles(prev => prev.filter(media => media.id !== mediaId));
        setSuccessMessage('Media file deleted successfully!');
      } else {
        setError('Failed to delete media file. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error deleting media file:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to delete media file. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Logout button clicked');
    try {
      console.log('🔄 Attempting to call logout endpoint...');
      // Attempt to call logout endpoint if it exists
      await axiosInstance.post('/api/logout/');
      console.log('✅ Logout endpoint called successfully');
    } catch (err) {
      console.log('⚠️ Logout endpoint failed or doesn\'t exist, continuing with local cleanup:', err.message);
      // If logout endpoint fails or doesn't exist, just continue with local cleanup
    } finally {
      console.log('🧹 Performing local cleanup...');
      console.log('🔐 Calling AuthContext logout...');
      logout();
      
      console.log('🧭 Navigating to login page...');
      // Navigate to login page
      navigate('/login');
    }
  };

  const renderTabContent = () => {
    const tabs = {
      profile: <ProfileTab userData={userData} handleInputChange={handleInputChange} handleSaveChanges={handleSaveChanges} loading={loading} />,
      media: <MediaTab mediaFiles={mediaFiles} handleMediaUpload={handleMediaUpload} handleDeleteMedia={handleDeleteMedia} />,
      billing: <BillingTab />,
      groups: <GroupsTab userData={userData} />,
      settings: <SettingsTab />,
      security: <SecurityTab />,
      specializations: <SpecializationTab />
    };
    return tabs[activeTab] || null;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="account-container">
      <Sidebar 
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        userData={userData}
        profileImage={profileImage}
        handleProfileImageChange={handleProfileImageChange}
        handleLogout={handleLogout}
      />
      <div className="account-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UserAccountPage;