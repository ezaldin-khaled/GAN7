import React, { useState, useEffect } from 'react';
import { FaBox, FaTrash, FaUpload, FaPlus, FaImage } from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import ItemUploadForm from './ItemUploadForm';

const ItemGalleryTab = ({ mediaFiles, handleMediaUpload, isItemGallery = false }) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [apiResponseStructure, setApiResponseStructure] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('all');
  const [availableItemTypes, setAvailableItemTypes] = useState([]);
  const [originalResponseData, setOriginalResponseData] = useState(null);

  // Fetch items from the background items endpoint
  useEffect(() => {
    console.log('🔄 useEffect triggered - isItemGallery:', isItemGallery);
    if (isItemGallery) {
      console.log('🚀 Starting to fetch items...');
      fetchItems();
    } else {
      console.log('⏭️ Skipping fetch - not item gallery');
    }
  }, [isItemGallery]);

  const fetchItems = async () => {
    try {
      setFetchingItems(true);
      
      console.log('🔍 Fetching background items...');
      
      const response = await axiosInstance.get('/api/profile/background/items/');
      
      console.log('📥 Production Assets Pro items API response:', response.data);
      console.log('📋 Items structure:', JSON.stringify(response.data, null, 2));
      
      // Store original response data for filtering
      setOriginalResponseData(response.data);
      
      // Handle the new API structure where items are organized by type
      let itemsData = [];
      if (response.data && response.data.items) {
        // Extract available item types
        const itemTypes = Object.keys(response.data.items);
        setAvailableItemTypes(itemTypes);
        
        // Flatten all item types into a single array
        const allItemTypes = Object.values(response.data.items);
        itemsData = allItemTypes.flat();
        console.log('📦 Flattened items from all types:', itemsData);
        setApiResponseStructure(`Items by type: ${itemTypes.join(', ')}`);
      } else if (Array.isArray(response.data)) {
        itemsData = response.data;
        setApiResponseStructure('Direct array');
        setAvailableItemTypes([]);
      } else if (response.data.items && Array.isArray(response.data.items)) {
        itemsData = response.data.items;
        setApiResponseStructure('Nested items array');
        setAvailableItemTypes([]);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        itemsData = response.data.results;
        setApiResponseStructure('Results array');
        setAvailableItemTypes([]);
      } else {
        setApiResponseStructure('Unknown structure');
        setAvailableItemTypes([]);
      }
      
      console.log('🎯 Final items data to display:', itemsData);
      console.log('🎯 Items data type:', typeof itemsData);
      console.log('🎯 Items data length:', itemsData?.length);
      
      // Ensure itemsData is always an array
      const finalItems = Array.isArray(itemsData) ? itemsData : [];
      setItems(finalItems);
      setFetchingItems(false);
      
      // Show message if no items found
      if (!itemsData || itemsData.length === 0) {
        console.log('📭 No items found in API response');
        console.log('📭 Response data was:', response.data);
        console.log('📭 Response status was:', response.status);
      }
    } catch (err) {
      console.error('❌ Error fetching background items:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('Failed to load items. Please try again later.');
      setFetchingItems(false);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    // Use item_file instead of media_file for background users
    const fileFieldName = isItemGallery ? 'item_file' : 'media_file';
    formData.append(fileFieldName, files[0]);
    formData.append('name', files[0].name);
    
    handleMediaUpload(formData).then(() => {
      // Refresh items after successful upload
      if (isItemGallery) {
        fetchItems();
      }
    });
  };

  const handleDeleteItem = async (itemId) => {
    if (!isItemGallery) return;
    
    try {
      setLoading(true);
      
      await axiosInstance.delete(`/api/profile/background/items/${itemId}/`);
      
      // Refresh the items list
      await fetchItems();
      setSuccessMessage('Item deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('❌ Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (responseData) => {
    try {
      setLoading(true);
      setError('');
      
      // Show success message
      setSuccessMessage('Item uploaded successfully!');
      setShowUploadForm(false);
      
      // Refresh the items list
      if (isItemGallery) {
        await fetchItems();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error handling item submission:', error);
      setError('Failed to process item upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <h1 className="section-title">
        {isItemGallery ? 'Item Gallery' : 'Media Gallery'}
        {isItemGallery && (
          <span style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginLeft: '10px',
            fontWeight: 'normal'
          }}>
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        )}
      </h1>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="upload-area">
        <div className="upload-box" onClick={() => setShowUploadForm(true)}>
          <FaUpload className="upload-icon" />
          <h3>Upload {isItemGallery ? 'Item' : 'Media'} Files</h3>
          <span className="upload-info">Drag and drop files or click to browse</span>
        </div>
      </div>

      {/* Item Type Filter */}
      {isItemGallery && availableItemTypes.length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Filter by type:</label>
          <select 
            value={selectedItemType} 
            onChange={(e) => setSelectedItemType(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="all">All Types ({items.length})</option>
            {availableItemTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {fetchingItems && isItemGallery ? (
        <div className="loading-spinner">
          <div style={{ 
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #8236fc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '10px'
          }}></div>
          <span>Loading items...</span>
        </div>
      ) : (
        <div>
          <div className="gallery-grid">
            {/* Ensure we have valid arrays to work with */}
            {(() => {
              const displayItems = isItemGallery ? (Array.isArray(items) ? items : []) : (Array.isArray(mediaFiles) ? mediaFiles : []);
              
              // Filter items by selected type if needed
              let filteredItems = displayItems;
              if (isItemGallery && selectedItemType !== 'all' && originalResponseData?.items?.[selectedItemType]) {
                const selectedTypeItems = originalResponseData.items[selectedItemType];
                const selectedTypeIds = selectedTypeItems.map(item => item.id);
                filteredItems = displayItems.filter(item => selectedTypeIds.includes(item.id));
              }
              
              const hasItems = filteredItems.length > 0;
              
              return hasItems ? (
                filteredItems.map((file, index) => {
                  // Handle different possible image URL field names
                  const imageUrl = file.image || file.file_url || file.url || file.image_url || file.media_url;
                  const itemName = file.name || file.title || file.item_name || 'Untitled';
                  const itemId = file.id || file.item_id;
                  const itemDescription = file.description || '';
                  const itemPrice = file.price || '';
                  const itemGenre = file.genre?.name || '';
                  
                  // Check if it's an image based on various criteria
                  const isImage = file.media_type?.includes('image') || 
                                file.file_type?.includes('image') ||
                                imageUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                  
                  return (
                    <div className="gallery-item" key={index}>
                      {isImage ? (
                        <img src={imageUrl} alt={itemName} />
                      ) : (
                        <video src={imageUrl} controls />
                      )}
                      <div className="media-info">
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{itemName}</p>
                          {itemDescription && (
                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                              {itemDescription.length > 50 ? `${itemDescription.substring(0, 50)}...` : itemDescription}
                            </p>
                          )}
                          {itemGenre && (
                            <span style={{ 
                              fontSize: '10px', 
                              background: '#8236fc', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '10px',
                              marginRight: '4px'
                            }}>
                              {itemGenre}
                            </span>
                          )}
                          {itemPrice && (
                            <span style={{ 
                              fontSize: '12px', 
                              color: '#2f855a', 
                              fontWeight: 'bold'
                            }}>
                              ${itemPrice}
                            </span>
                          )}
                        </div>
                        {isItemGallery && itemId && (
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDeleteItem(itemId)}
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
                  <p>No {isItemGallery ? 'item' : 'media'} files uploaded yet</p>
                  <p>Upload images or videos to get started</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showUploadForm && (
        <ItemUploadForm
          onClose={() => setShowUploadForm(false)}
          onSubmit={handleItemSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ItemGalleryTab;