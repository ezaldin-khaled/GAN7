import React from 'react';
import { FaCrown, FaCheckCircle, FaUser, FaImages, FaCogs, FaTrophy, FaLightbulb, FaArrowUp } from 'react-icons/fa';
import './ProfileScore.css';

const ProfileScore = ({ profileScore }) => {
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
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Advanced';
    if (score >= 40) return 'Intermediate';
    return 'Beginner';
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
            <h2>Profile Score</h2>
            <p>Track your profile completeness and achievements</p>
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
            <span className="total-score-label">Profile Score</span>
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
          <span className="progress-text">100 max points</span>
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
                  <h4>{category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                  <span className="category-score" style={{ color }}>{score} pts</span>
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
                <p>{profileScore.details?.[category] || 'Complete this section to earn more points'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Tips */}
      {profileScore.improvement_tips && profileScore.improvement_tips.length > 0 && (
        <div className="improvement-section">
          <div className="improvement-header">
            <div className="improvement-icon">
              <FaLightbulb />
            </div>
            <h3>Improvement Tips</h3>
          </div>
          <div className="improvement-tips-list">
            {profileScore.improvement_tips.map((tip, index) => (
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