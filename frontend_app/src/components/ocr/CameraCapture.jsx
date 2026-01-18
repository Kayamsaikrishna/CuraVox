import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import useAccessibility from '../../hooks/useAccessibility';

// Constants for image analysis
const ANALYSIS_INTERVAL = 1000; // Check every 1s to avoid spam
const BRIGHTNESS_THRESHOLD = 80;  // 0-255
const STABILITY_THRESHOLD = 10;   // Pixel difference
const BLUR_THRESHOLD = 200;       // Edge score

const CameraCapture = ({ onCapture, isLoading }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { speak } = useAccessibility();

  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [guidance, setGuidance] = useState("Align medicine in frame...");
  const [isSmartMode, setIsSmartMode] = useState(true);
  const [orientation, setOrientation] = useState('horizontal');

  const lastFrameData = useRef(null);
  const stabilityCounter = useRef(0);
  const isCapturing = useRef(false);
  const analysisIntervalRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) setSelectedDevice(videoDevices[0].deviceId);
      } catch (err) {
        console.error('Error getting devices:', err);
      }
    };
    getVideoDevices();
  }, []);

  useEffect(() => {
    const initCamera = async () => {
      if (!selectedDevice) return;
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDevice },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment'
          }
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
        setError(null);
        setTimeout(() => {
          speak("Camera active. Ready to scan.");
        }, 500);
      } catch (err) {
        setError(`Camera error: ${err.message}`);
        setHasPermission(false);
        speak("Could not access camera. Please check permissions.");
      }
    };
    initCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [selectedDevice]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isCapturing.current) {
      isCapturing.current = true;
      speak("Scanning medicine...");

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;

      let cropWidth, cropHeight;
      if (orientation === 'horizontal') {
        cropWidth = vWidth * 0.92;
        cropHeight = vHeight * 0.7;
      } else {
        cropWidth = vWidth * 0.7;
        cropHeight = vHeight * 0.92;
      }

      const startX = (vWidth - cropWidth) / 2;
      const startY = (vHeight - cropHeight) / 2;

      setTimeout(() => {
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        context.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        canvas.toBlob((blob) => {
          if (onCapture) onCapture(blob);
          setTimeout(() => { isCapturing.current = false; }, 3000);
        }, 'image/jpeg', 0.98);
      }, 250);
    }
  }, [onCapture, orientation]);

  useEffect(() => {
    if (!hasPermission || !isSmartMode || isLoading) return;

    const analyzeFrame = () => {
      if (!videoRef.current || !canvasRef.current || isCapturing.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const width = 120;
      const height = orientation === 'horizontal' ? 80 : 120;
      canvas.width = width;
      canvas.height = height;

      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;

      let cropW, cropH;
      if (orientation === 'horizontal') {
        cropW = vWidth * 0.92;
        cropH = vHeight * 0.7;
      } else {
        cropW = vWidth * 0.7;
        cropH = vHeight * 0.92;
      }

      const startX = (vWidth - cropW) / 2;
      const startY = (vHeight - cropH) / 2;

      ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, width, height);

      const frame = ctx.getImageData(0, 0, width, height);
      const data = frame.data;

      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4);

      let diffScore = 0;
      if (lastFrameData.current) {
        const prev = lastFrameData.current;
        for (let i = 0; i < data.length; i += 40) {
          diffScore += Math.abs(data[i] - prev[i]);
        }
        diffScore = diffScore / (data.length / 40);
      }
      lastFrameData.current = new Uint8ClampedArray(data);

      let edgeScore = 0;
      for (let i = 0; i < data.length - 4; i += 4) {
        const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const next = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
        edgeScore += Math.abs(current - next);
      }
      edgeScore = edgeScore / (data.length / 4);

      const TEXT_DETAIL_THRESHOLD = 8;
      const STABILITY_THRESHOLD_VAL = 25;

      if (avgBrightness < BRIGHTNESS_THRESHOLD) {
        const msg = "Not enough light. Please move to a brighter area.";
        if (guidance !== msg) {
          setGuidance(msg);
          if (stabilityCounter.current % 5 === 0) speak(msg);
        }
        stabilityCounter.current = 0;
      } else if (diffScore > STABILITY_THRESHOLD_VAL) {
        setGuidance("Keep your phone steady...");
        stabilityCounter.current = 0;
      } else if (edgeScore < TEXT_DETAIL_THRESHOLD) {
        const msg = "Please align the medicine label in the box.";
        if (guidance !== msg) setGuidance(msg);
        stabilityCounter.current = 0;
      } else {
        const msg = "Medicine identified. Processing...";
        if (guidance !== msg) setGuidance(msg);
        stabilityCounter.current += 1;

        const instantTrigger = edgeScore > 30 && stabilityCounter.current > 0;
        const standardTrigger = stabilityCounter.current > 3;

        if (instantTrigger || standardTrigger) {
          if (navigator.vibrate) navigator.vibrate(200);
          captureImage();
          stabilityCounter.current = 0;
        }
      }
    };

    analysisIntervalRef.current = setInterval(analyzeFrame, 300);
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, [hasPermission, isSmartMode, isLoading, captureImage, orientation, guidance, speak]);


  const handleDeviceChange = (e) => setSelectedDevice(e.target.value);

  return (
    <div className="w-full flex flex-col items-center gap-10">
      {/* PROFESSIONAL LENS CONTAINER */}
      <div className="relative w-full max-w-[900px] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] aspect-video border-[6px] border-slate-800">

        {/* GUIDANCE OVERLAY (Premium Backdrop) */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="px-8 py-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-[#76a04e]'}`}></div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] whitespace-nowrap">
              {isLoading ? "Analyzing..." : guidance}
            </span>
          </div>
        </div>

        {/* CLINICAL SCAN BRACKETS */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div
            className={`transition-all duration-700 border border-white/20 rounded-3xl relative`}
            style={{
              width: orientation === 'horizontal' ? '88%' : '66%',
              height: orientation === 'horizontal' ? '66%' : '88%'
            }}
          >
            {/* Corner Brackets (Thin, Clinical) */}
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-[3px] border-l-[3px] border-[#76a04e] rounded-tl-2xl"></div>
            <div className="absolute -top-4 -right-4 w-12 h-12 border-t-[3px] border-r-[3px] border-[#76a04e] rounded-tr-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-[3px] border-l-[3px] border-[#76a04e] rounded-bl-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-[3px] border-r-[3px] border-[#76a04e] rounded-br-2xl"></div>

            {/* Focal Point */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-8 h-[2px] bg-white"></div>
              <div className="h-8 w-[2px] bg-white absolute"></div>
            </div>
          </div>
        </div>

        {!hasPermission && !error && (
          <div className="flex items-center justify-center h-full bg-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
            Starting camera...
          </div>
        )}

        {error && <div className="absolute inset-0 flex items-center justify-center bg-rose-950/90 backdrop-blur-xl p-10 text-center"><p className="text-rose-100 font-bold">{error}</p></div>}

        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`w-full h-full object-cover transition-opacity duration-1000 ${!hasPermission ? 'opacity-0' : 'opacity-100'}`}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* CLINCAL CONTROLS */}
      <div className="flex flex-col gap-6 w-full max-w-[900px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Device Switcher & Rotate Axis - Span 8 */}
          <div className="md:col-span-8 flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="flex-1 flex items-center gap-4 px-6 min-w-0">
              <div className="text-slate-400 capitalize text-[9px] font-black tracking-[0.2em] flex-shrink-0">Camera:</div>
              <select
                className="flex-1 bg-transparent text-slate-900 font-extrabold text-[11px] outline-none cursor-pointer truncate pr-4"
                value={selectedDevice || ''}
                onChange={handleDeviceChange}
                disabled={devices.length <= 1}
              >
                {devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Sensor ${d.deviceId.slice(0, 4)}`}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
              className="flex-shrink-0 px-8 py-4 bg-white rounded-xl shadow-sm border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a365d] hover:bg-[#1a365d] hover:text-white transition-all flex items-center gap-3 active:scale-95 group"
              title="Rotate View"
            >
              <svg className="transition-transform group-hover:rotate-180 duration-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.21-8.56" /><polyline points="22 10 18 10 18 6" /></svg>
              <span className="hidden sm:inline">Rotate</span>
            </button>
          </div>

          {/* Smart Mode Toggle - Span 4 */}
          <div className="md:col-span-4 h-[64px]">
            <label className="flex h-full items-center justify-between px-8 bg-slate-900 hover:bg-slate-800 rounded-2xl cursor-pointer transition-all border border-white/5 group">
              <div className="flex flex-col">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-1 leading-none">Smart Assist</span>
                <span className="text-[#76a04e] text-[8px] font-bold uppercase tracking-[0.2em] leading-none opacity-80 whitespace-nowrap">Auto-Scan Mode</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSmartMode}
                  onChange={(e) => {
                    setIsSmartMode(e.target.checked);
                    speak(e.target.checked ? "Smart scanning on" : "Manual capture on");
                  }}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-all duration-300 ${isSmartMode ? 'bg-[#76a04e]' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${isSmartMode ? 'left-7' : 'left-1'}`}></div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Manual Trigger (Full Width) */}
        <button
          onClick={captureImage}
          disabled={!hasPermission || isLoading}
          className="w-full py-7 rounded-[2rem] bg-[#1a365d] text-white font-black text-xs uppercase tracking-[0.52em] shadow-2xl shadow-[#1a365d]/30 hover:shadow-[#1a365d]/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-6 disabled:opacity-50 disabled:scale-100 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {isLoading ? (
            <span className="flex items-center gap-4">
              <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
              Analyzing medicine...
            </span>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full border-[3px] border-white/40 flex items-center justify-center group-hover:border-[#76a04e] transition-colors">
                <div className="w-2 h-2 bg-white rounded-full group-hover:bg-[#76a04e]"></div>
              </div>
              Scan Medicine
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;