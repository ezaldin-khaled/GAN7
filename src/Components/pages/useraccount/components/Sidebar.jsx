import React from 'react';
import { FaUser, FaImage, FaCreditCard, FaCog, FaShieldAlt, FaCamera, FaSignOutAlt, FaUsers, FaBox } from 'react-icons/fa';

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

const Sidebar = ({ activeTab, handleTabChange, userData, profileImage, handleProfileImageChange, handleLogout, menuItems = defaultMenuItems, isBackground = false }) => (
  <div className="account-sidebar">
    <div className="profile-summary">
      <div className="profile-image-container">
        <img 
          src={profileImage || '/assets/default-profile.png'} 
          alt="Profile" 
          className="profile-image" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/default-profile.png';
          }}
        />
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

export default Sidebar;