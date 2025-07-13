import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import './SubscriptionSuccess.css';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  console.log('🔍 SubscriptionSuccess: Component mounted');
  console.log('🔍 SubscriptionSuccess: Environment:', process.env.NODE_ENV);
  console.log('🔍 SubscriptionSuccess: Base URL:', window.location.origin);
  console.log('🔍 SubscriptionSuccess: Current path:', window.location.pathname);
  console.log('🔍 SubscriptionSuccess: Search params:', Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log('🔍 SubscriptionSuccess: Session ID from URL:', sessionId);
    console.log('🔍 SubscriptionSuccess: All search params:', Object.fromEntries(searchParams.entries()));
    
    if (!sessionId) {
      console.log('❌ SubscriptionSuccess: No session_id found, redirecting to /subscription');
      setDebugInfo(prev => ({ ...prev, noSessionId: true, redirecting: true }));
      navigate('/subscription');
      return;
    }

    setDebugInfo(prev => ({ ...prev, sessionId, verifying: true }));

    const verifySubscription = async () => {
      try {
        console.log('🔍 SubscriptionSuccess: Verifying subscription for session:', sessionId);
        console.log('🔍 SubscriptionSuccess: Making request to:', `/api/payments/subscriptions/${sessionId}/status/`);
        
        const token = localStorage.getItem('access');
        console.log('🔍 SubscriptionSuccess: JWT Token available:', !!token);
        console.log('🔍 SubscriptionSuccess: Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
        
        console.log('🔍 SubscriptionSuccess: Request headers:', {
          'Authorization': `Bearer ${token ? '***' : 'null'}`,
          'Content-Type': 'application/json'
        });
        
        const response = await axiosInstance.get(`/api/payments/subscriptions/${sessionId}/status/`);
        
        console.log('✅ SubscriptionSuccess: Subscription verification successful');
        console.log('🔍 SubscriptionSuccess: Response status:', response.status);
        console.log('🔍 SubscriptionSuccess: Response headers:', response.headers);
        console.log('🔍 SubscriptionSuccess: Response data:', response.data);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          verificationSuccess: true, 
          responseStatus: response.status,
          responseData: response.data 
        }));
        
        setSubscriptionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ SubscriptionSuccess: Error verifying subscription:', err);
        console.error('❌ SubscriptionSuccess: Error response:', err.response?.data);
        console.error('❌ SubscriptionSuccess: Error status:', err.response?.status);
        console.error('❌ SubscriptionSuccess: Error message:', err.message);
        console.error('❌ SubscriptionSuccess: Error config:', err.config);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          verificationError: true, 
          errorStatus: err.response?.status,
          errorMessage: err.message,
          errorData: err.response?.data,
          errorConfig: err.config
        }));
        
        setError('Failed to verify subscription status');
        setLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams, navigate]);

  console.log('🔍 SubscriptionSuccess: Render state:', {
    loading,
    error,
    subscriptionData: !!subscriptionData,
    debugInfo
  });

  if (loading) {
    console.log('🔍 SubscriptionSuccess: Showing loading spinner');
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="loading-spinner"></div>
          <h2>Verifying Subscription...</h2>
          <p>Please wait while we verify your subscription status.</p>
          
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
              <h4>🔧 Success Debug Info</h4>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    console.log('🔍 SubscriptionSuccess: Showing error message:', error);
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="error-icon">✗</div>
          <h2>Verification Failed</h2>
          <p>{error}</p>
          
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
              <h4>🔧 Success Debug Info</h4>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
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
  }

  console.log('🔍 SubscriptionSuccess: Rendering success page with data:', subscriptionData);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2>Subscription Activated!</h2>
        <p>Thank you for subscribing to our service.</p>
        
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
            <h4>🔧 Success Debug Info</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
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