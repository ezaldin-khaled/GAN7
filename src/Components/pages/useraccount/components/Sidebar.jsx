import React, { useState, useEffect } from 'react';
import { FaUser, FaImage, FaCreditCard, FaCog, FaShieldAlt, FaCamera, FaSignOutAlt, FaUsers, FaBox, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use the retry hook for profile image loading
  const { imageSrc, isLoading, retryCount, useFallback } = useImageWithRetry(
    profileImage, 
    5 // 5 retries
  );

  // Detect screen size and update mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleBackToMain = () => {
    navigate('/');
  };

  const toggleMobileMenu = () => {
    const newMenuState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newMenuState);
    
    // Auto-scroll to top when opening mobile menu (only on mobile devices)
    if (newMenuState && isMobile) {
      // Small delay to ensure the menu is rendered before scrolling
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const handleTabClick = (tabId) => {
    handleTabChange(tabId);
    // Close mobile menu when a tab is selected (only on mobile devices)
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`account-sidebar ${isMobile && !isMobileMenuOpen ? 'mobile-hidden' : ''}`}>
        <div className="profile-summary">
          <div className="profile-image-container">
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt="Profile" 
                className={`profile-image ${isLoading ? 'loading' : ''} ${useFallback ? 'fallback' : ''}`}
                style={{ 
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'opacity 0.3s ease-in-out',
                  display: useFallback ? 'none' : 'block'
                }}
              />
            ) : null}
            {useFallback && (
              <div className="profile-image-fallback"></div>
            )}
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
          
          {/* Verification Status */}
          <div className="verification-status">
            {!userData.email_verified && (
              <div className="verification-badge email-pending">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>Email Verification Required</span>
              </div>
            )}
            
            {userData.email_verified && !userData.is_verified && (
              <div className="verification-badge admin-pending">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>Profile Under Review</span>
              </div>
            )}
            
            {userData.email_verified && userData.is_verified && (
              <div className="verification-badge verified">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>Profile Verified</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button 
              key={id} 
              className={`menu-item ${activeTab === id ? 'active' : ''}`} 
              onClick={() => handleTabClick(id)}
            >
              <Icon className="menu-icon" />
              <span>{label}</span>
            </button>
          ))}
          <button className="menu-item back-to-main-btn" onClick={handleBackToMain}>
            <FaHome className="menu-icon" />
            <span>Back to Main Page</span>
          </button>
          <button 
            className="menu-item logout-btn" 
            onClick={(e) => {
              console.log('🔴 Logout button clicked in Sidebar');
              e.preventDefault();
              e.stopPropagation();
              if (handleLogout) {
                handleLogout();
              } else {
                console.error('❌ handleLogout function is not defined');
              }
            }}
          >
            <FaSignOutAlt className="menu-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;