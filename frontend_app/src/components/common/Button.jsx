import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';

// Define button variants using CVA (Class Variance Authority)
const buttonVariants = cva(
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-offset-white',
    'disabled:opacity-50',
    'disabled:pointer-events-none',
    'aria-disabled:opacity-50',
    'aria-disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-indigo-600',
          'text-white',
          'hover:bg-indigo-700',
          'focus:ring-indigo-500',
        ],
        secondary: [
          'bg-gray-200',
          'text-gray-800',
          'hover:bg-gray-300',
          'focus:ring-gray-500',
          'dark:bg-gray-600',
          'dark:text-white',
          'dark:hover:bg-gray-500',
          'dark:focus:ring-gray-500',
        ],
        outline: [
          'border',
          'border-gray-300',
          'bg-transparent',
          'text-gray-700',
          'hover:bg-gray-50',
          'focus:ring-gray-500',
          'dark:border-gray-600',
          'dark:text-gray-300',
          'dark:hover:bg-gray-700',
          'dark:focus:ring-gray-500',
        ],
        ghost: [
          'bg-transparent',
          'text-gray-700',
          'hover:bg-gray-100',
          'focus:ring-gray-500',
          'dark:text-gray-300',
          'dark:hover:bg-gray-700',
          'dark:focus:ring-gray-500',
        ],
        destructive: [
          'bg-red-600',
          'text-white',
          'hover:bg-red-700',
          'focus:ring-red-500',
        ],
      },
      size: {
        sm: ['py-1', 'px-2', 'text-xs'],
        md: ['py-2', 'px-4', 'text-sm'],
        lg: ['py-3', 'px-6', 'text-base'],
      },
      fullWidth: {
        true: ['w-full'],
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };