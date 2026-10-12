import { CheckIcon, PinIcon, RobotIcon } from '../components/Icons';
import StatusBadge from '../components/StatusBadge';

export default function LocationConfirm({ marker, onRequest, onCancel, requesting, error }) {
  return <main className="screen confirm-screen">
    <section className="success-banner"><div className="success-icon"><CheckIcon /></div><span>ArUco Marker Scanned</span><h1>Location Found!</h1><p>Marker is registered on the uploaded map</p></section>
    <section className="location-card"><div className="location-title"><PinIcon /><div><span className="eyebrow">YOUR LOCATION</span><h2>{marker.zone}</h2></div></div><div className="coordinates"><strong>{marker.id}</strong><span>X {marker.x}m · Y {marker.y}m</span></div><div className="verified"><span />Registered location</div></section>
    <section className="ready-card"><div className="ready-robot"><RobotIcon size={32} /></div><div className="ready-copy"><StatusBadge>Cloud queue</StatusBadge><h2>Request Kenny at this marker</h2><p>The controller schedules your destination</p></div></section>
    <p className="notice">Your call will be queued for ArUco {marker.marker_id}. Please remain beside the marker.</p>
    {error && <p role="alert" className="notice">{error}</p>}
    <button className="primary-button" disabled={requesting} onClick={onRequest}>{requesting ? 'Sending request…' : 'Request KENNY'}</button>
    <button className="cancel-button" disabled={requesting} onClick={onCancel}>Cancel</button>
  </main>;
}
