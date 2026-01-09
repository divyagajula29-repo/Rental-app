import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ForgotPassword from './components/ForgotPassword';
import TenantDashboard from './components/TenantDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import TenantRegistration from './components/TenantRegistration';
import Layout from './components/Layout';
import { getCurrentUser, isTenantRegistered } from './utils/auth';
import { User } from './types';

type ViewType = 'auth' | 'forgot-password' | 'tenant-registration' | 'tenant-dashboard' | 'owner-dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('auth');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.role === 'tenant') {
          if (isTenantRegistered(currentUser.uid)) {
            setCurrentView('tenant-dashboard');
          } else {
            setCurrentView('tenant-registration');
          }
        } else {
          setCurrentView('owner-dashboard');
        }
      } else {
        setCurrentView('auth');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuth = (userData: User) => {
    setUser(userData);
    if (userData.role === 'tenant') {
      if (isTenantRegistered(userData.uid)) {
        setCurrentView('tenant-dashboard');
      } else {
        setCurrentView('tenant-registration');
      }
    } else {
      setCurrentView('owner-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('auth');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleResetSuccess = () => {
    setCurrentView('auth');
  };

  const handleRegistrationComplete = () => {
    if (user) {
      setCurrentView('tenant-dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'auth') {
    return <AuthPage onAuth={handleAuth} onForgotPassword={handleForgotPassword} />;
  }

  if (currentView === 'forgot-password') {
    return <ForgotPassword onBack={() => setCurrentView('auth')} onResetSuccess={handleResetSuccess} />;
  }

  if (currentView === 'tenant-registration') {
    return (
      <Layout user={user} onLogout={handleLogout}>
        <TenantRegistration onComplete={handleRegistrationComplete} />
      </Layout>
    );
  }

  if (currentView === 'tenant-dashboard') {
    return (
      <Layout user={user} onLogout={handleLogout}>
        <TenantDashboard />
      </Layout>
    );
  }

  if (currentView === 'owner-dashboard') {
    return (
      <Layout user={user} onLogout={handleLogout}>
        <OwnerDashboard />
      </Layout>
    );
  }

  return null;
}