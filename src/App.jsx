import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import { useContext } from 'react';
import MainPage from './Components/pages/MainPage';
import LoginPage from './Components/pages/login/LoginPage/authentication';
import TalentAccount from './Components/pages/useraccount/UserAccountPage';
import BackgroundAccount from './Components/pages/useraccount/BackgroundAccountPage';
import AdminLogin from './Components/pages/admin/AdminLogin';
import AdminDashboard from './Components/pages/admin/AdminDashboard';
import SubscriptionPlans from './Components/pages/payment/SubscriptionPlans';
import SubscriptionSuccess from './Components/pages/payment/SubscriptionSuccess';
import { AuthContext, AuthProvider } from './Components/context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import './i18n'; // Initialize i18n

// Simple test component to show user data
const SimpleAccountTest = () => {
  const { user, loading } = useContext(AuthContext);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Simple Account Test</h3>
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <p>User exists: {user ? 'YES' : 'NO'}</p>
      {user && (
        <div>
          <p>Name: {user.first_name} {user.last_name}</p>
          <p>Type: {user.is_background ? 'Background' : 'Talent'}</p>
          <p>ID: {user.id}</p>
        </div>
      )}
      <p>LocalStorage user: {localStorage.getItem('user') ? 'EXISTS' : 'MISSING'}</p>
      <p>LocalStorage token: {localStorage.getItem('access') ? 'EXISTS' : 'MISSING'}</p>
    </div>
  );
};

// Test component to verify AuthContext
const AuthTest = () => {
  const { user, loading } = useContext(AuthContext);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>AuthContext Test</h3>
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <p>User: {user ? 'exists' : 'null'}</p>
      <p>User type: {user?.is_background ? 'background' : user?.is_talent ? 'talent' : 'unknown'}</p>
      <p>User name: {user?.first_name} {user?.last_name}</p>
      <p>LocalStorage user: {localStorage.getItem('user') ? 'exists' : 'null'}</p>
      <p>LocalStorage token: {localStorage.getItem('access') ? 'exists' : 'null'}</p>
    </div>
  );
};

// Simple test component to show current route
const RouteTest = () => {
  const location = window.location;
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
      <h3>Route Test Component</h3>
      <p><strong>Current URL:</strong> {location.href}</p>
      <p><strong>Pathname:</strong> {location.pathname}</p>
      <p><strong>Search:</strong> {location.search}</p>
      <p><strong>Hash:</strong> {location.hash}</p>
      <p><strong>Admin Flag:</strong> {localStorage.getItem('adminLoggedIn')}</p>
      <p><strong>User Data:</strong> {localStorage.getItem('user')}</p>
      <p><strong>Access Token:</strong> {localStorage.getItem('access') ? 'exists' : 'missing'}</p>
    </div>
  );
};

// Component to conditionally redirect based on user type
const AccountRouter = () => {
  const { user, loading } = useContext(AuthContext);
  
  // Fallback to localStorage if AuthContext doesn't provide user data
  const fallbackUser = !user && !loading ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const finalUser = user || fallbackUser;
  
  console.log('🔍 AccountRouter Debug:');
  console.log('  - AuthContext loading:', loading);
  console.log('  - AuthContext user:', user);
  console.log('  - Fallback user:', fallbackUser);
  console.log('  - Final user:', finalUser);
  console.log('  - User type:', finalUser?.is_background ? 'background' : 'talent');
  
  // Show loading state while auth is being checked
  if (loading) {
    console.log('🔍 AccountRouter: Still loading, showing loading state');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading account...
      </div>
    );
  }
  
  // If no user is logged in, redirect to login
  if (!finalUser) {
    console.log('🔍 AccountRouter: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Route based on user type
  if (finalUser.is_background) {
    console.log('🔍 AccountRouter: Rendering BackgroundAccount');
    return <BackgroundAccount />;
  }
  
  console.log('🔍 AccountRouter: Rendering TalentAccount');
  return <TalentAccount />;
};

// Protected route component for admin
const ProtectedAdminRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
  const accessToken = localStorage.getItem('access');
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('🔒 ProtectedAdminRoute: Checking admin status.');
  console.log('🔒 adminLoggedIn:', isAdminLoggedIn);
  console.log('🔒 accessToken:', accessToken ? 'exists' : 'missing');
  console.log('🔒 userInfo.isStaff:', userInfo.isStaff);
  console.log('🔒 userInfo:', userInfo);

  // Check if admin is logged in (either by flag or by token + staff status)
  const isAdmin = isAdminLoggedIn === 'true' || (accessToken && (userInfo.isStaff || userInfo.isDashboard || userInfo.isDashboardAdmin));
  
  console.log('🔒 Final isAdmin check result:', isAdmin);
  console.log('🔒 isAdminLoggedIn flag:', isAdminLoggedIn);
  console.log('🔒 userInfo.isStaff:', userInfo.isStaff);
  console.log('🔒 userInfo.isDashboard:', userInfo.isDashboard);
  console.log('🔒 userInfo.isDashboardAdmin:', userInfo.isDashboardAdmin);
  
  if (!isAdmin) {
    console.log('🔒 ProtectedAdminRoute: Not admin or not logged in. Redirecting to /admin/login.');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('🔒 ProtectedAdminRoute: Admin is logged in. Rendering children.');
  return children;
};

// Protected route component for authenticated users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountRouter />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route path="/simple-test" element={<SimpleAccountTest />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/test" element={<div>Admin Test Route Working!</div>} />
            <Route path="/route-test" element={<RouteTest />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AccountRouter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <SubscriptionPlans />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription/success" 
              element={
                <ProtectedRoute>
                  <SubscriptionSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription/cancel" 
              element={
                <ProtectedRoute>
                  <Navigate to="/subscription" replace />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;