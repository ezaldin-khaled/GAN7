import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from'../../assets/10.png'
import '../Navbar/Navbar.css'
import { Link } from 'react-scroll';
import UserProfilePopup from './UserProfilePopup';
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

function Navbar() {
  const { t } = useTranslation();
  const[sticky, setSticky] = useState(false)
  const { user, loading } = useContext(AuthContext);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(()=>{
      window.addEventListener('scroll', ()=>{
          window.scrollY > 200 ? setSticky(true) : setSticky(false);
      })
  },[]);

  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMenu = ()=>{
      setMobileMenu(!mobileMenu);
  }

  const closeMobileMenu = () => {
      setMobileMenu(false);
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenu && !event.target.closest('nav')) {
        setMobileMenu(false);
      }
    };

    if (mobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenu]);

  const handleNavigation = (sectionId) => {
    closeMobileMenu(); // Close menu when navigating
    if (location.pathname !== '/') {
      // If we're not on the main page, navigate to main page first
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const handleLoginClick = () => {
    console.log('Login button clicked');
    closeMobileMenu(); // Close menu when logging in
    navigate('/login');
  };

  const handleGalleryClick = () => {
    closeMobileMenu(); // Close menu when navigating to gallery
  };

  const handleAvatarClick = () => {
    console.log('Avatar clicked, user:', user);
    if (user) {
      setShowProfile(true);
    } else {
      console.log('No user data, redirecting to login');
      navigate('/login');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // Determine what to show in the auth section
  const renderAuthSection = () => {
    if (loading) {
      // Show loading spinner while fetching user data
      return (
        <li>
          <div className="navbar-loader">
            <div className="navbar-spinner"></div>
          </div>
        </li>
      );
    } else if (user) {
      // Show avatar when user is logged in
      console.log('🔍 Navbar - User profile pic:', user.profilePic);
      console.log('🔍 Navbar - User profile_picture (API):', user.profile_picture);
      console.log('🔍 Navbar - User data:', user);
      console.log('🔍 Navbar - Will show image:', !!(user.profilePic || user.profile_picture));
      console.log('🔍 Navbar - Final image URL:', user.profilePic || user.profile_picture);
      return (
        <li>
          <button className="avatar-btn" onClick={handleAvatarClick}>
            {(user.profilePic || user.profile_picture) ? (
              <img 
                src={user.profilePic || user.profile_picture} 
                alt="Profile" 
                className="avatar-img"
                onError={(e) => {
                  console.log('🔍 Navbar - Image failed to load:', user.profilePic || user.profile_picture);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {!(user.profilePic || user.profile_picture) && (
              <div className="avatar-placeholder">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>
        </li>
      );
    } else {
      // Show login button when no user is logged in
      return (
        <li>
          <button className="btn" onClick={handleLoginClick}>
            {t('navigation.login')}
          </button>
        </li>
      );
    }
  };

  return (
    <nav className={`container ${sticky? 'dark-nav' : ''}`}>
      <div className="nav-left">
        <img 
          src={logo} 
          alt="Logo" 
          className='logo' 
          onClick={handleLogoClick} 
          style={{cursor: 'pointer'}} 
        />
      </div>
      
      <div className="nav-right">
        {mobileMenu ? (
          <FaTimes className='menu-icon close-icon' onClick={toggleMenu}/>
        ) : (
          <FaBars className='menu-icon' onClick={toggleMenu}/>
        )}
        {showProfile && (
          <UserProfilePopup user={user} onClose={() => setShowProfile(false)} />
        )}
      </div>
      
      {/* Mobile menu backdrop */}
      {mobileMenu && <div className="mobile-menu-backdrop" onClick={closeMobileMenu}></div>}
      
      <ul className={mobileMenu ? 'mobile-menu-open' : 'hide-mobile-menu'}>
        {/* Close button inside menu */}
        <li className="menu-header">
          <div className="menu-close-section">
            <span className="menu-title">{t('navigation.menu', 'Menu')}</span>
            <FaTimes className='menu-close-btn' onClick={closeMobileMenu}/>
          </div>
        </li>
        
        <li>
          {location.pathname === '/' ? (
            <Link 
              to="hero" 
              smooth={true} 
              offset={0} 
              duration={500}
              onClick={closeMobileMenu}
            >
              {t('navigation.home')}
            </Link>
          ) : (
            <button 
              className="nav-link-btn" 
              onClick={() => handleNavigation('hero')}
            >
              {t('navigation.home')}
            </button>
          )}
        </li>
        <li>
          {location.pathname === '/' ? (
            <Link 
              to="serv" 
              smooth={true} 
              offset={-280} 
              duration={500}
              onClick={closeMobileMenu}
            >
              {t('navigation.services')}
            </Link>
          ) : (
            <button 
              className="nav-link-btn" 
              onClick={() => handleNavigation('serv')}
            >
              {t('navigation.services')}
            </button>
          )}
        </li>
        <li>
          {location.pathname === '/' ? (
            <Link 
              to="about" 
              smooth={true} 
              offset={-160} 
              duration={500}
              onClick={closeMobileMenu}
            >
              {t('navigation.about')}
            </Link>
          ) : (
            <button 
              className="nav-link-btn" 
              onClick={() => handleNavigation('about')}
            >
              {t('navigation.about')}
            </button>
          )}
        </li>
        <li>
          <a 
            href="/gallery" 
            className="gallery-link"
            onClick={handleGalleryClick}
          >
            {t('navigation.gallery')}
          </a>
        </li>
        {/* <li>
          <LanguageSwitcher />
        </li> */}
        {renderAuthSection()}
      </ul>
    </nav>
  );
};

export default Navbar;