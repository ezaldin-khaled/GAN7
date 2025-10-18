import axiosInstance from './axios';

/**
 * Profile Scoring System API
 * Implements the comprehensive 100-point scoring system
 */

// Maximum points for each category
const MAX_POINTS = {
  ACCOUNT_TIER: 25,
  EMAIL_VERIFICATION: 25,
  PROFILE_COMPLETION: 25,
  MEDIA_CONTENT: 20,
  SPECIALIZATION: 15,
  SOCIAL_MEDIA: 10,
  TOTAL: 100
};

// Account tier points mapping
const ACCOUNT_TIER_POINTS = {
  'platinum': 25,
  'premium': 15,
  'free': 5
};

// Media content points based on count
const getMediaContentPoints = (mediaCount) => {
  if (mediaCount >= 6) return 20;
  if (mediaCount >= 4) return 15;
  if (mediaCount >= 2) return 10;
  if (mediaCount >= 1) return 5;
  return 0;
};

// Social media points based on link count
const getSocialMediaPoints = (socialLinks) => {
  const linkCount = Object.values(socialLinks).filter(link => link && link.trim() !== '').length;
  if (linkCount >= 4) return 10;
  if (linkCount >= 2) return 5;
  if (linkCount >= 1) return 2;
  return 0;
};

// Specialization points
const getSpecializationPoints = (specializations) => {
  if (!specializations || specializations.length === 0) return 0;
  if (specializations.length >= 2) return 15;
  return 10;
};

// Profile completion points
const getProfileCompletionPoints = (profileData) => {
  let points = 0;
  
  // About section (5 points)
  if (profileData.aboutyou && profileData.aboutyou.length > 50) {
    points += 5;
  }
  
  // Profile picture (5 points)
  if (profileData.profile_picture) {
    points += 5;
  }
  
  // Country (3 points)
  if (profileData.country && profileData.country !== 'country') {
    points += 3;
  }
  
  // Date of birth (2 points)
  if (profileData.date_of_birth) {
    points += 2;
  }
  
  // Specialization (10 points)
  if (profileData.specializations && profileData.specializations.length > 0) {
    points += 10;
  }
  
  return points;
};

/**
 * Calculate comprehensive profile score
 * @param {Object} userData - User profile data
 * @param {Object} subscriptionData - User subscription data
 * @returns {Object} Complete scoring breakdown
 */
export const calculateProfileScore = (userData, subscriptionData = {}) => {
  try {
    // Account tier points
    const accountTier = subscriptionData.tier || userData.account_type || 'free';
    const accountTierPoints = ACCOUNT_TIER_POINTS[accountTier.toLowerCase()] || 5;
    
    // Email verification points
    const emailVerifiedPoints = userData.email_verified ? 25 : 0;
    
    // Profile completion points
    const profileCompletionPoints = getProfileCompletionPoints(userData);
    
    // Media content points
    const mediaCount = userData.media_content?.length || 0;
    const mediaContentPoints = getMediaContentPoints(mediaCount);
    
    // Specialization points
    const specializationPoints = getSpecializationPoints(userData.specializations);
    
    // Social media points
    const socialMediaPoints = getSocialMediaPoints({
      facebook: userData.facebook,
      instagram: userData.instagram,
      youtube: userData.youtube,
      tiktok: userData.tiktok
    });
    
    // Calculate total (capped at 100)
    const total = Math.min(
      accountTierPoints + emailVerifiedPoints + profileCompletionPoints + 
      mediaContentPoints + specializationPoints + socialMediaPoints,
      100
    );
    
    // Generate detailed descriptions
    const details = {
      account_tier: `${accountTier.charAt(0).toUpperCase() + accountTier.slice(1)} account: +${accountTierPoints} points`,
      verification: userData.email_verified ? 'Email verified: +25 points' : 'Email not verified: +0 points (verify your email for +25 points)',
      profile_completion: generateProfileCompletionDetails(userData, profileCompletionPoints),
      media_content: generateMediaContentDetails(mediaCount, mediaContentPoints),
      specialization: generateSpecializationDetails(userData.specializations, specializationPoints),
      social_media: generateSocialMediaDetails(userData, socialMediaPoints)
    };
    
    // Arabic translations
    const details_ar = {
      account_tier: `${getAccountTierArabic(accountTier)}: +${accountTierPoints} نقطة`,
      verification: userData.email_verified ? 'البريد الإلكتروني موثق: +25 نقطة' : 'البريد الإلكتروني غير موثق: +0 نقطة (وثق بريدك الإلكتروني لـ +25 نقطة)',
      profile_completion: generateProfileCompletionDetailsArabic(userData, profileCompletionPoints),
      media_content: generateMediaContentDetailsArabic(mediaCount, mediaContentPoints),
      specialization: generateSpecializationDetailsArabic(userData.specializations, specializationPoints),
      social_media: generateSocialMediaDetailsArabic(userData, socialMediaPoints)
    };
    
    // Generate improvement tips
    const improvementTips = generateImprovementTips({
      accountTierPoints,
      emailVerifiedPoints,
      profileCompletionPoints,
      mediaContentPoints,
      specializationPoints,
      socialMediaPoints,
      total
    });
    
    const improvementTipsAr = generateImprovementTipsArabic({
      accountTierPoints,
      emailVerifiedPoints,
      profileCompletionPoints,
      mediaContentPoints,
      specializationPoints,
      socialMediaPoints,
      total
    });
    
    return {
      total,
      account_tier: accountTierPoints,
      verification: emailVerifiedPoints,
      profile_completion: profileCompletionPoints,
      media_content: mediaContentPoints,
      specialization: specializationPoints,
      social_media: socialMediaPoints,
      details,
      details_ar,
      improvement_tips: improvementTips,
      improvement_tips_ar: improvementTipsAr
    };
  } catch (error) {
    console.error('Error calculating profile score:', error);
    return {
      total: 0,
      account_tier: 0,
      verification: 0,
      profile_completion: 0,
      media_content: 0,
      specialization: 0,
      social_media: 0,
      details: {},
      details_ar: {},
      improvement_tips: ['Complete your profile to get started'],
      improvement_tips_ar: ['أكمل ملفك الشخصي للبدء']
    };
  }
};

// Helper functions for generating detailed descriptions
const generateProfileCompletionDetails = (userData, points) => {
  const details = [];
  
  if (userData.aboutyou && userData.aboutyou.length > 50) {
    details.push('About section: +5 points');
  }
  if (userData.profile_picture) {
    details.push('Profile picture: +5 points');
  }
  if (userData.country && userData.country !== 'country') {
    details.push('Country specified: +3 points');
  }
  if (userData.date_of_birth) {
    details.push('Date of birth: +2 points');
  }
  if (userData.specializations && userData.specializations.length > 0) {
    details.push('Specialization added: +10 points');
  }
  
  return details.length > 0 ? details.join('; ') : 'Complete your profile for up to +25 points';
};

const generateMediaContentDetails = (mediaCount, points) => {
  if (mediaCount >= 6) return 'Excellent portfolio (6+ items): +20 points';
  if (mediaCount >= 4) return 'Strong portfolio (4-5 items): +15 points';
  if (mediaCount >= 2) return 'Good portfolio (2-3 items): +10 points';
  if (mediaCount >= 1) return 'Basic portfolio (1 item): +5 points';
  return 'No portfolio items: +0 points (add portfolio items for up to +20 points)';
};

const generateSpecializationDetails = (specializations, points) => {
  if (!specializations || specializations.length === 0) {
    return 'No specialization: +0 points (add a specialization for +10 points)';
  }
  
  const specNames = specializations.map(spec => {
    if (typeof spec === 'string') return spec;
    return spec.name || spec;
  }).join(', ');
  
  if (specializations.length >= 2) {
    return `Specializations: ${specNames} (+15 points)`;
  }
  return `Specialization: ${specNames} (+10 points)`;
};

const generateSocialMediaDetails = (userData, points) => {
  const socialLinks = {
    facebook: userData.facebook,
    instagram: userData.instagram,
    youtube: userData.youtube,
    tiktok: userData.tiktok
  };
  
  const linkCount = Object.values(socialLinks).filter(link => link && link.trim() !== '').length;
  
  if (linkCount >= 4) return 'Strong social presence (4+ links): +10 points';
  if (linkCount >= 2) return 'Good social presence (2-3 links): +5 points';
  if (linkCount >= 1) return 'Basic social presence (1 link): +2 points';
  return 'No social media links: +0 points (add social links for up to +10 points)';
};

// Arabic helper functions
const getAccountTierArabic = (tier) => {
  const tiers = {
    'platinum': 'حساب بلاتينيوم',
    'premium': 'حساب بريميوم',
    'free': 'حساب مجاني'
  };
  return tiers[tier.toLowerCase()] || 'حساب مجاني';
};

const generateProfileCompletionDetailsArabic = (userData, points) => {
  const details = [];
  
  if (userData.aboutyou && userData.aboutyou.length > 50) {
    details.push('قسم نبذة عني: +5 نقاط');
  }
  if (userData.profile_picture) {
    details.push('صورة الملف الشخصي: +5 نقاط');
  }
  if (userData.country && userData.country !== 'country') {
    details.push('البلد محدد: +3 نقاط');
  }
  if (userData.date_of_birth) {
    details.push('تاريخ الميلاد: +2 نقطة');
  }
  if (userData.specializations && userData.specializations.length > 0) {
    details.push('تم إضافة التخصص: +10 نقاط');
  }
  
  return details.length > 0 ? details.join('; ') : 'أكمل ملفك الشخصي لـ +25 نقطة';
};

const generateMediaContentDetailsArabic = (mediaCount, points) => {
  if (mediaCount >= 6) return 'معرض اعمال ممتاز (6+ عناصر): +20 نقطة';
  if (mediaCount >= 4) return 'معرض اعمال قوي (4-5 عناصر): +15 نقطة';
  if (mediaCount >= 2) return 'معرض اعمال جيد (2-3 عناصر): +10 نقاط';
  if (mediaCount >= 1) return 'معرض اعمال أساسي (عنصر واحد): +5 نقاط';
  return 'لا توجد عناصر في المعرض: +0 نقطة (أضف عناصر المعرض لـ +20 نقطة)';
};

const generateSpecializationDetailsArabic = (specializations, points) => {
  if (!specializations || specializations.length === 0) {
    return 'لا يوجد تخصص: +0 نقطة (أضف تخصص لـ +10 نقاط)';
  }
  
  const specNames = specializations.map(spec => {
    if (typeof spec === 'string') return spec;
    return spec.name || spec;
  }).join(', ');
  
  if (specializations.length >= 2) {
    return `التخصصات: ${specNames} (+15 نقطة)`;
  }
  return `التخصص: ${specNames} (+10 نقاط)`;
};

const generateSocialMediaDetailsArabic = (userData, points) => {
  const socialLinks = {
    facebook: userData.facebook,
    instagram: userData.instagram,
    youtube: userData.youtube,
    tiktok: userData.tiktok
  };
  
  const linkCount = Object.values(socialLinks).filter(link => link && link.trim() !== '').length;
  
  if (linkCount >= 4) return 'وجود قوي على وسائل التواصل (4+ روابط): +10 نقاط';
  if (linkCount >= 2) return 'وجود جيد على وسائل التواصل (2-3 روابط): +5 نقاط';
  if (linkCount >= 1) return 'وجود أساسي على وسائل التواصل (رابط واحد): +2 نقطة';
  return 'لا توجد روابط وسائل التواصل: +0 نقطة (أضف روابط وسائل التواصل لـ +10 نقاط)';
};

// Generate improvement tips
const generateImprovementTips = (scores) => {
  const tips = [];
  
  if (scores.total < 70) {
    if (scores.accountTierPoints < 15) {
      tips.push('Upgrade to Premium (+10) or Platinum (+20) for more points');
    }
    if (scores.emailVerifiedPoints === 0) {
      tips.push('Verify your email for +25 points');
    }
    if (scores.profileCompletionPoints < 20) {
      tips.push('Complete your profile details for up to +25 points');
    }
    if (scores.mediaContentPoints < 15) {
      tips.push('Add more portfolio items for up to +20 points');
    }
    if (scores.specializationPoints === 0) {
      tips.push('Add a specialization for +10 points');
    }
    if (scores.socialMediaPoints < 5) {
      tips.push('Add social media links for up to +10 points');
    }
  }
  
  return tips;
};

const generateImprovementTipsArabic = (scores) => {
  const tips = [];
  
  if (scores.total < 70) {
    if (scores.accountTierPoints < 15) {
      tips.push('ترقية إلى بريميوم (+10) أو بلاتينيوم (+20) للمزيد من النقاط');
    }
    if (scores.emailVerifiedPoints === 0) {
      tips.push('وثق بريدك الإلكتروني لـ +25 نقطة');
    }
    if (scores.profileCompletionPoints < 20) {
      tips.push('أكمل تفاصيل ملفك الشخصي لـ +25 نقطة');
    }
    if (scores.mediaContentPoints < 15) {
      tips.push('أضف المزيد من عناصر المحفظة لـ +20 نقطة');
    }
    if (scores.specializationPoints === 0) {
      tips.push('أضف تخصص لـ +10 نقاط');
    }
    if (scores.socialMediaPoints < 5) {
      tips.push('أضف روابط وسائل التواصل لـ +10 نقاط');
    }
  }
  
  return tips;
};

/**
 * Fetch profile score from API
 * @returns {Promise<Object>} Profile score data
 */
export const fetchProfileScore = async () => {
  try {
    const response = await axiosInstance.get('/api/users/profile-score/');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile score:', error);
    throw error;
  }
};

/**
 * Update profile score (if backend supports it)
 * @param {Object} scoreData - Score data to update
 * @returns {Promise<Object>} Updated score data
 */
export const updateProfileScore = async (scoreData) => {
  try {
    const response = await axiosInstance.post('/api/users/profile-score/', scoreData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile score:', error);
    throw error;
  }
};

export default {
  calculateProfileScore,
  fetchProfileScore,
  updateProfileScore,
  MAX_POINTS
};
