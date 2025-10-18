import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import ProfileScore from '../ProfileScore';
import { calculateProfileScore } from '../../api/profileScore';
import './ProfileScoreExample.css';

const ProfileScoreExample = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isArabic = currentLanguage === 'ar';
  const [exampleData, setExampleData] = useState(null);
  const [selectedExample, setSelectedExample] = useState('beginner');

  // Example user data scenarios
  const exampleScenarios = {
    beginner: {
      userData: {
        account_type: 'free',
        email_verified: false,
        aboutyou: '',
        profile_picture: null,
        country: 'country',
        date_of_birth: null,
        specializations: [],
        media_content: [],
        facebook: '',
        instagram: '',
        youtube: '',
        tiktok: ''
      },
      subscriptionData: { tier: 'free' },
      description: isArabic ? 'مستخدم مبتدئ - حساب مجاني' : 'Beginner User - Free Account'
    },
    intermediate: {
      userData: {
        account_type: 'premium',
        email_verified: true,
        aboutyou: 'I am a professional photographer with 5 years of experience in wedding and portrait photography.',
        profile_picture: 'profile.jpg',
        country: 'United States',
        date_of_birth: '1990-01-01',
        specializations: ['Visual Worker'],
        media_content: [
          { id: 1, type: 'image' },
          { id: 2, type: 'image' },
          { id: 3, type: 'video' }
        ],
        facebook: 'https://facebook.com/user',
        instagram: 'https://instagram.com/user',
        youtube: '',
        tiktok: ''
      },
      subscriptionData: { tier: 'premium' },
      description: isArabic ? 'مستخدم متوسط - حساب بريميوم' : 'Intermediate User - Premium Account'
    },
    advanced: {
      userData: {
        account_type: 'platinum',
        email_verified: true,
        aboutyou: 'Award-winning cinematographer and director with over 10 years of experience in commercial and film production. Specialized in visual storytelling and creative direction.',
        profile_picture: 'profile.jpg',
        country: 'United Kingdom',
        date_of_birth: '1985-05-15',
        specializations: ['Visual Worker', 'Expressive Worker'],
        media_content: [
          { id: 1, type: 'image' },
          { id: 2, type: 'image' },
          { id: 3, type: 'video' },
          { id: 4, type: 'image' },
          { id: 5, type: 'video' },
          { id: 6, type: 'image' }
        ],
        facebook: 'https://facebook.com/user',
        instagram: 'https://instagram.com/user',
        youtube: 'https://youtube.com/user',
        tiktok: 'https://tiktok.com/user'
      },
      subscriptionData: { tier: 'platinum' },
      description: isArabic ? 'مستخدم متقدم - حساب بلاتينيوم' : 'Advanced User - Platinum Account'
    }
  };

  useEffect(() => {
    updateExampleData();
  }, [selectedExample, isArabic]);

  const updateExampleData = () => {
    const scenario = exampleScenarios[selectedExample];
    const calculatedScore = calculateProfileScore(scenario.userData, scenario.subscriptionData);
    setExampleData({
      userData: scenario.userData,
      subscriptionData: scenario.subscriptionData,
      score: calculatedScore,
      description: scenario.description
    });
  };

  const handleExampleChange = (example) => {
    setSelectedExample(example);
  };

  if (!exampleData) {
    return (
      <div className="profile-score-example">
        <div className="loading">Loading examples...</div>
      </div>
    );
  }

  return (
    <div className="profile-score-example">
      <div className="example-header">
        <h2>{isArabic ? 'أمثلة على نظام التقييم' : 'Profile Scoring Examples'}</h2>
        <p>{isArabic ? 'شاهد كيف يعمل نظام التقييم الشامل مع أنواع مختلفة من المستخدمين' : 'See how the comprehensive scoring system works with different user types'}</p>
      </div>

      <div className="example-selector">
        <h3>{isArabic ? 'اختر مثال:' : 'Select Example:'}</h3>
        <div className="example-buttons">
          {Object.keys(exampleScenarios).map((key) => (
            <button
              key={key}
              className={`example-btn ${selectedExample === key ? 'active' : ''}`}
              onClick={() => handleExampleChange(key)}
            >
              {exampleScenarios[key].description}
            </button>
          ))}
        </div>
      </div>

      <div className="example-content">
        <div className="example-description">
          <h4>{exampleData.description}</h4>
          <div className="score-summary">
            <div className="total-score">
              <span className="score-label">{isArabic ? 'الدرجة الإجمالية:' : 'Total Score:'}</span>
              <span className="score-value">{exampleData.score.total}/100</span>
            </div>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span>{isArabic ? 'نوع الحساب:' : 'Account Tier:'}</span>
                <span>{exampleData.score.account_tier}/25</span>
              </div>
              <div className="breakdown-item">
                <span>{isArabic ? 'التحقق من البريد:' : 'Email Verification:'}</span>
                <span>{exampleData.score.verification}/25</span>
              </div>
              <div className="breakdown-item">
                <span>{isArabic ? 'اكتمال الملف:' : 'Profile Completion:'}</span>
                <span>{exampleData.score.profile_completion}/25</span>
              </div>
              <div className="breakdown-item">
                <span>{isArabic ? 'المحتوى المرئي:' : 'Media Content:'}</span>
                <span>{exampleData.score.media_content}/20</span>
              </div>
              <div className="breakdown-item">
                <span>{isArabic ? 'التخصص:' : 'Specialization:'}</span>
                <span>{exampleData.score.specialization}/15</span>
              </div>
              <div className="breakdown-item">
                <span>{isArabic ? 'وسائل التواصل:' : 'Social Media:'}</span>
                <span>{exampleData.score.social_media}/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-score-demo">
          <ProfileScore 
            userData={exampleData.userData} 
            subscriptionData={exampleData.subscriptionData} 
          />
        </div>
      </div>

      <div className="scoring-guide">
        <h3>{isArabic ? 'دليل نظام التقييم' : 'Scoring System Guide'}</h3>
        <div className="guide-content">
          <div className="guide-section">
            <h4>{isArabic ? 'فئات التقييم' : 'Scoring Categories'}</h4>
            <ul>
              <li><strong>{isArabic ? 'نوع الحساب (25 نقطة):' : 'Account Tier (25 points):'}</strong> {isArabic ? 'بلاتينيوم (25)، بريميوم (15)، مجاني (5)' : 'Platinum (25), Premium (15), Free (5)'}</li>
              <li><strong>{isArabic ? 'التحقق من البريد (25 نقطة):' : 'Email Verification (25 points):'}</strong> {isArabic ? 'البريد الموثق (25)، غير موثق (0)' : 'Verified (25), Not verified (0)'}</li>
              <li><strong>{isArabic ? 'اكتمال الملف الشخصي (25 نقطة):' : 'Profile Completion (25 points):'}</strong> {isArabic ? 'نبذة عني (5)، صورة (5)، البلد (3)، تاريخ الميلاد (2)، التخصص (10)' : 'About (5), Picture (5), Country (3), DOB (2), Specialization (10)'}</li>
              <li><strong>{isArabic ? 'المحتوى المرئي (20 نقطة):' : 'Media Content (20 points):'}</strong> {isArabic ? '6+ عناصر (20)، 4-5 عناصر (15)، 2-3 عناصر (10)، عنصر واحد (5)' : '6+ items (20), 4-5 items (15), 2-3 items (10), 1 item (5)'}</li>
              <li><strong>{isArabic ? 'التخصص (15 نقطة):' : 'Specialization (15 points):'}</strong> {isArabic ? 'تخصصان أو أكثر (15)، تخصص واحد (10)' : '2+ specializations (15), 1 specialization (10)'}</li>
              <li><strong>{isArabic ? 'وسائل التواصل (10 نقاط):' : 'Social Media (10 points):'}</strong> {isArabic ? '4+ روابط (10)، 2-3 روابط (5)، رابط واحد (2)' : '4+ links (10), 2-3 links (5), 1 link (2)'}</li>
            </ul>
          </div>
          
          <div className="guide-section">
            <h4>{isArabic ? 'فوائد التقييم العالي' : 'Benefits of High Score'}</h4>
            <ul>
              <li>{isArabic ? 'ظهور أفضل في نتائج البحث' : 'Better visibility in search results'}</li>
              <li>{isArabic ? 'أولوية في التوصيات' : 'Priority in recommendations'}</li>
              <li>{isArabic ? 'معدل تحويل أعلى' : 'Higher conversion rates'}</li>
              <li>{isArabic ? 'ثقة أكبر من العملاء' : 'Increased customer trust'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScoreExample;
