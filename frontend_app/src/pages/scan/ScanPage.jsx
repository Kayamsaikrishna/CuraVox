import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import CameraCapture from '../../components/ocr/CameraCapture';
import ImageUpload from '../../components/ocr/ImageUpload';
import OCRResultDisplay from '../../components/ocr/OCRResultDisplay';
import { Button } from '../../components/common/Button';
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
      }
    };

    window.addEventListener('voiceCommand', handleVoiceCommand);
    return () => window.removeEventListener('voiceCommand', handleVoiceCommand);
  }, [activeTab]);

  const handleCapture = async (imageFile) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📸 Sending Capture to OCR:', imageFile);
      if (imageFile instanceof Blob) {
        console.log('📦 File Details:', { size: imageFile.size, type: imageFile.type });
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/ocr/process', formData, {
        headers: {
          'Content-Type': undefined
        }
      });

      if (response.data.success) {
        setOcrResult(response.data.data);
        speak("OCR scan completed successfully");
        voiceService.speak(`Found medicine: ${response.data.data.medicineName || 'Unknown medicine'}`);
      } else {
        throw new Error(response.data.message || 'OCR processing failed');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      // Don't show technical error, show user friendly state
      setError(err.message || 'Failed to process image');
      speak("Error processing image. Please try again.");
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
      setError(err.message || 'Failed to process image');
      speak("Error processing uploaded image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOcrResult(null);
    setError(null);
    speak("Scan results cleared");
  };

  // Reminder Modal State and Logic
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    medicineName: '',
    dosage: '',
    time: '09:00',
    frequency: 'daily'
  });

  const handleSetReminder = () => {
    if (ocrResult) {
      const aiData = ocrResult.aiAnalysis || ocrResult;
      setReminderForm({
        medicineName: aiData.medicineName || '',
        dosage: aiData.strength || aiData.dosage || '',
        time: '09:00',
        frequency: 'daily'
      });
      setShowReminderModal(true);
      speak(`Setting reminder for ${aiData.medicineName}`);
    }
  };

  const saveReminder = async () => {
    try {
      await api.post('/medicine/reminders', reminderForm);
      speak("Reminder saved successfully");
      voiceService.speak(`I have set a daily reminder for ${reminderForm.medicineName} at ${reminderForm.time}`);
      setShowReminderModal(false);
    } catch (err) {
      console.error("Failed to save reminder", err);
      speak("Failed to save reminder. Please try again.");
    }
  };

  return (
    <div className="scan-page max-w-4xl mx-auto p-4 font-sans relative">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Scanner</h1>
        <p className="text-lg text-gray-600">
          Scan medicine packages to get detailed information and set reminders
        </p>
      </div>

      <Card className="p-6 border-2 border-blue-100 shadow-md">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-4">
          <button
            className={`py-3 px-6 font-semibold text-lg rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'camera'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
            onClick={() => setActiveTab('camera')}
            aria-selected={activeTab === 'camera'}
            role="tab"
          >
            <span>📷</span> Camera Scan
          </button>
          <button
            className={`py-3 px-6 font-semibold text-lg rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'upload'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
            onClick={() => setActiveTab('upload')}
            aria-selected={activeTab === 'upload'}
            role="tab"
          >
            <span>🖼️</span> Upload Image
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content min-h-[400px]">
          {activeTab === 'camera' && (
            <div className="camera-tab">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Scan Using Camera</h2>
              <p className="text-gray-600 mb-6">
                Point your camera at the medicine package and capture a clear image of the label
              </p>
              <CameraCapture onCapture={handleCapture} isLoading={isLoading} />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="upload-tab">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Upload Medicine Image</h2>
              <p className="text-gray-600 mb-6">
                Upload a clear photo of the medicine package or prescription
              </p>
              <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
            </div>
          )}
        </div>

        {/* Results Section */}
        {(ocrResult || error) && (
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>📊</span> Scan Results
              </h2>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="gap-2 border-gray-300">
                  <span>🔄</span> Scan Again
                </Button>
              </div>
            </div>

            <OCRResultDisplay
              result={ocrResult}
              isLoading={isLoading}
              error={error}
              onSetReminder={handleSetReminder}
            />
          </div>
        )}

        {isLoading && (
          <div className="mt-8 p-8 bg-blue-50 rounded-xl border-2 border-blue-100 flex flex-col items-center justify-center text-center">
            <div className="animate-spin text-4xl mb-4">⌛</div>
            <h3 className="text-xl font-bold text-blue-800 mb-2">Analyzing Image...</h3>
            <p className="text-blue-600">Identifying medicine details and extracting text.</p>
          </div>
        )}

      </Card>

      {/* Reminder Modal Overlay */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-2 border-purple-100">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
                <span>⏰</span> Set Medicine Reminder
              </h2>
              <button onClick={() => setShowReminderModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Medicine Name</label>
                <div className="flex items-center gap-2 border rounded-lg p-2 bg-purple-50 border-purple-100">
                  <span>💊</span>
                  <input
                    type="text"
                    value={reminderForm.medicineName}
                    onChange={e => setReminderForm({ ...reminderForm, medicineName: e.target.value })}
                    className="bg-transparent w-full outline-none font-semibold text-purple-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Dosage</label>
                <div className="flex items-center gap-2 border rounded-lg p-2 border-gray-200">
                  <span>💉</span>
                  <input
                    type="text"
                    value={reminderForm.dosage}
                    onChange={e => setReminderForm({ ...reminderForm, dosage: e.target.value })}
                    placeholder="e.g. 1 tablet"
                    className="bg-transparent w-full outline-none text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                  <div className="flex items-center gap-2 border rounded-lg p-2 border-gray-200">
                    <span>🕐</span>
                    <input
                      type="time"
                      value={reminderForm.time}
                      onChange={e => setReminderForm({ ...reminderForm, time: e.target.value })}
                      className="bg-transparent w-full outline-none text-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Frequency</label>
                  <div className="flex items-center gap-2 border rounded-lg p-2 border-gray-200">
                    <span>🔄</span>
                    <select
                      value={reminderForm.frequency}
                      onChange={e => setReminderForm({ ...reminderForm, frequency: e.target.value })}
                      className="bg-transparent w-full outline-none text-gray-800"
                    >
                      <option value="daily">Daily</option>
                      <option value="twice_daily">Twice Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="as_needed">As Needed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button onClick={() => setShowReminderModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={saveReminder} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                Save Reminder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Footer */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border-l-4 border-blue-500">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg mb-1">
          <span className="text-2xl">♿</span> Accessibility Tip
        </h3>
        <p className="text-gray-700">
          Press <strong>Ctrl+Shift+A</strong> to toggle audio descriptions for all text content on this page.
        </p>
      </div>
    </div>
  );
};

export default ScanPage;