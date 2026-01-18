import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import useAccessibility from '../../hooks/useAccessibility';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Import LoadingSpinner

const ProfilePage = () => {
  const { state, actions } = useAppData();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const initialProfile = state.profile || user || {};

  const [editForm, setEditForm] = useState({
    ...initialProfile,
    emergencyContact: initialProfile.emergencyContact || { name: '', phone: '' }
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [announcedText, setAnnouncedText] = useState('');
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const freshProfile = state.profile || user || {};
    setEditForm({
      ...freshProfile,
      emergencyContact: freshProfile.emergencyContact || { name: '', phone: '' }
    });
  }, [state.profile, user]);

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeepInputChange = (parent, field, value) => {
    setEditForm(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    actions.updateProfile(editForm);
    setIsEditing(false);
    announce('Profile updated successfully');
  };

  const handleCancel = () => {
    setEditForm({
      ...state.profile,
      emergencyContact: state.profile.emergencyContact || { name: '', phone: '' }
    });
    setIsEditing(false);
    announce('Profile editing cancelled');
  };

  const announce = (text) => {
    setAnnouncedText(text);
    speak(text);
  };

  const switchTab = (tab) => {
    setActiveSection(tab);
    announce(`Switched to ${tab} information`);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 relative p-6 md:p-12 overflow-hidden"
      tabIndex="-1"
      ref={mainRef}
    >
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full"></div>

      {/* Screen reader announcement area */}
      <div aria-live="polite" className="sr-only">
        {announcedText}
      </div>

      {(!state.profile && !user) ? (
        <div className="flex justify-center items-center h-64 mt-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Header Section */}
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Personal Node</span>
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-2">My Profile</h1>
              <p className="text-slate-500 font-bold text-lg">Manage your personal information and medical details</p>
            </div>

            <button
              onClick={() => {
                if (isEditing) handleSave();
                else {
                  setIsEditing(true);
                  announce('Editing mode enabled');
                }
              }}
              className={`
                px-8 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-prism outline-none active:scale-95
                ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-100'}
              `}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* LEFT COLUMN: Main Content Card */}
            <div className="lg:col-span-8">
              <div className="bg-white/80 backdrop-blur-3xl rounded-[4rem] shadow-prism border border-white overflow-hidden transition-all duration-500">

                {/* Navigation Tabs */}
                <nav className="flex p-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar" aria-label="Profile Sections">
                  {[
                    { id: 'personal', label: 'Personal Info', icon: '👤' },
                    { id: 'emergency', label: 'Emergency Contacts', icon: '🚨' },
                    { id: 'medical', label: 'Medical Info', icon: '⚕️' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => switchTab(tab.id)}
                      aria-current={activeSection === tab.id ? 'page' : undefined}
                      className={`
                        flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap
                        ${activeSection === tab.id
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                          : 'text-slate-400 hover:text-slate-600'}
                      `}
                    >
                      <span className="text-lg opacity-80">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="p-12 md:p-16">
                  {isEditing && (
                    <div className="flex justify-end gap-4 mb-12">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* SECTIONS */}

                  {/* 1. PERSONAL INFO */}
                  {activeSection === 'personal' && (
                    <section aria-labelledby="personal-heading" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
                        <span className="text-3xl">👤</span>
                        <h2 id="personal-heading" className="text-2xl font-black text-slate-900 tracking-tighter">Personal Information</h2>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <ProfileField label="Full Name" value={editForm.name} field="name" isEditing={isEditing} onChange={handleInputChange} />
                        <ProfileField label="Email Address" value={editForm.email} field="email" isEditing={isEditing} onChange={handleInputChange} type="email" />
                        <ProfileField label="Phone Number" value={editForm.phone || ''} field="phone" isEditing={isEditing} onChange={handleInputChange} type="tel" />
                        <ProfileField label="Date of Birth" value={editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString().split('T')[0] : ''} field="dateOfBirth" isEditing={isEditing} onChange={handleInputChange} type="date" />
                        <div className="md:col-span-2">
                          <ProfileField label="Address" value={editForm.address || ''} field="address" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* 2. EMERGENCY CONTACTS */}
                  {activeSection === 'emergency' && (
                    <section aria-labelledby="emergency-heading" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4 border-b border-rose-100 pb-6 mb-8">
                        <span className="text-3xl">🚨</span>
                        <h2 id="emergency-heading" className="text-2xl font-black text-rose-600 tracking-tighter">Emergency Contacts</h2>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <ProfileField
                          label="Emergency Contact Name"
                          value={editForm.emergencyContact?.name || ''}
                          isEditing={isEditing}
                          onChange={(f, v) => handleDeepInputChange('emergencyContact', 'name', v)}
                        />
                        <ProfileField
                          label="Emergency Contact Phone"
                          value={editForm.emergencyContact?.phone || ''}
                          isEditing={isEditing}
                          onChange={(f, v) => handleDeepInputChange('emergencyContact', 'phone', v)}
                          type="tel"
                        />
                      </div>
                    </section>
                  )}

                  {/* 3. MEDICAL INFO */}
                  {activeSection === 'medical' && (
                    <section aria-labelledby="medical-heading" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4 border-b border-emerald-100 pb-6 mb-8">
                        <span className="text-3xl">⚕️</span>
                        <h2 id="medical-heading" className="text-2xl font-black text-emerald-600 tracking-tighter">Medical Information</h2>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <ProfileField label="Blood Type" value={editForm.bloodType || ''} field="bloodType" isEditing={isEditing} onChange={handleInputChange} />
                        <div className="md:col-span-2 space-y-8">
                          <ProfileField label="Medical Conditions" value={editForm.medicalConditions || ''} field="medicalConditions" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                          <ProfileField label="Allergies" value={editForm.allergies || ''} field="allergies" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                          <ProfileField label="Current Medications" value={editForm.medications || ''} field="medications" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar (Summary & Accessibility) */}
            <div className="lg:col-span-4 space-y-12">

              {/* Summary Card */}
              <div className="bg-white rounded-[3.5rem] p-12 shadow-prism border border-slate-50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                  <span className="text-8xl font-black tracking-tighter text-slate-900 pointer-events-none">DATA</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-2xl">📋</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Profile Summary</h3>
                  </div>
                  <ul className="space-y-6">
                    {[
                      'Manage your personal information securely',
                      'Keep emergency contacts up to date',
                      'Maintain current medical information',
                      'Review your information regularly'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0"></div>
                        <span className="text-slate-500 font-bold text-sm leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Accessibility Features Card */}
              <div className="bg-[#1a365d] rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-2xl">♿</span>
                    <h3 className="text-xl font-black text-indigo-100 tracking-tight italic">Accessibility</h3>
                  </div>
                  <ul className="space-y-5">
                    {[
                      'Proper labels for screen readers',
                      'High contrast text & backgrounds',
                      'Large, readable font sizes',
                      'Clear focus indicators',
                      'Logical tab order',
                      'Audio feedback for actions'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-indigo-200 font-bold text-xs uppercase tracking-widest">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for Profile Fields
const ProfileField = ({ label, value, field, isEditing, onChange, type = 'text', rows = 3 }) => {
  const isTextarea = type === 'textarea';

  return (
    <div className="space-y-3 group">
      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 transition-colors group-hover:text-indigo-600">
        {label}
      </label>
      {isEditing ? (
        isTextarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            rows={rows}
            className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-bold text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-sm"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full px-8 py-5 bg-white border border-slate-200 rounded-full text-slate-900 font-bold text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-sm"
          />
        )
      ) : (
        <div
          className={`
            w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] min-h-[64px] flex items-center shadow-inner transition-all group-hover:bg-white group-hover:shadow-prism
            ${!isTextarea ? 'rounded-full' : ''}
          `}
          tabIndex="0"
        >
          {value ? (
            <p className="text-slate-900 font-black text-lg tracking-tight underline decoration-indigo-200 decoration-2 underline-offset-4">{value}</p>
          ) : (
            <span className="text-slate-300 font-bold italic text-base">Not provided</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;