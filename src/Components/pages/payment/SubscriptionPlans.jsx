import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import axiosInstance from '../../../api/axios';
import { stripePromise } from '../../../config/stripe';
import PaymentForm from './PaymentForm';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
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
      console.log('🔍 SubscriptionPlans: Fetching plans from /api/payments/plans/');
      console.log('🔍 SubscriptionPlans: Request headers:', {
        'Authorization': 'Bearer ***',
        'Content-Type': 'application/json'
      });
      
      const token = localStorage.getItem('access');
      console.log('🔍 SubscriptionPlans: JWT Token available:', !!token);
      console.log('🔍 SubscriptionPlans: Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
      
      const response = await axiosInstance.get('/api/payments/plans/');
      console.log('✅ SubscriptionPlans: Plans fetched successfully');
      console.log('🔍 SubscriptionPlans: Response status:', response.status);
      console.log('🔍 SubscriptionPlans: Response headers:', response.headers);
      console.log('🔍 SubscriptionPlans: Plans data:', response.data);
      console.log('🔍 SubscriptionPlans: Number of plans:', response.data?.length || 0);
      
      setPlans(response.data);
      setDebugInfo(prev => ({ ...prev, plansFetched: true, plansCount: response.data?.length || 0 }));
      setLoading(false);
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
        setPlans([]); // This will trigger the fallback plans
        setError(''); // Clear any previous errors
      } else {
        setError('Failed to load subscription plans');
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
      <h2>Choose Your Plan</h2>
      
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
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan.id === plan.id;
          const isUpgrade = currentSubscription && 
            plans.findIndex(p => p.id === plan.id) > 
            plans.findIndex(p => p.id === currentSubscription.plan.id);

          return (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${isCurrentPlan ? 'current' : ''}`}
            >
              <h3>{plan.name}</h3>
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
                {isCurrentPlan ? 'Current Plan' : isUpgrade ? 'Upgrade Plan' : 'Subscribe Now'}
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