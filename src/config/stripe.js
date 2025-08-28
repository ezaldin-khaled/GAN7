// Get Stripe key from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'your_publishable_key_here';

// Export a flag to check if Stripe is configured
export const isStripeConfigured = STRIPE_PUBLISHABLE_KEY !== 'your_publishable_key_here';

// Lazy load Stripe only when needed to avoid unnecessary cookie warnings
export const stripePromise = isStripeConfigured 
  ? (async () => {
      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        console.log('🔒 Loading Stripe with key:', STRIPE_PUBLISHABLE_KEY.substring(0, 7) + '...');
        return await loadStripe(STRIPE_PUBLISHABLE_KEY);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        return null;
      }
    })()
  : Promise.resolve(null); 