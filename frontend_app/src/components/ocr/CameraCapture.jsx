import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';

const CameraCapture = ({ onCapture, isLoading }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    // Get available video devices
    const getVideoDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting video devices:', err);
      }
    };

    getVideoDevices();
  }, []);

  useEffect(() => {
    const initCamera = async () => {
      if (!selectedDevice) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(`Camera error: ${err.message || 'Permission denied'}`);
        setHasPermission(false);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [selectedDevice]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (onCapture) {
          onCapture(blob);
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  return (
    <div className="camera-capture">
      <div className="relative w-full max-w-md mx-auto bg-gray-900 rounded-lg overflow-hidden">
        {!hasPermission && !error && (
          <div className="flex items-center justify-center h-64 bg-gray-800">
            <LoadingSpinner />
          </div>
        )}
        
        {error && (
          <div className="p-4">
            <Alert type="error" message={error} />
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-auto ${!hasPermission && !error ? 'hidden' : ''}`}
          aria-label="Camera preview"
        />

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {devices.length > 1 && (
        <div className="mt-4">
          <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Camera
          </label>
          <select
            id="camera-select"
            value={selectedDevice || ''}
            onChange={handleDeviceChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Button
          onClick={captureImage}
          disabled={!hasPermission || isLoading}
          className="px-6 py-3 text-lg font-semibold"
          aria-label="Capture image for OCR processing"
        >
          {isLoading ? (
            <span className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Processing...
            </span>
          ) : (
            'Capture & Process'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;