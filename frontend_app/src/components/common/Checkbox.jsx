import React from 'react';

const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 focus:ring-2 dark:focus:ring-indigo-500 dark:focus:ring-offset-2 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };