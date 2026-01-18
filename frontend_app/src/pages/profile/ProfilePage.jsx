import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import useAccessibility from '../../hooks/useAccessibility';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Import LoadingSpinner

const ProfilePage = () => {
  const { state, actions } = useAppData();
  const { user } = useAuth(); // Get user from AuthContext
  const [isEditing, setIsEditing] = useState(false);

  // Use state.profile or fall back to user
  const initialProfile = state.profile || user || {};

  const [editForm, setEditForm] = useState({
    ...initialProfile,
    // Ensure nested objects exist to avoid crashes
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

  // Update form when profile data loads or changes
  useEffect(() => {
    const freshProfile = state.profile || user || {};
    setEditForm({
      ...freshProfile,
      emergencyContact: freshProfile.emergencyContact || { name: '', phone: '' }
    });
  }, [state.profile, user]); // Depend on user too

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
    // In a real app, validation should happen here
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
      style={{
        backgroundColor: '#f0f9ff',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6'
      }}
      tabIndex="-1"
      ref={mainRef}
    >
      {/* Screen reader announcement area */}
      <div aria-live="polite" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
        {announcedText}
      </div>

      {(!state.profile && !user) ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }}>

          {/* LEFT COLUMN: Main Content */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '2px solid #3b82f6'
          }}>
            <header style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af', marginBottom: '5px' }}>My Profile</h1>
              <p style={{ color: '#4b5563' }}>Manage your personal information and medical details</p>
            </header>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', flexWrap: 'wrap' }} aria-label="Profile Sections">
              {[
                { id: 'personal', label: 'Personal Info' },
                { id: 'emergency', label: 'Emergency Contacts' },
                { id: 'medical', label: 'Medical Info' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  aria-current={activeSection === tab.id ? 'page' : undefined}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: activeSection === tab.id ? '#3b82f6' : 'transparent',
                    color: activeSection === tab.id ? 'white' : '#4b5563',
                    border: 'none',
                    borderRadius: '20px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setIsEditing(true);
                  announce('Editing mode enabled');
                }}
                style={{
                  marginLeft: 'auto',
                  padding: '10px 20px',
                  backgroundColor: isEditing ? '#f59e0b' : '#eff6ff',
                  color: isEditing ? 'white' : '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isEditing ? 'Editing...' : 'Edit Profile'}
              </button>
            </nav>

            {/* Action Buttons (Save/Cancel) */}
            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
                <button onClick={handleSave} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                <button onClick={handleCancel} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              </div>
            )}

            {/* SECTIONS */}

            {/* 1. PERSONAL INFO */}
            {activeSection === 'personal' && (
              <section aria-labelledby="personal-heading">
                <h2 id="personal-heading" style={{ fontSize: '22px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px', color: '#1f2937' }}>
                  👤 Personal Information
                </h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <ProfileField label="Full Name" value={editForm.name} field="name" isEditing={isEditing} onChange={handleInputChange} />
                  <ProfileField label="Email Address" value={editForm.email} field="email" isEditing={isEditing} onChange={handleInputChange} type="email" />
                  <ProfileField label="Phone Number" value={editForm.phone || ''} field="phone" isEditing={isEditing} onChange={handleInputChange} type="tel" />
                  <ProfileField label="Date of Birth" value={editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString().split('T')[0] : ''} field="dateOfBirth" isEditing={isEditing} onChange={handleInputChange} type="date" />
                  <ProfileField label="Address" value={editForm.address || ''} field="address" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                </div>
              </section>
            )}

            {/* 2. EMERGENCY CONTACTS */}
            {activeSection === 'emergency' && (
              <section aria-labelledby="emergency-heading">
                <h2 id="emergency-heading" style={{ fontSize: '22px', borderBottom: '1px solid #fecaca', paddingBottom: '10px', marginBottom: '20px', color: '#b91c1c' }}>
                  🚨 Emergency Contacts
                </h2>
                <div style={{ display: 'grid', gap: '20px' }}>
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
              <section aria-labelledby="medical-heading">
                <h2 id="medical-heading" style={{ fontSize: '22px', borderBottom: '1px solid #a7f3d0', paddingBottom: '10px', marginBottom: '20px', color: '#065f46' }}>
                  ⚕️ Medical Information
                </h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <ProfileField label="Blood Type" value={editForm.bloodType || ''} field="bloodType" isEditing={isEditing} onChange={handleInputChange} />
                  <ProfileField label="Medical Conditions" value={editForm.medicalConditions || ''} field="medicalConditions" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                  <ProfileField label="Allergies" value={editForm.allergies || ''} field="allergies" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                  <ProfileField label="Current Medications" value={editForm.medications || ''} field="medications" isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: Sidebar (Summary & Accessibility) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Summary Card */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                📋 Profile Summary
              </h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#4b5563', lineHeight: '1.6' }}>
                <li>Manage your personal information securely</li>
                <li>Keep emergency contacts up to date</li>
                <li>Maintain current medical information</li>
                <li>Review your information regularly</li>
                <li>Update information when there are changes</li>
              </ul>
            </div>

            {/* Accessibility Features Card */}
            <div style={{ backgroundColor: '#e0f2fe', padding: '20px', borderRadius: '8px', border: '2px solid #0ea5e9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#0369a1', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>♿</span> Accessibility
              </h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#0369a1', lineHeight: '1.5', fontSize: '14px' }}>
                <li>All form fields properly labeled for screen readers</li>
                <li>High contrast between text and backgrounds</li>
                <li>Large, readable font sizes</li>
                <li>Clear focus indicators on interactive elements</li>
                <li>Logical tab order through the form</li>
                <li>Audio feedback for important actions</li>
                <li>Keyboard navigation support throughout</li>
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

// Helper Component for Profile Fields
const ProfileField = ({ label, value, field, isEditing, onChange, type = 'text', rows = 3 }) => (
  <div>
    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>{label}</label>
    {isEditing ? (
      type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          rows={rows}
          style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' }}
        />
      )
    ) : (
      <div style={{ padding: '10px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', minHeight: '44px', color: '#111827' }} tabIndex="0">
        {value || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not provided</span>}
      </div>
    )}
  </div>
);

export default ProfilePage;