import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaSort, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';
import UserSummaryPopup from './UserSummaryPopup';
import './SearchTab.css';

const API_URL = 'https://api.gan7club.com:8000/';

// Profile type definitions
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

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 403 and we haven't tried to refresh the token yet
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}api/token/refresh/`, {
            refresh: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });

          if (response.data.access) {
            localStorage.setItem('access', response.data.access);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

const SearchTab = ({ onSearchResults, onViewProfile }) => {
  // Search state
  const [searchParams, setSearchParams] = useState({
    profile_type: 'talent',
    page: 1,
    page_size: 20,
    query: '',
    sort_by: 'relevance',
    sort_order: 'desc',
    include_media: false
  });

  // Results state
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [filters, setFilters] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  // Add new state for active filters display
  const [activeFilters, setActiveFilters] = useState([]);

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

      console.log('=== PERFORMING SEARCH ===');
      console.log('Search params:', searchParams);
      console.log('Filters:', filters);

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

      console.log('Search response:', response.data);

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
      } else {
        const errorMsg = 'Search failed: ' + (response.data.error || 'Unknown error');
        setError(errorMsg);
        onSearchResults([], 0, false, errorMsg);
      }
    } catch (err) {
      console.error('Search error:', err);
      let errorMsg;
      if (err.response?.status === 403) {
        errorMsg = 'Authentication required. Please log in again.';
      } else {
        errorMsg = err.response?.data?.error || 'Failed to perform search';
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
    </div>
  );
};

export default SearchTab; 