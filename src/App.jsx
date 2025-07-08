import { Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './Components/pages/MainPage';
import LoginPage from './Components/pages/login/LoginPage/authentication';
import TalentAccount from './Components/pages/useraccount/UserAccountPage';
import BackgroundAccount from './Components/pages/useraccount/BackgroundAccountPage';
import AdminLogin from './Components/pages/admin/AdminLogin';
import AdminDashboard from './Components/pages/admin/AdminDashboard';
import SubscriptionPlans from './Components/pages/payment/SubscriptionPlans';
import SubscriptionSuccess from './Components/pages/payment/SubscriptionSuccess';
import GalleryPage from './Components/pages/GalleryPage';
import { AuthProvider } from './Components/context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import './i18n'; // Initialize i18n

// Component to conditionally redirect based on user type
const AccountRouter = () => {
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (userInfo.is_background) {
    return <BackgroundAccount />;
  }
  
  return <TalentAccount />;
};

// Protected route component for admin
const ProtectedAdminRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
  const accessToken = localStorage.getItem('access');
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('ProtectedAdminRoute: Checking admin status.');
  console.log('adminLoggedIn:', isAdminLoggedIn);
  console.log('accessToken:', accessToken ? 'exists' : 'missing');
  console.log('userInfo.isStaff:', userInfo.isStaff);

  // Check if admin is logged in (either by flag or by token + staff status)
  const isAdmin = isAdminLoggedIn === 'true' || (accessToken && userInfo.isStaff);
  
  if (!isAdmin) {
    console.log('ProtectedAdminRoute: Not admin or not logged in. Redirecting to /admin/login.');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('ProtectedAdminRoute: Admin is logged in. Rendering children.');
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
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/account" element={<AccountRouter />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard/*" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
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
  );
}

export default App;