import LaboratoryMap from '../components/LaboratoryMap';
import StatusBadge from '../components/StatusBadge';
import { ArrowIcon, MoonIcon, RobotIcon, ScanIcon, SunIcon } from '../components/Icons';

export default function Home({ onScan, onInfo, theme }) {
  return <main className="screen home-screen">
    <header className="app-header"><div className="brand-mark"><RobotIcon /><div><strong>KENNY</strong><span>Autonomous Waste Collection Robot</span></div></div><button className="text-button" onClick={theme.toggle} aria-label="Toggle color theme">{theme.dark ? <SunIcon /> : <MoonIcon />}</button></header>
    <section className="robot-card"><div className="card-top"><div><span className="eyebrow light">ROBOT STATUS</span><h2><b>Ready for pickup</b></h2><p>Docked inside the laboratory</p></div><StatusBadge>Available</StatusBadge></div></section>
    <button className="scan-action" onClick={onScan}><span className="scan-icon"><ScanIcon /></span><span><b>Scan ArUco marker</b><small>Detect your lab coordinates</small></span><ArrowIcon /></button>
    <section className="map-card"><div className="section-heading"><div><span className="eyebrow">LIVE VIEW</span><h2>Robot location</h2></div><StatusBadge>LIVE</StatusBadge></div><LaboratoryMap status="idle" /></section>
    <button className="info-link" onClick={onInfo}>How KENNY works <ArrowIcon /></button>
  </main>;
}