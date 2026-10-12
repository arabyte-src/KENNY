import { useEffect, useRef, useState } from 'react';
import { CloseIcon, FlashIcon } from '../components/Icons';
import { locations } from '../data/locations';
import { createMarkerScanner, DEFAULT_MARKER_DICTIONARY, markerDictionaries } from '../services/markerService';

const SCAN_DURATION = 10000;
const FRAME_INTERVAL = 100;

export default function Scanner({ onClose, onDetected, registeredLocations = locations, registeredDictionary }) {
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [flashError, setFlashError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [detectedIds, setDetectedIds] = useState([]);
  const [dictionary, setDictionary] = useState(registeredDictionary || DEFAULT_MARKER_DICTIONARY);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);
  useEffect(() => { detectorRef.current = null; }, [registeredLocations, dictionary]);
  useEffect(() => { if (registeredDictionary && !scanningRef.current) setDictionary(registeredDictionary); }, [registeredDictionary]);
  useEffect(() => {
    let stream;
    let cancelled = false;
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is unavailable. Open this app over HTTPS or localhost, or use the Android app.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (!cancelled) setCameraReady(true);
        }
      } catch (error) {
        stream?.getTracks().forEach((track) => track.stop());
        if (!cancelled) setCameraError(error.name === 'NotAllowedError' ? 'Camera permission is required to scan an ArUco marker.' : 'Unable to start the camera. Please try again.');
      }
    }
    startCamera();
    return () => {
      cancelled = true;
      scanningRef.current = false;
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      window.clearTimeout(detectionTimerRef.current);
    };
  }, []);
  const detectMarker = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
    // Bound frame size so decoding does not stall the camera UI on phones.
    const scale = Math.min(1, 960 / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Unable to read camera frames.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    detectorRef.current ||= createMarkerScanner(registeredLocations, dictionary);
    return detectorRef.current(context.getImageData(0, 0, canvas.width, canvas.height));
  };
  const handleScan = () => {
    if (scanningRef.current || !cameraReady || cameraError) return;
    scanningRef.current = true;
    setIsDetecting(true);
    setScanError('');
    setFlashError('');
    setDetectedIds([]);
    setProgress(0);
    const startedAt = performance.now();
    const seenIds = new Set();
    const finish = () => {
      scanningRef.current = false;
      setIsDetecting(false);
    };
    const scanFrame = () => {
      if (!scanningRef.current) return;
      let result;
      try {
        result = detectMarker();
      } catch {
        finish();
        setScanError('Unable to process the camera image. Close the scanner and try again.');
        return;
      }
      if (result?.location) {
        finish();
        setProgress(100);
        onDetected(result.location);
        return;
      }
      result?.markerIds.forEach((id) => seenIds.add(id));
      if (result?.markerIds.length) setDetectedIds([...seenIds]);
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(100, Math.round(elapsed / SCAN_DURATION * 100)));
      if (elapsed >= SCAN_DURATION) {
        finish();
        setScanError(seenIds.size ? `Detected ${[...seenIds].join(', ')}, but no lab coordinates are registered for these markers.` : `No marker detected with ${dictionary}. Check the dictionary, keep the whole marker visible, and improve lighting.`);
        return;
      }
      detectionTimerRef.current = window.setTimeout(scanFrame, FRAME_INTERVAL);
    };
    scanFrame();
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
  const changeDictionary = (event) => {
    setDictionary(event.target.value);
    detectorRef.current = null;
    setScanError('');
    setDetectedIds([]);
    setProgress(0);
  };
  const scanMessage = isDetecting && detectedIds.length ? `Detected ${detectedIds.join(', ')}. Looking for a registered lab marker...` : isDetecting ? `Scanning ${dictionary}...` : scanError || (cameraReady ? 'Position the ArUco marker inside the frame' : 'Starting camera...');
  return <main className="scanner-screen">
    <header className="sub-header">
      <button className="icon-button" onClick={onClose} aria-label="Close scanner"><CloseIcon /></button>
      <h1>Scan ArUco Marker</h1>
      <button className={`icon-button ${flash ? 'selected' : ''}`} onClick={toggleFlash} disabled={!cameraReady || Boolean(cameraError)} aria-label="Toggle flashlight"><FlashIcon /></button>
    </header>
    <div className="scanner-body">
      <label className="scanner-dictionary" htmlFor="marker-dictionary">Marker dictionary
        <select id="marker-dictionary" value={dictionary} onChange={changeDictionary} disabled={isDetecting}>
          {markerDictionaries.map((name) => <option key={name} value={name}>{name === 'ARUCO' ? 'ARUCO (legacy)' : name}</option>)}
        </select>
      </label>
      <div className={`scanner-viewport ${flash ? 'flash' : ''}`}>
        <video ref={videoRef} className="camera-feed" autoPlay playsInline muted />
        <canvas ref={canvasRef} hidden />
        <div className="scanner-frame"><i /><i /><i /><i /><span className="scan-line" /></div>
        <p className="scan-success" aria-live="polite">{cameraError || flashError || scanMessage}</p>
        <small>{cameraError ? 'Check camera access and reopen the scanner' : isDetecting ? 'Keep the marker steady and fully visible' : cameraReady ? 'Ready when you are' : 'Waiting for camera'}</small>
      </div>
      {isDetecting && <><div className="progress-label"><span>Scanning</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></>}
      <p className="scanner-help">Choose the dictionary used to generate your marker. Keep its black border and a white margin fully visible. Registered markers identify your laboratory X/Y coordinates.</p>
      <button className="primary-button" onClick={handleScan} disabled={!cameraReady || isDetecting || Boolean(cameraError)}>{isDetecting ? 'Scanning ArUco...' : 'Scan ArUco'}</button>
    </div>
  </main>;
}
