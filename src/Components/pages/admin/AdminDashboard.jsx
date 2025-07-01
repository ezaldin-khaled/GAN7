import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import UsersTab from './components/UsersTab';
import ItemsTab from './components/ItemsTab';
import SearchTab from './components/SearchTab';
import RestrictedUsersTab from './components/RestrictedUsersTab';
import SharedMediaTab from './components/SharedMediaTab';
import UserSummaryPopup from './components/UserSummaryPopup';
import Loader from '../../common/Loader';
import EmailTab from './components/EmailTab';
import './AdminDashboard.css';

const TABS = [
  { id: 'visual', label: 'Visual Workers', count: 5 },
  { id: 'expressive', label: 'Expressive Workers', count: 5 },
  { id: 'hybrid', label: 'Hybrid Workers', count: 5 },
  { id: 'shared-media', label: 'Shared Media', count: 0 },
  { id: 'email', label: 'Email', count: 0 },
];

const API_BASE_URL = 'http://192.168.0.103:8000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visual');
  const [activeExpressiveTab, setActiveExpressiveTab] = useState('items');
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalItems: 432,
    activeUsers: 89,
    pendingApprovals: 12
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [popupUser, setPopupUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Add debugging for selectedUser changes
  useEffect(() => {
    console.log('=== SELECTED USER STATE CHANGED ===');
    console.log('selectedUser:', selectedUser);
    console.log('selectedUser type:', typeof selectedUser);
    if (selectedUser) {
      console.log('selectedUser.id:', selectedUser.id);
      console.log('selectedUser.profile_url:', selectedUser.profile_url);
    }
  }, [selectedUser]);

  const checkAuth = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      // Verify token with backend
      const response = await fetch(`${API_BASE_URL}/token/verify/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.is_dashboard === true) {
          setIsAuthenticated(true);
        } else {
          redirectToLogin();
        }
      } else {
        // If token is invalid, try to refresh
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('access', refreshData.access);
            setIsAuthenticated(true);
          } else {
            redirectToLogin();
          }
        } else {
          redirectToLogin();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      redirectToLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToLogin = () => {
    // Clear all admin-related data
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/admin/login');
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access');
      if (token) {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/token/blacklist/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: localStorage.getItem('refresh') }),
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      redirectToLogin();
    }
  };

  const handleSearchResults = (results, total, loading, error) => {
    console.log('=== SEARCH RESULTS RECEIVED ===');
    console.log('Results:', results);
    console.log('Total:', total);
    console.log('Loading:', loading);
    console.log('Error:', error);
    
    if (results && results.length > 0) {
      console.log('First result structure:', results[0]);
      console.log('Available keys in first result:', Object.keys(results[0]));
    }
    
    setSearchResults(results);
    setTotalResults(total);
    setSearchLoading(loading);
    setSearchError(error);
  };

  const handleViewProfile = (user) => {
    console.log('=== ADMIN DASHBOARD HANDLE VIEW PROFILE ===');
    console.log('User data received:', user);
    console.log('User profile_url:', user.profile_url);
    console.log('User id:', user.id);
    console.log('User name:', user.name || user.title);
    
    // Ensure we have a valid user object
    if (!user || !user.id) {
      console.error('Invalid user data received:', user);
      return;
    }
    
    // Set the selected user for SharedMediaTab
    setSelectedUser(user);
    console.log('selectedUser state set to:', user);
    
    // Set the popup user for UserSummaryPopup
    setPopupUser(user);
    setShowUserPopup(true);
    console.log('Popup user set to:', user);
    
    // Automatically switch to Shared Media tab for Production Assets Pro users
    if (user.profile_type === 'background' || user.profile_type === 'background_job') {
      console.log('Production Assets Pro user detected, switching to Shared Media tab');
      setActiveTab('shared-media');
    }
  };

  const handleSendEmail = (user) => {
    console.log('Setting user for email:', user);
    setSelectedUser(user);
    setActiveTab('email');
  };

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <div className="loading-spinner" role="status" aria-label="Loading results">
          <div className="spinner"></div>
          <span>Loading results...</span>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="error-message" role="alert">
          {searchError}
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      );
    }

    return (
      <>
        <div className="results-header">
          <div className="results-count">
            Found {totalResults} results
          </div>
          <div className="pagination" role="navigation" aria-label="Pagination">
            <button
              onClick={() => setSearchPage(prev => prev - 1)}
              disabled={searchPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span aria-current="page">Page {searchPage}</span>
            <button
              onClick={() => setSearchPage(prev => prev + 1)}
              disabled={searchResults.length < 20}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
        <div className="results-grid" role="list">
          {searchResults.map((result) => (
            <article key={result.id} className="result-card" role="listitem">
              <div className="result-header">
                <h3>{result.name || result.title}</h3>
                <span className="relevance-score">
                  Score: {result.relevance_score}
                </span>
              </div>
              <div className="result-details">
                <span className="type-badge">
                  {result.profile_type}
                </span>
                {result.profile_score && (
                  <span className="profile-score">
                    Profile Score: {result.profile_score}
                  </span>
                )}
              </div>
              <p className="result-description">
                {result.description || result.bio || 'No description available'}
              </p>
              <div className="result-actions">
                <button
                  onClick={() => handleViewProfile(result)}
                  className="view-profile-btn"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleSendEmail(result)}
                  className="send-email-btn"
                >
                  <FaEnvelope /> Send Email
                </button>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  };

  const renderContent = () => {
    console.log('=== RENDER CONTENT ===');
    console.log('activeTab:', activeTab);
    console.log('selectedUser in renderContent:', selectedUser);
    
    switch (activeTab) {
      case 'visual':
        return <UsersTab />;
      case 'expressive':
        return (
          <div className="expressive-tabs">
            <div className="expressive-tab-buttons">
              <button 
                className={activeExpressiveTab === 'items' ? 'active' : ''} 
                onClick={() => setActiveExpressiveTab('items')}
              >
                Items
              </button>
              <button 
                className={activeExpressiveTab === 'restricted' ? 'active' : ''} 
                onClick={() => setActiveExpressiveTab('restricted')}
              >
                Restricted Users
              </button>
            </div>
            {activeExpressiveTab === 'items' ? <ItemsTab /> : <RestrictedUsersTab />}
          </div>
        );
      case 'hybrid':
        return renderSearchResults();
      case 'shared-media':
        console.log('Rendering SharedMediaTab with selectedUser:', selectedUser);
        return <SharedMediaTab 
          key={selectedUser?.id || 'no-user'} 
          selectedUser={selectedUser} 
          searchResults={searchResults} 
        />;
      case 'email':
        return <EmailTab selectedUser={selectedUser} />;
      default:
        return null;
    }
  };

  const clearSelectedUser = () => {
    console.log('Clearing selectedUser');
    setSelectedUser(null);
  };

  const handleTabClick = (tabId) => {
    console.log('=== TAB CLICK ===');
    console.log('Switching from tab:', activeTab, 'to tab:', tabId);
    console.log('selectedUser before tab switch:', selectedUser);
    
    setActiveTab(tabId);
    
    // Don't clear selectedUser when switching to shared-media or email tabs
    if (tabId !== 'shared-media' && tabId !== 'email') {
      console.log('Clearing selectedUser for non-shared-media/email tab');
      clearSelectedUser();
    } else {
      console.log('Preserving selectedUser for shared-media/email tab');
    }
    
    console.log('Tab switched, selectedUser after switch:', selectedUser);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="dashboard-root">
      {/* Top Bar */}
      <header className="dashboard-topbar">
        <div className="dashboard-title">Talent Dashboard</div>
        <div className="dashboard-topbar-actions">
          <button className="dashboard-bell-btn"><FaBell /></button>
          <div className="dashboard-user-dropdown">
            <FaUserCircle className="user-avatar" />
            <span>Admin User</span>
          </div>
          <button className="dashboard-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <div className="dashboard-main-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar-light">
          <SearchTab onSearchResults={handleSearchResults} onViewProfile={handleViewProfile} />
        </aside>
        {/* Main Content */}
        <main className="dashboard-main-content-light">
          {/* Tabs */}
          <div className="dashboard-tabs-bar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`dashboard-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label} <span className="tab-badge">{tab.count}</span>
              </button>
            ))}
          </div>
          {/* Main Content */}
          <div className="dashboard-content-area">
            {renderContent()}
          </div>
        </main>
      </div>

      {showUserPopup && popupUser && (
        <UserSummaryPopup
          user={popupUser}
          onClose={() => {
            setShowUserPopup(false);
            setPopupUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 