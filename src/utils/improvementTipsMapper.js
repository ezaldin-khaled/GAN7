/**
 * Maps backend improvement tips to translation keys
 * This function analyzes the tip text and returns the appropriate translation key
 * @param {string} tip - The improvement tip from the backend
 * @returns {string} - Translation key or original tip if no match found
 */
export const mapTipToTranslationKey = (tip) => {
  if (!tip) return '';
  
  const tipLower = tip.toLowerCase();
  
  // Define mapping patterns
  const patterns = [
    { keywords: ['complete', 'profile', 'information'], key: 'profileScore.tips.completeProfile' },
    { keywords: ['add', 'more', 'media'], key: 'profileScore.tips.addMoreMedia' },
    { keywords: ['verify', 'email'], key: 'profileScore.tips.verifyEmail' },
    { keywords: ['verify', 'identity', 'verification'], key: 'profileScore.tips.verifyIdentity' },
    { keywords: ['upgrade', 'account', 'tier'], key: 'profileScore.tips.upgradeAccount' },
    { keywords: ['add', 'specialization'], key: 'profileScore.tips.addSpecialization' },
    { keywords: ['upload', 'photo'], key: 'profileScore.tips.uploadPhotos' },
    { keywords: ['upload', 'video'], key: 'profileScore.tips.uploadVideos' },
    { keywords: ['complete', 'about'], key: 'profileScore.tips.completeAboutSection' },
    { keywords: ['add', 'contact'], key: 'profileScore.tips.addContactInfo' },
    { keywords: ['test', 'image'], key: 'profileScore.tips.completeTestImages' },
    { keywords: ['about', 'video'], key: 'profileScore.tips.addAboutVideo' },
    { keywords: ['fill', 'all', 'field'], key: 'profileScore.tips.fillAllFields' },
    { keywords: ['profile', 'picture'], key: 'profileScore.tips.addProfilePicture' },
    { keywords: ['location'], key: 'profileScore.tips.completeLocation' },
    { keywords: ['skill'], key: 'profileScore.tips.addSkills' },
    { keywords: ['bio'], key: 'profileScore.tips.updateBio' },
    { keywords: ['work', 'experience'], key: 'profileScore.tips.addWorkExperience' },
    { keywords: ['visibility'], key: 'profileScore.tips.increaseVisibility' },
  ];
  
  // Find matching pattern
  for (const pattern of patterns) {
    const matchesAll = pattern.keywords.every(keyword => tipLower.includes(keyword));
    if (matchesAll) {
      return pattern.key;
    }
  }
  
  // If no pattern matches, return the original tip
  return tip;
};

/**
 * Gets a translated improvement tip
 * @param {string} tip - The improvement tip from the backend
 * @param {Function} t - Translation function from useTranslation hook
 * @returns {string} - Translated tip
 */
export const getTranslatedTip = (tip, t) => {
  const translationKey = mapTipToTranslationKey(tip);
  
  // If it's a translation key, use it
  if (translationKey.startsWith('profileScore.tips.')) {
    return t(translationKey);
  }
  
  // Otherwise return the original tip
  return tip;
};

