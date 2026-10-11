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
## ArUco scanner and Android APK

The scanner reads live camera frames until a marker is found or 20 seconds elapse.
Choose the dictionary used to print your markers: OpenCV `DICT_4X4_50` (default),
`DICT_4X4_1000` (IDs 0–999), or the original `ARUCO` dictionary.
Two consecutive detections confirm an ID. Detection works offline in the APK.

The initial marker registry is empty. Scanning still displays the detected ID;
location confirmation requires real registered coordinates. Use **Import marker
map** to load the map editor's `environment.json`, or a JSON file shaped like:

```json
{"dictionary":"DICT_4X4_50","units":"meters","markers":[{"id":7,"x":2.5,"y":3.0,"zone":"Lab entrance"}]}
```

Imported coordinates persist on the device. The example coordinates above are
illustrative; use your actual laboratory map. The scanner also accepts
`position_m: [x, y, z]` coordinates in a JSON marker registry.

Run `npm test` for detection tests using independently generated OpenCV images,
including rotation, high IDs, blank frames, dictionary limits and registry validation.
`npm run android:build` builds a debug APK at
`android/app/build/outputs/apk/debug/app-debug.apk` (requires JDK 21 and Android SDK 36).
Vendored js-aruco2 modules preserve the upstream MIT notices and use ES module
exports for Vite compatibility; regenerate with `npm run vendor:aruco`.
Regenerate the OpenCV dictionary and test fixtures with
`python scripts/export_aruco_dictionary.py` (requires opencv-contrib-python).
