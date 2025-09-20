import React, { useState } from 'react';
import { FaTimes, FaUpload, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import '../common/EnhancedModal.css';

const EnhancedModalExample = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess('Form submitted successfully!');
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        setFormData({ name: '', email: '', message: '', category: '', file: null });
      }, 2000);
    }, 2000);
  };

  const BasicModal = () => (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Enhanced Modal Example</h2>
          <button className="close-modal" onClick={() => setShowModal(false)}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="feature">Feature Request</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us how we can help you..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="file">Attachment (Optional)</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="file-input"
                />
                <label htmlFor="file" className="file-upload-label">
                  <FaUpload /> Choose File
                </label>
                <span className="file-name">
                  {formData.file ? formData.file.name : 'No file chosen'}
                </span>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck /> Submit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const LargeModal = () => (
    <div className="modal-overlay" onClick={() => setShowLargeModal(false)}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Large Modal Example</h2>
          <button className="close-modal" onClick={() => setShowLargeModal(false)}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <p>This is a large modal that can accommodate more content. It's perfect for complex forms, detailed information, or multi-step processes.</p>
          
          <div className="form-group">
            <label>Features of Enhanced Modals:</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Beautiful animations and transitions
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Responsive design for all devices
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Enhanced form styling
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Dark mode support
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Accessibility improvements
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowLargeModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SmallModal = () => (
    <div className="modal-overlay" onClick={() => setShowSmallModal(false)}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Small Modal</h3>
          <button className="close-modal" onClick={() => setShowSmallModal(false)}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <p>This is a small modal perfect for confirmations, alerts, or simple forms.</p>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowSmallModal(false)}>
              Cancel
            </button>
            <button type="button" className="submit-btn" onClick={() => setShowSmallModal(false)}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Enhanced Modal Examples</h1>
      <p style={{ marginBottom: '40px', color: '#666' }}>
        Click the buttons below to see different modal examples with enhanced styling.
      </p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          className="submit-btn" 
          onClick={() => setShowModal(true)}
          style={{ minWidth: '150px' }}
        >
          <FaUpload /> Basic Modal
        </button>
        
        <button 
          className="submit-btn" 
          onClick={() => setShowLargeModal(true)}
          style={{ minWidth: '150px' }}
        >
          <FaExclamationTriangle /> Large Modal
        </button>
        
        <button 
          className="submit-btn" 
          onClick={() => setShowSmallModal(true)}
          style={{ minWidth: '150px' }}
        >
          <FaCheck /> Small Modal
        </button>
      </div>

      {showModal && <BasicModal />}
      {showLargeModal && <LargeModal />}
      {showSmallModal && <SmallModal />}
    </div>
  );
};

export default EnhancedModalExample;
