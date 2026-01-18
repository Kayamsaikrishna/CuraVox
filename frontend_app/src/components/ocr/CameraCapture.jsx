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
  const [isSmartMode, setIsSmartMode] = useState(true); // Auto-capture on by default
  const [orientation, setOrientation] = useState('horizontal'); // 'horizontal' | 'vertical'

  // Analysis State
  const lastFrameData = useRef(null);
  const stabilityCounter = useRef(0);
  const isCapturing = useRef(false);
  const analysisIntervalRef = useRef(null);

  // 1. Initialize Camera
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

  const mediaStreamRef = useRef(null); // Dedicated ref for stream management

  useEffect(() => {
    const initCamera = async () => {
      if (!selectedDevice) return;
      try {
        // Stop any existing stream first
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDevice },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment' // Prefer back camera
          }
        });

        // Store in dedicated ref
        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setHasPermission(true);
        setError(null);
        // Announce camera ready with a slight delay to ensure TTS is ready
        setTimeout(() => {
          speak("Camera active. I will guide you. Smart capture is on.");
        }, 500);
      } catch (err) {
        setError(`Camera error: ${err.message}`);
        setHasPermission(false);
        speak("Could not access camera. Please check permissions.");
      }
    };
    initCamera();

    // Reliable cleanup
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [selectedDevice]); // Removed speak from dependency to avoid loop

  // 2. Capture Logic (SMART CROP)
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isCapturing.current) {
      isCapturing.current = true;
      speak("Perfect! Holding for clarity...");

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // VIDEO DIMENSIONS
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;

      // -- NEW: EXPANDED ROI (Synchronized with analysis) --
      let cropWidth, cropHeight;
      if (orientation === 'horizontal') {
        cropWidth = vWidth * 0.92; // Edge to edge capture
        cropHeight = vHeight * 0.7; // Taller for multi-line labels
      } else {
        cropWidth = vWidth * 0.7;
        cropHeight = vHeight * 0.92; // Taller for vertical bottles
      }

      const startX = (vWidth - cropWidth) / 2;
      const startY = (vHeight - cropHeight) / 2;

      // STABILIZATION DELAY: Wait 250ms for final autofocus/exposure
      setTimeout(() => {
        // Set Canvas to CROP size
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw the high-res crop
        context.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        canvas.toBlob((blob) => {
          if (onCapture) onCapture(blob); // Send cropped blob
          setTimeout(() => { isCapturing.current = false; }, 3000);
        }, 'image/jpeg', 0.98); // Ultra high quality
      }, 250);
    }
  }, [onCapture, orientation]); // Added orientation to dependency // Removed speak from dependency

  // 3. Image Analysis Loop (FOCUSED)
  useEffect(() => {
    if (!hasPermission || !isSmartMode || isLoading) return;

    const analyzeFrame = () => {
      if (!videoRef.current || !canvasRef.current || isCapturing.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Performance Fix

      // Use expanded ROI for analysis
      const width = 120; // Slightly higher analysis resolution
      const height = orientation === 'horizontal' ? 80 : 120;
      canvas.width = width;
      canvas.height = height;

      // Analyze Same Crop as captureImage
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

      // Synchronized draw
      ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, width, height);

      const frame = ctx.getImageData(0, 0, width, height);
      const data = frame.data;

      // -- Metric 1: Brightness --
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4);

      // -- Metric 2: Stability --
      let diffScore = 0;
      if (lastFrameData.current) {
        const prev = lastFrameData.current;
        for (let i = 0; i < data.length; i += 40) {
          diffScore += Math.abs(data[i] - prev[i]);
        }
        diffScore = diffScore / (data.length / 40);
      }
      lastFrameData.current = new Uint8ClampedArray(data);

      // -- Metric 3: Edge Density (Text Detection) --
      let edgeScore = 0;
      for (let i = 0; i < data.length - 4; i += 4) {
        const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const next = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
        edgeScore += Math.abs(current - next);
      }
      edgeScore = edgeScore / (data.length / 4);

      // Tuned Thresholds for "Strip Detection"
      // Tuned Thresholds (Optimized for Speed)
      const TEXT_DETAIL_THRESHOLD = 8; // Very low
      const STABILITY_THRESHOLD = 25;  // Tolerant

      // Guidance (Audio & Visual)
      if (avgBrightness < BRIGHTNESS_THRESHOLD) {
        const msg = "Too dark. Please turn on a light.";
        if (guidance !== msg) {
          setGuidance(msg);
          // throttle speaking
          if (stabilityCounter.current % 5 === 0) speak(msg);
        }
        stabilityCounter.current = 0;
      } else if (diffScore > STABILITY_THRESHOLD) {
        setGuidance("Hold medicine steady...");
        stabilityCounter.current = 0;
      } else if (edgeScore < TEXT_DETAIL_THRESHOLD) {
        const msg = orientation === 'horizontal'
          ? "No text found. Move medicine to center."
          : "No text. Align vertical strip.";
        if (guidance !== msg) setGuidance(msg);
        stabilityCounter.current = 0;
      } else {
        // High density + Stable = Valid Capture
        const msg = "Perfect! Capturing...";
        if (guidance !== msg) setGuidance(msg);
        stabilityCounter.current += 1;

        // INSTANT TRIGGER: Very clear text + minor stability
        const instantTrigger = edgeScore > 30 && stabilityCounter.current > 0;
        // STANDARD TRIGGER: Stable for ~1 second (3-4 checks)
        const standardTrigger = stabilityCounter.current > 3;

        if (instantTrigger || standardTrigger) {
          if (navigator.vibrate) navigator.vibrate(200);
          captureImage();
          stabilityCounter.current = 0;
        }
      }
    };

    // SPEED UP ANALYSIS: Check every 300ms (approx)
    analysisIntervalRef.current = setInterval(analyzeFrame, 300);
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, [hasPermission, isSmartMode, isLoading, captureImage]);


  // Helper for manual device switch
  const handleDeviceChange = (e) => setSelectedDevice(e.target.value);

  return (
    <div className="camera-capture w-full flex flex-col items-center">
      {/* 2. CAMERA CONTAINER (Larger) */}
      <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-blue-500 aspect-video">

        {/* Status Overlay */}
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 text-center text-xl font-bold z-20 backdrop-blur-sm">
          {isLoading ? "Processing..." : guidance}
        </div>

        {/* SCAN ZONE OVERLAY (Visual Guide) */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          {/* Center Focus Box (Matching ROI) */}
          <div
            className={`border-4 ${isSmartMode ? 'border-dashed border-green-400' : 'border-white'} rounded-xl opacity-70 flex items-center justify-center`}
            style={{
              width: orientation === 'horizontal' ? '92%' : '70%',
              height: orientation === 'horizontal' ? '70%' : '92%'
            }}
          >
            {/* Crosshair or Center Line */}
            <div className="w-full h-px bg-white opacity-30 absolute"></div>
            {!hasPermission && <span className="text-white text-lg">Waiting for Camera...</span>}
          </div>

          {/* Corner Brackets */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
          <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
        </div>

        {!hasPermission && !error && (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <LoadingSpinner />
          </div>
        )}

        {error && <div className="p-8"><Alert type="error" message={error} /></div>}

        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`w-full h-full object-cover ${!hasPermission ? 'hidden' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-4xl">
        {/* CONTROLS ROW: Device Select & Orientation */}
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <select
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 outline-none focus:border-blue-500"
              value={selectedDevice || ''}
              onChange={handleDeviceChange}
              disabled={devices.length <= 1}
              aria-label="Select Camera Device"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 flex items-center gap-2 transition-transform active:scale-95`}
          >
            <span>🔄</span> {orientation === 'horizontal' ? 'Vertical Mode' : 'Horizontal Mode'}
          </Button>
        </div>

        {/* Smart Mode Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-blue-50 p-2 rounded-lg border border-blue-200 w-full justify-center">
          <input
            type="checkbox"
            checked={isSmartMode}
            onChange={(e) => {
              setIsSmartMode(e.target.checked);
              speak(e.target.checked ? "Smart scanning enabled" : "Manual mode enabled");
            }}
            className="w-6 h-6 text-blue-600"
          />
          <span className="text-blue-900 font-semibold">Smart Auto-Capture (Assistive)</span>
        </label>

        <Button
          onClick={captureImage}
          disabled={!hasPermission || isLoading}
          className="px-8 py-4 text-xl font-bold bg-yellow-400 hover:bg-yellow-500 text-black w-full"
        >
          {isLoading ? 'Processing Scanned Text...' : 'Capture Now (Manual)'}
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;