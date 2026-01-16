import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import HomePage from './pages/dashboard/HomePage';
import MedicineListPage from './pages/medicine/MedicineListPage';
import MedicineDetailPage from './pages/medicine/MedicineDetailPage';
import RemindersPage from './pages/reminders/RemindersPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import ScanPage from './pages/scan/ScanPage';
import NotFoundPage from './pages/NotFoundPage';
import VoiceControlWidget from './components/common/VoiceControlWidget';
import VoiceService from './services/voiceService';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import SplashScreen from './components/common/SplashScreen';

const App = () => {
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    // Initialize voice service
    // console.log('Voice service initialized');

    // Add keyboard shortcuts
    const handleKeyDown = (event) => {
      // Spacebar to toggle listening
      if (event.code === 'Space' && event.target.tagName !== 'INPUT') {
        event.preventDefault();
        voiceService.toggleListening();
      }
      // H for help
      else if (event.key && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        voiceService.provideHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-start listening on mount (safety net)
    voiceService.startListening();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show splash screen on every refresh/mount as requested
  const [showSplash, setShowSplash] = React.useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => {
      setShowSplash(false);
      // Start listening after splash
      VoiceService.getInstance().startListening();
    }} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-blue-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/home" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/medicines" element={
              <PrivateRoute>
                <MedicineListPage />
              </PrivateRoute>
            } />
            <Route path="/medicines/:id" element={
              <PrivateRoute>
                <MedicineDetailPage />
              </PrivateRoute>
            } />
            <Route path="/reminders" element={
              <PrivateRoute>
                <RemindersPage />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/scan" element={
              <PrivateRoute>
                <ScanPage />
              </PrivateRoute>
            } />

            {/* Redirect root to home (which will redirect to login if needed) */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Global Voice Control Widget */}
          <VoiceControlWidget />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;