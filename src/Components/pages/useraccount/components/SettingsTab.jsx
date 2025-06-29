import React from 'react';

const SettingsTab = () => {
  return (
    <div className="content-section">
      <h1 className="section-title">Account Settings</h1>
      
      <div className="settings-section">
        <h2>Notification Preferences</h2>
        <div className="setting-option">
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
          <div>
            <h3>Email Notifications</h3>
            <p>Receive email updates about your account activity</p>
          </div>
        </div>
        <div className="setting-option">
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
          <div>
            <h3>Marketing Emails</h3>
            <p>Receive promotional content and offers</p>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Language & Region</h2>
        <div className="form-group">
          <label>Language</label>
          <select defaultValue="en">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <div className="form-group">
          <label>Time Zone</label>
          <select defaultValue="utc">
            <option value="utc">UTC (Coordinated Universal Time)</option>
            <option value="est">EST (Eastern Standard Time)</option>
            <option value="pst">PST (Pacific Standard Time)</option>
            <option value="cet">CET (Central European Time)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;