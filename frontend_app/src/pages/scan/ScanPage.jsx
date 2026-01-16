import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import CameraCapture from '../../components/ocr/CameraCapture';
import ImageUpload from '../../components/ocr/ImageUpload';
import OCRResultDisplay from '../../components/ocr/OCRResultDisplay';
import { Button } from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import useAccessibility from '../../hooks/useAccessibility';
import api from '../../services/api';
import VoiceService from '../../services/voiceService';

const ScanPage = () => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [isLoading, setIsLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const { speak } = useAccessibility();
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    // Listen for voice commands
    const handleVoiceCommand = (event) => {
      const { command } = event.detail;
      switch (command) {
        case 'startCamera':
          if (activeTab === 'camera') {
            // Trigger camera start
            document.querySelector('[aria-label="Capture image for OCR processing"]')?.click();
          }
          break;
        case 'captureImage':
          document.querySelector('[aria-label="Capture image for OCR processing"]')?.click();
          break;
        case 'uploadImage':
          if (activeTab === 'upload') {
            document.querySelector('input[type="file"]')?.click();
          }
          break;
        case 'stopCamera':
          // Handle camera stop if needed
          break;
      }
    };

    window.addEventListener('voiceCommand', handleVoiceCommand);
    return () => window.removeEventListener('voiceCommand', handleVoiceCommand);
  }, [activeTab]);

  const handleCapture = async (imageFile) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/ocr/process', formData);

      if (response.data.success) {
        setOcrResult(response.data.data);
        speak("OCR scan completed successfully");
        voiceService.speak(`Found medicine: ${response.data.data.medicineName || 'Unknown medicine'}`);
      } else {
        throw new Error(response.data.message || 'OCR processing failed');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError(err.message || 'Failed to process image');
      speak("Error processing image. Please try again.");
      voiceService.speak("OCR processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (imageFile) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      // console.log('Uploading file:', imageFile.name, imageFile.type, imageFile.size);

      const response = await api.post('/ocr/process', formData, {
        headers: {
          'Content-Type': undefined // Let browser set multipart/form-data with boundary
        }
      });

      if (response.data.success) {
        setOcrResult(response.data.data);
        speak("Image uploaded and processed successfully");
        voiceService.speak(`Found medicine: ${response.data.data.medicineName || 'Unknown medicine'}`);
      } else {
        throw new Error(response.data.message || 'OCR processing failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to process image';
      setError(msg);
      alert('OCR Failed: ' + msg); // Force user to see exact cause
      speak("Error processing uploaded image. " + msg);
      voiceService.speak("Image processing failed: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOcrResult(null);
    setError(null);
    speak("Scan results cleared");
  };

  return (
    <div className="scan-page max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Scanner</h1>
        <p className="text-lg text-gray-600">
          Scan medicine packages to get detailed information about dosage, usage, and side effects
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium">
            💬 Voice Commands: Say "Start scanning" or "Upload image"
          </p>
        </div>
      </div>

      <Card className="p-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'camera'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('camera')}
            aria-selected={activeTab === 'camera'}
            role="tab"
          >
            Camera Scan
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'upload'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('upload')}
            aria-selected={activeTab === 'upload'}
            role="tab"
          >
            Upload Image
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'camera' && (
            <div className="camera-tab">
              <h2 className="text-xl font-semibold mb-4">Scan Using Camera</h2>
              <p className="text-gray-600 mb-6">
                Point your camera at the medicine package and capture a clear image of the label
              </p>
              <CameraCapture onCapture={handleCapture} isLoading={isLoading} />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="upload-tab">
              <h2 className="text-xl font-semibold mb-4">Upload Medicine Image</h2>
              <p className="text-gray-600 mb-6">
                Upload a clear photo of the medicine package or prescription
              </p>
              <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
            </div>
          )}
        </div>

        {/* OCR Result Section */}
        {(ocrResult || error) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">OCR Results</h2>
              <Button variant="outline" onClick={handleReset}>
                Scan Another
              </Button>
            </div>

            <OCRResultDisplay
              result={ocrResult}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}

        {isLoading && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 animate-pulse text-center">
            <h3 className="text-yellow-800 font-semibold text-lg flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Medicine...
            </h3>
            <p className="text-yellow-700 mt-2">
              This might take a moment while we wake up the AI brain. <br />
              Please wait...
            </p>
          </div>
        )}
      </Card>

      {/* Voice Control Section */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-800 flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7 7 0 0015.73 17c.21.21.42.41.63.61.21.2.42.4.63.6.2-.2.41-.4.63-.6.21-.2.42-.4.63-.6A7 7 0 0011 14.93V12a1 1 0 10-2 0v2.93A7 7 0 004.27 17c.21.21.42.41.63.61.21.2.42.4.63.6.2-.2.41-.4.63-.6.21-.2.42-.4.63-.6A7 7 0 009 14.93V12a1 1 0 10-2 0v2.93z" clipRule="evenodd" />
          </svg>
          Voice Control Active
        </h3>
        <p className="text-green-700">
          Say "Help" for voice commands • Press Spacebar to toggle listening
        </p>
      </div>
    </div>
  );
};

export default ScanPage;