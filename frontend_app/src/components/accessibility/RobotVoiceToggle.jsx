import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../common/ToggleSwitch';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { speak } from '../../utils/speech';

const RobotVoiceToggle = () => {
  const [robotVoiceEnabled, setRobotVoiceEnabled] = useState(true);
  const [voiceType, setVoiceType] = useState('standard'); // 'standard', 'robotic', 'enhanced'

  // Initialize from localStorage or default
  useEffect(() => {
    const savedSetting = localStorage.getItem('robotVoiceEnabled');
    if (savedSetting !== null) {
      setRobotVoiceEnabled(JSON.parse(savedSetting));
    }
    
    const savedVoiceType = localStorage.getItem('voiceType');
    if (savedVoiceType) {
      setVoiceType(savedVoiceType);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('robotVoiceEnabled', JSON.stringify(robotVoiceEnabled));
  }, [robotVoiceEnabled]);

  useEffect(() => {
    localStorage.setItem('voiceType', voiceType);
  }, [voiceType]);

  // Toggle robot voice functionality
  const handleToggle = (enabled) => {
    setRobotVoiceEnabled(enabled);
    
    // Provide immediate feedback
    if (enabled) {
      speak('Robot voice feature enabled. Audio notifications will now play with robotic voice effects.', { 
        rate: 0.9, 
        pitch: 0.8 
      });
    } else {
      speak('Robot voice feature disabled. Standard audio playback activated.', { 
        rate: 1.1, 
        pitch: 1.2 
      });
    }
  };

  // Change voice type
  const handleVoiceTypeChange = (type) => {
    setVoiceType(type);
    
    let message = '';
    switch (type) {
      case 'robotic':
        message = 'Robotic voice mode activated. Audio will sound more mechanical.';
        break;
      case 'enhanced':
        message = 'Enhanced voice mode activated. Audio will be clearer and more pronounced.';
        break;
      default:
        message = 'Standard voice mode activated.';
    }
    
    speak(message, { rate: type === 'robotic' ? 0.8 : 1.0, pitch: type === 'robotic' ? 0.7 : 1.0 });
  };

  // Test the voice
  const handleTestVoice = () => {
    const testMessage = robotVoiceEnabled 
      ? 'This is a test of the robot voice system. Audio notifications will be played with enhanced clarity for visually impaired users.' 
      : 'Robot voice is currently disabled. Standard audio playback will be used.';
    
    const options = {
      rate: voiceType === 'robotic' ? 0.8 : 1.0,
      pitch: voiceType === 'robotic' ? 0.7 : 1.0,
      volume: 1
    };
    
    speak(testMessage, options);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Robot Voice Output</h3>
          <p className="text-gray-700 mb-4">
            Control audio notifications and voice output for medication reminders and other alerts.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Audio Notifications</span>
              <ToggleSwitch
                checked={robotVoiceEnabled}
                onChange={handleToggle}
                label={robotVoiceEnabled ? 'ON' : 'OFF'}
                labelPosition="left"
                className="bg-blue-600"
              />
            </div>
            
            {robotVoiceEnabled && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Voice Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'robotic', label: 'Robotic' },
                    { value: 'enhanced', label: 'Enhanced Clarity' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVoiceTypeChange(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        voiceType === option.value
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-blue-300 hover:bg-blue-50'
                      }`}
                      aria-pressed={voiceType === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleTestVoice}
            variant="secondary"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            Test Voice
          </Button>
          
          {robotVoiceEnabled && (
            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded-lg">
              {voiceType === 'robotic' 
                ? 'Robotic: Mechanical voice for enhanced clarity' 
                : voiceType === 'enhanced' 
                  ? 'Enhanced: Clear, pronounced audio' 
                  : 'Standard: Natural voice output'}
            </div>
          )}
        </div>
      </div>

      {robotVoiceEnabled && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Accessibility Feature
          </h4>
          <p className="text-blue-700 text-sm">
            Robot voice enhances audio clarity for visually impaired users. The {voiceType} voice type provides optimal audio feedback for medication reminders and other important notifications.
          </p>
        </div>
      )}
    </Card>
  );
};

export default RobotVoiceToggle;