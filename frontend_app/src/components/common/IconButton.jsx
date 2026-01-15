import React from 'react';

const IconButton = ({ icon: Icon, onClick, variant = 'ghost', size = 'md', className = '', ...props }) => {
  const variantClasses = {
    primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 dark:text-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-500',
    destructive: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">{props['aria-label']}</span>
    </button>
  );
};

export default IconButton;