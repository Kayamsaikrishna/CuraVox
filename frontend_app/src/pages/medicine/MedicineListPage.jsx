import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';
import MedicineInteractionChecker from '../../components/medicine/MedicineInteractionChecker';
import PillIdentificationGame from '../../components/medicine/PillIdentificationGame';
import ManualMedicineEntry from '../../components/medicine/ManualMedicineEntry';

// --- Ultra-Prism Icons ---
const IconPill = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
);
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconAlert = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

const MedicineListPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useAppData();
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('inventory');
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    if (mainRef.current) mainRef.current.focus();
    actions.refreshAll();
    speak('Entering Medicine Vault. View your medications below.');
  }, []);

  const filteredMedicines = state.medicines.filter(medicine => {
    const matchesSearch = !searchTerm ||
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filter === 'active') matchesFilter = new Date(medicine.expiryDate) > new Date();
    else if (filter === 'expired') matchesFilter = new Date(medicine.expiryDate) <= new Date();

    return matchesSearch && matchesFilter;
  });

  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'expiry') return new Date(a.expiryDate) - new Date(b.expiryDate);
    return 0;
  });

  const activeCount = state.medicines.filter(med => new Date(med.expiryDate) > new Date()).length;
  const expiredCount = state.medicines.filter(med => new Date(med.expiryDate) <= new Date()).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] text-[#020617] pb-32 font-sans selection:bg-indigo-100 outline-none"
      ref={mainRef}
      tabIndex="-1"
    >
      {/* Ultra-Prism Header */}
      <header className="relative bg-white/80 backdrop-blur-2xl border-b border-slate-200 px-10 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-3 h-10 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
              <span className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.5em]">Medicine Tracker</span>
            </motion.div>
            <h1 className="text-8xl font-black text-[#020617] tracking-tighter leading-[0.9] mb-8">
              Medicine <span className="text-indigo-600">Vault</span>
            </h1>
            <p className="text-2xl text-slate-500 font-bold leading-relaxed italic opacity-80 border-l-4 border-indigo-100 pl-8">
              Easily manage your medications and track interactions.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, translateY: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowManualForm(true)}
            className="group px-12 py-8 bg-[#020617] text-white rounded-[3rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-[0_30px_60px_-15px_rgba(2,6,23,0.3)] hover:bg-slate-800 transition-all flex items-center gap-6 relative overflow-hidden"
          >
            <IconPlus /> Add Medicine
          </motion.button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-10 mt-16">
        <AnimatePresence mode="wait">
          {showManualForm ? (
            <motion.div
              key="manual-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="py-12"
            >
              <ManualMedicineEntry
                onCancel={() => setShowManualForm(false)}
                onSuccess={() => {
                  setShowManualForm(false);
                  actions.refreshAll();
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="vault-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Secondary Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 items-center">
                <div className="lg:col-span-8 relative group">
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <IconSearch />
                  </div>
                  <input
                    type="text"
                    placeholder="Search medicines by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-20 pr-10 py-7 bg-white border border-slate-100 rounded-[3rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/20 font-black text-slate-800 placeholder:text-slate-300 transition-all text-xl"
                  />
                </div>
                <div className="lg:col-span-4 flex bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100">
                  {['inventory', 'analysis', 'training'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                        }`}
                    >
                      {tab === 'training' ? '🎯 Quiz' : tab === 'analysis' ? 'Interactions' : 'Medications'}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Rendering */}
              <AnimatePresence mode="wait">
                {activeTab === 'inventory' && (
                  <motion.div
                    key="inventory"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                      {[
                        { label: 'Total Medicines', val: state.medicines.length, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                        { label: 'Active Reminders', val: activeCount, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                        { label: 'Expired', val: expiredCount, color: 'text-rose-600', bg: 'bg-rose-50/50' }
                      ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} p-10 rounded-[3rem] border border-white flex justify-between items-center`}>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.val}</p>
                          </div>
                          <div className="opacity-10 scale-150 rotate-12"><IconPill /></div>
                        </div>
                      ))}
                    </div>

                    {/* Filter Strip */}
                    <div className="flex justify-between items-center mb-10 px-4">
                      <div className="flex gap-4">
                        {['all', 'active', 'expired'].map(t => (
                          <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${filter === t ? 'bg-[#020617] text-white shadow-xl' : 'text-slate-400 hover:text-indigo-600'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-black text-[10px] uppercase tracking-widest text-slate-400 outline-none cursor-pointer"
                      >
                        <option value="name">Sort: Name</option>
                        <option value="expiry">Sort: Expiry</option>
                      </select>
                    </div>

                    {/* Grid */}
                    {sortedMedicines.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {sortedMedicines.map((medicine, idx) => {
                          const isExpired = new Date(medicine.expiryDate) <= new Date();
                          return (
                            <motion.div
                              key={medicine.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ y: -8 }}
                              onClick={() => navigate(`/medicines/${medicine.id}`)}
                              className="group bg-white rounded-[4rem] p-10 border border-slate-50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_-20px_rgba(79,70,229,0.12)] transition-all cursor-pointer overflow-hidden flex flex-col min-h-[440px]"
                            >
                              <div className="flex justify-between items-start mb-10">
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isExpired ? 'text-rose-500' : 'text-indigo-600'}`}>
                                  {medicine.category || 'Medication'}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${isExpired ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,1)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`}></div>
                              </div>
                              <h3 className="text-4xl font-black text-[#020617] tracking-tighter leading-none mb-6 group-hover:text-indigo-600 transition-colors uppercase">
                                {medicine.name}
                              </h3>
                              <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-4 text-slate-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                  <p className="text-[12px] font-black uppercase tracking-widest">{medicine.dosage}</p>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 italic mb-8">{medicine.frequency}</p>
                                <div className={`mt-auto p-6 rounded-3xl border-2 ${isExpired ? 'border-rose-100 bg-rose-50/20 text-rose-600' : 'border-indigo-100 bg-indigo-50/20 text-indigo-600'}`}>
                                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Expiry Date</p>
                                  <p className="font-black tracking-tight">{new Date(medicine.expiryDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 -translate-x-4">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">View Details</span>
                                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><IconPlus /></div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200"><IconSearch /></div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">No Medicines Found</h3>
                        <p className="text-lg text-slate-400 font-bold mb-10 italic">Your vault is clear at current filter coordinates.</p>
                        <button onClick={() => setSearchTerm('')} className="px-12 py-6 bg-indigo-600 text-white rounded-full font-black text-[12px] uppercase tracking-widest shadow-xl">Reset Search</button>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'analysis' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white rounded-[5rem] p-20 shadow-2xl border border-slate-50"
                  >
                    <h2 className="text-6xl font-black text-[#020617] tracking-tighter mb-16 italic opacity-20">Interaction Checker</h2>
                    <MedicineInteractionChecker />
                  </motion.div>
                )}

                {activeTab === 'training' && (
                  <motion.div
                    key="training"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white rounded-[5rem] p-20 shadow-2xl border border-slate-50"
                  >
                    <h2 className="text-6xl font-black text-[#020617] tracking-tighter mb-16 italic opacity-20">Medicine Quiz</h2>
                    <PillIdentificationGame />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Security Directive */}
        <div className="mt-32 p-16 bg-[#020617] text-white rounded-[4rem] relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-[0_40px_100px_-20px_rgba(2,6,23,0.4)]">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150"><IconShield /></div>
          <div className="w-32 h-32 bg-rose-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl animate-pulse">
            <IconAlert />
          </div>
          <div className="flex-1">
            <span className="text-rose-500 font-black uppercase tracking-[0.5em] text-[11px] mb-4 block">Emergency Support</span>
            <h4 className="text-4xl font-black tracking-tighter leading-tight max-w-4xl italic opacity-90">
              Check your medicine labels carefully. If you feel unwell, stop taking the medicine and call for help immediately.
            </h4>
          </div>
          <a href="tel:108" className="px-16 py-8 bg-white text-[#020617] rounded-[3rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl hover:bg-rose-600 hover:text-white transition-all">Connect: 108</a>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicineListPage;
