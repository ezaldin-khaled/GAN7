import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './LanguageSwitcherExample.css';

const LanguageSwitcherExample = () => {
  const { t } = useTranslation();

  return (
    <nav className="example-navbar">
      <div className="navbar-brand">
        <h1>{t('navigation.home')}</h1>
      </div>
      
      <div className="navbar-menu">
        <a href="#services">{t('navigation.services')}</a>
        <a href="#about">{t('navigation.about')}</a>
        <a href="#contact">{t('navigation.contact')}</a>
      </div>
      
      <div className="navbar-actions">
        <LanguageSwitcher />
        <button className="login-btn">{t('navigation.login')}</button>
      </div>
    </nav>
  );
};

export default LanguageSwitcherExample; 