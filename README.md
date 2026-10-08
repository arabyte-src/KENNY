# KENNY

Frontend prototype for an indoor trash-collection robot. Run it with `npm install` and `npm run dev`.

## Navigation integration boundary

The UI consumes the normalized state returned by `useRobotNavigation`:

```js
{
  robotPosition: { x, y, map },
  targetPosition: { x, y, map },
  heading,
  route,
  distanceToTarget,
  estimatedArrivalSeconds,
  status,
  currentAction,
  obstacleDetected,
  confidence,
  isSimulated
}
```

`src/services/navigationService.js` is the current simulated provider. Replace `createSimulatedNavigation` with an adapter for REST, WebSocket, ROS, or a reinforcement-learning controller while keeping `LaboratoryMap` and the tracking screen unchanged. The SVG map only renders positions and route data; it does not calculate navigation policy.