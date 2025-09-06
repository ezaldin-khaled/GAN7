import React from 'react';
import { 
  FaUsers, 
  FaImages, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaDollarSign,
  FaChartLine,
  FaUserCheck,
  FaUserClock,
  FaVideo,
  FaMusic,
  FaSync
} from 'react-icons/fa';
import useAnalytics from '../../../../hooks/useAnalytics';
import Loader from '../../../common/Loader';
import './AnalyticsOverview.css';

const AnalyticsOverview = () => {
  const { analytics, loading, error, refreshAnalytics } = useAnalytics();

  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-content">
          <FaExclamationTriangle className="error-icon" />
          <h3>Failed to Load Analytics</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={refreshAnalytics}
          >
            <FaSync />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-error">
        <div className="error-content">
          <FaExclamationTriangle className="error-icon" />
          <h3>No Data Available</h3>
          <p>Analytics data could not be loaded.</p>
          <button 
            className="retry-btn"
            onClick={refreshAnalytics}
          >
            <FaSync />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="analytics-overview">
      <div className="analytics-header">
        <h2>Dashboard Analytics</h2>
        <button 
          className="refresh-analytics-btn"
          onClick={refreshAnalytics}
          title="Refresh analytics data"
        >
          <FaSync />
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="analytics-grid">
        {/* Total Users */}
        <div className="analytics-card primary">
          <div className="card-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-number">{formatNumber(analytics.total_users)}</p>
            <span className="card-change positive">
              +{formatNumber(analytics.users_this_week)} this week
            </span>
          </div>
        </div>

        {/* Total Media Items */}
        <div className="analytics-card success">
          <div className="card-icon">
            <FaImages />
          </div>
          <div className="card-content">
            <h3>Total Media Items</h3>
            <p className="card-number">{formatNumber(analytics.total_media_items)}</p>
            <span className="card-change">
              Content uploaded
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="analytics-card info">
          <div className="card-icon">
            <FaUserCheck />
          </div>
          <div className="card-content">
            <h3>Active Users</h3>
            <p className="card-number">{formatNumber(analytics.active_users)}</p>
            <span className="card-change">
              Last 24 hours
            </span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="analytics-card warning">
          <div className="card-icon">
            <FaExclamationTriangle />
          </div>
          <div className="card-content">
            <h3>Pending Approvals</h3>
            <p className="card-number">{formatNumber(analytics.pending_approvals)}</p>
            <span className="card-change">
              Requires attention
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="analytics-card revenue">
          <div className="card-icon">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="card-number">{formatCurrency(analytics.total_revenue)}</p>
            <span className="card-change positive">
              {formatCurrency(analytics.revenue_this_month)} this month
            </span>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="analytics-card chart">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Monthly Revenue</h3>
            <p className="card-number">{formatCurrency(analytics.revenue_this_month)}</p>
            <span className="card-change">
              Last 30 days
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="analytics-breakdown">
        {/* User Breakdown */}
        <div className="breakdown-section">
          <h3>User Breakdown</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaUsers />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Talent Users</span>
                <span className="breakdown-value">{formatNumber(analytics.breakdown.talent_users)}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaUserClock />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Background Users</span>
                <span className="breakdown-value">{formatNumber(analytics.breakdown.background_users)}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaCheckCircle />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Verified Users</span>
                <span className="breakdown-value">{formatNumber(analytics.breakdown.verified_users)}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaDollarSign />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Premium Subscribers</span>
                <span className="breakdown-value">{formatNumber(analytics.breakdown.premium_subscribers)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Breakdown */}
        <div className="breakdown-section">
          <h3>Media Breakdown</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaVideo />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Talent Media</span>
                <span className="breakdown-value">{formatNumber(analytics.media_breakdown.talent_media)}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaMusic />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Band Media</span>
                <span className="breakdown-value">{formatNumber(analytics.media_breakdown.band_media)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Stats */}
        <div className="breakdown-section">
          <h3>Subscription Statistics</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaCheckCircle />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Active Subscriptions</span>
                <span className="breakdown-value">{formatNumber(analytics.subscription_stats.active_subscriptions)}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaUserClock />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Trial Subscriptions</span>
                <span className="breakdown-value">{formatNumber(analytics.subscription_stats.trial_subscriptions)}</span>
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">
                <FaExclamationTriangle />
              </div>
              <div className="breakdown-content">
                <span className="breakdown-label">Cancelled This Month</span>
                <span className="breakdown-value">{formatNumber(analytics.subscription_stats.cancelled_this_month)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
