import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { FiChevronDown, FiStar, FiTrendingUp, FiClock, FiAward, FiInfo, FiHelpCircle, FiCrown, FiCheckCircle, FiUser, FiImage, FiCog, FiShare2 } from 'react-icons/fi';
import { FaCrown, FaCheckCircle, FaUser, FaImages, FaCogs, FaShareAlt } from 'react-icons/fa';
import { calculateProfileScore, fetchProfileScore } from '../api/profileScore';
import axiosInstance from '../api/axios';
import './ProfileScore.css';

const ProfileScore = ({ userData, subscriptionData }) => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const isArabic = currentLanguage === 'ar';
    const [isOpen, setIsOpen] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [profileScore, setProfileScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchScoreData();
    }, [userData, subscriptionData]);

    const fetchScoreData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Try to fetch from API first
            try {
                const response = await fetchProfileScore();
                setProfileScore(response);
                console.log('✅ ProfileScore: API score fetched:', response);
            } catch (apiError) {
                console.log('⚠️ ProfileScore: API not available, calculating locally');
                
                // Fallback to local calculation
                if (userData) {
                    const calculatedScore = calculateProfileScore(userData, subscriptionData);
                    setProfileScore(calculatedScore);
                    console.log('✅ ProfileScore: Local score calculated:', calculatedScore);
                } else {
                    // Use mock data if no user data available
                    setProfileScore({
                        total: 45,
                        account_tier: 5,
                        verification: 0,
                        profile_completion: 10,
                        media_content: 5,
                        specialization: 0,
                        social_media: 0,
                        details: {
                            account_tier: "Free account: +5 points",
                            verification: "Email not verified: +0 points (verify your email for +25 points)",
                            profile_completion: "Complete your profile for up to +25 points",
                            media_content: "Basic portfolio (1 item): +5 points",
                            specialization: "No specialization: +0 points (add a specialization for +10 points)",
                            social_media: "No social media links: +0 points (add social links for up to +10 points)"
                        },
                        details_ar: {
                            account_tier: "حساب مجاني: +5 نقاط",
                            verification: "البريد الإلكتروني غير موثق: +0 نقطة (وثق بريدك الإلكتروني لـ +25 نقطة)",
                            profile_completion: "أكمل ملفك الشخصي لـ +25 نقطة",
                            media_content: "معرض اعمال أساسي (عنصر واحد): +5 نقاط",
                            specialization: "لا يوجد تخصص: +0 نقطة (أضف تخصص لـ +10 نقاط)",
                            social_media: "لا توجد روابط وسائل التواصل: +0 نقطة (أضف روابط وسائل التواصل لـ +10 نقاط)"
                        },
                        improvement_tips: [
                            "Verify your email for +25 points",
                            "Complete your profile details for up to +25 points",
                            "Add more portfolio items for up to +20 points",
                            "Add a specialization for +10 points",
                            "Add social media links for up to +10 points"
                        ],
                        improvement_tips_ar: [
                            "وثق بريدك الإلكتروني لـ +25 نقطة",
                            "أكمل تفاصيل ملفك الشخصي لـ +25 نقطة",
                            "أضف المزيد من عناصر المحفظة لـ +20 نقطة",
                            "أضف تخصص لـ +10 نقاط",
                            "أضف روابط وسائل التواصل لـ +10 نقاط"
                        ]
                    });
                }
            }
        } catch (err) {
            console.error('❌ ProfileScore: Error fetching score data:', err);
            setError('Failed to load profile score');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-score-section">
                <div className="score-header">
                    <div className="score-header-left">
                        <span className="score-title">{t('profileScore.title')}</span>
                    </div>
                    <div className="score-value loading">
                        <div className="loading-skeleton"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-score-section error">
                <div className="score-header">
                    <div className="score-header-left">
                        <span className="score-title">{t('profileScore.title')}</span>
                    </div>
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    if (!profileScore) {
        return null;
    }

    // Get score color based on total score
    const getScoreColor = (score) => {
        if (score >= 80) return '#10B981'; // Green
        if (score >= 60) return '#F59E0B'; // Yellow
        if (score >= 40) return '#EF4444'; // Red
        return '#6B7280'; // Gray
    };

    // Get score level
    const getScoreLevel = (score) => {
        if (score >= 80) return isArabic ? 'ممتاز' : 'Excellent';
        if (score >= 60) return isArabic ? 'جيد' : 'Good';
        if (score >= 40) return isArabic ? 'متوسط' : 'Fair';
        return isArabic ? 'يحتاج تحسين' : 'Needs Improvement';
    };

    // Create score items for each category
    const scoreItems = [
        {
            icon: <FaCrown />,
            title: isArabic ? 'نوع الحساب' : 'Account Tier',
            description: isArabic ? 'نقاط نوع الحساب' : 'Account type points',
            value: `${profileScore.account_tier}/25`,
            points: profileScore.account_tier,
            maxPoints: 25,
            details: isArabic ? profileScore.details_ar?.account_tier : profileScore.details?.account_tier
        },
        {
            icon: <FaCheckCircle />,
            title: isArabic ? 'التحقق من البريد' : 'Email Verification',
            description: isArabic ? 'نقاط التحقق من البريد الإلكتروني' : 'Email verification points',
            value: `${profileScore.verification}/25`,
            points: profileScore.verification,
            maxPoints: 25,
            details: isArabic ? profileScore.details_ar?.verification : profileScore.details?.verification
        },
        {
            icon: <FaUser />,
            title: isArabic ? 'اكتمال الملف الشخصي' : 'Profile Completion',
            description: isArabic ? 'نقاط اكتمال الملف الشخصي' : 'Profile completion points',
            value: `${profileScore.profile_completion}/25`,
            points: profileScore.profile_completion,
            maxPoints: 25,
            details: isArabic ? profileScore.details_ar?.profile_completion : profileScore.details?.profile_completion
        },
        {
            icon: <FaImages />,
            title: isArabic ? 'المحتوى المرئي' : 'Media Content',
            description: isArabic ? 'نقاط المحتوى المرئي' : 'Media content points',
            value: `${profileScore.media_content}/20`,
            points: profileScore.media_content,
            maxPoints: 20,
            details: isArabic ? profileScore.details_ar?.media_content : profileScore.details?.media_content
        },
        {
            icon: <FaCogs />,
            title: isArabic ? 'التخصص' : 'Specialization',
            description: isArabic ? 'نقاط التخصص' : 'Specialization points',
            value: `${profileScore.specialization}/15`,
            points: profileScore.specialization,
            maxPoints: 15,
            details: isArabic ? profileScore.details_ar?.specialization : profileScore.details?.specialization
        },
        {
            icon: <FaShareAlt />,
            title: isArabic ? 'وسائل التواصل' : 'Social Media',
            description: isArabic ? 'نقاط وسائل التواصل' : 'Social media points',
            value: `${profileScore.social_media}/10`,
            points: profileScore.social_media,
            maxPoints: 10,
            details: isArabic ? profileScore.details_ar?.social_media : profileScore.details?.social_media
        }
    ];

    const totalScore = profileScore.total;
    const scoreColor = getScoreColor(totalScore);
    const scoreLevel = getScoreLevel(totalScore);

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
                        <span>{isArabic ? 'نصائح التحسين' : 'Improvement Tips'}</span>
                    </button>
                </div>
                <div className="score-value">
                    <div className="score-circle" style={{ borderColor: scoreColor }}>
                        <span className="score-number" style={{ color: scoreColor }}>
                            {totalScore}
                        </span>
                        <span className="score-max">/100</span>
                    </div>
                    <div className="score-level" style={{ color: scoreColor }}>
                        {scoreLevel}
                    </div>
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
                            {showTips && item.details && (
                                <div className="improvement-tip">
                                    <FiInfo className="icon" />
                                    <span>{item.details}</span>
                                </div>
                            )}
                            <div className="score-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ 
                                            width: `${(item.points / item.maxPoints) * 100}%`,
                                            backgroundColor: getScoreColor((item.points / item.maxPoints) * 100)
                                        }}
                                    ></div>
                                </div>
                                <span className="progress-text">{item.value}</span>
                            </div>
                        </div>
                        <div className="score-item-value">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Improvement Tips Section */}
            {showTips && profileScore.improvement_tips && profileScore.improvement_tips.length > 0 && (
                <div className="improvement-tips-section">
                    <h4 className="tips-title">
                        <FiInfo className="icon" />
                        {isArabic ? 'نصائح التحسين' : 'Improvement Tips'}
                    </h4>
                    <div className="tips-list">
                        {(isArabic ? profileScore.improvement_tips_ar : profileScore.improvement_tips).map((tip, index) => (
                            <div key={index} className="tip-item">
                                <span className="tip-bullet">•</span>
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