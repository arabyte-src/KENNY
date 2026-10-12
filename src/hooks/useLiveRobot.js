import { useEffect, useState } from 'react';
import { createApi, validateMap } from '../services/apiService';

export function useLiveRobot(apiUrl) {
  const [state, setState] = useState({ map: null, robot: null, receivedAt: 0, error: '', loading: true });
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    const api = createApi(apiUrl);
    let cancelled = false, timer, map = null, lastMapFetch = 0, abort;
    setState({ map: null, robot: null, receivedAt: 0, error: '', loading: true });
    async function poll() {
      abort = new AbortController();
      try {
        const timeout = setTimeout(() => abort.abort(), 20000);
        let robot;
        try {
          if (!map || Date.now() - lastMapFetch > 60000) {
            const [newMap, position] = await Promise.all([api('/api/map', undefined, abort.signal), api('/api/robot', undefined, abort.signal)]);
            const valid = validateMap(newMap);
            if (map?.sha256 !== valid.sha256) map = valid;
            robot = position;
            lastMapFetch = Date.now();
          } else {
            robot = await api('/api/robot', undefined, abort.signal);
          }
          if (robot.map_sha256 && robot.map_sha256 !== map.sha256) {
            map = validateMap(await api('/api/map', undefined, abort.signal));
            lastMapFetch = Date.now();
          }
          if (!cancelled) setState({ map, robot, receivedAt: Date.now(), error: '', loading: false });
        } finally { clearTimeout(timeout); }
      } catch (error) {
        if (!cancelled) setState(previous => ({ ...previous, loading: false, error: error.message || 'Robot connection unavailable' }));
      } finally {
        if (!cancelled) timer = setTimeout(poll, 2000);
      }
    }
    void poll();
    return () => { cancelled = true; clearTimeout(timer); abort?.abort(); };
  }, [apiUrl]);
  return { ...state, now };
}
