import React from 'react';
import { FaImage, FaTrash, FaUpload } from 'react-icons/fa';

const MediaTab = ({ mediaFiles, handleMediaUpload, handleDeleteMedia }) => {
  console.log('🎨 MediaTab render - mediaFiles:', mediaFiles);
  console.log('🎨 MediaTab render - mediaFiles type:', typeof mediaFiles);
  console.log('🎨 MediaTab render - mediaFiles length:', mediaFiles?.length);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('media_file', files[0]);
    formData.append('name', files[0].name);
    
    handleMediaUpload(formData);
  };

  // Helper function to get the correct image URL from different data structures
  const getMediaUrl = (file) => {
    console.log('🔗 Getting media URL for file:', file);
    
    // Try different possible URL field names
    const possibleUrls = [
      file.file_url,
      file.url,
      file.media_url,
      file.image_url,
      file.media_file,
      file.file,
      file.image
    ];
    
    const validUrl = possibleUrls.find(url => url && typeof url === 'string');
    console.log('🔗 Found valid URL:', validUrl);
    
    return validUrl;
  };

  // Helper function to get the correct title/name
  const getMediaTitle = (file) => {
    return file.title || file.name || file.media_info || 'Untitled';
  };

  // Helper function to determine if it's an image
  const isImage = (file) => {
    const url = getMediaUrl(file);
    const mediaType = file.media_type || file.file_type;
    
    // Check media type first
    if (mediaType && mediaType.includes('image')) {
      return true;
    }
    
    // Check file extension
    if (url && url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return true;
    }
    
    return false;
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
          mediaFiles.map((file, index) => {
            console.log(`🎨 Rendering media item ${index}:`, file);
            const mediaUrl = getMediaUrl(file);
            const mediaTitle = getMediaTitle(file);
            const isImageFile = isImage(file);
            
            console.log(`🎨 Item ${index} - URL: ${mediaUrl}, Title: ${mediaTitle}, IsImage: ${isImageFile}`);
            
            return (
              <div className="gallery-item" key={index}>
                {mediaUrl ? (
                  isImageFile ? (
                    <img 
                      src={mediaUrl} 
                      alt={mediaTitle} 
                      onError={(e) => {
                        console.log('❌ Image failed to load:', mediaUrl);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <video 
                      src={mediaUrl} 
                      controls 
                      onError={(e) => {
                        console.log('❌ Video failed to load:', mediaUrl);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  )
                ) : (
                  <div className="media-placeholder" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '200px', 
                    background: '#f5f5f5',
                    color: '#666'
                  }}>
                    <FaImage size={48} />
                  </div>
                )}
                <div className="media-error" style={{ display: 'none', padding: '20px', textAlign: 'center', color: '#666' }}>
                  <p>Media failed to load</p>
                </div>
                <div className="media-info">
                  <p>{mediaTitle}</p>
                  {file.id && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteMedia(file.id)}
                      title="Delete media file"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            );
          })
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