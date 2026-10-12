import { useEffect, useMemo, useState } from 'react';
import { trackingState, worldToMap } from '../services/apiService';

export default function LiveRobotMap({ live, target }) {
  const [now, setNow] = useState(Date.now()), [zoom, setZoom] = useState(1), [follow, setFollow] = useState(false);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const environment = live.map?.environment, grid = environment?.grid;
  const tracking = trackingState(live.robot, live.receivedAt, now, live.error);
  const image = useMemo(() => {
    if (!grid) return null;
    const canvas = document.createElement('canvas');
    canvas.width = grid.width; canvas.height = grid.height;
    const context = canvas.getContext('2d'), pixels = context.createImageData(grid.width, grid.height);
    for (let y = 0; y < grid.height; y++) for (let x = 0; x < grid.width; x++) {
      const value = grid.data[(grid.height - y - 1) * grid.width + x];
      pixels.data.set(value === 100 ? [54, 70, 64, 255] : value === -1 ? [176, 187, 183, 255] : [242, 247, 244, 255], (y * grid.width + x) * 4);
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL();
  }, [grid]);
  if (!grid) return <div className="live-map-empty" role="status">{live.loading ? 'Loading Kenny’s uploaded map…' : live.error || 'Upload a map from Kenny Map Creator to see Kenny here.'}</div>;
  const width = grid.width * grid.resolution, height = grid.height * grid.resolution;
  const robot = tracking.hasPose ? worldToMap(live.robot.pose, grid) : null;
  const destination = target || live.robot?.goal;
  const targetPoint = destination ? worldToMap(destination, grid) : null;
  const scale = Math.max(width, height) / 35;
  const center = follow && robot ? robot : { x: width / 2, y: height / 2 };
  const route = (live.robot?.route || []).filter(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)).map(p => worldToMap({ x: p[0], y: p[1] }, grid));
  const heading = robot ? -(live.robot.pose.yaw - grid.origin[2]) * 180 / Math.PI : 0;
  return <div className="live-map">
    <div className={`live-location-label ${tracking.stale ? 'stale' : ''}`} role="status">{tracking.stale ? tracking.hasPose ? 'LAST KNOWN POSITION' : 'WAITING FOR POSITION' : tracking.label}</div>
    <svg role="img" aria-label="Kenny live estimated location on the uploaded map" viewBox={`${center.x - width / zoom / 2} ${center.y - height / zoom / 2} ${width / zoom} ${height / zoom}`}>
      <image href={image} width={width} height={height} style={{ imageRendering: 'pixelated' }} />
      {(environment.obstacles || []).map((obstacle, index) => <polygon key={obstacle.uid || index} points={[[obstacle.x, obstacle.y], [obstacle.x + obstacle.width, obstacle.y], [obstacle.x + obstacle.width, obstacle.y + obstacle.depth], [obstacle.x, obstacle.y + obstacle.depth]].map(([x, y]) => worldToMap({ x, y }, grid)).map(p => `${p.x},${p.y}`).join(' ')} fill={obstacle.kind === 'prohibited' ? '#e5982c' : '#53695f'} />)}
      {environment.markers.map(marker => { const p = worldToMap(marker, grid); return <g key={marker.id}><circle cx={p.x} cy={p.y} r={scale * .25} fill="#18744a" /><text x={p.x + scale * .35} y={p.y} fontSize={scale * .6} fill="#165634">{marker.id}</text></g>; })}
      {route.length > 1 && <polyline points={route.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={tracking.stale ? '#87918c' : '#3b82f6'} strokeWidth={scale * .2} strokeDasharray={`${scale * .4} ${scale * .25}`} />}
      {targetPoint && <g transform={`translate(${targetPoint.x},${targetPoint.y})`}><circle r={scale * .75} fill="#f59e0b" stroke="white" strokeWidth={scale * .12} /><text textAnchor="middle" y={scale * .22} fontSize={scale * .6} fontWeight="bold" fill="white">{destination.marker_id ?? destination.id ?? 'GOAL'}</text></g>}
      {robot && <g data-robot-location transform={`translate(${robot.x},${robot.y})`} opacity={tracking.stale ? .5 : 1}>
        <circle r={Math.max(scale * 1.4, live.robot.uncertainty_m || 0)} fill="#3b82f6" fillOpacity=".13" />
        <g transform={`rotate(${heading})`}><path d={`M ${scale * 1.25} 0 L ${scale * .65} ${-scale * .5} L ${scale * .65} ${scale * .5} Z`} fill={tracking.stale ? '#6b7280' : '#2563eb'} /></g>
        <circle r={scale * .8} fill={tracking.stale ? '#6b7280' : '#2563eb'} stroke="white" strokeWidth={scale * .15} />
        <text textAnchor="middle" y={scale * .28} fill="white" fontSize={scale * .8} fontWeight="bold">K</text>
      </g>}
    </svg>
    <div className="live-map-controls"><button onClick={() => setZoom(v => Math.min(8, v * 1.5))} aria-label="Zoom map in">＋</button><button onClick={() => setZoom(v => Math.max(1, v / 1.5))} aria-label="Zoom map out">−</button><button disabled={!robot} onClick={() => { setFollow(true); setZoom(3); }}>Follow Kenny</button><button onClick={() => { setFollow(false); setZoom(1); }}>Fit map</button></div>
    <div className="live-map-caption"><strong>{environment.name || 'Kenny map'}</strong><span>{tracking.hasPose ? `Updated ${Math.floor(tracking.age)}s ago · X ${live.robot.pose.x.toFixed(2)} · Y ${live.robot.pose.y.toFixed(2)} m` : 'No robot estimate received yet'}</span>{live.robot?.source === 'simulation' && <span>Simulation position · not physical robot telemetry</span>}{live.error && <span className="live-map-error">{live.error}</span>}<small>Estimated indoor position from Kenny’s controller · map revision {live.map.revision}</small></div>
  </div>;
}
