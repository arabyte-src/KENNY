export default function LaboratoryMap({ robotPosition, targetPosition, route = [], status, obstacleDetected }) {
  const robot = robotPosition?.map;
  const user = targetPosition?.map;
  const routePoints = route.map((point) => `${point.x},${point.y}`).join(' ');
  return <div className="map-wrap">
    <svg className="lab-map" viewBox="0 0 300 250" role="img" aria-label="Simplified robotics laboratory map">
      <rect x="15" y="15" width="270" height="220" rx="8" className="map-boundary" />
      <path d="M28 105H270M28 175H270M145 28v45M215 28v45M145 175v48" className="map-path" />
      <rect x="38" y="38" width="78" height="38" rx="5" className="map-object" /><text x="48" y="61">WORKBENCH A</text>
      <rect x="184" y="38" width="78" height="38" rx="5" className="map-object" /><text x="194" y="61">WORKBENCH B</text>
      <rect x="116" y="112" width="98" height="42" rx="5" className="map-object accent" /><text x="128" y="137">WORKTABLE</text>
      <rect x="35" y="184" width="55" height="30" rx="5" className="map-object" /><text x="42" y="203">DOCK</text>
      <path d="M26 222h20" className="map-entrance" /><text x="27" y="229">ENTRANCE</text>
      {routePoints && <polyline points={routePoints} className="route-line" />}
      {user && <><circle cx={user.x} cy={user.y} r="13" className="user-pulse" /><circle cx={user.x} cy={user.y} r="6" className="user-marker" /><text x={user.x + 10} y={user.y - 10} className="marker-label">YOU</text></>}
      {robot && <g className={status === 'arrived' ? 'robot-marker arrived' : 'robot-marker'} transform={`translate(${robot.x} ${robot.y})`}><circle r="13" /><path d="M-6 -4h12v8H-6zM-3 0h.1M3 0h.1" /><text x="-18" y="-18" className="marker-label">KENNY</text></g>}
      {obstacleDetected && <text x="150" y="245" className="obstacle-label">Obstacle detected</text>}
    </svg>
    {(robotPosition || targetPosition) && <div className="map-legend">{robotPosition && <span><i className="legend-dot robot" />KENNY</span>}{targetPosition && <span><i className="legend-dot user" />Your marker</span>}</div>}
  </div>;
}