import { useEffect, useState } from 'react';
import { createApi, trackingState } from '../services/apiService';

export function useRobotNavigation(target, active, live, submittedJob, apiUrl) {
  const [job, setJob] = useState(submittedJob), [error, setError] = useState('');
  useEffect(() => {
    setJob(submittedJob); setError('');
    if (!active || !submittedJob) return;
    const api = createApi(apiUrl);
    let cancelled = false, timer, abort;
    async function poll() {
      abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 15000);
      try {
        const result = await api(`/api/calls/${submittedJob.id}`, undefined, abort.signal);
        if (!cancelled) { setJob(result); setError(''); }
      } catch (failure) { if (!cancelled) setError(failure.message); }
      finally { clearTimeout(timeout); if (!cancelled) timer = setTimeout(poll, 2000); }
    }
    void poll();
    return () => { cancelled = true; clearTimeout(timer); abort?.abort(); };
  }, [active, submittedJob, apiUrl]);
  const tracking = trackingState(live.robot, live.receivedAt, live.now, live.error);
  const pose = tracking.hasPose ? live.robot.pose : null;
  return {
    job, error, robotPosition: pose, targetPosition: target,
    status: job?.status === 'succeeded' ? 'arrived' : job?.status === 'failed' ? 'failed' : job?.status === 'running' ? 'moving' : 'queued',
    distanceToTarget: pose && target ? Math.hypot(pose.x - target.x, pose.y - target.y) : null,
    estimatedArrivalSeconds: null, heading: pose?.yaw || 0, route: live.robot?.route || [],
    stale: tracking.stale, isSimulated: live.robot?.source === 'simulation',
  };
}
