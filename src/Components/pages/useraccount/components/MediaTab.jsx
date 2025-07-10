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

  // Function to fetch media as blob and create blob URL
  const fetchMediaAsBlob = async (file) => {
    try {
      console.log('🔄 Fetching media as blob for file:', file.id);
      
      // Try to fetch the media file as a blob
      const response = await axiosInstance.get(`/api/profile/talent/media/${file.id}/`, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      });
      
      if (response.data) {
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'image/jpeg' 
        });
        const blobUrl = URL.createObjectURL(blob);
        console.log('✅ Created blob URL:', blobUrl);
        return blobUrl;
      }
    } catch (error) {
      console.error('❌ Failed to fetch media as blob:', error);
      return null;
    }
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
    
    // If we have a valid URL, try different base URLs
    if (validUrl) {
      console.log('🔗 Processing URL:', validUrl);
      
      // If it's a CDN URL, try different base URLs
      if (validUrl.includes('cdn.gan7club.com')) {
        console.log('🔗 CDN URL detected, trying alternative base URLs');
        
        // Extract the path from the CDN URL
        const urlParts = validUrl.split('cdn.gan7club.com');
        if (urlParts.length > 1) {
          const mediaPath = urlParts[1];
          console.log('🔗 Media path extracted:', mediaPath);
          
          // Try different base URLs
          alternativeUrls = [
            mediaPath, // Relative path
            `/media${mediaPath}`, // Media proxy path
            `https://api.gan7club.com${mediaPath}`, // API server
            `https://gan7club.com${mediaPath}`, // Main domain
            validUrl // Original CDN URL as fallback
          ];
          
          console.log('🔗 Alternative URLs to try:', alternativeUrls);
        }
      } else if (validUrl.startsWith('/')) {
        // If it's a relative path, try different base URLs
        console.log('🔗 Relative path detected, trying different base URLs');
        alternativeUrls = [
          validUrl, // Original relative path
          `/media${validUrl}`, // Media proxy path
          `https://api.gan7club.com${validUrl}`, // API server
          `https://gan7club.com${validUrl}`, // Main domain
        ];
        
        console.log('🔗 Alternative URLs to try:', alternativeUrls);
      } else if (validUrl.startsWith('http')) {
        // If it's an absolute URL, try the media proxy version
        console.log('🔗 Absolute URL detected, trying media proxy');
        try {
          const url = new URL(validUrl);
          const mediaPath = url.pathname;
          alternativeUrls = [
            validUrl, // Original URL
            `/media${mediaPath}`, // Media proxy path
          ];
          
          console.log('🔗 Alternative URLs to try:', alternativeUrls);
        } catch (e) {
          console.log('🔗 Could not parse URL:', validUrl);
        }
      }
    }
    
    // If we have a file ID, try to construct a direct API URL
    if (file.id) {
      const apiUrl = `/api/profile/talent/media/${file.id}/`;
      console.log('🔗 Adding API URL as alternative:', apiUrl);
      alternativeUrls.unshift(apiUrl); // Add API URL as first alternative
    }
    
    // If we have a filename, try to construct a media URL
    if (file.name || file.filename) {
      const filename = file.name || file.filename;
      const mediaUrl = `/media/${filename}`;
      console.log('🔗 Adding filename-based media URL as alternative:', mediaUrl);
      alternativeUrls.unshift(mediaUrl);
    }
    
    return {
      primary: validUrl,
      fallback: null,
      alternatives: alternativeUrls
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
    
    // Icon
    ctx.fillStyle = '#999';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🖼️', 150, 80);
    
    // File name
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(file.name || 'Media File', 150, 120);
    
    // File type
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    ctx.fillText(file.media_type || 'image', 150, 140);
    
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
                console.log('❌ All URLs failed, showing placeholder image');
                // Create and show placeholder image
                const placeholderUrl = createPlaceholderImage(file);
                e.target.src = placeholderUrl;
                e.target.onerror = null; // Prevent infinite loop
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