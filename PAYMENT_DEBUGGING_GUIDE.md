# 🔧 Payment & Subscription Debugging Guide

## Overview

This guide provides comprehensive debugging information for the payment and subscription system. The system includes detailed logging, debug panels, and centralized debugging utilities to help identify and resolve issues.

## 🚀 Quick Start

### Enable Debug Mode

1. **Development Mode**: Debugging is automatically enabled in development
2. **Production Mode**: Enable by running in browser console:
   ```javascript
   localStorage.setItem('payment_debug', 'true');
   location.reload();
   ```

### Disable Debug Mode

```javascript
localStorage.removeItem('payment_debug');
location.reload();
```

## 📋 Debug Components

### 1. SubscriptionPlans Component
- **Location**: `src/Components/pages/payment/SubscriptionPlans.jsx`
- **Purpose**: Displays subscription plans and handles checkout creation
- **Key Debug Points**:
  - Plans fetching from `/api/payments/plans/`
  - Current subscription fetching from `/payments/subscriptions/`
  - Checkout session creation
  - Payment modal handling

### 2. PaymentForm Component
- **Location**: `src/Components/pages/payment/PaymentForm.jsx`
- **Purpose**: Handles Stripe payment processing
- **Key Debug Points**:
  - Payment intent creation
  - Stripe Elements integration
  - Card payment confirmation
  - Error handling

### 3. SubscriptionSuccess Component
- **Location**: `src/Components/pages/payment/SubscriptionSuccess.jsx`
- **Purpose**: Verifies subscription after payment
- **Key Debug Points**:
  - Session ID extraction from URL
  - Subscription verification
  - Success/error state handling

### 4. BillingTab Components
- **Locations**: 
  - `src/Components/pages/useraccount/components/BillingTab.jsx`
  - `src/Components/pages/useraccount/components/BackgroundBillingTab.jsx`
- **Purpose**: Account billing management
- **Key Debug Points**:
  - Plan fetching and display
  - Subscription status
  - Checkout flow integration

## 🔍 Debug Information Available

### Console Logging
All components use emoji-prefixed logging for easy identification:
- 🔍 Info messages
- ✅ Success messages
- ⚠️ Warning messages
- ❌ Error messages
- 🔧 Debug messages

### Debug Panels
In development mode, each component displays a debug panel showing:
- Current state
- API request/response data
- Error information
- Stripe operation details
- Authentication status

### Centralized Debug Utility
**Location**: `src/utils/paymentDebugger.js`

Provides centralized debugging functions:
```javascript
import { 
  logRequest, 
  logResponse, 
  logError, 
  logStripe, 
  logStage,
  getDebugInfo,
  createDebugPanel 
} from '../utils/paymentDebugger';
```

## 🛠️ Common Issues & Solutions

### 1. Plans Not Loading (404 Error)
**Symptoms**: Plans section shows loading or error
**Debug Steps**:
1. Check console for API request logs
2. Verify endpoint `/api/payments/plans/` exists
3. Check authentication token
4. Review network tab for request details

**Solutions**:
- Ensure backend API endpoint is implemented
- Verify JWT token is valid
- Check CORS configuration

### 2. Checkout Session Creation Fails
**Symptoms**: "Subscribe Now" button doesn't work
**Debug Steps**:
1. Check console for checkout request logs
2. Verify plan data being sent
3. Check authentication headers
4. Review API response

**Solutions**:
- Ensure plan_id format matches backend expectations
- Verify JWT token in Authorization header
- Check backend checkout session endpoint

### 3. Stripe Payment Fails
**Symptoms**: Payment form shows errors
**Debug Steps**:
1. Check Stripe Elements loading
2. Verify payment intent creation
3. Review Stripe confirmation logs
4. Check card details format

**Solutions**:
- Ensure Stripe is properly configured
- Verify payment intent endpoint
- Check Stripe test keys in production

### 4. Subscription Verification Fails
**Symptoms**: Success page shows verification error
**Debug Steps**:
1. Check session_id in URL
2. Verify verification endpoint
3. Review API response
4. Check authentication

**Solutions**:
- Ensure session_id is passed correctly
- Verify verification endpoint exists
- Check JWT token validity

### 5. CORS Issues
**Symptoms**: Network errors in console
**Debug Steps**:
1. Check request origin
2. Verify proxy configuration
3. Review backend CORS settings
4. Check deployment configuration

**Solutions**:
- Update proxy configuration in deployment files
- Configure backend CORS headers
- Use relative URLs in frontend

## 📊 Debug Data Structure

### API Request Logging
```javascript
{
  endpoint: '/api/payments/plans/',
  method: 'GET',
  data: null,
  headers: {
    'Authorization': 'Bearer ***',
    'Content-Type': 'application/json'
  },
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

### API Response Logging
```javascript
{
  endpoint: '/api/payments/plans/',
  status: 200,
  data: [...plans],
  headers: {...},
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

### Error Logging
```javascript
{
  message: 'Request failed',
  status: 400,
  data: { error: 'Invalid plan ID' },
  context: 'checkout_creation',
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

### Stripe Operation Logging
```javascript
{
  operation: 'confirmCardPayment',
  data: {
    paymentIntent: { id: 'pi_...', status: 'succeeded' }
  },
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

## 🔧 Debug Commands

### Browser Console Commands

**Enable Debug Mode**:
```javascript
localStorage.setItem('payment_debug', 'true');
location.reload();
```

**View All Debug Info**:
```javascript
import paymentDebugger from './src/utils/paymentDebugger';
console.log(paymentDebugger.getAllDebugInfo());
```

**Clear Debug Info**:
```javascript
import paymentDebugger from './src/utils/paymentDebugger';
paymentDebugger.clearDebugInfo();
```

**Create Debug Summary**:
```javascript
import paymentDebugger from './src/utils/paymentDebugger';
paymentDebugger.createSummary();
```

### Network Debugging

**Check API Endpoints**:
```bash
# Test plans endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.gan7club.com/api/payments/plans/

# Test checkout endpoint
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"plan_id":"SILVER","success_url":"https://gan7club.com/success","cancel_url":"https://gan7club.com/cancel"}' \
     https://api.gan7club.com/api/payments/create-checkout-session/
```

## 🚨 Error Codes & Meanings

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (check request data)
- **401**: Unauthorized (check JWT token)
- **403**: Forbidden (check permissions)
- **404**: Not Found (check endpoint URL)
- **500**: Server Error (check backend logs)

### Stripe Error Codes
- **card_declined**: Card was declined
- **expired_card**: Card has expired
- **incorrect_cvc**: CVC is incorrect
- **processing_error**: Processing error occurred
- **insufficient_funds**: Insufficient funds

## 📝 Debug Checklist

### Before Testing
- [ ] Debug mode enabled
- [ ] Console open
- [ ] Network tab open
- [ ] Authentication token valid
- [ ] Backend API running

### During Testing
- [ ] Monitor console logs
- [ ] Check network requests
- [ ] Verify API responses
- [ ] Test error scenarios
- [ ] Validate user feedback

### After Testing
- [ ] Review debug panels
- [ ] Check error logs
- [ ] Verify data consistency
- [ ] Test edge cases
- [ ] Document findings

## 🔗 Related Files

- `src/Components/pages/payment/SubscriptionPlans.jsx`
- `src/Components/pages/payment/PaymentForm.jsx`
- `src/Components/pages/payment/SubscriptionSuccess.jsx`
- `src/Components/pages/useraccount/components/BillingTab.jsx`
- `src/Components/pages/useraccount/components/BackgroundBillingTab.jsx`
- `src/utils/paymentDebugger.js`
- `src/api/axios.js`
- `src/config/stripe.js`

## 📞 Support

For additional debugging support:
1. Check browser console for detailed logs
2. Review network tab for API requests
3. Use debug panels in development mode
4. Enable debug mode in production if needed
5. Check backend logs for server-side issues 