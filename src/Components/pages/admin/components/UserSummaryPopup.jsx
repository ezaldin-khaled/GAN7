import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStar, FaCheckCircle, FaBriefcase, FaGraduationCap, FaLanguage, FaAward, FaSpinner, FaImage, FaVideo } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './UserSummaryPopup.css';

const UserSummaryPopup = ({ user, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('=== USER SUMMARY POPUP DEBUG ===');
      console.log('User object received:', user);
      console.log('User profile_url:', user?.profile_url);
      console.log('User profile_type:', user?.profile_type);
      console.log('User id:', user?.id);
      console.log('User name:', user?.name || user?.title);
      
      if (!user?.profile_url) {
        console.log('No profile_url found, trying alternative approach for background users');
        // For background users, we might need to construct the URL or use a different approach
        if ((user?.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))) && user?.id) {
          console.log('Production Assets Pro user detected, constructing profile URL');
          // Try to construct the profile URL for background users
          const backgroundProfileUrl = `/dashboard/profiles/background/${user.id}/`;
          console.log('Constructed background profile URL:', backgroundProfileUrl);
          
          try {
            setLoading(true);
            setError(null);
            
            const response = await axiosInstance.get(backgroundProfileUrl);
            
            setUserData(response.data);
            console.log('Production Assets Pro profile data loaded:', response.data);
            setLoading(false);
            return;
          } catch (err) {
            console.error('Error fetching background profile:', err);
            console.log('Falling back to using search result data directly');
            
            // Fallback: Use the search result data directly
            if (user) {
              console.log('Using search result data as fallback:', user);
              setUserData(user);
              setLoading(false);
              return;
            } else {
              setError('Failed to load background user profile');
              setLoading(false);
              return;
            }
          }
        } else {
          console.log('No profile_url and not a background user, cannot fetch data');
          setError('No profile URL available for this user');
          setLoading(false);
          return;
        }
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('=== USER SUMMARY POPUP DEBUG ===');
        console.log('User object received:', user);
        console.log('User profile_url:', user.profile_url);
        console.log('User profile_type:', user.profile_type);
        
        // Check if this is a background user by URL pattern
        if (user.profile_url && user.profile_url.includes('background')) {
          console.log('Production Assets Pro user detected by URL pattern, fetching items from API');
          
          try {
            // For background users, fetch items from the API
            const itemsResponse = await axiosInstance.get('/api/profile/background/items/');
            
            console.log('Production Assets Pro items API response:', itemsResponse.data);
            
            // Transform the items data to a flat array for display
            const allItems = [];
            if (itemsResponse.data.items) {
              Object.keys(itemsResponse.data.items).forEach(itemType => {
                const itemsOfType = itemsResponse.data.items[itemType];
                if (Array.isArray(itemsOfType)) {
                  itemsOfType.forEach(item => {
                    allItems.push({
                      ...item,
                      item_type: itemType,
                      // Ensure we have the correct image field
                      media_file: item.image || item.media_file || item.photo,
                      name: item.name || item.title,
                      description: item.description || item.desc
                    });
                  });
                }
              });
            }
            
            console.log('Transformed items for display:', allItems);
            
            // Use the search result data but add the items
            const userDataWithItems = {
              ...user,
              items: allItems
            };
            
            setUserData(userDataWithItems);
            setLoading(false);
            return;
          } catch (err) {
            console.error('Error fetching background items:', err);
            console.log('Falling back to using search result data directly');
            
            // Fallback: Use the search result data directly
            if (user) {
              console.log('Using search result data as fallback:', user);
              setUserData(user);
              setLoading(false);
              return;
            } else {
              console.log('No user data available for fallback');
              setError('Failed to load background user profile. Using available data.');
              setLoading(false);
              return;
            }
          }
        }
        
        // Step 1: Get detailed profile info from profile_url
        console.log('Fetching profile from:', user.profile_url);
        const response = await axiosInstance.get(user.profile_url);
        
        setUserData(response.data);
        console.log('Production Assets Pro profile data loaded:', response.data);
        console.log('Profile data structure:', {
          has_profile: !!response.data.profile,
          has_user: !!response.data.user,
          has_items: !!response.data.items,
          has_media: !!response.data.media,
          profile_keys: response.data.profile ? Object.keys(response.data.profile) : [],
          user_keys: response.data.user ? Object.keys(response.data.user) : [],
          root_keys: Object.keys(response.data)
        });
        
        // Step 2: Extract media items from the profile detail
        const profileDetail = response.data;
        let extractedMedia = [];
        
        // Check for media in different possible locations
        if (profileDetail.media && Array.isArray(profileDetail.media)) {
          // Direct media array
          extractedMedia = profileDetail.media;
          console.log('Found media in profile.media:', extractedMedia.length, 'items');
        } else if (profileDetail.media_items && Array.isArray(profileDetail.media_items)) {
          // Alternative media_items array
          extractedMedia = profileDetail.media_items;
          console.log('Found media in profile.media_items:', extractedMedia.length, 'items');
        } else if (profileDetail.profile?.media && Array.isArray(profileDetail.profile.media)) {
          // Nested in profile object
          extractedMedia = profileDetail.profile.media;
          console.log('Found media in profile.profile.media:', extractedMedia.length, 'items');
        } else if (profileDetail.user?.media && Array.isArray(profileDetail.user.media)) {
          // Nested in user object
          extractedMedia = profileDetail.user.media;
          console.log('Found media in profile.user.media:', extractedMedia.length, 'items');
        }
        
        // Step 3: Transform media items to consistent format
        if (extractedMedia.length > 0) {
          setMediaLoading(true);
          
          const transformedMedia = extractedMedia.map((item, index) => ({
            id: item.id || index,
            name: item.name || item.title || `Media ${index + 1}`,
            media_type: item.media_type || item.file_type || 'image',
            media_file: item.media_file || item.file || item.url || item.image || item.media_url,
            media_info: item.media_info || item.description || item.caption || '',
            created_at: item.created_at || item.uploaded_at || item.date_created,
            thumbnail: item.thumbnail || item.thumb_url,
            mime_type: item.mime_type || item.content_type
          }));
          
          setMediaItems(transformedMedia);
          console.log('Transformed media items:', transformedMedia);
        } else {
          console.log('No media items found in profile');
          setMediaItems([]);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        
        // Handle specific error cases
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this profile.');
        } else if (err.response?.status === 404) {
          setError('User profile not found.');
        } else if (err.response?.status === 500) {
          // 500 error - likely backend issue with background user API
          console.log('500 error detected, checking if this is a background user');
          console.log('User profile_type:', user?.profile_type);
          console.log('User profile_url:', user?.profile_url);
          console.log('URL includes background:', user?.profile_url?.includes('background'));
          
          if (user?.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))) {
            console.log('Production Assets Pro user with 500 error, using search result data as fallback');
            // Use the search result data directly for background users
            if (user) {
              console.log('Using search result data for background user:', user);
              setUserData(user);
              setLoading(false);
              return;
            } else {
              console.log('No user data available for fallback');
              setError('Failed to load background user profile. Using available data.');
              setLoading(false);
              return;
            }
          } else {
            console.log('Not a background user, showing generic error');
            setError('Server error occurred. Please try again later.');
          }
        } else {
          setError('Failed to load user data. Please try again later.');
        }
      } finally {
        setLoading(false);
        setMediaLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="user-summary-overlay" onClick={onClose}>
        <div className="user-summary-popup loading" onClick={e => e.stopPropagation()}>
          <div className="loading-spinner">
            <FaSpinner className="spinner-icon" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-summary-overlay" onClick={onClose}>
        <div className="user-summary-popup error" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={onClose} aria-label="Close popup">
            <FaTimes />
          </button>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const profile = userData?.profile || {};
  const userInfo = profile.user || {};

  // Debug logging to see what data we have
  console.log('=== RENDERING USER SUMMARY POPUP ===');
  console.log('userData:', userData);
  console.log('userData.user:', userData?.user);
  console.log('userData.email:', userData?.email);
  console.log('userData.country:', userData?.country);
  console.log('userData.gender:', userData?.gender);
  console.log('userData.date_of_birth:', userData?.date_of_birth);
  console.log('userData.profile_score:', userData?.profile_score);
  console.log('userData.account_type:', userData?.account_type);
  console.log('Is background user:', (user.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))));

  // Count media items by type
  const mediaCounts = mediaItems.reduce((acc, item) => {
    const type = item.media_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="user-summary-overlay" onClick={onClose}>
      <div className="user-summary-popup" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close popup">
          <FaTimes />
        </button>

        <div className="user-summary-header">
          <div className="user-avatar">
            {(user.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))) ? (
              // For background users, use profile_picture from root level
              userData.profile_picture ? (
                <img 
                  src={userData.profile_picture} 
                  alt={`${userData.user?.first_name || userData.first_name || 'User'}'s profile`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )
            ) : (
              // For talent users, use profile.profile_picture
              profile.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt={`${userInfo.first_name}'s profile`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )
            )}
          </div>
          <div className="user-info">
            <h2>
              {(user.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))) 
                ? `${userData.user?.first_name || userData.first_name || 'Unknown'} ${userData.user?.last_name || userData.last_name || 'User'}`
                : `${userInfo.first_name} ${userInfo.last_name}`
              }
            </h2>
            <div className="user-badges">
              {(user.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))) ? (
                <span className="badge background-user">
                  <FaBriefcase /> Production Assets Pro User
                </span>
              ) : (
                <>
                  {profile.is_verified && (
                    <span className="badge verified">
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                  {profile.profile_score?.total && (
                    <span className="badge score">
                      <FaStar /> Score: {profile.profile_score.total}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="user-summary-content">
          {/* Background User Specific Section */}
          {(user.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))) && (
            <div className="info-section">
              <h3>Production Assets Pro Profile</h3>
              <div className="info-grid">
                {(userData.user?.first_name || userData.first_name) && (userData.user?.last_name || userData.last_name) && (
                  <div className="info-item">
                    <FaUser />
                    <span>{`${userData.user?.first_name || userData.first_name} ${userData.user?.last_name || userData.last_name}`}</span>
                  </div>
                )}
                {userData.email && (
                  <div className="info-item">
                    <FaEnvelope />
                    <span>{userData.email}</span>
                  </div>
                )}
                {(userData.city || userData.location) && userData.country && (
                  <div className="info-item">
                    <FaMapMarkerAlt />
                    <span>{`${userData.city || userData.location}, ${userData.country}`}</span>
                  </div>
                )}
                {userData.phone && (
                  <div className="info-item">
                    <FaPhone />
                    <span>{userData.phone}</span>
                  </div>
                )}
                {userData.gender && (
                  <div className="info-item">
                    <span>Gender: {userData.gender}</span>
                  </div>
                )}
                {userData.date_of_birth && (
                  <div className="info-item">
                    <span>Date of Birth: {new Date(userData.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                {userData.description && (
                  <div className="info-item">
                    <span>Description: {userData.description}</span>
                  </div>
                )}
                {userData.profile_score && (
                  <div className="info-item">
                    <span>Profile Score: {userData.profile_score}</span>
                  </div>
                )}
                {userData.account_type && (
                  <div className="info-item">
                    <span>Account Type: {userData.account_type}</span>
                  </div>
                )}
              </div>
              
              {/* Background User Bio */}
              {(userData.aboutyou || userData.bio || userData.about) && (
                <div className="info-section">
                  <h3>About</h3>
                  <p>{userData.aboutyou || userData.bio || userData.about}</p>
                </div>
              )}
            </div>
          )}

          {/* Talent User Section - Only show if not background */}
          {!(user.profile_type === 'background' || (user?.profile_url && user.profile_url.includes('background'))) && (
            <>
              <div className="info-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  {userInfo.email && (
                    <div className="info-item">
                      <FaEnvelope />
                      <span>{userInfo.email}</span>
                    </div>
                  )}
                  {profile.city && profile.country && (
                    <div className="info-item">
                      <FaMapMarkerAlt />
                      <span>{`${profile.city}, ${profile.country}`}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h3>Professional Details</h3>
                <div className="info-grid">
                  {userData.performer_type_display && (
                    <div className="info-item">
                      <FaBriefcase />
                      <span>{userData.performer_type_display}</span>
                    </div>
                  )}
                  {userData.years_experience && (
                    <div className="info-item">
                      <FaAward />
                      <span>{userData.years_experience} years of experience</span>
                    </div>
                  )}
                  {userData.availability_display && (
                    <div className="info-item">
                      <FaStar />
                      <span>Availability: {userData.availability_display}</span>
                    </div>
                  )}
                </div>
              </div>

              {profile.specialization_types && profile.specialization_types.length > 0 && (
                <div className="info-section">
                  <h3>Specializations</h3>
                  <div className="skills-list">
                    {profile.specialization_types.map((spec, index) => (
                      <span key={index} className="skill-tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-section">
                <h3>Physical Attributes</h3>
                <div className="info-grid">
                  {userData.height && (
                    <div className="info-item">
                      <span>Height: {userData.height} cm</span>
                    </div>
                  )}
                  {userData.weight && (
                    <div className="info-item">
                      <span>Weight: {userData.weight} kg</span>
                    </div>
                  )}
                  {userData.body_type_display && (
                    <div className="info-item">
                      <span>Body Type: {userData.body_type_display}</span>
                    </div>
                  )}
                  {userData.hair_color_display && (
                    <div className="info-item">
                      <span>Hair: {userData.hair_color_display}</span>
                    </div>
                  )}
                  {userData.eye_color_display && (
                    <div className="info-item">
                      <span>Eyes: {userData.eye_color_display}</span>
                    </div>
                  )}
                  {userData.skin_tone_display && (
                    <div className="info-item">
                      <span>Skin Tone: {userData.skin_tone_display}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="info-section">
            <h3>Media Content</h3>
            <div className="media-stats">
              <div className="media-stat">
                <FaImage />
                <span>{mediaCounts.image || 0} Images</span>
              </div>
              <div className="media-stat">
                <FaVideo />
                <span>{mediaCounts.video || 0} Videos</span>
              </div>
              {/* Add items count for background users */}
              {(userData.items || userData.owned_items) && (userData.items || userData.owned_items).length > 0 && (
                <div className="media-stat">
                  <FaBriefcase />
                  <span>{(userData.items || userData.owned_items).length} Items</span>
                </div>
              )}
            </div>
            
            {mediaLoading ? (
              <div className="media-loading">
                <FaSpinner className="spinner-icon" />
                <span>Loading media...</span>
              </div>
            ) : (mediaItems.length > 0 || (userData.items && userData.items.length > 0)) ? (
              <div className="media-grid">
                {/* Display media items */}
                {mediaItems.map((item, index) => (
                  <div key={`media-${item.id || index}`} className={`media-item ${item.media_type}`}>
                    {item.media_type === 'video' ? (
                      <video controls>
                        <source src={item.media_file} type={item.mime_type} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img 
                        src={item.media_file} 
                        alt={item.media_info || item.name || `Media ${index + 1}`}
                        loading="lazy"
                        onError={(e) => {
                          console.log('Image failed to load:', item.media_file);
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    {(item.media_info || item.name) && (
                      <div className="media-caption">
                        <h4>{item.name}</h4>
                        {item.media_info && <p>{item.media_info}</p>}
                        {item.created_at && (
                          <small>Created: {new Date(item.created_at).toLocaleDateString()}</small>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Display background user items */}
                {(userData.items || userData.owned_items) && (userData.items || userData.owned_items).map((item, index) => (
                  <div key={`item-${item.id || index}`} className="media-item item">
                    <div className="item-media">
                      {item.media_file || item.image || item.photo ? (
                        <img 
                          src={item.media_file || item.image || item.photo} 
                          alt={item.name || item.title || `Item ${index + 1}`}
                          loading="lazy"
                          onError={(e) => {
                            console.log('Item image failed to load:', item.media_file || item.image || item.photo);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="item-placeholder" style={{ display: (item.media_file || item.image || item.photo) ? 'none' : 'block' }}>
                        <FaBriefcase />
                      </div>
                    </div>
                    {(item.name || item.title || item.description || item.desc) && (
                      <div className="media-caption">
                        <h4>{item.name || item.title || `Item ${index + 1}`}</h4>
                        {item.item_type || item.type && (
                          <p className="item-type">{item.item_type || item.type}</p>
                        )}
                        {(item.description || item.desc) && (
                          <p>{item.description || item.desc}</p>
                        )}
                        {item.created_at && (
                          <small>Created: {new Date(item.created_at).toLocaleDateString()}</small>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-media">
                <p>No media content available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSummaryPopup; 