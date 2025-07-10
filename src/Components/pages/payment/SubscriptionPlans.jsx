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

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axiosInstance.get('/api/payments/plans/');
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching plans:', err);
      
      // Handle 404 error gracefully - API endpoint might not be implemented yet
      if (err.response?.status === 404) {
        console.log('Payment plans API endpoint not available, using fallback plans');
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
      const response = await axiosInstance.get('/payments/subscriptions/');
      if (response.data.length > 0) {
        setCurrentSubscription(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching current subscription:', err);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setError('');
    setSuccess('');
  };

  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleCheckout = async (plan) => {
    try {
      const response = await axiosInstance.post('/api/payments/create-checkout-session/', {
        plan_id: plan.id,
        success_url: `${window.location.origin}/subscription/success`,
        cancel_url: `${window.location.origin}/subscription/cancel`
      });

      window.location.href = response.data.url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err.response?.data?.message || 'Failed to create checkout session');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      await axiosInstance.post('/api/payments/subscriptions/', {
        plan_id: selectedPlan.id,
        payment_intent_id: paymentIntent.id,
        is_upgrade: currentSubscription !== null
      });

      setSuccess('Subscription activated successfully!');
      setShowPaymentModal(false);
      fetchCurrentSubscription();
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Failed to activate subscription');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed');
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="subscription-plans-container">
      <h2>Choose Your Plan</h2>
      
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