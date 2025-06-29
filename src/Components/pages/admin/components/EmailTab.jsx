import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUser, FaPaperPlane, FaSpinner, FaUsers, FaList, FaEye, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import '../AdminDashboard.css';

const API_BASE_URL = 'http://192.168.0.104:8000/api';

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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recentEmails, setRecentEmails] = useState([]);
  const [emailMode, setEmailMode] = useState('single'); // 'single' or 'bulk'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

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
      const token = localStorage.getItem('access');
      const response = await axios.get(`${API_BASE_URL}/users/list/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadEmailHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('access');
      console.log('Loading email history...');
      console.log('API URL:', `${API_BASE_URL}/dashboard/email/list/`);
      
      const response = await axios.get(`${API_BASE_URL}/dashboard/email/list/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Email history API response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      if (Array.isArray(response.data)) {
        setEmailHistory(response.data);
        console.log('Email history set successfully:', response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setEmailHistory(response.data.results);
        console.log('Email history set from results:', response.data.results);
      } else {
        console.warn('Unexpected response format:', response.data);
        setEmailHistory([]);
      }
    } catch (error) {
      console.error('Error loading email history:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setEmailHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Function to refresh email data
  const refreshEmailData = () => {
    loadEmailHistory();
  };

  // Function to format email date
  const formatEmailDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to get recent emails (last 24 hours)
  const getRecentEmails = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return emailHistory.filter(email => new Date(email.created_at) > oneDayAgo);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserSelection = (userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
      setEmailForm(prev => ({
        ...prev,
        user_ids: [...prev.user_ids, userId]
      }));
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      setEmailForm(prev => ({
        ...prev,
        user_ids: prev.user_ids.filter(id => id !== userId)
      }));
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (emailMode === 'single') {
      if (!emailForm.subject.trim() || !emailForm.message.trim() || !emailForm.recipientEmail.trim()) {
        setErrorMessage('Please fill in all required fields.');
        return;
      }
    } else {
      if (!emailForm.subject.trim() || !emailForm.message.trim() || emailForm.user_ids.length === 0) {
        setErrorMessage('Please fill in all required fields and select at least one recipient.');
        return;
      }
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('access');
      
      if (emailMode === 'single') {
        // Single email
        const response = await axios.post(`${API_BASE_URL}/dashboard/send-email/`, {
          recipient_email: emailForm.recipientEmail,
          recipient_name: emailForm.recipientName,
          subject: emailForm.subject,
          message: emailForm.message,
          user_id: selectedUser?.id
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          setSuccessMessage('Email sent successfully!');
          addToRecentEmails(emailForm.recipientName, emailForm.subject, 'sent');
          clearForm();
        }
      } else {
        // Bulk email
        const response = await axios.post(`${API_BASE_URL}/dashboard/email/send/`, {
          subject: emailForm.subject,
          message: emailForm.message,
          user_ids: emailForm.user_ids,
          send_immediately: emailForm.send_immediately
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          const result = response.data;
          setSuccessMessage(`${result.message} (${result.emails_sent} sent, ${result.emails_failed} failed)`);
          addToRecentEmails(`${result.total_recipients} recipients`, emailForm.subject, 'sent');
          clearForm();
          loadEmailHistory(); // Refresh history
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setErrorMessage(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Failed to send email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const addToRecentEmails = (recipient, subject, status) => {
    setRecentEmails(prev => [{
      id: Date.now(),
      recipient,
      subject,
      sentAt: new Date().toLocaleString(),
      status
    }, ...prev.slice(0, 9)]);
  };

  const clearForm = () => {
    setEmailForm(prev => ({
      ...prev,
      subject: '',
      message: ''
    }));
    setSelectedUsers([]);
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <div className="email-tab">
      <div className="email-header">
        <h2><FaEnvelope /> Email System</h2>
        <p>Send emails to users directly from the admin dashboard</p>
        
        <div className="email-mode-selector">
          <button
            type="button"
            className={`mode-btn ${emailMode === 'single' ? 'active' : ''}`}
            onClick={() => setEmailMode('single')}
          >
            <FaUser /> Single Email
          </button>
          <button
            type="button"
            className={`mode-btn ${emailMode === 'bulk' ? 'active' : ''}`}
            onClick={() => setEmailMode('bulk')}
          >
            <FaUsers /> Bulk Email
          </button>
          <button
            type="button"
            className="history-btn"
            onClick={() => setShowUserSelector(!showUserSelector)}
          >
            <FaUsers /> User Selector
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="success-message" onClick={clearMessages}>
          <FaPaperPlane /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message" onClick={clearMessages}>
          <FaEnvelope /> {errorMessage}
        </div>
      )}

      {selectedUser && (
        <div className="user-selected-notification">
          <FaUser /> 
          <span>
            <strong>{emailForm.recipientName || 'User'}</strong> selected for email 
            {emailForm.recipientEmail && ` (${emailForm.recipientEmail})`}
          </span>
          <button 
            className="clear-selection-btn"
            onClick={() => {
              setSelectedUser(null);
              setEmailForm(prev => ({
                ...prev,
                recipientEmail: '',
                recipientName: '',
                user_ids: []
              }));
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="email-content">
        <div className="email-form-section">
          <form onSubmit={handleSendEmail} className="email-form">
            {emailMode === 'single' ? (
              // Single email form
              <>
                <div className="form-group">
                  <label htmlFor="recipientEmail">
                    <FaUser /> Recipient Email *
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    name="recipientEmail"
                    value={emailForm.recipientEmail}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                    required
                    disabled={selectedUser}
                    className={selectedUser && emailForm.recipientEmail ? 'auto-filled' : ''}
                  />
                  {selectedUser && emailForm.recipientEmail && (
                    <small className="form-help auto-fill-indicator">
                      ✅ Auto-filled: {emailForm.recipientEmail}
                    </small>
                  )}
                  {selectedUser && !emailForm.recipientEmail && (
                    <small className="form-help warning">
                      ⚠️ No email found for this user
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="recipientName">
                    <FaUser /> Recipient Name
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={emailForm.recipientName}
                    onChange={handleInputChange}
                    placeholder="User Name"
                    disabled={selectedUser}
                    className={selectedUser && emailForm.recipientName ? 'auto-filled' : ''}
                  />
                  {selectedUser && emailForm.recipientName && (
                    <small className="form-help auto-fill-indicator">
                      ✅ Auto-filled: {emailForm.recipientName}
                    </small>
                  )}
                  {selectedUser && !emailForm.recipientName && (
                    <small className="form-help warning">
                      ⚠️ No name found for this user
                    </small>
                  )}
                </div>
              </>
            ) : (
              // Bulk email form
              <>
                <div className="form-group">
                  <label>
                    <FaUsers /> Select Recipients *
                  </label>
                  <button
                    type="button"
                    className="select-users-btn"
                    onClick={() => setShowUserSelector(!showUserSelector)}
                  >
                    {selectedUsers.length > 0 
                      ? `${selectedUsers.length} user(s) selected` 
                      : 'Click to select users'
                    }
                  </button>
                  {selectedUsers.length > 0 && (
                    <small className="form-help">
                      {selectedUsers.length} user(s) will receive this email
                    </small>
                  )}
                </div>

                {showUserSelector && (
                  <div className="user-selector">
                    <div className="user-list">
                      {availableUsers.map(user => (
                        <label key={user.id} className="user-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                          />
                          <span className="user-info">
                            <strong>{user.name || user.username}</strong>
                            <small>{user.email}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="send_immediately"
                      checked={emailForm.send_immediately}
                      onChange={handleInputChange}
                    />
                    Send immediately
                  </label>
                  <small className="form-help">
                    Uncheck to save as draft
                  </small>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="subject">
                <FaEnvelope /> Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={emailForm.subject}
                onChange={handleInputChange}
                placeholder="Email subject"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">
                <FaEnvelope /> Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={emailForm.message}
                onChange={handleInputChange}
                placeholder="Enter your message here..."
                rows="8"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="send-email-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    {emailMode === 'single' ? 'Send Email' : 'Send Bulk Email'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="email-sidebar">
          {/* Always show email history when we have data */}
          {emailHistory.length > 0 && (
            <div className="email-history-section">
              <div className="history-header">
                <h3><FaHistory /> Email History ({emailHistory.length})</h3>
                <button 
                  className="refresh-btn"
                  onClick={refreshEmailData}
                  title="Refresh email history"
                >
                  <FaSpinner className="refresh-icon" />
                </button>
              </div>
              
              {/* Recent Emails (Last 24 hours) */}
              <div className="recent-emails-filter">
                <h4>Recent Emails (Last 24 Hours) - {getRecentEmails().length}</h4>
                {getRecentEmails().length > 0 ? (
                  <div className="email-history-list">
                    {getRecentEmails().map(email => (
                      <div key={email.id} className="history-email-item recent">
                        <div className="email-info">
                          <div className="email-subject">{email.subject}</div>
                          <div className="email-recipient-info">
                            <span className="recipient-name">{email.recipient_name || 'Unknown'}</span>
                            <span className="recipient-email">({email.recipient_email || 'No email'})</span>
                          </div>
                          <div className="email-stats">
                            {email.total_recipients} recipient(s) • {email.emails_sent} sent • {email.emails_failed} failed
                          </div>
                          <div className="email-time">{formatEmailDate(email.created_at)}</div>
                        </div>
                        <div className="email-status">
                          <span className={`status-badge ${email.status}`}>
                            {email.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-recent-emails">
                    <p>No emails sent in the last 24 hours</p>
                  </div>
                )}
              </div>

              {/* All Email History */}
              <div className="all-email-history">
                <h4>All Email History</h4>
                <div className="email-history-list">
                  {emailHistory.map(email => (
                    <div key={email.id} className="history-email-item">
                      <div className="email-info">
                        <div className="email-subject">{email.subject}</div>
                        <div className="email-recipient-info">
                          <span className="recipient-name">{email.recipient_name || 'Unknown'}</span>
                          <span className="recipient-email">({email.recipient_email || 'No email'})</span>
                        </div>
                        <div className="email-stats">
                          {email.total_recipients} recipient(s) • {email.emails_sent} sent • {email.emails_failed} failed
                        </div>
                        <div className="email-time">{formatEmailDate(email.created_at)}</div>
                      </div>
                      <div className="email-status">
                        <span className={`status-badge ${email.status}`}>
                          {email.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Show recent emails section only when no history data */}
          {emailHistory.length === 0 && (
            <div className="recent-emails-section">
              <h3><FaList /> Recent Emails</h3>
              {recentEmails.length > 0 ? (
                <div className="recent-emails-list">
                  {recentEmails.map(email => (
                    <div key={email.id} className="recent-email-item">
                      <div className="email-info">
                        <div className="email-recipient">{email.recipient}</div>
                        <div className="email-subject">{email.subject}</div>
                        <div className="email-time">{email.sentAt}</div>
                      </div>
                      <div className="email-status">
                        <span className={`status-badge ${email.status}`}>
                          {email.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-emails">
                  <FaEnvelope />
                  <p>No emails sent yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTab;