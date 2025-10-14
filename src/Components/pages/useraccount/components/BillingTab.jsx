import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCreditCard, FaHistory, FaCheck, FaCrown } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './BillingTab.css';

// Removed hardcoded fallback plans - using only API data

// Helper function to ensure all plans are available
const ensureAllPlansAvailable = (apiPlans) => {
  // Use only API data - no fallback plans
  return apiPlans || [];
};

const BillingTab = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Add polling interval for subscription updates
  useEffect(() => {
    console.log('🚀 BillingTab component mounted - fetching initial data');
    fetchPlans();
    fetchCurrentSubscription();
    fetchUserData();

    // Set up polling for subscription updates
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling interval - refreshing subscription and plans');
      fetchCurrentSubscription();
      fetchPlans(); // Also refresh plans to ensure they stay visible
    }, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  // Add visibility change listener to refresh plans when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible - refreshing plans and subscription');
        fetchPlans();
        fetchCurrentSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchPlans = async () => {
    try {
      // Get user type from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isTalent = userInfo.is_talent;
      const isBackground = userInfo.is_background;
      
      console.log('Fetching plans from API...');
      
      // Use the correct API endpoint for pricing
      try {
        console.log('Fetching plans from pricing API...');
        const response = await axiosInstance.get('/api/payments/pricing/');
        console.log('Pricing API response:', response.data);
        
        // Handle the correct backend response structure
        if (response.data && response.data.subscription_plans) {
          console.log('Found subscription_plans in response, converting to array format...');
          const allPlansArray = Object.entries(response.data.subscription_plans).map(([key, plan], index) => ({
            id: index + 1,
            name: key,
            display_name: plan.name,
            price: parseFloat(plan.price),
            features: plan.features,
            duration_months: plan.duration_months,
            stripe_price_id: plan.stripe_price_id,
            monthly_equivalent: plan.monthly_equivalent,
            is_active: true
          }));
          
          // Filter plans based on user type
          let filteredPlans = allPlansArray;
          if (isTalent) {
            // Talent users: Hide Production Assets Pro (BACKGROUND_JOBS)
            filteredPlans = allPlansArray.filter(plan => plan.name !== 'BACKGROUND_JOBS');
            console.log('Filtered plans for talent user (removed BACKGROUND_JOBS):', filteredPlans.map(p => p.name));
          } else if (isBackground) {
            // Background users: Hide talent plans (SILVER, GOLD, PLATINUM)
            filteredPlans = allPlansArray.filter(plan => 
              !['SILVER', 'GOLD', 'PLATINUM'].includes(plan.name)
            );
            console.log('Filtered plans for background user (removed SILVER/GOLD/PLATINUM):', filteredPlans.map(p => p.name));
          }
          
          console.log('Converted plans array:', filteredPlans);
          setPlans(filteredPlans);
          setLoading(false);
          return; // Exit early since we got the data
        }
      } catch (err) {
        console.log('Pricing API call failed:', err.message);
      }
      
      // If we reach here, the pricing API failed, so set empty plans
      console.log('No plans available from API');
      setPlans([]);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching plans:', err);
      
      // Handle errors - no fallback plans
      setError('Failed to load subscription plans');
      setPlans([]);
      setLoading(false);
      console.log('✅ Loading set to false after error');
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await axiosInstance.get('/api/payments/subscriptions/');
      console.log('Subscription data:', response.data);
      if (response.data.length > 0) {
        // Use the most recent active subscription (or first one if multiple)
        const activeSubscriptions = response.data.filter(sub => sub.is_active);
        if (activeSubscriptions.length > 0) {
          setCurrentSubscription(activeSubscriptions[0]);
          console.log(`User has ${activeSubscriptions.length} active subscription(s)`);
        } else {
          setCurrentSubscription(response.data[0]);
        }
      } else {
        setCurrentSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching current subscription:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      setUserDataLoading(true);
      
      // Get user type from localStorage to determine correct endpoint
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isBackground = userInfo.is_background;
      
      // Use correct endpoint based on user type
      const endpoint = isBackground ? '/api/profile/background/' : '/api/profile/talent/';
      
      const response = await axiosInstance.get(endpoint);
      console.log('User data received:', response.data);
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Set a default userData object to prevent null errors
      setUserData({
        account_type: 'Free',
        name: 'User',
        email: ''
      });
    } finally {
      setUserDataLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      // Log the plan data that is being sent
      console.log('Plan data being sent:', plan);
      
      console.log('Using centralized axios instance');
      
      // Use uppercase plan name as per API example
      const planId = plan.name.toUpperCase();
      
      const requestData = {
        plan_id: planId,
        success_url: `${window.location.origin}/account?tab=billing`,
        cancel_url: `${window.location.origin}/account?tab=billing`
      };
      
      console.log('Request data being sent:', requestData);
      console.log('API URL:', '/api/payments/create-checkout-session/');
      
      // Get the JWT token
      const token = localStorage.getItem('access');
      console.log('JWT Token available:', !!token);
      
      const response = await axiosInstance.post('/api/payments/create-checkout-session/', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Checkout response:', response.data);
      
      if (response.data && response.data.url) {
        // Store the plan ID in sessionStorage before redirecting
        sessionStorage.setItem('pendingSubscription', planId);
        window.location.href = response.data.url;
      } else {
        setError('Checkout response missing redirect URL');
        console.error('Missing URL in response:', response.data);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      
      // More detailed error information
      if (err.response) {
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
        console.log('Error response headers:', err.response.headers);
        
        if (err.response.data) {
          console.log('Error detail:', err.response.data.detail);
          console.log('Error non_field_errors:', err.response.data.non_field_errors);
          console.log('Full error object:', JSON.stringify(err.response.data));
        }
        
        // Format error message for better user experience
        let errorMessage = `Checkout error (${err.response.status})`;
        
        // Handle specific error cases
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
        // Request was made but no response received
        console.log('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError(`Error: ${err.message}`);
      }
    }
  };

  // Add effect to check for pending subscription on component mount
  useEffect(() => {
    const pendingSubscription = sessionStorage.getItem('pendingSubscription');
    console.log('🔍 Checking for pending subscription:', pendingSubscription);
    if (pendingSubscription) {
      console.log('🔄 Found pending subscription, clearing and refreshing...');
      // Clear the pending subscription
      sessionStorage.removeItem('pendingSubscription');
      // Fetch the latest subscription data
      fetchCurrentSubscription();
      // Also refresh plans to ensure they stay visible
      fetchPlans();
    }
  }, []);

  if (loading || userDataLoading) {
    return (
      <div className="content-section">
        <h1 className="section-title">Plans & Billing</h1>
        
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


  // Get default features based on plan type - moved before usage
  const getDefaultFeatures = (planName) => {
    const name = planName.toLowerCase();
    if (name.includes('basic') || name.includes('silver')) {
      return [
        '3 Projects',
        'Basic AI Features',
        '1GB Storage',
        'Community Support'
      ];
    } else if (name.includes('pro') || name.includes('gold')) {
      return [
        '10 Projects',
        'Advanced AI Features',
        '5GB Storage',
        'Priority Support',
        'Custom Branding'
      ];
    } else if (name.includes('enterprise') || name.includes('platinum')) {
      return [
        'Unlimited Projects',
        'Premium AI Features',
        '20GB Storage',
        '24/7 Support',
        'Custom Branding',
        'API Access',
        'Dedicated Account Manager'
      ];
    } else if (name.includes('bands')) {
      return [
        'Special band profile layout',
        'Upload up to 5 band pictures',
        'Upload up to 5 band videos',
        'Band member management',
        'Event calendar integration',
        'Priority booking requests',
        'Dedicated band support'
      ];
    }
    return [
      '3 Projects',
      'Basic AI Features',
      '1GB Storage',
      'Community Support'
    ];
  };

  // Ensure the subscribed plan is always available
  const ensureSubscribedPlanAvailable = (apiPlans, subscription) => {
    if (!subscription || !subscription.plan) {
      return apiPlans;
    }
    
    const subscribedPlanId = subscription.plan;
    const subscribedPlanName = subscription.plan_name;
    
    // Check if the subscribed plan is already in the API plans
    const hasSubscribedPlan = apiPlans.some(plan => plan.id === subscribedPlanId);
    
    if (hasSubscribedPlan) {
      return apiPlans;
    }
    
    // Create a plan object for the subscribed plan
    const subscribedPlan = {
      id: subscribedPlanId,
      name: subscribedPlanName,
      price: subscription.plan_price || "0.00",
      features: getDefaultFeatures(subscribedPlanName),
      is_active: true,
      is_subscribed: true // Mark this as the subscribed plan
    };
    
    // Add the subscribed plan to the beginning of the plans array
    const enhancedPlans = [subscribedPlan, ...apiPlans];
    return enhancedPlans;
  };
  
  // Get current plan object by matching subscription with available plans
  const getCurrentPlan = (availablePlans) => {
    if (!currentSubscription || !availablePlans || !availablePlans.length) return null;
    
    // Try different ways to match the plan
    const subscriptionPlanId = currentSubscription.plan_id || currentSubscription.plan;
    const subscriptionPlanName = currentSubscription.plan_name || currentSubscription.plan?.name;
    
    // First try to match by ID (handle both plan_id and plan fields)
    if (subscriptionPlanId) {
      const matchedPlan = availablePlans.find(plan => plan.id === subscriptionPlanId);
      if (matchedPlan) {
        return matchedPlan;
      }
    }
    
    // Then try to match by name
    if (subscriptionPlanName) {
      const matchedPlan = availablePlans.find(plan => {
        const nameMatch = plan.name.toLowerCase() === subscriptionPlanName.toLowerCase();
        const displayNameMatch = plan.display_name?.toLowerCase() === subscriptionPlanName.toLowerCase();
        return nameMatch || displayNameMatch;
      });
      if (matchedPlan) {
        return matchedPlan;
      }
    }
    
    return null;
  };

  // Calculate enhanced plans directly
  const enhancedPlans = ensureSubscribedPlanAvailable(plans, currentSubscription);
  
  const displayPlans = enhancedPlans;

  return (
    <div className="content-section">
      <h1 className="section-title">{t('billing.plansAndBilling')}</h1>
      {error && <div className="error-message">{error}</div>}
      
      {/* Restricted Countries Notice */}
      <div className="restricted-countries-notice">
        <div className="notice-header">
          <h3>🌍 {t('billing.restrictedCountriesNotice')}</h3>
        </div>
        <div className="notice-content">
          <p><strong>{t('billing.restrictedCountries')}:</strong> Syria, Iran, North Korea, Cuba, Venezuela, Sudan, Myanmar, Belarus, Russia, Crimea, Donetsk, Luhansk, Afghanistan, Yemen, Libya, Iraq, Somalia, Central African Republic, Democratic Republic of the Congo, South Sudan, Eritrea, Burundi, Zimbabwe, Mali, Burkina Faso, Niger, Chad, Guinea-Bissau, Guinea, Sierra Leone, Liberia, Comoros, Madagascar, Mauritania, Western Sahara</p>
          <p>{t('billing.restrictedCountriesMessage')}</p>
          <div className="contact-email">
            <strong>📧 {t('billing.contactUs')}:</strong> <a href="mailto:info@gan7club.com">info@gan7club.com</a>
          </div>
        </div>
      </div>
      
      {currentSubscription ? (
        <div className="current-plan">
          <FaCrown className="plan-icon pulse" />
          <div className="plan-info">
            <h3>{t('billing.currentPlan')}: {userData?.account_type || t('billing.activePlan')}</h3>
            <div className="end-date">
              <p><strong>{t('billing.validUntil')}:</strong> {new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
            </div>
            <div className="plan-status">
              <span className="status-dot"></span>
              {t('billing.active')}
            </div>
          </div>
        </div>
      ) : (
        <div className="current-plan">
          <FaCrown className="plan-icon" />
          <div className="plan-info">
            <h3>{t('billing.currentPlan')}: {userData?.account_type || t('billing.free')}</h3>
            <p>{t('billing.basicFeatures')}</p>
            <div className="plan-status free">
              <span className="status-dot"></span>
              {t('billing.freePlan')}
            </div>
          </div>
        </div>
      )}

      <div className="plans-container">
        {displayPlans.length > 0 ? (
          displayPlans.map((plan) => {
          const currentPlan = getCurrentPlan(enhancedPlans);
          const isCurrentPlan = currentPlan?.id === plan.id;
          return (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.premium ? 'premium' : ''}`}
            >
              {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
              <h3>{t(`billing.plans.${plan.name}`, plan.display_name || plan.name.charAt(0).toUpperCase() + plan.name.slice(1).toLowerCase())}</h3>
              {plan.name === 'PLATINUM' && (
                <div className="professional-banner">
                  <span className="banner-text">{t('billing.recommendedForProfessionals')}</span>
                </div>
              )}
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
                  {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
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
            <p>No subscription plans available at the moment.</p>
            <p>Please contact support for more information.</p>
          </div>
        )}
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

export default BillingTab;