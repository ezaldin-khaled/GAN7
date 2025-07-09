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
  const { user } = useContext(AuthContext);
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

  return (
    <nav className={`container ${sticky? 'dark-nav' : ''}`}>
              <img src={logo} alt="" className='logo' onClick={() => navigate('/')} style={{cursor: 'pointer'}} />
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
          <Link to="footer" smooth={true} offset={-260} duration={500}>Contact Us</Link>
        </li> */}
        <li>
          <LanguageSwitcher />
        </li>
        {!user ? (
          <li>
            <a href="/login" className="btn">{t('navigation.login')}</a>
          </li>
        ) : (
          <li>
            <button className="avatar-btn" onClick={() => setShowProfile(true)}>
              {user.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt="Profile" 
                  className="avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {!user.profilePic && (
                <div className="avatar-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </button>
          </li>
        )}
      </ul>
      <FaBars className='menu-icon' onClick={toggleMenu}/>
      {showProfile && (
        <UserProfilePopup user={user} onClose={() => setShowProfile(false)} />
      )}
    </nav>
  );
};

export default Navbar;