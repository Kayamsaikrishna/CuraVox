import React from 'react';

const SkipNavigation = () => {
  const skipToMainContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        skipToMainContent();
      }}
      className="fixed top-4 left-4 z-50 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 -translate-y-full focus:translate-y-0 transition-transform"
    >
      Skip to main content
    </a>
  );
};

export default SkipNavigation;