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
    
    let validUrl = possibleUrls.find(url => url && typeof url === 'string');
    console.log('🔗 Found valid URL:', validUrl);
    
    // Try to construct alternative URLs
    let alternativeUrls = [];
    
    // If we have a media_file URL, try different base URLs
    if (validUrl && validUrl.includes('cdn.gan7club.com')) {
      console.log('🔗 CDN URL detected, trying alternative base URLs');
      
      // Extract the path from the CDN URL
      const urlParts = validUrl.split('cdn.gan7club.com');
      if (urlParts.length > 1) {
        const mediaPath = urlParts[1];
        console.log('🔗 Media path extracted:', mediaPath);
        
        // Try different base URLs
        alternativeUrls = [
          mediaPath, // Relative path
          `https://api.gan7club.com${mediaPath}`, // API server
          `https://gan7club.com${mediaPath}`, // Main domain
          validUrl // Original CDN URL as fallback
        ];
        
        console.log('🔗 Alternative URLs to try:', alternativeUrls);
      }
    }
    
    // If we have a file ID, try to construct a direct API URL
    if (file.id) {
      const apiUrl = `/api/profile/talent/media/${file.id}/`;
      console.log('🔗 Adding API URL as alternative:', apiUrl);
      alternativeUrls.unshift(apiUrl); // Add API URL as first alternative
    }
    
    return {
      primary: validUrl,
      fallback: null,
      alternatives: alternativeUrls
    };
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
            const mediaUrlData = getMediaUrl(file);
            const mediaTitle = getMediaTitle(file);
            const isImageFile = isImage(file);
            
            console.log(`🎨 Item ${index} - Primary URL: ${mediaUrlData.primary}, Alternatives: ${mediaUrlData.alternatives?.length || 0}, Title: ${mediaTitle}, IsImage: ${isImageFile}`);
            
            // Create a function to handle multiple URL attempts
            const handleMediaError = (e, urlIndex = 0) => {
              const allUrls = [mediaUrlData.primary, ...(mediaUrlData.alternatives || [])];
              const currentUrl = allUrls[urlIndex];
              
              console.log(`❌ URL ${urlIndex + 1} failed to load:`, currentUrl);
              
              // Try next URL if available
              if (urlIndex + 1 < allUrls.length) {
                const nextUrl = allUrls[urlIndex + 1];
                console.log(`🔄 Trying URL ${urlIndex + 2}:`, nextUrl);
                e.target.src = nextUrl;
                e.target.onerror = (nextError) => handleMediaError(nextError, urlIndex + 1);
              } else {
                console.log('❌ All URLs failed, showing error placeholder');
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }
            };
            
            return (
              <div className="gallery-item" key={index}>
                {mediaUrlData.primary ? (
                  isImageFile ? (
                    <img 
                      src={mediaUrlData.primary} 
                      alt={mediaTitle} 
                      onError={(e) => handleMediaError(e, 0)}
                    />
                  ) : (
                    <video 
                      src={mediaUrlData.primary} 
                      controls 
                      onError={(e) => handleMediaError(e, 0)}
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
                  <p style={{ fontSize: '12px', marginTop: '5px' }}>
                    Tried {1 + (mediaUrlData.alternatives?.length || 0)} different URLs
                  </p>
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