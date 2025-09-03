import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUser, FaPaperPlane, FaSpinner, FaUsers, FaHistory } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './EmailTab.css';

const EmailTab = ({ selectedUser }) => {
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    recipientEmail: '',
    recipientName: '',
    user_ids: [],
    send_immediately: true
  });
  const [loading, setLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailMode, setEmailMode] = useState('single'); // 'single' or 'bulk'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Update form when selectedUser changes
  useEffect(() => {
    console.log('=== EMAIL TAB: selectedUser changed ===');
    console.log('selectedUser:', selectedUser);
    
    if (selectedUser) {
      // Extract email from various possible locations
      const email = selectedUser.email || 
                   selectedUser.user?.email || 
                   selectedUser.user_email ||
                   selectedUser.profile?.email ||
                   selectedUser.user_info?.email ||
                   '';
      
      // Extract name from various possible locations
      const name = selectedUser.name || 
                  selectedUser.user?.name || 
                  selectedUser.user_name ||
                  selectedUser.title ||
                  selectedUser.username ||
                  selectedUser.first_name ||
                  selectedUser.last_name ||
                  (selectedUser.first_name && selectedUser.last_name ? 
                    `${selectedUser.first_name} ${selectedUser.last_name}` : '') ||
                  selectedUser.profile?.name ||
                  selectedUser.user_info?.name ||
                  'User';
      
      console.log('Extracted email:', email);
      console.log('Extracted name:', name);
      
      setEmailForm(prev => ({
        ...prev,
        recipientEmail: email,
        recipientName: name,
        user_ids: [selectedUser.id]
      }));
      setEmailMode('single');
      
      console.log('Email form updated with:', {
        recipientEmail: email,
        recipientName: name,
        user_ids: [selectedUser.id]
      });
    } else {
      // Clear form when no user is selected
      setEmailForm(prev => ({
        ...prev,
        recipientEmail: '',
        recipientName: '',
        user_ids: []
      }));
      console.log('Email form cleared');
    }
  }, [selectedUser]);

  // Load available users for bulk email
  useEffect(() => {
    if (emailMode === 'bulk') {
      loadAvailableUsers();
    }
  }, [emailMode]);

  // Load email history
  useEffect(() => {
    console.log('EmailTab component mounted, loading email history...');
    loadEmailHistory();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/list/');
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadEmailHistory = async () => {
    setHistoryLoading(true);
    try {
      console.log('Loading email history...');
      const response = await axiosInstance.get('/api/dashboard/email/list/');
      
      if (Array.isArray(response.data)) {
        setEmailHistory(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setEmailHistory(response.data.results);
      } else {
        setEmailHistory([]);
      }
    } catch (error) {
      console.error('Error loading email history:', error);
      setEmailHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (emailMode === 'single') {
      if (!emailForm.subject.trim() || !emailForm.message.trim() || !emailForm.recipientEmail.trim()) {
        setEmailError('Please fill in all required fields.');
        return;
      }
    } else {
      if (!emailForm.subject.trim() || !emailForm.message.trim() || selectedUsers.length === 0) {
        setEmailError('Please fill in all required fields and select at least one recipient.');
        return;
      }
    }

    setLoading(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const emailData = {
        subject: emailForm.subject,
        message: emailForm.message,
        send_immediately: emailForm.send_immediately
      };

      if (emailMode === 'single') {
        emailData.recipient_email = emailForm.recipientEmail;
        emailData.recipient_name = emailForm.recipientName;
      } else {
        emailData.user_ids = selectedUsers;
      }

      console.log('Sending email with data:', emailData);
      
      const response = await axiosInstance.post('/api/dashboard/email/send/', emailData);
      
      console.log('Email sent successfully:', response.data);
      
      setEmailSuccess('Email sent successfully!');
      
      // Clear form
      setEmailForm({
        subject: '',
        message: '',
        recipientEmail: '',
        recipientName: '',
        user_ids: [],
        send_immediately: true
      });
      
      // Clear selected users for bulk mode
      if (emailMode === 'bulk') {
        setSelectedUsers([]);
      }
      
      // Reload email history
      loadEmailHistory();
      
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error.response?.data?.message || 'Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setEmailSuccess('');
    setEmailError('');
  };

  return (
    <div className="email-tab-container">
      <div className="email-tab-header">
        <h2>Email Management</h2>
        <p>Send emails to users individually or in bulk. Manage your email communications efficiently.</p>
      </div>

      {/* Email Mode Toggle */}
      <div className="email-mode-toggle">
        <button 
          className={emailMode === 'single' ? 'active' : ''}
          onClick={() => setEmailMode('single')}
        >
          <FaUser />
          Single User
        </button>
        <button 
          className={emailMode === 'bulk' ? 'active' : ''}
          onClick={() => setEmailMode('bulk')}
        >
          <FaUsers />
          Bulk Email
        </button>
      </div>

      {/* Success/Error Messages */}
      {emailSuccess && (
        <div className="success-message" onClick={clearMessages}>
          <FaEnvelope />
          {emailSuccess}
        </div>
      )}
      
      {emailError && (
        <div className="error-message" onClick={clearMessages}>
          <FaEnvelope />
          {emailError}
        </div>
      )}

      {/* Email Form */}
      <div className="email-form-container">
        <form className="email-form" onSubmit={handleSendEmail}>
          {emailMode === 'single' ? (
            // Single user email form
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recipientName">Recipient Name</label>
                  <input
                    type="text"
                    id="recipientName"
                    value={emailForm.recipientName}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="Enter recipient name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="recipientEmail">Recipient Email</label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={emailForm.recipientEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="Enter recipient email"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            // Bulk email form
            <div className="user-selector">
              <div className="user-selector-header">
                <h3>Select Recipients</h3>
                <button 
                  type="button"
                  className="user-selector-toggle"
                  onClick={() => setShowUserSelector(!showUserSelector)}
                >
                  {showUserSelector ? 'Hide Users' : 'Show Users'}
                </button>
              </div>
              
              {showUserSelector && (
                <div className="user-list">
                  {availableUsers.map(user => (
                    <div key={user.id} className="user-item">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <div className="user-info">
                        <div className="user-name">{user.name || user.username}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedUsers.length > 0 && (
                <div className="selected-users-display">
                  {selectedUsers.map(userId => {
                    const user = availableUsers.find(u => u.id === userId);
                    return (
                      <div key={userId} className="selected-user-tag">
                        {user?.name || user?.username || 'Unknown User'}
                        <button
                          type="button"
                          className="remove-user"
                          onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sendImmediately">Send Immediately</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="sendImmediately"
                  checked={emailForm.send_immediately}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, send_immediately: e.target.checked }))}
                />
                <label htmlFor="sendImmediately">Send email immediately</label>
              </div>
            </div>
          </div>

          <div className="form-row full-width">
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your email message here..."
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="send-email-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Sending Email...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Email
              </>
            )}
          </button>
        </form>
      </div>

      {/* Email History */}
      <div className="email-history-section">
        <div className="email-history-header">
          <h3>Email History</h3>
          <button 
            className="refresh-history-btn"
            onClick={loadEmailHistory}
            disabled={historyLoading}
          >
            <FaHistory />
            {historyLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {historyLoading ? (
          <div className="loading-spinner">
            <FaSpinner className="spinner" />
            Loading email history...
          </div>
        ) : emailHistory.length === 0 ? (
          <div className="empty-state">
            <FaEnvelope className="empty-state-icon" />
            <h3>No emails sent yet</h3>
            <p>Your email history will appear here once you start sending emails.</p>
          </div>
        ) : (
          <div className="email-history-list">
            {emailHistory.map((email, index) => (
              <div key={index} className="email-history-item">
                <div className="email-header">
                  <div className="email-subject">{email.subject}</div>
                  <div className="email-date">{email.sent_at}</div>
                </div>
                <div className="email-recipients">To: {email.recipients}</div>
                <div className={`email-status ${email.status}`}>
                  {email.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTab; 