import { dockPosition } from '../data/locations';

export const initialNavigation = {
  robotPosition: dockPosition,
  targetPosition: null,
  heading: 0,
  route: [],
  distanceToTarget: 0,
  estimatedArrivalSeconds: 0,
  status: 'idle',
  currentAction: 'stop',
  obstacleDetected: false,
  confidence: null,
  isSimulated: true,
};

// This provider is the replaceable boundary for REST, WebSocket, ROS, or RL data later.
export function createSimulatedNavigation(target) {
  const start = dockPosition.map;
  const end = target.map;
  const route = [
    start,
    { x: start.x + 24, y: start.y },
    { x: end.x - 22, y: start.y },
    { x: end.x, y: end.y },
  ];
  let frame = 0;
  const totalFrames = 12;
  const distance = Math.hypot(target.x - dockPosition.x, target.y - dockPosition.y);

  return {
    next() {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const point = progress < 0.66
        ? { x: start.x + (end.x - start.x) * progress * 1.5, y: start.y }
        : { x: end.x, y: start.y + (end.y - start.y) * ((progress - 0.66) / 0.34) };
      const physicalPosition = {
        x: dockPosition.x + (target.x - dockPosition.x) * progress,
        y: dockPosition.y + (target.y - dockPosition.y) * progress,
      };
      const status = progress >= 1 ? 'arrived' : progress < 0.12 ? 'planning' : progress < 0.76 ? 'moving' : 'moving';
      return {
        robotPosition: { ...physicalPosition, map: point },
        targetPosition: target,
        heading: progress < 0.66 ? 90 : 180,
        route,
        distanceToTarget: Math.max(0, Number((distance * (1 - progress)).toFixed(1))),
        estimatedArrivalSeconds: Math.max(0, Math.ceil((totalFrames - frame) * 2)),
        status,
        currentAction: progress >= 1 ? 'stop' : progress < 0.66 ? 'move_forward' : 'turn_right',
        obstacleDetected: false,
        confidence: 0.98,
        isSimulated: true,
      };
    },
  };
}