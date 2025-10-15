import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../context/LanguageContext';
import axiosInstance from '../../../../api/axios';
import { FaCreditCard, FaHistory, FaCheck, FaCrown } from 'react-icons/fa';
import './BillingTab.css';

// Helper function to get fallback plans for Production Assets Pro
const getFallbackPlans = () => {
  // Return empty array - no hardcoded plans
  return [];
};

// Helper function to ensure all plans are available
const ensureAllPlansAvailable = (apiPlans) => {
  // If API returned plans, use ONLY API data (no fallback plans)
  if (apiPlans && apiPlans.length > 0) {
    console.log('🔍 BackgroundBillingTab: Using ONLY API plans (no fallback plans)');
    console.log('🔍 BackgroundBillingTab: API plans:', apiPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    
    // Return only API plans - no fallback plans added
    console.log('🔍 BackgroundBillingTab: Final plans (API only):', apiPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    return apiPlans;
  } else {
    console.log('⚠️ BackgroundBillingTab: No plans from API, returning empty array');
    return [];
  }
};

const BackgroundBillingTab = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isArabic = currentLanguage === 'ar';
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      // Get user type from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const isTalent = userInfo.is_talent;
      const isBackground = userInfo.is_background;
      
      console.log('🔍 Fetching all available Production Assets Pro plans...');
      console.log('🔍 User type - is_talent:', isTalent, 'is_background:', isBackground);
      
      // Use the new plans API with Arabic translations
      try {
        console.log('🔍 BackgroundBillingTab: Fetching plans from plans API with Arabic translations...');
        const response = await axiosInstance.get('/api/payments/plans/');
          
        // Handle the new plans API response structure with Arabic translations
        if (response.data && response.data.results) {
          console.log('🔍 BackgroundBillingTab: Found plans in response with Arabic translations...');
          const allPlansArray = response.data.results.map((plan) => ({
            id: plan.id,
            name: plan.name,
            display_name: plan.name,
            name_ar: plan.name_ar,
            description: plan.description,
            description_ar: plan.description_ar,
            price: parseFloat(plan.price),
            features: plan.features,
            features_ar: plan.features_ar,
            duration_months: plan.duration_months,
            stripe_price_id: plan.stripe_price_id,
            monthly_equivalent: plan.monthly_equivalent,
            is_active: plan.is_active
          }));
            
          // Filter plans for background users - show only Background Jobs Professional
          const filteredPlans = allPlansArray.filter(plan => 
            ['Background Jobs Professional', 'Background Jobs Professional Plan'].includes(plan.name)
          );
          console.log('🔍 BackgroundBillingTab: Filtered plans for background user:', filteredPlans.map(p => p.name));
          
          console.log('🔍 BackgroundBillingTab: Converted plans array:', filteredPlans);
          setPlans(filteredPlans);
          setLoading(false);
          return; // Exit early since we got the data
        }
      } catch (err) {
        console.log('⚠️ BackgroundBillingTab: Plans API call failed:', err.message);
        setPlans([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Error fetching Production Assets Pro plans:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      setError('Failed to load subscription plans');
      setPlans([]);
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      // Try multiple endpoints for background user subscription data
      const endpoints = [
        '/api/profile/background/',
        '/api/profile/',
        '/api/payments/subscriptions/'
      ];
      
      let response = null;
      let lastError = null;
      
      let successfulEndpoint = null;
      
      // Try each endpoint until one succeeds
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 BackgroundBillingTab: Trying endpoint: ${endpoint}`);
          response = await axiosInstance.get(endpoint);
          console.log(`✅ BackgroundBillingTab: Success with endpoint: ${endpoint}`);
          successfulEndpoint = endpoint;
          break;
        } catch (err) {
          console.error(`❌ BackgroundBillingTab: Error with endpoint ${endpoint}:`, err);
          lastError = err;
        }
      }
      
      if (!response) {
        console.log('⚠️ BackgroundBillingTab: All endpoints failed, setting subscription to null');
        setCurrentSubscription(null);
        return;
      }
      
      console.log('📥 BackgroundBillingTab: API response:', response.data);
      
      // Handle different response structures
      if (successfulEndpoint === '/api/payments/subscriptions/') {
        // Direct subscriptions endpoint
        if (response.data.length > 0) {
          const activeSubscriptions = response.data.filter(sub => sub.is_active);
          if (activeSubscriptions.length > 0) {
            setCurrentSubscription(activeSubscriptions[0]);
            console.log('✅ BackgroundBillingTab: Set subscription from direct endpoint:', activeSubscriptions[0]);
          } else {
            setCurrentSubscription(null);
          }
        } else {
          setCurrentSubscription(null);
        }
      } else {
        // Profile endpoint - extract subscription data
        const subscriptionStatus = response.data.subscription_status;
        const endDate = response.data.end_date;
        
        if (subscriptionStatus && subscriptionStatus.has_subscription) {
          const subscriptionData = {
            ...subscriptionStatus.subscription,
            current_period_end: endDate || subscriptionStatus.subscription?.current_period_end || subscriptionStatus.subscription?.end_date || subscriptionStatus.subscription?.plan_end
          };
          
          console.log('✅ BackgroundBillingTab: Setting current subscription from profile:', subscriptionData);
          setCurrentSubscription(subscriptionData);
        } else {
          console.log('❌ BackgroundBillingTab: No subscription found in profile, setting to null');
          setCurrentSubscription(null);
        }
      }
    } catch (err) {
      console.error('❌ BackgroundBillingTab: Error fetching current subscription:', err);
      setCurrentSubscription(null);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      console.log('Plan data being sent:', plan);
      
      console.log('Using centralized axios instance');
      
      // Use uppercase plan name as per API example
      const planId = plan.name.toUpperCase();
      
      const requestData = {
        plan_id: planId,
        success_url: `${window.location.origin}/account?tab=billing`,
        cancel_url: `${window.location.origin}/account?tab=billing`
      };
      
      console.log('Request data being sent:', requestData);
      console.log('API URL:', '/api/payments/create-checkout-session/');
      
      // Get the JWT token
      const token = localStorage.getItem('access');
      console.log('JWT Token available:', !!token);
      
      const response = await axiosInstance.post('/api/payments/create-checkout-session/', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Checkout response:', response.data);
      
      if (response.data && response.data.url) {
        sessionStorage.setItem('pendingSubscription', planId);
        window.location.href = response.data.url;
      } else {
        setError('Checkout response missing redirect URL');
        console.error('Missing URL in response:', response.data);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      
      if (err.response) {
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
        
        let errorMessage = `Checkout error (${err.response.status})`;
        
        if (err.response.status === 403 || err.response.data.detail?.includes('credentials')) {
          errorMessage = 'Authentication error. Please log out and log back in.';
        } else if (err.response.data.error === 'Invalid plan ID') {
          errorMessage = 'Unable to process this subscription plan. Please contact support.';
        } else if (err.response.data.error) {
          errorMessage = `Error: ${err.response.data.error}`;
        } else if (err.response.data.detail) {
          errorMessage = `Error: ${err.response.data.detail}`;
        } else {
          errorMessage = `${errorMessage}: ${JSON.stringify(err.response.data)}`;
        }
        
        setError(errorMessage);
      } else if (err.request) {
        console.log('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  // Transform plan names for display
  const getDisplayPlanName = (planName) => {
    if (!planName) return '';
    
    const name = planName.toLowerCase();
    if (name === 'background_jobs' || name === 'background') {
      return 'Production Assets Pro';
    }
    
    // Handle other plan name transformations if needed
    if (name === 'back_ground_jobs') {
      return 'Production Assets Pro';
    }
    
    // Return original name with proper capitalization for other plans
    return planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
  };

  // Get default features based on plan type
  const getDefaultFeatures = (planName) => {
    const name = (planName || '').toLowerCase();
    if (name.includes('basic') || name.includes('starter') || name.includes('silver')) {
      return [
        'Up to 10 Production Assets Pro items',
        'Basic AI Production Assets Generation',
        '5GB Storage',
        'Email Support'
      ];
    } else if (name.includes('pro') || name.includes('professional') || name.includes('gold')) {
      return [
        'Unlimited Production Assets Pro items',
        'Advanced AI Production Assets Generation',
        '20GB Storage',
        'Priority Support',
        'Custom Branding'
      ];
    } else if (name.includes('enterprise') || name.includes('premium') || name.includes('platinum')) {
      return [
        'Unlimited Everything',
        'Enterprise AI Features',
        '100GB Storage',
        '24/7 Dedicated Support',
        'API Access',
        'Custom Integration'
      ];
    } else if (name.includes('bands')) {
      return [
        'Special band profile layout',
        'Upload up to 5 band pictures',
        'Upload up to 5 band videos',
        'Band member management',
        'Event calendar integration',
        'Priority booking requests',
        'Dedicated band support'
      ];
    }
    return [
      'Up to 5 Production Assets Pro items',
      'Basic AI Production Assets Generation',
      '1GB Storage',
      'Community Support'
    ];
  };

  // Ensure the subscribed plan is always available
  const ensureSubscribedPlanAvailable = (apiPlans, subscription) => {
    console.log('🔍 BackgroundBillingTab: ensureSubscribedPlanAvailable called with:', { apiPlans, subscription });
    
    if (!subscription || !subscription.plan) {
      console.log('⚠️ BackgroundBillingTab: No subscription or plan found, returning original plans');
      return apiPlans;
    }
    
    const subscribedPlanId = subscription.plan;
    const subscribedPlanName = subscription.plan_name;
    
    console.log('🔍 BackgroundBillingTab: Looking for subscribed plan:', { subscribedPlanId, subscribedPlanName });
    console.log('🔍 BackgroundBillingTab: Available API plans:', apiPlans.map(p => ({ id: p.id, name: p.name })));
    
    // Check if the subscribed plan is already in the API plans
    const hasSubscribedPlan = apiPlans.some(plan => plan.id === subscribedPlanId);
    
    if (hasSubscribedPlan) {
      console.log('✅ BackgroundBillingTab: Subscribed plan found in API plans');
      return apiPlans;
    }
    
    console.log('⚠️ BackgroundBillingTab: Subscribed plan not found in API plans, adding it');
    
    // Create a plan object for the subscribed plan
    const subscribedPlan = {
      id: subscribedPlanId,
      name: subscribedPlanName,
      price: subscription.plan_price || "0.00",
      features: getDefaultFeatures(subscribedPlanName),
      is_active: true,
      is_subscribed: true // Mark this as the subscribed plan
    };
    
    console.log('🔍 BackgroundBillingTab: Created subscribed plan object:', subscribedPlan);
    
    // Add the subscribed plan to the beginning of the plans array
    const enhancedPlans = [subscribedPlan, ...apiPlans];
    console.log('🔍 BackgroundBillingTab: Enhanced plans result:', enhancedPlans.map(p => ({ id: p.id, name: p.name })));
    
    return enhancedPlans;
  };

  // Get current plan object by matching subscription with available plans
  const getCurrentPlan = (availablePlans) => {
    if (!currentSubscription || !availablePlans || !availablePlans.length) return null;
    
    // Try different ways to match the plan
    const subscriptionPlanId = currentSubscription.plan_id || currentSubscription.plan;
    const subscriptionPlanName = currentSubscription.plan_name || currentSubscription.plan?.name;
    
    console.log('🔍 BackgroundBillingTab: Looking for plan with ID:', subscriptionPlanId, 'or name:', subscriptionPlanName);
    
    // First try to match by ID
    if (subscriptionPlanId) {
      const matchedPlan = availablePlans.find(plan => plan.id === subscriptionPlanId);
      if (matchedPlan) {
        console.log('✅ BackgroundBillingTab: Found plan by ID:', matchedPlan);
        return matchedPlan;
      }
    }
    
    // Then try to match by name
    if (subscriptionPlanName) {
      const matchedPlan = availablePlans.find(plan => 
        plan.name.toLowerCase() === subscriptionPlanName.toLowerCase() ||
        plan.display_name?.toLowerCase() === subscriptionPlanName.toLowerCase()
      );
      if (matchedPlan) {
        console.log('✅ BackgroundBillingTab: Found plan by name:', matchedPlan);
        return matchedPlan;
      }
    }
    
    console.log('❌ BackgroundBillingTab: No matching plan found');
    return null;
  };

  const enhancedPlans = ensureSubscribedPlanAvailable(plans, currentSubscription);

  // Get current plan features
  const getCurrentPlanFeatures = () => {
    const currentPlan = getCurrentPlan(enhancedPlans);
    
    console.log('🎯 Getting features for current plan:', currentPlan);
    
    if (currentPlan) {
      // Use the plan's features if available
      if (currentPlan.features && Array.isArray(currentPlan.features)) {
        console.log('✅ Using plan features:', currentPlan.features);
        return currentPlan.features;
      }
      
      // Fallback to default features based on plan name
      const planName = currentPlan.name?.toLowerCase() || '';
      console.log('📝 Using default features for plan:', planName);
      
      if (planName.includes('basic')) {
        return [
          'Up to 10 Production Assets Pro items',
          'Basic AI Production Assets Generation',
          '5GB Storage',
          'Email Support'
        ];
      } else if (planName.includes('pro')) {
        return [
          'Unlimited Production Assets Pro items',
          'Advanced AI Production Assets Generation',
          '20GB Storage',
          'Priority Support',
          'Custom Branding'
        ];
      } else if (planName.includes('enterprise')) {
        return [
          'Unlimited Everything',
          'Enterprise AI Features',
          '100GB Storage',
          '24/7 Dedicated Support',
          'API Access',
          'Custom Integration'
        ];
      }
    }
    
    console.log('🆓 Using free plan features');
    // Default free plan features
    return [
      'Up to 5 Production Assets Pro items',
      'Basic AI Production Assets Generation',
      '1GB Storage',
      'Community Support'
    ];
  };

  if (loading) {
    return (
      <div className="content-section">
        <h1 className="section-title">Production Assets Pro Plans</h1>
        
        {/* Skeleton for current plan */}
        <div className="current-plan loading">
          <div className="plan-icon loading-icon"></div>
          <div className="plan-info">
            <div className="loading-text" style={{ width: '200px', height: '24px' }}></div>
            <div className="loading-text" style={{ width: '150px', height: '16px' }}></div>
          </div>
        </div>

        {/* Skeleton for plan cards */}
        <div className="plans-container">
          {[1, 2, 3].map((index) => (
            <div key={index} className="pricing-card loading">
              <div className="loading-text" style={{ width: '120px', height: '28px', marginBottom: '10px' }}></div>
              <div className="loading-text" style={{ width: '80%', height: '16px', marginBottom: '20px' }}></div>
              
              <div className="price-info">
                <div className="loading-text" style={{ width: '100px', height: '32px' }}></div>
              </div>

              <div className="loading-text" style={{ width: '80%', height: '40px', margin: '20px 0' }}></div>

              <div className="features-list">
                {[1, 2, 3, 4].map((featureIndex) => (
                  <div key={featureIndex} className="feature-item loading">
                    <div className="loading-text" style={{ width: '80%', height: '16px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to static content if no plans are found
  const displayPlans = plans.length > 0 ? plans : [];

  return (
    <div className="content-section">
      <h1 className="section-title">{t('billing.productionAssetsProPlans')}</h1>
      {error && <div className="error-message">{error}</div>}
      
      {/* Restricted Countries Notice */}
      <div className="restricted-countries-notice">
        <div className="notice-header">
          <h3>🌍 {t('billing.restrictedCountriesNotice')}</h3>
        </div>
        <div className="notice-content">
          <p><strong>{t('billing.restrictedCountries')}:</strong> Syria, Iran, North Korea, Cuba, Venezuela, Sudan, Myanmar, Belarus, Russia, Crimea, Donetsk, Luhansk, Afghanistan, Yemen, Libya, Iraq, Somalia, Central African Republic, Democratic Republic of the Congo, South Sudan, Eritrea, Burundi, Zimbabwe, Mali, Burkina Faso, Niger, Chad, Guinea-Bissau, Guinea, Sierra Leone, Liberia, Comoros, Madagascar, Mauritania, Western Sahara</p>
          <p>{t('billing.restrictedCountriesMessage')}</p>
          <div className="contact-email">
            <strong>📧 {t('billing.contactUs')}:</strong> <a href="mailto:info@gan7club.com">info@gan7club.com</a>
          </div>
        </div>
      </div>

      {currentSubscription ? (
        <div className="current-plan">
          <FaCrown className="plan-icon pulse" />
          <div className="plan-info">
            <h3>{t('billing.currentPlan')}: {getDisplayPlanName(getCurrentPlan(enhancedPlans)?.name) || getCurrentPlan(enhancedPlans)?.display_name || t('billing.activePlan')}</h3>
            <div className="end-date">
              <p><strong>{t('billing.validUntil')}:</strong> {new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
            </div>
            <div className="plan-status">
              <span className="status-dot"></span>
              {t('billing.active')}
            </div>
          </div>
        </div>
      ) : (
        <div className="current-plan">
          <FaCrown className="plan-icon" />
          <div className="plan-info">
            <h3>{t('billing.currentPlan')}: {t('billing.free')}</h3>
            <p>{t('billing.basicFeatures')}</p>
            <div className="plan-status free">
              <span className="status-dot"></span>
              {t('billing.freePlan')}
            </div>
          </div>
        </div>
      )}

      <div className="plans-container">
        {displayPlans.length > 0 ? (
          displayPlans.map((plan) => {
            const currentPlan = getCurrentPlan(enhancedPlans);
            const isCurrentPlan = currentPlan?.id === plan.id;
            return (
              <div 
                key={plan.id} 
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.premium ? 'premium' : ''}`}
              >
                {plan.popular && <div className="popular-badge">{isArabic ? "الأكثر شعبية" : "MOST POPULAR"}</div>}
                <h3>
                  {isArabic && plan.name_ar ? plan.name_ar : getDisplayPlanName(plan.name)}
                </h3>
                <p>{isArabic && plan.description_ar ? plan.description_ar : plan.description}</p>
            
                <div className="price-info">
                  <div className="current-price">
                    <span className="currency">US$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">{isArabic ? "شهرياً" : "/mo"}</span>
                  </div>
                  {isCurrentPlan && (
                    <div className="current-plan-marker">
                      <FaCheck /> {isArabic ? "الخطة الحالية" : "Current Plan"}
                    </div>
                  )}
                </div>

                <button 
                  className={`choose-plan ${isCurrentPlan ? 'active' : ''}`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan}
                >
                  <span className="button-text">
                    {isCurrentPlan 
                      ? (isArabic ? "الخطة الحالية" : t('billing.currentPlanButton'))
                      : (isArabic 
                          ? `ترقية إلى ${plan.name_ar || getDisplayPlanName(plan.name)}`
                          : t('billing.upgradeTo', { plan: getDisplayPlanName(plan.name) })
                        )
                    }
                  </span>
                </button>

                <div className="features-list">
                  {(plan.features || getDefaultFeatures(plan.name)).map((feature, index) => {
                    // Use Arabic features if available and language is Arabic
                    const featureText = isArabic && plan.features_ar && plan.features_ar[index] 
                      ? plan.features_ar[index] 
                      : feature;
                    return (
                      <div key={index} className="feature-item">
                        <FaCheck className="feature-icon" /> 
                        <span className="feature-text">{featureText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-plans-message">
            <p>{isArabic ? "لا توجد خطط أصول الإنتاج المتاحة في الوقت الحالي." : "No Production Assets Pro plans available at the moment."}</p>
            <p>{isArabic ? "يرجى الاتصال بالدعم لمزيد من المعلومات." : "Please contact support for more information."}</p>
          </div>
        )}
      </div>

      <div className="current-plan-features">
        <h3>
          <FaCrown className="section-icon" />
          {t('billing.currentPlan')}: {getDisplayPlanName(getCurrentPlan(enhancedPlans)?.name) || getCurrentPlan(enhancedPlans)?.display_name || t('billing.free')} {t('billing.features')}
        </h3>
        <div className="features-list highlight">
          {getCurrentPlanFeatures().map((feature, index) => (
            <div key={index} className="feature-item">
              <FaCheck className="feature-icon" />
              <span className="feature-text">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export default BackgroundBillingTab;