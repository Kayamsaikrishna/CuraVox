import React, { useState, useEffect } from 'react';

const TimePickerModal = ({ reminder, setReminder, onSave, onClose, isEditing }) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState(reminder.times || []);
  const [selectedDays, setSelectedDays] = useState(reminder.days || [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]);

  const daysOfWeek = [
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' }
  ];

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const formattedTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      timeOptions.push({ value: timeString, label: formattedTime });
    }
  }

  useEffect(() => {
    if (reminder) {
      setAvailableTimes(reminder.times || []);
      setSelectedDays(reminder.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
    }
  }, [reminder]);

  const handleAddTime = () => {
    if (selectedTime && !availableTimes.includes(selectedTime)) {
      setAvailableTimes([...availableTimes, selectedTime].sort());
    }
  };

  const handleRemoveTime = (timeToRemove) => {
    setAvailableTimes(availableTimes.filter(time => time !== timeToRemove));
  };

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    setReminder(prev => ({ ...prev, times: availableTimes, days: selectedDays }));
    onSave();
  };

  return (
    <div
      className="fixed inset-0 bg-[#020617]/40 backdrop-blur-xl flex items-center justify-center p-6 z-[1000] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[3.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_40px_120px_-20px_rgba(79,70,229,0.2)] border border-slate-100 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-picker-title"
      >
        {/* MODAL HEADER */}
        <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] block">Set Schedule</span>
            </div>
            <h2 id="time-picker-title" className="text-4xl font-black text-[#020617] tracking-tighter">
              {isEditing ? 'Edit Reminder' : 'Set Reminder'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="p-12 space-y-12">
          {/* MEDICINE IDENTITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Medicine Name</label>
              <input
                type="text"
                value={reminder.medicineName || ''}
                onChange={(e) => setReminder(prev => ({ ...prev, medicineName: e.target.value }))}
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#020617] outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all placeholder:text-slate-300"
                placeholder="e.g. Atorvastatin"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Dosage</label>
              <input
                type="text"
                value={reminder.dosage || ''}
                onChange={(e) => setReminder(prev => ({ ...prev, dosage: e.target.value }))}
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#020617] outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all placeholder:text-slate-300"
                placeholder="e.g. 20mg"
              />
            </div>
          </div>

          {/* TEMPORAL SELECTION */}
          <div className="space-y-8">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Times</label>
            <div className="flex gap-4">
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex-1 px-8 py-5 bg-white border border-slate-100 rounded-2xl font-black text-[12px] uppercase tracking-widest text-indigo-600 outline-none shadow-sm cursor-pointer focus:border-indigo-200"
              >
                <option value="">Select Time</option>
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>{time.label}</option>
                ))}
              </select>
              <button
                onClick={handleAddTime}
                className="px-10 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                Add Time
              </button>
            </div>

            {/* TIME CHIPS */}
            {availableTimes.length > 0 && (
              <div className="flex flex-wrap gap-4 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed">
                {availableTimes.map((time) => {
                  const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit', hour12: true
                  });
                  return (
                    <div key={time} className="flex items-center gap-4 px-6 py-3 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-indigo-200 transition-colors">
                      <span className="text-[12px] font-black text-indigo-600 uppercase tracking-widest">{formattedTime}</span>
                      <button
                        onClick={() => handleRemoveTime(time)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CYCLE SELECTION */}
          <div className="space-y-8">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Days</label>
            <div className="grid grid-cols-7 gap-3">
              {daysOfWeek.map((day) => (
                <button
                  key={day.key}
                  onClick={() => toggleDaySelection(day.key)}
                  className={`py-5 rounded-2xl text-[11px] font-black transition-all ${selectedDays.includes(day.key)
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100'
                    : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-indigo-100'
                    }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-12 bg-slate-50/50 border-t border-slate-50 flex gap-6">
          <button
            onClick={onClose}
            className="flex-1 py-6 rounded-2xl bg-white border border-slate-100 text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] hover:text-slate-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[1.5] py-6 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;