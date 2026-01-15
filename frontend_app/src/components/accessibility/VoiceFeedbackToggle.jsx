import React from 'react';
import { useVoiceFeedback } from '../../contexts/VoiceFeedbackContext';

const VoiceFeedbackToggle = () => {
  const { isVoiceEnabled, toggleVoiceFeedback } = useVoiceFeedback();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px',
      backgroundColor: '#f0f9ff',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      marginBottom: '15px'
    }}>
      <div style={{ flex: 1 }}>
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

        {/* Announce changes to screen readers */}
        <span aria-live="polite" className="sr-only">
          {isVoiceEnabled ? 'Voice feedback enabled' : 'Voice feedback disabled'}
        </span>
      </div>
      
      <button
        onClick={toggleVoiceFeedback}
        style={{
          width: '60px',
          height: '30px',
          backgroundColor: isVoiceEnabled ? '#3b82f6' : '#d1d5db',
          borderRadius: '15px',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s',
          marginLeft: '15px'
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
  );
};

export default VoiceFeedbackToggle;