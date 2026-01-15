/**
 * Accessibility utilities for the Medical Assistant application
 */

/**
 * Focuses an element with an option to scroll it into view
 * @param {HTMLElement} element - The DOM element to focus
 * @param {Object} options - Options for scrolling behavior
 */
export const focusElement = (element, options = {}) => {
  if (!element) return;
  
  element.focus(options);
  
  if (options.scrollTo) {
    element.scrollIntoView(options.scrollTo);
  }
};

/**
 * Generates an accessible label for an element
 * @param {string} text - The text to use for the label
 * @returns {string} - A properly formatted accessible label
 */
export const generateAccessibleLabel = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

/**
 * Announces a message to screen readers using an ARIA live region
 * @param {string} message - The message to announce
 * @param {'polite'|'assertive'} priority - The priority of the announcement
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  // Create a temporary element for the announcement
  const announcement = document.createElement('div');
  const id = `announcement-${Date.now()}`;
  
  announcement.setAttribute('id', id);
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove the element after the announcement
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      document.body.removeChild(el);
    }
  }, 1000);
};

/**
 * Determines if the user is interacting with the keyboard
 * @returns {boolean} - True if the user is using keyboard navigation
 */
export const isUsingKeyboard = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Traps focus within a given container
 * @param {HTMLElement} container - The container element to trap focus within
 * @returns {Function} - Cleanup function to remove the trap
 */
export const trapFocus = (container) => {
  if (!container) return () => {};
  
  const focusableElements = container.querySelectorAll(
    'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  if (!focusableElements.length) return () => {};
  
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
  
  document.addEventListener('keydown', handleKeyDown);
  
  // Focus the first element initially
  firstElement.focus();
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Adds a skip link to the page for keyboard navigation
 * @param {string} targetId - The ID of the element to skip to
 * @param {string} linkText - The text for the skip link
 */
export const addSkipLink = (targetId, linkText = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = linkText;
  skipLink.className = 'sr-only focus:not-sr-only fixed top-4 left-4 z-50 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  return () => {
    if (skipLink.parentNode) {
      skipLink.parentNode.removeChild(skipLink);
    }
  };
};

/**
 * Gets the contrast ratio between two colors
 * @param {string} backgroundColor - The background color in hex format
 * @param {string} textColor - The text color in hex format
 * @returns {number} - The contrast ratio
 */
export const getContrastRatio = (backgroundColor, textColor) => {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    const sRGB = [r, g, b].map(val => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const bgLum = getLuminance(backgroundColor) + 0.05;
  const textLum = getLuminance(textColor) + 0.05;
  
  return Math.max(bgLum, textLum) / Math.min(bgLum, textLum);
};

/**
 * Checks if the contrast ratio meets WCAG standards
 * @param {string} backgroundColor - The background color in hex format
 * @param {string} textColor - The text color in hex format
 * @param {'AA'|'AAA'} level - The WCAG level to check against
 * @returns {boolean} - True if the contrast meets the standard
 */
export const meetsWCAGContrastStandard = (backgroundColor, textColor, level = 'AA') => {
  const ratio = getContrastRatio(backgroundColor, textColor);
  
  if (level === 'AAA') {
    return ratio >= 7; // For normal text
  }
  
  return ratio >= 4.5; // For normal text
};