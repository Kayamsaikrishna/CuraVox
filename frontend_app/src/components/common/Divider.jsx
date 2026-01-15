import React from 'react';

const Divider = ({ text, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
      </div>
      {text && (
        <div className="relative flex justify-center">
          <span className="px-2 bg-white text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {text}
          </span>
        </div>
      )}
    </div>
  );
};

export default Divider;