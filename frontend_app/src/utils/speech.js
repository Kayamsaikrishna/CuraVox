/**
 * Utility functions for speech synthesis
 */

// Speak text using Web Speech API
export const speak = (text, options = {}) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported or disabled');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Apply options
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  // Set language based on user preference or default to English
  utterance.lang = options.lang || 'en-US';

  // Speak the text
  window.speechSynthesis.speak(utterance);
};

// Check if speech synthesis is supported
export const isSpeechSupported = () => {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
};

// Get available voices
export const getAvailableVoices = () => {
  if (!isSpeechSupported()) return [];

  // Chrome loads voices asynchronously
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
};

// Stop all speech
export const stopSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

// Pause speech
export const pauseSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
  }
};

// Resume speech
export const resumeSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.resume();
  }
};