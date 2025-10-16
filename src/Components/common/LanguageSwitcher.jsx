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
      aria-label={`Switch to ${currentLanguage === 'en' ? 'Arabic' : 'English'}`}
      title={currentLanguage === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      {currentLanguage === 'en' ? 'AR' : 'EN'}
    </button>
  );
};

export default LanguageSwitcher; 