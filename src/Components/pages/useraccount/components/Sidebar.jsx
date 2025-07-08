import React from 'react';
import { FaUser, FaImage, FaCreditCard, FaCog, FaShieldAlt, FaCamera, FaSignOutAlt, FaUsers, FaBox } from 'react-icons/fa';
import useImageWithRetry from '../../../../hooks/useImageWithRetry';

// Default menu items for talent users
const defaultMenuItems = [
  { id: 'profile', icon: FaUser, label: 'Profile Information' },
  { id: 'media', icon: FaImage, label: 'Media Gallery' },
  { id: 'billing', icon: FaCreditCard, label: 'Plans & Billing' },
  { id: 'groups', icon: FaUsers, label: 'Groups' },
  { id: 'specializations', icon: FaUser, label: 'Specializations' },
  { id: 'settings', icon: FaCog, label: 'Account Settings' },
  { id: 'security', icon: FaShieldAlt, label: 'Security' }
];

// Menu items for background users (no groups tab, renamed media to items)
const backgroundMenuItems = [
  { id: 'profile', icon: FaUser, label: 'Profile Information' },
  { id: 'media', icon: FaBox, label: 'Item Gallery' },
  { id: 'billing', icon: FaCreditCard, label: 'Plans' },
  { id: 'settings', icon: FaCog, label: 'Account Settings' },
  { id: 'security', icon: FaShieldAlt, label: 'Security' }
];

const Sidebar = ({ activeTab, handleTabChange, userData, profileImage, handleProfileImageChange, handleLogout, menuItems = defaultMenuItems, isBackground = false }) => {
  // Use the retry hook for profile image loading
  const { imageSrc, isLoading, retryCount } = useImageWithRetry(
    profileImage, 
    '/assets/default-profile.png', 
    5 // 5 retries
  );

  return (
    <div className="account-sidebar">
      <div className="profile-summary">
        <div className="profile-image-container">
          <img 
            src={imageSrc} 
            alt="Profile" 
            className={`profile-image ${isLoading ? 'loading' : ''}`}
            style={{ 
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
          {isLoading && retryCount > 0 && (
            <div className="image-loading-indicator">
              Retrying... ({retryCount}/5)
            </div>
          )}
          <label className="change-photo-btn">
            <FaCamera />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImageChange} />
          </label>
        </div>
        <h2 className="profile-name">{userData.fullName || `${userData.first_name || ''} ${userData.last_name || ''}`}</h2>
        <p className="profile-role">{userData.role || userData.account_type || 'User'}</p>
      </div>
      
      <div className="sidebar-menu">
        
        {menuItems.map(({ id, icon: Icon, label }) => (
          <button key={id} className={`menu-item ${activeTab === id ? 'active' : ''}`} onClick={() => handleTabChange(id)}>
            <Icon className="menu-icon" />
            <span>{label}</span>
          </button>
        ))}
        <button className="menu-item logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="menu-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;