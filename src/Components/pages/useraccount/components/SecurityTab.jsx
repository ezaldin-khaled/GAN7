import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt } from 'react-icons/fa';

const SecurityTab = () => {
  const { t } = useTranslation();
  
  return (
    <div className="content-section">
      <h1 className="section-title">{t('security.title')}</h1>
      
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