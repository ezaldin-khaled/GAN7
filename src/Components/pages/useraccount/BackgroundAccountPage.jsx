/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import './UserAccountPage.css';
import './EnhancedTabStyles.css'; // Import the enhanced styles
import axiosInstance from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';
import ProfileTab from './components/ProfileTab';
import MediaTab from './components/ItemGalleryTab'; // Using the new ItemGalleryTab instead of MediaTab
import BillingTab from './components/BackgroundBillingTab'; // Using the specialized billing tab for background users
import SettingsTab from './components/SettingsTab';
import SecurityTab from './components/SecurityTab';
import { FaUser, FaImage, FaCreditCard, FaCog, FaShieldAlt } from 'react-icons/fa';
import Loader from '../../common/Loader';

const BackgroundAccountPage = () => {
  const { user: authUser, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    fullName: '', email: '', role: '', location: '',
    gender: '', dateOfBirth: '', country: '', phoneNumber: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [itemFiles, setItemFiles] = useState([]);
  const navigate = useNavigate();

  // Handle tab close/refresh
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

  // Fetch user data on component mount with retry mechanism
  useEffect(() => {
    const ROLES = {
      TALENT: 'talent',
      BACKGROUND: 'background'
    };
    
    const ROLE_ENDPOINTS = {
      [ROLES.TALENT]: 'profile/talent/',
      [ROLES.BACKGROUND]: 'profile/background/',
      DEFAULT: 'profile/'
    };

    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Parse user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('access');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Define endpoints to try - prioritize background endpoint
        const endpoints = [
          'api/profile/background/',
          'api/profile/'
        ];
        
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
            // Don't treat 500 errors as critical - just log and continue
            if (err.response?.status >= 500) {
              console.log(`Server error with ${endpoint}, will try next endpoint`);
            }
            lastError = err;
          }
        }

        // If all endpoints failed, throw the last error
        if (!response) {
          throw lastError || new Error('All endpoints failed');
        }
        
        console.log('API Response structure:', response.data);
        
        // Map API response to our state structure
        // Handle the nested profile structure from the API response
        const profileData = response.data.profile || response.data;
        
        console.log('Profile data extracted:', profileData);
        
        // Extract name from email if no name fields are available
        const emailUsername = profileData.email?.split('@')[0] || '';
        const fullName = profileData.full_name || profileData.name || emailUsername || 'User';
        
        console.log('📊 BackgroundAccountPage - Email username:', emailUsername);
        console.log('📊 BackgroundAccountPage - Full name:', fullName);
        
        const mappedUserData = {
          ...profileData,  // Store the complete profile data
          fullName: fullName,
          email: profileData.email || '',
          role: profileData.account_type || '',
          location: profileData.country || `${profileData.city || ''}, ${profileData.country || ''}`.replace(', ,', '').replace(/^, |, $/, ''),
          gender: profileData.gender || '',
          dateOfBirth: profileData.date_of_birth || '',
          country: profileData.country || '',
          phoneNumber: profileData.phone || '',
          bio: profileData.aboutyou || '',
          // Include profile_score from the response (available at root level or within profile)
          profile_score: response.data.profile_score || profileData.profile_score
        };
        
        console.log('📊 BackgroundAccountPage - Mapped User Data:', mappedUserData);
        setUserData(mappedUserData);
        
        // Set profile image with fallback to a local asset
        setProfileImage(profileData.profile_picture || null);
        
        setLoading(false);
      } catch (err) {
        // Enhanced error handling
        if (err.response?.status === 404) {
          console.log('🔍 Profile endpoints not available (404), using cached user data');
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
              bio: cachedUser.aboutyou || '',
              profile_score: cachedUser.profile_score
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

  // Update the item files fetch effect
  useEffect(() => {
    if (activeTab === 'media') {
      const fetchItemFiles = async () => {
        try {
          const response = await axiosInstance.get('/api/profile/background/');
          // Handle nested profile structure for items
          const profileData = response.data.profile || response.data;
          if (profileData && profileData.items) {
            setItemFiles(profileData.items);
          }
        } catch (err) {
          console.error('Error fetching item files:', err);
          setError('Failed to load item files. Please try again later.');
        }
      };

      fetchItemFiles();
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
      
      const response = await axiosInstance.post('/api/profile/background/', payload);
      
      console.log('Save response structure:', response.data);
      
      // Update local state with the response data structure
      // Handle both nested profile structure and direct response
      const responseProfile = response.data.profile || response.data;
      
      if (responseProfile) {
        setUserData({
          ...responseProfile,
          fullName: responseProfile.full_name || `${responseProfile.first_name || ''} ${responseProfile.last_name || ''}`.trim(),
          email: responseProfile.email || '',
          role: responseProfile.account_type || '',
          location: `${responseProfile.city || ''}, ${responseProfile.country || ''}`.replace(', ,', '').replace(/^, |, $/, ''),
          gender: responseProfile.gender || '',
          dateOfBirth: responseProfile.date_of_birth || '',
          country: responseProfile.country || '',
          phoneNumber: responseProfile.phone || '',
          bio: responseProfile.aboutyou || '',
          // Include profile_score from the response (available at root level or within profile)
          profile_score: response.data.profile_score || responseProfile.profile_score
        });

        setProfileImage(responseProfile.profile_picture || null);
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
      const response = await axiosInstance.post('/api/profile/background/', formData);
      
      // Update the profile image with the response URL
      const newProfilePicture = response.data.profile_picture;
      setProfileImage(newProfilePicture);
      
      // Update the AuthContext user data with the new profile picture
      if (authUser) {
        const updatedUser = {
          ...authUser,
          profilePic: newProfilePicture
        };
        console.log('🔄 Updating AuthContext with new profile picture:', newProfilePicture);
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

  const handleItemUpload = async (formData) => {
    try {
      setLoading(true);
      // Ensure name field is present in formData
      if (!formData.get('name')) {
        const file = formData.get('image');
        formData.append('name', file.name);
      }

      const response = await axiosInstance.post('/api/profile/background/items/', formData);
      
      // Refresh the item list after successful upload
      const profileResponse = await axiosInstance.get('/api/profile/background/');
      // Handle nested profile structure for items
      const profileData = profileResponse.data.profile || profileResponse.data;
      if (profileData && profileData.items) {
        setItemFiles(profileData.items);
        setSuccessMessage('Item file uploaded successfully!');
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error uploading item file:', err);
      const errorMessage = err.response?.data?.name?.[0] || 
                    err.response?.data?.non_field_errors?.[0] || 
                    err.response?.data?.message || 
                    'Failed to upload item file. Please try again.';
      setError(errorMessage);
      setLoading(false);
      throw err;
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
      // Use AuthContext logout method to update state immediately
      const { logout } = useContext(AuthContext);
      logout();
      
      // Navigate to login page
      navigate('/login');
    }
  };

  // Custom sidebar menu items for background users (no groups tab)
  const backgroundMenuItems = [
    { id: 'profile', icon: FaUser, label: 'Profile Information' },
    { id: 'media', icon: FaImage, label: 'Item Gallery' },
    { id: 'billing', icon: FaCreditCard, label: 'Plans' },
    { id: 'settings', icon: FaCog, label: 'Account Settings' },
    { id: 'security', icon: FaShieldAlt, label: 'Security' }
  ];

  const renderTabContent = () => {
    const tabs = {
      profile: <ProfileTab userData={userData} handleInputChange={handleInputChange} handleSaveChanges={handleSaveChanges} loading={loading} />,
      media: <MediaTab mediaFiles={itemFiles} handleMediaUpload={handleItemUpload} isItemGallery={true} />,
      billing: <BillingTab />,
      settings: <SettingsTab />,
      security: <SecurityTab />
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
        menuItems={backgroundMenuItems}
        isBackground={true}
      />
      <div className="account-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BackgroundAccountPage;