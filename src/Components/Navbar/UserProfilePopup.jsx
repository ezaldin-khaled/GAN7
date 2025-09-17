import React, { useState, useEffect, useContext } from "react";
import axiosInstance from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "./UserProfilePopup.css";

// SVG Icons
const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
  
  const EnvelopeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-input">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
  
  const VerifiedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon-verified">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );

  const UserAccountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );

export default function UserProfilePopup({ user, onClose }) {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileScore, setProfileScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [mediaSuccess, setMediaSuccess] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // Calculate profile score based on data completeness
  const calculateProfileScore = (userData) => {
    if (!userData) return { score: 0, breakdown: [] };

    const breakdown = [];
    let totalScore = 0;
    let maxScore = 0;

    // Define scoring criteria
    const criteria = [
      {
        key: 'basicInfo',
        label: 'Basic Information',
        weight: 20,
        check: () => userData.firstName && userData.lastName && userData.email,
        description: 'First name, last name, and email'
      },
      {
        key: 'profilePicture',
        label: 'Profile Picture',
        weight: 15,
        check: () => userData.profile_picture,
        description: 'Upload a profile picture'
      },
      {
        key: 'bio',
        label: 'Bio/About',
        weight: 15,
        check: () => userData.bio && userData.bio.length > 20,
        description: 'Write a compelling bio (20+ characters)'
      },
      {
        key: 'location',
        label: 'Location',
        weight: 10,
        check: () => userData.country || userData.location,
        description: 'Add your location'
      },
      {
        key: 'contact',
        label: 'Contact Info',
        weight: 10,
        check: () => userData.phoneNumber,
        description: 'Add phone number'
      },
      {
        key: 'personalDetails',
        label: 'Personal Details',
        weight: 10,
        check: () => userData.gender && userData.dateOfBirth,
        description: 'Gender and date of birth'
      },
      {
        key: 'verification',
        label: 'Email Verification',
        weight: 10,
        check: () => userData.email_verified,
        description: 'Verify your email address'
      },
      {
        key: 'adminApproval',
        label: 'Admin Approval',
        weight: 10,
        check: () => userData.is_verified,
        description: 'Profile approved by admin'
      },
      {
        key: 'subscription',
        label: 'Subscription',
        weight: 10,
        check: () => userData.isSubscribed,
        description: 'Active subscription'
      }
    ];

    criteria.forEach(criterion => {
      const isComplete = criterion.check();
      const score = isComplete ? criterion.weight : 0;
      
      breakdown.push({
        ...criterion,
        score,
        isComplete,
        percentage: (score / criterion.weight) * 100
      });
      
      totalScore += score;
      maxScore += criterion.weight;
    });

    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    return {
      score: finalScore,
      breakdown,
      totalScore,
      maxScore
    };
  };

  const handleOpenUserAccount = () => {
    // Determine which account page to navigate to based on user type
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (userInfo.is_talent) {
      navigate('/account');
    } else if (userInfo.is_background) {
      navigate('/account');
    } else {
      // Default to talent account page
      navigate('/account');
    }
    
    // Close the popup after navigation
    onClose();
  };

  const handleLogout = () => {
    // Use AuthContext logout method to update state immediately
    logout();
    
    // Close the popup
    onClose();
    
    // Navigate to login page
    navigate('/login');
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError('Please enter a valid verification code');
      return;
    }

    setVerificationLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/verify-code/', {
        email: userData?.email,
        code: verificationCode
      });

      if (response.status === 200 && response.data.success) {
        setMediaSuccess(response.data.message || 'Email verified successfully!');
        setVerificationCode('');
        // Refresh user data to update verification status
        await fetchUserData();
      } else {
        setError(response.data.message || 'Failed to verify email. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying email:', err);
      const errorMessage = err.response?.data?.message || 
                          'Failed to verify email. Please check your code and try again.';
      setError(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/resend-code/', {
        email: userData?.email
      });
      
      if (response.status === 200 && response.data.success) {
        setMediaSuccess(response.data.message || 'Verification code sent to your email!');
      } else {
        setError(response.data.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (err) {
      console.error('Error resending verification code:', err);
      const errorMessage = err.response?.data?.message || 
                          'Failed to resend verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  // File validation function
  const validateFile = (file) => {
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    
    if (file.type.startsWith('image/') && file.size > maxImageSize) {
      throw new Error('Image must be less than 10MB');
    }
    if (file.type.startsWith('video/') && file.size > maxVideoSize) {
      throw new Error('Video must be less than 100MB');
    }
    
    // Check file types
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
    
    if (file.type.startsWith('image/') && !allowedImageTypes.includes(file.type)) {
      throw new Error('Image must be JPG, PNG, or WEBP format');
    }
    if (file.type.startsWith('video/') && !allowedVideoTypes.includes(file.type)) {
      throw new Error('Video must be MP4, MOV, or AVI format');
    }
  };

  // Media upload function
  const handleMediaUpload = async (formData) => {
    try {
      setMediaLoading(true);
      setMediaError(null);
      setMediaSuccess(null);
      
      const file = formData.get('media_file');
      
      // Debug logging
      console.log('Uploading file:', file);
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      // Validate file before upload
      validateFile(file);
      
      // Ensure name field is present in formData
      if (!formData.get('name')) {
        formData.append('name', file.name);
      }

      // Get user type to determine correct endpoint
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isBackground = userInfo.is_background;
      const mediaEndpoint = isBackground ? '/api/profile/background/media/' : '/api/profile/talent/media/';
      
      console.log('🔍 UserProfilePopup - User info:', userInfo);
      console.log('🎯 UserProfilePopup - Media endpoint selected:', mediaEndpoint);
      console.log('Sending request to:', mediaEndpoint);
      
      // For file uploads, we need to let the browser set the Content-Type header
      // to multipart/form-data with the proper boundary
      const token = localStorage.getItem('access');
      console.log('Auth token available:', !!token);
      
      const response = await axiosInstance.post(mediaEndpoint, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary
        }
      });
      
      // Refresh the media list after successful upload
      await fetchMediaFiles();
      setMediaSuccess('Media file uploaded successfully!');
      
    } catch (err) {
      console.error('Error uploading media file:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      
      // Handle different types of errors
      if (err.message && (err.message.includes('less than') || err.message.includes('format'))) {
        // File validation error
        setMediaError(err.message);
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        console.error('400 Error data:', errorData);
        
        // Handle account limit errors
        if (errorData.error && errorData.error.includes('Upload limit reached')) {
          setMediaError(`${errorData.error} ${errorData.upgrade_message || ''}`);
        } else if (errorData.media_file) {
          // File-specific errors
          setMediaError(errorData.media_file[0] || 'Invalid file format or size');
        } else if (errorData.name) {
          setMediaError(errorData.name[0]);
        } else if (errorData.non_field_errors) {
          setMediaError(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          setMediaError(errorData.detail);
        } else {
          // Log the full error data for debugging
          console.error('Full 400 error data:', JSON.stringify(errorData, null, 2));
          setMediaError(errorData.error || errorData.message || 'Failed to upload media file. Please try again.');
        }
      } else if (err.response?.status === 404) {
        setMediaError('Talent profile not found. Please complete your profile first.');
      } else {
        setMediaError('Failed to upload media file. Please try again.');
      }
    } finally {
      setMediaLoading(false);
    }
  };

  // Media deletion function with correct endpoint
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      setMediaLoading(true);
      setMediaError(null);
      setMediaSuccess(null);
      
      // Use the correct endpoint as per backend documentation
      const response = await axiosInstance.delete(`/api/media/${mediaId}/delete/`);
      
      if (response.status === 204 || response.status === 200) {
        // Remove the deleted media from the local state
        setMediaFiles(prev => prev.filter(media => media.id !== mediaId));
        setMediaSuccess('Media file deleted successfully!');
      } else {
        setMediaError('Failed to delete media file. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting media file:', err);
      
      // Handle specific error responses as per API documentation
      if (err.response?.status === 403) {
        setMediaError('You do not have permission to delete this media.');
      } else if (err.response?.status === 404) {
        setMediaError('Media file not found.');
      } else {
        const errorMessage = err.response?.data?.detail || 
                            err.response?.data?.message || 
                            'Failed to delete media file. Please try again.';
        setMediaError(errorMessage);
      }
    } finally {
      setMediaLoading(false);
    }
  };

  // Fetch media files from API
  const fetchMediaFiles = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Determine the correct endpoint based on user type
      let primaryEndpoint;
      let endpoints = [];
      
      if (userInfo.is_background) {
        primaryEndpoint = 'api/profile/background/';
        endpoints = ['api/profile/background/']; // Only try background endpoint for background users
      } else if (userInfo.is_talent) {
        primaryEndpoint = 'api/profile/talent/';
        endpoints = ['api/profile/talent/']; // Only try talent endpoint for talent users
      } else {
        // Fallback: try both endpoints for unknown users
        primaryEndpoint = 'api/profile/talent/';
        endpoints = ['api/profile/talent/', 'api/profile/background/'];
      }
      
      // Debug logging
      console.log('🔍 UserProfilePopup - User info:', userInfo);
      console.log('🎯 UserProfilePopup - Primary endpoint selected:', primaryEndpoint);
      console.log('🎯 UserProfilePopup - All endpoints to try:', endpoints);
      
      let mediaData = [];
      
      // Try each endpoint until one succeeds
      for (const endpoint of endpoints) {
        try {
          const url = endpoint.includes('?') ? 
            `${endpoint}&t=${new Date().getTime()}` : 
            `${endpoint}?t=${new Date().getTime()}`;
            
          console.log(`🧪 UserProfilePopup fetchMediaFiles - Trying endpoint: ${url}`);
          const response = await axiosInstance.get(url);
          console.log(`✅ UserProfilePopup fetchMediaFiles - Success with endpoint: ${endpoint}`);
          if (response.data && response.data.media) {
            mediaData = response.data.media;
            break;
          }
        } catch (err) {
          console.log(`❌ UserProfilePopup fetchMediaFiles - Failed with endpoint: ${endpoint} - Status: ${err.response?.status}`);
          // Continue to next endpoint
        }
      }
      
      setMediaFiles(mediaData);
    } catch (err) {
      console.error('Error fetching media files:', err);
      setMediaFiles([]);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Parse user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('access');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Use user prop if available, otherwise fallback to localStorage data
        const currentUser = user || userInfo;
        // User data processing

        // Try to fetch real user data from API endpoints first (same as account page)
        
        // Determine the correct endpoint based on user type
        let primaryEndpoint;
        let endpoints = [];
        
        if (userInfo.is_background) {
          primaryEndpoint = 'api/profile/background/';
          endpoints = ['api/profile/background/']; // Only try background endpoint for background users
        } else if (userInfo.is_talent) {
          primaryEndpoint = 'api/profile/talent/';
          endpoints = ['api/profile/talent/']; // Only try talent endpoint for talent users
        } else {
          // Fallback: try both endpoints for unknown users
          primaryEndpoint = 'api/profile/talent/';
          endpoints = ['api/profile/talent/', 'api/profile/background/'];
        }
        
        // Debug logging
        console.log('🔍 UserProfilePopup fetchUserData - User info:', userInfo);
        console.log('🎯 UserProfilePopup fetchUserData - Primary endpoint selected:', primaryEndpoint);
        console.log('🎯 UserProfilePopup fetchUserData - All endpoints to try:', endpoints);
        
        let response = null;
        let lastError = null;
        
        // Try each endpoint until one succeeds
        for (const endpoint of endpoints) {
          try {
            const url = endpoint.includes('?') ? 
              `${endpoint}&t=${new Date().getTime()}` : 
              `${endpoint}?t=${new Date().getTime()}`;
              
            console.log(`🧪 UserProfilePopup fetchUserData - Trying endpoint: ${url}`);
            response = await axiosInstance.get(url);
          console.log(`✅ UserProfilePopup fetchUserData - Success with endpoint: ${endpoint}`);
          console.log('📊 UserProfilePopup fetchUserData - API Response:', response.data);
          console.log('📊 UserProfilePopup fetchUserData - Profile Data:', response.data.profile);
          break;
          } catch (err) {
            console.log(`❌ UserProfilePopup fetchUserData - Failed with endpoint: ${endpoint} - Status: ${err.response?.status}`);
            // Don't treat 500 errors as critical - just continue
            lastError = err;
          }
        }

        // If API call succeeded, use the real data
        if (response) {
          // Extract profile data from the nested structure
          const profileData = response.data.profile || response.data;
          console.log('📊 UserProfilePopup fetchUserData - Extracted Profile Data:', profileData);
          
          // Extract name from email if no name fields are available
          const emailUsername = profileData.email?.split('@')[0] || '';
          const fullName = profileData.full_name || profileData.name || emailUsername || 'User';
          
          const mappedUserData = {
            ...response.data,  // Store the complete response data
            firstName: profileData.first_name || profileData.firstName || emailUsername || '',
            lastName: profileData.last_name || profileData.lastName || '',
            fullName: fullName,
            email: profileData.email || '',
            role: profileData.account_type || profileData.role || '',
            location: profileData.country || `${profileData.city || ''}, ${profileData.country || ''}`.replace(', ,', '').replace(/^, |, $/, ''),
            gender: profileData.gender || '',
            dateOfBirth: profileData.date_of_birth || profileData.dateOfBirth || '',
            country: profileData.country || '',
            phoneNumber: profileData.phone || profileData.phoneNumber || '',
            bio: profileData.aboutyou || profileData.bio || profileData.description || '',
            username: profileData.username || emailUsername || '',
            isVerified: profileData.is_verified || profileData.isVerified || false,
            isSubscribed: profileData.is_subscribed || profileData.isSubscribed || false,
            verifiedDate: profileData.verified_date || profileData.verifiedDate || "2 JAN, 2025",
            profile_picture: profileData.profile_picture || profileData.profilePic || null,
            cover_photo: profileData.cover_photo || '/home/illusion/Downloads/Gemini_Generated_Image_7yteyb7yteyb7yte.jpg',
            // Additional fields
            profileScore: response.data.profile_score?.score || 0,
            accountTier: response.data.subscription_status?.tier || 0,
            profileCompletion: response.data.profile_score?.completion_percentage || 0,
            subscriptionMessage: response.data.subscription_status?.message || '',
            canAccessFeatures: response.data.restrictions?.can_access_features || false,
            isRestricted: response.data.restrictions?.is_restricted || false,
            subscriptionRequired: response.data.restrictions?.subscription_required || false
          };
          
          console.log('📊 UserProfilePopup fetchUserData - Mapped User Data:', mappedUserData);
          setUserData(mappedUserData);
          
          // Calculate profile score for API data
          const scoreData = calculateProfileScore(mappedUserData);
          setProfileScore(scoreData.score);
          setScoreBreakdown(scoreData.breakdown);
        } else {
          // Fallback to cached user data from localStorage if API calls failed
          const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const sourceUser = currentUser && (currentUser.id || currentUser.account_type) ? currentUser : cachedUser;
          
          if (sourceUser && (sourceUser.id || sourceUser.account_type || sourceUser.email)) {
            // Map the cached user data to our display structure
            const fullName = sourceUser.name || sourceUser.full_name || `${sourceUser.first_name || sourceUser.firstName || ''} ${sourceUser.last_name || sourceUser.lastName || ''}`.trim();
            const nameParts = fullName.split(' ');
            const firstName = sourceUser.first_name || sourceUser.firstName || (nameParts.length > 0 ? nameParts[0] : '');
            const lastName = sourceUser.last_name || sourceUser.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
            
            const mappedUserData = {
              ...sourceUser,  // Store the complete user data
              firstName: firstName,
              lastName: lastName,
              fullName: fullName,
              email: sourceUser.email || sourceUser.email_address || '',
              role: sourceUser.account_type || sourceUser.role || '',
              location: sourceUser.location || `${sourceUser.city || ''}, ${sourceUser.country || ''}`.replace(', ,', '').replace(/^, |, $/, ''),
              gender: sourceUser.gender || '',
              dateOfBirth: sourceUser.date_of_birth || sourceUser.dateOfBirth || '',
              country: sourceUser.country || '',
              phoneNumber: sourceUser.phone || sourceUser.phoneNumber || sourceUser.phone_number || '',
              bio: sourceUser.aboutyou || sourceUser.bio || sourceUser.description || '',
              username: sourceUser.username || sourceUser.email?.split('@')[0] || '',
              email_verified: sourceUser.email_verified || false,
              is_verified: sourceUser.is_verified || false,
              isSubscribed: sourceUser.is_subscribed || sourceUser.isSubscribed || false,
              verifiedDate: sourceUser.verified_date || sourceUser.verifiedDate || "2 JAN, 2025",
              profile_picture: sourceUser.profile_picture || sourceUser.profilePic || null,
              cover_photo: sourceUser.cover_photo || '/home/illusion/Downloads/Gemini_Generated_Image_7yteyb7yteyb7yte.jpg',
              // Additional fields
              profileScore: 0,
              accountTier: 0,
              profileCompletion: 0,
              subscriptionMessage: '',
              canAccessFeatures: false,
              isRestricted: false,
              subscriptionRequired: false
            };
            
            setUserData(mappedUserData);
            
            // Calculate profile score for cached data
            const scoreData = calculateProfileScore(mappedUserData);
            setProfileScore(scoreData.score);
            setScoreBreakdown(scoreData.breakdown);
          } else {
            setError('Unable to load profile data. Please try logging in again.');
          }
        }
        
        // Update stats from response data
        setStats({
            // Removed firstSeen, firstPurchase, revenue, mrr fields
        });
        
        // Fetch media files from API
        await fetchMediaFiles();
        
        setLoading(false);
      } catch (err) {
        console.error('UserProfilePopup - Error fetching user data:', err);
        
        // Only log out on authentication errors, not on network/API errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Profile endpoint not found. Showing basic information.');
        } else {
          setError('Failed to load detailed profile data. Showing basic information.');
        }
        
        setLoading(false);
      }
    };

    // Always try to fetch user data, either from user prop or localStorage
    fetchUserData();
  }, [user, navigate]);

  // Fetch media files when media tab becomes active
  useEffect(() => {
    if (activeTab === 'media') {
      fetchMediaFiles();
    }
  }, [activeTab]);

  if (loading && !userData) {
    return (
      <div className="profile-popup-overlay" onClick={onClose}>
        <div className="profile-popup-card" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header-buttons">
            <button className="close-btn" onClick={onClose}>&times;</button>
            <button className="account-btn" onClick={handleOpenUserAccount} title="Open User Account">
              <UserAccountIcon />
            </button>
          </div>
          <div className="profile-popup-content">
            <div style={{ textAlign: 'center', padding: '40px', color: '#A1A1AA' }}>
              Loading user data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="profile-popup-overlay" onClick={onClose}>
        <div className="profile-popup-card" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header-buttons">
            <button className="close-btn" onClick={onClose}>&times;</button>
            <button className="account-btn" onClick={handleOpenUserAccount} title="Open User Account">
              <UserAccountIcon />
            </button>
          </div>
          <div className="profile-popup-content">
            <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
              Error loading user data: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User data is ready for display
  
  return (
    <div className="profile-popup-overlay" onClick={onClose}>
      <div className="profile-popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header-buttons">
          <button className="close-btn" onClick={onClose}>&times;</button>
          <button className="account-btn" onClick={handleOpenUserAccount} title="Open User Account">
            <UserAccountIcon />
          </button>
        </div>

        <div className="profile-popup-content">
          {error && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              marginBottom: '16px', 
              fontSize: '14px' 
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="profile-popup-info">
            <div className="profile-header">
              <div className="profile-header-left">
                {userData?.profile_picture ? (
                <img 
                    src={userData.profile_picture} 
                  className="profile-pic-small" 
                  alt={`${userData?.firstName} ${userData?.lastName}`} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!userData?.profile_picture && (
                  <div className="profile-pic-placeholder">
                    {userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="profile-header-text">
                  <h2>
                    {userData?.firstName} {userData?.lastName}
                    {userData?.isSubscribed && (
                      <span className="subscribed-badge"><span className="dot"></span>Subscribed</span>
                    )}
                  </h2>
                  <p className="profile-email">{userData?.email}</p>
                  {userData?.subscriptionMessage && (
                    <p className="subscription-status" style={{ 
                      color: userData?.canAccessFeatures ? '#10b981' : '#f59e0b', 
                      fontSize: '14px', 
                      marginTop: '4px' 
                    }}>
                      {userData.subscriptionMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {userData?.bio && (
              <p className="profile-bio">{userData?.bio}</p>
            )}
          </div>

          {/* Enhanced Profile Score Section */}
          <div className="profile-stats">
            <div className="profile-score-section">
              <div className="score-visual">
                <div className="score-circle">
                  <svg className="score-ring" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(139, 90, 43, 0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - profileScore / 100)}`}
                      className="score-progress"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5a2b" />
                        <stop offset="100%" stopColor="#d4af37" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-number">{profileScore}</div>
                </div>
              </div>
              <div className="score-content">
                <div className="score-header">
                  <h3 className="score-title">Profile Score</h3>
                  <p className="score-subtitle">{profileScore}/100</p>
                </div>
                <p className="score-message">
                  {profileScore >= 80 
                    ? "Excellent! Your profile is well-completed and attractive to potential opportunities."
                    : profileScore >= 60 
                    ? "Good progress! Complete a few more sections to boost your profile appeal."
                    : profileScore >= 40
                    ? "Getting there! Add more information to make your profile stand out."
                    : "Let's improve your profile! Complete the missing sections below to increase your score."
                  }
                </p>
                {profileScore < 100 && (
                  <button 
                    className="improve-score-btn"
                    onClick={handleOpenUserAccount}
                  >
                    Improve Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="popup-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'score' ? 'active' : ''}`}
              onClick={() => setActiveTab('score')}
            >
              Score ({profileScore}%)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              Media ({mediaFiles.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="profile-popup-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                      <div className="readonly-field">{userData?.firstName}</div>
              </div>
              <div className="form-group">
                      <label>Last Name</label>
                      <div className="readonly-field">{userData?.lastName}</div>
              </div>
            </div>

            <div className="form-group">
              <label>Email address</label>
                    <div className="input-with-icon readonly">
                <EnvelopeIcon />
                      <div className="readonly-field-with-icon">{userData?.email}</div>
                    </div>
                    {userData?.email_verified && (
                      <div className="verified-badge-text">
                        <VerifiedIcon /> EMAIL VERIFIED {userData?.verifiedDate}
              </div>
                    )}
                    {userData?.is_verified && (
                      <div className="verified-badge-text">
                        <VerifiedIcon /> PROFILE APPROVED
              </div>
                    )}
            </div>

            <div className="form-group">
              <label>Country</label>
                    <div className="input-with-icon readonly">
                  <div className="country-flag"></div>
                      <div className="readonly-field-with-icon">{userData?.country}</div>
              </div>
            </div>

            <div className="form-group">
                <label>Username</label>
                    <div className="input-with-prefix readonly">
                    <span>untitled.com/</span>
                      <div className="readonly-field-with-prefix">{userData?.username}</div>
                    <div className="username-check"><VerifiedIcon /></div>
                    </div>
                  </div>
                </div>
            </div>
            )}

            {activeTab === 'score' && (
              <div className="score-tab">
                <div className="score-breakdown">
                  <h3 className="breakdown-title">Profile Score Breakdown</h3>
                  <p className="breakdown-subtitle">
                    Complete these sections to improve your profile score and attract more opportunities.
                  </p>
                  
                  <div className="breakdown-list">
                    {scoreBreakdown.map((item, index) => (
                      <div key={item.key} className={`breakdown-item ${item.isComplete ? 'complete' : 'incomplete'}`}>
                        <div className="breakdown-icon">
                          {item.isComplete ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="breakdown-content">
                          <div className="breakdown-header">
                            <h4 className="breakdown-label">{item.label}</h4>
                            <span className="breakdown-weight">{item.weight} points</span>
                          </div>
                          <p className="breakdown-description">{item.description}</p>
                          <div className="breakdown-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">{item.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* User Flow States */}
                  {userData && (
                    <div className="user-flow-states">
                      {/* State 1: Email Not Verified */}
                      {!userData.email_verified && (
                        <div className="flow-state email-verification-prompt">
                          <div className="state-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                          </div>
                          <div className="state-content">
                            <h4 className="state-title">Email Verification Required</h4>
                            <p className="state-description">
                              Please enter the verification code sent to your email.
                            </p>
                            <div className="verification-code-container">
                              <input 
                                type="text" 
                                className="verification-code-input"
                                placeholder="Enter verification code"
                                maxLength="6"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                              />
                              <button 
                                className="verify-code-btn"
                                onClick={handleVerifyCode}
                                disabled={!verificationCode || verificationCode.length < 4}
                              >
                                Verify Code
                              </button>
                            </div>
                            <button 
                              className="resend-code-btn"
                              onClick={handleResendCode}
                            >
                              Resend Code
                            </button>
                            <div className="state-status">
                              <span className="status-indicator email-pending"></span>
                              <span className="status-text">Email Not Verified</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* State 2: Email Verified, Pending Admin Approval */}
                      {userData.email_verified && !userData.is_verified && (
                        <div className="flow-state admin-approval-pending">
                          <div className="state-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                          </div>
                          <div className="state-content">
                            <h4 className="state-title">Profile Under Review</h4>
                            <p className="state-description">
                              Your email has been verified! Your profile is currently under review by our admin team. 
                              You'll receive a notification once it's approved.
                            </p>
                            <div className="state-status">
                              <span className="status-indicator pending"></span>
                              <span className="status-text">Pending Admin Approval</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="breakdown-summary">
                    <div className="summary-stats">
                      <div className="summary-item">
                        <span className="summary-label">Current Score</span>
                        <span className="summary-value">{profileScore}/100</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Completed</span>
                        <span className="summary-value">
                          {scoreBreakdown.filter(item => item.isComplete).length}/{scoreBreakdown.length}
                        </span>
                      </div>
                    </div>
                    {profileScore < 100 && (
                      <button 
                        className="complete-profile-btn"
                        onClick={handleOpenUserAccount}
                      >
                        Complete Your Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="media-tab">
                {/* Media Upload Section */}
                <div className="media-upload-section">
                  <div className="upload-area">
                    <input
                      type="file"
                      id="media-upload"
                      accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/mov,video/avi"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;

                        const formData = new FormData();
                        formData.append('media_file', files[0]);
                        formData.append('name', files[0].name);
                        
                        handleMediaUpload(formData);
                        e.target.value = ''; // Reset input
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="media-upload" className="upload-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Upload Media
                    </label>
                  </div>
                  
                  {/* File Limits Info */}
                  <div className="file-limits-info">
                    <p className="limits-text">
                      <strong>Supported formats:</strong> JPG, PNG, WEBP (max 10MB) • MP4, MOV, AVI (max 100MB)
                    </p>
                  </div>
                  
                  {/* Media Messages */}
                  {mediaError && (
                    <div className="media-message error">
                      ⚠️ {mediaError}
                    </div>
                  )}
                  {mediaSuccess && (
                    <div className="media-message success">
                      ✅ {mediaSuccess}
                    </div>
                  )}
                  {mediaLoading && (
                    <div className="media-message loading">
                      📤 Uploading...
                    </div>
                  )}
                </div>

                {/* Media Grid */}
                {mediaFiles.length > 0 ? (
                  <div className="media-grid">
                    {mediaFiles.map((media, index) => (
                      <div key={media.id || index} className="media-item">
                        <div className="media-content">
                          {media.file_type === 'video' || media.file?.includes('.mp4') || media.file?.includes('.mov') ? (
                            <video 
                              src={media.file} 
                              controls 
                              className="media-video"
                              poster={media.thumbnail}
                            >
                              Your browser does not support video playback.
                            </video>
                          ) : (
                            <img 
                              src={media.file || media.image} 
                              alt={media.name || `Media ${index + 1}`}
                              className="media-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          )}
                          {/* Fallback for broken images */}
                          <div className="media-placeholder" style={{ display: 'none' }}>
                            <div className="placeholder-icon">
                              {media.file_type === 'video' ? '🎥' : '🖼️'}
                            </div>
                            <div className="placeholder-text">
                              {media.name || 'Media File'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="media-info">
                          <div className="media-details">
                            <p className="media-name">{media.name || `Media ${index + 1}`}</p>
                            {media.description && (
                              <p className="media-description">{media.description}</p>
                            )}
                            {media.id && (
                              <p className="media-id">ID: {media.id}</p>
                            )}
                          </div>
                          
                          {/* Delete Button */}
                          {media.id && (
                            <button 
                              className="delete-media-btn"
                              onClick={() => handleDeleteMedia(media.id)}
                              title="Delete media file"
                              disabled={mediaLoading}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-media">
                    <div className="no-media-icon">📁</div>
                    <p>No media files uploaded yet</p>
                    <p>Click "Upload Media" to add images or videos</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="details-tab">
                <div className="profile-popup-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Type</label>
                      <div className="readonly-field">{userData?.role}</div>
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <div className="readonly-field">{userData?.gender || 'Not specified'}</div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <div className="readonly-field">{userData?.dateOfBirth || 'Not specified'}</div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="readonly-field">{userData?.phoneNumber || 'Not specified'}</div>
                    </div>
                  </div>

                  <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <div className="readonly-field">{userData?.location || 'Not specified'}</div>
                    </div>
                  </div>

                  {userData?.bio && (
                    <div className="form-group">
                      <label>About</label>
                      <div className="readonly-field bio-field">{userData?.bio}</div>
                    </div>
                  )}

                  {/* Additional fields specific to talent/background */}
                  {userData?.height && (
                    <div className="form-group">
                      <label>Height</label>
                      <div className="readonly-field">{userData?.height}</div>
                    </div>
                  )}

                  {userData?.weight && (
                    <div className="form-group">
                      <label>Weight</label>
                      <div className="readonly-field">{userData?.weight}</div>
                    </div>
                  )}

                  {userData?.eye_color && (
                    <div className="form-group">
                      <label>Eye Color</label>
                      <div className="readonly-field">{userData?.eye_color}</div>
                    </div>
                  )}

                  {userData?.hair_color && (
                    <div className="form-group">
                      <label>Hair Color</label>
                      <div className="readonly-field">{userData?.hair_color}</div>
                    </div>
                  )}

                  {/* Profile Score Section */}
                  {userData?.profileScore && (
                    <div className="form-group">
                      <label>Profile Score</label>
                      <div className="readonly-field">{userData?.profileScore}/100</div>
                    </div>
                  )}

                  {userData?.accountTier && (
                    <div className="form-group">
                      <label>Account Tier</label>
                      <div className="readonly-field">{userData?.accountTier}</div>
                    </div>
                  )}

                  {/* {userData?.profileCompletion && (
                    <div className="form-group">
                      <label>Profile Completion</label>
                      <div className="readonly-field">{userData?.profileCompletion}%</div>
                    </div>
                  )} */}

                  {/* Subscription Information */}
                  {userData?.subscriptionMessage && (
                    <div className="form-group">
                      <label>Subscription Status</label>
                      <div className="readonly-field">{userData?.subscriptionMessage}</div>
                    </div>
                  )}

                  {userData?.canAccessFeatures !== undefined && (
                    <div className="form-group">
                      <label>Feature Access</label>
                      <div className="readonly-field">{userData?.canAccessFeatures ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  )}

                  {userData?.isRestricted !== undefined && (
                    <div className="form-group">
                      <label>Account Status</label>
                      <div className="readonly-field">{userData?.isRestricted ? 'Restricted' : 'Active'}</div>
                    </div>
                  )}

                  {userData?.subscriptionRequired !== undefined && (
                    <div className="form-group">
                      <label>Subscription Required</label>
                      <div className="readonly-field">{userData?.subscriptionRequired ? 'Yes' : 'No'}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
        </div>
        <button className="popup-action-btn logout-btn" onClick={handleLogout}><LogoutIcon /> Logout</button>
      </div>
    </div>
  );
}
