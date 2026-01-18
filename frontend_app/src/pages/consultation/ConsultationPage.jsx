import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceVisualizer from '../../components/common/VoiceVisualizer';
import VoiceService from '../../services/voiceService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ConsultationPage = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("I'm listening...");
    const [lastAIResponse, setLastAIResponse] = useState("Hello! I am Dr. CuraVox. How can I help you today?");

    const voiceService = VoiceService.getInstance();

    useEffect(() => {
        voiceService.setMode('CONVERSATIONAL');
        if (!voiceService.isListening) {
            voiceService.startListening();
        }

        const handleVoiceState = (e) => setIsListening(e.detail.isListening);
        const handleVoiceOutput = (e) => {
            setLastAIResponse(e.detail.text);
            setIsSpeaking(true);
            setTimeout(() => setIsSpeaking(false), Math.min(e.detail.text.length * 50, 5000));
        };
        const handleProcessing = (e) => {
            setIsProcessing(e.detail.isProcessing);
            if (e.detail.isProcessing) setTranscript("Thinking...");
        };
        const handleHistoryUpdate = (e) => {
            const history = e.detail.history;
            if (history.length > 0) setTranscript(history[history.length - 1]);
        };

        window.addEventListener('voiceStateChange', handleVoiceState);
        window.addEventListener('voiceOutput', handleVoiceOutput);
        window.addEventListener('voiceProcessing', handleProcessing);
        window.addEventListener('commandHistoryUpdate', handleHistoryUpdate);

        return () => {
            voiceService.setMode('COMMAND_ONLY');
            window.removeEventListener('voiceStateChange', handleVoiceState);
            window.removeEventListener('voiceOutput', handleVoiceOutput);
            window.removeEventListener('voiceProcessing', handleProcessing);
            window.removeEventListener('commandHistoryUpdate', handleHistoryUpdate);
            voiceService.enterStandbyMode();
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col items-center p-8 md:p-12 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full"></div>

            {/* Header / Back Button */}
            <button
                onClick={() => navigate('/home')}
                className="absolute top-10 left-10 p-5 rounded-3xl bg-white shadow-prism hover:scale-110 active:scale-95 transition-all z-50 group border border-slate-100"
                aria-label="Back to Dashboard"
            >
                <ArrowLeftIcon className="h-6 w-6 text-slate-900 group-hover:text-indigo-600 transition-colors" />
            </button>

            {/* Main Consultation Hub */}
            <main className="w-full max-w-5xl mt-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Visualizer & Persona */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="bg-white/80 backdrop-blur-3xl rounded-[4rem] p-16 shadow-prism border border-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform">
                                <span className="text-4xl">👨‍⚕️</span>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Active Hub</span>
                                </div>
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">Dr. CuraVox</h1>
                                <p className="text-slate-500 font-bold text-lg mb-12">Medical Consultation</p>

                                <VoiceVisualizer
                                    isListening={true}
                                    isSpeaking={isSpeaking}
                                    isProcessing={isProcessing}
                                />
                            </div>
                        </div>

                        {/* Quick Tips Tooltip */}
                        <div className="bg-[#1a365d] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><ArrowLeftIcon className="w-12 h-12 rotate-180" /></div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-300 mb-6">Voice Control</h3>
                            <div className="space-y-4">
                                <p className="text-xl font-bold tracking-tight">Say <span className="text-emerald-400">"Stop"</span> to pause</p>
                                <p className="text-xl font-bold tracking-tight opacity-70">Say "Go Home" to exit</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chat History */}
                    <div className="lg:col-span-7 flex flex-col gap-8 h-full">
                        {/* User Transcript Card */}
                        <div className={`
                            bg-white/40 backdrop-blur-xl rounded-[3rem] p-12 border border-white shadow-prism self-end max-w-lg transition-all duration-500
                            ${isProcessing ? 'opacity-40 translate-y-4' : 'opacity-100 translate-y-0'}
                        `}>
                            <div className="flex items-center gap-4 mb-6 justify-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Transcription</span>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-3xl font-black text-slate-900 text-right tracking-tight leading-tight">
                                {transcript}
                            </p>
                        </div>

                        {/* AI Response Card */}
                        <div className="bg-white rounded-[4rem] p-16 shadow-prism border border-slate-50 relative group">
                            <div className="absolute -top-6 -left-6 w-16 h-16 bg-emerald-500 text-white rounded-3xl flex items-center justify-center text-3xl shadow-lg group-hover:rotate-12 transition-transform">
                                ✨
                            </div>
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="text-[11px] font-black text-[#76a04e] uppercase tracking-[0.5em]">AI Diagnosis</span>
                                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                                </div>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter leading-[1.15]">
                                    {lastAIResponse}
                                </p>
                                <div className="pt-8 flex items-center gap-6">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs">🧪</div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Logic Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ConsultationPage;
