import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Collapsible = ({ title, children, defaultOpen = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Collapsible;