import React from 'react';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Alert = ({ variant = 'info', title, children, icon: IconOverride, ...props }) => {
  const variantClasses = {
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-400 dark:text-blue-300',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-400 dark:text-yellow-300',
    },
    success: {
      container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-400 dark:text-green-300',
    },
    error: {
      container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-400 dark:text-red-300',
    },
  };

  const defaultIcons = {
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    error: XCircleIcon,
  };

  const Icon = IconOverride || defaultIcons[variant];

  return (
    <div
      className={`border-l-4 p-4 rounded-r ${variantClasses[variant].container} ${variantClasses[variant].text}`}
      role="alert"
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${variantClasses[variant].icon}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${variantClasses[variant].text}`}>
              {title}
            </h3>
          )}
          <div className={`mt-2 text-sm ${variantClasses[variant].text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;