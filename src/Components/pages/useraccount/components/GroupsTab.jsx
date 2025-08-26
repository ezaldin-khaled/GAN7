import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaLock, FaCrown, FaSync, FaKey } from 'react-icons/fa';
import { CreateBandModal, ManageBandModal } from './GroupModals';
import axiosInstance from '../../../../api/axios';
import './GroupsTab.css';
import '../EnhancedTabStyles.css'; // Import the enhanced styles

// Hardcoded band types as specified in API documentation
const BAND_TYPES = [
    { value: 'musical', label: 'Musical Bands/Troupes' },
    { value: 'theatrical', label: 'Theatrical Troupes' },
    { value: 'stunt', label: 'Stunt/Performance Teams' },
    { value: 'dance', label: 'Dance Troupes' },
    { value: 'event', label: 'Event Squads' }
];

const GroupsTab = ({ userData }) => {
  const [bands, setBands] = useState([]);
  const [joinedBands, setJoinedBands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasBandSubscription, setHasBandSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  // Add these new state variables for manage functionality
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedBand, setSelectedBand] = useState(null);
  const [editBand, setEditBand] = useState({
    name: '',
    description: '',
    genre: '',
    location: '',
    contact_email: '',
    website: ''
  });
  const [editImage, setEditImage] = useState(null);
  
  // Existing state variables
  const [newBand, setNewBand] = useState({
    name: '',
    description: '',
    genre: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [invitationCode, setInvitationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedBandForCode, setSelectedBandForCode] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [bandScore, setBandScore] = useState(null);

  // Enhanced authentication and permission state
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Function to validate authentication and get current user info
  const validateAuthentication = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        console.error('❌ No authentication token found');
        setAuthError('No authentication token found');
        return false;
      }

      // Debug: Log token info
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 Token payload:', {
        userId: tokenPayload.user_id || tokenPayload.userId || tokenPayload.id,
        exp: new Date(tokenPayload.exp * 1000).toISOString(),
        iat: new Date(tokenPayload.iat * 1000).toISOString()
      });

      // Use existing userData prop (should already be available)
      if (userData) {
        console.log('👤 Using userData prop:', userData);
        setCurrentUser(userData);
        setAuthError(null);
        return true;
      }

      // Fallback: Get user data from localStorage
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          console.log('👤 Using stored userData from localStorage:', parsedUserData);
          setCurrentUser(parsedUserData);
          setAuthError(null);
          return true;
        } catch (parseError) {
          console.error('❌ Error parsing stored user data:', parseError);
        }
      }

      // If no user data available, create minimal user object from token
      const minimalUser = {
        id: tokenPayload.user_id || tokenPayload.userId || tokenPayload.id,
        username: tokenPayload.username || 'unknown',
        email: tokenPayload.email || 'unknown@example.com'
      };
      
      console.log('👤 Using minimal user data from token:', minimalUser);
      setCurrentUser(minimalUser);
      setAuthError(null);
      return true;
      
    } catch (error) {
      console.error('❌ Authentication validation failed:', error);
      setAuthError('Authentication failed. Please log in again.');
      return false;
    }
  };

  // Function to check if user is band creator
  const isBandCreator = (band) => {
    if (!currentUser || !band) return false;
    
    // Check multiple ways the API might indicate creator status
    const isCreatorByFlag = band.is_creator === true;
    const isCreatorById = band.creator?.id === currentUser.id || band.creator_id === currentUser.id;
    const isCreatorByName = band.creator?.username === currentUser.username || 
                           band.creator_name === currentUser.username ||
                           band.creator_name === currentUser.full_name;
    
    console.log('🔍 Creator check for band:', band.name, {
      currentUser: currentUser.username,
      bandCreator: band.creator?.username || band.creator_name,
      isCreatorByFlag,
      isCreatorById,
      isCreatorByName,
      result: isCreatorByFlag || isCreatorById || isCreatorByName
    });
    
    return isCreatorByFlag || isCreatorById || isCreatorByName;
  };

  // Function to fetch detailed band information
  const fetchBandDetails = async (bandId) => {
    try {
      const token = localStorage.getItem('access');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      if (localStorage.getItem('is_talent') === 'true') {
        headers['is-talent'] = 'true';
      }
      
      // Add timeout to prevent hanging requests
      const response = await Promise.race([
        axiosInstance.get(`/api/bands/${bandId}/`, { headers }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      
      console.log(`📋 Band details for ${bandId}:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Error fetching band details for ${bandId}:`, err);
      return null;
    }
  };

  const fetchBands = async (forceRefresh = false) => {
    console.log('🔄 fetchBands called with forceRefresh:', forceRefresh);
    try {
      setLoading(true);
      setSubscriptionLoading(true);
      
      // Validate authentication first
      const isAuthenticated = await validateAuthentication();
      if (!isAuthenticated) {
        console.error('❌ Authentication validation failed');
        setBands([]);
        setJoinedBands([]);
        setHasBandSubscription(false);
        setLoading(false);
        setSubscriptionLoading(false);
        return;
      }
      
      // Get the authentication token
      const token = localStorage.getItem('access');
      if (!token) {
        console.error('❌ No authentication token found');
        setBands([]);
        setJoinedBands([]);
        setHasBandSubscription(false);
        setLoading(false);
        setSubscriptionLoading(false);
        return;
      }
      
      // Check if user is a talent user
      const isTalent = localStorage.getItem('is_talent') === 'true';
      
      // Prepare headers
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Add is-talent header if user is a talent
      if (isTalent) {
        headers['is-talent'] = 'true';
      }
      
      // Use the correct bands endpoint
      const url = forceRefresh ? `/api/bands/?_t=${Date.now()}` : '/api/bands/';
      const response = await axiosInstance.get(url, {
        headers: headers
      });
      
             console.log('API Response:', response.data);
      
      // Check if the response includes subscription_status (new combined format)
      if (response.data.subscription_status) {
        console.log('Found subscription_status in response:', response.data.subscription_status);
        const newSubscriptionStatus = response.data.subscription_status;
        setSubscriptionStatus(newSubscriptionStatus);
        setHasBandSubscription(newSubscriptionStatus.has_bands_subscription);
        
        // Show success message if subscription was just activated
        if (forceRefresh && newSubscriptionStatus.has_bands_subscription && !subscriptionStatus?.has_bands_subscription) {
          setSuccess('🎉 Your Bands subscription is now active! You can now create and manage bands.');
        }
        
                 // Extract bands from the new format - use bands array (not results)
         const bands = response.data.bands || [];
        
        // Filter bands created by the user vs joined bands
        const myBands = [];
        const otherBands = [];
        
        console.log('User Data:', userData);
        console.log('All bands from API:', bands);
        
        // Fetch detailed information for each band to get accurate creator data
        const bandsWithDetails = await Promise.all(
          bands.map(async (band) => {
            try {
              const detailedBand = await fetchBandDetails(band.id);
              if (detailedBand) {
                console.log(`Detailed band info for ${band.name}:`, detailedBand);
                return { ...band, ...detailedBand };
              }
            } catch (error) {
              console.warn(`Failed to fetch detailed info for band ${band.name}, using basic data`);
            }
            return band;
          })
        );
        
        bandsWithDetails.forEach(band => {
          console.log(`Band: ${band.name}, Creator: ${band.creator?.username || band.creator_name}, Is Creator: ${band.is_creator}`);
          
          // Use the new authentication-based creator check
          const isCreator = isBandCreator(band);
          
          if (isCreator) {
            console.log(`✅ Band "${band.name}" belongs to current user`);
            myBands.push(band);
          } else {
            console.log(`❌ Band "${band.name}" does not belong to current user`);
            otherBands.push(band);
          }
        });
        
        console.log('My bands:', myBands);
        console.log('Other bands:', otherBands);
        
        // Set only the user's bands, not all bands
        console.log('Setting bands state - myBands:', myBands.length, 'otherBands:', otherBands.length);
        
                 // Set only the user's bands, not all bands
         setBands(myBands);
         setJoinedBands(otherBands);
        
        // Set band score if available
        if (response.data.band_score) {
          console.log('Band score data:', response.data.band_score);
          console.log('Band score type:', typeof response.data.band_score);
          console.log('Band score keys:', Object.keys(response.data.band_score));
          setBandScore(response.data.band_score);
        }
      } else {
        // Old format - just bands array
        console.log('Using old format - no subscription_status found');
        
        // Filter bands created by the user vs joined bands
        const myBands = [];
        const otherBands = [];
        
        console.log('Using old format - Current userData:', userData);
        console.log('All bands from API (old format):', response.data);
        
        // For old format, also fetch detailed information for each band
        const bandsWithDetails = await Promise.all(
          response.data.map(async (band) => {
            try {
              const detailedBand = await fetchBandDetails(band.id);
              if (detailedBand) {
                console.log(`Detailed band info for ${band.name} (old format):`, detailedBand);
                return { ...band, ...detailedBand };
              }
            } catch (error) {
              console.warn(`Failed to fetch detailed info for band ${band.name} (old format), using basic data`);
            }
            return band;
          })
        );
        
        bandsWithDetails.forEach(band => {
          console.log(`Band: ${band.name}, Creator: ${band.creator?.username || band.creator_name}, Current user: ${currentUser?.username || currentUser?.full_name}`);
          
          // Use the new authentication-based creator check
          const isCreator = isBandCreator(band);
          
          if (isCreator) {
            console.log(`✅ Band "${band.name}" belongs to current user`);
            myBands.push(band);
          } else {
            console.log(`❌ Band "${band.name}" does not belong to current user`);
            otherBands.push(band);
          }
        });
        
        console.log('My bands (old format):', myBands);
        console.log('Other bands (old format):', otherBands);
        
        // If no bands are found for the current user, show all bands as a fallback
        if (myBands.length === 0 && response.data.length > 0) {
          console.log('⚠️ No bands found for current user (old format), showing all bands as fallback');
          setBands(response.data);
          setJoinedBands([]);
        } else {
          setBands(myBands);
          setJoinedBands(otherBands);
        }
        
        // Fallback to userData check for subscription
        if (userData && userData.band_subscription_type === 'bands') {
          setHasBandSubscription(true);
        } else {
          const accountType = userData?.account_type?.toLowerCase();
          if (accountType && accountType.includes('band')) {
            setHasBandSubscription(true);
          } else {
            setHasBandSubscription(false);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching bands:', err);
      // Check if it's a 403 error
      if (err.response && err.response.status === 403) {
        console.log('Authentication issue - user may need to log in again');
      }
      
      // Set default values on error
      setBands([]);
      setJoinedBands([]);
      setHasBandSubscription(false);
      setSubscriptionStatus(null);
      setBandScore(null);
    } finally {
      setLoading(false);
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 GroupsTab useEffect triggered');
    console.log('🚀 userData:', userData);
    
    // Initialize component with authentication validation
    const initializeComponent = async () => {
      // Validate authentication first
      await validateAuthentication();
      
      // Check if user just completed a subscription
      const pendingSubscription = sessionStorage.getItem('pendingSubscription');
      const shouldForceRefresh = pendingSubscription === 'BANDS' || pendingSubscription === 'bands';
      
      if (shouldForceRefresh) {
        console.log('Detected recent subscription, forcing refresh...');
        sessionStorage.removeItem('pendingSubscription'); // Clear the flag
        fetchBands(true); // Force refresh
      } else {
        fetchBands();
      }
    };
    
    initializeComponent();
    
    // Add polling to check for subscription updates every 30 seconds
    const pollInterval = setInterval(() => {
      // Only poll if we don't have a subscription yet
      if (!subscriptionStatus?.has_bands_subscription) {
        console.log('Polling for subscription status update...');
        fetchBands();
      }
    }, 30000);
    
    return () => clearInterval(pollInterval);
  }, [subscriptionStatus?.has_bands_subscription]);

  const handleCreateBand = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
         setNewBand({
       name: '',
       description: '',
       genre: '',
       location: '',
       contact_email: '',
       contact_phone: '',
       website: ''
     });
    setUploadedImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBand({
      ...newBand,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const handleSubmitBand = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get the authentication token
      const token = localStorage.getItem('access');
      if (!token) {
        alert('You need to log in again to create a band.');
        window.location.href = '/login';
        return;
      }
      
      // Check if user is a talent user
      const isTalent = localStorage.getItem('is_talent') === 'true';
      
      // Prepare band data according to exact API format
      const bandData = {
        name: newBand.name,
        description: newBand.description || "",
        band_type: newBand.genre || "musical",
        location: newBand.location || "",
        contact_email: newBand.contact_email || "",
        contact_phone: newBand.contact_phone || "+963123456789",
        website: newBand.website || ""
      };
      
      console.log('JSON data being sent:', bandData);
      
      // Include the Authorization header and is-talent header
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Add is-talent header if user is a talent
      if (isTalent) {
        headers['is-talent'] = 'true';
      }
      
      console.log('Request headers:', headers);
      
      const response = await axiosInstance.post('/api/bands/create/', bandData, {
        headers: headers
      });
      
      console.log('Band created successfully:', response.data);
      console.log('Band creation response type:', typeof response.data);
      console.log('Band creation response keys:', Object.keys(response.data));
      
      // Check if the response indicates success
      if (response.data.success || response.data.id) {
        setSuccess(response.data.message || 'Band created successfully!');
        handleCloseModal();
        
        // If the response contains the band data, add it to the state immediately
        if (response.data.id && response.data.name) {
          const newBandData = {
            ...response.data,
            is_creator: true,
            members_count: 1,
                         creator_name: userData?.full_name || userData?.username || userData?.email || 'Current User'
          };
          console.log('Adding new band to state:', newBandData);
          setBands(prevBands => {
            console.log('Previous bands:', prevBands);
            const updatedBands = [...prevBands, newBandData];
            console.log('Updated bands:', updatedBands);
            return updatedBands;
          });
        } else {
          // If no band data in response but creation was successful, force refresh
          console.log('No band data in response, forcing refresh...');
          setTimeout(() => {
            fetchBands(true);
          }, 1000);
        }
        
        // Force refresh to get the updated bands list
        setTimeout(() => {
          console.log('Forcing refresh after band creation...');
          fetchBands(true);
        }, 2000); // Increased delay to ensure the backend has processed the creation
      } else {
        throw new Error(response.data.error || 'Failed to create band');
      }
    } catch (err) {
      console.error('Error creating band:', err);
      
      // Add detailed error logging
      if (err.response) {
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', JSON.stringify(err.response.data, null, 2));
        
        // Display specific error message if available
        if (err.response.data) {
          let errorMessage = '';
          
          // Handle different error response formats
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (typeof err.response.data === 'object') {
            // Extract all error messages from the object
            const errorMessages = [];
            Object.entries(err.response.data).forEach(([key, value]) => {
              const valueStr = Array.isArray(value) ? value.join(', ') : value;
              errorMessages.push(`${key}: ${valueStr}`);
            });
            errorMessage = errorMessages.join('\n');
          }
          
          if (errorMessage) {
            setSuccess(''); // Clear any existing success message
            alert(`Failed to create band: ${errorMessage}`);
          }
        }
      }
      
      // Don't close modal on error so user can fix the issue
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  // Add these handlers to your component
  
  const handleManageBand = (band) => {
    setSelectedBand(band);
    setEditBand({
      name: band.name,
      description: band.description,
      genre: band.genre || '',
      location: band.location || '',
      contact_email: band.contact_email || '',
      website: band.website || ''
    });
    // Reset member management arrays when opening modal
    setMembersToUpdate([]);
    setMembersToRemove([]);
    setShowManageModal(true);
  };
  
  const handleEditImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditImage(e.target.files[0]);
    }
  };
  
  // Add these state variables to your component
  const [membersToUpdate, setMembersToUpdate] = useState([]);
  const [membersToRemove, setMembersToRemove] = useState([]);
  
  // Add these handler functions
  const handleMemberRoleChange = (memberId, newRole) => {
    // Update the membersToUpdate array
    const updatedMembers = [...membersToUpdate];
    const existingIndex = updatedMembers.findIndex(m => m.id === memberId);
    
    if (existingIndex >= 0) {
      updatedMembers[existingIndex].role = newRole;
    } else {
      updatedMembers.push({ id: memberId, role: newRole });
    }
    
    setMembersToUpdate(updatedMembers);
  };
  
  const handleRemoveMember = (memberId) => {
    // Validate that current user is the band creator
    if (!selectedBand || !isBandCreator(selectedBand)) {
      console.error('❌ Permission denied: Only band creator can remove members');
      alert('Only the band creator can remove members.');
      return;
    }

    // Validate that we're not trying to remove the creator
    const memberToRemove = selectedBand.members_data?.find(member => member.id === memberId);
    if (memberToRemove && memberToRemove.username === currentUser?.username) {
      console.error('❌ Cannot remove band creator');
      alert('Band creators cannot remove themselves.');
      return;
    }

    // Add to membersToRemove array if not already there
    // Note: memberId should be the BandMembership ID, not the user ID
    if (!membersToRemove.includes(memberId)) {
      setMembersToRemove([...membersToRemove, memberId]);
      console.log(`✅ Member ${memberId} marked for removal. Members to remove:`, [...membersToRemove, memberId]);
    } else {
      console.log(`ℹ️ Member ${memberId} is already marked for removal`);
    }
  };
  
  // Add this function to handle edit input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditBand({
      ...editBand,
      [name]: value
    });
  };
  
  // Update handleUpdateBand to include member management
  const handleUpdateBand = async (e) => {
    e.preventDefault();
    
    if (!selectedBand) return;
    
    // Validate that current user is the band creator
    if (!isBandCreator(selectedBand)) {
      console.error('❌ Permission denied: Only band creator can update band');
      alert('Only the band creator can update band details.');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('access');
      if (!token) {
        console.error('❌ No authentication token found');
        return;
      }
      
      const formData = new FormData();
      formData.append('name', editBand.name);
      formData.append('description', editBand.description);
      if (editBand.location) formData.append('location', editBand.location);
      if (editBand.contact_email) formData.append('contact_email', editBand.contact_email);
      if (editBand.website) formData.append('website', editBand.website);
      if (editImage) formData.append('profile_picture', editImage);
      
      // Add member role updates if any
      if (membersToUpdate.length > 0) {
        formData.append('members', JSON.stringify(membersToUpdate));
      }
      
      // Add members to remove if any
      if (membersToRemove.length > 0) {
        console.log('📤 Sending members to remove:', membersToRemove);
        formData.append('members_to_remove', JSON.stringify(membersToRemove));
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };
      
      if (localStorage.getItem('is_talent') === 'true') {
        headers['is-talent'] = 'true';
      }
      
      // Add timeout and retry logic
      const timeout = 15000; // 15 seconds timeout
      const maxRetries = 2;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} - Updating band ${selectedBand.id}`);
          
          // Use the correct API endpoint for band updates with timeout
          const response = await Promise.race([
            axiosInstance.put(`/api/bands/${selectedBand.id}/update/`, formData, { headers }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
            )
          ]);
          
          console.log('✅ Band updated successfully:', response.data);
          setSuccess('Band updated successfully!');
          handleCloseManageModal();
          fetchBands(); // Refresh the bands list
          return; // Success, exit the retry loop
          
        } catch (error) {
          lastError = error;
          console.error(`❌ Attempt ${attempt} failed:`, error);
          
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // If we get here, all retries failed
      throw lastError;
      
    } catch (err) {
      console.error('❌ Error updating band:', err);
      
      // Enhanced error handling based on API integration guide
      if (err.message && err.message.includes('timeout')) {
        alert('Request timed out. The server is taking too long to respond. Please try again later.');
      } else if (err.response) {
        const { status, data } = err.response;
        let errorMessage = '';
        
        console.log('🔍 Error response:', { status, data });
        
        switch (status) {
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 403:
            errorMessage = data?.detail || data?.error || 'Permission denied. Only the band creator can update band details.';
            break;
          case 400:
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data?.error) {
              errorMessage = data.error;
            } else if (data?.detail) {
              errorMessage = data.detail;
            } else {
              // Extract validation errors
              const errorMessages = [];
              Object.entries(data).forEach(([key, value]) => {
                const valueStr = Array.isArray(value) ? value.join(', ') : value;
                errorMessages.push(`${key}: ${valueStr}`);
              });
              errorMessage = errorMessages.join('\n');
            }
            break;
          default:
            errorMessage = data?.detail || data?.error || data?.message || 'An unexpected error occurred.';
        }
        
        if (errorMessage) {
          alert(`Failed to update band: ${errorMessage}`);
        }
      } else if (err.request) {
        console.error('❌ Network error:', err.request);
        alert('Network error. Please check your connection and try again.');
      } else {
        console.error('❌ Unexpected error:', err.message);
        alert('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle member removal using the correct API endpoint
  const handleRemoveMembers = async () => {
    if (!selectedBand || membersToRemove.length === 0) {
      console.log('ℹ️ No members to remove');
      return;
    }

    // Validate that current user is the band creator
    if (!isBandCreator(selectedBand)) {
      console.error('❌ Permission denied: Only band creator can remove members');
      alert('Only the band creator can remove members.');
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('access');
      if (!token) {
        console.error('❌ No authentication token found');
        return;
      }

      console.log('📤 Removing members:', membersToRemove);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      if (localStorage.getItem('is_talent') === 'true') {
        headers['is-talent'] = 'true';
      }

      // Add timeout and retry logic
      const timeout = 15000; // 15 seconds timeout
      const maxRetries = 2;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} - Removing members from band ${selectedBand.id}`);
          
          // Use the correct API endpoint for member removal with timeout
          const response = await Promise.race([
            axiosInstance.put(`/api/bands/${selectedBand.id}/update/`, {
              members_to_remove: membersToRemove
            }, { headers }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
            )
          ]);

          console.log('✅ Members removed successfully:', response.data);
          setSuccess('Members removed successfully!');
          
          // Reset member removal state
          setMembersToRemove([]);
          
          // Refresh band data
          fetchBands();
          return; // Success, exit the retry loop
          
        } catch (error) {
          lastError = error;
          console.error(`❌ Attempt ${attempt} failed:`, error);
          
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // If we get here, all retries failed
      throw lastError;
      
    } catch (err) {
      console.error('❌ Error removing members:', err);
      
      // Enhanced error handling
      if (err.message && err.message.includes('timeout')) {
        alert('Request timed out. The server is taking too long to respond. Please try again later.');
      } else if (err.response) {
        const { status, data } = err.response;
        let errorMessage = '';
        
        console.log('🔍 Error response:', { status, data });
        
        switch (status) {
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 403:
            errorMessage = data?.detail || data?.error || 'Permission denied. Only the band creator can remove members.';
            break;
          case 400:
            errorMessage = data?.error || data?.detail || 'Invalid request. Please check the member IDs.';
            break;
          default:
            errorMessage = data?.detail || data?.error || data?.message || 'An unexpected error occurred.';
        }
        
        if (errorMessage) {
          alert(`Failed to remove members: ${errorMessage}`);
        }
      } else if (err.request) {
        console.error('❌ Network error:', err.request);
        alert('Network error. Please check your connection and try again.');
      } else {
        console.error('❌ Unexpected error:', err.message);
        alert('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setSelectedBand(null);
    setEditBand({
      name: '',
      description: '',
      genre: '',
      location: '',
      contact_email: '',
      website: ''
    });
    setEditImage(null);
    // Reset member management state
    setMembersToUpdate([]);
    setMembersToRemove([]);
  };

  const handleViewBand = async (bandId) => {
    try {
      // Update to the correct endpoint
      const response = await axiosInstance.get(`/api/bands/${bandId}/`);
      // Here you would typically navigate to a details page or open a modal
      console.log('Band details:', response.data);
    } catch (err) {
      console.error('Error viewing band:', err);
      // Don't show error to user
    }
  };

  const handleLeaveBand = async (bandId) => {
    try {
      // Update to the correct endpoint
      await axiosInstance.delete(`/api/bands/${bandId}/leave/`);
      setSuccess('You have left the band');
      fetchBands(); // Refresh the list after leaving
    } catch (err) {
      console.error('Error leaving band:', err);
      // Don't show error to user
    }
  };

  const handleDeleteBand = async (bandId) => {
    if (window.confirm('Are you sure you want to delete this band? This action cannot be undone.')) {
      try {
        // Update to the correct endpoint
        await axiosInstance.delete(`/api/bands/${bandId}/delete/`);
        setSuccess('Band deleted successfully');
        fetchBands();
      } catch (err) {
        console.error('Error deleting band:', err);
        // Don't show error to user
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (!invitationCode.trim()) return;
    
    try {
      setLoading(true);
      
      // Get the authentication token
      const token = localStorage.getItem('access');
      if (!token) {
        alert('You need to log in again to join a band.');
        window.location.href = '/login';
        return;
      }
      
      // Check if user is a talent user
      const isTalent = localStorage.getItem('is_talent') === 'true';
      
      // Prepare headers
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Add is-talent header if user is a talent
      if (isTalent) {
        headers['is-talent'] = 'true';
      }
      
      // Send the invitation code to join the band
      const response = await axiosInstance.post('/api/bands/join-with-code/',
        { invitation_code: invitationCode },
        { headers: headers }
      );
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Successfully joined the band!');
      } else {
        throw new Error(response.data.error || 'Failed to join band');
      }
      setInvitationCode(''); // Clear the input field
      fetchBands(); // Refresh the bands list
    } catch (err) {
      console.error('Error joining band with invitation code:', err);
      
      // Display specific error message if available
      if (err.response && err.response.data) {
        let errorMessage = '';
        
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (typeof err.response.data === 'object') {
          if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            // Extract all error messages from the object
            const errorMessages = [];
            Object.entries(err.response.data).forEach(([key, value]) => {
              const valueStr = Array.isArray(value) ? value.join(', ') : value;
              errorMessages.push(`${key}: ${valueStr}`);
            });
            errorMessage = errorMessages.join('\n');
          }
        }
        
        if (errorMessage) {
          alert(`Failed to join band: ${errorMessage}`);
        }
      } else {
        alert('Failed to join band. Please check your invitation code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvitationCode = async (bandId) => {
    try {
      setLoading(true);
      setSelectedBandForCode(bandId);
      
      console.log('Generating invitation code for band ID:', bandId);
      
      // Get the authentication token
      const token = localStorage.getItem('access');
      if (!token) {
        alert('You need to log in again to generate an invitation code.');
        window.location.href = '/login';
        return;
      }
      
      // Check if user is a talent user
      const isTalent = localStorage.getItem('is_talent') === 'true';
      
      // Prepare headers
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Add is-talent header if user is a talent
      if (isTalent) {
        headers['is-talent'] = 'true';
      }
      
      console.log('Request headers:', headers);
      console.log('Making request to:', `/api/bands/${bandId}/generate-code/`);
      
      // Generate invitation code using the correct endpoint
      const response = await axiosInstance.post(`/api/bands/${bandId}/generate-code/`, 
        {}, // Empty body
        { headers: headers }
      );
      
      console.log('Generate code response:', response.data);
      
      if (response.data.success && response.data.invitation && response.data.invitation.invitation_code) {
        setGeneratedCode(response.data.invitation.invitation_code);
        console.log('Successfully generated code:', response.data.invitation.invitation_code);
      } else {
        console.error('No invitation_code in response:', response.data);
        alert('Failed to generate invitation code. Response did not contain invitation code.');
      }
    } catch (err) {
      console.error('Error generating invitation code:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      // Display specific error message if available
      if (err.response && err.response.data) {
        let errorMessage = '';
        
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (typeof err.response.data === 'object') {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            // Extract all error messages from the object
            const errorMessages = [];
            Object.entries(err.response.data).forEach(([key, value]) => {
              const valueStr = Array.isArray(value) ? value.join(', ') : value;
              errorMessages.push(`${key}: ${valueStr}`);
            });
            errorMessage = errorMessages.join('\n');
          }
        }
        
        if (errorMessage) {
          alert(`Failed to generate invitation code: ${errorMessage}`);
        } else {
          alert(`Failed to generate invitation code. Status: ${err.response.status}`);
        }
      } else {
        alert('Failed to generate invitation code. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Subscription overlay component
  const SubscriptionOverlay = () => (
    <div className="subscription-overlay">
      <div className="subscription-overlay-content">
        <div className="lock-icon">
          <FaLock />
        </div>
        <h2>Band Subscription Required</h2>
        <p>
          {subscriptionStatus?.message || 'You need a band subscription to access the Groups feature. Upgrade your account to create and manage bands.'}
        </p>
        <div className="subscription-features">
          <h3>What you get with Band Subscription:</h3>
          <ul>
            <li>✓ Create unlimited bands</li>
            <li>✓ Invite members with codes</li>
            <li>✓ Manage band profiles</li>
            <li>✓ Collaborate with other musicians</li>
            <li>✓ Access to band management tools</li>
            <li>✓ Earn band scores and improve visibility</li>
          </ul>
        </div>
        <button 
          className="upgrade-button"
          onClick={() => window.location.href = '/account?tab=billing'}
        >
          <FaCrown /> Upgrade to Band Subscription
        </button>
      </div>
    </div>
  );

  // Band Score Display Component
  const BandScoreDisplay = () => {
    if (!bandScore) return null;
    
    console.log('BandScoreDisplay - bandScore:', bandScore);
    console.log('BandScoreDisplay - bandScore type:', typeof bandScore);
    console.log('BandScoreDisplay - bandScore keys:', Object.keys(bandScore));
    
    // Add defensive programming to handle different bandScore structures
    const overallScore = bandScore.overall_score || bandScore.total || bandScore.score || 0;
    const message = bandScore.message || bandScore.details || '';
    const improvementTips = bandScore.how_to_improve || bandScore.improvement_tips || [];
    
    return (
      <div className="band-score-section">
        <h2>Band Score</h2>
        <div className="score-card">
          <div className="score-main">
            <span className="score-number">{overallScore}</span>
            <span className="score-label">Overall Score</span>
          </div>
          <div className="score-details">
            <p className="score-message">{message}</p>
            {improvementTips && improvementTips.length > 0 && (
              <div className="improvement-tips">
                <h4>How to improve your score:</h4>
                <ul>
                  {improvementTips.map((tip, index) => (
                    <li key={index}>{typeof tip === 'string' ? tip : JSON.stringify(tip)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (subscriptionLoading) {
    return (
      <div className="content-section">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Show subscription overlay if user doesn't have band subscription
  if (!hasBandSubscription) {
    console.log('🔒 Groups tab locked - Debug info:');
    console.log('- hasBandSubscription:', hasBandSubscription);
    console.log('- subscriptionStatus:', subscriptionStatus);
    console.log('- userData:', userData);
    console.log('- localStorage is_talent:', localStorage.getItem('is_talent'));
    console.log('- localStorage access token exists:', !!localStorage.getItem('access'));
    
    return (
      <div className="content-section">
        <SubscriptionOverlay />
      </div>
    );
  }

  return (
    <div className="content-section">
      <h1 className="section-title">Bands</h1>
      
      {authError && (
        <div className="error-message" style={{
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          borderLeft: '4px solid #d63031',
          fontWeight: '500',
          animation: 'slideInDown 0.5s ease-out'
        }}>
          <strong>Authentication Error:</strong> {authError}
          <button 
            onClick={() => {
              setAuthError(null);
              validateAuthentication();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              marginLeft: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      <div className="groups-section">
        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: 'rgba(130, 54, 252, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.8rem',
            fontFamily: 'monospace'
          }}>
            <strong>🔍 Debug Info:</strong><br/>
            Current User: {currentUser?.username || 'Not loaded'}<br/>
            User ID: {currentUser?.id || 'Not loaded'}<br/>
            Auth Error: {authError || 'None'}<br/>
            Bands Count: {bands?.length || 0}<br/>
            Joined Bands Count: {joinedBands?.length || 0}
          </div>
        )}
        
        <div className="groups-header">
          <h2>My Bands</h2>
          {subscriptionStatus?.can_create_band && (
            <button 
              className="create-group-btn" 
              onClick={handleCreateBand}
              disabled={loading}
            >
              <FaPlus /> Create New Band
            </button>
          )}
        </div>
        
        {/* Subscription Status Info */}
        {subscriptionStatus && (
          <div className="subscription-status-info">
            <div className="status-card">
              <div className="status-header">
                <h3>Subscription Status</h3>
                <div className="status-controls">
                <span className={`status-badge ${subscriptionStatus.has_bands_subscription ? 'active' : 'inactive'}`}>
                  {subscriptionStatus.has_bands_subscription ? 'Active' : 'Inactive'}
                </span>
                </div>
              </div>
              <p className="status-message">{String(subscriptionStatus.message || '')}</p>
              {subscriptionStatus.subscription && (
                <div className="subscription-details">
                  <p><strong>Plan:</strong> {String(subscriptionStatus.subscription.plan_name || '')}</p>
                  <p><strong>Status:</strong> {String(subscriptionStatus.subscription.status || '')}</p>
                  <p><strong>Expires:</strong> {subscriptionStatus.subscription.current_period_end ? new Date(subscriptionStatus.subscription.current_period_end).toLocaleDateString() : 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="groups-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your bands...</p>
            </div>
          ) : bands && bands.length > 0 ? (
            bands.map(band => (
              <div key={band.id} className="band-card">
                <div className="band-image">
                  {band.profile_picture ? (
                    <img 
                      src={band.profile_picture} 
                      alt={band.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="band-image-placeholder">
                      {band.name ? band.name.charAt(0).toUpperCase() : 'B'}
                    </div>
                  )}
                </div>
                <div className="band-info">
                  <h3>{String(band.name || '')}</h3>
                  <p>{String(band.description || '')}</p>
                  {band.band_type && <p className="band-genre">{String(band.band_type)}</p>}
                  {band.location && <p className="band-location">{String(band.location)}</p>}
                  <p className="band-members">Members: {Number(band.members_count) || 0}</p>
                  <p className="band-score">Score: {Number(band.profile_score) || 0}</p>
                </div>
                <div className="band-actions">
                  <button 
                    className="manage-band-btn" 
                    onClick={() => handleManageBand(band)}
                  >
                    <FaEdit /> Manage
                  </button>
                  <button className="delete-group-btn" onClick={() => handleDeleteBand(band.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
                

              </div>
            ))
          ) : (
            <div className="empty-state">
              <FaUsers className="empty-icon" />
              <p>You haven't created any bands yet</p>
            </div>
          )}
        </div>
        
        {/* Removed "Bands I've Joined" section */}
        
        <div className="media-section">
          <h2>Band Media</h2>
          <div className="media-grid">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading media...</p>
              </div>
            ) : bands && bands.length > 0 && bands[0].media && bands[0].media.length > 0 ? (
              bands[0].media.map((mediaItem, index) => (
                <div className="media-card" key={index}>
                  <div className="media-preview">
                    {mediaItem.file_type === 'image' ? (
                      <img 
                        src={mediaItem.file_url} 
                        alt={mediaItem.name || 'Band media'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : mediaItem.file_type === 'video' ? (
                      <video controls>
                        <source src={mediaItem.file_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : mediaItem.file_type === 'audio' ? (
                      <audio controls>
                        <source src={mediaItem.file_url} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                      </audio>
                    ) : (
                      <div className="file-icon">
                        <FaUsers />
                      </div>
                    )}
                  </div>
                  <div className="media-info">
                    <h3>{String(mediaItem.name || 'Untitled')}</h3>
                    <p>{String(mediaItem.description || 'No description available')}</p>
                    <p className="media-type">{String(mediaItem.file_type || 'Unknown type')}</p>
                  </div>
                  <div className="media-actions">
                    <a href={mediaItem.file_url} target="_blank" rel="noopener noreferrer" className="view-media-btn">
                      View
                    </a>
                    <button className="delete-media-btn">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaUsers className="empty-icon" />
                <p>No media available for your bands</p>
                <button className="upload-media-btn">
                  Upload Media
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Band Modal */}
      <CreateBandModal
        showCreateModal={showCreateModal}
        handleCloseModal={handleCloseModal}
        newBand={newBand}
        handleInputChange={handleInputChange}
        handleImageUpload={handleImageUpload}
        uploadedImage={uploadedImage}
        loading={loading}
        handleSubmitBand={handleSubmitBand}
        setUploadedImage={setUploadedImage}
      />

      {/* Add ManageBandModal component here */}
      <ManageBandModal
        showManageModal={showManageModal}
        handleCloseManageModal={handleCloseManageModal}
        selectedBand={selectedBand}
        editBand={editBand}
        handleEditInputChange={handleEditInputChange}
        handleEditImageUpload={handleEditImageUpload}
        editImage={editImage}
        loading={loading}
        handleUpdateBand={handleUpdateBand}
        setEditImage={setEditImage}
        handleMemberRoleChange={handleMemberRoleChange}
        handleRemoveMember={handleRemoveMember}
        handleRemoveMembers={handleRemoveMembers}
        membersToRemove={membersToRemove}
        isCreator={selectedBand ? isBandCreator(selectedBand) : false}
        currentUser={currentUser}
      />

      {/* Invitation code input section */}
      {(!bands || bands.length === 0) && (!joinedBands || joinedBands.length === 0) && (
        <div className="invitation-section">
          <h2>Join a Band with Invitation Code</h2>
          <div className="invitation-form">
            <input 
              type="text" 
              placeholder="Enter invitation code" 
              value={invitationCode} 
              onChange={(e) => setInvitationCode(e.target.value)}
              className="invitation-input"
            />
            <button 
              className="join-band-btn" 
              onClick={handleJoinWithCode}
              disabled={loading || !invitationCode.trim()}
            >
              Join Band
            </button>
          </div>
        </div>
      )}
      
      {/* Code Generator Card - For Band Subscription Users */}
      {hasBandSubscription && (
        <div className="code-generator-card" style={{marginTop: '40px', marginBottom: '40px'}}>
          <div className="card-header">
            <h2>🎯 Invitation Code Generator</h2>
            <p>Generate invitation codes to invite others to join your bands</p>
          </div>
          
          <div className="card-content">
            {(() => { console.log('Code generator - bands check:', bands, 'length:', bands?.length); return null; })()}
            {bands && bands.length > 0 ? (
              <>
                <div className="band-selector">
                  <label htmlFor="band-select">Select Band:</label>
                  <select 
                    id="band-select"
                    value={selectedBandForCode || ''} 
                    onChange={(e) => setSelectedBandForCode(e.target.value)}
                    className="band-select"
                  >
                    <option value="">Choose a band to generate code for</option>
                    {bands.map(band => (
                      <option key={band.id} value={band.id}>{band.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="generate-section">
                  <button 
                    className="generate-code-btn" 
                    onClick={() => handleGenerateInvitationCode(selectedBandForCode)}
                    disabled={loading || !selectedBandForCode}
                  >
                    <FaKey /> Generate Invitation Code
                  </button>
                </div>
                
                {/* Show generated code */}
                {generatedCode && selectedBandForCode && (
                  <div className="generated-code-container">
                    <div className="code-header">
                      <h4>✅ Invitation Code Generated Successfully!</h4>
                      <p>Share this code with others to invite them to your band</p>
                    </div>
                    <div className="code-display">
                      <span className="code">{generatedCode}</span>
                      <button 
                        className="copy-code-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCode);
                          alert('Code copied to clipboard!');
                        }}
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="code-info">
                      <p className="code-instructions">
                        <strong>Instructions:</strong> Share this code with others. They can use it to join your band instantly.
                      </p>
                      <p className="code-expiry">
                        <strong>⏰ Expires:</strong> This code will expire after 24 hours for security.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-bands-message">
                <div className="no-bands-icon">🎸</div>
                <h3>No Bands Created Yet</h3>
                <p>You need to create a band first before you can generate invitation codes.</p>
                <button 
                  className="create-band-btn"
                  onClick={handleCreateBand}
                  disabled={loading}
                >
                  <FaPlus /> Create Your First Band
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug info - temporarily disabled to fix React error */}
      {/* <div style={{padding: '10px', background: '#f0f0f0', margin: '10px 0', fontSize: '12px'}}>
        Debug: Bands count: {bands ? bands.length : 0} | 
        Has subscription: {hasBandSubscription ? 'Yes' : 'No'} | 
        Selected band: {selectedBandForCode || 'None'} |
        Loading: {loading ? 'Yes' : 'No'} |
        Subscription loading: {subscriptionLoading ? 'Yes' : 'No'}
        {bands && bands.length > 0 && (
          <div>Bands: {bands.map(b => b.name).join(', ')}</div>
        )}
      </div> */}

      {/* Band Score Display Component */}
      <BandScoreDisplay />
    </div>
  );
};

export default GroupsTab;
