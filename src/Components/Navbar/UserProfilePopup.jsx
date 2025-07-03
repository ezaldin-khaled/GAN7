import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./UserProfilePopup.css";

// Update the axios instance and interceptors - same as UserAccountPage
const API_URL = 'http://192.168.0.107:8000/';

// Create an axios instance with the base URL and token handling
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Using token:', token.substring(0, 15) + '...');
    } else {
      // If no token is found, redirect to login
      window.location.href = '/login';
    }
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better debugging and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, 'Data keys:', Object.keys(response.data));
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh');
          if (!refreshToken) {
            throw new Error('No refresh token found');
          }
          
          const response = await axios.post(`${API_URL}api/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

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
  const navigate = useNavigate();

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
    // Clear all auth data
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    // Close the popup
    onClose();
    
    // Navigate to login page
    navigate('/login');
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

        console.log('UserProfilePopup - User info from localStorage:', userInfo);
        console.log('UserProfilePopup - User prop:', user);

        // Create initial user data from the user prop (from AuthContext)
        const initialUserData = {
          firstName: user?.first_name || user?.firstName || '',
          lastName: user?.last_name || user?.lastName || '',
          fullName: user?.full_name || `${user?.first_name || user?.firstName || ''} ${user?.last_name || user?.lastName || ''}`.trim(),
          email: user?.email || '',
          role: user?.account_type || user?.role || '',
          location: user?.location || '',
          gender: user?.gender || '',
          dateOfBirth: user?.date_of_birth || user?.dateOfBirth || '',
          country: user?.country || '',
          phoneNumber: user?.phone || user?.phoneNumber || '',
          bio: user?.aboutyou || user?.bio || user?.description || '',
          username: user?.username || user?.email?.split('@')[0] || '',
          isVerified: user?.is_verified || user?.isVerified || false,
          isSubscribed: user?.is_subscribed || user?.isSubscribed || false,
          verifiedDate: user?.verified_date || user?.verifiedDate || "2 JAN, 2025",
          profile_picture: user?.profile_picture || user?.profilePic || '/assets/default-profile.png',
          cover_photo: user?.cover_photo || '/home/illusion/Downloads/Gemini_Generated_Image_7yteyb7yteyb7yte.jpg'
        };

        // Set initial data immediately so UI shows something
        setUserData(initialUserData);
        
        // Create initial stats
        setStats({
          // Removed firstSeen, firstPurchase, revenue, mrr fields
        });

        // Try to fetch detailed data from API
        const endpoints = [
          'api/profile/talent/',
          'api/profile/background/',
        ];
        
        // Prioritize endpoint based on user type
        if (userInfo.is_talent) {
          endpoints.unshift('api/profile/talent/');
        } else if (userInfo.is_background) {
          endpoints.unshift('api/profile/background/');
        }
        
        let response = null;
        let lastError = null;
        
        // Try each endpoint until one succeeds
        for (const endpoint of endpoints) {
          try {
            console.log('UserProfilePopup - Trying endpoint:', endpoint);
            const url = endpoint.includes('?') ? 
              `${endpoint}&t=${new Date().getTime()}` : 
              `${endpoint}?t=${new Date().getTime()}`;
              
            response = await axiosInstance.get(url);
            console.log('UserProfilePopup - Success with endpoint:', endpoint);
            console.log('UserProfilePopup - Response data:', response.data);
            break;
          } catch (err) {
            console.error(`UserProfilePopup - Error with endpoint ${endpoint}:`, err);
            lastError = err;
          }
        }

        // If API call succeeded, update with detailed data
        if (response) {
          // Handle nested profile structure
          const profileData = response.data.profile || response.data;
          const profileScore = response.data.profile_score || {};
          const subscriptionStatus = response.data.subscription_status || {};
          const restrictions = response.data.restrictions || {};
          
          console.log('UserProfilePopup - Profile data:', profileData);
          console.log('UserProfilePopup - Profile score:', profileScore);
          console.log('UserProfilePopup - Subscription status:', subscriptionStatus);
          
          const mappedUserData = {
            ...profileData,  // Store the complete profile data
            firstName: profileData.first_name || profileData.user?.first_name || initialUserData.firstName,
            lastName: profileData.last_name || profileData.user?.last_name || initialUserData.lastName,
            fullName: profileData.full_name || `${profileData.first_name || profileData.user?.first_name || ''} ${profileData.last_name || profileData.user?.last_name || ''}`.trim() || initialUserData.fullName,
            email: profileData.email || profileData.user?.email || initialUserData.email,
            role: profileData.account_type || profileData.user?.account_type || initialUserData.role,
            location: `${profileData.city || ''}, ${profileData.country || ''}`.replace(', ,', '').replace(/^, |, $/, '') || initialUserData.location,
            gender: profileData.gender || initialUserData.gender,
            dateOfBirth: profileData.date_of_birth || initialUserData.dateOfBirth,
            country: profileData.country || initialUserData.country,
            phoneNumber: profileData.phone || initialUserData.phoneNumber,
            bio: profileData.aboutyou || profileData.bio || profileData.description || initialUserData.bio,
            username: profileData.username || profileData.email?.split('@')[0] || initialUserData.username,
            isVerified: profileData.is_verified || initialUserData.isVerified,
            isSubscribed: subscriptionStatus.has_subscription || initialUserData.isSubscribed,
            verifiedDate: profileData.verified_date || initialUserData.verifiedDate,
            profile_picture: profileData.profile_picture || initialUserData.profile_picture,
            cover_photo: profileData.cover_photo || initialUserData.cover_photo,
            // Additional fields from the nested structure
            profileScore: profileScore.total || 0,
            accountTier: profileScore.account_tier || 0,
            profileCompletion: profileScore.profile_completion || 0,
            subscriptionMessage: subscriptionStatus.message || '',
            canAccessFeatures: subscriptionStatus.can_access_features || false,
            isRestricted: restrictions.restricted || false,
            subscriptionRequired: restrictions.subscription_required || false
          };
          
          console.log('UserProfilePopup - Mapped user data:', mappedUserData);
          setUserData(mappedUserData);
          
          // Update stats from response data
        setStats({
            // Removed firstSeen, firstPurchase, revenue, mrr fields
        });
        
        // Fetch media files if available
          let mediaData = [];
          if (profileData.media && Array.isArray(profileData.media)) {
            mediaData = profileData.media;
          } else if (profileData.items && Array.isArray(profileData.items)) {
          // For background users, media might be in 'items' field
            mediaData = profileData.items;
          } else if (profileData.media_items && Array.isArray(profileData.media_items)) {
            // Alternative media field
            mediaData = profileData.media_items;
          }
          
          console.log('UserProfilePopup - Media data found:', mediaData);
          setMediaFiles(mediaData);
        } else {
          // If API failed, show warning but keep using initial data
          console.warn('UserProfilePopup - API fetch failed, using initial data');
          setError('Could not load detailed profile data. Showing basic information.');
        }
        
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

    if (user) {
      fetchUserData();
    }
  }, [user, navigate]);

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
                <img 
                  src={user.profilePic || userData?.profile_picture || '/assets/default-profile.png'} 
                  className="profile-pic-small" 
                  alt={`${userData?.firstName} ${userData?.lastName}`} 
                />
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

          {stats && (
            <div className="profile-stats">
              {userData?.profileScore && (
                <div className="profile-score-section">
                  <div className="score-info">
                    <p className="stat-label">Profile Score</p>
                    <p className="stat-value">{userData.profileScore}/100</p>
                  </div>
                  <p className="score-message">
                    Go to the account settings to setup and change your info for better opportunities
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="popup-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
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
                    {userData?.isVerified && (
                      <div className="verified-badge-text">
                        <VerifiedIcon /> VERIFIED {userData?.verifiedDate}
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

            {activeTab === 'media' && (
              <div className="media-tab">
                {mediaFiles.length > 0 ? (
                  <div className="media-grid">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="media-item">
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
                            }}
                          />
                        )}
                        {media.name && (
                          <div className="media-info">
                            <p className="media-name">{media.name}</p>
                            {media.description && (
                              <p className="media-description">{media.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-media">
                    <p>No media files available</p>
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