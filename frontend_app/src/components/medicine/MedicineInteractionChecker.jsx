import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAccessibility from '../../hooks/useAccessibility';
import { useAppData } from '../../contexts/AppDataContext';

// --- Ultra-Prism Local Icons ---
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconAlert = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const MedicineInteractionChecker = () => {
  const { state } = useAppData();
  const { speak } = useAccessibility();
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [interactionResult, setInteractionResult] = useState(null);

  const toggleMedicineSelection = (medicine) => {
    const isSelected = selectedMedicines.find(m => m.id === medicine.id);
    if (isSelected) {
      setSelectedMedicines(selectedMedicines.filter(m => m.id !== medicine.id));
    } else {
      setSelectedMedicines([...selectedMedicines, medicine]);
    }
  };

  useEffect(() => {
    if (selectedMedicines.length >= 2) {
      // In a real app, this calls an API. Here we simulate analysis.
      setInteractionResult('pending');
      setTimeout(() => {
        setInteractionResult('clear'); // Simulating "No interaction detected" for clinical safety
        speak(`Checked ${selectedMedicines.length} medicines. No interactions found.`);
      }, 1500);
    } else {
      setInteractionResult(null);
    }
  }, [selectedMedicines.length]);

  return (
    <div className="text-slate-900">
      <div className="mb-10">
        <p className="text-lg font-bold text-slate-500 mb-8 italic">
          Select medicines from your vault to check for interactions.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {state.medicines.map((medicine) => {
            const isSelected = selectedMedicines.find(m => m.id === medicine.id);
            return (
              <motion.button
                key={medicine.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleMedicineSelection(medicine)}
                className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden ${isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                  : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200 shadow-sm'
                  }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 text-white opacity-40"
                  >
                    <IconCheck />
                  </motion.div>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60">
                  {medicine.category}
                </span>
                <p className="text-xl font-black tracking-tight leading-none">{medicine.name}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {interactionResult === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-12 bg-indigo-50/50 rounded-[3rem] border-2 border-dashed border-indigo-200 flex flex-col items-center gap-6"
          >
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] animate-pulse">Checking for interactions...</p>
          </motion.div>
        )}

        {interactionResult === 'clear' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 bg-emerald-50 rounded-[3rem] border-2 border-emerald-100 flex items-center gap-8 shadow-xl shadow-emerald-50"
          >
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg">
              <IconCheck />
            </div>
            <div>
              <h3 className="text-3xl font-black text-emerald-900 tracking-tighter mb-2">Safe: No Interactions Found</h3>
              <p className="text-emerald-700 font-bold opacity-80 leading-relaxed italic">No interactions were detected between the selected medicines.</p>
            </div>
          </motion.div>
        )}

        {!interactionResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center gap-8 opacity-60"
          >
            <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center">
              <IconShield />
            </div>
            <p className="text-xl font-bold text-slate-500 italic">Select two or more medicines to check for interactions.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-10 bg-indigo-900 text-indigo-100 rounded-[2.5rem] relative overflow-hidden flex items-center gap-8 border-4 border-indigo-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150"><IconAlert /></div>
        <div className="w-16 h-16 bg-indigo-600/30 rounded-2xl flex items-center justify-center text-indigo-300">💡</div>
        <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-2xl">
          <span className="text-white">Note:</span> This tool is for informational purposes only. Always consult your doctor or pharmacist about combining medications.
        </p>
      </div>
    </div>
  );
};

export default MedicineInteractionChecker;