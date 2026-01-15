import { useState, useEffect } from 'react';
import { useVoiceFeedback } from '../contexts/VoiceFeedbackContext';

const useAccessibility = () => {
  const [isVoiceEnabled] = useState(true);
  const { shouldSpeak, isVoiceEnabled: voiceFeedbackEnabled, resetSpokenTexts } = useVoiceFeedback();
  
  const speak = (text) => {
    if (!voiceFeedbackEnabled || !text) return;
    
    // Check if this text has already been spoken recently
    if (shouldSpeak(text)) {
      // Use the Web Speech API to speak the text
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set speech properties
        utterance.rate = 0.9; // Slightly slower than default for better comprehension
        utterance.pitch = 1.2; // Slightly higher pitch for clarity
        utterance.volume = 1; // Full volume
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    speak,
    stopSpeaking,
    isVoiceEnabled: voiceFeedbackEnabled
  };
};

export default useAccessibility;