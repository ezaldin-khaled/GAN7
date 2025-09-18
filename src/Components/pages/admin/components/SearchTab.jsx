import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaFilter, FaSort, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import UserSummaryPopup from './UserSummaryPopup';
import './SearchTab.css';

const PROFILE_TYPES = {
  talent: {
    label: 'Talent Profiles',
    filters: {
      basicInfo: {
        title: "Basic Information",
        fields: {
          gender: {
            type: "select",
            options: ["Male", "Female", "Other", "Prefer not to say"]
          },
          city: { type: "text", placeholder: "Enter city" },
          country: { type: "text", placeholder: "Enter country" },
          account_type: {
            type: "select", 
            options: ["free", "silver", "gold", "platinum"]
          },
          is_verified: { type: "boolean", label: "Verified Only" },
          age: { type: "number", placeholder: "Age" }
        }
      }
    }
  },
  visual: {
    label: 'Visual Workers',
    filters: {
      professional: {
        title: "Professional Details",
        fields: {
          primary_category: {
            type: "select",
            options: [
              "photographer", "cinematographer", "director", "editor",
              "animator", "graphic_designer", "makeup_artist", 
              "costume_designer", "set_designer", "lighting_designer",
              "visual_artist", "composer", "sound_designer", "other"
            ]
          },
          experience_level: {
            type: "select",
            options: ["beginner", "intermediate", "professional", "expert"]
          },
          min_years_experience: { type: "number", placeholder: "Min years" },
          max_years_experience: { type: "number", placeholder: "Max years" },
          availability: {
            type: "select",
            options: ["full_time", "part_time", "weekends", "flexible"]
          },
          rate_range: {
            type: "select",
            options: ["low", "mid", "high", "negotiable"]
          },
          willing_to_relocate: { type: "boolean", label: "Willing to Relocate" }
        }
      }
    }
  },
  expressive: {
    label: 'Expressive Workers',
    filters: {
      professional: {
        title: "Professional",
        fields: {
          performer_type: {
            type: "select",
            options: [
              "actor",
              "actress",
              "dancer",
              "singer",
              "musician",
              "comedian",
              "magician",
              "circus_performer",
              "stunt_performer",
              "voice_actor",
              "puppeteer",
              "mime_artist",
              "stand_up_comedian",
              "improv_artist",
              "theater_actor",
              "opera_singer",
              "ballet_dancer",
              "contemporary_dancer",
              "street_performer",
              "variety_artist",
              "burlesque_performer",
              "cabaret_performer",
              "drag_performer",
              "performance_artist",
              "physical_theater_artist",
              "clown",
              "acrobat",
              "contortionist",
              "fire_performer",
              "aerial_artist",
              "pole_dancer",
              "belly_dancer",
              "tap_dancer",
              "jazz_dancer",
              "hip_hop_dancer",
              "breakdancer",
              "classical_singer",
              "jazz_singer",
              "rock_singer",
              "pop_singer",
              "folk_singer",
              "classical_musician",
              "jazz_musician",
              "rock_musician",
              "pop_musician",
              "folk_musician",
              "orchestra_musician",
              "choir_singer",
              "gospel_singer",
              "blues_singer",
              "country_singer",
              "rap_artist",
              "beatboxer",
              "spoken_word_artist",
              "poetry_performer",
              "storyteller",
              "narrator",
              "host",
              "emcee",
              "other"
            ]
          },
          min_years_experience: { type: "number", placeholder: "Min years" },
          max_years_experience: { type: "number", placeholder: "Max years" },
          availability: {
            type: "select",
            options: ["full_time", "part_time", "evenings", "weekends"]
          }
        }
      },
      physical: {
        title: "Physical Attributes",
        fields: {
          min_height: { type: "number", placeholder: "Min height (cm)" },
          max_height: { type: "number", placeholder: "Max height (cm)" },
          min_weight: { type: "number", placeholder: "Min weight (kg)" },
          max_weight: { type: "number", placeholder: "Max weight (kg)" },
          body_type: {
            type: "select",
            options: ["athletic", "slim", "muscular", "average", "plus_size", "other"]
          },
          hair_color: {
            type: "select",
            options: ["blonde", "brown", "black", "red", "gray", "other"]
          },
          eye_color: {
            type: "select",
            options: ["blue", "green", "brown", "hazel", "black", "other"]
          },
          skin_tone: {
            type: "select",
            options: ["fair", "light", "medium", "olive", "brown", "dark"]
          }
        }
      }
    }
  },
  hybrid: {
    label: 'Hybrid Workers',
    filters: {
      professional: {
        title: "Professional",
        fields: {
          hybrid_type: {
            type: "select",
            options: [
              "model", "stunt_performer", "body_double", "motion_capture",
              "background_actor", "specialty_performer", "other"
            ]
          },
          min_years_experience: { type: "number", placeholder: "Min years" },
          max_years_experience: { type: "number", placeholder: "Max years" },
          fitness_level: {
            type: "select",
            options: ["beginner", "intermediate", "advanced", "elite"]
          },
          risk_levels: {
            type: "select",
            options: ["low", "moderate", "high", "extreme"]
          },
          willing_to_relocate: { type: "boolean", label: "Willing to Relocate" }
        }
      },
      physical: {
        title: "Physical Attributes",
        fields: {
          min_height: { type: "number", placeholder: "Min height (cm)" },
          max_height: { type: "number", placeholder: "Max height (cm)" },
          min_weight: { type: "number", placeholder: "Min weight (kg)" },
          max_weight: { type: "number", placeholder: "Max weight (kg)" },
          body_type: {
            type: "select",
            options: ["athletic", "slim", "muscular", "average", "plus_size", "other"]
          }
        }
      }
    }
  },
  background: {
    label: 'Production Assets Pro',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          gender: {
            type: "select",
            options: ["Male", "Female", "Other"]
          },
          country: { type: "text", placeholder: "Enter country" },
          account_type: {
            type: "select",
            options: ["free", "silver", "gold", "platinum"]
          },
          min_age: { type: "number", placeholder: "Min age" },
          max_age: { type: "number", placeholder: "Max age" }
        }
      },
      assets: {
        title: "Asset Ownership",
        fields: {
          has_props: { type: "boolean", label: "Has Props" },
          has_costumes: { type: "boolean", label: "Has Costumes" },
          has_locations: { type: "boolean", label: "Has Locations" },
          has_memorabilia: { type: "boolean", label: "Has Memorabilia" },
          has_vehicles: { type: "boolean", label: "Has Vehicles" },
          has_artistic_materials: { type: "boolean", label: "Has Artistic Materials" },
          has_music_items: { type: "boolean", label: "Has Music Items" },
          has_rare_items: { type: "boolean", label: "Has Rare Items" }
        }
      }
    }
  },
  bands: {
    label: 'Music Bands',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Band name" },
          band_type: { type: "text", placeholder: "Type of band" },
          location: { type: "text", placeholder: "Location" },
          min_members: { type: "number", placeholder: "Min members" },
          max_members: { type: "number", placeholder: "Max members" }
        }
      }
    }
  },
  props: {
    label: 'Props',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Prop name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          material: { type: "text", placeholder: "Material" },
          used_in_movie: { type: "text", placeholder: "Used in movie" },
          condition: { type: "text", placeholder: "Condition" }
        }
      }
    }
  },
  costumes: {
    label: 'Costumes',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Costume name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          size: { type: "text", placeholder: "Size" },
          worn_by: { type: "text", placeholder: "Worn by" },
          era: { type: "text", placeholder: "Era" }
        }
      }
    }
  },
  locations: {
    label: 'Filming Locations',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Location name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          address: { type: "text", placeholder: "Address" },
          min_capacity: { type: "number", placeholder: "Min capacity" },
          is_indoor: { type: "boolean", label: "Indoor Location" }
        }
      }
    }
  },
  memorabilia: {
    label: 'Movie Memorabilia',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Item name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          signed_by: { type: "text", placeholder: "Signed by" }
        }
      }
    }
  },
  vehicles: {
    label: 'Vehicles',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Vehicle name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          make: { type: "text", placeholder: "Make" },
          model: { type: "text", placeholder: "Model" },
          min_year: { type: "number", placeholder: "Min year" },
          max_year: { type: "number", placeholder: "Max year" }
        }
      }
    }
  },
  artistic_materials: {
    label: 'Artistic Materials',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Material name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          type: { type: "text", placeholder: "Type" },
          condition: { type: "text", placeholder: "Condition" }
        }
      }
    }
  },
  music_items: {
    label: 'Musical Instruments',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Instrument name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          instrument_type: { type: "text", placeholder: "Instrument type" },
          used_by: { type: "text", placeholder: "Used by" }
        }
      }
    }
  },
  rare_items: {
    label: 'Rare Collectibles',
    filters: {
      basic: {
        title: "Basic Information",
        fields: {
          name: { type: "text", placeholder: "Item name" },
          description: { type: "text", placeholder: "Description" },
          min_price: { type: "number", placeholder: "Min price" },
          max_price: { type: "number", placeholder: "Max price" },
          is_for_rent: { type: "boolean", label: "Available for Rent" },
          is_for_sale: { type: "boolean", label: "Available for Sale" },
          provenance: { type: "text", placeholder: "Provenance" },
          is_one_of_a_kind: { type: "boolean", label: "One of a Kind" }
        }
      }
    }
  }
};

const SearchTab = ({ onSearchResults, onViewProfile, searchPage = 1, onPageChange }) => {
  // Search state
  const [searchParams, setSearchParams] = useState({
    profile_type: 'talent',
    page: searchPage,
    page_size: 10,
    query: '',
    sort_by: 'relevance',
    sort_order: 'desc',
    include_media: false
  });

  // Results state
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]); // Store all results for client-side pagination
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [filters, setFilters] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  // Add new state for active filters display
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Use ref to track previous page to avoid dependency issues
  const prevPageRef = useRef(searchPage);

  // Sync search page with parent component and trigger search when page changes
  useEffect(() => {
    const prevPage = prevPageRef.current;
    setSearchParams(prev => ({
      ...prev,
      page: searchPage
    }));
    
    // If we have stored results (client-side pagination), slice them
    if (allResults.length > 0 && searchPage !== prevPage) {
      const startIndex = (searchPage - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedResults = allResults.slice(startIndex, endIndex);
      
      console.log(`Client-side pagination - Page ${searchPage}: Showing results ${startIndex + 1} to ${endIndex} of ${allResults.length}`);
      console.log('Paginated results:', paginatedResults);
      
      setResults(paginatedResults);
      onSearchResults(paginatedResults, allResults.length, false, null);
    }
    // If we have results but no stored results (server-side pagination), perform a new search
    else if (results.length > 0 && allResults.length === 0 && searchPage !== prevPage) {
      performSearch();
    }
    
    // Update the ref
    prevPageRef.current = searchPage;
  }, [searchPage]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      
      // Update active filters
      const newActiveFilters = Object.entries(newFilters)
        .filter(([_, val]) => val !== null && val !== undefined && val !== '')
        .map(([key, value]) => ({
          key,
          value,
          label: PROFILE_TYPES[searchParams.profile_type]?.filters?.basicInfo?.fields[key]?.label || key
        }));
      
      setActiveFilters(newActiveFilters);
      return newFilters;
    });
  };

  // Add function to remove individual filter
  const removeFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Add function to clear all filters
  const clearAllFilters = () => {
    setFilters({});
    setActiveFilters([]);
  };

  // Utility function to extract shareable media from search results
  const extractShareableMedia = (results) => {
    return results.flatMap(result => 
      result.media_items?.filter(media => 
        !media.is_test_video && !media.is_about_yourself_video
      ) || []
    );
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setAllResults([]); // Clear stored results for new search

      console.log('=== PERFORMING SEARCH ===');
      console.log('Search params:', searchParams);
      console.log('Filters:', filters);

      // Try the search endpoint first
      try {
        const params = new URLSearchParams();

        // Add common parameters
        params.append('profile_type', searchParams.profile_type);
        params.append('page', searchParams.page);
        params.append('page_size', searchParams.page_size);
        if (searchParams.query) {
          params.append('query', searchParams.query);
        }
        if (searchParams.sort_by) {
          params.append('sort_by', searchParams.sort_by);
        }
        if (searchParams.sort_order) {
          params.append('sort_order', searchParams.sort_order);
        }
        if (searchParams.include_media) {
          params.append('include_media', 'true');
        }

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else if (typeof value === 'boolean') {
              params.append(key, value.toString());
            } else if (typeof value === 'number') {
              params.append(key, Math.round(value));
            } else {
              params.append(key, value);
            }
          }
        });

        console.log('Search URL:', `/api/dashboard/search/?${params.toString()}`);

        const response = await axiosInstance.get(`/api/dashboard/search/?${params.toString()}`);

        console.log('=== FULL API RESPONSE DEBUG ===');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response data:', response.data);
        console.log('Response data type:', typeof response.data);
        console.log('Response data keys:', Object.keys(response.data || {}));
        
        if (response.data && response.data.results) {
          console.log('Results array length:', response.data.results.length);
          if (response.data.results.length > 0) {
            console.log('First result:', response.data.results[0]);
            console.log('First result keys:', Object.keys(response.data.results[0]));
          }
        }

        if (response.data.success) {
          setResults(response.data.results);
          setTotalResults(response.data.count);
          
          // Process media if include_media was enabled
          if (searchParams.include_media) {
            const shareableMedia = extractShareableMedia(response.data.results);
            console.log(`Found ${shareableMedia.length} shareable media items`);
            console.log('Shareable media:', shareableMedia);
          }
          
          // Pass results to parent component
          onSearchResults(response.data.results, response.data.count, false, null);
          return; // Success, exit early
        } else {
          throw new Error('Search failed: ' + (response.data.error || 'Unknown error'));
        }
      } catch (searchErr) {
        console.log('Search endpoint failed, falling back to users endpoint:', searchErr.message);
        
        // Fallback to users endpoint
        const response = await axiosInstance.get('/api/dashboard/users/');
        console.log('Users endpoint response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // Transform users data to match search results format
          const allTransformedResults = response.data.map((user, index) => ({
            id: user.id,
            name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username || user.email,
            title: user.username || user.email,
            username: user.username,
            email: user.email,
            profile_type: user.profile_type || 'talent',
            description: user.bio || user.description || 'No description available',
            bio: user.bio,
            relevance_score: Math.floor(Math.random() * 100) + 1, // Mock relevance score
            profile_score: user.profile_score || Math.floor(Math.random() * 5) + 1,
            city: user.city,
            country: user.country,
            is_verified: user.is_verified,
            account_type: user.account_type,
            created_at: user.created_at,
            profile_url: user.profile_url || `/api/profile/${user.profile_type}/${user.id}/`,
            media_items: user.media_items || []
          }));
          
          console.log('All transformed results:', allTransformedResults);
          
          // Store all results for client-side pagination
          setAllResults(allTransformedResults);
          setTotalResults(allTransformedResults.length);
          
          // Implement client-side pagination
          const startIndex = (searchParams.page - 1) * 10;
          const endIndex = startIndex + 10;
          const paginatedResults = allTransformedResults.slice(startIndex, endIndex);
          
          console.log(`Page ${searchParams.page}: Showing results ${startIndex + 1} to ${endIndex} of ${allTransformedResults.length}`);
          console.log('Paginated results:', paginatedResults);
          
          setResults(paginatedResults);
          
          // Pass results to parent component
          onSearchResults(paginatedResults, allTransformedResults.length, false, null);
        } else {
          throw new Error('Failed to fetch users data');
        }
      }
    } catch (err) {
      console.error('=== SEARCH ERROR DEBUG ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error config:', err.config);
      
      let errorMsg;
      if (err.response?.status === 404) {
        errorMsg = 'Search endpoint not found. Using fallback data.';
      } else if (err.response?.status === 403) {
        errorMsg = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMsg = 'Network error. Please check your connection.';
      } else {
        errorMsg = err.response?.data?.error || err.message || 'Failed to perform search';
      }
      setError(errorMsg);
      setResults([]);
      setTotalResults(0);
      onSearchResults([], 0, false, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (e, user) => {
    e.preventDefault();
    onViewProfile(user);
  };

  const renderFilterField = (key, config) => {
    switch (config.type) {
      case 'select':
        return (
          <div className="filter-group">
            <label htmlFor={key}>{config.label || key}</label>
            <select
              id={key}
              value={filters[key] || ''}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              aria-label={config.label || key}
            >
              <option value="">Any</option>
              {config.options.map(option => (
                <option key={option} value={option}>
                  {option.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        );

      case 'boolean':
        return (
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters[key] || false}
                onChange={(e) => handleFilterChange(key, e.target.checked)}
                aria-label={config.label || key}
              />
              <span>{config.label || key}</span>
            </label>
          </div>
        );

      case 'number':
        return (
          <div className="filter-group">
            <label htmlFor={key}>{config.label || key}</label>
            <input
              id={key}
              type="number"
              value={filters[key] || ''}
              onChange={(e) => handleFilterChange(key, parseFloat(e.target.value))}
              placeholder={config.placeholder}
              aria-label={config.label || key}
            />
          </div>
        );

      case 'text':
        return (
          <div className="filter-group">
            <label htmlFor={key}>{config.label || key}</label>
            <input
              id={key}
              type="text"
              value={filters[key] || ''}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              placeholder={config.placeholder}
              aria-label={config.label || key}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderFilterSection = (sectionId, section) => {
    const isExpanded = expandedSections[sectionId];
    
    return (
      <div key={sectionId} className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection(sectionId)}
          aria-expanded={isExpanded}
          aria-controls={`${sectionId}-content`}
        >
          <h3>{section.title}</h3>
          <span className="expand-icon" aria-hidden="true">
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>
        {isExpanded && (
          <div 
            id={`${sectionId}-content`}
            className="filter-section-content"
            role="region"
            aria-label={section.title}
          >
            {Object.entries(section.fields).map(([key, config]) => (
              <div key={key}>
                {renderFilterField(key, config)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="search-tab" role="main">
      <div className="search-header">
        {/* <div className="search-instructions">
          <p>Select a profile type and search for users. For production assets users, select "Production Assets Pro" from the dropdown.</p>
        </div> */}
        <div className="search-type-selector">
          <label htmlFor="profile-type" className="visually-hidden">Select Profile Type</label>
          <select
            id="profile-type"
            value={searchParams.profile_type}
            onChange={(e) => {
              setSearchParams(prev => ({
                ...prev,
                profile_type: e.target.value,
                page: 1
              }));
              setFilters({});
              setActiveFilters([]);
              // Auto-search when switching to Production Assets Pro
              if (e.target.value === 'background') {
                setTimeout(() => performSearch(), 100);
              }
            }}
            aria-label="Select Profile Type"
          >
            {Object.entries(PROFILE_TYPES).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        <div className="search-input-container">
          {/* <label htmlFor="search-input" className="visually-hidden">Search</label> */}
          
          {/* <input
            id="search-input"
            type="text"
            value={searchParams.query}
            onChange={(e) => setSearchParams(prev => ({
              ...prev,
              query: e.target.value
            }))}
            onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            placeholder="Search for users..."
            aria-label="Search for users"
          /> */}

          <div className="search-options">
            <label className="include-media-checkbox">
              <input
                type="checkbox"
                checked={searchParams.include_media}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  include_media: e.target.checked
                }))}
                aria-label="Include media in search results"
              />
              <span>Include Media</span>
            </label>
          </div>

          <button
            className="search-button"
            onClick={performSearch}
            disabled={loading}
            aria-label="Perform Search"
          >
            {loading ? 'Searching...' : <FaSearch aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="filters-panel" role="complementary">
        <div className="filters-header">
          <h2>Filters</h2>
          {activeFilters.length > 0 && (
            <button
              className="clear-filters"
              onClick={clearAllFilters}
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          )}
        </div>
        
        {activeFilters.length > 0 && (
          <div className="active-filters" role="list">
            {activeFilters.map(({ key, value, label }) => (
              <div key={key} className="filter-chip" role="listitem">
                <span>{label}: {value}</span>
                <button
                  onClick={() => removeFilter(key)}
                  aria-label={`Remove ${label} filter`}
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {Object.entries(PROFILE_TYPES[searchParams.profile_type]?.filters || {}).map(([sectionId, section]) => (
          renderFilterSection(sectionId, section)
        ))}
      </div>

      {error && (
        <div className="search-error" role="alert">
          {error}
        </div>
      )}

      {/* Pagination Controls */}
      {results.length > 0 && totalResults > 10 && (
        <div className="search-pagination" role="navigation" aria-label="Search results pagination">
          <div className="pagination-info">
            <span>
              Showing {((searchParams.page - 1) * 10) + 1} to{' '}
              {Math.min(searchParams.page * 10, totalResults)} of{' '}
              {totalResults.toLocaleString()} results
            </span>
          </div>
          
          <div className="pagination-controls">
            <button
              onClick={() => onPageChange && onPageChange(searchParams.page - 1)}
              disabled={searchParams.page <= 1}
              className="pagination-btn prev"
              aria-label="Previous page"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {(() => {
                const totalPages = Math.ceil(totalResults / 10);
                const currentPage = searchParams.page;
                const pages = [];
                
                // Show first page
                if (currentPage > 3) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => onPageChange && onPageChange(1)}
                      className="page-number"
                    >
                      1
                    </button>
                  );
                  if (currentPage > 4) {
                    pages.push(<span key="ellipsis1" className="ellipsis">...</span>);
                  }
                }
                
                // Show pages around current page
                for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => onPageChange && onPageChange(i)}
                      className={`page-number ${i === currentPage ? 'active' : ''}`}
                      aria-current={i === currentPage ? 'page' : undefined}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Show last page
                if (currentPage < totalPages - 2) {
                  if (currentPage < totalPages - 3) {
                    pages.push(<span key="ellipsis2" className="ellipsis">...</span>);
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => onPageChange && onPageChange(totalPages)}
                      className="page-number"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>
            
            <button
              onClick={() => onPageChange && onPageChange(searchParams.page + 1)}
              disabled={searchParams.page >= Math.ceil(totalResults / 10)}
              className="pagination-btn next"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTab; 