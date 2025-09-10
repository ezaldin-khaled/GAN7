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
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

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
        console.log('🔍 DEBUG - User prop:', user);
        console.log('🔍 DEBUG - UserInfo from localStorage:', userInfo);
        console.log('🔍 DEBUG - CurrentUser:', currentUser);

        // Since profile endpoints are not available (404/403 errors), use cached user data from localStorage
        // Use the same approach as the account page - use cached user data from localStorage
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('🔍 DEBUG - CachedUser:', cachedUser);
        
        // Use currentUser as primary source, fallback to cachedUser if needed
        const sourceUser = currentUser && (currentUser.id || currentUser.account_type) ? currentUser : cachedUser;
        console.log('🔍 DEBUG - SourceUser:', sourceUser);
        console.log('🔍 DEBUG - SourceUser keys:', Object.keys(sourceUser));
        console.log('🔍 DEBUG - SourceUser values:', Object.values(sourceUser));
        
        if (sourceUser && (sourceUser.id || sourceUser.account_type || sourceUser.email)) {
          // Map the user data to our display structure (same as account page)
          // Handle case where we only have a generic "name" field
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
            isVerified: sourceUser.is_verified || sourceUser.isVerified || sourceUser.email_verified || false,
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
          
          console.log('🔍 DEBUG - MappedUserData:', mappedUserData);
          setUserData(mappedUserData);
        } else {
          console.log('🔍 DEBUG - No valid user data found');
          setError('Unable to load profile data. Please try logging in again.');
        }
        
        // Update stats from response data
        setStats({
            // Removed firstSeen, firstPurchase, revenue, mrr fields
        });
        
        // Since we're using cached data, no media files are available from API
        let mediaData = [];
        setMediaFiles(mediaData);
        
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

  // Debug: Log the current userData state
  console.log('🔍 DEBUG - Final userData state:', userData);
  
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