import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const DropZone = ({ onDrop, accept, maxSize, children, ...props }) => {
  const onDropCallback = useCallback((acceptedFiles) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: onDropCallback,
    accept,
    maxSize,
    ...props
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : isDragReject 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600 dark:hover:border-indigo-500'
      }`}
    >
      <input {...getInputProps()} />
      {children || (
        <>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {isDragActive ? 'Drop the files here' : 'Drag & drop your image here'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            or click to select a file
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Supported formats: JPG, PNG, PDF (Max size: 10MB)
          </p>
        </>
      )}
    </div>
  );
};

export default DropZone;