import React from 'react';
import './ProfileScore.css';

const ProfileScore = ({ profileScore }) => {
  if (!profileScore) {
    return null;
  }

  return (
    <div className="profile-score-section">
      {/* <h3>Profile Score</h3> */}
      <div className="score-breakdown">
        <div className="total-score">
          <span className="score-value">{profileScore.total}</span>
          <span className="score-label">Total Score</span>
        </div>
        <div className="score-details">
          <div className="score-item">
            <span className="item-label">Account Tier</span>
            <span className="item-value">{profileScore.account_tier} points</span>
            <span className="item-detail">{profileScore.details.account_tier}</span>
          </div>
          <div className="score-item">
            <span className="item-label">Verification</span>
            <span className="item-value">{profileScore.verification} points</span>
            <span className="item-detail">{profileScore.details.verification}</span>
          </div>
          <div className="score-item">
            <span className="item-label">Profile Completion</span>
            <span className="item-value">{profileScore.profile_completion} points</span>
            <span className="item-detail">{profileScore.details.profile_completion}</span>
          </div>
          <div className="score-item">
            <span className="item-label">Media Content</span>
            <span className="item-value">{profileScore.media_content} points</span>
            <span className="item-detail">{profileScore.details.media_content}</span>
          </div>
          <div className="score-item">
            <span className="item-label">Specialization</span>
            <span className="item-value">{profileScore.specialization} points</span>
            <span className="item-detail">{profileScore.details.specialization}</span>
          </div>
        </div>
        {profileScore.improvement_tips && profileScore.improvement_tips.length > 0 && (
          <div className="improvement-tips">
            <h4>How to Improve Your Score:</h4>
            <ul>
              {profileScore.improvement_tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScore; 