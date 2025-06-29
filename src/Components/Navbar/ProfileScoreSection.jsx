import React, { useState } from 'react';
import { FiChevronDown, FiStar, FiTrendingUp, FiClock, FiAward, FiInfo, FiHelpCircle } from 'react-icons/fi';

const ProfileScoreSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTips, setShowTips] = useState(false);

    const scoreItems = [
        {
            icon: <FiStar />,
            title: "Overall Score",
            description: "Your overall profile strength",
            value: "85/100",
            tip: "Complete your profile information and add more media to improve your score."
        },
        {
            icon: <FiTrendingUp />,
            title: "Engagement Rate",
            description: "Based on user interactions",
            value: "72%",
            tip: "Post more regularly and respond to comments to increase engagement."
        },
        {
            icon: <FiClock />,
            title: "Activity Level",
            description: "Your recent platform activity",
            value: "High",
            tip: "Maintain your current activity level to keep your score high."
        },
        {
            icon: <FiAward />,
            title: "Content Quality",
            description: "Based on media quality and diversity",
            value: "Good",
            tip: "Add more high-quality images and videos to improve content quality."
        }
    ];

    return (
        <div className="profile-score-section">
            <div className="score-header">
                <div className="score-header-left">
                    <span className="score-title">Profile Score</span>
                    <button 
                        className="score-tips-btn"
                        onClick={() => setShowTips(!showTips)}
                        title="View improvement tips"
                    >
                        <FiHelpCircle className="icon" />
                    </button>
                </div>
                <div className="score-value">
                    85/100
                    <button 
                        className={`score-dropdown-btn ${isOpen ? 'active' : ''}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <FiChevronDown className="icon" />
                    </button>
                </div>
            </div>
            
            <div className={`score-list ${isOpen ? 'active' : ''}`}>
                {scoreItems.map((item, index) => (
                    <div key={index} className="score-item">
                        <div className="score-item-icon">
                            {item.icon}
                        </div>
                        <div className="score-item-content">
                            <div className="score-item-title">{item.title}</div>
                            <div className="score-item-description">{item.description}</div>
                            {showTips && (
                                <div className="improvement-tip">
                                    <FiInfo className="icon" />
                                    <span>{item.tip}</span>
                                </div>
                            )}
                        </div>
                        <div className="score-item-value">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileScoreSection; 