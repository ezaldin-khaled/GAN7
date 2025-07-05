import React, { useState } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import './GroupsTab.css'; // Reusing existing form styles
import axios from 'axios';

const API_URL = 'https://api.gan7club.com/';

// Create an axios instance with the base URL and token handling
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});

// Add a request interceptor to include the token in all requests
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

const ItemUploadForm = ({ onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    item_type: '',
    name: '',
    description: '',
    price: '',
    is_for_rent: false,
    is_for_sale: false,
    // Prop specific
    material: '',
    used_in_movie: '',
    condition: '',
    // Costume specific
    size: '',
    worn_by: '',
    era: '',
    // Location specific
    address: '',
    capacity: '',
    is_indoor: true,
    // Memorabilia specific
    signed_by: '',
    authenticity_certificate: null,
    // Vehicle specific
    make: '',
    model: '',
    year: '',
    // Artistic Material specific
    type: '',
    // Music Item specific
    instrument_type: '',
    used_by: '',
    // Rare Item specific
    provenance: '',
    is_one_of_a_kind: false
  });
  const [itemImage, setItemImage] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
    }
  };

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        authenticity_certificate: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.item_type || !formData.name || !formData.price || !itemImage) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate price is a positive number
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      
      // Append common fields
      formDataToSubmit.append('item_type', formData.item_type);
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('description', formData.description || '');
      formDataToSubmit.append('price', parseFloat(formData.price).toString());
      formDataToSubmit.append('is_for_rent', formData.is_for_rent ? 'true' : 'false');
      formDataToSubmit.append('is_for_sale', formData.is_for_sale ? 'true' : 'false');
      formDataToSubmit.append('image', itemImage);

      // Append type-specific fields
      switch (formData.item_type) {
        case 'prop':
          formDataToSubmit.append('material', formData.material || '');
          formDataToSubmit.append('used_in_movie', formData.used_in_movie || '');
          formDataToSubmit.append('condition', formData.condition || '');
          break;
        case 'costume':
          formDataToSubmit.append('size', formData.size || '');
          formDataToSubmit.append('worn_by', formData.worn_by || '');
          formDataToSubmit.append('era', formData.era || '');
          break;
        case 'location':
          formDataToSubmit.append('address', formData.address || '');
          formDataToSubmit.append('capacity', formData.capacity || '');
          formDataToSubmit.append('is_indoor', formData.is_indoor ? 'true' : 'false');
          break;
        case 'memorabilia':
          formDataToSubmit.append('signed_by', formData.signed_by || '');
          if (formData.authenticity_certificate) {
            formDataToSubmit.append('authenticity_certificate', formData.authenticity_certificate);
          }
          break;
        case 'vehicle':
          formDataToSubmit.append('make', formData.make || '');
          formDataToSubmit.append('model', formData.model || '');
          formDataToSubmit.append('year', formData.year || '');
          break;
        case 'artistic_material':
          formDataToSubmit.append('type', formData.type || '');
          formDataToSubmit.append('condition', formData.condition || '');
          break;
        case 'music_item':
          formDataToSubmit.append('instrument_type', formData.instrument_type || '');
          formDataToSubmit.append('used_by', formData.used_by || '');
          break;
        case 'rare_item':
          formDataToSubmit.append('provenance', formData.provenance || '');
          formDataToSubmit.append('is_one_of_a_kind', formData.is_one_of_a_kind ? 'true' : 'false');
          break;
      }

      const response = await axiosInstance.post('/api/profile/background/items/', formDataToSubmit);
      
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      onClose();
      
    } catch (err) {
      console.error('Error uploading item:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to upload item. Please try again.');
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.item_type) {
      case 'prop':
        return (
          <>
            <div className="form-group">
              <label htmlFor="material">Material</label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                placeholder="Enter material"
              />
            </div>
            <div className="form-group">
              <label htmlFor="used_in_movie">Used in Movie</label>
              <input
                type="text"
                id="used_in_movie"
                name="used_in_movie"
                value={formData.used_in_movie}
                onChange={handleInputChange}
                placeholder="Enter movie name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <input
                type="text"
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                placeholder="Enter condition"
              />
            </div>
          </>
        );
      case 'costume':
        return (
          <>
            <div className="form-group">
              <label htmlFor="size">Size</label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="Enter size"
              />
            </div>
            <div className="form-group">
              <label htmlFor="worn_by">Worn By</label>
              <input
                type="text"
                id="worn_by"
                name="worn_by"
                value={formData.worn_by}
                onChange={handleInputChange}
                placeholder="Enter who wore it"
              />
            </div>
            <div className="form-group">
              <label htmlFor="era">Era</label>
              <input
                type="text"
                id="era"
                name="era"
                value={formData.era}
                onChange={handleInputChange}
                placeholder="Enter era"
              />
            </div>
          </>
        );
      case 'location':
        return (
          <>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
              />
            </div>
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Enter capacity"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_indoor"
                  checked={formData.is_indoor}
                  onChange={handleInputChange}
                />
                Indoor Location
              </label>
            </div>
          </>
        );
      case 'memorabilia':
        return (
          <>
            <div className="form-group">
              <label htmlFor="signed_by">Signed By</label>
              <input
                type="text"
                id="signed_by"
                name="signed_by"
                value={formData.signed_by}
                onChange={handleInputChange}
                placeholder="Enter who signed it"
              />
            </div>
            <div className="form-group">
              <label htmlFor="authenticity_certificate">Authenticity Certificate</label>
              <input
                type="file"
                id="authenticity_certificate"
                name="authenticity_certificate"
                onChange={handleCertificateChange}
                accept=".pdf,.doc,.docx"
              />
            </div>
          </>
        );
      case 'vehicle':
        return (
          <>
            <div className="form-group">
              <label htmlFor="make">Make</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="Enter make"
              />
            </div>
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Enter model"
              />
            </div>
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="Enter year"
              />
            </div>
          </>
        );
      case 'artistic_material':
        return (
          <>
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Enter type"
              />
            </div>
            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <input
                type="text"
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                placeholder="Enter condition"
              />
            </div>
          </>
        );
      case 'music_item':
        return (
          <>
            <div className="form-group">
              <label htmlFor="instrument_type">Instrument Type</label>
              <input
                type="text"
                id="instrument_type"
                name="instrument_type"
                value={formData.instrument_type}
                onChange={handleInputChange}
                placeholder="Enter instrument type"
              />
            </div>
            <div className="form-group">
              <label htmlFor="used_by">Used By</label>
              <input
                type="text"
                id="used_by"
                name="used_by"
                value={formData.used_by}
                onChange={handleInputChange}
                placeholder="Enter who used it"
              />
            </div>
          </>
        );
      case 'rare_item':
        return (
          <>
            <div className="form-group">
              <label htmlFor="provenance">Provenance</label>
              <textarea
                id="provenance"
                name="provenance"
                value={formData.provenance}
                onChange={handleInputChange}
                placeholder="Enter provenance details"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_one_of_a_kind"
                  checked={formData.is_one_of_a_kind}
                  onChange={handleInputChange}
                />
                One of a Kind
              </label>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload New Item</h2>
          <button className="close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item_type">Item Type *</label>
            <select
              id="item_type"
              name="item_type"
              value={formData.item_type}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select item type</option>
              <option value="prop">Prop</option>
              <option value="costume">Costume</option>
              <option value="location">Location</option>
              <option value="memorabilia">Memorabilia</option>
              <option value="vehicle">Vehicle</option>
              <option value="artistic_material">Artistic Material</option>
              <option value="music_item">Music Item</option>
              <option value="rare_item">Rare Item</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your item"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Availability</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_for_rent"
                  checked={formData.is_for_rent}
                  onChange={handleInputChange}
                />
                Available for Rent
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_for_sale"
                  checked={formData.is_for_sale}
                  onChange={handleInputChange}
                />
                Available for Sale
              </label>
            </div>
          </div>

          {renderTypeSpecificFields()}

          <div className="form-group">
            <label htmlFor="item_image">Item Image *</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="item_image"
                name="item_image"
                onChange={handleImageChange}
                accept="image/*"
                className="file-input"
                required
              />
              <label htmlFor="item_image" className="file-upload-label">
                Choose Image
              </label>
              <span className="file-name">
                {itemImage ? itemImage.name : 'No file chosen'}
              </span>
            </div>
            {itemImage && (
              <div className="image-preview">
                <img src={URL.createObjectURL(itemImage)} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image" 
                  onClick={() => setItemImage(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Uploading...
                </>
              ) : 'Upload Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemUploadForm; 