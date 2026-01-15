import React, { useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

const FileUploader = ({ onFileSelect, accept, multiple = false, label = 'Upload File', className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    onFileSelect(fileArray);
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600 dark:hover:border-indigo-500'
        }`}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
        <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          Drag and drop your files here
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          or click to browse
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {accept ? `Accepted formats: ${accept}` : 'All file formats accepted'}
          {multiple ? ' (Multiple files allowed)' : ' (Single file only)'}
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Selected Files:</h4>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center truncate">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove file ${file.name}`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;