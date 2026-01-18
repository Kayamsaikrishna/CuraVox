import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-12 text-center relative overflow-hidden">
            {/* Minimalist Error Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-3 block">System Error Detected</span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Application Exception</h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                CuraVox encountered an unexpected synchronization issue. Our diagnostic sensors have logged this event for analysis.
              </p>
            </div>

            {/* Subtle Diagnostic Box */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-100 text-left">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Details:</h3>
              <p className="text-[11px] text-slate-600 font-mono break-all leading-tight opacity-80">
                {this.state.error?.toString() || "Unhandled state exception"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-xl bg-[#1a365d] text-white font-bold text-sm hover:bg-[#1a365d]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#1a365d]/10"
              >
                Restore Session
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="w-full py-4 rounded-xl text-slate-400 font-bold text-xs hover:text-slate-900 transition-colors"
              >
                Clear Cache & Reset
              </button>
            </div>

            {/* Decorative element */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-200 opacity-20"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;