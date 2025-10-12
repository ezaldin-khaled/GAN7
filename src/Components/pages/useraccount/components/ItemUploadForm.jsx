import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUpload, FaTimes, FaImage, FaFileUpload } from 'react-icons/fa';
import './ItemUploadForm.css';
import axiosInstance from '../../../../api/axios';

const ItemUploadForm = ({ onClose, onSubmit, loading }) => {
  const { t } = useTranslation();
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
      setError(t('itemUpload.fillAllFields'));
      return;
    }

    // Validate price is a positive number
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError(t('itemUpload.validPrice'));
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
      setError(err.response?.data?.message || err.response?.data?.detail || t('items.uploadError'));
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.item_type) {
      case 'prop':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="material">{t('itemUpload.propFields.material')}</label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                placeholder={t('itemUpload.propFields.material')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="used_in_movie">{t('itemUpload.propFields.usedInMovie')}</label>
              <input
                type="text"
                id="used_in_movie"
                name="used_in_movie"
                value={formData.used_in_movie}
                onChange={handleInputChange}
                placeholder={t('itemUpload.propFields.usedInMovie')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="condition">{t('itemUpload.propFields.condition')}</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        );
      case 'costume':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="size">Size</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="worn_by">Worn By</label>
              <input
                type="text"
                id="worn_by"
                name="worn_by"
                value={formData.worn_by}
                onChange={handleInputChange}
                placeholder="e.g., Robert Downey Jr., Scarlett Johansson"
              />
            </div>
            <div className="form-group">
              <label htmlFor="era">Era</label>
              <select
                id="era"
                name="era"
                value={formData.era}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select era</option>
                <option value="1920s">1920s</option>
                <option value="1930s">1930s</option>
                <option value="1940s">1940s</option>
                <option value="1950s">1950s</option>
                <option value="1960s">1960s</option>
                <option value="1970s">1970s</option>
                <option value="1980s">1980s</option>
                <option value="1990s">1990s</option>
                <option value="2000s">2000s</option>
                <option value="2010s">2010s</option>
                <option value="2020s">2020s</option>
                <option value="Futuristic">Futuristic</option>
                <option value="Medieval">Medieval</option>
                <option value="Victorian">Victorian</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );
      case 'location':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Hollywood Blvd, Los Angeles, CA"
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
                placeholder="Maximum number of people"
                min="1"
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
          </div>
        );
      case 'memorabilia':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="signed_by">Signed By</label>
              <input
                type="text"
                id="signed_by"
                name="signed_by"
                value={formData.signed_by}
                onChange={handleInputChange}
                placeholder="e.g., Tom Hanks, Meryl Streep"
              />
            </div>
            <div className="form-group">
              <label htmlFor="authenticity_certificate">Authenticity Certificate</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="authenticity_certificate"
                  name="authenticity_certificate"
                  onChange={handleCertificateChange}
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                />
                <label htmlFor="authenticity_certificate" className="file-upload-label">
                  <FaFileUpload />
                  Upload Certificate
                </label>
                <span className="file-name">
                  {formData.authenticity_certificate ? formData.authenticity_certificate.name : 'No file chosen'}
                </span>
              </div>
            </div>
          </div>
        );
      case 'vehicle':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="make">Make</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="e.g., Ford, BMW, Tesla"
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
                placeholder="e.g., Mustang, X5, Model S"
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
                placeholder="e.g., 2020"
                min="1900"
                max="2024"
              />
            </div>
          </div>
        );
      case 'artistic_material':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select type</option>
                <option value="paint">Paint</option>
                <option value="canvas">Canvas</option>
                <option value="brushes">Brushes</option>
                <option value="sculpture_material">Sculpture Material</option>
                <option value="fabric">Fabric</option>
                <option value="wood">Wood</option>
                <option value="metal">Metal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        );
      case 'music_item':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="instrument_type">Instrument Type</label>
              <select
                id="instrument_type"
                name="instrument_type"
                value={formData.instrument_type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select instrument</option>
                <option value="guitar">Guitar</option>
                <option value="piano">Piano</option>
                <option value="drums">Drums</option>
                <option value="violin">Violin</option>
                <option value="bass">Bass</option>
                <option value="saxophone">Saxophone</option>
                <option value="trumpet">Trumpet</option>
                <option value="microphone">Microphone</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="used_by">Used By</label>
              <input
                type="text"
                id="used_by"
                name="used_by"
                value={formData.used_by}
                onChange={handleInputChange}
                placeholder="e.g., John Mayer, Taylor Swift"
              />
            </div>
          </div>
        );
      case 'rare_item':
        return (
          <div data-type="specific">
            <div className="form-group">
              <label htmlFor="provenance">Provenance</label>
              <textarea
                id="provenance"
                name="provenance"
                value={formData.provenance}
                onChange={handleInputChange}
                placeholder="Describe the item's history, origin, and authenticity..."
                rows="4"
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
                One of a Kind Item
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{t('itemUpload.title')}</h2>
          <button className="close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item_type">{t('itemUpload.itemType')} *</label>
            <select
              id="item_type"
              name="item_type"
              value={formData.item_type}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">{t('itemUpload.selectItemType')}</option>
              <option value="prop">🎬 {t('itemUpload.itemTypes.prop')}</option>
              <option value="costume">👗 {t('itemUpload.itemTypes.costume')}</option>
              <option value="location">🏢 {t('itemUpload.itemTypes.location')}</option>
              <option value="memorabilia">⭐ {t('itemUpload.itemTypes.memorabilia')}</option>
              <option value="vehicle">🚗 {t('itemUpload.itemTypes.vehicle')}</option>
              <option value="artistic_material">🎨 {t('itemUpload.itemTypes.artistic_material')}</option>
              <option value="music_item">🎵 {t('itemUpload.itemTypes.music_item')}</option>
              <option value="rare_item">💎 {t('itemUpload.itemTypes.rare_item')}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">{t('itemUpload.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('itemUpload.name')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('itemUpload.description')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('itemUpload.description')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">{t('itemUpload.price')} *</label>
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
                <FaImage />
                {t('itemUpload.chooseImage')}
              </label>
              <span className="file-name">
                {itemImage ? itemImage.name : t('common.no') + ' file chosen'}
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
                  <FaTimes />
                  {t('common.remove')}
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              <FaTimes />
              {t('common.cancel')}
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  {t('itemUpload.uploading')}
                </>
              ) : (
                <>
                  <FaUpload />
                  {t('itemUpload.submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemUploadForm; 