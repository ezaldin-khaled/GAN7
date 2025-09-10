// Authentication debugging utility
export const debugAuthStatus = () => {
  const token = localStorage.getItem('access');
  const refreshToken = localStorage.getItem('refresh');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Authentication Debug Info:');
  console.log('  - Access Token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
  console.log('  - Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NOT FOUND');
  console.log('  - User Data:', user ? JSON.parse(user) : 'NOT FOUND');
  
  if (token) {
    try {
      // Decode JWT token (basic decode without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('  - Token Payload:', payload);
      console.log('  - Token Expires:', new Date(payload.exp * 1000));
      console.log('  - Token Expired:', new Date() > new Date(payload.exp * 1000));
    } catch (e) {
      console.log('  - Token decode error:', e.message);
    }
  }
  
  return {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user,
    token,
    refreshToken,
    user: user ? JSON.parse(user) : null
  };
};

export const clearAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  console.log('✅ Authentication data cleared');
};

export const testApiConnection = async (axiosInstance) => {
  try {
    console.log('🧪 Testing API connection...');
    const response = await axiosInstance.get('/api/profile/talent/');
    console.log('✅ API connection successful:', response.status);
    return true;
  } catch (error) {
    console.log('❌ API connection failed:', error.response?.status, error.message);
    return false;
  }
};
