import React from 'react';
import { FolderOpenIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ title, description, icon: Icon = FolderOpenIcon, action, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700">
        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;