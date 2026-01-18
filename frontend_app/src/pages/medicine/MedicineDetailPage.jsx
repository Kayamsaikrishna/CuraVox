import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';
import MedicineInteractionChecker from '../../components/medicine/MedicineInteractionChecker';

// --- Ultra-Prism Icons ---
const IconBack = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
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

const MedicineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useAppData();
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  const [medicine, setMedicine] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (mainRef.current) mainRef.current.focus();

    const found = state.medicines.find(med => med.id === parseInt(id));
    if (found) {
      setMedicine(found);
      speak(`Viewing details for ${found.name}. Category: ${found.category}.`);
    } else {
      speak('Medicine not found. Returning to vault.');
      setTimeout(() => navigate('/medicines'), 2000);
    }
  }, [id, state.medicines]);

  if (!medicine) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-10">
        <div className="w-16 h-16 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] pb-32 font-sans selection:bg-indigo-100 outline-none"
      ref={mainRef}
      tabIndex="-1"
    >
      <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200 px-10 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[140px] -mr-80 -mt-80"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <button
            onClick={() => navigate('/medicines')}
            className="group flex items-center gap-4 text-indigo-600 font-black text-[11px] uppercase tracking-[0.5em] mb-12 hover:-translate-x-2 transition-transform"
          >
            <IconBack /> Back to Medicines
          </button>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-3 h-12 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
                <span className="text-[14px] font-black text-indigo-600 uppercase tracking-[0.6em]">{medicine.category}</span>
              </div>
              <h1 className="text-8xl font-black text-[#020617] tracking-tighter leading-[0.85] mb-8">
                {medicine.name}
              </h1>
              <p className="text-2xl text-slate-500 font-bold italic opacity-80 border-l-4 border-indigo-100 pl-8">
                {medicine.manufacturer} • Medication Details
              </p>
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/scan')}
                className="px-12 py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_30px_60px_-20px_rgba(79,70,229,0.4)] flex items-center gap-6"
              >
                <IconSync /> Update Medicine
              </motion.button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${medicine.name} from vault?`)) {
                    actions.removeMedicine(medicine.id);
                    speak(`${medicine.name} deleted.`);
                    navigate('/medicines');
                  }
                }}
                className="w-24 h-24 rounded-[2.5rem] bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
              >
                <IconAlert />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-10 mt-16">
        <div className="flex flex-wrap gap-4 mb-20">
          {[
            { id: 'info', label: 'Details', icon: <IconPill /> },
            { id: 'usage', label: 'Usage', icon: <IconSync /> },
            { id: 'effects', label: 'Side Effects', icon: <IconAlert /> },
            { id: 'interactions', label: 'Interactions', icon: <IconShield /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); speak(`Switching to ${tab.label} section`); }}
              className={`flex items-center gap-6 px-12 py-7 rounded-[3rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all ${activeTab === tab.id
                ? 'bg-[#020617] text-white shadow-[0_30px_60px_-15px_rgba(2,6,23,0.3)] scale-105'
                : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200'
                }`}
            >
              <div className="scale-90 opacity-80">{tab.icon}</div>
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 bg-white rounded-[4rem] p-16 border border-slate-50 shadow-2xl shadow-slate-100">
                <h2 className="text-4xl font-black text-[#020617] tracking-tighter mb-12 flex items-center gap-6">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                  Medicine Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[
                    { label: 'Dosage', val: medicine.dosage, color: 'text-indigo-600 bg-indigo-50/50' },
                    { label: 'Frequency', val: medicine.frequency, color: 'text-emerald-600 bg-emerald-50/50' },
                    { label: 'Ingredients', val: medicine.activeIngredients.join(', '), color: 'text-slate-700 bg-slate-50' },
                    { label: 'Expiry Date', val: new Date(medicine.expiryDate).toLocaleDateString(), color: 'text-rose-600 bg-rose-50/50' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-4">
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest pl-2">{item.label}</span>
                      <div className={`p-8 rounded-[2rem] font-black text-xl ${item.color} border border-white shadow-sm`}>
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-600 rounded-[4rem] p-16 text-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150">
                  <IconShield />
                </div>
                <div>
                  <h3 className="text-4xl font-black tracking-tighter mb-8 leading-none">Safe Storage</h3>
                  <p className="text-xl text-indigo-100 font-black opacity-80 leading-relaxed italic">Properly stored in your personal vault.</p>
                </div>
                <div className="space-y-4 pt-10">
                  <div className="flex items-center gap-6">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,1)]"></div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100">Sync Active</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/50">Medicine Info</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-12">
              <div className="bg-white rounded-[4rem] p-16 border border-slate-50 shadow-2xl">
                <h2 className="text-4xl font-black text-[#020617] tracking-tighter mb-12">How to Use</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                  <div className="lg:col-span-1">
                    <span className="text-[12px] font-black text-indigo-600 uppercase tracking-widest block mb-4">Direct Insight</span>
                    <p className="text-2xl font-black text-slate-400 italic">Instructions</p>
                  </div>
                  <div className="lg:col-span-3 p-12 bg-indigo-50/30 rounded-[3rem] border-2 border-indigo-100/50 text-3xl font-black text-indigo-900 leading-tight tracking-tight">
                    {medicine.usage}
                  </div>
                </div>
              </div>
              <div className="p-16 bg-[#020617] rounded-[4rem] text-white flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex items-center gap-10">
                  <div className="w-24 h-24 bg-indigo-600/20 rounded-[2.5rem] flex items-center justify-center text-indigo-500 border border-indigo-900">
                    <IconSync />
                  </div>
                  <div>
                    <h4 className="text-4xl font-black tracking-tighter">Storage</h4>
                    <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.5em] mt-3">{medicine.storage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'effects' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white rounded-[4rem] p-16 border border-slate-50 shadow-2xl">
                <h2 className="text-4xl font-black text-[#020617] tracking-tighter mb-12">Side Effects</h2>
                <div className="space-y-6">
                  {medicine.sideEffects.map((ef, i) => (
                    <div key={i} className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2rem] border border-white group hover:bg-rose-50 transition-colors cursor-default">
                      <div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.5)] group-hover:scale-150 transition-transform"></div>
                      <span className="text-2xl font-black text-slate-700 tracking-tight group-hover:text-rose-900">{ef}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-rose-50/50 rounded-[4rem] p-16 border-l-[16px] border-rose-600">
                <h2 className="text-4xl font-black text-rose-900 tracking-tighter mb-10">Warning Signs</h2>
                <p className="text-2xl font-black text-rose-800 opacity-60 mb-12 italic leading-relaxed">Call for help if you have any of these symptoms.</p>
                <ul className="space-y-6">
                  {[
                    "Severe allergic reaction",
                    "Rapid or irregular heartbeat",
                    "Shortness of breath or swelling"
                  ].map((sig, i) => (
                    <li key={i} className="flex items-start gap-8 group">
                      <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-lg">!</div>
                      <span className="text-xl font-black text-rose-900 uppercase tracking-widest">{sig}</span>
                    </li>
                  ))}
                </ul>
                <a href="tel:108" className="mt-16 block w-full py-10 bg-rose-600 text-white rounded-[2.5rem] text-center font-black text-[14px] uppercase tracking-[0.6em] shadow-[0_20px_60px_-10px_rgba(225,29,72,0.4)] hover:bg-rose-700 transition-all">Emergency Call: 108</a>
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="bg-white rounded-[4rem] p-16 border border-slate-50 shadow-2xl">
              <h2 className="text-4xl font-black text-[#020617] tracking-tighter mb-8 italic opacity-60">Medicine Details</h2>
              <h3 className="text-5xl font-black text-[#020617] tracking-tighter mb-16 max-w-4xl leading-none">Check for Medicine Conflicts</h3>
              <div className="p-12 bg-indigo-50/30 rounded-[3rem] border-2 border-indigo-100">
                <MedicineInteractionChecker medicineId={medicine.id} />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Persistence Interface */}
      <div className="fixed bottom-12 right-12 flex flex-col gap-6">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const script = `${medicine.name}. Dosage: ${medicine.dosage}. Instruction: ${medicine.usage}. Expiry date: ${medicine.expiryDate}. Call 1-0-8 if you feel unwell.`;
            speak(script);
          }}
          className="w-24 h-24 bg-[#020617] text-white rounded-[2rem] shadow-2xl flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
          <div className="relative z-10">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MedicineDetailPage;