import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import VoiceService from '../../services/voiceService';

// --- Ultra-Prism Icons ---
const IconPill = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
);
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconAlert = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
const IconSync = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
);

const OCRResultDisplay = ({ result, isLoading, error, onSetReminder }) => {
  const navigate = useNavigate();
  const voiceService = VoiceService.getInstance();
  const aiData = result?.aiAnalysis || result || {};

  useEffect(() => {
    if (result) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const name = aiData.medicineName || "the compound";
        const speech = `I've identified ${name}. Please check the details below and save it to your vault.`;
        voiceService.speak(speech);
      }, 750);
    }
  }, [result]);

  if (aiData.error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-4"
      >
        <div className="bg-white rounded-[4rem] p-20 border-4 border-rose-50 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 text-rose-600"><IconAlert /></div>
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <IconAlert />
          </div>
          <h2 className="text-5xl font-black text-[#020617] tracking-tighter mb-6 uppercase">Scan Failed</h2>
          <p className="text-2xl text-slate-500 font-bold mb-12 leading-relaxed italic opacity-70">"{aiData.error}"</p>
          <div className="bg-indigo-50/50 p-10 rounded-[3rem] flex items-center gap-8 text-left border border-indigo-100 mb-12">
            <div className="text-4xl">💡</div>
            <p className="text-xl text-indigo-900 font-black leading-snug">
              Try holding the medicine closer to the camera with better light, and make sure the name is clearly visible.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white p-10 rounded-[2.5rem] font-black text-[14px] uppercase tracking-[0.5em] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)]"
          >
            Try Scanning Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const formatList = (l) => Array.isArray(l) ? l : (typeof l === 'string' ? l.split(',').map(i => i.trim()) : (l ? [l] : []));

  const medicineName = aiData.medicineName || aiData.identifiedMedicine || "Unknown Medicine";
  const dosage = aiData.strength || aiData.dosage || "Standard Dose";
  const usesList = formatList(aiData.uses || aiData.usageInfo);
  const sideEffectsList = formatList(aiData.sideEffects);
  const frequency = aiData.typical_schedule?.frequency || "As prescribed";

  if (error) return <div className="max-w-4xl mx-auto p-12"><Alert type="error" title="System Signal Lost">{error}</Alert></div>;
  if (isLoading) return <div className="flex justify-center items-center py-40"><LoadingSpinner size="xl" /></div>;
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-sans pb-20"
    >
      <div className="bg-white rounded-[5rem] shadow-[0_80px_160px_-40px_rgba(79,70,229,0.15)] overflow-hidden border border-slate-50 relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600"></div>

        {/* Synthesis Status */}
        <div className="px-16 py-10 flex justify-between items-center border-b border-slate-50 bg-slate-50/20">
          <div className="flex items-center gap-6">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => <div key={i} className={`w-2 h-6 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse`} style={{ animationDelay: `${i * 200}ms` }}></div>)}
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-900 opacity-60">Medicine Identification</span>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-indigo-100 shadow-sm">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Match</span>
            <span className={`text-xl font-black ${aiData.confidence > 0.8 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {Math.round((aiData.confidence || 0.85) * 100)}%
            </span>
          </div>
        </div>

        {/* Compound Identity */}
        <div className="p-20 text-center relative overflow-hidden bg-gradient-to-b from-white to-indigo-50/10">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 1 }}
            className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-[3rem] inline-flex items-center justify-center mb-12 shadow-inner border-4 border-white"
          >
            <IconPill />
          </motion.div>
          <h1 className="text-8xl font-black text-[#020617] tracking-tighter leading-[0.85] mb-8">
            {medicineName}
          </h1>
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <span className="px-8 py-4 bg-[#020617] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl">{dosage}</span>
            {aiData.composition && <span className="px-8 py-4 bg-indigo-50 text-indigo-600 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] border border-indigo-100">{aiData.composition}</span>}
          </div>
          {aiData.manufacturer && <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em] mb-12 opacity-80 decoration-indigo-200 underline decoration-4 underline-offset-8 decoration-wavy">MANUFACTURER: {aiData.manufacturer}</p>}

          {/* Expiry Verification */}
          <div className="inline-flex flex-col items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-8 px-16 py-8 rounded-[3rem] border-4 font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl relative overflow-hidden bg-white ${aiData.dates?.expiryDate?.includes('Expired') ? 'border-rose-100 text-rose-600' : 'border-emerald-100 text-emerald-600'}`}
            >
              <div className="text-4xl">🔬</div>
              <span>Expiry Date: <span className="opacity-60 underline decoration-indigo-200">{aiData.dates?.expiryDate || 'N/A'}</span></span>
            </motion.div>
          </div>
        </div>

        {/* Grid Synthesis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-slate-50 divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
          <div className="p-20 space-y-12 bg-slate-50/20">
            <h3 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.5em] flex items-center gap-6">
              <div className="w-1.5 h-10 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
              Used For
            </h3>
            <div className="space-y-6">
              {usesList.map((u, i) => (
                <div key={i} className="flex items-center gap-8 group">
                  <div className="w-16 h-1 bg-indigo-100 group-hover:w-24 group-hover:bg-indigo-600 transition-all duration-500 rounded-full"></div>
                  <span className="text-3xl font-black text-slate-800 tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">{u}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-20 space-y-12">
            <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-[0.5em] flex items-center gap-6">
              <div className="w-1.5 h-10 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
              Side Effects
            </h3>
            <div className="space-y-6">
              {sideEffectsList.map((e, i) => (
                <div key={i} className="flex items-center gap-8 group">
                  <div className="w-4 h-4 rounded-full bg-rose-100 group-hover:bg-rose-500 group-hover:scale-150 transition-all shadow-inner"></div>
                  <span className="text-3xl font-black text-slate-800 tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Overlay */}
        <div className="p-20 bg-[#020617] text-white flex flex-col lg:flex-row items-center gap-16 relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12"><IconShield /></div>
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group transition-all">
              <IconShield />
            </div>
            <div>
              <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[12px] mb-4">Clinician Signal Analysis</p>
              <p className="text-4xl font-black tracking-tighter leading-tight italic max-w-2xl opacity-90 border-l-4 border-indigo-600/30 pl-10">
                "{aiData.doctor_insight || `Identified medicine with ${Math.round((aiData.confidence || 0.85) * 100)}% match.`}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Interaction Node */}
      {onSetReminder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSetReminder}
            className="w-full bg-[#020617] text-white p-12 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(2,6,23,0.3)] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-indigo-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-700 opacity-20"></div>
            <div className="relative z-10 flex items-center justify-between px-10">
              <div className="text-left">
                <span className="text-indigo-400 font-black uppercase tracking-[0.6em] text-[13px] block mb-4 animate-pulse">Ready to Save</span>
                <p className="text-5xl font-black tracking-tighter">Save {medicineName}</p>
              </div>
              <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-6xl group-hover:rotate-12 transition-all">
                ⏰
              </div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OCRResultDisplay;