import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars } from 'react-icons/fa';
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

  // Add useEffect to monitor user state changes
  useEffect(() => {
    console.log('🔍 Navbar - User state changed:', user);
    console.log('🔍 Navbar - Loading state:', loading);
  }, [user, loading]);

  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMenu = ()=>{
      const newMenuState = !mobileMenu;
      setMobileMenu(newMenuState);
      
      // Auto-scroll to top when opening mobile menu
      if (newMenuState) {
        // Small delay to ensure the menu is rendered before scrolling
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 100);
      }
  }

  const handleNavigation = (sectionId) => {
    if (location.pathname !== '/') {
      // If we're not on the main page, navigate to main page first
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const handleLoginClick = () => {
    console.log('Login button clicked');
    navigate('/login');
  };

  // Function to detect if user is on mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  };

  const handleAvatarClick = () => {
    // Use the same fallback logic as renderAuthSection
    const fallbackUser = !user && !loading ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const finalUser = user || fallbackUser;
    
    console.log('Avatar clicked, user:', finalUser);
    if (finalUser) {
      // Check if user is on mobile device
      if (isMobileDevice()) {
        console.log('Mobile device detected, redirecting to account page');
        navigate('/account');
      } else {
        console.log('Desktop device detected, showing profile popup');
        setShowProfile(true);
      }
    } else {
      console.log('No user data, redirecting to login');
      navigate('/login');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // Get appropriate aria-label for avatar button
  const getAvatarAriaLabel = () => {
    const fallbackUser = !user && !loading ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const finalUser = user || fallbackUser;
    
    if (!finalUser) return 'Login';
    return isMobileDevice() ? 'Go to Account Page' : 'View Profile';
  };

  // Determine what to show in the auth section
  const renderAuthSection = () => {
    console.log('🔍 Navbar - renderAuthSection called');
    console.log('🔍 Navbar - loading:', loading);
    console.log('🔍 Navbar - user:', user);
    console.log('🔍 Navbar - user.id:', user?.id);
    console.log('🔍 Navbar - user exists:', !!user);
    
    // Fallback to localStorage if AuthContext user is not available
    const fallbackUser = !user && !loading ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const finalUser = user || fallbackUser;
    const hasValidUser = finalUser && finalUser.id;
    
    console.log('🔍 Navbar - fallbackUser:', fallbackUser);
    console.log('🔍 Navbar - finalUser:', finalUser);
    console.log('🔍 Navbar - hasValidUser:', hasValidUser);
    
    if (loading) {
      // Show loading spinner while fetching user data
      console.log('🔍 Navbar - Showing loading spinner');
      return (
        <li>
          <div className="navbar-loader">
            <div className="navbar-spinner"></div>
          </div>
        </li>
      );
    } else if (hasValidUser) {
      // Show avatar when user is logged in and has valid user data
      console.log('🔍 Navbar - Showing avatar for user:', finalUser);
      console.log('🔍 Navbar - User profile pic:', finalUser.profilePic);
      console.log('🔍 Navbar - User profile_picture (API):', finalUser.profile_picture);
      console.log('🔍 Navbar - Will show image:', !!(finalUser.profilePic || finalUser.profile_picture));
      console.log('🔍 Navbar - Final image URL:', finalUser.profilePic || finalUser.profile_picture);
      return (
        <li>
          <button 
            className="avatar-btn" 
            onClick={handleAvatarClick}
            aria-label={getAvatarAriaLabel()}
            title={getAvatarAriaLabel()}
          >
            {(finalUser.profilePic || finalUser.profile_picture) ? (
              <img 
                src={finalUser.profilePic || finalUser.profile_picture} 
                alt="Profile" 
                className="avatar-img"
                onError={(e) => {
                  console.log('🔍 Navbar - Image failed to load:', finalUser.profilePic || finalUser.profile_picture);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {!(finalUser.profilePic || finalUser.profile_picture) && (
              <div className="avatar-placeholder">
                {finalUser.name ? finalUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>
        </li>
      );
    } else {
      // Show login button when no user is logged in or session has ended
      console.log('🔍 Navbar - No valid user found, showing login button');
      console.log('🔍 Navbar - User state:', user);
      console.log('🔍 Navbar - Fallback user state:', fallbackUser);
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
        <FaBars className='menu-icon' onClick={toggleMenu}/>
        {showProfile && (
          <UserProfilePopup user={user} onClose={() => setShowProfile(false)} />
        )}
      </div>
      
      <ul className={mobileMenu?'':'hide-mobile-menu'}>
        <li>
          {location.pathname === '/' ? (
            <Link to="hero" smooth={true} offset={0} duration={500}>{t('navigation.home')}</Link>
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
            <Link to="serv" smooth={true} offset={-280} duration={500}>{t('navigation.services')}</Link>
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
            <Link to="about" smooth={true} offset={-160} duration={500}>{t('navigation.about')}</Link>
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
          <a href="/gallery" className="gallery-link">{t('navigation.gallery')}</a>
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