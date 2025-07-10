import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../../../api/axios';
import './PaymentForm.css';

const PaymentForm = ({ planId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Get the JWT token
      const token = localStorage.getItem('access');
      console.log('JWT Token available for payment intent:', !!token);
      
      // Create payment intent on the server
      const { data: clientSecret } = await axiosInstance.post('/api/payments/create-payment-intent/', { planId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              // Add billing details if needed
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        onError?.(stripeError);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
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