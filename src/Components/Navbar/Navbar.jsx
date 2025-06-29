import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from'../../assets/10.png'
import menu_icon from '../../assets/menu-icon.png'
import '../Navbar/Navbar.css'
import { Link } from 'react-scroll';
import UserProfilePopup from './UserProfilePopup';
import { AuthContext } from '../context/AuthContext';

function Navbar() {

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
            <Link to="hero" smooth={true} offset={0} duration={500}>Home</Link>
          ) : (
            <button 
              className="nav-link-btn" 
              onClick={() => handleNavigation('hero')}
            >
              Home
            </button>
          )}
        </li>
        <li>
          {location.pathname === '/' ? (
            <Link to="serv" smooth={true} offset={-280} duration={500}>Services</Link>
          ) : (
            <button 
              className="nav-link-btn" 
              onClick={() => handleNavigation('serv')}
            >
              Services
            </button>
          )}
        </li>
        <li>
          {location.pathname === '/' ? (
            <Link to="about" smooth={true} offset={-160} duration={500}>About Us</Link>
          ) : (
            <button 
              className="nav-link-btn" 
              onClick={() => handleNavigation('about')}
            >
              About Us
            </button>
          )}
        </li>
        <li>
          <a href="/gallery" className="gallery-link">Gallery</a>
        </li>
        {/* <li>
          <Link to="footer" smooth={true} offset={-260} duration={500}>Contact Us</Link>
        </li> */}
        {!user ? (
          <li>
            <a href="/login" className="btn">Login</a>
          </li>
        ) : (
          <li>
            <button className="avatar-btn" onClick={() => setShowProfile(true)}>
              <img src={user.profilePic} alt="Profile" className="avatar-img" />
            </button>
          </li>
        )}
      </ul>
      <img src={menu_icon} alt="" className='menu-icon' onClick={toggleMenu}/>
      {showProfile && (
        <UserProfilePopup user={user} onClose={() => setShowProfile(false)} />
      )}
    </nav>
  );
};

export default Navbar;