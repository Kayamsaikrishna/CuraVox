import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceFeedbackContext = createContext();

export const useVoiceFeedback = () => {
  const context = useContext(VoiceFeedbackContext);
  if (!context) {
    throw new Error('useVoiceFeedback must be used within a VoiceFeedbackProvider');
  }
  return context;
};

export const VoiceFeedbackProvider = ({ children }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    const savedPreference = localStorage.getItem('voiceFeedbackEnabled');
    return savedPreference ? JSON.parse(savedPreference) : true;
  });

  const [spokenTexts, setSpokenTexts] = useState(new Set());

  useEffect(() => {
    localStorage.setItem('voiceFeedbackEnabled', JSON.stringify(isVoiceEnabled));
  }, [isVoiceEnabled]);

  const shouldSpeak = (text) => {
    if (!isVoiceEnabled) return false;
    
    // Check if this text has already been spoken
    const isAlreadySpoken = spokenTexts.has(text);
    
    if (!isAlreadySpoken) {
      setSpokenTexts(prev => new Set([...prev, text]));
      return true;
    }
    return false;
  };

  const resetSpokenTexts = () => {
    setSpokenTexts(new Set());
  };

  const toggleVoiceFeedback = () => {
    setIsVoiceEnabled(prev => !prev);
    // Reset spoken texts when toggling on to allow fresh announcements
    if (isVoiceEnabled) {
      setSpokenTexts(new Set());
    }
  };

  // Clear spoken texts periodically to avoid memory issues
  useEffect(() => {
    const interval = setInterval(() => {
      setSpokenTexts(new Set());
    }, 30000); // Clear every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value = {
    isVoiceEnabled,
    toggleVoiceFeedback,
    shouldSpeak,
    resetSpokenTexts
  };

  return (
    <VoiceFeedbackContext.Provider value={value}>
      {children}
    </VoiceFeedbackContext.Provider>
  );
};