import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfileTab.css';

const ProfileTab = () => {
  const { user } = useAuth();
  const [workerType, setWorkerType] = useState('visual_worker');
  const [referenceData, setReferenceData] = useState(null);
  const [formData, setFormData] = useState({
    primary_category: '',
    experience_level: '',
    availability: '',
    rate_range: '',
    performer_type: '',
    hair_color: '',
    eye_color: '',
    body_type: '',
    union_status: '',
    hybrid_type: '',
    skin_tone: '',
    fitness_level: '',
    risk_level: ''
  });

  useEffect(() => {
    // Fetch reference data when worker type changes
    const fetchReferenceData = async () => {
      try {
        const response = await fetch(`/api/reference-data/?type=${workerType}`);
        const data = await response.json();
        setReferenceData(data);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();
  }, [workerType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const renderVisualWorkerFields = () => (
    <>
      <div className="form-group">
        <label htmlFor="primary_category">Primary Category</label>
        <select
          id="primary_category"
          name="primary_category"
          value={formData.primary_category}
          onChange={handleInputChange}
          required
        >
          <option value="">Select a category</option>
          {referenceData?.primary_categories?.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="experience_level">Experience Level</label>
        <select
          id="experience_level"
          name="experience_level"
          value={formData.experience_level}
          onChange={handleInputChange}
          required
        >
          <option value="">Select experience level</option>
          {referenceData?.experience_levels?.map(level => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="availability">Availability</label>
        <select
          id="availability"
          name="availability"
          value={formData.availability}
          onChange={handleInputChange}
          required
        >
          <option value="">Select availability</option>
          {referenceData?.availability_choices?.map(choice => (
            <option key={choice} value={choice}>
              {choice.charAt(0).toUpperCase() + choice.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="rate_range">Rate Range</label>
        <select
          id="rate_range"
          name="rate_range"
          value={formData.rate_range}
          onChange={handleInputChange}
          required
        >
          <option value="">Select rate range</option>
          {referenceData?.rate_ranges?.map(range => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>
      </div>
    </>
  );

  const renderExpressiveWorkerFields = () => (
    <>
      <div className="form-group">
        <label htmlFor="performer_type">Performer Type</label>
        <select
          id="performer_type"
          name="performer_type"
          value={formData.performer_type}
          onChange={handleInputChange}
          required
        >
          <option value="">Select performer type</option>
          {referenceData?.performer_types?.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="hair_color">Hair Color</label>
        <select
          id="hair_color"
          name="hair_color"
          value={formData.hair_color}
          onChange={handleInputChange}
          required
        >
          <option value="">Select hair color</option>
          {referenceData?.hair_colors?.map(color => (
            <option key={color} value={color}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="eye_color">Eye Color</label>
        <select
          id="eye_color"
          name="eye_color"
          value={formData.eye_color}
          onChange={handleInputChange}
          required
        >
          <option value="">Select eye color</option>
          {referenceData?.eye_colors?.map(color => (
            <option key={color} value={color}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="body_type">Body Type</label>
        <select
          id="body_type"
          name="body_type"
          value={formData.body_type}
          onChange={handleInputChange}
          required
        >
          <option value="">Select body type</option>
          {referenceData?.body_types?.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="union_status">Union Status</label>
        <select
          id="union_status"
          name="union_status"
          value={formData.union_status}
          onChange={handleInputChange}
          required
        >
          <option value="">Select union status</option>
          {referenceData?.union_status?.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const renderHybridWorkerFields = () => (
    <>
      <div className="form-group">
        <label htmlFor="hybrid_type">Hybrid Type</label>
        <select
          id="hybrid_type"
          name="hybrid_type"
          value={formData.hybrid_type}
          onChange={handleInputChange}
          required
        >
          <option value="">Select hybrid type</option>
          {referenceData?.hybrid_types?.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="skin_tone">Skin Tone</label>
        <select
          id="skin_tone"
          name="skin_tone"
          value={formData.skin_tone}
          onChange={handleInputChange}
          required
        >
          <option value="">Select skin tone</option>
          {referenceData?.skin_tones?.map(tone => (
            <option key={tone} value={tone}>
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="fitness_level">Fitness Level</label>
        <select
          id="fitness_level"
          name="fitness_level"
          value={formData.fitness_level}
          onChange={handleInputChange}
          required
        >
          <option value="">Select fitness level</option>
          {referenceData?.fitness_levels?.map(level => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="risk_level">Risk Level</label>
        <select
          id="risk_level"
          name="risk_level"
          value={formData.risk_level}
          onChange={handleInputChange}
          required
        >
          <option value="">Select risk level</option>
          {referenceData?.risk_levels?.map(level => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <div className="profile-tab">
      <h2>Profile Information</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="worker_type">Worker Type</label>
          <select
            id="worker_type"
            value={workerType}
            onChange={(e) => setWorkerType(e.target.value)}
            required
          >
            <option value="visual_worker">Visual Worker</option>
            <option value="expressive_worker">Expressive Worker</option>
            <option value="hybrid_worker">Hybrid Worker</option>
          </select>
        </div>

        {workerType === 'visual_worker' && renderVisualWorkerFields()}
        {workerType === 'expressive_worker' && renderExpressiveWorkerFields()}
        {workerType === 'hybrid_worker' && renderHybridWorkerFields()}

        <button type="submit" className="submit-button">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileTab; 