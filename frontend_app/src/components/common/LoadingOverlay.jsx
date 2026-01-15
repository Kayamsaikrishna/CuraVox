import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ isLoading, message = 'Loading...', children }) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 rounded-lg">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-700 dark:text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;