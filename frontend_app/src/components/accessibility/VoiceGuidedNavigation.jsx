import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import ToggleSwitch from '../common/ToggleSwitch';
import { speak, stopSpeech } from '../../utils/speech';

const VoiceGuidedNavigation = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentFeature, setCurrentFeature] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [speed, setSpeed] = useState(1.0);
  const [autoGuide, setAutoGuide] = useState(true);
  const [guideInterval, setGuideInterval] = useState(null);
  
  const navigationRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('voiceGuidedNavigation');
    if (savedEnabled !== null) {
      setIsEnabled(JSON.parse(savedEnabled));
    }
    
    const savedVolume = localStorage.getItem('voiceNavigationVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
    
    const savedSpeed = localStorage.getItem('voiceNavigationSpeed');
    if (savedSpeed) {
      setSpeed(parseFloat(savedSpeed));
    }
    
    const savedAutoGuide = localStorage.getItem('voiceNavigationAutoGuide');
    if (savedAutoGuide !== null) {
      setAutoGuide(JSON.parse(savedAutoGuide));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('voiceGuidedNavigation', JSON.stringify(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem('voiceNavigationVolume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('voiceNavigationSpeed', speed.toString());
  }, [speed]);

  useEffect(() => {
    localStorage.setItem('voiceNavigationAutoGuide', JSON.stringify(autoGuide));
  }, [autoGuide]);

  // Auto-guide functionality
  useEffect(() => {
    if (isEnabled && autoGuide) {
      const interval = setInterval(() => {
        const features = [
          "Medication reminders help you stay on schedule with your medications.",
          "Use the scan feature to identify medicines using your camera.",
          "Visit your profile to manage personal health information.",
          "Check settings to customize accessibility features.",
          "Browse your medicine list to review medication details."
        ];
        
        const randomFeature = features[Math.floor(Math.random() * features.length)];
        speak(randomFeature, { volume, rate: speed });
      }, 30000); // Every 30 seconds
      
      setGuideInterval(interval);
    } else {
      if (guideInterval) {
        clearInterval(guideInterval);
        setGuideInterval(null);
      }
    }
    
    return () => {
      if (guideInterval) {
        clearInterval(guideInterval);
      }
    };
  }, [isEnabled, autoGuide, volume, speed, guideInterval]);

  // Toggle voice guided navigation
  const handleToggle = (enabled) => {
    setIsEnabled(enabled);
    
    if (enabled) {
      speak("Voice guided navigation enabled. I will help guide you through the application features. You can press H for help at any time.", { volume, rate: speed });
    } else {
      stopSpeech();
      speak("Voice guided navigation disabled.", { volume, rate: speed });
    }
  };

  // Guide to specific feature
  const guideToFeature = (feature) => {
    if (!isEnabled) return;
    
    setCurrentFeature(feature);
    
    const guideMessages = {
      home: "Welcome to the home page. Here you can access quick shortcuts to all major features.",
      scan: "You are now in the scan medicine section. Point your camera at a medicine package to identify it.",
      medicines: "In the medicines section, you can browse your medication list and view detailed information.",
      reminders: "The medication reminders page helps you manage your dosing schedule.",
      profile: "Your profile page contains personal health information and preferences.",
      settings: "In settings, you can customize accessibility features and app preferences."
    };
    
    const message = guideMessages[feature] || "Navigating to the selected feature.";
    speak(message, { volume, rate: speed });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isEnabled) return;
    
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'h') {
        speak("Press H for help, R for reminders, S for scan, M for medicines, P for profile, or T for settings.", { volume, rate: speed });
      } else if (e.key.toLowerCase() === 'r') {
        guideToFeature('reminders');
      } else if (e.key.toLowerCase() === 's') {
        guideToFeature('scan');
      } else if (e.key.toLowerCase() === 'm') {
        guideToFeature('medicines');
      } else if (e.key.toLowerCase() === 'p') {
        guideToFeature('profile');
      } else if (e.key.toLowerCase() === 't') {
        guideToFeature('settings');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, volume, speed]);

  // Speak current page information
  const speakCurrentPage = () => {
    if (!isEnabled) return;
    
    const pathname = window.location.pathname;
    let pageName = "unknown page";
    
    if (pathname === '/') pageName = "home page";
    else if (pathname === '/scan') pageName = "scan medicine page";
    else if (pathname === '/medicines') pageName = "medicines page";
    else if (pathname === '/reminders') pageName = "medication reminders page";
    else if (pathname === '/profile') pageName = "profile page";
    else if (pathname === '/settings') pageName = "settings page";
    else if (pathname.startsWith('/medicines/')) pageName = "medicine details page";
    
    speak(`You are currently on the ${pageName}.`, { volume, rate: speed });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-green-800 mb-2">Voice-Guided Navigation</h3>
          <p className="text-gray-700 mb-4">
            Enhanced audio guidance for seamless navigation through the application.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Voice Guidance</span>
              <ToggleSwitch
                checked={isEnabled}
                onChange={handleToggle}
                label={isEnabled ? 'ON' : 'OFF'}
                labelPosition="left"
                className="bg-green-600"
              />
            </div>
            
            {isEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume: {(volume * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speed: {speed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Auto Guide</span>
                  <ToggleSwitch
                    checked={autoGuide}
                    onChange={setAutoGuide}
                    label={autoGuide ? 'ON' : 'OFF'}
                    labelPosition="left"
                    className="bg-green-600"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => guideToFeature('home')}
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                  >
                    Guide to Home
                  </Button>
                  <Button
                    onClick={() => guideToFeature('scan')}
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                  >
                    Guide to Scan
                  </Button>
                  <Button
                    onClick={() => guideToFeature('reminders')}
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                  >
                    Guide to Reminders
                  </Button>
                  <Button
                    onClick={speakCurrentPage}
                    variant="secondary"
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                  >
                    Current Page
                  </Button>
                </div>
                
                {currentFeature && (
                  <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-green-800 text-sm">
                      Guiding to: {currentFeature.charAt(0).toUpperCase() + currentFeature.slice(1)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEnabled && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Keyboard Shortcuts
          </h4>
          <div className="grid grid-cols-2 gap-2 text-green-700 text-sm">
            <div><kbd>H</kbd> - Get help</div>
            <div><kbd>R</kbd> - Go to reminders</div>
            <div><kbd>S</kbd> - Go to scan</div>
            <div><kbd>M</kbd> - Go to medicines</div>
            <div><kbd>P</kbd> - Go to profile</div>
            <div><kbd>T</kbd> - Go to settings</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VoiceGuidedNavigation;