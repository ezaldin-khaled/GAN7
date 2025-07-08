import React, { useState } from 'react';
import axiosInstance from '../../../api/axios';
import {
  PRIMARY_CATEGORIES,
  EXPERIENCE_LEVEL,
  AVAILABILITY_CHOICES,
  RATE_RANGES,
  PERFORMER_TYPES,
  HAIR_COLORS,
  EYE_COLORS,
  BODY_TYPES,
  EXPRESSIVE_AVAILABILITY_CHOICES,
  HYBRID_TYPES,
  SKIN_TONES,
  FITNESS_LEVELS,
  RISK_LEVELS
} from '../../../data/referenceData';

const WorkerProfileForm = ({ onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('visual'); // visual, expressive, hybrid
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [visualWorkerData, setVisualWorkerData] = useState({
    primary_category: '',
    years_experience: '',
    experience_level: '',
    portfolio_link: '',
    availability: '',
    rate_range: '',
    willing_to_relocate: false,
    city: '',
    country: ''
  });

  const [expressiveWorkerData, setExpressiveWorkerData] = useState({
    performer_type: '',
    years_experience: '',
    height: '',
    weight: '',
    hair_color: '',
    eye_color: '',
    body_type: '',
    availability: '',
    city: '',
    country: ''
  });

  const [hybridWorkerData, setHybridWorkerData] = useState({
    hybrid_type: '',
    years_experience: '',
    height: '',
    weight: '',
    hair_color: '',
    eye_color: '',
    skin_tone: '',
    body_type: '',
    fitness_level: '',
    risk_levels: '',
    availability: '',
    willing_to_relocate: false,
    city: '',
    country: ''
  });

  const handleVisualWorkerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVisualWorkerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExpressiveWorkerChange = (e) => {
    const { name, value } = e.target;
    setExpressiveWorkerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHybridWorkerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHybridWorkerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let dataToSubmit = {};

      // Add the active worker type data to the submission
      if (activeTab === 'visual') {
        dataToSubmit.visual_worker = visualWorkerData;
      } else if (activeTab === 'expressive') {
        dataToSubmit.expressive_worker = expressiveWorkerData;
      } else if (activeTab === 'hybrid') {
        dataToSubmit.hybrid_worker = hybridWorkerData;
      }

      const response = await axiosInstance.post('/api/profile/worker/', dataToSubmit);
      
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      onClose();
    } catch (err) {
      console.error('Error submitting worker profile:', err);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to submit profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderVisualWorkerForm = () => (
    <div className="form-section">
      <div className="form-group">
        <label htmlFor="primary_category">Primary Category *</label>
        <select
          id="primary_category"
          name="primary_category"
          value={visualWorkerData.primary_category}
          onChange={handleVisualWorkerChange}
          required
        >
          <option value="">Select category</option>
          {PRIMARY_CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="years_experience">Years of Experience *</label>
        <input
          type="number"
          id="years_experience"
          name="years_experience"
          value={visualWorkerData.years_experience}
          onChange={handleVisualWorkerChange}
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="experience_level">Experience Level *</label>
        <select
          id="experience_level"
          name="experience_level"
          value={visualWorkerData.experience_level}
          onChange={handleVisualWorkerChange}
          required
        >
          <option value="">Select level</option>
          {EXPERIENCE_LEVEL.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="portfolio_link">Portfolio Link</label>
        <input
          type="url"
          id="portfolio_link"
          name="portfolio_link"
          value={visualWorkerData.portfolio_link}
          onChange={handleVisualWorkerChange}
          placeholder="https://example.com/portfolio"
        />
      </div>

      <div className="form-group">
        <label htmlFor="availability">Availability *</label>
        <select
          id="availability"
          name="availability"
          value={visualWorkerData.availability}
          onChange={handleVisualWorkerChange}
          required
        >
          <option value="">Select availability</option>
          {AVAILABILITY_CHOICES.map(choice => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="rate_range">Rate Range *</label>
        <select
          id="rate_range"
          name="rate_range"
          value={visualWorkerData.rate_range}
          onChange={handleVisualWorkerChange}
          required
        >
          <option value="">Select rate range</option>
          {RATE_RANGES.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="willing_to_relocate"
            checked={visualWorkerData.willing_to_relocate}
            onChange={handleVisualWorkerChange}
          />
          Willing to Relocate
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="city">City *</label>
        <input
          type="text"
          id="city"
          name="city"
          value={visualWorkerData.city}
          onChange={handleVisualWorkerChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="country">Country *</label>
        <input
          type="text"
          id="country"
          name="country"
          value={visualWorkerData.country}
          onChange={handleVisualWorkerChange}
          required
        />
      </div>
    </div>
  );

  const renderExpressiveWorkerForm = () => (
    <div className="form-section">
      <div className="form-group">
        <label htmlFor="performer_type">Performer Type *</label>
        <select
          id="performer_type"
          name="performer_type"
          value={expressiveWorkerData.performer_type}
          onChange={handleExpressiveWorkerChange}
          required
        >
          <option value="">Select type</option>
          {PERFORMER_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="years_experience">Years of Experience *</label>
        <input
          type="number"
          id="years_experience"
          name="years_experience"
          value={expressiveWorkerData.years_experience}
          onChange={handleExpressiveWorkerChange}
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="height">Height (cm) *</label>
        <input
          type="number"
          id="height"
          name="height"
          value={expressiveWorkerData.height}
          onChange={handleExpressiveWorkerChange}
          step="0.1"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="weight">Weight (kg) *</label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={expressiveWorkerData.weight}
          onChange={handleExpressiveWorkerChange}
          step="0.1"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="hair_color">Hair Color *</label>
        <select
          id="hair_color"
          name="hair_color"
          value={expressiveWorkerData.hair_color}
          onChange={handleExpressiveWorkerChange}
          required
        >
          <option value="">Select hair color</option>
          {HAIR_COLORS.map(color => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="eye_color">Eye Color *</label>
        <select
          id="eye_color"
          name="eye_color"
          value={expressiveWorkerData.eye_color}
          onChange={handleExpressiveWorkerChange}
          required
        >
          <option value="">Select eye color</option>
          {EYE_COLORS.map(color => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="body_type">Body Type *</label>
        <select
          id="body_type"
          name="body_type"
          value={expressiveWorkerData.body_type}
          onChange={handleExpressiveWorkerChange}
          required
        >
          <option value="">Select body type</option>
          {BODY_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="availability">Availability *</label>
        <select
          id="availability"
          name="availability"
          value={expressiveWorkerData.availability}
          onChange={handleExpressiveWorkerChange}
          required
        >
          <option value="">Select availability</option>
          {EXPRESSIVE_AVAILABILITY_CHOICES.map(choice => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="city">City *</label>
        <input
          type="text"
          id="city"
          name="city"
          value={expressiveWorkerData.city}
          onChange={handleExpressiveWorkerChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="country">Country *</label>
        <input
          type="text"
          id="country"
          name="country"
          value={expressiveWorkerData.country}
          onChange={handleExpressiveWorkerChange}
          required
        />
      </div>
    </div>
  );

  const renderHybridWorkerForm = () => (
    <div className="form-section">
      <div className="form-group">
        <label htmlFor="hybrid_type">Hybrid Type *</label>
        <select
          id="hybrid_type"
          name="hybrid_type"
          value={hybridWorkerData.hybrid_type}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select type</option>
          {HYBRID_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="years_experience">Years of Experience *</label>
        <input
          type="number"
          id="years_experience"
          name="years_experience"
          value={hybridWorkerData.years_experience}
          onChange={handleHybridWorkerChange}
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="height">Height (cm) *</label>
        <input
          type="number"
          id="height"
          name="height"
          value={hybridWorkerData.height}
          onChange={handleHybridWorkerChange}
          step="0.1"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="weight">Weight (kg) *</label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={hybridWorkerData.weight}
          onChange={handleHybridWorkerChange}
          step="0.1"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="hair_color">Hair Color *</label>
        <select
          id="hair_color"
          name="hair_color"
          value={hybridWorkerData.hair_color}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select hair color</option>
          {HAIR_COLORS.map(color => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="eye_color">Eye Color *</label>
        <select
          id="eye_color"
          name="eye_color"
          value={hybridWorkerData.eye_color}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select eye color</option>
          {EYE_COLORS.map(color => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="skin_tone">Skin Tone *</label>
        <select
          id="skin_tone"
          name="skin_tone"
          value={hybridWorkerData.skin_tone}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select skin tone</option>
          {SKIN_TONES.map(tone => (
            <option key={tone.value} value={tone.value}>
              {tone.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="body_type">Body Type *</label>
        <select
          id="body_type"
          name="body_type"
          value={hybridWorkerData.body_type}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select body type</option>
          {BODY_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="fitness_level">Fitness Level *</label>
        <select
          id="fitness_level"
          name="fitness_level"
          value={hybridWorkerData.fitness_level}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select fitness level</option>
          {FITNESS_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="risk_levels">Risk Level *</label>
        <select
          id="risk_levels"
          name="risk_levels"
          value={hybridWorkerData.risk_levels}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select risk level</option>
          {RISK_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="availability">Availability *</label>
        <select
          id="availability"
          name="availability"
          value={hybridWorkerData.availability}
          onChange={handleHybridWorkerChange}
          required
        >
          <option value="">Select availability</option>
          {AVAILABILITY_CHOICES.map(choice => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="willing_to_relocate"
            checked={hybridWorkerData.willing_to_relocate}
            onChange={handleHybridWorkerChange}
          />
          Willing to Relocate
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="city">City *</label>
        <input
          type="text"
          id="city"
          name="city"
          value={hybridWorkerData.city}
          onChange={handleHybridWorkerChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="country">Country *</label>
        <input
          type="text"
          id="country"
          name="country"
          value={hybridWorkerData.country}
          onChange={handleHybridWorkerChange}
          required
        />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Worker Profile</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            Visual Worker
          </button>
          <button
            className={`tab-button ${activeTab === 'expressive' ? 'active' : ''}`}
            onClick={() => setActiveTab('expressive')}
          >
            Expressive Worker
          </button>
          <button
            className={`tab-button ${activeTab === 'hybrid' ? 'active' : ''}`}
            onClick={() => setActiveTab('hybrid')}
          >
            Hybrid Worker
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'visual' && renderVisualWorkerForm()}
          {activeTab === 'expressive' && renderExpressiveWorkerForm()}
          {activeTab === 'hybrid' && renderHybridWorkerForm()}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerProfileForm; 