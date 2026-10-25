import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import api from './api';
import BrandedAppShell from './components/BrandedAppShell';
import SplashScreen from './components/SplashScreen';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const AiToolsPage = lazy(() => import('./pages/AiToolsPage'));
const BrandedAuthPage = lazy(() => import('./pages/BrandedAuthPage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const DeveloperPage = lazy(() => import('./pages/DeveloperPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LiveAdminPage = lazy(() => import('./pages/LiveAdminPage'));
const LiveAnalyticsPage = lazy(() => import('./pages/LiveAnalyticsPage'));
const LiveDashboardPage = lazy(() => import('./pages/LiveDashboardPage'));
const LiveHistoryPage = lazy(() => import('./pages/LiveHistoryPage'));
const LivePredictionPage = lazy(() => import('./pages/LivePredictionPage'));
const LiveProfilePage = lazy(() => import('./pages/LiveProfilePage'));

function ProtectedLayout({ user, onLogout }) {
  return user ? <BrandedAppShell user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />;
}

function RouteFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-sky-700">
      Initializing SkyIntel AI Engine...
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rain_user'));
    } catch {
      return null;
    }
  });

  const [checkingSession, setCheckingSession] = useState(Boolean(localStorage.getItem('rain_token')));
  const [showSplash, setShowSplash] = useState(true);

  const authenticate = (profile) => {
    localStorage.setItem('rain_user', JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('rain_token');
    localStorage.removeItem('rain_user');
    setUser(null);
  };

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('rain:unauthorized', onUnauthorized);

    const token = localStorage.getItem('rain_token');
    if (!token) {
      setCheckingSession(false);
      return () => window.removeEventListener('rain:unauthorized', onUnauthorized);
    }

    api
      .get('/users/me')
      .then(({ data }) => authenticate(data))
      .catch(logout)
      .finally(() => setCheckingSession(false));

    return () => window.removeEventListener('rain:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (checkingSession) return <RouteFallback />;

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <BrandedAuthPage onAuthenticated={authenticate} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <BrandedAuthPage onAuthenticated={authenticate} />}
        />

        <Route element={<ProtectedLayout user={user} onLogout={logout} />}>
          <Route path="/dashboard" element={<LiveDashboardPage user={user || { name: 'Explorer' }} />} />
          <Route path="/prediction" element={<LivePredictionPage />} />
          <Route path="/tools" element={<AiToolsPage />} />
          <Route path="/history" element={<LiveHistoryPage />} />
          <Route path="/analytics" element={<LiveAnalyticsPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/profile" element={<LiveProfilePage user={user || { name: '', email: '' }} />} />
          <Route
            path="/admin"
            element={
              user?.email?.toLowerCase().startsWith('admin@') || user?.role === 'admin' || user?.role === 'super_admin' ? (
                <LiveAdminPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </Suspense>
  );
}
