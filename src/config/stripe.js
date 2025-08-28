import { loadStripe } from '@stripe/stripe-js';

// Get Stripe key from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'your_publishable_key_here';

// Only load Stripe if we have a valid key
export const stripePromise = STRIPE_PUBLISHABLE_KEY !== 'your_publishable_key_here' 
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

// Export a flag to check if Stripe is configured
export const isStripeConfigured = STRIPE_PUBLISHABLE_KEY !== 'your_publishable_key_here'; 