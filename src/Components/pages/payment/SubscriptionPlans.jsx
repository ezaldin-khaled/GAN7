import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements } from '@stripe/react-stripe-js';
import axiosInstance from '../../../api/axios';
import { stripePromise } from '../../../config/stripe';
import PaymentForm from './PaymentForm';
import './SubscriptionPlans.css';

// Helper function to get fallback plans when API is not available
const getFallbackPlans = () => {
  return [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '29.99',
      monthly_equivalent: '2.50',
      features: [
        'Basic image generation',
        'Standard resolution',
        'Community support',
        '5 generations per day'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '59.99',
      monthly_equivalent: '5.00',
      features: [
        'Advanced image generation',
        'High resolution',
        'Priority support',
        'Unlimited generations',
        'Custom styles'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '99.99',
      monthly_equivalent: '8.33',
      features: [
        'Premium image generation',
        'Ultra high resolution',
        '24/7 support',
        'Unlimited generations',
        'All custom styles',
        'Commercial license'
      ]
    }
  ];
};

// Helper function to ensure all plans are available
const ensureAllPlansAvailable = (apiPlans) => {
  const fallbackPlans = getFallbackPlans();
  
  // If API returned plans, use ONLY API data (no fallback plans)
  if (apiPlans && apiPlans.length > 0) {
    console.log('🔍 SubscriptionPlans: Using ONLY API plans (no fallback plans)');
    console.log('🔍 SubscriptionPlans: API plans:', apiPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    
    // Return only API plans - no fallback plans added
    console.log('🔍 SubscriptionPlans: Final plans (API only):', apiPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    return apiPlans;
  } else {
    console.log('⚠️ SubscriptionPlans: No plans from API, using fallback plans only');
    return fallbackPlans;
  }
};

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log('🔍 SubscriptionPlans: Component mounted');
    console.log('🔍 SubscriptionPlans: Environment:', process.env.NODE_ENV);
    console.log('🔍 SubscriptionPlans: Base URL:', window.location.origin);
    console.log('🔍 SubscriptionPlans: Current path:', window.location.pathname);
    
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      // Get user type from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isTalent = userInfo.is_talent;
      const isBackground = userInfo.is_background;
      
      console.log('🔍 SubscriptionPlans: Fetching all available plans...');
      console.log('🔍 SubscriptionPlans: User type - is_talent:', isTalent, 'is_background:', isBackground);
      console.log('🔍 SubscriptionPlans: Request headers:', {
        'Authorization': 'Bearer ***',
        'Content-Type': 'application/json'
      });
      
      const token = localStorage.getItem('access');
      console.log('🔍 SubscriptionPlans: JWT Token available:', !!token);
      console.log('🔍 SubscriptionPlans: Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
      
      // Try multiple approaches to get all plans
      const allPlans = new Map(); // Use Map to avoid duplicates by ID
      
      // Approach 1: Try with different parameter combinations
      const parameterSets = [
        { show_all: true, include_subscribed: true },
        { show_all: true },
        { include_subscribed: true },
        { user_type: isTalent ? 'talent' : isBackground ? 'background' : undefined },
        {} // No parameters - default behavior
      ];
      
      for (const params of parameterSets) {
        try {
          console.log(`🔍 SubscriptionPlans: Trying with params:`, params);
          const response = await axiosInstance.get('/api/payments/pricing/', { params });
          
          // Handle the correct backend response structure
          if (response.data && response.data.subscription_plans) {
            const plansArray = Object.entries(response.data.subscription_plans).map(([key, plan], index) => ({
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
            let filteredPlans = plansArray;
            if (isTalent) {
              // Talent users: Hide Production Assets Pro (BACKGROUND_JOBS)
              filteredPlans = plansArray.filter(plan => plan.name !== 'BACKGROUND_JOBS');
              console.log('SubscriptionPlans: Filtered plans for talent user (removed BACKGROUND_JOBS):', filteredPlans.map(p => p.name));
            } else if (isBackground) {
              // Background users: Hide talent plans (SILVER, GOLD, PLATINUM)
              filteredPlans = plansArray.filter(plan => 
                !['SILVER', 'GOLD', 'PLATINUM'].includes(plan.name)
              );
              console.log('SubscriptionPlans: Filtered plans for background user (removed SILVER/GOLD/PLATINUM):', filteredPlans.map(p => p.name));
            }
            
            filteredPlans.forEach(plan => {
              if (plan.id) {
                allPlans.set(plan.id, plan);
                console.log(`✅ SubscriptionPlans: Added plan ${plan.id} (${plan.name})`);
              }
            });
          } else if (response.data && Array.isArray(response.data)) {
            // Fallback for old array format
            response.data.forEach(plan => {
              if (plan.id) {
                allPlans.set(plan.id, plan);
                console.log(`✅ SubscriptionPlans: Added plan ${plan.id} (${plan.name})`);
              }
            });
          }
        } catch (err) {
          console.log(`⚠️ SubscriptionPlans: Failed with params ${JSON.stringify(params)}:`, err.message);
        }
      }
      
      // Convert Map to Array
      const apiPlans = Array.from(allPlans.values());
      console.log(`✅ SubscriptionPlans: Collected ${apiPlans.length} unique plans:`, apiPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));
      
      // If we still don't have enough plans, add fallback plans for missing ones
      if (apiPlans.length < 3) {
        console.log('⚠️ SubscriptionPlans: Not enough plans from API, adding fallback plans');
        const fallbackPlans = getFallbackPlans();
        fallbackPlans.forEach(fallbackPlan => {
          if (!allPlans.has(fallbackPlan.id)) {
            allPlans.set(fallbackPlan.id, fallbackPlan);
            console.log(`✅ SubscriptionPlans: Added fallback plan ${fallbackPlan.id} (${fallbackPlan.name})`);
          }
        });
      }
      
      const finalPlans = Array.from(allPlans.values());
      setPlans(finalPlans);
      setDebugInfo(prev => ({ ...prev, plansFetched: true, plansCount: finalPlans?.length || 0 }));
      setLoading(false);
      console.log(`✅ SubscriptionPlans: Final plans count: ${finalPlans.length}`);
    } catch (err) {
      console.error('❌ SubscriptionPlans: Error fetching plans:', err);
      console.error('❌ SubscriptionPlans: Error response:', err.response?.data);
      console.error('❌ SubscriptionPlans: Error status:', err.response?.status);
      console.error('❌ SubscriptionPlans: Error headers:', err.response?.headers);
      console.error('❌ SubscriptionPlans: Error config:', err.config);
      console.error('❌ SubscriptionPlans: Error message:', err.message);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        plansError: true, 
        plansErrorStatus: err.response?.status,
        plansErrorMessage: err.message 
      }));
      
      // Handle 404 error gracefully - API endpoint might not be implemented yet
      if (err.response?.status === 404) {
        console.log('⚠️ SubscriptionPlans: Payment plans API endpoint not available, using fallback plans');
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
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      console.log('🔍 SubscriptionPlans: Fetching current subscription from /payments/subscriptions/');
      console.log('🔍 SubscriptionPlans: Note: This endpoint is missing /api/ prefix');
      
      const token = localStorage.getItem('access');
      console.log('🔍 SubscriptionPlans: JWT Token available for subscription fetch:', !!token);
      
      const response = await axiosInstance.get('/payments/subscriptions/');
      console.log('✅ SubscriptionPlans: Current subscription fetched');
      console.log('🔍 SubscriptionPlans: Response status:', response.status);
      console.log('🔍 SubscriptionPlans: Response data:', response.data);
      console.log('🔍 SubscriptionPlans: Number of subscriptions:', response.data?.length || 0);
      
      if (response.data.length > 0) {
        setCurrentSubscription(response.data[0]);
        console.log('✅ SubscriptionPlans: Current subscription set:', response.data[0]);
        setDebugInfo(prev => ({ ...prev, subscriptionFound: true, subscriptionData: response.data[0] }));
      } else {
        console.log('ℹ️ SubscriptionPlans: No current subscription found');
        setDebugInfo(prev => ({ ...prev, subscriptionFound: false }));
      }
    } catch (err) {
      console.error('❌ SubscriptionPlans: Error fetching current subscription:', err);
      console.error('❌ SubscriptionPlans: Error response:', err.response?.data);
      console.error('❌ SubscriptionPlans: Error status:', err.response?.status);
      console.error('❌ SubscriptionPlans: Error message:', err.message);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        subscriptionError: true, 
        subscriptionErrorStatus: err.response?.status,
        subscriptionErrorMessage: err.message 
      }));
    }
  };

  const handlePlanSelect = (plan) => {
    console.log('🔍 SubscriptionPlans: Plan selected:', plan);
    console.log('🔍 SubscriptionPlans: Plan details:', {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      features: plan.features?.length || 0
    });
    setSelectedPlan(plan);
    setError('');
    setSuccess('');
  };

  const handleUpgradeClick = (plan) => {
    console.log('🔍 SubscriptionPlans: Upgrade clicked for plan:', plan);
    console.log('🔍 SubscriptionPlans: Current subscription:', currentSubscription);
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleCheckout = async (plan) => {
    try {
      console.log('🔍 SubscriptionPlans: Creating checkout session for plan:', plan);
      console.log('🔍 SubscriptionPlans: Plan details:', {
        id: plan.id,
        name: plan.name,
        price: plan.price
      });
      
      const requestData = {
        plan_id: plan.id,
        success_url: `${window.location.origin}/subscription/success`,
        cancel_url: `${window.location.origin}/subscription/cancel`
      };
      
      console.log('🔍 SubscriptionPlans: Request data:', requestData);
      console.log('🔍 SubscriptionPlans: Success URL:', requestData.success_url);
      console.log('🔍 SubscriptionPlans: Cancel URL:', requestData.cancel_url);
      
      const token = localStorage.getItem('access');
      console.log('🔍 SubscriptionPlans: JWT Token available for checkout:', !!token);
      console.log('🔍 SubscriptionPlans: Request headers:', {
        'Authorization': `Bearer ${token ? '***' : 'null'}`,
        'Content-Type': 'application/json'
      });

      const response = await axiosInstance.post('/api/payments/create-checkout-session/', requestData);

      console.log('✅ SubscriptionPlans: Checkout session created successfully');
      console.log('🔍 SubscriptionPlans: Response status:', response.status);
      console.log('🔍 SubscriptionPlans: Response data:', response.data);
      console.log('🔍 SubscriptionPlans: Redirecting to:', response.data.url);
      
      setDebugInfo(prev => ({ ...prev, checkoutSuccess: true, checkoutUrl: response.data.url }));
      
      window.location.href = response.data.url;
    } catch (err) {
      console.error('❌ SubscriptionPlans: Error creating checkout session:', err);
      console.error('❌ SubscriptionPlans: Error response:', err.response?.data);
      console.error('❌ SubscriptionPlans: Error status:', err.response?.status);
      console.error('❌ SubscriptionPlans: Error message:', err.message);
      console.error('❌ SubscriptionPlans: Error config:', err.config);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        checkoutError: true, 
        checkoutErrorStatus: err.response?.status,
        checkoutErrorMessage: err.message,
        checkoutErrorData: err.response?.data 
      }));
      
      setError(err.response?.data?.message || 'Failed to create checkout session');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      console.log('🔍 SubscriptionPlans: Payment successful, updating subscription');
      console.log('🔍 SubscriptionPlans: Payment intent:', paymentIntent);
      console.log('🔍 SubscriptionPlans: Selected plan:', selectedPlan);
      console.log('🔍 SubscriptionPlans: Current subscription:', currentSubscription);

      const requestData = {
        plan_id: selectedPlan.id,
        payment_intent_id: paymentIntent.id,
        is_upgrade: currentSubscription !== null
      };

      console.log('🔍 SubscriptionPlans: Request data for subscription update:', requestData);
      console.log('🔍 SubscriptionPlans: Making request to /api/payments/subscriptions/');

      const response = await axiosInstance.post('/api/payments/subscriptions/', requestData);

      console.log('✅ SubscriptionPlans: Subscription updated successfully');
      console.log('🔍 SubscriptionPlans: Update response:', response.data);
      
      setDebugInfo(prev => ({ ...prev, subscriptionUpdated: true, updateResponse: response.data }));
      
      setSuccess('Subscription activated successfully!');
      setShowPaymentModal(false);
      fetchCurrentSubscription();
    } catch (err) {
      console.error('❌ SubscriptionPlans: Error updating subscription:', err);
      console.error('❌ SubscriptionPlans: Error response:', err.response?.data);
      console.error('❌ SubscriptionPlans: Error status:', err.response?.status);
      console.error('❌ SubscriptionPlans: Error message:', err.message);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        updateError: true, 
        updateErrorStatus: err.response?.status,
        updateErrorMessage: err.message 
      }));
      
      setError('Failed to activate subscription');
    }
  };

  const handlePaymentError = (error) => {
    console.error('❌ SubscriptionPlans: Payment error:', error);
    console.error('❌ SubscriptionPlans: Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      decline_code: error.decline_code
    });
    
    setDebugInfo(prev => ({ 
      ...prev, 
      paymentError: true, 
      paymentErrorDetails: {
        message: error.message,
        code: error.code,
        type: error.type
      }
    }));
    
    setError(error.message || 'Payment failed');
  };

  console.log('🔍 SubscriptionPlans: Render state:', {
    loading,
    plans: plans.length,
    selectedPlan: selectedPlan?.id,
    currentSubscription: currentSubscription?.id,
    showPaymentModal,
    error,
    success,
    debugInfo
  });

  if (loading) {
    console.log('🔍 SubscriptionPlans: Showing loading spinner');
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="subscription-plans-container">
      <h2>{t('subscription.chooseYourPlan')}</h2>
      
      {/* Debug Panel for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel" style={{
          background: '#f0f0f0',
          border: '1px solid #ccc',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <h4>🔧 Debug Info</h4>
          <div><strong>Plans Count:</strong> {plans.length}</div>
          <div><strong>Current Subscription:</strong> {currentSubscription ? `${currentSubscription.plan?.name || 'Unknown'} (ID: ${currentSubscription.plan?.id || 'Unknown'})` : 'None'}</div>
          <div><strong>Available Plans:</strong></div>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {plans.map(plan => (
              <li key={plan.id}>
                {plan.name} (ID: {plan.id}, Price: ${plan.price})
                {currentSubscription?.plan?.id === plan.id && ' - CURRENT PLAN'}
              </li>
            ))}
          </ul>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {currentSubscription && (
        <div className="current-subscription">
          <h3>Current Plan: {currentSubscription.plan.name}</h3>
          <p>Valid until: {new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
          {currentSubscription.plan_end && (
            <p>Plan ends: {new Date(currentSubscription.plan_end).toLocaleDateString()}</p>
          )}
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            💡 You can view all available plans below and upgrade or change your subscription at any time.
          </p>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan.id === plan.id;
          // Fix upgrade logic: only consider it an upgrade if the plan price is higher than current plan
          const isUpgrade = currentSubscription && 
            currentSubscription.plan && 
            parseFloat(plan.price) > parseFloat(currentSubscription.plan.price);

          return (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${isCurrentPlan ? 'current' : ''}`}
            >
              <h3>{t(`billing.plans.${plan.name}`, plan.name)}</h3>
              {plan.name === 'PLATINUM' && (
                <div className="professional-banner">
                  <span className="banner-text">{t('billing.recommendedForProfessionals')}</span>
                </div>
              )}
              <div className="price">
                <span className="annual-price">
                  ${plan.price}/year
                </span>
                <span className="monthly-price">
                  ${plan.monthly_equivalent}/month
                </span>
              </div>
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button
                className={`select-plan-button ${isCurrentPlan ? 'current' : ''} ${isUpgrade ? 'upgrade' : ''}`}
                onClick={() => isUpgrade ? handleUpgradeClick(plan) : handleCheckout(plan)}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? t('subscription.currentPlan') : isUpgrade ? t('subscription.upgrade') : t('subscription.subscribeNow')}
              </button>
            </div>
          );
        })}
      </div>

      {showPaymentModal && selectedPlan && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h3>Upgrade to {selectedPlan.name}</h3>
              <button 
                className="close-button"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="payment-modal-content">
              <div className="plan-summary">
                <p>Annual Price: ${selectedPlan.price}</p>
                <p>Monthly Equivalent: ${selectedPlan.monthly_equivalent}</p>
              </div>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  planId={selectedPlan.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans; 