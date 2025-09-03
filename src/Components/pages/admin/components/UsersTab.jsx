import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaUserShield, FaPlus } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [excludeAdmins, setExcludeAdmins] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [excludeAdmins]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/dashboard/users/`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/api/dashboard/users/${userId}/`);
        fetchUsers();
      } catch (err) {
        if (err.response?.status === 400) {
          setError('You cannot delete your own account');
        } else if (err.response?.status === 403) {
          setError('You cannot delete other admin users');
        } else {
          setError('Failed to delete user');
        }
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-tab">
      <div className="tab-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="filter-actions">
            <label className="admin-filter">
              <input
                type="checkbox"
                checked={excludeAdmins}
                onChange={(e) => setExcludeAdmins(e.target.checked)}
              />
              Exclude Admins
            </label>
            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
              <FaPlus /> Create User
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      {user.profile_picture ? (
                        <img 
                          src={user.profile_picture} 
                          alt={`${user.first_name} ${user.last_name}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {!user.profile_picture && (
                        <div className="user-avatar-placeholder">
                          {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <span>{`${user.first_name} ${user.last_name}`}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.is_staff ? 'admin' : 'user'}`}>
                      {user.is_staff ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditUser(user)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
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

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={fetchUsers}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_staff: user.is_staff,
    is_active: user.is_active
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.put(`/api/dashboard/users/${user.id}/`, formData);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit User</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_staff}
                onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
              />
              Admin User
            </label>
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

const CreateUserModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'admin_dashboard',
    country: '',
    date_of_birth: '',
    gender: ''
  });
  const [mediaFiles, setMediaFiles] = useState({
    profile_picture: null,
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMediaUpload = (e, type) => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'profile_picture') {
      if (files[0].size > 5 * 1024 * 1024) { // 5MB limit
        setError('Profile picture should be less than 5MB');
        return;
      }
      setMediaFiles(prev => ({
        ...prev,
        profile_picture: files[0]
      }));
    } else if (type === 'documents') {
      const newDocuments = Array.from(files).filter(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('Each document should be less than 10MB');
          return false;
        }
        return true;
      });
      setMediaFiles(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      const requiredFields = ['email', 'password', 'first_name', 'last_name', 'country', 'date_of_birth', 'gender'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate password strength
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      // Validate date format (should be YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date_of_birth)) {
        setError('Date of birth must be in YYYY-MM-DD format');
        return;
      }

      // Create the user data object (JSON format)
      // This matches the expected API format from your instructions
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        country: formData.country,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender
      };

      console.log('🚀 Creating user with data:', userData);
      console.log('📤 Request URL:', '/api/dashboard/users/create/');
      console.log('🔑 Authorization header will be added by axios interceptor');

      // Send as JSON instead of FormData for better compatibility
      // Increase timeout for user creation as it might take longer
      await axiosInstance.post('/api/dashboard/users/create/', userData, {
        timeout: 60000 // 60 seconds timeout
      });
      onSave();
      onClose();
    } catch (err) {
      console.error('❌ Error creating user:', err);
      console.error('❌ Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      
      if (err.response?.data) {
        console.error('❌ Error response data:', err.response.data);
        
        // Handle different types of error responses
        if (err.response.data.detail) {
          setError(`Server error: ${err.response.data.detail}`);
        } else if (err.response.data.message) {
          setError(`Server error: ${err.response.data.message}`);
        } else if (err.response.data.email) {
          setError(`Email error: ${err.response.data.email.join(', ')}`);
        } else if (err.response.data.password) {
          setError(`Password error: ${err.response.data.password.join(', ')}`);
        } else if (err.response.data.first_name) {
          setError(`First name error: ${err.response.data.first_name.join(', ')}`);
        } else if (err.response.data.last_name) {
          setError(`Last name error: ${err.response.data.last_name.join(', ')}`);
        } else if (err.response.data.country) {
          setError(`Country error: ${err.response.data.country.join(', ')}`);
        } else if (err.response.data.date_of_birth) {
          setError(`Date of birth error: ${err.response.data.date_of_birth.join(', ')}`);
        } else if (err.response.data.gender) {
          setError(`Gender error: ${err.response.data.gender.join(', ')}`);
        } else {
          setError(`Server error: ${JSON.stringify(err.response.data)}`);
        }
      } else if (err.message === 'timeout of 60000ms exceeded') {
        setError('Request timed out. The server is taking too long to respond. Please try again.');
      } else if (err.message === 'timeout of 30000ms exceeded') {
        setError('Request timed out. The server is taking too long to respond. Please try again.');
      } else {
        setError(`Request failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New User</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-info">
          <p><strong>Note:</strong> All fields are required. Password must be at least 8 characters long.</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          {/* File uploads temporarily disabled - backend may not support them in user creation */}
          {/* <div className="form-group">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleMediaUpload(e, 'profile_picture')}
            />
            {mediaFiles.profile_picture && (
              <div className="upload-preview">
                <img 
                  src={URL.createObjectURL(mediaFiles.profile_picture)} 
                  alt="Profile preview" 
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Documents</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleMediaUpload(e, 'documents')}
            />
            {mediaFiles.documents.length > 0 && (
              <div className="document-item">
                {doc.name} ({(doc.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div> */}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersTab; 