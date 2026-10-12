# KENNY

Mobile/web control interface for the indoor trash-collection robot. Run it with
`npm install` and `npm run dev` (Node.js 22.12+).

## Live uploaded map and cloud tracking

Home and request tracking use `https://kenny-api.onrender.com` by default.
Change the base URL under **API connection**. The app loads `/api/map` and polls
`/api/robot` every two seconds, showing Kenny's estimated x/y position, heading,
uncertainty area, current route and your registered marker, with zoom/follow/fit
controls. Stale estimates are dimmed as **LAST KNOWN POSITION**. No coordinates
are invented when the publisher is offline. Simulation is labeled **SIMULATED**.

The scanner registry comes from the uploaded map when available. **Request
KENNY** submits `{request_id, marker_id, dictionary, caller}` to `/api/calls`;
network retries reuse the request ID. Trip status comes from the API. A queued
request remains pending when Kenny serves a nearer caller. A marker without a
usable server destination is shown as awaiting a map location. Arrival is
reported by the controller, rather than a local simulation timer. Gesture
completion is not simulated in this live flow.

Deploy the updated `Kenny-Api` map/pose endpoints and start its physical
controller or the editor's labeled simulation publisher. `KENNY_CORS_ORIGINS`
on Render must include your frontend origin; the blueprint includes Android
`https://localhost`/`http://localhost` and Vite's port 5173. This uses an indoor
editor map, not a GPS street map.

## ArUco scanner and Android APK

The scanner reads live camera frames until a marker is found or 20 seconds
elapse. Choose OpenCV `DICT_4X4_50` (default), `DICT_4X4_1000` (IDs 0–999), or
the original `ARUCO` dictionary. Two consecutive detections confirm an ID. The
offline, vendored detector retains the remote repository's Android scanner fix.

The cloud map automatically registers coordinates. When offline, **Import
marker map** can load the editor's `environment.json` or a JSON registry:

```json
{"dictionary":"DICT_4X4_50","units":"meters","markers":[{"id":7,"x":2.5,"y":3.0,"zone":"Lab entrance"}]}
```

Use your actual surveyed coordinates; these example numbers are illustrative.
Imports persist on the device and can use `position_m: [x, y, z]`. Registries
are matched only to their dictionary, so identical numeric IDs in another
family do not acquire the wrong coordinates. The cloud registry takes priority
when that dictionary is available. Unregistered markers still display their ID.

Keep the full marker and white margin visible. Browser camera access requires
HTTPS or localhost; use the Android app for phone camera access on other setups.
The app declares camera permission and handles camera/torch errors.

`npm run android:build` builds
`android/app/build/outputs/apk/debug/app-debug.apk` (JDK 21 and Android SDK 36).
The previously verified scanner APK and its validation record remain in
`artifacts/aruco-scanner/`; build a new APK to include the live-map UI.
Vendored js-aruco2 files retain their MIT notices; regenerate with
`npm run vendor:aruco`. Regenerate dictionaries/test images using
`python scripts/export_aruco_dictionary.py` with opencv-contrib-python.

## ESP32 USB hardware test

The Home screen's **ESP32 USB control** link opens `http://localhost:8765/`.
Start `python3 scripts/usb_bridge.py --port /dev/ttyUSB0` from
`/home/kenny/joystick` using its USB-enabled firmware. See
`../joystick/docs/USB_CONTROL.md` for the protocol and stable device path.
This is the manual controller with real ESP32 telemetry; it is independent of
the cloud tracking display.

## Verification

- `npm test`: independent OpenCV image/orientation cases, legacy decoding,
  registry validation, map transforms, staleness and API request behavior.
- `npm run build`: production web bundle.
- `tests/check_live_map_browser.py`: real marker decoding from a synthetic
  camera stream, cloud call submission/queued tracking, live-map updates, follow
  controls and stale/simulation labels. Requires Playwright, recent Node and
  OpenCV via `CV_PYTHON` or the sibling simulator environment; `NODE_BINARY`
  can select a non-default Node binary.
