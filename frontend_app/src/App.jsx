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
import ConsultationPage from './pages/consultation/ConsultationPage';
import NotFoundPage from './pages/NotFoundPage';
// import VoiceControlWidget from './components/common/VoiceControlWidget'; // Removed as requested
import VoiceService from './services/voiceService';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import SplashScreen from './components/common/SplashScreen';
import RouteAnnouncer from './components/common/RouteAnnouncer';
import VoiceNavigator from './components/common/VoiceNavigator';

const App = () => {
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
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

  // Show splash screen only ONCE per session (restart browser to reset)
  const [showSplash, setShowSplash] = React.useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  // Ensure voice is listening if splash is skipped
  useEffect(() => {
    if (!showSplash) {
      VoiceService.getInstance().startListening();
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onComplete={() => {
      sessionStorage.setItem('splashShown', 'true');
      setShowSplash(false);
      // Start listening after splash logic
      VoiceService.getInstance().startListening();
    }} />;
  }

  // Fallback: Start voice on any interaction
  const handleUserInteraction = () => {
    const vs = VoiceService.getInstance();
    if (!vs.isListening) {
      console.log("👆 User interaction detected: Starting Voice Service...");
      vs.startListening();
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouteAnnouncer />
        <VoiceNavigator />
        <div className="min-h-screen bg-blue-50" onClick={handleUserInteraction} onTouchStart={handleUserInteraction}>
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
            <Route path="/consultation" element={
              <PrivateRoute>
                <ConsultationPage />
              </PrivateRoute>
            } />

            {/* Redirect root to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* VoiceControlWidget Removed */}
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;