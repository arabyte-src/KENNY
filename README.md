# KENNY

Frontend prototype for an indoor trash-collection robot. Run it with `npm install` and `npm run dev`.

## ESP32 USB hardware test

The home screen's **ESP32 USB control** link opens `http://localhost:8765/`.
Start `python3 scripts/usb_bridge.py --port /dev/ttyUSB0` from
`/home/kenny/joystick` with the USB-enabled firmware uploaded. Full instructions
and the stable serial device path are in `../joystick/docs/USB_CONTROL.md`.
This opens a manual controller with real ESP32 telemetry. The app's navigation
and pickup tracking still use the simulated provider described below.

## ArUco scanning

Open the scanner, allow camera access, and press **Scan ArUco**. It checks live
camera frames for up to 10 seconds and opens location confirmation as soon as a
registered marker is found. Detected, unregistered marker IDs are displayed too.
The camera and scanning loop stop when the scanner closes.

- Choose the **Marker dictionary** matching the generator used for your print.
  The default is OpenCV `DICT_4X4_50`. The decoder (`js-aruco2`) also supports
  OpenCV 4×4, 5×5, 6×6, and 7×7 dictionaries with 50/100/250/1000 IDs,
  `DICT_ARUCO_ORIGINAL`, legacy `ARUCO`, and `ARUCO_MIP_36h12`.
  A 4×4 marker has 4×4 data cells plus a black border (6×6 cells in total).
  Legacy `ARUCO` and OpenCV `DICT_ARUCO_ORIGINAL` use different ID ordering;
  select the dictionary used to generate your markers.
- Keep the whole marker and a white margin visible, with good lighting.
- Browser camera access requires **HTTPS or localhost**. A plain HTTP LAN URL
  opened on a phone will not provide camera access. The Android app declares
  camera permission and prompts for access through its WebView.
- Add the actual marker locations to `src/data/locations.js`. The registry is
  currently empty; scanning can identify IDs, but location confirmation requires
  a registered entry with real lab coordinates. For example, marker ID `1` maps
  to `AR-01`; each entry has `{ id, zone, x, y, map }`, with `x`/`y` in meters and
  `map: { x, y }` giving the position on the displayed lab map. When registering
  multiple marker families, add `dictionary: 'DICT_4X4_50'` (or the matching
  dictionary name) to each entry so identical IDs do not map to another family.

Run `npm test` to verify decoding with generated marker images and registration
lookup, and `npm run build` to build the frontend.

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
## Live uploaded map and cloud tracking

The Home screen and request tracking screen use
`https://kenny-api.onrender.com` by default. Change the base URL under **API
connection**. The app loads the uploaded map from `/api/map` and polls
`/api/robot` every two seconds. It shows Kenny's estimated x/y position,
heading, uncertainty area, current planned route and your registered marker,
with zoom/follow/fit controls. Stale estimates are dimmed as **LAST KNOWN
POSITION**; no coordinates are invented when a publisher is offline. Simulation
playback is explicitly labeled **SIMULATED**.

The scanner registry comes from the uploaded map, and **Request KENNY** submits
`{request_id, marker_id, dictionary, caller}` to `/api/calls`. Network retries
reuse the request ID. Trip status is read from the API; a queued request remains
queued when Kenny reroutes to a nearer caller. Arrival is reported by the
controller, rather than a local simulation timer. Gesture completion is not
simulated in this live flow.

Deploy the updated `Kenny-Api` map/pose endpoints and start its physical
controller (or the editor's labeled simulation publisher). Set
`KENNY_CORS_ORIGINS` on Render to include your frontend origin; the blueprint
includes Android `https://localhost`/`http://localhost` and Vite's port 5173.
An indoor editor map is used here, not a GPS street map.

Verification: `npm test`, `npm run build`, and the Playwright integration script
`tests/check_live_map_browser.py` (requires Playwright and a recent Node binary).
