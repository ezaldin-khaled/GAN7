import React from 'react';
import { FaImage, FaTrash, FaUpload } from 'react-icons/fa';

const MediaTab = ({ mediaFiles, handleMediaUpload }) => {
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('media_file', files[0]);
    formData.append('name', files[0].name);
    
    handleMediaUpload(formData);
  };

  return (
    <div className="content-section">
      <h1 className="section-title">Media Gallery</h1>
      
      <div className="upload-area">
        <div className="upload-box" onClick={() => document.getElementById('media-upload').click()}>
          <FaUpload className="upload-icon" />
          <h3>Upload Media Files</h3>
          <span className="upload-info">Drag and drop files or click to browse</span>
          <input 
            id="media-upload"
            type="file" 
            accept="image/*,video/*" 
            multiple 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />
        </div>
      </div>

      <div className="gallery-grid">
        {mediaFiles && mediaFiles.length > 0 ? (
          mediaFiles.map((file, index) => (
            <div className="gallery-item" key={index}>
              {file.media_type?.includes('image') || file.file_url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={file.file_url || file.url} alt={file.title || 'Media item'} />
              ) : (
                <video src={file.file_url || file.url} controls />
              )}
              <div className="media-info">
                <p>{file.title || file.name || 'Untitled'}</p>
                <button className="delete-btn">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-media-message">
            <FaImage className="empty-icon" />
            <p>No media files uploaded yet</p>
            <p>Upload images or videos to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaTab;