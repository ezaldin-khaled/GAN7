import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './SubscriptionSuccess.css';

const API_URL = 'http://192.168.0.107:8000/';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      navigate('/subscription');
      return;
    }

    const verifySubscription = async () => {
      try {d
        const response = await axios.get(
          `${API_URL}api/payments/subscriptions/${sessionId}/status/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access')}`,
            },
          }
        );
        setSubscriptionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError('Failed to verify subscription status');
        setLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams, navigate]);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2>Subscription Activated!</h2>
        <p>Thank you for subscribing to our service.</p>
        
        {subscriptionData && (
          <div className="subscription-details">
            <h3>Your Subscription Details</h3>
            <div className="detail-item">
              <span>Plan:</span>
              <span>{subscriptionData.plan}</span>
            </div>
            <div className="detail-item">
              <span>Status:</span>
              <span className={`status ${subscriptionData.status}`}>
                {subscriptionData.status}
              </span>
            </div>
            <div className="detail-item">
              <span>Valid Until:</span>
              <span>{new Date(subscriptionData.current_period_end).toLocaleDateString()}</span>
            </div>
            {subscriptionData.plan_end && (
              <div className="detail-item">
                <span>Plan Ends:</span>
                <span>{new Date(subscriptionData.plan_end).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button
            className="primary-button"
            onClick={() => navigate('/account')}
          >
            Go to Account
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate('/subscription')}
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess; 