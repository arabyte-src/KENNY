import { useEffect, useRef, useState } from 'react';
import { AR } from 'js-aruco';
import { CloseIcon, FlashIcon } from '../components/Icons';
import { locations } from '../data/locations';

export default function Scanner({ onClose, onDetected }) {
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [flashError, setFlashError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
    let stream;
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is not available on this device.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        setCameraError(error.name === 'NotAllowedError' ? 'Camera permission is required to scan an ARUCO marker.' : 'Unable to start the camera. Please try again.');
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      window.clearTimeout(detectionTimerRef.current);
    };
  }, []);
  useEffect(() => {
    if (!isDetecting) {
      setProgress(0);
      return undefined;
    }
    const timer = window.setInterval(() => setProgress((value) => {
      if (value >= 100) {
        window.clearInterval(timer);
        return 100;
      }
      return value + 5;
    }), 70);
    return () => window.clearInterval(timer);
  }, [isDetecting]);
  const detectMarker = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    detectorRef.current ||= new AR.Detector();
    const detectedMarkers = detectorRef.current.detect(context.getImageData(0, 0, canvas.width, canvas.height));
    const detectedMarker = detectedMarkers.find((marker) => locations.some((location) => location.id === `AR-${String(marker.id).padStart(2, '0')}`));
    return detectedMarker ? locations.find((location) => location.id === `AR-${String(detectedMarker.id).padStart(2, '0')}`) : null;
  };
  const handleScan = () => {
    if (isDetecting) return;
    setIsDetecting(true);
    setScanError('');
    setProgress(0);
    detectionTimerRef.current = window.setTimeout(() => {
      const marker = detectMarker();
      setIsDetecting(false);
      if (marker) {
        onDetected(marker);
        return;
      }
      setScanError('ARUCO marker not detected. Please position the marker inside the frame and try again.');
    }, 1450);
  };
  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    const torchSupported = track?.getCapabilities?.().torch;
    if (!track || !torchSupported) {
      setFlashError('Flashlight is not available on this device.');
      return;
    }
    try {
      await track.applyConstraints({ advanced: [{ torch: !flash }] });
      setFlash((value) => !value);
      setFlashError('');
    } catch {
      setFlashError('Unable to control the flashlight on this device.');
    }
  };
  return <main className="scanner-screen"><header className="sub-header"><button className="icon-button" onClick={onClose} aria-label="Close scanner"><CloseIcon /></button><h1>Scan ArUco Marker</h1><button className={`icon-button ${flash ? 'selected' : ''}`} onClick={toggleFlash} aria-label="Toggle flashlight"><FlashIcon /></button></header><div className="scanner-body"><div className={`scanner-viewport ${flash ? 'flash' : ''}`}><video ref={videoRef} className="camera-feed" autoPlay playsInline muted /><canvas ref={canvasRef} hidden /><div className="scanner-frame"><i /><i /><i /><i /><span className="scan-line" /></div><p className="scan-success" aria-live="polite">{cameraError || flashError || (isDetecting ? 'Scanning ARUCO...' : scanError || 'Position the ARUCO marker inside the frame')}</p><small>{cameraError ? 'Allow camera access and reopen the scanner' : isDetecting ? 'Detecting marker' : 'Ready when you are'}</small></div>{isDetecting && <><div className="progress-label"><span>Scanning</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></>}<p className="scanner-help">Scan the nearest registered marker inside the laboratory to determine your X/Y coordinates.</p><button className="primary-button" onClick={handleScan} disabled={isDetecting || Boolean(cameraError)}>{isDetecting ? 'Scanning ARUCO...' : 'Scan ARUCO'}</button></div></main>;
}