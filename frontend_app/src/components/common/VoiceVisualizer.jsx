import React from 'react';

const VoiceVisualizer = ({ isListening, isSpeaking, isProcessing }) => {
    const getStatusConfig = () => {
        if (isProcessing) return { color: 'bg-indigo-600', shadow: 'shadow-indigo-500/50', label: 'Thinking...' };
        if (isSpeaking) return { color: 'bg-indigo-500', shadow: 'shadow-indigo-400/50', label: 'Speaking...' };
        if (isListening) return { color: 'bg-[#76a04e]', shadow: 'shadow-emerald-500/50', label: 'Listening...' };
        return { color: 'bg-slate-300', shadow: 'shadow-slate-300/30', label: 'Tap to Speak' };
    };

    const config = getStatusConfig();
    const isActive = isListening || isSpeaking || isProcessing;

    return (
        <div className="flex flex-col items-center justify-center p-12 h-[340px] w-full max-w-lg mx-auto bg-white/50 backdrop-blur-3xl rounded-[4rem] border border-white/40 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${isActive ? 'bg-indigo-500' : 'bg-transparent'}`}></div>

            {/* Wave Container */}
            <div className="flex items-center justify-center gap-4 h-24 mb-12 relative z-10">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className={`
                            w-3 rounded-full transition-all duration-500 ease-in-out
                            ${config.color} ${isActive ? config.shadow : ''}
                        `}
                        style={{
                            height: isActive ? '100%' : '24px',
                            animation: isActive ? `prismWave 1.2s ease-in-out infinite ${i * 0.15}s` : 'none',
                            opacity: 1 - (Math.abs(3 - i) * 0.2), // Center emphasis
                        }}
                    />
                ))}
            </div>

            {/* Status Label */}
            <div className="relative z-10 flex flex-col items-center">
                <div className={`px-6 py-2 rounded-full mb-4 border transition-all duration-500 ${isActive ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-[11px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                        Dr. CuraVox
                    </span>
                </div>
                <h3 className={`text-4xl font-black tracking-tighter transition-all duration-500 ${isActive ? 'text-slate-900 scale-105' : 'text-slate-400'}`}>
                    {config.label}
                </h3>
            </div>

            {/* Animation Frames */}
            <style>{`
                @keyframes prismWave {
                    0%, 100% { height: 32px; filter: brightness(1); }
                    50% { height: 96px; filter: brightness(1.2); }
                }

                @keyframes prismPulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default VoiceVisualizer;
