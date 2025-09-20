import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './RestrictedUsersTab.css';

const SUBSCRIPTION_PLANS = {
    talent: ['free', 'silver', 'gold', 'platinum'],
    background: ['free', 'back_ground_jobs'],
    band_subscription: ['bands']
};

const ItemsTab = () => {
  // Restricted users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [stats, setStats] = useState({
      total_count: 0,
      approved_count: 0,
      pending_count: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({
      type: 'talent',
      plan: 'free'
  });
  const [restrictedCountries, setRestrictedCountries] = useState([]);

  useEffect(() => {
    fetchRestrictedUsers();
  }, []);


  // Restricted Users Functions
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const showErrorMessage = (message) => {
    setUsersError(message);
    setTimeout(() => setUsersError(null), 5000);
  };

  const fetchRestrictedUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const response = await axiosInstance.get('/api/dashboard/restricted-users/');
      setUsers(response.data.users);
      setStats({
        total_count: response.data.total_count,
        approved_count: response.data.approved_count,
        pending_count: response.data.pending_count
      });
      setRestrictedCountries(response.data.restricted_countries);
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            showErrorMessage("Please log in to access this feature");
            break;
          case 403:
            showErrorMessage("You don't have permission to access this feature");
            break;
          default:
            showErrorMessage("Failed to fetch restricted users");
        }
      } else {
        showErrorMessage("Network error. Please check your connection");
      }
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAction = async (action, userId, data = {}) => {
    try {
      setActionLoading(true);
      setUsersError(null);
      const response = await axiosInstance.post('/api/dashboard/restricted-users/', {
        action,
        user_id: userId,
        ...data
      });
      
      showSuccessMessage(response.data.message);
      await fetchRestrictedUsers();
      
      if (action === 'approve_user' || action === 'update_user') {
        setShowSubscriptionModal(false);
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            showErrorMessage("Please log in to access this feature");
            break;
          case 403:
            showErrorMessage("You don't have permission to perform this action");
            break;
          case 404:
            showErrorMessage("User not found");
            await fetchRestrictedUsers();
            break;
          case 400:
            if (err.response.data.error.includes("talent profile")) {
              showErrorMessage("User needs a talent profile before getting band subscription");
            } else if (err.response.data.error.includes("background profile")) {
              showErrorMessage("User needs a background profile before getting background subscription");
            } else {
              showErrorMessage(err.response.data.error);
            }
            break;
          default:
            showErrorMessage("An error occurred. Please try again later");
        }
      } else {
        showErrorMessage("Network error. Please check your connection");
      }
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanUsers = async () => {
    await handleAction('scan_users');
  };

  const handleApproveUser = async (userId, accountType, notes) => {
    await handleAction('approve_user', userId, { account_type: accountType, notes });
  };

  const handleUpdateUser = async (userId, accountType, notes) => {
    await handleAction('update_user', userId, { account_type: accountType, notes });
  };

  const handleGiveBandSubscription = async (userId, subscriptionType, notes) => {
    await handleAction('give_band_subscription', userId, { band_subscription_type: subscriptionType, notes });
  };

  const handleGiveBackgroundAccount = async (userId, accountType, notes) => {
    await handleAction('give_background_account', userId, { background_account_type: accountType, notes });
  };

  const handleOpenSubscriptionModal = (user) => {
    setSelectedUser(user);
    setShowSubscriptionModal(true);
  };

  const handleApplySubscription = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      switch (selectedPlan.type) {
        case 'talent':
          await handleUpdateUser(selectedUser.id, selectedPlan.plan);
          break;
        case 'background':
          await handleGiveBackgroundAccount(selectedUser.id, selectedPlan.plan);
          break;
        case 'band_subscription':
          await handleGiveBandSubscription(selectedUser.id, selectedPlan.plan);
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="restricted-users-tab">
      <div className="tab-header">
        <h2>Restricted Users Management</h2>
      </div>

      {usersError && (
        <div className="error-message">
          {usersError}
        </div>
      )}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="stats-container">
        <div className="stat-box">
          <h3>Total Users</h3>
          <p>{stats.total_count}</p>
        </div>
        <div className="stat-box">
          <h3>Approved</h3>
          <p>{stats.approved_count}</p>
        </div>
        <div className="stat-box">
          <h3>Pending</h3>
          <p>{stats.pending_count}</p>
        </div>
      </div>

      <div className="actions-container">
        <button 
          className="scan-button"
          onClick={handleScanUsers}
          disabled={actionLoading}
        >
          Scan Users
        </button>
        <div className="restricted-countries">
          <span>Restricted Countries: </span>
          {restrictedCountries.join(', ')}
        </div>
      </div>

      {usersLoading ? (
        <div className="loading">Loading restricted users...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Status</th>
                <th>Account Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-name">
                      {user.user.first_name || <span className="no-name">Not provided</span>}
                    </div>
                  </td>
                  <td>
                    <div className="user-name">
                      {user.user.last_name || <span className="no-name">Not provided</span>}
                    </div>
                  </td>
                  <td>
                    <div className="user-email">
                      {user.user.email || <span className="no-name">Not provided</span>}
                    </div>
                  </td>
                  <td>{user.country}</td>
                  <td>
                    <span className={`status-badge ${user.is_approved ? 'approved' : 'pending'}`}>
                      {user.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>{user.account_type}</td>
                  <td>
                    <div className="action-buttons">
                      {!user.is_approved && (
                      <button
                          onClick={() => handleApproveUser(user.id, 'free')}
                          disabled={actionLoading}
                      >
                          Approve
                      </button>
                      )}
                      <button
                        onClick={() => handleOpenSubscriptionModal(user)}
                        disabled={actionLoading}
                        className="subscription-btn"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSubscriptionModal && selectedUser && (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
              <h3>
                Manage Subscription for{' '}
                <span className="user-full-name">
                  {selectedUser.user.first_name || 'No first name'} {selectedUser.user.last_name || 'No last name'}
                </span>
              </h3>
              <div className="user-email">
                {selectedUser.user.email || 'No email provided'}
        </div>
              <button 
                className="close-btn"
                onClick={() => setShowSubscriptionModal(false)}
              >
                ×
              </button>
          </div>
            <div className="modal-body">
              <div className="subscription-form">
                <div className="form-group">
                  <label>Subscription Type</label>
                  <select
                    value={selectedPlan.type}
                    onChange={(e) => setSelectedPlan(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="talent">Talent Account</option>
                    <option value="background">Production Assets Pro Account</option>
                    <option value="band_subscription">Band Subscription</option>
                  </select>
          </div>
                <div className="form-group">
                  <label>Plan</label>
                  <select
                    value={selectedPlan.plan}
                    onChange={(e) => setSelectedPlan(prev => ({ ...prev, plan: e.target.value }))}
                  >
                    {SUBSCRIPTION_PLANS[selectedPlan.type].map(plan => (
                      <option key={plan} value={plan}>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </option>
                    ))}
                  </select>
        </div>
      </div>
    </div>
          <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowSubscriptionModal(false)}
              >
                Cancel
              </button>
              <button
                className="apply-btn"
                onClick={handleApplySubscription}
                disabled={actionLoading}
              >
                Apply Changes
            </button>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};


export default ItemsTab; 