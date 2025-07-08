/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import './UserAccountPage.css';
import './EnhancedTabStyles.css'; // Import the enhanced styles
import axiosInstance from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
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

  // Token refresh function
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh');
      if (!refreshTokenValue) {
        throw new Error('No refresh token found');
      }
      
      const response = await axiosInstance.post('/api/token/refresh/', {
        refresh: refreshTokenValue
      });
      
      const { access } = response.data;
      localStorage.setItem('access', access);
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
            console.log('Trying endpoint:', endpoint);
            const url = endpoint.includes('?') ? 
              `${endpoint}&t=${new Date().getTime()}` : 
              `${endpoint}?t=${new Date().getTime()}`;
              
            response = await axiosInstance.get(url);
            console.log('Success with endpoint:', endpoint);
            break;
          } catch (err) {
            console.error(`Error with endpoint ${endpoint}:`, err);
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
        
        // Set profile image with fallback to a local asset instead of placeholder.com
        setProfileImage(
          response.data.profile_picture || 
          '/assets/default-profile.png'  // Use a local asset as fallback
        );
        
        setLoading(false);
      } catch (err) {
        // Enhanced error handling
        if (err.response?.status === 404) {
          setError('Profile endpoint not found. Please check your API configuration.');
        } else if (err.response?.status === 401) {
          localStorage.removeItem('token');
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
          const response = await axiosInstance.get('/api/profile/talent/');
          if (response.data && response.data.media) {
            setMediaFiles(response.data.media);
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
      
      console.log('Sending profile update with payload:', payload);
      
      const response = await axiosInstance.post('/api/profile/talent/', payload);
      
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

        setProfileImage(response.data.profile.profile_picture || '/assets/default-profile.png');
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
      // Use POST instead of PUT for updating the profile picture
      const response = await axiosInstance.post('/api/profile/talent/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update the profile image with the response URL
      setProfileImage(response.data.profile_picture);
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
        // Ensure name field is present in formData
        if (!formData.get('name')) {
          const file = formData.get('media_file');
          formData.append('name', file.name);
        }

        const response = await axiosInstance.post('/api/profile/talent/media/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Refresh the media list after successful upload
        const profileResponse = await axiosInstance.get('/api/profile/talent/');
        if (profileResponse.data && profileResponse.data.media) {
          setMediaFiles(profileResponse.data.media);
          setSuccessMessage('Media file uploaded successfully!');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error uploading media file:', err);
        const errorMessage = err.response?.data?.name?.[0] || 
                      err.response?.data?.non_field_errors?.[0] || 
                      err.response?.data?.message || 
                      'Failed to upload media file. Please try again.';
        setError(errorMessage);
        setLoading(false);
      }
    };

  const handleLogout = async () => {
    try {
      // Attempt to call logout endpoint if it exists
      await axiosInstance.post('/api/logout/');
    } catch (err) {
      // If logout endpoint fails or doesn't exist, just continue with local cleanup
      console.log('Logout API call failed or endpoint does not exist');
    } finally {
      // Clear all authentication data
      localStorage.removeItem('token'); // Remove legacy token if exists
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      
      // Navigate to login page
      navigate('/login');
    }
  };

  const renderTabContent = () => {
    const tabs = {
      profile: <ProfileTab userData={userData} handleInputChange={handleInputChange} handleSaveChanges={handleSaveChanges} loading={loading} />,
      media: <MediaTab mediaFiles={mediaFiles} handleMediaUpload={handleMediaUpload} />,
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
