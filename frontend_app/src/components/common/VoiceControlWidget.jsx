import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import VoiceService from '../../services/voiceService';

const VoiceControlWidget = () => {
  const [isListening, setIsListening] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    // Listen for voice state changes
    const handleVoiceStateChange = (event) => {
      setIsListening(event.detail.isListening);
    };

    // Listen for command history updates
    const handleCommandHistory = (event) => {
      setCommandHistory(event.detail.history);
    };

    window.addEventListener('voiceStateChange', handleVoiceStateChange);
    window.addEventListener('commandHistoryUpdate', handleCommandHistory);

    return () => {
      window.removeEventListener('voiceStateChange', handleVoiceStateChange);
      window.removeEventListener('commandHistoryUpdate', handleCommandHistory);
    };
  }, []);

  const toggleListening = () => {
    voiceService.toggleListening();
  };

  const showHelp = () => {
    voiceService.provideHelp();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main Voice Control Button */}
      <div className="bg-white rounded-full shadow-lg border-2 border-blue-500 p-2">
        <Button
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-white" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            {isListening ? (
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7 7 0 0015.73 17c.21.21.42.41.63.61.21.2.42.4.63.6.2-.2.41-.4.63-.6.21-.2.42-.4.63-.6A7 7 0 0011 14.93V12a1 1 0 10-2 0v2.93A7 7 0 004.27 17c.21.21.42.41.63.61.21.2.42.4.63.6.2-.2.41-.4.63-.6.21-.2.42-.4.63-.6A7 7 0 009 14.93V12a1 1 0 10-2 0v2.93z" clipRule="evenodd" />
            )}
          </svg>
        </Button>
      </div>

      {/* Floating Help Button */}
      <div className="absolute -top-2 -left-2">
        <Button
          onClick={showHelp}
          className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-md"
          aria-label="Voice command help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isListening 
            ? 'bg-red-100 text-red-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {isListening ? 'LISTENING' : 'READY'}
        </span>
      </div>

      {/* Command History Panel (collapsible) */}
      {commandHistory.length > 0 && (
        <div className="absolute bottom-24 right-0 w-64 bg-white rounded-lg shadow-xl border p-3 max-h-40 overflow-y-auto">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Commands</h4>
          <ul className="space-y-1">
            {commandHistory.slice(-5).map((cmd, index) => (
              <li key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {cmd}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoiceControlWidget;