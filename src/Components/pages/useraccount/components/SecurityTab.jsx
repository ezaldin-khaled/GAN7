import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt } from 'react-icons/fa';
import './TabDescriptions.css';

const SecurityTab = () => {
  const { t } = useTranslation();
  
  return (
    <div className="content-section">
      <h1 className="section-title">{t('security.title')}</h1>
      
      {/* Tab Description */}
      <div className="tab-description security-theme">
        <div className="description-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>
        <div className="description-content">
          <h3>Account Security & Password Management</h3>
          <p>Secure your account with strong passwords and manage your security settings. Keep your account safe and protected with our security features.</p>
        </div>
      </div>
      
      <div className="security-section">
        <h2>{t('security.changePassword')}</h2>
        <div className="form-group">
          <label>{t('security.currentPassword')}</label>
          <input type="password" placeholder={t('security.currentPassword')} />
        </div>
        <div className="form-group">
          <label>{t('security.newPassword')}</label>
          <input type="password" placeholder={t('security.newPassword')} />
        </div>
        <div className="form-group">
          <label>{t('security.confirmNewPassword')}</label>
          <input type="password" placeholder={t('security.confirmNewPassword')} />
        </div>
        <button className="save-button">{t('security.updatePassword')}</button>
      </div>
      
    </div>
  );
};

export default SecurityTab;