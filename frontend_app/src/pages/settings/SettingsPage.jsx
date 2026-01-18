import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVoiceFeedback } from '../../contexts/VoiceFeedbackContext';
import useAccessibility from '../../hooks/useAccessibility';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    highContrast: false,
    audioEnabled: true,
    voiceSpeed: 1,
    voicePitch: 1,
    showAnimations: false,
    largeCursor: false,
    notificationsEnabled: true,
    robotVoiceEnabled: true,
    voiceType: 'standard'
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [activeSection, setActiveSection] = useState('appearance');
  const { speak } = useAccessibility();
  const { isVoiceEnabled, toggleVoiceFeedback } = useVoiceFeedback();

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (settingName, value) => {
    setSettings(prev => ({ ...prev, [settingName]: value }));
    const updatedSettings = { ...settings, [settingName]: value };
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    setSaveStatus('Settings saved successfully');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 'normal',
      highContrast: false,
      audioEnabled: true,
      voiceSpeed: 1,
      voicePitch: 1,
      showAnimations: false,
      largeCursor: false,
      notificationsEnabled: true,
      robotVoiceEnabled: true,
      voiceType: 'standard'
    };
    setSettings(defaultSettings);
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    setSaveStatus('Settings reset to defaults');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small (14px)' },
    { value: 'normal', label: 'Normal (16px)' },
    { value: 'large', label: 'Large (18px)' },
    { value: 'xlarge', label: 'Extra Large (20px)' }
  ];

  const voiceTypeOptions = [
    { value: 'standard', label: 'Standard Voice' },
    { value: 'robotic', label: 'Robotic Voice' },
    { value: 'enhanced', label: 'Enhanced Clarity' }
  ];

  const announceChange = (message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (settings.highContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');

    const fontSizeMultipliers = { small: 0.875, normal: 1, large: 1.125, xlarge: 1.25 };
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultipliers[settings.fontSize]);

    if (settings.showAnimations) document.body.classList.remove('reduce-motion');
    else document.body.classList.add('reduce-motion');
  }, [settings]);

  return (
    <div className="min-h-screen bg-slate-50 relative p-6 md:p-12 overflow-hidden font-sans antialiased">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full"></div>

      {/* Screen reader announcement area */}
      <div aria-live="polite" className="sr-only">{saveStatus}</div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Control Matrix</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-2" tabIndex="0">Settings</h1>
            <p className="text-slate-500 font-bold text-lg" tabIndex="0">Customize your accessibility preferences</p>
          </div>

          <button
            onClick={resetSettings}
            className="px-8 py-4 bg-white text-rose-600 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-prism hover:bg-rose-50 border border-slate-100 transition-all outline-none active:scale-95"
          >
            Reset to Defaults
          </button>
        </header>

        {/* Save Status Toast */}
        {saveStatus && (
          <div className="fixed top-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
            <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20">
              <span className="text-xl">✅</span>
              <span className="font-black text-sm uppercase tracking-widest">{saveStatus}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT: Navigation Tabs */}
          <div className="lg:col-span-4 space-y-4">
            <nav className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-4 shadow-prism border border-white space-y-2" role="tablist">
              {[
                { id: 'appearance', label: 'Appearance', icon: '🎨' },
                { id: 'accessibility', label: 'Accessibility', icon: '♿' },
                { id: 'audio', label: 'Audio', icon: '🔊' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  role="tab"
                  aria-selected={activeSection === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  className={`
                    w-full flex items-center gap-6 px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all
                    ${activeSection === tab.id
                      ? 'bg-indigo-600 text-white shadow-xl scale-[1.02] -translate-x-2'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                  `}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Quick Voice Control Integration */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-prism group overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                <span className="text-8xl font-black text-slate-900">VOX</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 italic">Voice Feedback</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Interaction Node</p>
                  </div>
                  <button
                    onClick={() => {
                      toggleVoiceFeedback();
                      announceChange(isVoiceEnabled ? 'Voice feedback disabled' : 'Voice feedback enabled');
                    }}
                    className={`
                      w-16 h-8 rounded-full relative transition-all duration-500
                      ${isVoiceEnabled ? 'bg-indigo-600' : 'bg-slate-200'}
                    `}
                    role="switch"
                    aria-checked={isVoiceEnabled}
                    aria-label="Toggle voice feedback"
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isVoiceEnabled ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-slate-500 font-bold text-xs italic leading-relaxed">
                  {isVoiceEnabled
                    ? 'Voice feedback is currently enabled'
                    : 'Voice feedback is currently disabled'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-tighter italic">
                  Toggle to enable or disable all voice feedback throughout the application
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Settings Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white/80 backdrop-blur-3xl rounded-[4rem] p-12 md:p-16 shadow-prism border border-white min-h-[600px] relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <span className="text-[12rem] font-black tracking-tighter text-slate-900 leading-none uppercase">{activeSection}</span>
              </div>

              <div role="tabpanel" id={`panel-${activeSection}`} className="relative z-10 animate-in fade-in slide-in-from-right-8 duration-500">
                {activeSection === 'appearance' && (
                  <div className="space-y-12">
                    <header className="flex items-center gap-6 border-b border-slate-100 pb-8">
                      <span className="text-4xl">🎨</span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter" tabIndex="0">Appearance Settings</h2>
                    </header>

                    <div className="grid gap-8">
                      <SettingsToggle
                        label="High Contrast Mode"
                        desc="Increase contrast between text and background"
                        active={settings.highContrast}
                        onToggle={() => {
                          const newValue = !settings.highContrast;
                          handleSettingChange('highContrast', newValue);
                          announceChange(newValue ? 'High contrast mode enabled' : 'High contrast mode disabled');
                        }}
                      />
                      <SettingsToggle
                        label="Large Cursor"
                        desc="Enlarge the mouse cursor for better visibility"
                        active={settings.largeCursor}
                        onToggle={() => {
                          const newValue = !settings.largeCursor;
                          handleSettingChange('largeCursor', newValue);
                          announceChange(newValue ? 'Large cursor enabled' : 'Large cursor disabled');
                        }}
                      />
                      <div className="space-y-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Font Size</label>
                        <select
                          value={settings.fontSize}
                          onChange={(e) => {
                            handleSettingChange('fontSize', e.target.value);
                            announceChange(`Font size set to ${fontSizeOptions.find(o => o.value === e.target.value).label}`);
                          }}
                          className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-full font-black text-slate-900 text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-inner appearance-none"
                        >
                          {fontSizeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'accessibility' && (
                  <div className="space-y-12">
                    <header className="flex items-center gap-6 border-b border-indigo-100 pb-8">
                      <span className="text-4xl text-indigo-600">♿</span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter" tabIndex="0">Accessibility Settings</h2>
                    </header>
                    <div className="grid gap-8">
                      <SettingsToggle
                        label="Audio Feedback"
                        desc="Enable audio descriptions for interface elements"
                        active={settings.audioEnabled}
                        onToggle={() => {
                          const newValue = !settings.audioEnabled;
                          handleSettingChange('audioEnabled', newValue);
                          announceChange(newValue ? 'Audio feedback enabled' : 'Audio feedback disabled');
                        }}
                      />
                      <SettingsToggle
                        label="Reduce Animations"
                        desc="Minimize distracting animations and transitions"
                        active={!settings.showAnimations}
                        onToggle={() => {
                          const newValue = !settings.showAnimations;
                          handleSettingChange('showAnimations', newValue);
                          announceChange(newValue ? 'Animations reduced' : 'Animations enabled');
                        }}
                      />
                      <SettingsSlider
                        label="Voice Speed"
                        value={settings.voiceSpeed}
                        suffix="x"
                        min={0.5} max={2} step={0.1}
                        lowerLabel="Slower" higherLabel="Faster"
                        onChange={(v) => {
                          handleSettingChange('voiceSpeed', v);
                          announceChange(`Voice speed set to ${v}x`);
                        }}
                      />
                      <SettingsSlider
                        label="Voice Pitch"
                        value={settings.voicePitch}
                        min={0.5} max={2} step={0.1}
                        lowerLabel="Lower" higherLabel="Higher"
                        onChange={(v) => {
                          handleSettingChange('voicePitch', v);
                          announceChange(`Voice pitch set to ${v}`);
                        }}
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'audio' && (
                  <div className="space-y-12">
                    <header className="flex items-center gap-6 border-b border-emerald-100 pb-8">
                      <span className="text-4xl text-emerald-600">🔊</span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter" tabIndex="0">Audio Settings</h2>
                    </header>
                    <div className="grid gap-8">
                      <SettingsToggle
                        label="Robot Voice Output"
                        desc="Enable robotic voice for medication reminders"
                        active={settings.robotVoiceEnabled}
                        onToggle={() => {
                          const newValue = !settings.robotVoiceEnabled;
                          handleSettingChange('robotVoiceEnabled', newValue);
                          announceChange(newValue ? 'Robot voice enabled' : 'Robot voice disabled');
                        }}
                      />
                      <div className="space-y-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Voice Type</label>
                        <select
                          value={settings.voiceType}
                          onChange={(e) => {
                            handleSettingChange('voiceType', e.target.value);
                            announceChange(`Voice type set to ${voiceTypeOptions.find(o => o.value === e.target.value).label}`);
                          }}
                          className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-full font-black text-slate-900 text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-inner appearance-none"
                        >
                          {voiceTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => announceChange('This is a test of the audio settings. The voice should match your selected preferences.')}
                        className="w-full mt-4 p-10 bg-emerald-50 text-emerald-600 rounded-[3rem] border border-emerald-100 flex items-center justify-center gap-8 hover:bg-emerald-100/50 transition-all group active:scale-95 shadow-sm"
                      >
                        <span className="text-5xl group-hover:rotate-12 transition-transform">📢</span>
                        <div className="text-left">
                          <h4 className="font-black text-2xl tracking-tight leading-none mb-1 italic">Test Voice Settings</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Synthesize current voice node</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-12">
                    <header className="flex items-center gap-6 border-b border-rose-100 pb-8">
                      <span className="text-4xl text-rose-600">🔔</span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter" tabIndex="0">Notification Settings</h2>
                    </header>
                    <div className="grid gap-8">
                      <SettingsToggle
                        label="Medication Reminders"
                        desc="Receive notifications for upcoming medications"
                        active={settings.notificationsEnabled}
                        onToggle={() => {
                          const newValue = !settings.notificationsEnabled;
                          handleSettingChange('notificationsEnabled', newValue);
                          announceChange(newValue ? 'Medication reminders enabled' : 'Medication reminders disabled');
                        }}
                      />

                      {/* Notification Preferences Overlay */}
                      <div className="p-10 bg-rose-50/50 rounded-[3rem] border border-rose-100 shadow-inner group">
                        <h3 className="text-xl font-black text-rose-600 tracking-tight leading-none mb-6 flex items-center gap-3">
                          <span className="text-2xl opacity-80 italic">📋</span>
                          Notification Preferences
                        </h3>
                        <ul className="space-y-4">
                          {[
                            'Time-based reminders for medications',
                            'Expiry date warnings',
                            'Missed dose notifications',
                            'Emergency contact notifications'
                          ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-rose-700/70 font-bold text-sm tracking-tight group-hover:text-rose-700 transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Hub */}
              <div className="mt-16 pt-12 border-t border-slate-50 flex flex-wrap gap-4 relative z-10">
                <Link
                  to="/"
                  className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-prism outline-none text-center flex-1 min-w-[200px]"
                  tabIndex="0"
                >
                  Back to Dashboard
                </Link>
              </div>

              {/* Accessibility Tips Hub */}
              <div className="mt-12 p-10 bg-[#e0f2fe] rounded-[3.5rem] border border-[#0ea5e9]/20 group">
                <h3 className="text-xl font-black text-[#0369a1] tracking-tight leading-none mb-8 flex items-center gap-3 italic">
                  <span className="text-2xl group-hover:scale-125 transition-transform">ℹ️</span>
                  Accessibility Tips
                </h3>
                <ul className="grid md:grid-cols-2 gap-6">
                  {[
                    'Press Tab to navigate between interactive elements',
                    'Press Enter or Space to activate buttons and switches',
                    'Use arrow keys to adjust sliders',
                    'Changes are saved automatically',
                    'Press Alt+S to jump to settings navigation'
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-4" tabIndex="0">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"></div>
                      <span className="text-[#0369a1]/70 font-bold text-xs uppercase tracking-tighter leading-tight group-hover:text-[#0369a1] transition-colors">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const SettingsToggle = ({ label, desc, active, onToggle }) => (
  <div className="flex items-center justify-between p-10 bg-white rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-prism transition-all group overflow-hidden relative">
    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
      <span className="text-6xl font-black text-slate-900 uppercase tracking-tighter italic">{label.split(' ')[0]}</span>
    </div>
    <div className="pr-8 relative z-10">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 italic group-hover:text-indigo-600 transition-colors uppercase underline decoration-indigo-50 decoration-4 underline-offset-8">{label}</h3>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{desc}</p>
    </div>
    <button
      onClick={onToggle}
      className={`
        w-24 h-12 rounded-full relative transition-all duration-500 flex-shrink-0 shadow-inner overflow-hidden
        ${active ? 'bg-indigo-600 box-shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-slate-100'}
      `}
      role="switch"
      aria-checked={active}
    >
      <div className={`absolute top-1.5 w-9 h-9 bg-white rounded-full transition-all shadow-lg ${active ? 'left-13.5' : 'left-1.5'}`} />
    </button>
  </div>
);

const SettingsSlider = ({ label, value, min, max, step, suffix = '', lowerLabel, higherLabel, onChange }) => (
  <div className="p-10 bg-slate-50/50 rounded-[3.5rem] border border-slate-100 shadow-inner group transition-all hover:bg-white hover:shadow-prism">
    <div className="flex justify-between items-end px-4 mb-8">
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">{label} Profile</h3>
        <p className="text-4xl font-black text-indigo-600 leading-none tracking-tighter italic underline decoration-indigo-100 decoration-8 underline-offset-[12px]">{value}{suffix}</p>
      </div>
      <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`w-1.5 h-6 rounded-full transition-all duration-500 ${i / 6 < (value - min) / (max - min) ? 'bg-indigo-600 h-10' : 'bg-slate-200'}`}></div>
        ))}
      </div>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 border-4 border-white shadow-inner"
      tabIndex="0"
    />
    <div className="flex justify-between mt-4 px-2">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{lowerLabel}</span>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{higherLabel}</span>
    </div>
  </div>
);

export default SettingsPage;