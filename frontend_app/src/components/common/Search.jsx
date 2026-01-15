import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Search = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative rounded-md shadow-sm ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-offset-gray-800 sm:text-sm dark:text-white"
      />
    </div>
  );
};

export default Search;