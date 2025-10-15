import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axios';
import './ArabicIntegrationTest.css';

const ArabicIntegrationTest = () => {
  const { currentLanguage, toggleLanguage } = useLanguage();
  const isArabic = currentLanguage === 'ar';
  const [profileScore, setProfileScore] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 ArabicIntegrationTest: Fetching data...');
      
      // Fetch profile score
      try {
        const profileResponse = await axiosInstance.get('/api/users/profile-score/');
        console.log('✅ ArabicIntegrationTest: Profile score fetched:', profileResponse.data);
        setProfileScore(profileResponse.data);
      } catch (err) {
        console.log('⚠️ ArabicIntegrationTest: Profile score API not available, using mock data');
        setProfileScore({
          total: 85,
          details: "Your overall profile strength",
          improvement_tips: "Complete your profile information and add more media to improve your score.",
          details_ar: "قوة ملفك الشخصي الإجمالية",
          improvement_tips_ar: "أكمل معلومات ملفك الشخصي وأضف المزيد من الوسائط لتحسين درجتك."
        });
      }

      // Fetch subscription plans
      try {
        const plansResponse = await axiosInstance.get('/api/payments/pricing/');
        console.log('✅ ArabicIntegrationTest: Plans fetched:', plansResponse.data);
        if (plansResponse.data.subscription_plans) {
          const plansArray = Object.entries(plansResponse.data.subscription_plans).map(([key, plan], index) => ({
            id: index + 1,
            name: key,
            display_name: plan.name,
            name_ar: plan.name_ar,
            price: parseFloat(plan.price),
            features: plan.features,
            features_ar: plan.features_ar,
            monthly_equivalent: plan.monthly_equivalent
          }));
          setSubscriptionPlans(plansArray);
        }
      } catch (err) {
        console.log('⚠️ ArabicIntegrationTest: Plans API not available, using mock data');
        setSubscriptionPlans([
          {
            id: 1,
            name: 'SILVER',
            display_name: 'Silver Plan',
            name_ar: 'الخطة الفضية',
            price: 29.99,
            features: ['Basic features', 'Standard support'],
            features_ar: ['ميزات أساسية', 'دعم قياسي'],
            monthly_equivalent: 2.50
          },
          {
            id: 2,
            name: 'GOLD',
            display_name: 'Gold Plan',
            name_ar: 'الخطة الذهبية',
            price: 59.99,
            features: ['Advanced features', 'Priority support'],
            features_ar: ['ميزات متقدمة', 'دعم أولوي'],
            monthly_equivalent: 5.00
          }
        ]);
      }
    } catch (err) {
      console.error('❌ ArabicIntegrationTest: Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="arabic-test-container">
        <div className="loading-spinner">
          {isArabic ? "جاري التحميل..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="arabic-test-container">
      <div className="test-header">
        <h1>{isArabic ? "اختبار التكامل العربي" : "Arabic Integration Test"}</h1>
        <button 
          className="language-toggle-btn"
          onClick={toggleLanguage}
        >
          {isArabic ? "English" : "العربية"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Profile Score Test */}
      <div className="test-section">
        <h2>{isArabic ? "اختبار درجة الملف الشخصي" : "Profile Score Test"}</h2>
        {profileScore && (
          <div className="profile-score-demo">
            <div className="score-display">
              <h3>{isArabic ? "الدرجة الإجمالية" : "Overall Score"}</h3>
              <div className="score-value">{profileScore.total}/100</div>
              <div className="score-details">
                <p><strong>{isArabic ? "التفاصيل:" : "Details:"}</strong></p>
                <p>{isArabic ? profileScore.details_ar : profileScore.details}</p>
                <p><strong>{isArabic ? "نصائح التحسين:" : "Improvement Tips:"}</strong></p>
                <p>{isArabic ? profileScore.improvement_tips_ar : profileScore.improvement_tips}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Plans Test */}
      <div className="test-section">
        <h2>{isArabic ? "اختبار خطط الاشتراك" : "Subscription Plans Test"}</h2>
        <div className="plans-demo">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="plan-demo-card">
              <h3>
                {isArabic && plan.name_ar ? plan.name_ar : plan.display_name}
              </h3>
              <div className="plan-price">
                ${plan.price} {isArabic ? "سنوياً" : "per year"}
                <br />
                ${plan.monthly_equivalent} {isArabic ? "شهرياً" : "per month"}
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, index) => {
                  const featureText = isArabic && plan.features_ar && plan.features_ar[index] 
                    ? plan.features_ar[index] 
                    : feature;
                  return <li key={index}>{featureText}</li>;
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* API Data Display */}
      <div className="test-section">
        <h2>{isArabic ? "بيانات API" : "API Data"}</h2>
        <div className="api-data-display">
          <h3>{isArabic ? "بيانات درجة الملف الشخصي:" : "Profile Score Data:"}</h3>
          <pre>{JSON.stringify(profileScore, null, 2)}</pre>
          
          <h3>{isArabic ? "بيانات خطط الاشتراك:" : "Subscription Plans Data:"}</h3>
          <pre>{JSON.stringify(subscriptionPlans, null, 2)}</pre>
        </div>
      </div>

      {/* Language Status */}
      <div className="test-section">
        <h2>{isArabic ? "حالة اللغة" : "Language Status"}</h2>
        <div className="language-status">
          <p><strong>{isArabic ? "اللغة الحالية:" : "Current Language:"}</strong> {currentLanguage}</p>
          <p><strong>{isArabic ? "اتجاه النص:" : "Text Direction:"}</strong> {isArabic ? "RTL (من اليمين إلى اليسار)" : "LTR (Left to Right)"}</p>
          <p><strong>{isArabic ? "الترجمة العربية متاحة:" : "Arabic Translation Available:"}</strong> 
            {profileScore?.details_ar ? " ✅" : " ❌"} {isArabic ? "لدرجة الملف الشخصي" : "for Profile Score"}
          </p>
          <p><strong>{isArabic ? "الترجمة العربية متاحة:" : "Arabic Translation Available:"}</strong> 
            {subscriptionPlans[0]?.name_ar ? " ✅" : " ❌"} {isArabic ? "لخطط الاشتراك" : "for Subscription Plans"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArabicIntegrationTest;
