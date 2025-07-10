import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaHistory, FaCheck, FaCrown } from 'react-icons/fa';
import axiosInstance from '../../../../api/axios';
import './BillingTab.css';

const BillingTab = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Add polling interval for subscription updates
  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
    fetchUserData();

    // Set up polling for subscription updates
    const pollInterval = setInterval(fetchCurrentSubscription, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axiosInstance.get('/api/payments/plans/');
      console.log('Plans received from API:', response.data);
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching plans:', err);
      
      // Handle 404 error gracefully - API endpoint might not be implemented yet
      if (err.response?.status === 404) {
        console.log('Payment plans API endpoint not available, using fallback plans');
        setPlans([]); // This will trigger the fallback plans in displayPlans
        setError(''); // Clear any previous errors
      } else {
        setError('Failed to load subscription plans');
      }
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await axiosInstance.get('/api/payments/subscriptions/');
      console.log('Current subscription data:', response.data);
      if (response.data.length > 0) {
        setCurrentSubscription(response.data[0]);
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
      const response = await axiosInstance.get('/profile/talent/');
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
      console.log('API URL:', '/payments/create-checkout-session/');
      
      const response = await axiosInstance.post('/payments/create-checkout-session/', requestData);

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
    if (pendingSubscription) {
      // Clear the pending subscription
      sessionStorage.removeItem('pendingSubscription');
      // Fetch the latest subscription data
      fetchCurrentSubscription();
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

  // Fallback to static content if no plans are found
  const displayPlans = plans.length > 0 ? plans : [
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

  const getCurrentPlanFeatures = () => {
    if (currentSubscription?.plan) {
      // If features exist in the plan, use them
      if (currentSubscription.plan.features && Array.isArray(currentSubscription.plan.features)) {
        return currentSubscription.plan.features;
      }
      
      // Otherwise, return default features based on plan name
      const planName = currentSubscription.plan.name?.toLowerCase() || '';
      if (planName.includes('basic')) {
        return [
          '3 Projects',
          'Basic AI Features',
          '1GB Storage',
          'Community Support'
        ];
      } else if (planName.includes('pro')) {
        return [
          '10 Projects',
          'Advanced AI Features',
          '5GB Storage',
          'Priority Support',
          'Custom Branding'
        ];
      } else if (planName.includes('enterprise')) {
        return [
          'Unlimited Projects',
          'Premium AI Features',
          '20GB Storage',
          '24/7 Support',
          'Custom Branding',
          'API Access',
          'Dedicated Account Manager'
        ];
      }
    }
    
    // Default free plan features
    return [
      '3 Projects',
      'Basic AI Features',
      '1GB Storage',
      'Community Support'
    ];
  };

  const getDefaultFeatures = (planName) => {
    const name = planName.toLowerCase();
    if (name.includes('basic')) {
      return [
        '3 Projects',
        'Basic AI Features',
        '1GB Storage',
        'Community Support'
      ];
    } else if (name.includes('pro')) {
      return [
        '10 Projects',
        'Advanced AI Features',
        '5GB Storage',
        'Priority Support',
        'Custom Branding'
      ];
    } else if (name.includes('enterprise')) {
      return [
        'Unlimited Projects',
        'Premium AI Features',
        '20GB Storage',
        '24/7 Support',
        'Custom Branding',
        'API Access',
        'Dedicated Account Manager'
      ];
    }
    return [
      '3 Projects',
      'Basic AI Features',
      '1GB Storage',
      'Community Support'
    ];
  };

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
        {displayPlans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan.id === plan.id;
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
        })}
      </div>

      <div className="current-plan-features">
        <h3>
          <FaCrown className="section-icon" />
          Your {currentSubscription ? currentSubscription.plan.name : 'Free'} Plan Features
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

export default BillingTab;