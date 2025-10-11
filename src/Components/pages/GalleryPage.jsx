import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar/Navbar';
import Loader from '../common/Loader';
import axiosInstance from '../../api/axios';
import './GalleryPage.css';

const GalleryPage = () => {
  const { t } = useTranslation();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchSharedMedia();
  }, []);

  const fetchSharedMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access');
      
      const response = await axiosInstance.get('/api/dashboard/shared-media/');
      
      if (response.data && Array.isArray(response.data)) {
        const transformedMedia = response.data.map(item => ({
          id: item.id,
          title: item.caption || t('galleryPage.sharedMedia'),
          description: item.caption || t('galleryPage.noDescription'),
          imageUrl: item.content_info?.thumbnail_url || item.content_info?.media_url,
          mediaUrl: item.content_info?.media_url,
          mediaType: item.content_info?.media_type || 'image',
          category: item.category || 'general',
          tags: item.tags || [],
          sharedBy: item.shared_by_name || 'Admin',
          sharedAt: item.shared_at,
          isActive: item.is_active ?? true // Default to true if not provided
        }));
        
        setMediaItems(transformedMedia);

        if (transformedMedia.length === 0) {
          setError(t('galleryPage.noMediaShared'));
        }
      } else {
        setError(t('galleryPage.unexpectedDataFormat'));
        setMediaItems([]);
      }
    } catch (err) {
      console.error('Error fetching shared media:', err);
      if (err.response?.status === 404) {
        setError(t('galleryPage.endpointNotFound'));
      } else if (err.response?.status === 401) {
        setError(t('galleryPage.authRequired'));
      } else if (err.response?.status === 403) {
        setError(t('galleryPage.noPermission'));
      } else if (err.response?.status === 500) {
        setError(t('galleryPage.serverError'));
      } else {
        setError(`${t('galleryPage.failedToLoad')}: ${err.message}`);
      }
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'featured', 'trending', 'spotlight', 'inspiration', 'general'];
  
  const filteredMedia = selectedCategory === 'all' 
    ? mediaItems.filter(item => item.isActive)
    : mediaItems.filter(item => item.category === selectedCategory && item.isActive);

  if (loading) {
    return (
      <div className="gallery-page">
        <Navbar />
        <div className="gallery-container">
          <Loader />
          <p style={{ textAlign: 'center', color: 'white', marginTop: '20px' }}>{t('galleryPage.loadingGallery')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <Navbar />
      <div className="gallery-container">
        <div className="gallery-header">
          <h1>{t('galleryPage.title')}</h1>
          <p>{t('galleryPage.subtitle')}</p>
        </div>

        <div className="gallery-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {t(`galleryPage.categories.${category}`)}
            </button>
          ))}
        </div>

        {error && mediaItems.length === 0 && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="gallery-grid">
          {filteredMedia.map((item) => (
            <div key={item.id} className="gallery-item">
              <div className="gallery-item-image">
                {item.mediaType === 'video' ? (
                  <video 
                    src={item.mediaUrl} 
                    poster={item.imageUrl}
                    controls
                    onError={(e) => {
                      console.log('Video failed to load:', item.mediaUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    onError={(e) => {
                      console.log('Image failed to load:', item.imageUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                )}
                <div className="media-error" style={{ display: 'none' }}>
                  <p>{t('galleryPage.mediaFailedToLoad')}</p>
                </div>
                <div className="gallery-item-overlay">
                  <div className="gallery-item-info">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="media-meta">
                      <span className="shared-by">{t('galleryPage.sharedBy')} {item.sharedBy}</span>
                      <span className="share-date">
                        {item.sharedAt ? new Date(item.sharedAt).toLocaleDateString() : t('galleryPage.unknownDate')}
                      </span>
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="media-tags">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && !loading && !error && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'white',
            fontSize: '1.2rem',
            opacity: 0.8
          }}>
            {t('galleryPage.noMediaYet')}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage; 