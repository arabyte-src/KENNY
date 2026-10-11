import { useEffect, useRef, useState } from 'react';
import { CloseIcon, FlashIcon } from '../components/Icons';
import { createDetector, dictionaries, loadMarkerMap, markerLabel, parseMarkerMap } from '../services/markerService';

export default function Scanner({ onClose, onDetected }) {
  const [map, setMap] = useState(loadMarkerMap);
  const [flash, setFlash] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [flashError, setFlashError] = useState('');
  const [detectedId, setDetectedId] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let stream;
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is not available. Open the installed app or use HTTPS.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (!cancelled) setCameraReady(true);
      } catch (error) {
        stream?.getTracks().forEach((track) => track.stop());
        if (!cancelled) setCameraError(error.name === 'NotAllowedError'
          ? 'Allow camera access in app settings and reopen the scanner.'
          : error.name === 'NotFoundError' ? 'No camera was found on this device.'
            : 'Unable to start the camera. Close other camera apps and reopen the scanner.');
      }
    }
    startCamera();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isDetecting || !cameraReady) return;
    const detector = createDetector(map.dictionary);
    let cancelled = false;
    let timer;
    let previousId = null;
    let matches = 0;
    const started = performance.now();
    const scanFrame = () => {
      if (cancelled) return;
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video?.readyState >= 2 && video.videoWidth && video.videoHeight) {
          const scale = Math.min(1, 960 / video.videoWidth);
          const width = Math.round(video.videoWidth * scale);
          const height = Math.round(video.videoHeight * scale);
          if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(video, 0, 0, width, height);
          const markers = detector.detect(context.getImageData(0, 0, width, height));
          const marker = markers.find((item) => map.markers.some((location) => location.id === markerLabel(item.id))) || markers[0];
          if (marker) {
            matches = previousId === marker.id ? matches + 1 : 1;
            previousId = marker.id;
            if (matches >= 2) {
              const label = markerLabel(marker.id);
              setDetectedId(label);
              const location = map.markers.find((item) => item.id === label);
              if (location) { setIsDetecting(false); onDetected(location); return; }
              setScanError(`Detected ${label}. Import your marker map to identify its X/Y coordinates.`);
            }
          } else { previousId = null; matches = 0; }
        }
        if (performance.now() - started >= 20000) {
          setIsDetecting(false);
          setScanError((value) => value || 'No marker detected. Check the dictionary, lighting, and keep the entire marker visible.');
          return;
        }
        timer = window.setTimeout(scanFrame, 100);
      } catch {
        setIsDetecting(false);
        setScanError('Unable to read the camera frame. Reopen the scanner and try again.');
      }
    };
    scanFrame();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [isDetecting, cameraReady, map, onDetected]);

  const handleScan = () => {
    if (isDetecting) { setIsDetecting(false); return; }
    setScanError(''); setDetectedId(null); setIsDetecting(true);
  };
  const importMap = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsDetecting(false);
    try {
      const next = parseMarkerMap(JSON.parse(await file.text()));
      localStorage.setItem('kenny-marker-map', JSON.stringify({ dictionary: next.dictionary, markers: next.markers }));
      setMap(next); setDetectedId(null); setScanError(`Loaded ${next.markers.length} registered markers. Ready to scan.`);
    } catch (error) { setScanError(`Could not import marker map: ${error.message}`); }
    event.target.value = '';
  };
  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track?.getCapabilities?.().torch) { setFlashError('Flashlight is not available on this device.'); return; }
    try {
      await track.applyConstraints({ advanced: [{ torch: !flash }] });
      setFlash((value) => !value); setFlashError('');
    } catch { setFlashError('Unable to control the flashlight on this device.'); }
  };
  return <main className="scanner-screen">
    <header className="sub-header"><button className="icon-button" onClick={onClose} aria-label="Close scanner"><CloseIcon /></button><h1>Scan ArUco Marker</h1><button className={`icon-button ${flash ? 'selected' : ''}`} onClick={toggleFlash} disabled={!cameraReady} aria-label="Toggle flashlight"><FlashIcon /></button></header>
    <div className="scanner-body">
      <div className="scanner-viewport">
        <video ref={videoRef} className="camera-feed" autoPlay playsInline muted /><canvas ref={canvasRef} hidden />
        <div className="scanner-frame"><i /><i /><i /><i />{isDetecting && <span className="scan-line" />}</div>
        <p className="scan-success" aria-live="polite">{cameraError || scanError || (!cameraReady ? 'Starting camera...' : isDetecting ? 'Scanning ArUco...' : 'Position the marker inside the frame')}</p>
        <small>{detectedId ? `Marker ID: ${detectedId}` : isDetecting ? 'Keep the full marker and its white margin visible' : cameraReady ? 'Camera ready' : 'Waiting for camera'}</small>
      </div>
      {flashError && <p role="status">{flashError}</p>}
      <label className="scanner-dictionary">Marker dictionary<select value={map.dictionary} disabled={isDetecting} onChange={(event) => { setMap({ ...map, dictionary: event.target.value }); setScanError(''); setDetectedId(null); }}>{dictionaries.map((name) => <option key={name}>{name}</option>)}</select></label>
      <p className="scanner-help">{map.markers.length ? `${map.markers.length} registered markers. Scan the nearest marker to find your lab coordinates.` : 'Scan to read a marker ID. Import your map’s environment.json to enable location confirmation.'}</p>
      <button className="primary-button" onClick={handleScan} disabled={!cameraReady || Boolean(cameraError)}>{isDetecting ? 'Stop scanning' : 'Scan ArUco'}</button>
      <button className="scanner-import" onClick={() => importRef.current.click()} disabled={isDetecting}>Import marker map</button>
      <input ref={importRef} type="file" accept="application/json,.json" onChange={importMap} hidden />
    </div>
  </main>;
}
