import React from 'react';

const ToggleSwitch = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        {description && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{description}</span>
        )}
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;