export const DEFAULT_API_URL = 'https://kenny-api.onrender.com';

export function normalizeApiUrl(value) {
  const url = new URL(value || DEFAULT_API_URL);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw Error('Use an HTTP(S) API base URL.');
  return url.href.replace(/\/$/, '');
}

export function createApi(base = DEFAULT_API_URL, fetcher = fetch) {
  const url = normalizeApiUrl(base);
  return async (path, payload, signal) => {
    const abort = signal ? null : new AbortController();
    const timer = abort ? setTimeout(() => abort.abort(), 20000) : null;
    try {
      const response = await fetcher(url + path, {
        signal: signal || abort.signal, headers: { Accept: 'application/json', ...(payload !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        ...(payload !== undefined ? { method: 'POST', body: JSON.stringify(payload) } : {}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(response.status === 404 && ['/api/map', '/api/robot'].includes(path)
        ? 'Live map endpoints are not deployed on the API yet.' : result.detail || `API request failed (${response.status})`);
      return result;
    } finally { if (timer) clearTimeout(timer); }
  };
}

export function validateMap(packet) {
  const environment = packet.environment, grid = environment?.grid;
  if (environment?.version !== 1 || environment.frame_id !== 'map' || environment.units !== 'meters' ||
      !grid || !Number.isInteger(grid.width) || !Number.isInteger(grid.height) || grid.width < 1 || grid.height < 1 ||
      grid.width > 4000 || grid.height > 4000 || grid.width * grid.height > 4e6 ||
      !Number.isFinite(grid.resolution) || grid.resolution <= 0 || !Array.isArray(grid.origin) || grid.origin.length !== 3 ||
      !grid.origin.every(Number.isFinite) || !Array.isArray(grid.data) || grid.data.length !== grid.width * grid.height ||
      !grid.data.every(v => [-1, 0, 100].includes(v)) || !Array.isArray(environment.markers)) throw Error('The API returned an unsupported map.');
  return packet;
}

export function worldToMap(point, grid) {
  const [ox, oy, yaw] = grid.origin, x = point.x - ox, y = point.y - oy;
  return { x: Math.cos(yaw) * x + Math.sin(yaw) * y,
    y: grid.height * grid.resolution - (-Math.sin(yaw) * x + Math.cos(yaw) * y) };
}

export function registeredLocations(environment) {
  if (!environment) return [];
  return environment.markers.map(marker => ({ ...marker, marker_id: marker.id,
    id: `AR-${String(marker.id).padStart(2, '0')}`, dictionary: environment.dictionary,
    zone: `${environment.name || 'Uploaded map'} · ArUco ${marker.id}`, map: worldToMap(marker, environment.grid) }));
}

export function trackingState(robot, receivedAt, now = Date.now(), error = '') {
  const age = robot?.age_seconds == null ? Infinity : robot.age_seconds + Math.max(0, now - receivedAt) / 1000;
  const hasPose = robot?.pose && ['x', 'y', 'yaw'].every(k => Number.isFinite(robot.pose[k])) && robot.pose.frame_id === 'map';
  return { age, hasPose: Boolean(hasPose), stale: Boolean(error) || !hasPose || robot.stale || age > (robot.stale_after_seconds || 5),
    label: error ? 'OFFLINE' : !hasPose ? 'WAITING FOR POSITION' : robot.source === 'simulation' ? 'SIMULATED' : 'ESTIMATED LIVE' };
}
