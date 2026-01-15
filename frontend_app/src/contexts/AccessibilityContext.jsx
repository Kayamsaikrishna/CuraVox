import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderFriendly, setScreenReaderFriendly] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedScreenReaderFriendly = localStorage.getItem('screenReaderFriendly') === 'true';
    const savedReduceMotion = localStorage.getItem('reduceMotion') === 'true';

    if (savedFontSize) setFontSize(savedFontSize);
    setHighContrast(savedHighContrast);
    setScreenReaderFriendly(savedScreenReaderFriendly);
    setReduceMotion(savedReduceMotion);
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-multiplier', 
      fontSize === 'small' ? '0.875' : fontSize === 'large' ? '1.125' : '1');
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('screen-reader-friendly', screenReaderFriendly);
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);

    // Save to localStorage
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('highContrast', highContrast.toString());
    localStorage.setItem('screenReaderFriendly', screenReaderFriendly.toString());
    localStorage.setItem('reduceMotion', reduceMotion.toString());
  }, [fontSize, highContrast, screenReaderFriendly, reduceMotion]);

  const increaseFontSize = () => {
    if (fontSize === 'small') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('large');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'large') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('small');
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const toggleScreenReaderFriendly = () => {
    setScreenReaderFriendly(!screenReaderFriendly);
  };

  const toggleReduceMotion = () => {
    setReduceMotion(!reduceMotion);
  };

  const value = {
    fontSize,
    highContrast,
    screenReaderFriendly,
    reduceMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleScreenReaderFriendly,
    toggleReduceMotion
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};