import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import ProfileScore from './ProfileScore';
import axiosInstance from '../../../../api/axios';

const ProfileTab = ({ userData, handleInputChange, handleSaveChanges, loading: profileLoading }) => {
  const { t } = useTranslation();
  const [formattedDob, setFormattedDob] = useState('');
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch social media data
  useEffect(() => {
    fetchSocialMediaData();
  }, []);

  const fetchSocialMediaData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get('/api/profile/social-media/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setSocialMediaLinks({
          facebook: response.data.facebook || '',
          instagram: response.data.instagram || '',
          youtube: response.data.youtube || '',
          tiktok: response.data.tiktok || ''
        });
      }
    } catch (err) {
      console.error('Error fetching social media data:', err);
      if (err.response?.status === 404) {
        console.log('No social media data found - this is normal for new users');
        // Don't set error for 404, just use empty defaults
        setError(''); // Ensure error is cleared for normal 404 case
      } else if (err.response?.status === 403) {
        console.log('Access denied to social media endpoint - user may not have permission');
        // Don't set error for 403, just use empty defaults
        setError(''); // Ensure error is cleared for permission issues
      } else if (err.response?.status >= 500) {
        console.log('Server error fetching social media data - using defaults');
        // Don't set error for server errors, just use empty defaults
        setError(''); // Ensure error is cleared for server errors
      } else {
        console.log('Failed to load social media data - using defaults');
        // Only show error for unexpected client errors (like network issues)
        setError('Failed to load social media data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update formatted date whenever userData changes
  useEffect(() => {
    if (userData && userData.date_of_birth) {
      try {
        const dateString = userData.date_of_birth;
        const date = new Date(dateString);
        
        if (!isNaN(date.getTime())) {
          // Format as YYYY-MM-DD
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setFormattedDob(`${year}-${month}-${day}`);
        } else {
          console.log('Invalid date format from API:', dateString);
          setFormattedDob('');
        }
      } catch (error) {
        console.error('Error formatting date:', error);
        setFormattedDob('');
      }
    }
  }, [userData]);

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setSocialMediaLinks(prev => ({
      ...prev,
      [name]: value
    }));
    // Note: Social media data is handled separately and not sent to the parent userData
    // to avoid conflicts with the talent/background profile endpoints
  };

  const validateSocialMediaUrl = (url, platform) => {
    if (!url) return true; // Empty URLs are allowed
    
    const patterns = {
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+$/,
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/(channel\/|c\/|user\/)?[a-zA-Z0-9-]+|youtu\.be\/[a-zA-Z0-9-]+)$/,
      tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+$/
    };

    return patterns[platform].test(url);
  };

  const saveSocialMediaLinks = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate all URLs before saving
      const validationErrors = [];
      Object.entries(socialMediaLinks).forEach(([platform, url]) => {
        if (url && !validateSocialMediaUrl(url, platform)) {
          validationErrors.push(`${platform}: Invalid URL format`);
        }
      });

      if (validationErrors.length > 0) {
        setError(`Please fix the following URL formats: ${validationErrors.join(', ')}`);
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post('/api/profile/social-media/', socialMediaLinks, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        console.log('Social media links saved successfully');
        setError(''); // Clear any existing errors
        setSuccessMessage('Social media links saved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving social media data:', err);
      if (err.response?.status === 400) {
        setError('Invalid social media URL format. Please check your links.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update social media links.');
      } else {
        setError('Failed to save social media links. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProfileScore profileScore={userData.profile_score} />
      
    <div className="content-section">
      <h1 className="section-title">
        {t('profileTab.title')}
      </h1>

      <div className="profile-form-section">
        <h3 className="subsection-title">
          {t('profileTab.personalDetails')}
        </h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>{t('profileTab.fullName')}</label>
            <input 
              type="text" 
              name="full_name" 
              value={userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`} 
              onChange={handleInputChange}
              placeholder={t('profileTab.enterFullName')}
            />
          </div>
          
          <div className="form-group">
            <label>{t('profileTab.emailAddress')}</label>
            <div className="email-input-container">
              <input 
                type="email" 
                name="email" 
                value={userData.email || ''} 
                onChange={handleInputChange} 
                disabled 
                placeholder="Email address"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('profileTab.phoneNumber')}</label>
            <input 
              type="tel" 
              name="phone" 
              value={userData.phone || ''} 
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="form-group">
            <label>{t('profileTab.country')}</label>
            <input 
              type="text" 
              name="country" 
              value={userData.country || ''} 
              onChange={handleInputChange}
              placeholder={t('profileTab.enterCountry')}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('profileTab.city')}</label>
            <input 
              type="text" 
              name="city" 
              value={userData.city || ''} 
              onChange={handleInputChange}
              placeholder={t('profileTab.enterCity')}
            />
          </div>
          
          <div className="form-group">
            <label>{t('profileTab.countryOfResidence')}</label>
            <select 
              name="residency" 
              value={userData.residency || ''} 
              onChange={handleInputChange}
            >
              <option value="">Select your country of residence</option>
              <option value="ae">United Arab Emirates</option>
              <option value="us">United States</option>
              <option value="gb">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
              <option value="es">Spain</option>
              <option value="it">Italy</option>
              <option value="nl">Netherlands</option>
              <option value="be">Belgium</option>
              <option value="ch">Switzerland</option>
              <option value="at">Austria</option>
              <option value="se">Sweden</option>
              <option value="no">Norway</option>
              <option value="dk">Denmark</option>
              <option value="fi">Finland</option>
              <option value="pl">Poland</option>
              <option value="cz">Czech Republic</option>
              <option value="hu">Hungary</option>
              <option value="ro">Romania</option>
              <option value="bg">Bulgaria</option>
              <option value="gr">Greece</option>
              <option value="pt">Portugal</option>
              <option value="ie">Ireland</option>
              <option value="sa">Saudi Arabia</option>
              <option value="kw">Kuwait</option>
              <option value="qa">Qatar</option>
              <option value="bh">Bahrain</option>
              <option value="om">Oman</option>
              <option value="ye">Yemen</option>
              <option value="jo">Jordan</option>
              <option value="lb">Lebanon</option>
              <option value="sy">Syria</option>
              <option value="iq">Iraq</option>
              <option value="ir">Iran</option>
              <option value="af">Afghanistan</option>
              <option value="pk">Pakistan</option>
              <option value="bd">Bangladesh</option>
              <option value="lk">Sri Lanka</option>
              <option value="np">Nepal</option>
              <option value="bt">Bhutan</option>
              <option value="mm">Myanmar</option>
              <option value="th">Thailand</option>
              <option value="la">Laos</option>
              <option value="kh">Cambodia</option>
              <option value="vn">Vietnam</option>
              <option value="my">Malaysia</option>
              <option value="sg">Singapore</option>
              <option value="id">Indonesia</option>
              <option value="ph">Philippines</option>
              <option value="bn">Brunei</option>
              <option value="tl">East Timor</option>
              <option value="pg">Papua New Guinea</option>
              <option value="fj">Fiji</option>
              <option value="vu">Vanuatu</option>
              <option value="nc">New Caledonia</option>
              <option value="sb">Solomon Islands</option>
              <option value="ws">Samoa</option>
              <option value="to">Tonga</option>
              <option value="tv">Tuvalu</option>
              <option value="ki">Kiribati</option>
              <option value="mh">Marshall Islands</option>
              <option value="fm">Micronesia</option>
              <option value="pw">Palau</option>
              <option value="mp">Northern Mariana Islands</option>
              <option value="gu">Guam</option>
              <option value="as">American Samoa</option>
              <option value="ck">Cook Islands</option>
              <option value="nu">Niue</option>
              <option value="tk">Tokelau</option>
              <option value="pn">Pitcairn</option>
              <option value="wf">Wallis and Futuna</option>
              <option value="pf">French Polynesia</option>
              <option value="ru">Russia</option>
              <option value="ua">Ukraine</option>
              <option value="by">Belarus</option>
              <option value="md">Moldova</option>
              <option value="lv">Latvia</option>
              <option value="lt">Lithuania</option>
              <option value="ee">Estonia</option>
              <option value="ge">Georgia</option>
              <option value="am">Armenia</option>
              <option value="az">Azerbaijan</option>
              <option value="kz">Kazakhstan</option>
              <option value="uz">Uzbekistan</option>
              <option value="tm">Turkmenistan</option>
              <option value="tj">Tajikistan</option>
              <option value="kg">Kyrgyzstan</option>
              <option value="mn">Mongolia</option>
              <option value="kp">North Korea</option>
              <option value="tw">Taiwan</option>
              <option value="hk">Hong Kong</option>
              <option value="mo">Macau</option>
              <option value="va">Vatican City</option>
              <option value="sm">San Marino</option>
              <option value="mc">Monaco</option>
              <option value="li">Liechtenstein</option>
              <option value="ad">Andorra</option>
              <option value="mt">Malta</option>
              <option value="cy">Cyprus</option>
              <option value="is">Iceland</option>
              <option value="fo">Faroe Islands</option>
              <option value="gl">Greenland</option>
              <option value="al">Albania</option>
              <option value="mk">Macedonia</option>
              <option value="xk">Kosovo</option>
              <option value="me">Montenegro</option>
              <option value="ba">Bosnia and Herzegovina</option>
              <option value="hr">Croatia</option>
              <option value="si">Slovenia</option>
              <option value="sk">Slovakia</option>
              <option value="rs">Serbia</option>
              <option value="tr">Turkey</option>
              <option value="il">Israel</option>
              <option value="ps">Palestine</option>
              <option value="cn">China</option>
              <option value="jp">Japan</option>
              <option value="kr">South Korea</option>
              <option value="in">India</option>
              <option value="br">Brazil</option>
              <option value="mx">Mexico</option>
              <option value="ar">Argentina</option>
              <option value="cl">Chile</option>
              <option value="co">Colombia</option>
              <option value="pe">Peru</option>
              <option value="ve">Venezuela</option>
              <option value="uy">Uruguay</option>
              <option value="py">Paraguay</option>
              <option value="ec">Ecuador</option>
              <option value="bo">Bolivia</option>
              <option value="gy">Guyana</option>
              <option value="sr">Suriname</option>
              <option value="gf">French Guiana</option>
              <option value="fk">Falkland Islands</option>
              <option value="za">South Africa</option>
              <option value="ng">Nigeria</option>
              <option value="ke">Kenya</option>
              <option value="eg">Egypt</option>
              <option value="ma">Morocco</option>
              <option value="tn">Tunisia</option>
              <option value="dz">Algeria</option>
              <option value="ly">Libya</option>
              <option value="sd">Sudan</option>
              <option value="et">Ethiopia</option>
              <option value="ug">Uganda</option>
              <option value="tz">Tanzania</option>
              <option value="gh">Ghana</option>
              <option value="ci">Ivory Coast</option>
              <option value="sn">Senegal</option>
              <option value="ml">Mali</option>
              <option value="bf">Burkina Faso</option>
              <option value="ne">Niger</option>
              <option value="td">Chad</option>
              <option value="cm">Cameroon</option>
              <option value="cf">Central African Republic</option>
              <option value="cg">Congo</option>
              <option value="cd">Democratic Republic of the Congo</option>
              <option value="ao">Angola</option>
              <option value="zm">Zambia</option>
              <option value="zw">Zimbabwe</option>
              <option value="bw">Botswana</option>
              <option value="na">Namibia</option>
              <option value="mz">Mozambique</option>
              <option value="mg">Madagascar</option>
              <option value="mu">Mauritius</option>
              <option value="sc">Seychelles</option>
              <option value="km">Comoros</option>
              <option value="yt">Mayotte</option>
              <option value="re">Reunion</option>
              <option value="nz">New Zealand</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('profileTab.gender')}</label>
            <select name="gender" value={userData.gender || ''} onChange={handleInputChange}>
              <option value="">{t('profileTab.selectGender')}</option>
              <option value="Male">{t('auth.male')}</option>
              <option value="Female">{t('auth.female')}</option>
              <option value="Other">{t('auth.other')}</option>
              <option value="prefer_not_to_say">{t('auth.preferNotToSay')}</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>{t('profileTab.dateOfBirth')}</label>
            <input 
              type="date" 
              name="date_of_birth" 
              value={formattedDob} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>{t('profileTab.aboutYou')}</label>
          <textarea 
            name="aboutyou" 
            value={userData.aboutyou || ''} 
            onChange={handleInputChange} 
            rows="4"
            placeholder={t('profileTab.aboutYouPlaceholder')}
          />
        </div>
      </div>

      <div className="social-media-section">
        <h2>{t('profileTab.socialMediaLinks')}</h2>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {loading ? (
          <div className="loading-state">
            <LoadingSpinner text={t('profileTab.loadingSocialMedia')} />
          </div>
        ) : (
          <div className="social-media-grid">
            <div className="form-group">
              <label>Facebook</label>
              <div className="social-media-input-container">
                <input 
                  type="url" 
                  name="facebook" 
                  value={socialMediaLinks.facebook} 
                  onChange={handleSocialMediaChange}
                  placeholder={t('profileTab.facebookPlaceholder')}
                />
                {socialMediaLinks.facebook && (
                  <a 
                    href={socialMediaLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-media-link"
                    title="Visit Facebook profile"
                  >
                    🔗
                  </a>
                )}
              </div>
            </div>
            
            
            <div className="form-group">
              <label>Instagram</label>
              <div className="social-media-input-container">
                <input 
                  type="url" 
                  name="instagram" 
                  value={socialMediaLinks.instagram} 
                  onChange={handleSocialMediaChange}
                  placeholder={t('profileTab.instagramPlaceholder')}
                />
                {socialMediaLinks.instagram && (
                  <a 
                    href={socialMediaLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-media-link"
                    title="Visit Instagram profile"
                  >
                    🔗
                  </a>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>YouTube</label>
              <div className="social-media-input-container">
                <input 
                  type="url" 
                  name="youtube" 
                  value={socialMediaLinks.youtube} 
                  onChange={handleSocialMediaChange}
                  placeholder={t('profileTab.youtubePlaceholder')}
                />
                {socialMediaLinks.youtube && (
                  <a 
                    href={socialMediaLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-media-link"
                    title="Visit YouTube channel"
                  >
                    🔗
                  </a>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>TikTok</label>
              <div className="social-media-input-container">
                <input 
                  type="url" 
                  name="tiktok" 
                  value={socialMediaLinks.tiktok} 
                  onChange={handleSocialMediaChange}
                  placeholder={t('profileTab.tiktokPlaceholder')}
                />
                {socialMediaLinks.tiktok && (
                  <a 
                    href={socialMediaLinks.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-media-link"
                    title="Visit TikTok profile"
                  >
                    🔗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="button-group">
        <button 
          className="save-button" 
          onClick={async () => {
            await handleSaveChanges();
            await saveSocialMediaLinks();
          }}
          disabled={profileLoading || loading}
        >
          {profileLoading || loading ? <LoadingSpinner text={t('profileTab.saving')} /> : t('profileTab.saveChanges')}
        </button>
      </div>
    </div>
    </>
  );
};

export default ProfileTab;