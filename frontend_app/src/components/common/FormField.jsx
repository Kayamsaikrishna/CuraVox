import React from 'react';
import { Label } from './Label';

const FormField = ({ label, id, children, error, description, required, ...props }) => {
  return (
    <div className="space-y-2" {...props}>
      {label && (
        <Label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" id={`${id}-error`}>
          {error}
        </p>
      )}
      {description && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400" id={`${id}-description`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default FormField;