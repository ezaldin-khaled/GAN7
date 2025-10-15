import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../../context/LanguageContext';
import { FaCrown, FaCheckCircle, FaUser, FaImages, FaCogs, FaTrophy, FaLightbulb, FaArrowUp } from 'react-icons/fa';
import './ProfileScore.css';

const ProfileScore = ({ profileScore }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  // Debug logging to track score values
  console.log('📊 ProfileScore component - Received profileScore:', profileScore);
  
  if (!profileScore) {
    return null;
  }

  // Extract the score value - ALWAYS use the 'total' field (0-100) which contains the actual points
  const scoreValue = profileScore.total || 0;
  console.log('📊 ProfileScore component - Using total value:', scoreValue);

  const getScoreColor = (score, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Yellow
    if (percentage >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getScoreIcon = (category) => {
    const icons = {
      account_tier: FaCrown,
      verification: FaCheckCircle,
      profile_completion: FaUser,
      media_content: FaImages,
      specialization: FaCogs
    };
    return icons[category] || FaTrophy;
  };

  const getScoreProgress = (score, maxScore = 100) => {
    return Math.min((score / maxScore) * 100, 100);
  };

  const getTotalScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#6B7280';
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return t('profileScore.levels.expert');
    if (score >= 60) return t('profileScore.levels.advanced');
    if (score >= 40) return t('profileScore.levels.intermediate');
    return t('profileScore.levels.beginner');
  };

  const getCategoryName = (category) => {
    const categoryMap = {
      'account_tier': t('profileScore.categories.accountTier'),
      'verification': t('profileScore.categories.verification'),
      'profile_completion': t('profileScore.categories.profileCompletion'),
      'media_content': t('profileScore.categories.mediaContent'),
      'specialization': t('profileScore.categories.specialization')
    };
    return categoryMap[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get translated details
  const getTranslatedDetails = () => {
    if (currentLanguage === 'ar' && profileScore.details_ar) {
      return profileScore.details_ar;
    }
    return profileScore.details || {};
  };

  // Helper function to get translated improvement tips
  const getTranslatedImprovementTips = () => {
    if (currentLanguage === 'ar' && profileScore.improvement_tips_ar) {
      return profileScore.improvement_tips_ar;
    }
    return profileScore.improvement_tips || [];
  };

  return (
    <div className="modern-profile-score">
      {/* Header Section */}
      <div className="score-header">
        <div className="score-header-content">
          <div className="score-icon">
            <FaTrophy />
          </div>
          <div className="score-header-text">
            <h2>{t('profileScore.title')}</h2>
            <p>{t('profileScore.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Total Score Card */}
      <div className="total-score-card">
        <div className="total-score-content">
          <div className="total-score-main">
            <span className="total-score-value" style={{ color: getTotalScoreColor(scoreValue) }}>
              {scoreValue}
            </span>
            <span className="total-score-label">{t('profileScore.profileScoreLabel')}</span>
          </div>
          <div className="total-score-level">
            <span className="level-badge" style={{ backgroundColor: getTotalScoreColor(scoreValue) }}>
              {getScoreLevel(scoreValue)}
            </span>
          </div>
        </div>
        <div className="total-score-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${getScoreProgress(scoreValue, 100)}%`,
                backgroundColor: getTotalScoreColor(scoreValue)
              }}
            ></div>
          </div>
          <span className="progress-text">100 {t('profileScore.maxPoints')}</span>
        </div>
      </div>

      {/* Score Categories Grid */}
      <div className="score-categories">
        {Object.entries(profileScore).filter(([key, value]) => 
          key !== 'score' && key !== 'total' && key !== 'details' && key !== 'improvement_tips' && typeof value === 'number'
        ).map(([category, score]) => {
          const IconComponent = getScoreIcon(category);
          const progress = getScoreProgress(score, 100);
          const color = getScoreColor(score, 100);
          
          return (
            <div key={category} className="score-category-card">
              <div className="category-header">
                <div className="category-icon" style={{ color }}>
                  <IconComponent />
                </div>
                <div className="category-info">
                  <h4>{getCategoryName(category)}</h4>
                  <span className="category-score" style={{ color }}>{score} {t('profileScore.points')}</span>
                </div>
              </div>
              
              <div className="category-progress">
                <div className="progress-bar-small">
                  <div 
                    className="progress-fill-small" 
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: color
                    }}
                  ></div>
                </div>
                <span className="progress-percentage">{Math.round(progress)}%</span>
              </div>
              
              <div className="category-detail">
                <p>{getTranslatedDetails()[category] || t('profileScore.defaultTip')}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Tips */}
      {getTranslatedImprovementTips().length > 0 && (
        <div className="improvement-section">
          <div className="improvement-header">
            <div className="improvement-icon">
              <FaLightbulb />
            </div>
            <h3>{t('profileScore.improvementTips')}</h3>
          </div>
          <div className="improvement-tips-list">
            {getTranslatedImprovementTips().map((tip, index) => (
              <div key={index} className="improvement-tip">
                <div className="tip-icon">
                  <FaArrowUp />
                </div>
                <span className="tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScore;