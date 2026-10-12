import LiveRobotMap from '../components/LiveRobotMap';
import { trackingState } from '../services/apiService';
import StatusBadge from '../components/StatusBadge';
import { ArrowIcon, MoonIcon, RobotIcon, ScanIcon, SunIcon } from '../components/Icons';

export default function Home({ onScan, onInfo, theme, live, apiUrl, onApiUrlChange }) {
  const tracking = trackingState(live.robot, live.receivedAt, live.now, live.error);
  return <main className="screen home-screen">
    <header className="app-header"><div className="brand-mark"><RobotIcon /><div><strong>KENNY</strong><span>Autonomous Waste Collection Robot</span></div></div><button className="text-button" onClick={theme.toggle} aria-label="Toggle color theme">{theme.dark ? <SunIcon /> : <MoonIcon />}</button></header>
    <section className="robot-card"><div className="card-top"><div><span className="eyebrow light">ROBOT STATUS</span><h2><b>{tracking.stale ? 'Waiting for Kenny' : live.robot.status === 'navigating' ? 'Kenny is on the way' : 'Kenny is connected'}</b></h2><p>{tracking.stale ? 'Live position updates are unavailable' : live.robot.detail || 'Estimated indoor location is updating'}</p></div><StatusBadge>{tracking.stale ? 'OFFLINE' : tracking.label}</StatusBadge></div></section>
    <button className="scan-action" onClick={onScan}><span className="scan-icon"><ScanIcon /></span><span><b>Scan ArUco marker</b><small>Detect your lab coordinates</small></span><ArrowIcon /></button>
    <a className="scan-action" href="http://localhost:8765/"><span className="scan-icon"><RobotIcon /></span><span><b>ESP32 USB control</b><small>Manual hardware test · USB bridge on this computer</small></span><ArrowIcon /></a>
    <section className="map-card"><div className="section-heading"><div><span className="eyebrow">LIVE VIEW</span><h2>Robot location</h2></div><StatusBadge>{tracking.stale ? 'OFFLINE' : tracking.label}</StatusBadge></div><LiveRobotMap live={live} /></section>
    <details className="api-settings"><summary>API connection</summary><form onSubmit={event => { event.preventDefault(); onApiUrlChange(new FormData(event.currentTarget).get('apiUrl')); }}><label>API base URL<input key={apiUrl} name="apiUrl" type="url" defaultValue={apiUrl} required /></label><button type="submit">Connect</button></form></details>
    <button className="info-link" onClick={onInfo}>How KENNY works <ArrowIcon /></button>
  </main>;
}
