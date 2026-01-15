import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ImageUpload = ({ onUpload, isLoading, accept = 'image/*' }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  return (
    <div className="image-upload">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
        aria-label="Image upload area"
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, JPEG (Max 5MB)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          type="button"
          disabled={isLoading}
          className="px-6 py-3 text-lg font-semibold"
          onClick={() => document.querySelector('input[type="file"]').click()}
        >
          {isLoading ? (
            <span className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Processing...
            </span>
          ) : (
            'Select Image'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;