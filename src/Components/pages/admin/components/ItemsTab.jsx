import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaEye, FaUsers } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './RestrictedUsersTab.css';

const SUBSCRIPTION_PLANS = {
    talent: ['free', 'silver', 'gold', 'platinum'],
    background: ['free', 'back_ground_jobs'],
    band_subscription: ['bands']
};

const ItemsTab = () => {
  // Items state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Tab navigation
  const [activeSubTab, setActiveSubTab] = useState('items');
  
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
    fetchItems();
    fetchRestrictedUsers();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/items/');
      setItems(response.data.items);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch items');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axiosInstance.delete(`/api/admin/items/${itemId}/`);
        fetchItems();
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="items-tab">
      <div className="tab-header">
        <h2>Item Management</h2>
        <div className="sub-tab-navigation">
          <button 
            className={`sub-tab-btn ${activeSubTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('items')}
          >
            <FaSearch />
            Items
          </button>
          <button 
            className={`sub-tab-btn ${activeSubTab === 'restricted' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('restricted')}
          >
            <FaUsers />
            Restricted Users
          </button>
        </div>
      </div>

      {activeSubTab === 'items' ? (
        <>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-thumbnail"
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>
                        <span className={`type-badge ${item.type}`}>
                          {item.type}
                        </span>
                      </td>
                      <td>${item.price}</td>
                      <td>{item.owner_name}</td>
                      <td>
                        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-btn"
                            onClick={() => handleViewItem(item)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="edit-btn"
                            onClick={() => handleEditItem(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showViewModal && selectedItem && (
            <ViewItemModal
              item={selectedItem}
              onClose={() => {
                setShowViewModal(false);
                setSelectedItem(null);
              }}
            />
          )}

          {showEditModal && selectedItem && (
            <EditItemModal
              item={selectedItem}
              onClose={() => {
                setShowEditModal(false);
                setSelectedItem(null);
              }}
              onSave={fetchItems}
            />
          )}
        </>
      ) : (
        <div className="restricted-users-tab">
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
      )}
    </div>
  );
};

const ViewItemModal = ({ item, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Item Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="item-details">
          <div className="item-image">
            <img src={item.image} alt={item.name} />
          </div>
          <div className="item-info">
            <h4>{item.name}</h4>
            <p><strong>Type:</strong> {item.type}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Owner:</strong> {item.owner_name}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Status:</strong> {item.is_active ? 'Active' : 'Inactive'}</p>
            {item.type === 'prop' && (
              <>
                <p><strong>Material:</strong> {item.material}</p>
                <p><strong>Used in Movie:</strong> {item.used_in_movie}</p>
                <p><strong>Condition:</strong> {item.condition}</p>
              </>
            )}
            {item.type === 'costume' && (
              <>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Worn By:</strong> {item.worn_by}</p>
                <p><strong>Era:</strong> {item.era}</p>
              </>
            )}
            {/* Add other item type specific fields */}
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const EditItemModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price,
    is_active: item.is_active,
    // Add other fields based on item type
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.put(`/api/admin/items/${item.id}/`, formData);
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Item</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
          {/* Add other fields based on item type */}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemsTab; 