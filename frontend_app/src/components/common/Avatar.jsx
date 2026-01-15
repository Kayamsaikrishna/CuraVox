import React from 'react';

const Avatar = ({ src, alt, initials, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-indigo-500 text-white font-medium ${sizeClasses[size]} ${className}`}
      aria-label={alt}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full rounded-full object-cover ${className}`}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;