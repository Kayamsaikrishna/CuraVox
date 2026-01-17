import React from 'react';

const VoiceVisualizer = ({ isListening, isSpeaking, isProcessing }) => {
    // Simple CSS-based wave animation
    // Green = Listening
    // Blue/Pulse = Speaking/Thinking
    // Gray = Idle

    const getStatusColor = () => {
        if (isProcessing) return '#8b5cf6'; // Purple for thinking
        if (isSpeaking) return '#3b82f6'; // Blue for speaking
        if (isListening) return '#22c55e'; // Green for listening
        return '#9ca3af'; // Gray for idle
    };

    const getStatusText = () => {
        if (isProcessing) return 'Thinking...';
        if (isSpeaking) return 'Speaking...';
        if (isListening) return 'Listening...';
        return 'Tap to Speak';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            height: '300px',
        }}>
            {/* Wave Container */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '100px',
                marginBottom: '20px'
            }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        style={{
                            width: '12px',
                            height: '40px',
                            backgroundColor: getStatusColor(),
                            borderRadius: '6px',
                            animation: (isListening || isSpeaking || isProcessing)
                                ? `wave 1s ease-in-out infinite ${i * 0.1}s`
                                : 'none',
                            transformOrigin: 'bottom',
                            transition: 'background-color 0.3s ease'
                        }}
                    />
                ))}
            </div>

            {/* Status Text */}
            <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: getStatusColor(),
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'color 0.3s ease'
            }}>
                {getStatusText()}
            </div>

            <style>{`
        @keyframes wave {
          0%, 100% { height: 40px; transform: scaleY(1); }
          50% { height: 80px; transform: scaleY(1.5); }
        }
      `}</style>
        </div>
    );
};

export default VoiceVisualizer;
