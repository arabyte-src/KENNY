import { useEffect, useMemo, useRef, useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import { useRobotNavigation } from './hooks/useRobotNavigation';
import { useGestureRecognition } from './hooks/useGestureRecognition';
import Home from './screens/Home';
import Info from './screens/Info';
import Scanner from './screens/Scanner';
import LocationConfirm from './screens/LocationConfirm';
import Tracking from './screens/Tracking';
import Complete from './screens/Complete';
import { useLiveRobot } from './hooks/useLiveRobot';
import { createApi, DEFAULT_API_URL, normalizeApiUrl, registeredLocations } from './services/apiService';

export default function App() {
  const [isLaunching, setIsLaunching] = useState(true);
  const [screen, setScreen] = useState('home');
  const [tab, setTab] = useState('home');
  const [marker, setMarker] = useState(null);
  const [apiUrl, setApiUrl] = useState(() => { try { return normalizeApiUrl(localStorage.getItem('kenny-api-url') || DEFAULT_API_URL); } catch { return DEFAULT_API_URL; } });
  const [job, setJob] = useState(null), [requesting, setRequesting] = useState(false), [requestError, setRequestError] = useState('');
  const requestId = useRef(null);
  const live = useLiveRobot(apiUrl);
  const locations = useMemo(() => registeredLocations(live.map?.environment), [live.map]);
  const [dark, setDark] = useState(() => localStorage.getItem('kenny-theme') === 'dark');
  const navigation = useRobotNavigation(marker, screen === 'tracking', live, job, apiUrl);
  const gesture = useGestureRecognition(false);
  useEffect(() => { if (gesture.status === 'detected') setScreen('complete'); }, [gesture.status]);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('kenny-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { if (screen === 'complete') { const timer = window.setTimeout(() => { setMarker(null); setScreen('home'); setTab('home'); }, 2200); return () => window.clearTimeout(timer); } return undefined; }, [screen]);
  useEffect(() => { const timer = window.setTimeout(() => setIsLaunching(false), 1800); return () => window.clearTimeout(timer); }, []);
  const theme = { dark, toggle: () => setDark((value) => !value) };
  const navigateTab = (value) => { setTab(value); setScreen(value); };
  async function requestKenny() {
    if (requesting || !marker) return;
    setRequesting(true); setRequestError('');
    requestId.current ||= crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const result = await createApi(apiUrl)('/api/calls', { request_id: requestId.current, marker_id: marker.marker_id,
        dictionary: marker.dictionary, caller: 'kenny-mobile' });
      setJob(result); setScreen('tracking');
    } catch (error) { setRequestError(error.message); }
    finally { setRequesting(false); }
  }
  function changeApiUrl(value) {
    try { const url = normalizeApiUrl(value); localStorage.setItem('kenny-api-url', url); setApiUrl(url); }
    catch (error) { window.alert(error.message); }
  }
  let content;
  if (screen === 'scanner') content = <Scanner registeredLocations={locations} registeredDictionary={live.map?.environment.dictionary} onClose={() => setScreen('home')} onDetected={(value) => { requestId.current = null; setJob(null); setRequestError(''); setMarker(value); setScreen('confirm'); }} />;
  else if (screen === 'confirm') content = <LocationConfirm marker={marker} onRequest={requestKenny} requesting={requesting} error={requestError} onCancel={() => { setMarker(null); setScreen('home'); }} />;
  else if (screen === 'tracking') content = <Tracking marker={marker} navigation={navigation} gesture={gesture} live={live} onClose={() => setScreen('home')} />;
  else if (screen === 'complete') content = <Complete />;
  else if (tab === 'info') content = <Info />;
  else content = <Home onScan={() => setScreen('scanner')} onInfo={() => navigateTab('info')} theme={theme} live={live} apiUrl={apiUrl} onApiUrlChange={changeApiUrl} />;
  if (isLaunching) return <main className="launch-screen"><img src="/aaa.svg" alt="KENNY" className="launch-logo" /></main>;
  return <div className="app-shell">{content}{!['scanner', 'confirm', 'tracking', 'complete'].includes(screen) && <BottomNavigation active={tab} onChange={navigateTab} />}</div>;
}
