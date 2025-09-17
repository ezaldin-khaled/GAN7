import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import ProfileScore from './ProfileScore';
import axiosInstance from '../../../../api/axios';

const ProfileTab = ({ userData, handleInputChange, handleSaveChanges, loading: profileLoading }) => {
  const [formattedDob, setFormattedDob] = useState('');
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    snapchat: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch social media data
  useEffect(() => {
    fetchSocialMediaData();
  }, []);

  const fetchSocialMediaData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get('/api/profile/social-media/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setSocialMediaLinks({
          facebook: response.data.facebook || '',
          twitter: response.data.twitter || '',
          instagram: response.data.instagram || '',
          linkedin: response.data.linkedin || '',
          youtube: response.data.youtube || '',
          tiktok: response.data.tiktok || '',
          snapchat: response.data.snapchat || ''
        });
      }
    } catch (err) {
      console.error('Error fetching social media data:', err);
      if (err.response?.status === 404) {
        console.log('No social media data found - this is normal for new users');
        // Don't set error for 404, just use empty defaults
      } else if (err.response?.status === 403) {
        console.log('Access denied to social media endpoint - user may not have permission');
        // Don't set error for 403, just use empty defaults
      } else if (err.response?.status >= 500) {
        console.log('Server error fetching social media data - using defaults');
        // Don't set error for server errors, just use empty defaults
      } else {
        console.log('Failed to load social media data - using defaults');
        // Only show error for unexpected client errors
        setError('Failed to load social media data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update formatted date whenever userData changes
  useEffect(() => {
    if (userData && userData.date_of_birth) {
      try {
        const dateString = userData.date_of_birth;
        const date = new Date(dateString);
        
        if (!isNaN(date.getTime())) {
          // Format as YYYY-MM-DD
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setFormattedDob(`${year}-${month}-${day}`);
        } else {
          console.log('Invalid date format from API:', dateString);
          setFormattedDob('');
        }
      } catch (error) {
        console.error('Error formatting date:', error);
        setFormattedDob('');
      }
    }
  }, [userData]);

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setSocialMediaLinks(prev => ({
      ...prev,
      [name]: value
    }));
    // Also update the userData through the parent component's handler
    handleInputChange({
      target: {
        name,
        value
      }
    });
  };

  const validateSocialMediaUrl = (url, platform) => {
    if (!url) return true; // Empty URLs are allowed
    
    const patterns = {
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/,
      twitter: /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+$/,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+$/,
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/(channel\/|c\/|user\/)?[a-zA-Z0-9-]+|youtu\.be\/[a-zA-Z0-9-]+)$/,
      tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+$/,
      snapchat: /^(https?:\/\/)?(www\.)?snapchat\.com\/add\/[a-zA-Z0-9._]+$/
    };

    return patterns[platform].test(url);
  };

  return (
    <div className="content-section">
      <h1 className="section-title">
        Profile Information
      </h1>
      
      <div className="profile-score-section">
        <ProfileScore profileScore={userData.profile_score} />
      </div>

      <div className="profile-form-section">
        <h3 className="subsection-title">
          Personal Details
        </h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="full_name" 
              value={userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`} 
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <div className="email-input-container">
              <input 
                type="email" 
                name="email" 
                value={userData.email || ''} 
                onChange={handleInputChange} 
                disabled 
                placeholder="Email address"
                className={userData.email_verified ? 'verified' : 'unverified'}
              />
              <div className="email-status">
                {userData.email_verified ? (
                  <span className="status-badge verified">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Email Verified
                  </span>
                ) : (
                  <span className="status-badge unverified">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email Not Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={userData.phone || ''} 
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="form-group">
            <label>Country</label>
            <input 
              type="text" 
              name="country" 
              value={userData.country || ''} 
              onChange={handleInputChange}
              placeholder="Enter your country"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input 
              type="text" 
              name="city" 
              value={userData.city || ''} 
              onChange={handleInputChange}
              placeholder="Enter your city"
            />
          </div>
          
          <div className="form-group">
            <label>Zip Code</label>
            <input 
              type="text" 
              name="zipcode" 
              value={userData.zipcode || ''} 
              onChange={handleInputChange}
              placeholder="12345"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={userData.gender || ''} onChange={handleInputChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input 
              type="date" 
              name="date_of_birth" 
              value={formattedDob} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>About You</label>
          <textarea 
            name="aboutyou" 
            value={userData.aboutyou || ''} 
            onChange={handleInputChange} 
            rows="4"
            placeholder="Tell us about yourself, your interests, and what makes you unique..."
          />
        </div>
      </div>

      <div className="social-media-section">
        <h2>Social Media Links</h2>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading-state">
            <LoadingSpinner text="Loading social media data..." />
          </div>
        ) : (
          <div className="social-media-grid">
            <div className="form-group">
              <label>Facebook</label>
              <input 
                type="url" 
                name="facebook" 
                value={socialMediaLinks.facebook} 
                onChange={handleSocialMediaChange}
                placeholder={socialMediaLinks.facebook || "https://facebook.com/yourusername"}
              />
            </div>
            
            <div className="form-group">
              <label>Twitter</label>
              <input 
                type="url" 
                name="twitter" 
                value={socialMediaLinks.twitter} 
                onChange={handleSocialMediaChange}
                placeholder={socialMediaLinks.twitter || "https://twitter.com/yourusername"}
              />
            </div>
            
            <div className="form-group">
              <label>Instagram</label>
              <input 
                type="url" 
                name="instagram" 
                value={socialMediaLinks.instagram} 
                onChange={handleSocialMediaChange}
                placeholder={socialMediaLinks.instagram || "https://instagram.com/yourusername"}
              />
            </div>
            
            <div className="form-group">
              <label>LinkedIn</label>
              <input 
                type="url" 
                name="linkedin" 
                value={socialMediaLinks.linkedin} 
                onChange={handleSocialMediaChange}
                placeholder={socialMediaLinks.linkedin || "https://linkedin.com/in/yourusername"}
              />
            </div>
            
            <div className="form-group">
              <label>YouTube</label>
              <input 
                type="url" 
                name="youtube" 
                value={socialMediaLinks.youtube} 
                onChange={handleSocialMediaChange}
                placeholder={socialMediaLinks.youtube || "https://youtube.com/yourusername"}
              />
            </div>
            
            <div className="form-group">
              <label>TikTok</label>
              <input 
                type="url" 
                name="tiktok" 
                value={socialMediaLinks.tiktok} 
                onChange={handleSocialMediaChange}
                placeholder={socialMediaLinks.tiktok || "https://tiktok.com/@yourusername"}
              />
            </div>
            
            <div className="form-group">
              <label>Snapchat</label>
              <input 
                type="url" 
                name="snapchat" 
                value={socialMediaLinks.snapchat} 
                onChange={handleSocialMediaChange}
                placeholder={socialMediaLinks.snapchat || "https://snapchat.com/add/yourusername"}
              />
            </div>
          </div>
        )}
      </div>

      <div className="button-group">
        <button 
          className="save-button" 
          onClick={handleSaveChanges}
          disabled={profileLoading || loading}
        >
          {profileLoading ? <LoadingSpinner text="Saving..." /> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;