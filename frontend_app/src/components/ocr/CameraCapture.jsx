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

  useEffect(() => {
    const initCamera = async () => {
      if (!selectedDevice) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDevice },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment' // Prefer back camera
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          setError(null);
          // Announce camera ready with a slight delay to ensure TTS is ready
          setTimeout(() => {
            speak("Camera active. I will guide you. Smart capture is on.");
          }, 500);
        }
      } catch (err) {
        setError(`Camera error: ${err.message}`);
        setHasPermission(false);
        speak("Could not access camera. Please check permissions.");
      }
    };
    initCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [selectedDevice]); // Removed speak from dependency to avoid loop

  // 2. Capture Logic
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isCapturing.current) {
      isCapturing.current = true;
      speak("Perfect. Capturing now.");

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (onCapture) onCapture(blob);
        // Reset after a delay if needed
        setTimeout(() => { isCapturing.current = false; }, 4000);
      }, 'image/jpeg', 0.9);
    }
  }, [onCapture]); // Removed speak from dependency

  // 3. Image Analysis Loop
  useEffect(() => {
    if (!hasPermission || !isSmartMode || isLoading) return;

    const analyzeFrame = () => {
      if (!videoRef.current || !canvasRef.current || isCapturing.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Use small size for analysis efficiency
      const width = 100;
      const height = 100;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);

      const frame = ctx.getImageData(0, 0, width, height);
      const data = frame.data;

      // -- Metric 1: Brightness --
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4);

      // -- Metric 2: Stability (Diff from last frame) --
      let diffScore = 0;
      if (lastFrameData.current) {
        const prev = lastFrameData.current;
        for (let i = 0; i < data.length; i += 40) { // Check every 10th pixel for speed
          diffScore += Math.abs(data[i] - prev[i]);
        }
        diffScore = diffScore / (data.length / 40);
      }
      // Store current frame copy for next comparison
      lastFrameData.current = new Uint8ClampedArray(data);

      // -- Guidance Logic --
      if (avgBrightness < BRIGHTNESS_THRESHOLD) {
        const msg = "Too dark. Turn on a light.";
        if (guidance !== msg) {
          setGuidance(msg);
          speak(msg);
        }
        stabilityCounter.current = 0;
      } else if (diffScore > STABILITY_THRESHOLD) {
        const msg = "Hold steady.";
        if (guidance !== msg) {
          setGuidance(msg);
          speak(msg); // Only speak occasionally?
        }
        stabilityCounter.current = 0;
      } else {
        // Bright & Stable
        stabilityCounter.current += 1;
        const msg = "Holding...";
        setGuidance(msg);

        // If stable for 2 cycles (approx 2s), capture
        if (stabilityCounter.current > 2) {
          captureImage();
          stabilityCounter.current = 0;
        }
      }
    };

    analysisIntervalRef.current = setInterval(analyzeFrame, ANALYSIS_INTERVAL);
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, [hasPermission, isSmartMode, isLoading, captureImage, guidance]); // Removed speak to avoid loop


  // Helper for manual device switch
  const handleDeviceChange = (e) => setSelectedDevice(e.target.value);

  return (
    <div className="camera-capture">
      <div className="relative w-full max-w-md mx-auto bg-gray-900 rounded-lg overflow-hidden border-4 border-blue-500">

        {/* Status Overlay */}
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 text-center text-lg font-bold z-10 transition-all">
          {isLoading ? "Processing..." : guidance}
        </div>

        {!hasPermission && !error && (
          <div className="flex items-center justify-center h-64 bg-gray-800">
            <LoadingSpinner />
          </div>
        )}

        {error && <div className="p-4"><Alert type="error" message={error} /></div>}

        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`w-full h-auto ${!hasPermission ? 'hidden' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-4">
        {/* Smart Mode Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-blue-50 p-2 rounded-lg border border-blue-200">
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