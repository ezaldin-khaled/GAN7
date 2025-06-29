import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const SecurityTab = () => {
  return (
    <div className="content-section">
      <h1 className="section-title">Security</h1>
      
      <div className="security-section">
        <h2>Change Password</h2>
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" placeholder="Enter current password" />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" placeholder="Enter new password" />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" />
        </div>
        <button className="save-button">Update Password</button>
      </div>
      
      <div className="security-section">
        <h2>Two-Factor Authentication</h2>
        <div className="setting-option">
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
          <div>
            <h3>Enable 2FA</h3>
            <p>Add an extra layer of security to your account</p>
          </div>
        </div>
        <button className="secondary-button">Set Up 2FA</button>
      </div>

      <div className="security-section">
        <h2>Login Sessions</h2>
        <div className="session-item">
          <div>
            <h3>Current Session</h3>
            <p>Windows - Chrome - May 15, 2023</p>
          </div>
          <span className="session-active">Active Now</span>
        </div>
        <button className="danger-button">Log Out All Other Devices</button>
      </div>
    </div>
  );
};

export default SecurityTab;