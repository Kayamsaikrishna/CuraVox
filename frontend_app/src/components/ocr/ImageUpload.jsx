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
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': []
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`
          w-full relative border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all duration-500
          ${isDragActive ? 'border-[#76a04e] bg-[#76a04e]/5 shadow-2xl' : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200'}
        `}
        aria-label="Upload medicine image"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-3xl mb-8 flex items-center justify-center transition-all duration-500 ${isDragActive ? 'bg-[#76a04e] text-white' : 'bg-white text-[#1a365d] shadow-sm'}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {isDragActive ? "Ready to upload" : "Upload Medicine Image"}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Drag & Drop a photo or click to select
            </p>
            <div className="pt-4 flex items-center justify-center gap-6">
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-3 py-1 border border-slate-100 rounded">PNG</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-3 py-1 border border-slate-100 rounded">JPG</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-3 py-1 border border-slate-100 rounded">JPEG</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-200 rounded-tl"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-200 rounded-tr"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-200 rounded-bl"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-200 rounded-br"></div>
      </div>

      <div className="mt-10 w-full max-w-sm">
        <button
          type="button"
          disabled={isLoading}
          className="w-full py-5 rounded-2xl bg-[#1a365d] text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:shadow-[#1a365d]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          onClick={() => document.querySelector('input[type="file"]').click()}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-4">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            'Browse Photos'
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;