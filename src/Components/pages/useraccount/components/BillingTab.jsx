import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaHistory, FaCheck, FaCrown } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './BillingTab.css';

// Helper function to get fallback plans when API is not available
const getFallbackPlans = () => {
  return [
    {
      id: 1,
      name: 'SILVER',
      display_name: 'Silver',
      description: 'Perfect for getting started with enhanced features.',
      price: 9.99,
      stripe_price_id: 'price_silver_yearly',
      features: [
        'Up to 10 projects',
        'Basic AI Generation',
        '5GB Storage',
        'Email Support'
      ]
    },
    {
      id: 2,
      name: 'GOLD',
      display_name: 'Gold',
      description: 'Advanced features for professionals.',
      price: 19.99,
      stripe_price_id: 'price_gold_yearly',
      features: [
        'Unlimited projects',
        'Advanced AI Generation',
        '20GB Storage',
        'Priority Support',
        'Custom Branding'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'PLATINUM',
      display_name: 'Platinum',
      description: 'Ultimate features for enterprises.',
      price: 49.99,
      stripe_price_id: 'price_platinum_yearly',
      features: [
        'Unlimited Everything',
        'Enterprise AI Features',
        '100GB Storage',
        '24/7 Dedicated Support',
        'API Access',
        'Custom Integration'
      ],
      premium: true
    }
  ];
};

// Helper function to ensure all plans are available
const ensureAllPlansAvailable = (apiPlans) => {
  const fallbackPlans = getFallbackPlans();
  
  // If API returned plans, use ONLY API data (no fallback plans)
  if (apiPlans && apiPlans.length > 0) {
    console.log('🔍 BillingTab: Using ONLY API plans (no fallback plans)');
    console.log('🔍 BillingTab: API plans:', apiPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    
    // Return only API plans - no fallback plans added
    console.log('🔍 BillingTab: Final plans (API only):', apiPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    return apiPlans;
  } else {
    console.log('⚠️ BillingTab: No plans from API, using fallback plans only');
    return fallbackPlans;
  }
};

const BillingTab = () => {
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
      console.log('🔄 Fetching plans from API...');
      const response = await axiosInstance.get('/api/payments/plans/');
      console.log('✅ Plans received from API:', response.data);
      
      // Ensure we always have plans to display
      const apiPlans = response.data || [];
      const enhancedPlans = ensureAllPlansAvailable(apiPlans);
      
      setPlans(enhancedPlans);
      setLoading(false);
      console.log('✅ Plans state updated, loading set to false');
    } catch (err) {
      console.error('❌ Error fetching plans:', err);
      
      // Handle 404 error gracefully - API endpoint might not be implemented yet
      if (err.response?.status === 404) {
        console.log('⚠️ Payment plans API endpoint not available, using fallback plans');
        const fallbackPlans = getFallbackPlans();
        setPlans(fallbackPlans);
        setError(''); // Clear any previous errors
      } else {
        setError('Failed to load subscription plans');
        // Still provide fallback plans even on other errors
        const fallbackPlans = getFallbackPlans();
        setPlans(fallbackPlans);
      }
      setLoading(false);
      console.log('✅ Loading set to false after error');
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await axiosInstance.get('/api/payments/subscriptions/');
      console.log('Current subscription data:', response.data);
      console.log('Subscription data structure:', JSON.stringify(response.data, null, 2));
      if (response.data.length > 0) {
        // Use the most recent active subscription (or first one if multiple)
        const activeSubscriptions = response.data.filter(sub => sub.is_active);
        if (activeSubscriptions.length > 0) {
          setCurrentSubscription(activeSubscriptions[0]);
          console.log('Set current subscription to:', activeSubscriptions[0]);
          console.log(`User has ${activeSubscriptions.length} active subscription(s)`);
        } else {
          setCurrentSubscription(response.data[0]);
          console.log('No active subscriptions, using first subscription:', response.data[0]);
        }
      } else {
        setCurrentSubscription(null);
        console.log('No subscription found, set to null');
      }
    } catch (err) {
      console.error('Error fetching current subscription:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      setUserDataLoading(true);
      const response = await axiosInstance.get('/api/profile/talent/');
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
    console.log('🔍 ensureSubscribedPlanAvailable called with:', { apiPlans, subscription });
    
    if (!subscription || !subscription.plan) {
      console.log('⚠️ No subscription or plan found, returning original plans');
      return apiPlans;
    }
    
    const subscribedPlanId = subscription.plan;
    const subscribedPlanName = subscription.plan_name;
    
    console.log('🔍 Looking for subscribed plan:', { subscribedPlanId, subscribedPlanName });
    console.log('🔍 Available API plans:', apiPlans.map(p => ({ id: p.id, name: p.name })));
    
    // Check if the subscribed plan is already in the API plans
    const hasSubscribedPlan = apiPlans.some(plan => plan.id === subscribedPlanId);
    
    if (hasSubscribedPlan) {
      console.log('✅ Subscribed plan found in API plans');
      return apiPlans;
    }
    
    console.log('⚠️ Subscribed plan not found in API plans, adding it');
    
    // Create a plan object for the subscribed plan
    const subscribedPlan = {
      id: subscribedPlanId,
      name: subscribedPlanName,
      price: subscription.plan_price || "0.00",
      features: getDefaultFeatures(subscribedPlanName),
      is_active: true,
      is_subscribed: true // Mark this as the subscribed plan
    };
    
    console.log('🔍 Created subscribed plan object:', subscribedPlan);
    
    // Add the subscribed plan to the beginning of the plans array
    const enhancedPlans = [subscribedPlan, ...apiPlans];
    console.log('🔍 Enhanced plans result:', enhancedPlans.map(p => ({ id: p.id, name: p.name })));
    
    return enhancedPlans;
  };
  
  // Get current plan object by matching subscription with available plans
  const getCurrentPlan = (availablePlans) => {
    if (!currentSubscription || !availablePlans || !availablePlans.length) return null;
    
    // Try different ways to match the plan
    const subscriptionPlanId = currentSubscription.plan_id || currentSubscription.plan;
    const subscriptionPlanName = currentSubscription.plan_name || currentSubscription.plan?.name;
    
    console.log('🔍 Looking for plan with ID:', subscriptionPlanId, 'or name:', subscriptionPlanName);
    console.log('🔍 Available plans:', availablePlans.map(p => ({ id: p.id, name: p.name })));
    console.log('🔍 Full plans data:', JSON.stringify(availablePlans, null, 2));
    
    // First try to match by ID (handle both plan_id and plan fields)
    if (subscriptionPlanId) {
      console.log('🔍 Trying to match by ID:', subscriptionPlanId);
      const matchedPlan = availablePlans.find(plan => {
        console.log('🔍 Comparing plan.id:', plan.id, 'with subscriptionPlanId:', subscriptionPlanId, 'Match:', plan.id === subscriptionPlanId);
        return plan.id === subscriptionPlanId;
      });
      if (matchedPlan) {
        console.log('✅ Found plan by ID:', matchedPlan);
        return matchedPlan;
      }
    }
    
    // Then try to match by name
    if (subscriptionPlanName) {
      console.log('🔍 Trying to match by name:', subscriptionPlanName);
      const matchedPlan = availablePlans.find(plan => {
        const nameMatch = plan.name.toLowerCase() === subscriptionPlanName.toLowerCase();
        const displayNameMatch = plan.display_name?.toLowerCase() === subscriptionPlanName.toLowerCase();
        console.log('🔍 Comparing plan.name:', plan.name, 'with subscriptionPlanName:', subscriptionPlanName, 'Name match:', nameMatch);
        console.log('🔍 Comparing plan.display_name:', plan.display_name, 'with subscriptionPlanName:', subscriptionPlanName, 'Display name match:', displayNameMatch);
        return nameMatch || displayNameMatch;
      });
      if (matchedPlan) {
        console.log('✅ Found plan by name:', matchedPlan);
        return matchedPlan;
      }
    }
    
    console.log('❌ No matching plan found');
    console.log('🔍 Subscription plan ID:', subscriptionPlanId, 'Type:', typeof subscriptionPlanId);
    console.log('🔍 Available plan IDs:', JSON.stringify(availablePlans.map(p => ({ id: p.id, type: typeof p.id })), null, 2));
    return null;
  };

  // Calculate enhanced plans directly
  const enhancedPlans = ensureSubscribedPlanAvailable(plans, currentSubscription);
  
  const displayPlans = enhancedPlans.length > 0 ? enhancedPlans : [
    {
      id: 1,
      name: 'SILVER',
      description: 'Perfect for getting started with enhanced features.',
      price: 9.99,
      stripe_price_id: 'price_silver_yearly',
      features: [
        'Up to 10 projects',
        'Basic AI Generation',
        '5GB Storage',
        'Email Support'
      ]
    },
    {
      id: 2,
      name: 'GOLD',
      description: 'Advanced features for professionals.',
      price: 19.99,
      stripe_price_id: 'price_gold_yearly',
      features: [
        'Unlimited projects',
        'Advanced AI Generation',
        '20GB Storage',
        'Priority Support',
        'Custom Branding'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'PLATINUM',
      description: 'Ultimate features for enterprises.',
      price: 49.99,
      stripe_price_id: 'price_platinum_yearly',
      features: [
        'Unlimited Everything',
        'Enterprise AI Features',
        '100GB Storage',
        '24/7 Dedicated Support',
        'API Access',
        'Custom Integration'
      ],
      premium: true
    }
  ];

  return (
    <div className="content-section">
      <h1 className="section-title">Plans & Billing</h1>
      {error && <div className="error-message">{error}</div>}
      
      {currentSubscription ? (
        <div className="current-plan">
          <FaCrown className="plan-icon pulse" />
          <div className="plan-info">
            <h3>Current Plan: {userData?.account_type || 'Active Plan'}</h3>
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
            <h3>Current Plan: {userData?.account_type || 'Free'}</h3>
            <p>Basic features for individual users</p>
            <div className="plan-status free">
              <span className="status-dot"></span>
              Free Plan
            </div>
          </div>
        </div>
      )}

      <div className="plans-container">
        {console.log('🔍 Rendering plans container - displayPlans:', displayPlans)}
        {console.log('🔍 Rendering plans container - displayPlans.length:', displayPlans.length)}
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
              <h3>{plan.display_name || plan.name.charAt(0).toUpperCase() + plan.name.slice(1).toLowerCase()}</h3>
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