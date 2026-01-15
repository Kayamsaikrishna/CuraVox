import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ text, speed = 1, pitch = 1, volume = 1, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Chrome loads voices asynchronously
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (text) {
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      
      // Set properties
      utteranceRef.current.rate = speed;
      utteranceRef.current.pitch = pitch;
      utteranceRef.current.volume = volume;
      
      // Try to set a good default voice
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') || 
        voice.lang.includes('US') || 
        voice.lang.includes('GB')
      );
      
      if (englishVoice) {
        utteranceRef.current.voice = englishVoice;
      }
      
      utteranceRef.current.onstart = () => setIsPlaying(true);
      utteranceRef.current.onend = () => setIsPlaying(false);
      utteranceRef.current.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  const stop = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stop();
    } else {
      speak();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={togglePlayback}
        className="flex items-center justify-center p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        aria-label={isPlaying ? "Stop reading" : "Start reading"}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {isPlaying ? 'Reading...' : 'Ready to read'}
      </span>
    </div>
  );
};

export default AudioPlayer;