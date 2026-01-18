import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import useAccessibility from '../../hooks/useAccessibility';
import logo from '../../assets/logo.png';

// --- SVG ICONS (Lucide Style) ---
const IconScan = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>
);
const IconPill = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
);
const IconClock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconStethoscope = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>
);
const IconUser = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const IconSettings = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);

const HomePage = () => {
  const { logout, user } = useAuth();
  const { state, actions } = useAppData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [announcedText, setAnnouncedText] = useState('');
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.focus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const refreshTimer = setInterval(() => actions.refreshAll(), 30000);
    return () => { clearInterval(timer); clearInterval(refreshTimer); };
  }, []);

  useEffect(() => {
    actions.refreshAll();
    const welcome = `CuraVox Clinical Interface active for ${user?.name || 'Authorized User'}.`;
    setTimeout(() => setAnnouncedText(welcome), 1000);
  }, [user]);

  const announce = (text) => {
    setAnnouncedText(text);
    speak(text);
  };

  const services = [
    { title: "AI Diagnostics", desc: "Advanced medicine analysis", icon: <IconScan />, link: "/scan", theme: "teal" },
    { title: "Medication Vault", desc: "Your clinical history", icon: <IconPill />, link: "/medicines", theme: "indigo" },
    { title: "Precision Schedule", desc: "Treatment time-lining", icon: <IconClock />, link: "/reminders", theme: "teal" },
    { title: "Clinical Support", desc: "Live AI consultation", icon: <IconStethoscope />, link: "/consultation", theme: "indigo" },
    { title: "Patient Profile", desc: "Records & medical ID", icon: <IconUser />, link: "/profile", theme: "teal" },
    { title: "System Overhaul", desc: "Core interface config", icon: <IconSettings />, link: "/settings", theme: "indigo" }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 pb-24 selection:bg-[#76a04e]/20" ref={mainRef} tabIndex="-1">
      <div aria-live="polite" className="sr-only">{announcedText}</div>

      {/* Premium Minimalist Header */}
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/20 px-10 py-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <img
                  src={logo}
                  alt="CuraVox Logo"
                  className="h-10 w-auto object-contain transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="ai-pulse-dot bg-[#76a04e]"></span>
                  <span className="ai-pulse-inner bg-[#76a04e]"></span>
                </div>
              </div>
              <div className="hidden sm:block border-l-2 border-slate-100 pl-6 py-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none block">System Intelligence Control</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden lg:block border-l-2 border-slate-100 pl-10 py-1">
              <p className="text-lg font-black text-slate-900 tabular-nums leading-none mb-1">{currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <button
              onClick={logout}
              className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-rose-600 rounded-2xl transition-all border border-slate-200 hover:border-rose-600 shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-10 pt-40 grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Left Column: Intelligence Center */}
        <div className="lg:col-span-8 flex flex-col gap-16">

          {/* Clinical Hero Section */}
          <section className="relative group">
            <div className="absolute inset-x-0 -top-20 -bottom-20 bg-gradient-to-tr from-[#76a04e]/10 via-white to-[#1a365d]/10 blur-3xl opacity-40"></div>
            <div className="relative glass-card !p-12 overflow-hidden border-white bg-white/30">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#76a04e] animate-pulse"></span>
                  <span className="text-xs font-black text-[#76a04e] uppercase tracking-[0.3em]">Patient: {user?.name || 'Unidentified'}</span>
                </div>
                <h2 className="text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                  Monitoring <span className="text-[#76a04e]">Active</span>.
                </h2>
                <p className="text-slate-500 mt-8 text-xl font-semibold leading-relaxed max-w-2xl">
                  Welcome to your health dashboard. You have <span className="text-slate-900 font-black underline decoration-[#76a04e] decoration-4 underline-offset-8">{state.stats.dosesToday} doses</span> remaining for today.
                </p>
                <div className="mt-12 flex items-center gap-6">
                  <Link to="/scan" className="btn-premium bg-[#1a365d] text-white hover:bg-[#1a365d]/90 hover:shadow-[#1a365d]/20 hover:scale-105 min-w-[240px]">
                    <IconScan />
                    <span className="uppercase tracking-[0.2em] text-xs">Begin Diagnostic</span>
                  </Link>
                  <Link to="/consultation" className="px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center gap-3">
                    <IconStethoscope /> Dr. CuraVox
                  </Link>
                </div>
              </div>

              {/* Decorative Geometric Element */}
              <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-gradient-to-br from-[#76a04e]/10 to-transparent rounded-full blur-2xl"></div>
            </div>
          </section>

          {/* Operational Services Grid */}
          <section>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Operational Services</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <Link
                  key={i}
                  to={service.link}
                  className="glass-card !p-8 hover:!bg-white group relative overflow-hidden flex flex-col items-center text-center"
                >
                  <div className={`w-20 h-20 rounded-3xl mb-8 flex items-center justify-center shadow-xl transition-all group-hover:scale-110 group-hover:-translate-y-2 ${service.theme === 'teal' ? 'bg-[#76a04e]/5 text-[#76a04e]' : 'bg-[#1a365d]/5 text-[#1a365d]'}`}>
                    {service.icon}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#76a04e] transition-colors">{service.title}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{service.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Telemetry & Protocol */}
        <div className="lg:col-span-4 flex flex-col gap-16">

          {/* Telemetry Panel */}
          <section className="glass-card !bg-white !p-10 border-slate-100 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-10 text-center">Treatment Timeline</h3>

            <div className="space-y-10">
              {state.reminders.length > 0 ? (
                state.reminders.slice(0, 3).map((reminder, idx) => (
                  <div key={idx} className="relative pl-10 group">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-[#76a04e] bg-white group-hover:bg-[#76a04e] transition-all"></div>
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-[10px] font-black text-[#76a04e] uppercase tracking-tighter tabular-nums">
                        {new Date(reminder.nextDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#1a365d] transition-colors">{reminder.medicineName}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{reminder.dosage}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">All clear for this cycle</p>
                </div>
              )}
            </div>
          </section>

          {/* Emergency Protocol */}
          <section className="relative overflow-hidden glass-card border-none !bg-rose-600 text-white shadow-rose-200/50">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
                </div>
                <h3 className="text-2xl font-black tracking-tighter">EMERGENCY</h3>
              </div>
              <p className="font-bold text-rose-100 mb-10 leading-relaxed text-sm">Initiate immediate contact with clinical emergency services if suffering acute symptoms.</p>
              <div className="flex flex-col gap-4">
                <a href="tel:108" className="w-full py-5 rounded-3xl bg-white text-rose-600 text-center font-black text-sm uppercase tracking-[0.3em] hover:scale-105 transition-transform shadow-2xl">Call 1-0-8</a>
              </div>
            </div>
            {/* Visual background noise */}
            <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </section>
        </div>
      </main>

      {/* Modern Global Control Hub */}
      <nav className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        <div className="px-8 py-5 bg-slate-900/90 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl flex items-center gap-10">
          <Link to="/" className="text-[#76a04e] transition-all hover:scale-125"><IconUser /></Link>
          <div className="w-px h-6 bg-slate-700"></div>
          <Link to="/reminders" className="text-slate-500 hover:text-white transition-all hover:scale-125"><IconClock /></Link>
          <div className="w-px h-6 bg-slate-700"></div>
          <Link to="/settings" className="text-slate-500 hover:text-white transition-all hover:scale-125"><IconSettings /></Link>
        </div>
        <Link to="/scan" className="w-20 h-20 bg-[#76a04e] hover:bg-[#76a04e]/90 text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#76a04e]/40 transition-all active:scale-90 hover:rotate-90">
          <IconScan />
        </Link>
      </nav>
    </div>
  );
};

export default HomePage;