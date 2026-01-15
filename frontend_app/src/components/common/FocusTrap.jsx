import React, { useEffect, useRef } from 'react';

const FocusTrap = ({ children, isActive, returnFocus }) => {
  const wrapperRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Store the element that had focus before the trap was activated
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement;
    }
  }, [isActive]);

  // Focus trap logic
  useEffect(() => {
    if (!isActive || !wrapperRef.current) return;

    const focusableElements = wrapperRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Focus the first element when the trap activates
    firstElement.focus();

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus to the element that had focus before the trap was activated
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, returnFocus]);

  return <div ref={wrapperRef}>{children}</div>;
};

export default FocusTrap;