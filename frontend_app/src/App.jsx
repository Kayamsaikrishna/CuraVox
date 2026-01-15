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

const App = () => {
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    // Initialize voice service
    console.log('Voice service initialized');
    
    // Add keyboard shortcuts
    const handleKeyDown = (event) => {
      // Spacebar to toggle listening
      if (event.code === 'Space' && event.target.tagName !== 'INPUT') {
        event.preventDefault();
        voiceService.toggleListening();
      }
      // H for help
      else if (event.key.toLowerCase() === 'h') {
        event.preventDefault();
        voiceService.provideHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-blue-50">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/medicines" element={<MedicineListPage />} />
          <Route path="/medicines/:id" element={<MedicineDetailPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        {/* Global Voice Control Widget */}
        <VoiceControlWidget />
      </div>
    </ErrorBoundary>
  );
};

export default App;