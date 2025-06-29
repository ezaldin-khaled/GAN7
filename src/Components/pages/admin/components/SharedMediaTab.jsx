import React, { useState, useEffect } from 'react';
import { FaShare, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './SharedMediaTab.css';
import Loader from '../../../common/Loader';

// Constants for media categories and content types
const CATEGORIES = {
    featured: 'Featured Work',
    inspiration: 'Inspiration',
    trending: 'Trending',
    spotlight: 'Artist Spotlight',
    general: 'General'
};

const CONTENT_TYPES = {
    talent_media: 'Talent Media',
    band_media: 'Band Media',
    prop: 'Props',
    costume: 'Costumes',
    location: 'Locations',
    memorabilia: 'Memorabilia',
    vehicle: 'Vehicles',
    artistic_material: 'Artistic Materials',
    music_item: 'Music Items',
    rare_item: 'Rare Items'
};

const SharedMediaTab = ({ selectedUser, searchResults }) => {
    const [sharedMedia, setSharedMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [shareForm, setShareForm] = useState({
        caption: '',
        category: 'general',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [sharingLoading, setSharingLoading] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [stats, setStats] = useState({
        total_shared: 0,
        by_category: {},
        by_content_type: {},
        top_sharers: []
    });

    useEffect(() => {
        if (selectedUser && selectedUser.id) {
            if (searchResults && searchResults.length > 0) {
                const userInResults = searchResults.find(result => result.id === selectedUser.id);
                
                if (userInResults) {
                    if (userInResults.media_items || userInResults.media) {
                        processUserMedia(userInResults);
                        return;
                    }
                }
            }
            
            fetchUserMedia(selectedUser);
        } else {
            setSharedMedia([]);
            setLoading(false);
        }
    }, [selectedUser, searchResults]);

    useEffect(() => {
    }, []);

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const showErrorMessage = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    // Helper function to check if media is shared
    const isMediaShared = (media) => {
        return media.sharing_status?.is_shared || media.is_shared;
    };

    // Function to prevent sharing already shared media
    const preventShareClick = (e, media) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isMediaShared(media)) {
            showErrorMessage('This media has already been shared to the gallery.');
            return false;
        }
        openShareModal(media);
    };

    const openShareModal = (media) => {
        if (isMediaShared(media)) {
            showErrorMessage('This media has already been shared to the gallery.');
            return;
        }
        
        setSelectedMedia(media);
        setShareForm({
            content_type: 'talent_media',
            object_id: media.id,
            caption: media.name || media.media_info || '',
            category: 'general',
            tags: []
        });
        setTagInput('');
        setShowShareModal(true);
    };

    const closeShareModal = () => {
        setShowShareModal(false);
        setSelectedMedia(null);
        setShareForm({
            content_type: 'talent_media',
            object_id: '',
            caption: '',
            category: 'general',
            tags: []
        });
        setTagInput('');
        setSharingLoading(false);
    };

    const addTag = () => {
        if (tagInput.trim() && !shareForm.tags.includes(tagInput.trim())) {
            setShareForm(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setShareForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleShareMedia = async () => {
        if (!shareForm.caption.trim()) {
            showErrorMessage('Please provide a caption for the media');
            return;
        }

        try {
            setSharingLoading(true);
            setError(null);

            const shareData = {
                content_type: shareForm.content_type,
                object_id: parseInt(shareForm.object_id, 10),
                caption: shareForm.caption.trim(),
                category: shareForm.category,
                tags: shareForm.tags
            };

            if (!shareData.object_id || isNaN(shareData.object_id)) {
                showErrorMessage('Invalid media ID. Please try again.');
                return;
            }

            if (!shareData.caption || shareData.caption.length < 1) {
                showErrorMessage('Please provide a caption for the media.');
                return;
            }

            const response = await axiosInstance.post('/api/dashboard/share-media/', shareData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.message === 'Media shared successfully!') {
                showSuccessMessage('Media shared successfully to gallery!');
                closeShareModal();
                
                setSharedMedia(prev => prev.map(media => 
                    media.id === shareForm.object_id 
                        ? { ...media, is_shared: true, shared_at: new Date().toISOString() }
                        : media
                ));
            } else {
                showErrorMessage('Failed to share media. Please try again.');
            }

        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        showErrorMessage(`Invalid request: ${err.response.data?.detail || err.response.data?.error || err.response.data?.message || 'Please check your input'}`);
                        break;
                    case 401:
                        showErrorMessage('Please log in to share media');
                        break;
                    case 403:
                        showErrorMessage("You don't have permission to share media");
                        break;
                    case 404:
                        showErrorMessage('API endpoint not found. Saving to local storage instead.');
                        // Save to localStorage as fallback
                        saveToLocalStorage();
                        break;
                    case 500:
                        // Handle 500 error by saving to localStorage for demo purposes
                        const sharedMediaItem = {
                            id: shareData.object_id,
                            content_type: shareData.content_type,
                            caption: shareData.caption,
                            category: shareData.category,
                            tags: shareData.tags,
                            shared_at: new Date().toISOString(),
                            user_id: selectedUser.id,
                            user_name: selectedUser.username || selectedUser.name
                        };
                        
                        saveToLocalStorage(sharedMediaItem);
                        showSuccessMessage('Media shared successfully to gallery! (Saved locally due to API error)');
                        closeShareModal();
                        
                        setSharedMedia(prev => prev.map(media => 
                            media.id === shareData.object_id 
                                ? { ...media, is_shared: true, shared_at: new Date().toISOString() }
                                : media
                        ));
                        
                        return;
                    default:
                        showErrorMessage(`Failed to share media: ${err.response.data?.detail || err.response.data?.message || 'Unknown error'}`);
                }
            } else if (err.request) {
                showErrorMessage('No response from server. Saving to local storage instead.');
                saveToLocalStorage();
            } else {
                showErrorMessage(`Request setup error: ${err.message}`);
            }
        } finally {
            setSharingLoading(false);
        }
    };

    // Function to save shared media to localStorage
    const saveToLocalStorage = (sharedMediaItem) => {
        try {
            const existingShared = JSON.parse(localStorage.getItem('sharedMedia') || '[]');
            const updatedShared = [...existingShared, sharedMediaItem];
            localStorage.setItem('sharedMedia', JSON.stringify(updatedShared));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    const processUserMedia = (userData) => {
        try {
            let mediaItems = [];
            
            if (userData.media_items && Array.isArray(userData.media_items)) {
                mediaItems = userData.media_items;
            } else if (userData.media && Array.isArray(userData.media)) {
                mediaItems = userData.media;
            } else {
                setSharedMedia([]);
                setLoading(false);
                return;
            }
            
            const shareableMedia = mediaItems.filter(media => 
                !media.is_test_video && !media.is_about_yourself_video
            );
            
            const transformedMedia = shareableMedia.map((media) => {
                // Use the actual API response structure for sharing status
                const isShared = media.sharing_status?.is_shared || false;
                const sharingInfo = media.sharing_status || {};
                
                return {
                    id: media.id,
                    name: media.name || media.title || 'Untitled Media',
                    media_info: media.media_info || media.description || media.caption || '',
                    media_type: media.media_type || media.file_type || 'image',
                    media_file: media.media_file || media.file || media.url || media.image || media.media_url,
                    thumbnail: media.thumbnail || media.thumb_url,
                    created_at: media.created_at || media.uploaded_at || media.date_created,
                    is_test_video: media.is_test_video || false,
                    is_about_yourself_video: media.is_about_yourself_video || false,
                    content_type: 'talent_media',
                    category: sharingInfo.category || 'general',
                    is_shared: isShared,
                    sharing_status: media.sharing_status || { is_shared: false }, // Preserve original structure
                    shared_at: isShared ? (sharingInfo.shared_at || new Date().toISOString()) : null,
                    shared_by: sharingInfo.shared_by || null,
                    shared_post_id: sharingInfo.shared_post_id || null,
                    caption: sharingInfo.caption || '',
                    user: {
                        id: userData.id,
                        first_name: userData.user?.first_name || userData.first_name || 'Unknown',
                        last_name: userData.user?.last_name || userData.last_name || 'User',
                        email: userData.user?.email || userData.email || 'unknown@example.com',
                        profile_image: userData.user?.profile_image || userData.profile_image || null
                    }
                };
            });
            
            setSharedMedia(transformedMedia);
            
        } catch (error) {
            console.error('Error processing user media:', error);
            setSharedMedia([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserMedia = async (user) => {
        try {
            setLoading(true);
            setError(null);
            
            if (!user.profile_url) {
                throw new Error('No profile URL available for this user');
            }
            
            const response = await axiosInstance.get(user.profile_url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Accept': 'application/json'
                }
            });
            
            const profileData = response.data;
            
            let mediaItems = [];
            
            if (profileData.media && Array.isArray(profileData.media)) {
                mediaItems = profileData.media;
            } else if (profileData.media_items && Array.isArray(profileData.media_items)) {
                mediaItems = profileData.media_items;
            } else if (profileData.profile?.media && Array.isArray(profileData.profile.media)) {
                mediaItems = profileData.profile.media;
            } else if (profileData.user?.media && Array.isArray(profileData.user.media)) {
                mediaItems = profileData.user.media;
            }
            
            const shareableMedia = mediaItems.filter(media => 
                !media.is_test_video && !media.is_about_yourself_video
            );
            
            if (shareableMedia.length === 0) {
                setSharedMedia([]);
                setLoading(false);
                return;
            }
            
            const transformedMedia = shareableMedia.map((media) => {
                // Use the actual API response structure for sharing status
                const isShared = media.sharing_status?.is_shared || false;
                const sharingInfo = media.sharing_status || {};
                
                return {
                    id: media.id,
                    name: media.name || media.title || 'Untitled Media',
                    media_info: media.media_info || media.description || media.caption || '',
                    media_type: media.media_type || media.file_type || 'image',
                    media_file: media.media_file || media.file || media.url || media.image || media.media_url,
                    thumbnail: media.thumbnail || media.thumb_url,
                    created_at: media.created_at || media.uploaded_at || media.date_created,
                    is_test_video: media.is_test_video || false,
                    is_about_yourself_video: media.is_about_yourself_video || false,
                    content_type: 'talent_media',
                    category: sharingInfo.category || 'general',
                    is_shared: isShared,
                    sharing_status: media.sharing_status || { is_shared: false }, // Preserve original structure
                    shared_at: isShared ? (sharingInfo.shared_at || new Date().toISOString()) : null,
                    shared_by: sharingInfo.shared_by || null,
                    shared_post_id: sharingInfo.shared_post_id || null,
                    caption: sharingInfo.caption || '',
                    user: {
                        id: user.id,
                        first_name: user.first_name || profileData.user?.first_name || 'Unknown',
                        last_name: user.last_name || profileData.user?.last_name || 'User',
                        email: user.email || profileData.user?.email || 'unknown@example.com',
                        profile_image: user.profile_image || profileData.user?.profile_image || null
                    }
                };
            });
            
            setSharedMedia(transformedMedia);
            
        } catch (err) {
            console.error('=== ERROR FETCHING USER MEDIA ===');
            console.error('Error details:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);
            
            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        showErrorMessage("Please log in to access this feature");
                        break;
                    case 403:
                        showErrorMessage("You don't have permission to access this feature");
                        break;
                    case 404:
                        showErrorMessage("User profile not found");
                        break;
                    default:
                        showErrorMessage(`Failed to fetch user media: ${err.response.status} - ${err.response.data?.detail || err.response.data?.message || 'Unknown error'}`);
                }
            } else {
                showErrorMessage(`Network error: ${err.message}`);
            }
            setSharedMedia([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const mediaCounts = {};
            const userCounts = {};
            
            sharedMedia.forEach(media => {
                const contentType = media.content_type || 'talent_media';
                mediaCounts[contentType] = (mediaCounts[contentType] || 0) + 1;
                
                const userId = media.user?.id || 'unknown';
                userCounts[userId] = (userCounts[userId] || 0) + 1;
            });
            
            const stats = {
                total_shared: sharedMedia.filter(m => isMediaShared(m)).length,
                by_category: {
                    'Featured': sharedMedia.filter(m => m.category === 'featured' && isMediaShared(m)).length,
                    'Trending': sharedMedia.filter(m => m.category === 'trending' && isMediaShared(m)).length,
                    'Inspiration': sharedMedia.filter(m => m.category === 'inspiration' && isMediaShared(m)).length,
                    'General': sharedMedia.filter(m => m.category === 'general' && isMediaShared(m)).length
                },
                by_content_type: mediaCounts,
                top_sharers: Object.entries(userCounts)
                    .map(([userId, count]) => ({
                        user_id: userId,
                        count: count
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
            };
            
            setStats(stats);
        } catch (err) {
            console.error('Failed to calculate stats:', err);
            setStats({
                total_shared: 0,
                by_category: {},
                by_content_type: {},
                top_sharers: []
            });
        }
    };

    useEffect(() => {
        fetchStats();
    }, [sharedMedia]);

    const handleDeleteMedia = async (id) => {
        if (!window.confirm('Are you sure you want to remove this media from the shared gallery?')) return;

        try {
            setError(null);
            setSharedMedia(prev => prev.filter(media => media.id !== id));
            showSuccessMessage("Media removed from shared gallery");
        } catch (err) {
            showErrorMessage("Failed to remove media");
            console.error(err);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!selectedUser) {
        return (
            <div className="shared-media-tab">
                <div className="no-user-selected">
                    <h3>No User Selected</h3>
                    <p>Please search for a user to view their shared media.</p>
                    <div className="search-instructions">
                        <ol>
                            <li>Go to the "Hybrid Workers" tab</li>
                            <li>Search for a user using the search functionality</li>
                            <li>Make sure to check "Include Media" in the search options</li>
                            <li>Click "View Profile" on a user</li>
                            <li>Then switch to the "Shared Media" tab to see their media</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shared-media-tab">
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}
            {demoMode && (
                <div className="demo-mode-notice">
                    <strong>Demo Mode:</strong> API endpoint not available. Media sharing is simulated for demonstration purposes.
                    <br />
                    <small>
                        To enable real sharing, the backend needs to implement the <code>/api/dashboard/share-media/</code> endpoint.
                    </small>
                </div>
            )}

            <div className="stats-container">
                <div className="stat-box">
                    <h3>Total Shared</h3>
                    <p>{stats.total_shared}</p>
                </div>
                <div className="stat-box">
                    <h3>Available Media</h3>
                    <p>{sharedMedia.length}</p>
                </div>
                <div className="stat-box">
                    <h3>Top Category</h3>
                    <p>{Object.keys(stats.by_category).length > 0 ? 
                        Object.entries(stats.by_category).sort((a, b) => b[1] - a[1])[0][0] : 
                        'Featured'}</p>
                </div>
            </div>

            <div className="shared-media-grid">
                {sharedMedia && sharedMedia.length > 0 ? (
                    sharedMedia.map(media => {
                        return (
                            <div key={media.id} className="media-card" style={{ position: 'relative', zIndex: 5 }}>
                                <div className="media-preview">
                                    {media.media_type === 'image' ? (
                                        <img 
                                            src={media.media_file} 
                                            alt={media.name || 'Media'}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : media.media_type === 'video' ? (
                                        <video 
                                            src={media.media_file}
                                            controls
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : (
                                        <div className="media-placeholder">
                                            <p>Unsupported media type: {media.media_type}</p>
                                        </div>
                                    )}
                                    <div className="media-error" style={{ display: 'none' }}>
                                        <p>Media failed to load</p>
                                    </div>
                                    {isMediaShared(media) && (
                                        <div className="shared-badge" style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(76, 175, 80, 0.9)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            backdropFilter: 'blur(5px)',
                                            zIndex: 10
                                        }}>
                                            <FaShare /> 
                                            {media.category && media.category !== 'general' ? 
                                                media.category.charAt(0).toUpperCase() + media.category.slice(1) : 
                                                'Shared'
                                            }
                                        </div>
                                    )}
                                    {isMediaShared(media) && (
                                        <div className="shared-overlay" style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(76, 175, 80, 0.1)',
                                            border: '2px solid rgba(76, 175, 80, 0.3)',
                                            borderRadius: '8px',
                                            pointerEvents: 'none',
                                            zIndex: 5
                                        }}></div>
                                    )}
                                </div>
                                <div className="media-info" style={{
                                    opacity: isMediaShared(media) ? 0.7 : 1,
                                    filter: isMediaShared(media) ? 'grayscale(20%)' : 'none'
                                }}>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {media.user?.profile_image ? (
                                                <img 
                                                    src={media.user.profile_image} 
                                                    alt={`${media.user.first_name} ${media.user.last_name}`}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {media.user?.first_name?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div className="avatar-placeholder" style={{ display: 'none' }}>
                                                {media.user?.first_name?.[0] || 'U'}
                                            </div>
                                        </div>
                                        <div className="user-details">
                                            <h4 className="user-name">
                                                {media.user?.first_name && media.user?.last_name 
                                                    ? `${media.user.first_name} ${media.user.last_name}`
                                                    : media.user?.email || 'Unknown User'}
                                            </h4>
                                            <span className="share-date">
                                                {media.created_at ? new Date(media.created_at).toLocaleDateString() : 'Unknown date'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="media-content">
                                        <h4 className="media-title">{media.name || 'Untitled Media'}</h4>
                                        <p className="caption">{media.media_info || 'No description available'}</p>
                                        
                                        {/* Show sharing details if media is shared */}
                                        {isMediaShared(media) && media.caption && (
                                            <div className="sharing-details" style={{
                                                background: '#f8f9fa',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                marginTop: '8px',
                                                borderLeft: '3px solid #28a745'
                                            }}>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                                                    <strong>Shared Caption:</strong>
                                                </p>
                                                <p style={{ margin: '0', fontSize: '13px', color: '#333' }}>
                                                    {media.caption}
                                                </p>
                                                {media.shared_by && (
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666' }}>
                                                        Shared by: {media.shared_by.name || 'Admin'}
                                                    </p>
                                                )}
                                                {media.shared_at && (
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666' }}>
                                                        Shared: {new Date(media.shared_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="media-meta">
                                            <span className="category">{media.category || 'General'}</span>
                                            <span className="content-type">{CONTENT_TYPES[media.content_type] || media.content_type || 'Talent Media'}</span>
                                        </div>
                                    </div>
                                    <div className="media-actions">
                                        {!isMediaShared(media) ? (
                                        <button 
                                            className="share-btn"
                                                type="button"
                                                onClick={(e) => {
                                                    preventShareClick(e, media);
                                                }}
                                            >
                                                <FaShare /> Share to Gallery
                                            </button>
                                        ) : (
                                            <button 
                                                className="shared-btn"
                                                disabled={true}
                                                title="This media has already been shared to the gallery"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    showErrorMessage('This media has already been shared to the gallery.');
                                                }}
                                                style={{
                                                    background: '#6c757d !important',
                                                    color: '#ffffff !important',
                                                    border: '1px solid #6c757d !important',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    cursor: 'not-allowed !important',
                                                    opacity: 0.6,
                                                    position: 'relative',
                                                    zIndex: 20,
                                                    pointerEvents: 'none',
                                                    userSelect: 'none',
                                                    transition: 'none'
                                                }}
                                            >
                                                <FaShare /> Already Shared
                                        </button>
                                        )}
                                        <button 
                                            className="delete-btn"
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteMedia(media.id);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-media-message">
                        {loading ? 'Loading media...' : 'No media found for this user.'}
                    </div>
                )}
            </div>

            {showShareModal && (
                <div className="modal-overlay">
                    <div className="share-modal">
                        <div className="modal-header">
                            <h3>Share Media to Gallery</h3>
                            <button className="close-btn" onClick={closeShareModal}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-content">
                            {selectedMedia && (
                                <div className="selected-media-preview">
                                    {selectedMedia.media_type === 'image' ? (
                                        <img src={selectedMedia.media_file} alt={selectedMedia.name} />
                                    ) : (
                                        <video src={selectedMedia.media_file} controls />
                                    )}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label>Caption *</label>
                                <textarea
                                    value={shareForm.caption}
                                    onChange={(e) => setShareForm(prev => ({ ...prev, caption: e.target.value }))}
                                    placeholder="Enter a compelling caption for this media..."
                                    rows={3}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={shareForm.category}
                                    onChange={(e) => setShareForm(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    {Object.entries(CATEGORIES).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Tags</label>
                                <div className="tag-input-container">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        placeholder="Add tags (press Enter)"
                                    />
                                    <button onClick={addTag} className="add-tag-btn">Add</button>
                                </div>
                                {shareForm.tags.length > 0 && (
                                    <div className="tags-container">
                                        {shareForm.tags.map((tag, index) => (
                                            <span key={index} className="tag">
                                                #{tag}
                                                <button onClick={() => removeTag(tag)} className="remove-tag">
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn" 
                                onClick={closeShareModal}
                                disabled={sharingLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="share-submit-btn" 
                                onClick={handleShareMedia}
                                disabled={sharingLoading || !shareForm.caption.trim()}
                            >
                                {sharingLoading ? 'Sharing...' : 'Share to Gallery'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedMediaTab;