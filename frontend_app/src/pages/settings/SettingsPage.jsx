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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handle setting changes
  const handleSettingChange = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));

    // Save to localStorage
    const updatedSettings = {
      ...settings,
      [settingName]: value
    };
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));

    // Show save confirmation
    setSaveStatus('Settings saved successfully');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Reset all settings to defaults
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

  // Font size options
  const fontSizeOptions = [
    { value: 'small', label: 'Small (14px)' },
    { value: 'normal', label: 'Normal (16px)' },
    { value: 'large', label: 'Large (18px)' },
    { value: 'xlarge', label: 'Extra Large (20px)' }
  ];

  // Voice type options
  const voiceTypeOptions = [
    { value: 'standard', label: 'Standard Voice' },
    { value: 'robotic', label: 'Robotic Voice' },
    { value: 'enhanced', label: 'Enhanced Clarity' }
  ];

  // Function to announce changes for screen readers
  const announceChange = (message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Apply settings to document
  useEffect(() => {
    // Apply high contrast class to body
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Apply font size multiplier
    const fontSizeMultipliers = {
      small: 0.875,
      normal: 1,
      large: 1.125,
      xlarge: 1.25
    };
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultipliers[settings.fontSize]);
    
    // Apply reduced motion
    if (settings.showAnimations) {
      document.body.classList.remove('reduce-motion');
    } else {
      document.body.classList.add('reduce-motion');
    }
  }, [settings]);

  return (
    <div style={{ 
      backgroundColor: '#f0f9ff', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6'
    }}>
      {/* Screen reader announcement area */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        style={{ 
          position: 'absolute', 
          left: '-10000px', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden' 
        }}
      >
        {saveStatus}
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid #3b82f6'
      }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 
            style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1e40af',
              marginBottom: '10px',
              borderBottom: '3px solid #3b82f6',
              paddingBottom: '10px'
            }}
            tabIndex="0"
          >
            Settings
          </h1>
          <p 
            style={{ 
              fontSize: '16px', 
              color: '#4b5563',
              fontStyle: 'italic'
            }}
            tabIndex="0"
          >
            Customize your accessibility preferences
          </p>
        </header>

        {/* Save Status */}
        {saveStatus && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            color: '#16a34a',
            fontWeight: '500'
          }}>
            {saveStatus}
          </div>
        )}

        {/* Voice Feedback Toggle - Added at the top */}
        <div style={{ marginBottom: '25px' }}>
          <h2 
            style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '24px', marginRight: '10px' }}>🔊</span>
            Voice Feedback Control
          </h2>
          <div style={{
            padding: '20px',
            backgroundColor: '#f0f9ff',
            border: '2px solid #3b82f6',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 
                  style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1e40af',
                    margin: 0 
                  }}
                  tabIndex="0"
                >
                  Voice Feedback
                </h3>
                <p 
                  style={{ 
                    fontSize: '14px', 
                    color: '#4b5563',
                    margin: '5px 0 0 0' 
                  }}
                  tabIndex="0"
                >
                  {isVoiceEnabled 
                    ? 'Voice feedback is currently enabled' 
                    : 'Voice feedback is currently disabled'}
                </p>
              </div>
              
              <button
                onClick={() => {
                  toggleVoiceFeedback();
                  announceChange(isVoiceEnabled ? 'Voice feedback disabled' : 'Voice feedback enabled');
                }}
                style={{
                  width: '60px',
                  height: '30px',
                  backgroundColor: isVoiceEnabled ? '#3b82f6' : '#d1d5db',
                  borderRadius: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
                tabIndex="0"
                role="switch"
                aria-checked={isVoiceEnabled}
                aria-label="Toggle voice feedback"
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: isVoiceEnabled ? '33px' : '3px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s'
                  }}
                />
              </button>
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: '#4b5563',
              marginTop: '10px',
              fontStyle: 'italic'
            }} tabIndex="0">
              Toggle to enable or disable all voice feedback throughout the application
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ 
          marginBottom: '30px', 
          borderBottom: '2px solid #e5e7eb',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {[
            { id: 'appearance', label: 'Appearance', icon: '🎨' },
            { id: 'accessibility', label: 'Accessibility', icon: '♿' },
            { id: 'audio', label: 'Audio', icon: '🔊' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                padding: '12px 20px',
                backgroundColor: activeSection === tab.id ? '#3b82f6' : '#f3f4f6',
                color: activeSection === tab.id ? 'white' : '#374151',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.2s',
                minWidth: '120px',
                textAlign: 'center'
              }}
              tabIndex="0"
              role="tab"
              aria-selected={activeSection === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              <span style={{ marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Settings Content */}
        <div role="tabpanel" id={`panel-${activeSection}`}>
          {activeSection === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                border: '2px solid #d1d5db',
                borderRadius: '8px'
              }}>
                <h2 
                  style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex="0"
                >
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>🎨</span>
                  Appearance Settings
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>High Contrast Mode</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Increase contrast between text and background</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !settings.highContrast;
                        handleSettingChange('highContrast', newValue);
                        announceChange(newValue ? 'High contrast mode enabled' : 'High contrast mode disabled');
                      }}
                      style={{
                        width: '60px',
                        height: '30px',
                        backgroundColor: settings.highContrast ? '#3b82f6' : '#d1d5db',
                        borderRadius: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}
                      tabIndex="0"
                      role="switch"
                      aria-checked={settings.highContrast}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: settings.highContrast ? '33px' : '3px',
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}
                      />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>Large Cursor</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Enlarge the mouse cursor for better visibility</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !settings.largeCursor;
                        handleSettingChange('largeCursor', newValue);
                        announceChange(newValue ? 'Large cursor enabled' : 'Large cursor disabled');
                      }}
                      style={{
                        width: '60px',
                        height: '30px',
                        backgroundColor: settings.largeCursor ? '#3b82f6' : '#d1d5db',
                        borderRadius: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}
                      tabIndex="0"
                      role="switch"
                      aria-checked={settings.largeCursor}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: settings.largeCursor ? '33px' : '3px',
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}
                      />
                    </button>
                  </div>

                  <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500', marginBottom: '10px' }}>Font Size</h3>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => {
                        handleSettingChange('fontSize', e.target.value);
                        announceChange(`Font size set to ${e.target.selectedOptions[0].text}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#1f2937'
                      }}
                      tabIndex="0"
                    >
                      {fontSizeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'accessibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                border: '2px solid #d1d5db',
                borderRadius: '8px'
              }}>
                <h2 
                  style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex="0"
                >
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>♿</span>
                  Accessibility Settings
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>Audio Feedback</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Enable audio descriptions for interface elements</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !settings.audioEnabled;
                        handleSettingChange('audioEnabled', newValue);
                        announceChange(newValue ? 'Audio feedback enabled' : 'Audio feedback disabled');
                      }}
                      style={{
                        width: '60px',
                        height: '30px',
                        backgroundColor: settings.audioEnabled ? '#3b82f6' : '#d1d5db',
                        borderRadius: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}
                      tabIndex="0"
                      role="switch"
                      aria-checked={settings.audioEnabled}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: settings.audioEnabled ? '33px' : '3px',
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}
                      />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>Reduce Animations</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Minimize distracting animations and transitions</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !settings.showAnimations;
                        handleSettingChange('showAnimations', newValue);
                        announceChange(newValue ? 'Animations reduced' : 'Animations enabled');
                      }}
                      style={{
                        width: '60px',
                        height: '30px',
                        backgroundColor: !settings.showAnimations ? '#3b82f6' : '#d1d5db',
                        borderRadius: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}
                      tabIndex="0"
                      role="switch"
                      aria-checked={!settings.showAnimations}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: !settings.showAnimations ? '33px' : '3px',
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}
                      />
                    </button>
                  </div>

                  <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500', marginBottom: '10px' }}>Voice Speed: {settings.voiceSpeed}x</h3>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voiceSpeed}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        handleSettingChange('voiceSpeed', value);
                        announceChange(`Voice speed set to ${value}x`);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        height: '8px',
                        borderRadius: '4px',
                        border: '2px solid #3b82f6',
                        cursor: 'pointer'
                      }}
                      tabIndex="0"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </div>

                  <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500', marginBottom: '10px' }}>Voice Pitch: {settings.voicePitch}</h3>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voicePitch}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        handleSettingChange('voicePitch', value);
                        announceChange(`Voice pitch set to ${value}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        height: '8px',
                        borderRadius: '4px',
                        border: '2px solid #3b82f6',
                        cursor: 'pointer'
                      }}
                      tabIndex="0"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                      <span>Lower</span>
                      <span>Higher</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'audio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                border: '2px solid #d1d5db',
                borderRadius: '8px'
              }}>
                <h2 
                  style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex="0"
                >
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>🔊</span>
                  Audio Settings
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>Robot Voice Output</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Enable robotic voice for medication reminders</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !settings.robotVoiceEnabled;
                        handleSettingChange('robotVoiceEnabled', newValue);
                        announceChange(newValue ? 'Robot voice enabled' : 'Robot voice disabled');
                      }}
                      style={{
                        width: '60px',
                        height: '30px',
                        backgroundColor: settings.robotVoiceEnabled ? '#3b82f6' : '#d1d5db',
                        borderRadius: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}
                      tabIndex="0"
                      role="switch"
                      aria-checked={settings.robotVoiceEnabled}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: settings.robotVoiceEnabled ? '33px' : '3px',
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}
                      />
                    </button>
                  </div>

                  <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500', marginBottom: '10px' }}>Voice Type</h3>
                    <select
                      value={settings.voiceType}
                      onChange={(e) => {
                        handleSettingChange('voiceType', e.target.value);
                        announceChange(`Voice type set to ${e.target.selectedOptions[0].text}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#1f2937'
                      }}
                      tabIndex="0"
                    >
                      {voiceTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '2px solid #f59e0b' }}>
                    <h3 style={{ margin: 0, color: '#92400e', fontWeight: '500', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', marginRight: '10px' }}>📢</span>
                      Test Audio Settings
                    </h3>
                    <button
                      onClick={() => {
                        announceChange('This is a test of the audio settings. The voice should match your selected preferences.');
                      }}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px',
                        width: '100%'
                      }}
                      tabIndex="0"
                    >
                      Test Voice Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                border: '2px solid #d1d5db',
                borderRadius: '8px'
              }}>
                <h2 
                  style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex="0"
                >
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>🔔</span>
                  Notification Settings
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>Medication Reminders</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Receive notifications for upcoming medications</p>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !settings.notificationsEnabled;
                        handleSettingChange('notificationsEnabled', newValue);
                        announceChange(newValue ? 'Medication reminders enabled' : 'Medication reminders disabled');
                      }}
                      style={{
                        width: '60px',
                        height: '30px',
                        backgroundColor: settings.notificationsEnabled ? '#3b82f6' : '#d1d5db',
                        borderRadius: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}
                      tabIndex="0"
                      role="switch"
                      aria-checked={settings.notificationsEnabled}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: settings.notificationsEnabled ? '33px' : '3px',
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}
                      />
                    </button>
                  </div>

                  <div style={{ padding: '15px', backgroundColor: '#dbeafe', borderRadius: '6px', border: '2px solid #3b82f6' }}>
                    <h3 style={{ margin: 0, color: '#1e40af', fontWeight: '500', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', marginRight: '10px' }}>📋</span>
                      Notification Preferences
                    </h3>
                    <ul style={{ color: '#1e40af', paddingLeft: '20px', fontSize: '14px' }}>
                      <li style={{ marginBottom: '8px' }}>Time-based reminders for medications</li>
                      <li style={{ marginBottom: '8px' }}>Expiry date warnings</li>
                      <li style={{ marginBottom: '8px' }}>Missed dose notifications</li>
                      <li>Emergency contact notifications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginTop: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={resetSettings}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: '2px solid #dc2626',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              flex: 1,
              minWidth: '150px'
            }}
            tabIndex="0"
          >
            Reset to Defaults
          </button>
          
          <Link 
            to="/"
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: '2px solid #4b5563',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              textAlign: 'center',
              textDecoration: 'none',
              flex: 1,
              minWidth: '150px'
            }}
            tabIndex="0"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Accessibility Tips */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#e0f2fe', 
          border: '2px solid #0ea5e9',
          borderRadius: '8px' 
        }}>
          <h3 
            style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#0284c7',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '24px', marginRight: '10px' }}>ℹ️</span>
            Accessibility Tips
          </h3>
          <ul style={{ 
            color: '#0284c7',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Press Tab to navigate between interactive elements</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Press Enter or Space to activate buttons and switches</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Use arrow keys to adjust sliders</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Changes are saved automatically</li>
            <li tabIndex="0">Press Alt+S to jump to settings navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;