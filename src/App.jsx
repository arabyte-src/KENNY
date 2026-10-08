import { useEffect, useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import { useRobotNavigation } from './hooks/useRobotNavigation';
import { useGestureRecognition } from './hooks/useGestureRecognition';
import Home from './screens/Home';
import Info from './screens/Info';
import Scanner from './screens/Scanner';
import LocationConfirm from './screens/LocationConfirm';
import Tracking from './screens/Tracking';
import Complete from './screens/Complete';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [tab, setTab] = useState('home');
  const [marker, setMarker] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem('kenny-theme') === 'dark');
  const navigation = useRobotNavigation(marker, screen === 'tracking');
  const gesture = useGestureRecognition(screen === 'tracking' && navigation.status === 'arrived');
  useEffect(() => { if (gesture.status === 'detected') setScreen('complete'); }, [gesture.status]);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('kenny-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { if (screen === 'complete') { const timer = window.setTimeout(() => { setMarker(null); setScreen('home'); setTab('home'); }, 2200); return () => window.clearTimeout(timer); } return undefined; }, [screen]);
  const theme = { dark, toggle: () => setDark((value) => !value) };
  const navigateTab = (value) => { setTab(value); setScreen(value); };
  let content;
  if (screen === 'scanner') content = <Scanner onClose={() => setScreen('home')} onDetected={(value) => { setMarker(value); setScreen('confirm'); }} />;
  else if (screen === 'confirm') content = <LocationConfirm marker={marker} onRequest={() => setScreen('tracking')} onCancel={() => { setMarker(null); setScreen('home'); }} />;
  else if (screen === 'tracking') content = <Tracking marker={marker} navigation={navigation} gesture={gesture} />;
  else if (screen === 'complete') content = <Complete />;
  else if (tab === 'info') content = <Info />;
  else content = <Home onScan={() => setScreen('scanner')} onInfo={() => navigateTab('info')} theme={theme} />;
  return <div className="app-shell">{content}{!['scanner', 'confirm', 'tracking', 'complete'].includes(screen) && <BottomNavigation active={tab} onChange={navigateTab} />}</div>;
}