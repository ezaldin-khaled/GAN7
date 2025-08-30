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

  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMenu = ()=>{
      mobileMenu? setMobileMenu(false) : setMobileMenu(true)
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