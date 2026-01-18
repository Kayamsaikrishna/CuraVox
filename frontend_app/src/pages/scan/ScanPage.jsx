import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import CameraCapture from '../../components/ocr/CameraCapture';
import ImageUpload from '../../components/ocr/ImageUpload';
import OCRResultDisplay from '../../components/ocr/OCRResultDisplay';
import { Button } from '../../components/common/Button';
import useAccessibility from '../../hooks/useAccessibility';
import api from '../../services/api';
import VoiceService from '../../services/voiceService';

// --- SVG ICONS ---
const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
);
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const IconReset = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M3 3v5h5" /><path d="M21 21v-5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /></svg>
);
const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);
const IconReminder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconPill = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
);
const IconClock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const ScanPage = () => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [isLoading, setIsLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const [announcedText, setAnnouncedText] = useState('');
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
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/ocr/process', formData, {
        headers: { 'Content-Type': undefined }
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
        headers: { 'Content-Type': undefined }
      });

      if (response.data.success) {
        setOcrResult(response.data.data);
        speak("Image uploaded successfully");
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
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 pb-20 selection:bg-[#76a04e]/20">
      <div aria-live="polite" className="sr-only">{announcedText}</div>

      <main className="max-w-5xl mx-auto px-6 pt-16">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-[#1a365d]/5 text-[#1a365d] text-[10px] font-black uppercase tracking-[0.3em] border border-[#1a365d]/10 mb-6 inline-block">
            Scanner
          </span>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">Medicine Scanner</h1>
          <p className="text-slate-500 text-lg font-semibold max-w-xl mx-auto leading-relaxed">
            Scan your medicine labels to quickly identify them and set reminders.
          </p>
        </div>

        <div className="glass-card !p-0 border-white bg-white/40 overflow-hidden shadow-2xl">
          {/* Clinical Tab Navigation */}
          <div className="flex bg-slate-900/5 backdrop-blur-sm border-b border-white/40">
            <button
              className={`flex-1 py-6 px-10 font-bold text-sm tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-3 border-r border-white/20 ${activeTab === 'camera'
                ? 'bg-white text-[#1a365d] shadow-sm'
                : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              onClick={() => setActiveTab('camera')}
              aria-selected={activeTab === 'camera'}
              role="tab"
            >
              <IconCamera /> Use Camera
            </button>
            <button
              className={`flex-1 py-6 px-10 font-bold text-sm tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-3 ${activeTab === 'upload'
                ? 'bg-white text-[#1a365d] shadow-sm'
                : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              onClick={() => setActiveTab('upload')}
              aria-selected={activeTab === 'upload'}
              role="tab"
            >
              <IconUpload /> Upload Photo
            </button>
          </div>

          {/* Clinical Interface Content */}
          <div className="p-10 min-h-[500px] flex flex-col">
            {activeTab === 'camera' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Camera View</h2>
                    <p className="text-xs font-bold text-[#76a04e] uppercase tracking-[0.2em] mt-1 italic">Ready to scan your medicine</p>
                  </div>
                </div>
                <CameraCapture onCapture={handleCapture} isLoading={isLoading} />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="animate-fade-in max-w-2xl mx-auto w-full">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Image</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Upload a clear photo of the medicine label</p>
                </div>
                <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
              </div>
            )}

            {/* Sub-Interface: Analysis Feed */}
            {(ocrResult || error) && (
              <div className="mt-12 pt-12 border-t border-slate-100 animate-fade-in-up">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#76a04e]/10 text-[#76a04e] flex items-center justify-center shadow-inner">
                      <IconChart />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Scan Results</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 leading-none">Scan complete</p>
                    </div>
                  </div>
                  <button onClick={handleReset} className="px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2">
                    <IconReset /> SCAN AGAIN
                  </button>
                </div>

                <OCRResultDisplay
                  result={ocrResult}
                  isLoading={isLoading}
                  error={error}
                  onSetReminder={handleSetReminder}
                />
              </div>
            )}

            {isLoading && !ocrResult && (
              <div className="mt-12 flex-1 flex flex-col items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full border-b border-[#1a365d] animate-spin border-4 border-slate-100 relative mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg"></div>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Analyzing Medicine...</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 italic">Finding medicine details...</p>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="mt-10 p-8 glass-card border-none !bg-[#1a365d]/5 flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-[#1a365d]/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#1a365d] uppercase tracking-[0.2em] mb-2 leading-none">Safety Note</h3>
            <p className="text-slate-500 font-medium leading-relaxed italic text-sm">
              "This tool helps identify medicines from labels. Always check the actual package and talk to your doctor before taking any medicine."
            </p>
          </div>
        </div>
      </main>

      {/* Prism Protocol Entry Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-fade-in" onClick={() => setShowReminderModal(false)}>
          <div
            className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-[0_40px_100px_-20px_rgba(79,70,229,0.2)] border border-slate-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-10 border-b border-slate-50 relative overflow-hidden bg-slate-50/30">
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-5 bg-indigo-600 rounded-full"></div>
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Add Reminder</span>
                  </div>
                  <h2 className="text-4xl font-black text-[#020617] tracking-tighter leading-none mb-3">Set Schedule</h2>
                  <p className="text-slate-500 text-sm font-bold opacity-70">Set a time to take your medicine</p>
                </div>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors shadow-sm"
                >
                  ✕
                </button>
              </div>
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
            </div>

            <div className="p-10 space-y-10">
              {/* Medicine Name */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Medicine Name</label>
                <div className="group flex items-center gap-5 bg-slate-50 border border-slate-100 p-6 rounded-2xl focus-within:ring-4 focus-within:ring-indigo-600/5 focus-within:border-indigo-600/30 transition-all">
                  <div className="text-indigo-600 group-focus-within:scale-110 transition-transform"><IconPill /></div>
                  <input
                    type="text"
                    value={reminderForm.medicineName}
                    onChange={e => setReminderForm({ ...reminderForm, medicineName: e.target.value })}
                    className="bg-transparent w-full outline-none font-black text-[#020617] text-lg tracking-tight placeholder:text-slate-300"
                    placeholder="Enter medicine name..."
                  />
                </div>
              </div>

              {/* Dosage */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Dosage</label>
                <div className="group flex items-center gap-5 bg-slate-50 border border-slate-100 p-6 rounded-2xl focus-within:ring-4 focus-within:ring-emerald-600/5 focus-within:border-emerald-600/30 transition-all">
                  <div className="text-emerald-500 group-focus-within:scale-110 transition-transform"><IconChart /></div>
                  <input
                    type="text"
                    value={reminderForm.dosage}
                    onChange={e => setReminderForm({ ...reminderForm, dosage: e.target.value })}
                    placeholder="e.g. 500mg - 1 Tablet"
                    className="bg-transparent w-full outline-none font-bold text-[#020617] text-lg placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Time & Frequency */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Time</label>
                  <div className="group flex items-center gap-4 bg-slate-50 border border-slate-100 p-6 rounded-2xl focus-within:ring-4 focus-within:ring-indigo-600/5 focus-within:border-indigo-600/30 transition-all">
                    <div className="text-indigo-400 transition-colors group-focus-within:text-indigo-600"><IconClock /></div>
                    <input
                      type="time"
                      value={reminderForm.time}
                      onChange={e => setReminderForm({ ...reminderForm, time: e.target.value })}
                      className="bg-transparent w-full outline-none font-black text-[#020617] text-xl tabular-nums uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Frequency</label>
                  <div className="group flex items-center gap-4 bg-slate-50 border border-slate-100 p-6 rounded-2xl focus-within:ring-4 focus-within:ring-indigo-600/5 focus-within:border-indigo-600/30 transition-all">
                    <select
                      value={reminderForm.frequency}
                      onChange={e => setReminderForm({ ...reminderForm, frequency: e.target.value })}
                      className="bg-transparent w-full outline-none font-black text-[#020617] uppercase text-[11px] tracking-widest cursor-pointer"
                    >
                      <option value="daily">Daily</option>
                      <option value="twice_daily">2x Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="as_needed">As Needed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-10 pt-0 flex gap-6">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveReminder}
                className="flex-[1.5] py-6 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;