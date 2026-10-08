import { useEffect, useRef, useState } from 'react';
import { CloseIcon, FlashIcon } from '../components/Icons';
import { locations } from '../data/locations';

export default function Scanner({ onClose, onDetected }) {
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    let stream;
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        // Keep the animated scanner available when camera permission is denied.
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);
  useEffect(() => { const timer = window.setInterval(() => setProgress((value) => { if (value >= 100) { window.clearInterval(timer); const marker = locations[Math.floor(Math.random() * locations.length)]; window.setTimeout(() => onDetected(marker), 450); return 100; } return value + 5; }), 70); return () => window.clearInterval(timer); }, [onDetected]);
  return <main className="scanner-screen"><header className="sub-header"><button className="icon-button" onClick={onClose} aria-label="Close scanner"><CloseIcon /></button><h1>Scan ArUco Marker</h1><button className={`icon-button ${flash ? 'selected' : ''}`} onClick={() => setFlash(!flash)} aria-label="Toggle flashlight"><FlashIcon /></button></header><div className="scanner-body"><div className={`scanner-viewport ${flash ? 'flash' : ''}`}><video ref={videoRef} className="camera-feed" autoPlay playsInline muted /><div className="scanner-frame"><i /><i /><i /><i /><span className="scan-line" /></div><p className="scan-success">{progress >= 100 ? 'ArUco marker detected!' : 'Point the camera at the marker in your area'}</p><small>Hold steady - scanning automatically</small></div><div className="progress-label"><span>Scanning</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p className="scanner-help">Scan the nearest registered marker inside the laboratory to determine your X/Y coordinates.</p></div></main>;
}