import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../../../api/axios';
import './PaymentForm.css';

const PaymentForm = ({ planId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  console.log('🔍 PaymentForm: Component rendered with planId:', planId);
  console.log('🔍 PaymentForm: Stripe available:', !!stripe);
  console.log('🔍 PaymentForm: Elements available:', !!elements);
  console.log('🔍 PaymentForm: Stripe version:', stripe?.version);
  console.log('🔍 PaymentForm: Environment:', process.env.NODE_ENV);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('🔍 PaymentForm: Form submitted');
    console.log('🔍 PaymentForm: Plan ID:', planId);
    console.log('🔍 PaymentForm: Stripe object:', !!stripe);
    console.log('🔍 PaymentForm: Elements object:', !!elements);
    
    setLoading(true);
    setError(null);
    setDebugInfo({});

    if (!stripe || !elements) {
      console.error('❌ PaymentForm: Stripe or Elements not available');
      console.log('🔍 PaymentForm: Stripe:', !!stripe);
      console.log('🔍 PaymentForm: Elements:', !!elements);
      setError('Payment system not available. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      // Get the JWT token
      const token = localStorage.getItem('access');
      console.log('🔍 PaymentForm: JWT Token available:', !!token);
      console.log('🔍 PaymentForm: Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
      
      console.log('🔍 PaymentForm: Creating payment intent for planId:', planId);
      
      // Create payment intent on the server
      const requestData = { planId };
      console.log('🔍 PaymentForm: Request data:', requestData);
      console.log('🔍 PaymentForm: Request URL:', '/api/payments/create-payment-intent/');
      console.log('🔍 PaymentForm: Request headers:', {
        'Authorization': `Bearer ${token ? '***' : 'null'}`,
        'Content-Type': 'application/json'
      });

      setDebugInfo(prev => ({ ...prev, creatingIntent: true, requestData }));

      const { data: clientSecret } = await axiosInstance.post('/api/payments/create-payment-intent/', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ PaymentForm: Payment intent created successfully');
      console.log('🔍 PaymentForm: Client secret received:', clientSecret ? '***' : 'null');
      console.log('🔍 PaymentForm: Client secret type:', typeof clientSecret);
      console.log('🔍 PaymentForm: Client secret length:', clientSecret?.length || 0);

      setDebugInfo(prev => ({ ...prev, intentCreated: true, clientSecretReceived: !!clientSecret }));

      // Get card element
      const cardElement = elements.getElement(CardElement);
      console.log('🔍 PaymentForm: Card element available:', !!cardElement);
      console.log('🔍 PaymentForm: Card element type:', cardElement?.type);
      console.log('🔍 PaymentForm: Card element complete:', cardElement?.complete);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('🔍 PaymentForm: Confirming payment with Stripe');
      console.log('🔍 PaymentForm: Client secret format check:', clientSecret?.startsWith('pi_') || clientSecret?.startsWith('seti_'));
      
      setDebugInfo(prev => ({ ...prev, confirmingPayment: true }));
      
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Add billing details if needed
            },
          },
        }
      );

      console.log('🔍 PaymentForm: Stripe confirmation result:', {
        error: !!stripeError,
        paymentIntent: !!paymentIntent,
        status: paymentIntent?.status,
        id: paymentIntent?.id
      });

      if (stripeError) {
        console.error('❌ PaymentForm: Stripe error:', stripeError);
        console.error('❌ PaymentForm: Stripe error details:', {
          message: stripeError.message,
          code: stripeError.code,
          type: stripeError.type,
          decline_code: stripeError.decline_code,
          param: stripeError.param
        });
        
        setDebugInfo(prev => ({ 
          ...prev, 
          stripeError: true, 
          stripeErrorDetails: {
            message: stripeError.message,
            code: stripeError.code,
            type: stripeError.type,
            decline_code: stripeError.decline_code
          }
        }));
        
        setError(stripeError.message);
        onError?.(stripeError);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ PaymentForm: Payment successful!');
        console.log('🔍 PaymentForm: Payment intent details:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          created: paymentIntent.created,
          payment_method: paymentIntent.payment_method
        });
        
        setDebugInfo(prev => ({ 
          ...prev, 
          paymentSuccess: true, 
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status
          }
        }));
        
        // Payment successful
        onSuccess?.(paymentIntent);
      } else {
        console.warn('⚠️ PaymentForm: Payment intent status not succeeded:', paymentIntent.status);
        console.log('🔍 PaymentForm: Payment intent full object:', paymentIntent);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          paymentStatusUnexpected: true, 
          paymentStatus: paymentIntent.status,
          paymentIntent: paymentIntent
        }));
        
        setError(`Payment status: ${paymentIntent.status}`);
        onError?.({ message: `Payment status: ${paymentIntent.status}` });
      }
    } catch (err) {
      console.error('❌ PaymentForm: Error during payment:', err);
      console.error('❌ PaymentForm: Error response:', err.response?.data);
      console.error('❌ PaymentForm: Error status:', err.response?.status);
      console.error('❌ PaymentForm: Error message:', err.message);
      console.error('❌ PaymentForm: Error stack:', err.stack);
      console.error('❌ PaymentForm: Error config:', err.config);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        requestError: true, 
        errorStatus: err.response?.status,
        errorMessage: err.message,
        errorData: err.response?.data,
        errorConfig: err.config
      }));
      
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed';
      console.log('🔍 PaymentForm: Setting error message:', errorMessage);
      
      setError(errorMessage);
      onError?.(err);
    } finally {
      console.log('🔍 PaymentForm: Payment process completed, setting loading to false');
      setLoading(false);
    }
  };

  console.log('🔍 PaymentForm: Render state:', {
    loading,
    error,
    stripeAvailable: !!stripe,
    elementsAvailable: !!elements,
    debugInfo
  });

  return (
    <div className="payment-form-container">
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
          <h4>🔧 Payment Debug Info</h4>
          <div>Plan ID: {planId}</div>
          <div>Stripe Available: {!!stripe}</div>
          <div>Elements Available: {!!elements}</div>
          <div>Loading: {loading}</div>
          <div>Error: {error}</div>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label>Card Details</label>
          <div className="card-element-container">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="payment-button"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm; 