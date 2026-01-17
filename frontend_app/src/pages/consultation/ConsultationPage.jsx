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
        // 1. ENTER CONVERSATIONAL MODE
        voiceService.setMode('CONVERSATIONAL');
        // Ensure mic is active
        if (!voiceService.isListening) {
            voiceService.startListening();
        }

        // 2. Initial Greeting
        // voiceService.speak("I am listening. How can I help?");

        // 3. LISTEN TO EVENTS for Visuals ("0ms Delay")
        const handleVoiceState = (e) => {
            setIsListening(e.detail.isListening);
        };

        const handleVoiceOutput = (e) => {
            setLastAIResponse(e.detail.text);
            setIsSpeaking(true);
            // Reset speaking state estimation (VoiceService handles actual end, this is for UI pulse)
            setTimeout(() => setIsSpeaking(false), Math.min(e.detail.text.length * 50, 5000));
        };

        const handleProcessing = (e) => {
            setIsProcessing(e.detail.isProcessing);
            if (e.detail.isProcessing) {
                setTranscript("Thinking...");
            }
        };

        const handleHistoryUpdate = (e) => {
            const history = e.detail.history;
            if (history.length > 0) {
                setTranscript(history[history.length - 1]);
            }
        };

        window.addEventListener('voiceStateChange', handleVoiceState);
        window.addEventListener('voiceOutput', handleVoiceOutput);
        window.addEventListener('voiceProcessing', handleProcessing); // Custom event added in VoiceService
        window.addEventListener('commandHistoryUpdate', handleHistoryUpdate);

        // CLEANUP
        return () => {
            // 4. EXIT TO COMMAND MODE
            voiceService.setMode('COMMAND_ONLY');
            window.removeEventListener('voiceStateChange', handleVoiceState);
            window.removeEventListener('voiceOutput', handleVoiceOutput);
            window.removeEventListener('voiceProcessing', handleProcessing);
            window.removeEventListener('commandHistoryUpdate', handleHistoryUpdate);
            voiceService.enterStandbyMode(); // Optional: Quiet down on exit
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center relative p-4">
            {/* Header / Back Button */}
            <button
                onClick={() => navigate('/home')}
                className="absolute top-6 left-6 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Back to Dashboard"
            >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Main Visualizer Area */}
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col items-center p-8 transition-all duration-300 ease-in-out">

                {/* Persona Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-500 shadow-inner">
                        <span className="text-4xl">👨‍⚕️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dr. CuraVox</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Medical Consultation</p>
                </div>

                {/* The Wave Visualizer (0ms response) */}
                <div className="w-full flex justify-center py-4">
                    <VoiceVisualizer
                        isListening={true} // Always appear listening in this mode for immersion
                        isSpeaking={isSpeaking}
                        isProcessing={isProcessing}
                    />
                </div>

                {/* Transcript / Chat Bubbles */}
                <div className="w-full space-y-4 mt-6">
                    {/* User Transcript */}
                    <div className={`flex justify-end transition-opacity duration-300 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-xs shadow-sm">
                            <p className="text-sm font-medium">{transcript}</p>
                        </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-4 rounded-2xl rounded-tl-none max-w-md shadow-sm border border-gray-200 dark:border-gray-600">
                            <p className="text-lg leading-relaxed">{lastAIResponse}</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Say "Stop" to pause. Say "Go Home" to exit.
                </p>
            </div>
        </div>
    );
};

export default ConsultationPage;
