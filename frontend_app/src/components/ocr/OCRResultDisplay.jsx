import React, { useEffect } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import VoiceService from '../../services/voiceService';

const OCRResultDisplay = ({ result, isLoading, error, onSetReminder }) => {
  const voiceService = VoiceService.getInstance();

  // Robustly extract data, handling both direct properties and nested 'aiAnalysis'
  const aiData = result?.aiAnalysis || result || {};

  // 1. Check for AI Rejection/Error
  if (aiData.error) {
    useEffect(() => {
      voiceService.speak(aiData.error);
    }, [aiData.error]);

    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert type="warning" title="Identification Failed">
          <p className="text-lg mb-4">{aiData.error}</p>
          <div className="bg-white/50 p-4 rounded-lg flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-sm text-gray-600 italic">
              Try holding the medicine closer to the camera and ensure there is good lighting. Align the text inside the box.
            </p>
          </div>
        </Alert>
        <div className="mt-6">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold"
          >
            Try Scanning Again
          </Button>
        </div>
      </div>
    );
  }

  // Helper to robustly handle list data types
  const formatList = (list) => {
    if (Array.isArray(list)) return list;
    if (typeof list === 'string') {
      if (list.includes('\n')) return list.split('\n').map(item => item.trim());
      if (list.includes(',')) return list.split(',').map(item => item.trim());
      return [list.trim()];
    }
    if (list) return [list];
    return [];
  };

  const medicineName = aiData.medicineName || aiData.identifiedMedicine || "Unknown Medicine";
  const dosage = aiData.strength || aiData.dosage || aiData.dosageInfo || "standard dosage";
  const usesList = formatList(aiData.uses || aiData.usageInfo);
  const sideEffectsList = formatList(aiData.sideEffects);
  const warningsList = formatList(aiData.warnings);

  // New Fields
  const schedule = aiData.typical_schedule || {};
  const frequency = schedule.frequency || "As prescribed";
  const timing = schedule.timing || "Follow doctor's advice";

  // Dynamic "Doctor Agent" Speech Generator (Verbose & Comprehensive)
  const generateDoctorSpeech = (data) => {
    // 1. Force Deterministic Builder for "Zero Data Loss"
    // (We ignore AI script 'patient_friendly_speech' to guarantee Manufacturer/Expiry are spoken)

    // 2. Construct Detailed Clinical Explanation (Full Coverage)
    const name = data.medicineName || data.identifiedMedicine || "the medicine";
    const strength = data.strength || data.dosageInfo || "";

    // Manufacturer
    let makerText = "";
    if (data.manufacturer && data.manufacturer !== 'Unknown Manufacturer' && data.manufacturer !== 'Not Visible') {
      makerText = `It is manufactured by ${data.manufacturer}.`;
    } else {
      makerText = "The manufacturer is not clearly visible.";
    }

    // Composition
    const composition = data.composition ? `It contains ${data.composition}.` : "Active ingredients are not clearly identified.";

    // Core Indication
    const usesList = formatList(data.uses || data.usageInfo || data.indications);
    let usesText = "Specific medical indications were not found.";
    if (usesList.length > 0) {
      usesText = `This medication is primarily used for: ${usesList.slice(0, 5).join(', ')}.`;
    }

    // Usage Schedule
    const freq = data.typical_schedule?.frequency || "as prescribed";
    const timing = data.typical_schedule?.timing || "";
    let scheduleText = `Regarding usage, typically this is taken ${freq} ${timing}.`;
    if (freq.toLowerCase().includes('prescribed')) {
      scheduleText = `The specific dosage should be determined by your doctor${timing ? `, but typical timing is ${timing}` : ''}.`;
    }

    // Side Effects
    const sideEffects = formatList(data.sideEffects || data.side_effects);
    let sideEffectsText = "";
    if (sideEffects.length > 0) {
      sideEffectsText = `Common side effects may include: ${sideEffects.slice(0, 4).join(', ')}.`;
    }

    // Safety
    let safetyText = "";
    if (data.safetyAdvice) {
      const alcohol = data.safetyAdvice.alcohol && data.safetyAdvice.alcohol !== 'Consult Doctor' ? `Alcohol: ${data.safetyAdvice.alcohol}.` : "";
      const pregnancy = data.safetyAdvice.pregnancy && data.safetyAdvice.pregnancy !== 'Consult Doctor' ? `Pregnancy: ${data.safetyAdvice.pregnancy}.` : "";
      const driving = data.safetyAdvice.driving && data.safetyAdvice.driving !== 'Consult Doctor' ? `Driving: ${data.safetyAdvice.driving}.` : "";

      if (alcohol || pregnancy || driving) {
        safetyText = `Important safety warnings: ${alcohol} ${pregnancy} ${driving}`;
      }
    }

    // Expiry
    let expiryText = "";
    if (data.dates?.expiryDate && data.dates.expiryDate !== 'Not Visible') {
      expiryText = `The expiry date is ${data.dates.expiryDate}.`;
    } else {
      expiryText = `I could not clearly read the expiry date. Please check the package.`;
    }

    // Warnings
    const warns = formatList(data.warnings || data.precautions);
    const warningText = warns.length > 0 ? `Please note: ${warns.slice(0, 2).join('. ')}.` : "";

    // Assemble the Full Consultation
    return `
      I have identified ${name} ${strength}. 
      ${makerText}
      ${composition}
      ${usesText} 
      ${scheduleText} 
      ${sideEffectsText} 
      ${safetyText} 
      ${warningText} 
      ${expiryText} 
      I recommend consulting your doctor.
    `;
  };

  // Auto-Speak Logic
  useEffect(() => {
    if (result) {
      const speechText = generateDoctorSpeech(aiData);

      // Cancel any previous speech
      window.speechSynthesis.cancel();

      // Speak the script
      setTimeout(() => {
        voiceService.speak(speechText);
      }, 750);
    }
  }, [result]);

  // 2. Handle Parent Level Error (e.g. API Failure)
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert type="error" title="Processing Error">
          {error}
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message={`Analysis Error: ${error}`} />
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="ocr-result-display font-sans animate-fade-in-up pb-8">

      {/* MEDICAL REPORT CARD */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

        {/* HEADER: STATUS & CONFIDENCE */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 flex justify-between items-center border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold tracking-wide text-sm uppercase">Analysis Complete</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500">CONFIDENCE</span>
            <span className={`text-sm font-extrabold ${aiData.confidence > 0.8 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {aiData.confidence ? Math.round(aiData.confidence * 100) : 85}%
            </span>
          </div>
        </div>

        {/* HERO SECTION: MEDICINE IDENTITY */}
        <div className="p-8 pb-6 text-center border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4 text-3xl shadow-inner">
            💊
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">
            {medicineName}
          </h1>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {dosage}
            </span>
            {aiData.composition && (
              <span className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                🧪 {aiData.composition}
              </span>
            )}
          </div>

          {aiData.manufacturer && (
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
              MANUFACTURED BY {aiData.manufacturer}
            </p>
          )}

          {/* DATES & EXPIRY STATUS */}
          {(() => {
            const expiryDate = aiData.dates?.expiryDate;
            const today = new Date();

            let status = 'unknown'; // valid, expired, unknown
            let statusText = "Check Expiry Manually";
            let statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
            let icon = "⚠️";

            if (expiryDate && expiryDate !== 'Not Visible') {
              try {
                // Try parsing "MM/YY" or "MM/YYYY"
                const parts = expiryDate.split(/[\/\-\.]/);
                if (parts.length >= 2) {
                  let month = parseInt(parts[0], 10);
                  let year = parseInt(parts[1], 10);
                  // Handle 2-digit year
                  if (year < 100) year += 2000;

                  // Set to last day of that month for expiry
                  const expObj = new Date(year, month, 0);

                  if (expObj < today) {
                    status = 'expired';
                    statusText = `EXPIRED on ${expiryDate}`;
                    statusColor = "bg-red-100 text-red-800 border-red-200 animate-pulse";
                    icon = "⛔";
                  } else {
                    status = 'valid';
                    statusText = `Safe to use (Exp: ${expiryDate})`;
                    statusColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                    icon = "✅";
                  }
                }
              } catch (e) {
                console.log("Date Parse Error", e);
              }
            }

            return (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className={`px-6 py-3 rounded-xl border-2 font-bold text-lg flex items-center gap-3 shadow-sm ${statusColor}`}>
                  <span className="text-2xl">{icon}</span>
                  <span>{statusText}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* USAGE GUIDE (New Section) */}
        <div className="bg-sky-50 border-b border-sky-100 p-6 flex flex-col md:flex-row gap-6 items-center justify-center text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="text-3xl bg-white p-3 rounded-full shadow-sm text-sky-500">⏰</div>
            <div>
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">Typical Frequency</h3>
              <p className="text-lg font-bold text-sky-900">{frequency}</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-12 bg-sky-200"></div>
          <div className="flex items-center gap-4">
            <div className="text-3xl bg-white p-3 rounded-full shadow-sm text-sky-500">🍽️</div>
            <div>
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">Best Timing</h3>
              <p className="text-lg font-bold text-sky-900">{timing}</p>
            </div>
          </div>
        </div>

        {/* DOCTOR'S INSIGHT */}
        <div className="px-8 py-6 bg-indigo-50/50 border-b border-indigo-100 relative">
          <div className="absolute top-6 left-4 text-indigo-200 text-4xl opacity-50">❝</div>
          <div className="pl-6 relative z-10">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">CLINICAL INSIGHT</h3>
            <p className="text-lg text-indigo-900 leading-relaxed font-medium">
              {aiData.doctor_insight || `This medication is indicated for ${usesList[0] || 'treatment'}.`}
            </p>
          </div>
        </div>

        {/* SAFETY ADVICE GRID (Interactive) */}
        {aiData.safetyAdvice && (
          <div className="grid grid-cols-3 border-b border-gray-100 divide-x divide-gray-100 bg-white">
            {['Alcohol', 'Pregnancy', 'Driving'].map((key) => (
              <div key={key} className="p-4 text-center hover:bg-gray-50 transition-colors cursor-help group relative">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                  {key === 'Alcohol' ? '🍷' : key === 'Pregnancy' ? '🤰' : '🚗'}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase">{key}</div>
                <div className="hidden group-hover:block absolute bg-gray-900 text-white text-xs p-2 rounded shadow-lg -mt-20 z-20 w-48 mx-auto left-0 right-0 transform -translate-y-2">
                  {aiData.safetyAdvice[key.toLowerCase()] || "Consult Doctor"}
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          {/* USES */}
          <div className="p-8 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">📋</div>
              <h3 className="font-bold text-gray-900 text-lg">Indications</h3>
            </div>
            <ul className="space-y-3">
              {usesList.length > 0 ? usesList.map((u, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                  <span className="leading-snug">{u}</span>
                </li>
              )) : <li className="text-gray-400 italic">Refer to leaflet</li>}
            </ul>
          </div>

          {/* SIDE EFFECTS */}
          <div className="p-8 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">⚠️</div>
              <h3 className="font-bold text-gray-900 text-lg">Side Effects</h3>
            </div>
            <ul className="space-y-3">
              {sideEffectsList.length > 0 ? sideEffectsList.map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></span>
                  <span className="leading-snug">{e}</span>
                </li>
              )) : <li className="text-gray-400 italic">None reported</li>}
            </ul>
          </div>
        </div>

        {/* WARNINGS (Conditional) */}
        {warningsList.length > 0 && (
          <div className="bg-red-50 p-6 border-t border-red-100">
            <div className="flex items-start gap-4">
              <div className="text-2xl mt-1">🛡️</div>
              <div>
                <h3 className="text-red-900 font-bold mb-1">Precautions</h3>
                <ul className="space-y-1">
                  {warningsList.map((w, i) => (
                    <li key={i} className="text-red-800 text-sm leading-relaxed">• {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ACTION BUTTON */}
      {onSetReminder && (
        <div className="mt-6">
          <Button
            onClick={onSetReminder}
            className="w-full group relative overflow-hidden bg-gray-900 hover:bg-gray-800 text-white p-5 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-99"
          >
            <div className="relative z-10 flex items-center justify-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="text-left">
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-0.5">Don't Miss a Dose</div>
                <div className="text-xl font-bold">Set Reminder for {medicineName}</div>
              </div>
            </div>
          </Button>
        </div>
      )}

    </div>
  );
};

export default OCRResultDisplay;