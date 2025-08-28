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
        console.log('No social media data found');
      } else {
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

  // Social media icons
  const socialIcons = {
    facebook: '📘',
    twitter: '🐦',
    instagram: '📷',
    linkedin: '💼',
    youtube: '📺',
    tiktok: '🎵',
    snapchat: '👻'
  };

  return (
    <div className="content-section">
      <h1 className="section-title">
        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          👤 Profile Information
        </span>
      </h1>
      
      <div className="profile-score-section">
        <ProfileScore profileScore={userData.profile_score} />
      </div>

      {/* Personal Information Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '1.4rem', 
          fontWeight: '600', 
          marginBottom: '25px', 
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📋 Personal Information
        </h2>
        
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
            <input 
              type="email" 
              name="email" 
              value={userData.email || ''} 
              onChange={handleInputChange} 
              disabled 
              placeholder="your.email@example.com"
            />
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
              placeholder="Your country"
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
              placeholder="Your city"
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
            placeholder="Tell us about yourself, your experience, and what makes you unique..."
          />
        </div>
      </div>

      {/* Social Media Section */}
      <div className="social-media-section">
        <h2>Social Media Links</h2>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <LoadingSpinner text="Loading social media data..." />
        ) : (
          <div className="social-media-grid">
            {Object.entries(socialMediaLinks).map(([platform, value]) => (
              <div key={platform} className="form-group">
                <label>
                  {socialIcons[platform]} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </label>
                <input 
                  type="url" 
                  name={platform} 
                  value={value} 
                  onChange={handleSocialMediaChange}
                  placeholder={`https://${platform}.com/yourusername`}
                  style={{
                    borderColor: validateSocialMediaUrl(value, platform) ? '#e5e7eb' : '#ef4444'
                  }}
                />
                {value && !validateSocialMediaUrl(value, platform) && (
                  <small style={{ 
                    color: '#ef4444', 
                    fontSize: '0.8rem', 
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    Please enter a valid {platform} URL
                  </small>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="button-group">
        <button 
          className="save-button" 
          onClick={handleSaveChanges}
          disabled={profileLoading || loading}
        >
          {profileLoading ? (
            <LoadingSpinner text="Saving..." />
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              💾 Save Changes
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;