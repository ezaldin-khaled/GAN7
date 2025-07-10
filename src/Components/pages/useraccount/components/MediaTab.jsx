import React from 'react';
import { FaImage, FaTrash, FaUpload } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';

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
    console.log('🔗 Full file object:', JSON.stringify(file, null, 2));
    
    // The media_file field contains the direct S3/CDN URL - use this as primary
    let primaryUrl = file.media_file;
    console.log('🔗 Found media_file URL:', primaryUrl);
    
    // If media_file is not available, try other possible URL field names
    if (!primaryUrl) {
      const possibleUrls = [
        file.file_url,
        file.url,
        file.media_url,
        file.image_url,
        file.file,
        file.image
      ];
      
      primaryUrl = possibleUrls.find(url => url && typeof url === 'string');
      console.log('🔗 Found fallback URL:', primaryUrl);
    }
    
    // For DigitalOcean Spaces URLs, use them directly without alternatives
    if (primaryUrl && (primaryUrl.includes('ganspace.fra1.cdn.digitaloceanspaces.com') || 
        primaryUrl.includes('cdn.gan7club.com'))) {
      console.log('🔗 DigitalOcean Spaces/CDN URL detected - using directly');
      return {
        primary: primaryUrl,
        alternatives: []
      };
    }
    
    // For other URLs, provide minimal alternatives
    const alternatives = [];
    if (file.id) {
      alternatives.push(`/api/profile/talent/media/${file.id}/`);
    }
    
    return {
      primary: primaryUrl,
      alternatives: alternatives
    };
  };

  // Function to create a placeholder image with file info
  const createPlaceholderImage = (file) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 300, 200);
    
    // Border
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 298, 198);
    
    // Icon based on media type
    const isVideo = file.media_type === 'video' || file.name?.includes('.mp4') || file.name?.includes('.mov');
    const icon = isVideo ? '🎥' : '🖼️';
    
    // Icon
    ctx.fillStyle = '#999';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(icon, 150, 80);
    
    // File name (truncated if too long)
    const fileName = file.name || 'Media File';
    const truncatedName = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(truncatedName, 150, 120);
    
    // File type and size info
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    const mediaInfo = `${file.media_type || 'unknown'} • ID: ${file.id || 'N/A'}`;
    ctx.fillText(mediaInfo, 150, 140);
    
    // Error message
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '9px Arial';
    ctx.fillText('Media unavailable', 150, 155);
    
    return canvas.toDataURL();
  };

  // Helper function to get the correct title/name
  const getMediaTitle = (file) => {
    return file.title || file.name || file.media_info || 'Untitled';
  };

  // Helper function to determine if it's an image
  const isImage = (file) => {
    const mediaType = file.media_type || file.file_type;
    
    // Check media type first
    if (mediaType && mediaType.includes('image')) {
      return true;
    }
    
    // Check file extension from filename
    const filename = file.name || file.filename;
    if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return true;
    }
    
    // Check file extension from URL
    const mediaUrlData = getMediaUrl(file);
    if (mediaUrlData.primary && mediaUrlData.primary.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
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
            const mediaUrlData = getMediaUrl(file);
            const mediaTitle = getMediaTitle(file);
            const isImageFile = isImage(file);
            
            console.log(`🎨 Item ${index} - Primary URL: ${mediaUrlData.primary}, Alternatives: ${mediaUrlData.alternatives?.length || 0}, Title: ${mediaTitle}, IsImage: ${isImageFile}`);
            
            // Create a function to handle media loading errors
            const handleMediaError = (e) => {
              console.log('❌ Media failed to load:', mediaUrlData.primary);
              
              // For DigitalOcean Spaces URLs, if they fail, show placeholder
              if (mediaUrlData.primary && (mediaUrlData.primary.includes('ganspace.fra1.cdn.digitaloceanspaces.com') || 
                  mediaUrlData.primary.includes('cdn.gan7club.com'))) {
                console.log('❌ DigitalOcean Spaces URL failed, showing placeholder');
                const placeholderUrl = createPlaceholderImage(file);
                e.target.src = placeholderUrl;
                e.target.onerror = null; // Prevent infinite loop
                return;
              }
              
              // For other URLs, try alternatives if available
              if (mediaUrlData.alternatives && mediaUrlData.alternatives.length > 0) {
                const nextUrl = mediaUrlData.alternatives[0];
                console.log('🔄 Trying alternative URL:', nextUrl);
                e.target.src = nextUrl;
                e.target.onerror = () => {
                  console.log('❌ Alternative URL also failed, showing placeholder');
                  const placeholderUrl = createPlaceholderImage(file);
                  e.target.src = placeholderUrl;
                  e.target.onerror = null;
                };
              } else {
                console.log('❌ No alternatives available, showing placeholder');
                const placeholderUrl = createPlaceholderImage(file);
                e.target.src = placeholderUrl;
                e.target.onerror = null;
              }
            };
            
            return (
              <div className="gallery-item" key={index}>
                {mediaUrlData.primary ? (
                  isImageFile ? (
                    <img 
                      src={mediaUrlData.primary} 
                      alt={mediaTitle} 
                      onError={handleMediaError}
                    />
                  ) : (
                    <video 
                      src={mediaUrlData.primary} 
                      controls 
                      onError={handleMediaError}
                    />
                  )
                ) : (
                  <div className="media-placeholder" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '200px', 
                    background: '#f5f5f5',
                    color: '#666',
                    flexDirection: 'column',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                      {file.media_type === 'video' ? '🎥' : '🖼️'}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {file.name || 'Media File'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                      {file.media_type || 'unknown'} • ID: {file.id || 'N/A'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#ff6b6b' }}>
                      Media unavailable
                    </div>
                  </div>
                )}
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