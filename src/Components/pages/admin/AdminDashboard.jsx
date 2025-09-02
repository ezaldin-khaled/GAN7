import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaEnvelope, 
  FaUsers, 
  FaImages, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaChartLine
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
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
  { id: 'overview', label: 'Overview', count: null },
  { id: 'visual', label: 'Visual Workers', count: 5 },
  { id: 'expressive', label: 'Expressive Workers', count: 5 },
  { id: 'hybrid', label: 'Hybrid Workers', count: 5 },
  { id: 'shared-media', label: 'Shared Media', count: 0 },
  { id: 'email', label: 'Email', count: 0 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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
    console.log('=== ADMIN DASHBOARD MOUNTED ===');
    console.log('Starting authentication check...');
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
    console.log('=== STARTING AUTH CHECK ===');
    const token = localStorage.getItem('access');
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    const userData = localStorage.getItem('user');
    
    console.log('=== ADMIN DASHBOARD AUTH CHECK ===');
    console.log('Token exists:', !!token);
    console.log('Admin logged in flag:', adminLoggedIn);
    console.log('User data exists:', !!userData);
    
    if (!token) {
      console.log('No access token found');
      redirectToLogin();
      return;
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);
        console.log('isStaff:', user.isStaff);
        console.log('isDashboard:', user.isDashboard);
        
        // Check if user has admin or dashboard access
        if (user.isStaff || user.isDashboard || adminLoggedIn === 'true') {
          console.log('AdminDashboard: User authenticated successfully via localStorage');
          console.log('Setting isAuthenticated to true');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } else {
          console.log('User data exists but no admin/dashboard flags found');
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    } else {
      console.log('No user data found in localStorage');
    }

    // Fallback to API verification if localStorage check fails
    try {
      console.log('Falling back to API token verification...');
      const response = await axiosInstance.post('/token/verify/', { token });
      console.log('=== TOKEN VERIFICATION RESPONSE ===');
      console.log('Full response:', response.data);
      console.log('is_dashboard:', response.data.is_dashboard);
      console.log('is_staff:', response.data.is_staff);
      console.log('Other fields:', Object.keys(response.data));

      // Check if user has dashboard access (either as dashboard user or staff/admin)
      if (response.data.is_dashboard === true || response.data.is_staff === true) {
        console.log('AdminDashboard: User authenticated successfully via API');
        setIsAuthenticated(true);
      } else {
        console.log('AdminDashboard: User not authorized for dashboard access');
        redirectToLogin();
      }
    } catch (error) {
      console.error('API auth check failed:', error);
      
      // If token is invalid, try to refresh
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const refreshResponse = await axiosInstance.post('/token/refresh/', { 
            refresh: refreshToken 
          });
          localStorage.setItem('access', refreshResponse.data.access);
          setIsAuthenticated(true);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          redirectToLogin();
        }
      } else {
        redirectToLogin();
      }
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
        await axiosInstance.post('/token/blacklist/', { 
          refresh: localStorage.getItem('refresh') 
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
      case 'overview':
        return (
          <div className="overview-section">
            <div className="overview-header">
              <h2>Dashboard Overview</h2>
              <p>Welcome to your admin dashboard. Here's what's happening today.</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
                  <span className="stat-change positive">+23 this week</span>
                </div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-icon">
                  <FaImages />
                </div>
                <div className="stat-content">
                  <h3>Total Items</h3>
                  <p className="stat-number">{stats.totalItems.toLocaleString()}</p>
                  <span className="stat-change">Media content</span>
                </div>
              </div>
              
              <div className="stat-card info">
                <div className="stat-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-content">
                  <h3>Active Users</h3>
                  <p className="stat-number">{stats.activeUsers.toLocaleString()}</p>
                  <span className="stat-change">Currently online</span>
                </div>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-icon">
                  <FaExclamationTriangle />
                </div>
                <div className="stat-content">
                  <h3>Pending Approvals</h3>
                  <p className="stat-number">{stats.pendingApprovals}</p>
                  <span className="stat-change">Requires attention</span>
                </div>
              </div>
              
              <div className="stat-card revenue">
                <div className="stat-icon">
                  <FaChartLine />
                </div>
                <div className="stat-content">
                  <h3>Total Revenue</h3>
                  <p className="stat-number">$15,420</p>
                  <span className="stat-change positive">+12% this month</span>
                </div>
              </div>
              
              <div className="stat-card rating">
                <div className="stat-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-content">
                  <h3>Average Rating</h3>
                  <p className="stat-number">4.6</p>
                  <span className="stat-change">User satisfaction</span>
                </div>
              </div>
            </div>
            
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn primary" onClick={() => setActiveTab('visual')}>
                  <FaUsers />
                  Manage Users
                </button>
                <button className="action-btn success" onClick={() => setActiveTab('shared-media')}>
                  <FaImages />
                  Review Media
                </button>
                <button className="action-btn info" onClick={() => setActiveTab('email')}>
                  <FaEnvelope />
                  Send Email
                </button>
                <button className="action-btn warning" onClick={() => setActiveTab('visual')}>
                  <FaExclamationTriangle />
                  View Pending
                </button>
              </div>
            </div>
          </div>
        );
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