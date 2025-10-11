import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    changeLanguage(newLanguage);
  };

  return (
    <button 
      className="language-toggle-btn"
      onClick={toggleLanguage}
      aria-label="Switch Language"
      title={currentLanguage === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      {currentLanguage === 'en' ? 'AR' : 'EN'}
    </button>
  );
};

export default LanguageSwitcher; 