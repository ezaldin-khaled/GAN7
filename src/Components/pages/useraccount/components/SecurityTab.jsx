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
      
    </div>
  );
};

export default SecurityTab;