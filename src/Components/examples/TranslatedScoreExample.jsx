import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Example component showing how to use translated improvement tips
 * This demonstrates the pattern for using API-provided translations
 */
const TranslatedScoreExample = ({ profileScore }) => {
  const { currentLanguage } = useLanguage();

  // Helper function to get translated details
  const getTranslatedDetails = () => {
    if (currentLanguage === 'ar' && profileScore?.details_ar) {
      return profileScore.details_ar;
    }
    return profileScore?.details || {};
  };

  // Helper function to get translated improvement tips
  const getTranslatedImprovementTips = () => {
    if (currentLanguage === 'ar' && profileScore?.improvement_tips_ar) {
      return profileScore.improvement_tips_ar;
    }
    return profileScore?.improvement_tips || [];
  };

  if (!profileScore) {
    return <div>No profile score data available</div>;
  }

  return (
    <div className="translated-score-example">
      <h3>Translated Score Example</h3>
      
      {/* Display translated details */}
      <div className="score-details">
        <h4>Score Details ({currentLanguage === 'ar' ? 'تفاصيل النقاط' : 'Score Details'})</h4>
        {Object.entries(getTranslatedDetails()).map(([key, value]) => (
          <div key={key} className="detail-item">
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>

      {/* Display translated improvement tips */}
      <div className="improvement-tips">
        <h4>Improvement Tips ({currentLanguage === 'ar' ? 'نصائح التحسين' : 'Improvement Tips'})</h4>
        <ul>
          {getTranslatedImprovementTips().map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Language indicator */}
      <div className="language-indicator">
        Current Language: {currentLanguage === 'ar' ? 'العربية' : 'English'}
      </div>
    </div>
  );
};

export default TranslatedScoreExample;
