import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiStar, FiTrendingUp, FiClock, FiAward, FiInfo, FiHelpCircle } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axios';

const ProfileScoreSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [profileScore, setProfileScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentLanguage } = useLanguage();
    const isArabic = currentLanguage === 'ar';

    useEffect(() => {
        fetchProfileScore();
    }, []);

    const fetchProfileScore = async () => {
        try {
            console.log('🔍 ProfileScoreSection: Fetching profile score...');
            const response = await axiosInstance.get('/api/users/profile-score/');
            console.log('✅ ProfileScoreSection: Profile score fetched:', response.data);
            setProfileScore(response.data);
        } catch (error) {
            console.error('❌ ProfileScoreSection: Error fetching profile score:', error);
            // Set fallback data if API fails
            setProfileScore({
                total: 85,
                account_tier: 5,
                verification: 0,
                profile_completion: 5,
                media_content: 0,
                details: "Your overall profile strength",
                improvement_tips: "Complete your profile information and add more media to improve your score.",
                details_ar: "قوة ملفك الشخصي الإجمالية",
                improvement_tips_ar: "أكمل معلومات ملفك الشخصي وأضف المزيد من الوسائط لتحسين درجتك."
            });
        } finally {
            setLoading(false);
        }
    };

    // Create score items from API data or fallback
    const getScoreItems = () => {
        if (!profileScore) return [];

        const details = isArabic ? profileScore.details_ar : profileScore.details;
        const improvementTips = isArabic ? profileScore.improvement_tips_ar : profileScore.improvement_tips;

        return [
            {
                icon: <FiStar />,
                title: isArabic ? "الدرجة الإجمالية" : "Overall Score",
                description: details || (isArabic ? "قوة ملفك الشخصي الإجمالية" : "Your overall profile strength"),
                value: `${profileScore.total || 85}/100`,
                tip: improvementTips || (isArabic ? "أكمل معلومات ملفك الشخصي وأضف المزيد من الوسائط لتحسين درجتك." : "Complete your profile information and add more media to improve your score.")
            },
            {
                icon: <FiTrendingUp />,
                title: isArabic ? "معدل التفاعل" : "Engagement Rate",
                description: isArabic ? "بناءً على تفاعلات المستخدمين" : "Based on user interactions",
                value: "72%",
                tip: isArabic ? "انشر بانتظام ورد على التعليقات لزيادة التفاعل." : "Post more regularly and respond to comments to increase engagement."
            },
            {
                icon: <FiClock />,
                title: isArabic ? "مستوى النشاط" : "Activity Level",
                description: isArabic ? "نشاطك الأخير على المنصة" : "Your recent platform activity",
                value: isArabic ? "عالي" : "High",
                tip: isArabic ? "حافظ على مستوى نشاطك الحالي للحفاظ على درجتك عالية." : "Maintain your current activity level to keep your score high."
            },
            {
                icon: <FiAward />,
                title: isArabic ? "جودة المحتوى" : "Content Quality",
                description: isArabic ? "بناءً على جودة وتنوع الوسائط" : "Based on media quality and diversity",
                value: isArabic ? "جيد" : "Good",
                tip: isArabic ? "أضف المزيد من الصور ومقاطع الفيديو عالية الجودة لتحسين جودة المحتوى." : "Add more high-quality images and videos to improve content quality."
            }
        ];
    };

    const scoreItems = getScoreItems();

    if (loading) {
        return (
            <div className="profile-score-section">
                <div className="score-header">
                    <div className="score-header-left">
                        <span className="score-title">{isArabic ? "درجة الملف الشخصي" : "Profile Score"}</span>
                    </div>
                    <div className="score-value">
                        {isArabic ? "جاري التحميل..." : "Loading..."}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-score-section">
            <div className="score-header">
                <div className="score-header-left">
                    <span className="score-title">{isArabic ? "درجة الملف الشخصي" : "Profile Score"}</span>
                    <button 
                        className="score-tips-btn"
                        onClick={() => setShowTips(!showTips)}
                        title={isArabic ? "عرض نصائح التحسين" : "View improvement tips"}
                    >
                        <FiHelpCircle className="icon" />
                    </button>
                </div>
                <div className="score-value">
                    {profileScore ? `${profileScore.total || 85}/100` : "85/100"}
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