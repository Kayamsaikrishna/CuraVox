import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';
import TimePickerModal from '../../components/reminders/TimePickerModal';

// --- Ultra-Prism Icons ---
const IconClock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconArchive = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
);
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);

const RemindersPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useAppData();
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  const [activeTab, setActiveTab] = useState('upcoming');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempReminder, setTempReminder] = useState({
    medicineName: '',
    dosage: '',
    times: [],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });

  useEffect(() => {
    if (mainRef.current) mainRef.current.focus();
    speak('Reminders loaded. Stay on track with your medicines.');
  }, []);

  const calculateNextDue = (times, days) => {
    const now = new Date();
    const currentDay = now.getDay();
    const dayMap = { 'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6 };

    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayName = Object.keys(dayMap).find(key => dayMap[key] === checkDay);
      if (days.includes(dayName)) {
        const sortedTimes = [...times].sort();
        for (const time of sortedTimes) {
          const [h, m] = time.split(':').map(Number);
          const next = new Date(now);
          next.setDate(now.getDate() + i);
          next.setHours(h, m, 0, 0);
          if (next > now) return next.toISOString();
        }
      }
    }
    return null;
  };

  const handleSaveReminder = () => {
    const nextDue = tempReminder.times.length > 0 ? calculateNextDue(tempReminder.times, tempReminder.days) : null;
    const newReminder = {
      id: editingReminder ? editingReminder.id : Date.now(),
      medicineName: tempReminder.medicineName,
      dosage: tempReminder.dosage,
      times: tempReminder.times,
      days: tempReminder.days,
      isActive: true,
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString(),
      lastTaken: editingReminder ? editingReminder.lastTaken : null,
      nextDue: nextDue
    };

    if (editingReminder) actions.updateReminder(newReminder);
    else actions.addReminder(newReminder);

    setShowTimePicker(false);
    speak(`Reminder for ${newReminder.medicineName} saved.`);
  };

  const filteredReminders = state.reminders.filter(reminder => {
    const matchesSearch = !searchTerm ||
      reminder.medicineName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'upcoming') matchesTab = reminder.isActive && (reminder.nextDue ? new Date(reminder.nextDue) >= new Date() : true);
    else if (activeTab === 'taken') matchesTab = reminder.lastTaken && new Date(reminder.lastTaken).toDateString() === new Date().toDateString();

    return matchesSearch && matchesTab;
  });

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] pb-32 font-sans selection:bg-indigo-100 outline-none"
      ref={mainRef}
      tabIndex="-1"
    >
      <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-10 py-20 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12 relative z-10">
          <div>
            <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="flex items-center gap-4 mb-6">
              <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
              <span className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.5em]">Medicine Reminders</span>
            </motion.div>
            <h1 className="text-8xl font-black text-[#020617] tracking-tighter leading-none mb-8">My <span className="text-indigo-600">Schedule</span></h1>
            <p className="text-2xl text-slate-500 font-bold max-w-2xl leading-relaxed italic opacity-80 border-l-4 border-indigo-100 pl-8">
              Stay on track with your medication schedule.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingReminder(null);
              setTempReminder({
                medicineName: '', dosage: '', times: [],
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
              });
              setShowTimePicker(true);
              speak('Setting up a new reminder');
            }}
            className="px-12 py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)] flex items-center gap-6"
          >
            <IconPlus /> Add Reminder
          </motion.button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-10 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          <div className="lg:col-span-8 relative group">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-20 pr-10 py-7 bg-white border border-slate-100 rounded-[3rem] shadow-sm outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/20 font-black text-slate-800 transition-all text-xl"
            />
          </div>
          <div className="lg:col-span-4 flex items-center gap-4 bg-white px-8 py-4 rounded-[3rem] border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter</span>
            <div className="h-4 w-px bg-slate-100 mx-2"></div>
            {['upcoming', 'taken'].map(t => (
              <button
                key={t}
                onClick={() => { setActiveTab(t); speak(`Filtering for ${t} items`); }}
                className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#020617] text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {filteredReminders.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
            >
              {filteredReminders.map((reminder, idx) => (
                <motion.div
                  key={reminder.id}
                  whileHover={{ y: -12 }}
                  className="bg-white rounded-[4rem] p-12 border border-slate-50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.02)] hover:shadow-[0_60px_100px_-20px_rgba(79,70,229,0.12)] transition-all flex flex-col min-h-[550px] relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-60"></div>

                  <div className="flex justify-between items-start mb-10">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <IconClock />
                    </div>
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => {
                          setEditingReminder(reminder);
                          setTempReminder({ ...reminder });
                          setShowTimePicker(true);
                        }}
                        className="p-5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"
                      ><IconEdit /></button>
                      <button
                        onClick={() => { actions.removeReminder(reminder.id); speak('Reminder deleted'); }}
                        className="p-5 bg-rose-50 text-rose-300 hover:text-rose-600 rounded-2xl transition-all"
                      ><IconTrash /></button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-4xl font-black text-[#020617] tracking-tighter leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                      {reminder.medicineName}
                    </h3>
                    <div className="inline-block px-6 py-3 bg-emerald-50 rounded-2xl text-[11px] font-black text-emerald-700 uppercase tracking-widest border border-emerald-100 mb-10">
                      {reminder.dosage}
                    </div>

                    <div className="space-y-6 pt-8 border-t border-slate-50">
                      <div className="flex items-center gap-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,1)]"></div>
                        <p className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Next Due: <span className="text-indigo-600">{formatTime(reminder.nextDue)}</span></p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reminder.days.map((d, i) => (
                          <span key={i} className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 group-hover:border-indigo-100 transition-colors">{d.slice(0, 3)}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex gap-4">
                    <button
                      onClick={() => { actions.markAsTaken(reminder.id); speak('Verification complete'); }}
                      className="flex-1 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95"
                    >
                      Mark as Taken
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...reminder, isActive: !reminder.isActive };
                        actions.updateReminder(updated);
                        speak(`Reminder ${updated.isActive ? 'active' : 'off'}`);
                      }}
                      className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${reminder.isActive ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      {reminder.isActive ? <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> : <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-emerald-600 ml-1"></div>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 text-center bg-white rounded-[5rem] border-4 border-dashed border-slate-50"
            >
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
                <IconArchive />
              </div>
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-6">No Reminders Found</h3>
              <p className="text-2xl text-slate-400 font-bold max-w-lg mx-auto mb-12 italic leading-relaxed">No reminders detected for this filter.</p>
              <button
                onClick={() => setActiveTab('upcoming')}
                className="px-16 py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl"
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="p-16 bg-white rounded-[4rem] border border-slate-50 group hover:shadow-2xl transition-all">
            <h4 className="text-3xl font-black text-[#020617] tracking-tight mb-10">Care Rules</h4>
            <div className="space-y-8">
              {[
                "Add your medicines in the Medicine Vault.",
                "Set clear dosages for each reminder.",
                "Follow your schedule carefully."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-6 border-l-4 border-indigo-100 pl-8 py-2 group-hover:border-indigo-600 transition-colors">
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest leading-relaxed opacity-70 group-hover:opacity-100">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-16 bg-[#020617] text-white rounded-[4rem] border-l-[16px] border-rose-600">
            <span className="text-rose-500 font-black uppercase tracking-[0.5em] text-[12px] mb-4 block">Manual Override</span>
            <h4 className="text-4xl font-black tracking-tighter mb-10">Emergency Help</h4>
            <p className="text-xl text-slate-400 font-bold mb-12 italic opacity-80 leading-relaxed">If you feel very unwell or have severe symptoms, call 1-0-8 immediately.</p>
            <a href="tel:108" className="block py-8 bg-rose-600 text-white rounded-[2rem] text-center font-black text-[13px] uppercase tracking-[0.5em] shadow-[0_20px_50px_-10px_rgba(225,29,72,0.4)] hover:bg-rose-700 transition-all">Emergency Sync: 108</a>
          </div>
        </div>
      </div>

      {showTimePicker && (
        <TimePickerModal
          reminder={tempReminder}
          setReminder={setTempReminder}
          onSave={handleSaveReminder}
          onClose={() => setShowTimePicker(false)}
          isEditing={!!editingReminder}
        />
      )}
    </motion.div>
  );
};

export default RemindersPage;