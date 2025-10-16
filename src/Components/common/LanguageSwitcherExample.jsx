import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './LanguageSwitcherExample.css';

const LanguageSwitcherExample = () => {
  const { t } = useTranslation();

  return (
    <div className="language-switcher-demo">
      <div className="demo-header">
        <h2>Modern Language Switcher Demo</h2>
        <p>Enhanced with modern styling, animations, and accessibility features</p>
      </div>
      
      <div className="demo-navbar">
        <div className="navbar-brand">
          <h3>Your App</h3>
        </div>
        
        <div className="navbar-menu">
          <a href="#services">{t('navigation.services')}</a>
          <a href="#about">{t('navigation.about')}</a>
          <a href="#contact">{t('navigation.contact')}</a>
        </div>
        
        <div className="navbar-actions">
          <LanguageSwitcher />
          <button className="demo-login-btn">Login</button>
        </div>
      </div>
      
      <div className="demo-features">
        <h3>New Features:</h3>
        <ul>
          <li>✨ Modern gradient design matching your brand colors</li>
          <li>🎨 Smooth animations and hover effects</li>
          <li>📱 Fully responsive design</li>
          <li>♿ Enhanced accessibility with proper ARIA labels</li>
          <li>🌍 RTL support for Arabic language</li>
          <li>🎯 Better visual hierarchy with language display</li>
          <li>⚡ Optimized performance with reduced motion support</li>
        </ul>
      </div>
    </div>
  );
};

export default LanguageSwitcherExample; 