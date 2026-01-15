import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    
    // Add first page if not included
    if (currentPage - delta > 1) {
      pages.unshift(1);
      if (currentPage - delta > 2) {
        pages.splice(1, 0, '...');
      }
    }
    
    // Add last page if not included
    if (currentPage + delta < totalPages) {
      if (currentPage + delta < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={`flex items-center justify-between ${className}`} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        Previous
      </button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              page === currentPage
                ? 'bg-indigo-600 text-white'
                : typeof page === 'number'
                  ? 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  : 'bg-white text-gray-700 cursor-default dark:bg-gray-700 dark:text-gray-300'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
            disabled={typeof page !== 'number'}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Next
        <ChevronRightIcon className="h-5 w-5 ml-2" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;