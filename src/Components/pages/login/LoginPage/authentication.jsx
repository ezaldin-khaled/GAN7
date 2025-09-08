import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import './authentication.css';
import back_img from '../assets/img/purpleq.jpg'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../api/axios';
import GeometricShape from './GeometricShape';
import logo from '../../../../assets/10.png';
import { AuthContext } from '../../../context/AuthContext';

const AuthPage = () => {
  const { t } = useTranslation();
  const [loginRole, setLoginRole] = useState('talent');
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gender: '',
    date_of_birth: '',
    country: '',
    role: 'talent',
    account_type: 'talent'
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { login: authLogin, user } = useContext(AuthContext);

  // Check if user is already logged in on component mount
  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect to main page instead of /account
    }
  }, [navigate, user]);

  const HANDLE_LOGIN_CHANGE = (e) => {
    setLoginData({ ...loginData, [e.target.id.replace('login_', '')]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.id]: e.target.value });
  };

  // Fixed role change handler
  const _handleRoleChange = (e) => {
    const role = e.target.value;
    setRegisterData({ 
      ...registerData, 
      role: role,
      account_type: role
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      console.log('Sending login request with data:', loginData);
      const response = await axiosInstance.post(`/api/login/${loginRole}/`, loginData);
      console.log('Login response:', response.data);
      console.log('Login response ID:', response.data.id);
      console.log('Login response email:', response.data.email);
      console.log('Login response first_name:', response.data.first_name);
      console.log('Login response last_name:', response.data.last_name);
      
      // Enhanced token and user data storage
      if (response.data.access && response.data.refresh) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          name: `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim() || 'User',
          profilePic: response.data.profile_picture || null,
          is_talent: loginRole === 'talent',
          is_background: loginRole === 'background',
          email_verified: response.data.email_verified,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          account_type: loginRole
        };
        
        console.log('Created userData:', userData);
        console.log('UserData ID:', userData.id);
        console.log('UserData email:', userData.email);
        console.log('UserData name:', userData.name);

        // Use AuthContext login method
        authLogin(userData, response.data.access);
        
        // Also store refresh token
        localStorage.setItem('refresh', response.data.refresh);
        
        setSuccessMessage(t('auth.loginSuccess'));
        
        // Redirect to main page after a short delay to ensure state is updated
        setTimeout(() => {
          console.log('🔐 Redirecting to main page after login');
          // Use navigate instead of window.location.href to preserve state
          navigate('/');
        }, 1500);
      } else {
        throw new Error('Invalid response from server: Missing tokens');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Handle different error scenarios
      if (error.response) {
        if (error.response.status === 401) {
          setError(t('auth.invalidCredentials'));
        } else if (error.response.status === 404) {
          setError(t('auth.userNotFound'));
        } else {
          setError(error.response.data?.message || t('auth.loginFailed'));
        }
      } else if (error.request) {
        setError(t('auth.networkError'));
      } else {
        setError(t('auth.unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      // Validate all required fields
      const requiredFields = ['first_name', 'last_name', 'email', 'password', 'gender', 'role', 'country'];
      const missingFields = requiredFields.filter(field => !registerData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate date of birth
      if (!registerData.date_of_birth) {
        throw new Error('Please select your date of birth');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate password strength
      if (registerData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      console.log('📝 Registration data:', {
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        email: registerData.email,
        gender: registerData.gender,
        date_of_birth: registerData.date_of_birth,
        country: registerData.country,
        role: registerData.role
      });
      
      // Make registration request
      const response = await axiosInstance.post('/api/register/', registerData);
      
      console.log('✅ Registration successful:', response.data);
      
      // Handle successful registration
      if (response.data.success) {
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        
        // Clear form data
        setRegisterData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          gender: '',
          date_of_birth: '',
          country: '',
          role: 'talent',
          account_type: 'talent'
        });
        
        // Switch to login form after showing success message
        setTimeout(() => {
          setIsLoginActive(true);
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (status === 400) {
          // Validation errors
          if (data.errors) {
            const errorMessages = Object.entries(data.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`)
              .join('\n');
            setError(errorMessages);
          } else {
            setError(data.message || 'Please check your information and try again.');
          }
        } else if (status === 409) {
          setError('An account with this email already exists. Please use a different email or try logging in.');
        } else if (status === 422) {
          setError('Invalid data provided. Please check your information.');
        } else {
          setError(data.message || `Registration failed (${status}). Please try again.`);
        }
      } else if (error.request) {
        // Network error - no response received
        console.error('🌐 Network error:', error.request);
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Other errors (validation, etc.)
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginRegister = () => {
    setIsLoginActive(!isLoginActive);
    setError('');
    setSuccessMessage('');
  };

  const TOGGLE_LOGIN_PASSWORD_VISIBILITY = () => {
    setLoginPasswordVisible(!loginPasswordVisible);
  };

  const toggleRegisterPasswordVisibility = () => {
    setRegisterPasswordVisible(!registerPasswordVisible);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          {successMessage && <div className="auth-success">{successMessage}</div>}
          
          {isLoginActive ? (
            // Login form content
            <>
              <h1 className="auth-title">{t('auth.loginTitle')}</h1>
              {error && <div className="auth-error">{error}</div>}
              
              <div className="form-group role-selection">
                <label className="form-label">{t('auth.loginAs')}</label>
                <div className="role-options">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="loginRole"
                      value="talent"
                      checked={loginRole === 'talent'}
                      onChange={(e) => setLoginRole(e.target.value)}
                      disabled={isLoading}
                    />
                    <span>{t('auth.talent')}</span>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="loginRole"
                      value="background"
                      checked={loginRole === 'background'}
                      onChange={(e) => setLoginRole(e.target.value)}
                      disabled={isLoading}
                    />
                    <span>{t('auth.productionAssetsPro')}</span>
                  </label>
                </div>
              </div>
              
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="login_email" className="form-label">{t('auth.email')}</label>
                  <input
                    type="email"
                    id="login_email"
                    placeholder={t('auth.enterEmail')}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login_password" className="form-label">{t('auth.password')}</label>
                  <div className="password-input-container">
                    <input
                      type={loginPasswordVisible ? "text" : "password"}
                      id="login_password"
                      placeholder={t('auth.enterPassword')}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={TOGGLE_LOGIN_PASSWORD_VISIBILITY}
                      disabled={isLoading}
                    >
                      {loginPasswordVisible ? t('auth.hide') : t('auth.show')}
                    </button>
                  </div>
                </div>
                <div className="form-footer">
                  <a href="#" className="forgot-password">{t('auth.forgotPassword')}</a>
                </div>
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? t('auth.loggingIn') : t('auth.login')}
                </button>
              </form>
              
              
              <p className="auth-switch">
                {t('auth.dontHaveAccount')} 
                <button onClick={toggleLoginRegister} disabled={isLoading}>{t('auth.createAccount')}</button>
              </p>
            </>
          ) : (
            // Register form content
            <>
              <h1 className="auth-title">{t('auth.createAccountTitle')}</h1>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name" className="form-label">{t('auth.firstName')}</label>
                    <input
                      type="text"
                      id="first_name"
                      placeholder={t('auth.enterFirstName')}
                      value={registerData.first_name}
                      onChange={handleRegisterChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name" className="form-label">{t('auth.lastName')}</label>
                    <input
                      type="text"
                      id="last_name"
                      placeholder={t('auth.enterLastName')}
                      value={registerData.last_name}
                      onChange={handleRegisterChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">{t('auth.email')}</label>
                  <input 
                    type="email" 
                    id="email"
                    placeholder={t('auth.enterEmail')}
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required 
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">{t('auth.password')}</label>
                  <div className="password-input-container">
                    <input 
                      type={registerPasswordVisible ? "text" : "password"} 
                      id="password"
                      placeholder={t('auth.enterPassword')}
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required 
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={toggleRegisterPasswordVisibility}
                      disabled={isLoading}
                    >
                      {registerPasswordVisible ? t('auth.hide') : t('auth.show')}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">{t('auth.gender')}</label>
                  <select 
                    id="gender" 
                    name="gender" 
                    value={registerData.gender}
                    onChange={handleRegisterChange}
                    required
                    disabled={isLoading}
                  >
                    <option value="" disabled>{t('auth.selectGender')}</option>
                    <option value="Male">{t('auth.male')}</option>
                    <option value="Female">{t('auth.female')}</option>
                    <option value="Other">{t('auth.other')}</option>
                    <option value="prefer_not_to_say">{t('auth.preferNotToSay')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                  <div className="date-of-birth-container">
                    <select 
                      id="birth_month"
                      value={registerData.birth_month || ''}
                      onChange={(e) => {
                        const month = e.target.value;
                        setRegisterData({
                          ...registerData,
                          birth_month: month,
                          date_of_birth: updateDateString(registerData.birth_year, month, registerData.birth_day)
                        });
                      }}
                      required
                      disabled={isLoading}
                      className="date-select"
                    >
                      <option value="" disabled>Month</option>
                      <option value="01">January</option>
                      <option value="02">February</option>
                      <option value="03">March</option>
                      <option value="04">April</option>
                      <option value="05">May</option>
                      <option value="06">June</option>
                      <option value="07">July</option>
                      <option value="08">August</option>
                      <option value="09">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                    
                    <select 
                      id="birth_day"
                      value={registerData.birth_day || ''}
                      onChange={(e) => {
                        const day = e.target.value;
                        setRegisterData({
                          ...registerData,
                          birth_day: day,
                          date_of_birth: updateDateString(registerData.birth_year, registerData.birth_month, day)
                        });
                      }}
                      required
                      disabled={isLoading}
                      className="date-select"
                    >
                      <option value="" disabled>Day</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i+1} value={String(i+1).padStart(2, '0')}>
                          {i+1}
                        </option>
                      ))}
                    </select>
                    
                    <select 
                      id="birth_year"
                      value={registerData.birth_year || ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        setRegisterData({
                          ...registerData,
                          birth_year: year,
                          date_of_birth: updateDateString(year, registerData.birth_month, registerData.birth_day)
                        });
                      }}
                      required
                      disabled={isLoading}
                      className="date-select"
                    >
                      <option value="" disabled>Year</option>
                      {[...Array(100)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country</label>
                  <select 
                    id="country" 
                    value={registerData.country}
                    onChange={handleRegisterChange}
                    required 
                    disabled={isLoading}
                  >
                    <option value="">Select your country</option>
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

                <div className="form-group role-selection">
                  <label className="form-label">Role</label>
                  <div className="role-options">
                    <label className="role-option">
                      <input
                        type="radio"
                        name="role"
                        value="talent"
                        checked={registerData.role === 'talent'}
                        onChange={_handleRoleChange}
                        disabled={isLoading}
                      />
                      <span>Talent</span>
                    </label>
                    <label className="role-option">
                      <input
                        type="radio"
                        name="role"
                        value="background"  // Changed from 'background job' to 'background'
                        checked={registerData.role === 'background'}  // Updated check
                        onChange={_handleRoleChange}
                        disabled={isLoading}
                      />
                      <span>Production Assets Pro</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
                
                <p className="auth-switch">
                  Already have an account? 
                  <button type="button" onClick={toggleLoginRegister} disabled={isLoading}>Log In</button>
                </p>
              </form>
            </>
          )}
        </div>
        <div className="auth-image">
          <img src={logo} alt="Logo" className="auth-logo-topright" />
          <GeometricShape />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

// Helper function to update the date string
const updateDateString = (year, month, day) => {
  if (!year || !month || !day) return '';
  return `${year}-${month}-${day}`;
};