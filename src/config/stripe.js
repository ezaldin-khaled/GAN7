import { loadStripe } from '@stripe/stripe-js';

// Replace with your publishable key from Stripe dashboard
const STRIPE_PUBLISHABLE_KEY = 'your_publishable_key_here';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY); 