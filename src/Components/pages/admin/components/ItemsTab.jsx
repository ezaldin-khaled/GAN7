import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://192.168.0.103:8000/'; 

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const ItemsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchItems();
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

  return (
    <div className="items-tab">
      <div className="tab-header">
        <h2>Item Management</h2>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
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