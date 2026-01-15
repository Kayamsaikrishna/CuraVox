import React from 'react';

const Tooltip = ({ children, content, position = 'top', className = '' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block group">
      {children}
      <div className={`absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${positionClasses[position]} ${className}`}>
        <div className="relative">
          <div className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700">
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${position === 'top' ? 'border-t-gray-900 dark:border-t-gray-700 border-transparent' : ''} 
            ${position === 'bottom' ? 'border-b-gray-900 dark:border-b-gray-700 border-transparent' : ''}
            ${position === 'left' ? 'border-l-gray-900 dark:border-l-gray-700 border-transparent' : ''}
            ${position === 'right' ? 'border-r-gray-900 dark:border-r-gray-700 border-transparent' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;