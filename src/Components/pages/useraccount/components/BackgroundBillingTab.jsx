import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaHistory, FaCheck, FaCrown } from 'react-icons/fa';
import './BillingTab.css';

// Update to match UserAccountPage base URL
const API_URL = 'https://api.gan7club.com/';
const PAYMENTS_ENDPOINT = 'api/payments/';

const BackgroundBillingTab = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      console.log('🔍 Fetching Production Assets Pro plans with token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(`${API_URL}${PAYMENTS_ENDPOINT}plans/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('📥 Production Assets Pro plans API response:', response.data);
      console.log('📋 Plans structure:', JSON.stringify(response.data, null, 2));
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching Production Assets Pro plans:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('Failed to load subscription plans');
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      // Fetch profile data which includes subscription information
      const response = await axios.get(`${API_URL}api/profile/background/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('📥 Production Assets Pro profile API response:', response.data);
      
      // Extract subscription data from profile response
      const subscriptionStatus = response.data.subscription_status;
      const endDate = response.data.end_date; // Root level end_date
      
      if (subscriptionStatus && subscriptionStatus.has_subscription) {
        const subscriptionData = {
          ...subscriptionStatus.subscription,
          current_period_end: endDate || subscriptionStatus.subscription?.current_period_end || subscriptionStatus.subscription?.end_date || subscriptionStatus.subscription?.plan_end
        };
        
        console.log('✅ Setting current subscription from profile:', subscriptionData);
        console.log('📋 Subscription structure:', JSON.stringify(subscriptionData, null, 2));
        setCurrentSubscription(subscriptionData);
      } else {
        console.log('❌ No subscription found in profile, setting to null');
        setCurrentSubscription(null);
      }
    } catch (err) {
      console.error('❌ Error fetching current Production Assets Pro subscription from profile:', err);
      // If profile endpoint doesn't exist or user has no subscription, set to null
      setCurrentSubscription(null);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      console.log('Plan data being sent:', plan);
      
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      // Use uppercase plan name as per API example
      const planId = plan.name.toUpperCase();
      
      const requestData = {
        plan_id: planId,
          success_url: `${window.location.origin}/account?tab=billing`,
          cancel_url: `${window.location.origin}/account?tab=billing`
      };
      
      console.log('Request data being sent:', requestData);
      console.log('API URL:', `${API_URL}${PAYMENTS_ENDPOINT}create-checkout-session/`);
      
      const authHeader = `Bearer ${token}`;
      console.log('Auth Header:', `Bearer ${token?.substring(0, 10)}...`);
      
      const response = await axios.post(
        `${API_URL}${PAYMENTS_ENDPOINT}create-checkout-session/`,
        requestData,
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
          withCredentials: true
        }
      );

      console.log('Checkout response:', response.data);
      
      if (response.data && response.data.url) {
        sessionStorage.setItem('pendingSubscription', planId);
      window.location.href = response.data.url;
      } else {
        setError('Checkout response missing redirect URL');
        console.error('Missing URL in response:', response.data);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      
      if (err.response) {
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
        
        let errorMessage = `Checkout error (${err.response.status})`;
        
        if (err.response.status === 403 || err.response.data.detail?.includes('credentials')) {
          errorMessage = 'Authentication error. Please log out and log back in.';
        } else if (err.response.data.error === 'Invalid plan ID') {
          errorMessage = 'Unable to process this subscription plan. Please contact support.';
        } else if (err.response.data.error) {
          errorMessage = `Error: ${err.response.data.error}`;
        } else if (err.response.data.detail) {
          errorMessage = `Error: ${err.response.data.detail}`;
        } else {
          errorMessage = `${errorMessage}: ${JSON.stringify(err.response.data)}`;
        }
        
        setError(errorMessage);
      } else if (err.request) {
        console.log('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  // Transform plan names for display
  const getDisplayPlanName = (planName) => {
    if (!planName) return '';
    
    const name = planName.toLowerCase();
    if (name === 'background_jobs' || name === 'background') {
      return 'Production Assets Pro';
    }
    
    // Handle other plan name transformations if needed
    if (name === 'back_ground_jobs') {
      return 'Production Assets Pro';
    }
    
    // Return original name with proper capitalization for other plans
    return planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
  };

  // Get default features based on plan type
  const getDefaultFeatures = (planName) => {
    const name = (planName || '').toLowerCase();
    if (name.includes('basic') || name.includes('starter')) {
      return [
        'Up to 10 Production Assets Pro items',
        'Basic AI Production Assets Generation',
        '5GB Storage',
        'Email Support'
      ];
    } else if (name.includes('pro') || name.includes('professional')) {
      return [
        'Unlimited Production Assets Pro items',
        'Advanced AI Production Assets Generation',
        '20GB Storage',
        'Priority Support',
        'Custom Branding'
      ];
    } else if (name.includes('enterprise') || name.includes('premium')) {
      return [
        'Unlimited Everything',
        'Enterprise AI Features',
        '100GB Storage',
        '24/7 Dedicated Support',
        'API Access',
        'Custom Integration'
      ];
    }
    return [
      'Up to 5 Production Assets Pro items',
      'Basic AI Production Assets Generation',
      '1GB Storage',
      'Community Support'
    ];
  };

  // Get current plan object by matching subscription with available plans
  const getCurrentPlan = () => {
    if (!currentSubscription || !plans.length) return null;
    
    // Try different ways to match the plan
    const subscriptionPlanId = currentSubscription.plan_id || currentSubscription.plan?.id;
    const subscriptionPlanName = currentSubscription.plan_name || currentSubscription.plan?.name;
    
    console.log('🔍 Looking for plan with ID:', subscriptionPlanId, 'or name:', subscriptionPlanName);
    
    // First try to match by ID
    if (subscriptionPlanId) {
      const matchedPlan = plans.find(plan => plan.id === subscriptionPlanId);
      if (matchedPlan) {
        console.log('✅ Found plan by ID:', matchedPlan);
        return matchedPlan;
      }
    }
    
    // Then try to match by name
    if (subscriptionPlanName) {
      const matchedPlan = plans.find(plan => 
        plan.name.toLowerCase() === subscriptionPlanName.toLowerCase() ||
        plan.display_name?.toLowerCase() === subscriptionPlanName.toLowerCase()
      );
      if (matchedPlan) {
        console.log('✅ Found plan by name:', matchedPlan);
        return matchedPlan;
      }
    }
    
    console.log('❌ No matching plan found');
    return null;
  };

  // Get current plan features
  const getCurrentPlanFeatures = () => {
    const currentPlan = getCurrentPlan();
    
    console.log('🎯 Getting features for current plan:', currentPlan);
    
    if (currentPlan) {
      // Use the plan's features if available
      if (currentPlan.features && Array.isArray(currentPlan.features)) {
        console.log('✅ Using plan features:', currentPlan.features);
        return currentPlan.features;
      }
      
      // Fallback to default features based on plan name
      const planName = currentPlan.name?.toLowerCase() || '';
      console.log('📝 Using default features for plan:', planName);
      
      if (planName.includes('basic')) {
        return [
          'Up to 10 Production Assets Pro items',
          'Basic AI Production Assets Generation',
          '5GB Storage',
          'Email Support'
        ];
      } else if (planName.includes('pro')) {
        return [
          'Unlimited Production Assets Pro items',
          'Advanced AI Production Assets Generation',
          '20GB Storage',
          'Priority Support',
          'Custom Branding'
        ];
      } else if (planName.includes('enterprise')) {
        return [
          'Unlimited Everything',
          'Enterprise AI Features',
          '100GB Storage',
          '24/7 Dedicated Support',
          'API Access',
          'Custom Integration'
        ];
      }
    }
    
    console.log('🆓 Using free plan features');
    // Default free plan features
    return [
      'Up to 5 Production Assets Pro items',
      'Basic AI Production Assets Generation',
      '1GB Storage',
      'Community Support'
    ];
  };

  if (loading) {
    return (
      <div className="content-section">
        <h1 className="section-title">Production Assets Pro Plans</h1>
        
        {/* Skeleton for current plan */}
        <div className="current-plan loading">
          <div className="plan-icon loading-icon"></div>
          <div className="plan-info">
            <div className="loading-text" style={{ width: '200px', height: '24px' }}></div>
            <div className="loading-text" style={{ width: '150px', height: '16px' }}></div>
          </div>
        </div>

        {/* Skeleton for plan cards */}
        <div className="plans-container">
          {[1, 2, 3].map((index) => (
            <div key={index} className="pricing-card loading">
              <div className="loading-text" style={{ width: '120px', height: '28px', marginBottom: '10px' }}></div>
              <div className="loading-text" style={{ width: '80%', height: '16px', marginBottom: '20px' }}></div>
              
              <div className="price-info">
                <div className="loading-text" style={{ width: '100px', height: '32px' }}></div>
              </div>

              <div className="loading-text" style={{ width: '80%', height: '40px', margin: '20px 0' }}></div>

              <div className="features-list">
                {[1, 2, 3, 4].map((featureIndex) => (
                  <div key={featureIndex} className="feature-item loading">
                    <div className="loading-text" style={{ width: '80%', height: '16px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to static content if no plans are found
  const displayPlans = plans.length > 0 ? plans : [];

  return (
    <div className="content-section">
      <h1 className="section-title">Production Assets Pro Plans</h1>
      {error && <div className="error-message">{error}</div>}

      {currentSubscription ? (
        <div className="current-plan">
          <FaCrown className="plan-icon pulse" />
          <div className="plan-info">
            <h3>Current Plan: {getDisplayPlanName(getCurrentPlan()?.name) || getCurrentPlan()?.display_name || 'Active Plan'}</h3>
            <div className="end-date">
              <p><strong>Valid until:</strong> {new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
            </div>
            <div className="plan-status">
              <span className="status-dot"></span>
              Active
            </div>
          </div>
        </div>
      ) : (
        <div className="current-plan">
          <FaCrown className="plan-icon" />
          <div className="plan-info">
            <h3>Current Plan: Free</h3>
            <p>Basic features for Production Assets Pro providers</p>
            <div className="plan-status free">
              <span className="status-dot"></span>
              Free Plan
            </div>
          </div>
        </div>
      )}

      <div className="plans-container">
        {displayPlans.length > 0 ? (
          displayPlans.map((plan) => {
            const currentPlan = getCurrentPlan();
            const isCurrentPlan = currentPlan?.id === plan.id;
            return (
              <div 
                key={plan.id} 
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.premium ? 'premium' : ''}`}
              >
                {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
                <h3>{getDisplayPlanName(plan.name)}</h3>
                <p>{plan.description}</p>
            
                <div className="price-info">
                  <div className="current-price">
                    <span className="currency">US$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/mo</span>
                  </div>
                  {isCurrentPlan && (
                    <div className="current-plan-marker">
                      <FaCheck /> Current Plan
                    </div>
                  )}
                </div>

                <button 
                  className={`choose-plan ${isCurrentPlan ? 'active' : ''}`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan}
                >
                  <span className="button-text">
                    {isCurrentPlan ? 'Current Plan' : `Upgrade to ${getDisplayPlanName(plan.name)}`}
                  </span>
                </button>

                <div className="features-list">
                  {(plan.features || getDefaultFeatures(plan.name)).map((feature, index) => (
                    <div key={index} className="feature-item">
                      <FaCheck className="feature-icon" /> 
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-plans-message">
            <p>No Production Assets Pro plans available at the moment.</p>
            <p>Please contact support for more information.</p>
          </div>
        )}
      </div>

      <div className="current-plan-features">
        <h3>
          <FaCrown className="section-icon" />
          Your {getDisplayPlanName(getCurrentPlan()?.name) || getCurrentPlan()?.display_name || 'Free'} Plan Features
        </h3>
        <div className="features-list highlight">
          {getCurrentPlanFeatures().map((feature, index) => (
            <div key={index} className="feature-item">
              <FaCheck className="feature-icon" />
              <span className="feature-text">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export default BackgroundBillingTab;