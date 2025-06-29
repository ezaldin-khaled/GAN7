import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../../../api/axios';
import Loader from '../../../common/Loader';
import './TestImagesUpload.css';
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';

const TestImagesUpload = ({ onClose, onImagesSelected }) => {
  const [testImages, setTestImages] = useState([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file size should be less than 10MB');
      return;
    }

    const newImages = [...testImages];
    newImages[index] = file;
    setTestImages(newImages);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size should be less than 10MB');
        return;
      }
      const newImages = [...testImages];
      newImages[index] = file;
      setTestImages(newImages);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (testImages.length === 0) {
      setError('Please upload at least one test image');
      return;
    }

    // Create test images data
    const testImagesData = testImages.map((image, index) => ({
      name: `Test Image ${index + 1}`,
      media_info: "Test image for talent profile",
      is_test_image: true,
      is_about_yourself_video: false,
      test_image_number: index + 1
    }));

    // Pass both the files and metadata back to parent
    onImagesSelected({
      files: testImages,
      metadata: testImagesData
    });
    onClose();
  };

  const removeImage = (index) => {
    const newImages = [...testImages];
    newImages[index] = null;
    setTestImages(newImages);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Upload Test Images</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="test-images-grid">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="test-image-upload-item"
                onClick={() => document.getElementById(`test-image-input-${index}`).click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <input
                  id={`test-image-input-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, index)}
                  style={{ display: 'none' }}
                />
                {testImages[index] ? (
                  <div className="upload-preview">
                    <img
                      src={URL.createObjectURL(testImages[index])}
                      alt={`Test image ${index + 1}`}
                      style={{ maxWidth: '100%', maxHeight: '150px' }}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <FaImage className="upload-icon" />
                    <p>Click or drag image here</p>
                    <p className="upload-hint">Max size: 10MB</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={testImages.length === 0}>
              Add Images
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestImagesUpload; 