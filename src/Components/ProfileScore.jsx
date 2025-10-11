import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiStar, FiTrendingUp, FiClock, FiAward, FiInfo, FiHelpCircle } from 'react-icons/fi';
import './ProfileScore.css';

const ProfileScore = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [showTips, setShowTips] = useState(false);

    const scoreItems = [
        {
            icon: <FiStar />,
            title: t('profileScore.overallScore'),
            description: t('profileScore.overallScoreDesc'),
            value: "85/100",
            tip: t('profileScore.overallScoreTip')
        },
        {
            icon: <FiTrendingUp />,
            title: t('profileScore.engagementRate'),
            description: t('profileScore.engagementRateDesc'),
            value: "72%",
            tip: t('profileScore.engagementRateTip')
        },
        {
            icon: <FiClock />,
            title: t('profileScore.activityLevel'),
            description: t('profileScore.activityLevelDesc'),
            value: t('profileScore.high'),
            tip: t('profileScore.activityLevelTip')
        },
        {
            icon: <FiAward />,
            title: t('profileScore.contentQuality'),
            description: t('profileScore.contentQualityDesc'),
            value: t('profileScore.good'),
            tip: t('profileScore.contentQualityTip')
        }
    ];

    return (
        <div className="profile-score-section">
            <div className="score-header">
                <div className="score-header-left">
                    <span className="score-title">{t('profileScore.title')}</span>
                    <button 
                        className="score-tips-btn"
                        onClick={() => setShowTips(!showTips)}
                        title={t('profileScore.viewTips')}
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

export default ProfileScore; 