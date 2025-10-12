import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaImage, FaTrash, FaUpload } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';

const MediaTab = ({ mediaFiles, handleMediaUpload, handleDeleteMedia }) => {
  const { t } = useTranslation();

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('media_file', files[0]);
    formData.append('name', files[0].name);
    
    handleMediaUpload(formData);
  };

  // Function to test API endpoints directly for debugging
  const testApiEndpoint = async (fileId) => {
    console.log('🧪 Testing API endpoint for file ID:', fileId);
    
    // Get user type to determine correct endpoint priority
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const isBackground = userInfo.is_background;
    
    const endpoints = isBackground ? [
      `/api/profile/background/media/${fileId}/`,
      `/api/profile/talent/media/${fileId}/`,
      `/api/media/${fileId}/`,
      `/api/files/${fileId}/`
    ] : [
      `/api/profile/talent/media/${fileId}/`,
      `/api/profile/background/media/${fileId}/`,
      `/api/media/${fileId}/`,
      `/api/files/${fileId}/`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log('🧪 Testing endpoint:', endpoint);
        const response = await axiosInstance.head(endpoint);
        console.log('✅ Endpoint accessible:', endpoint, 'Status:', response.status);
        return endpoint;
      } catch (error) {
        console.log('❌ Endpoint failed:', endpoint, 'Status:', error.response?.status);
      }
    }
    
    console.log('❌ All API endpoints failed');
    return null;
  };


  // Helper function to get the correct image URL from different data structures
  const getMediaUrl = (file) => {
    // The media_file field contains the direct S3/CDN URL - use this as primary
    let primaryUrl = file.media_file;
    
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
    }
    
    // Check for URL encoding issues
    if (primaryUrl && primaryUrl.includes(' ')) {
      primaryUrl = encodeURI(primaryUrl);
    }
    
    // For DigitalOcean Spaces URLs, use them directly without alternatives
    if (primaryUrl && (primaryUrl.includes('ganspace.fra1.cdn.digitaloceanspaces.com') || 
        primaryUrl.includes('cdn.gan7club.com'))) {
      return {
        primary: primaryUrl,
        alternatives: []
      };
    }
    
    // For other URLs, provide multiple fallback options
    const alternatives = [];
    
    // Get user type to determine correct endpoint
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const isBackground = userInfo.is_background;
    
    // 1. Direct API endpoint for media download
    if (file.id) {
      if (isBackground) {
        alternatives.push(`/api/profile/background/media/${file.id}/`);
        alternatives.push(`/api/profile/talent/media/${file.id}/`);
      } else {
        alternatives.push(`/api/profile/talent/media/${file.id}/`);
        alternatives.push(`/api/profile/background/media/${file.id}/`);
      }
    }
    
    // 2. Media proxy through our server
    if (primaryUrl && primaryUrl.startsWith('http')) {
      try {
        const url = new URL(primaryUrl);
        alternatives.push(`/media${url.pathname}`);
      } catch (e) {
        console.log('🔗 Could not parse URL for proxy:', primaryUrl);
      }
    }
    
    // 3. Alternative API endpoints
    if (file.id) {
      alternatives.push(`/api/media/${file.id}/`);
      alternatives.push(`/api/files/${file.id}/`);
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
      
      {/* Terms Notice */}
      <div className="media-terms-notice" style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffc107', 
        borderRadius: '8px', 
        padding: '12px 16px', 
        marginBottom: '20px',
        color: '#856404',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
        <span>
          <strong>Notice:</strong> The media you upload may be used by the admins for commercial purposes.
        </span>
      </div>
      
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
            const mediaUrlData = getMediaUrl(file);
            const mediaTitle = getMediaTitle(file);
            const isImageFile = isImage(file);
            
            // Create a function to handle media loading errors
            const handleMediaError = (e) => {
              console.log('❌ Media failed to load:', mediaUrlData.primary);
              console.log('❌ Error details:', e);
              console.log('❌ Target element:', e.target);
              
              // Check if it's a CORS error
              const isCorsError = e.target.crossOrigin === 'anonymous' || 
                                (e.target.src && e.target.src.startsWith('http') && 
                                 !e.target.src.startsWith(window.location.origin));
              
              console.log('❌ Is CORS error:', isCorsError);
              
              // For DigitalOcean Spaces URLs, if they fail, try with CORS headers
              if (mediaUrlData.primary && (mediaUrlData.primary.includes('ganspace.fra1.cdn.digitaloceanspaces.com') || 
                  mediaUrlData.primary.includes('cdn.gan7club.com'))) {
                
                if (isCorsError) {
                  console.log('🔄 CORS error detected, trying media proxy');
                  // Try the media proxy version
                  try {
                    const url = new URL(mediaUrlData.primary);
                    const proxyUrl = `/media${url.pathname}`;
                    console.log('🔄 Trying proxy URL:', proxyUrl);
                    e.target.src = proxyUrl;
                    e.target.onerror = () => {
                      console.log('❌ Proxy URL also failed, showing placeholder');
                      const placeholderUrl = createPlaceholderImage(file);
                      e.target.src = placeholderUrl;
                      e.target.onerror = null;
                    };
                    return;
                  } catch (parseError) {
                    console.log('❌ Could not parse URL for proxy');
                  }
                }
                
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
                      crossOrigin="anonymous"
                      onError={handleMediaError}
                    />
                  ) : (
                    <video 
                      src={mediaUrlData.primary} 
                      controls 
                      crossOrigin="anonymous"
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
            <p>{t('media.noMediaYet')}</p>
            <p>{t('media.uploadYourFirst')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaTab;