"""Mobile live-map updates/staleness with mocked cloud data; no robot commands."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import time
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def main():
    node = os.environ.get('NODE_BINARY') or shutil.which('node')
    if not node:
        raise RuntimeError('Install Node.js 22.12+ or set NODE_BINARY')
    server = subprocess.Popen([node, str(ROOT / 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', '4174'],
                              cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(80):
            try:
                with urlopen('http://127.0.0.1:4174/', timeout=1):
                    break
            except OSError:
                time.sleep(.1)
        environment = {'version': 1, 'name': 'Cloud test room', 'frame_id': 'map', 'units': 'meters',
            'dictionary': 'DICT_4X4_50', 'grid': {'width': 6, 'height': 4, 'resolution': 1, 'origin': [0, 0, 0], 'data': [0] * 24},
            'markers': [{'id': 7, 'x': 3, 'y': 2}], 'obstacles': []}
        robot = {'pose': {'frame_id': 'map', 'x': 1, 'y': 1, 'yaw': 0}, 'source': 'physical', 'status': 'navigating',
            'map_sha256': 'a' * 64, 'map_revision': 1, 'age_seconds': 0, 'stale': False, 'stale_after_seconds': 5,
            'route': [[1, 1], [3, 2]], 'goal': {'x': 3, 'y': 2, 'marker_id': 7}, 'detail': 'Navigating to marker 7'}
        cv_python = os.environ.get('CV_PYTHON', str(ROOT.parent / 'Kenny---Automotive-self-driving-trash-can/.venv/bin/python'))
        cells = json.loads(subprocess.check_output([cv_python, '-c',
            'import cv2,json; print(json.dumps((cv2.aruco.generateImageMarker(cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50),7,6)>0).astype(int).tolist()))']))
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 390, 'height': 844})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.add_init_script('''
              navigator.mediaDevices.getUserMedia = async () => {
                const cells = ''' + json.dumps(cells) + ''';
                const canvas = document.createElement('canvas'); canvas.width=360; canvas.height=360;
                const context=canvas.getContext('2d');
                function draw() { context.fillStyle='white'; context.fillRect(0,0,360,360);
                  for(let y=0;y<6;y++)for(let x=0;x<6;x++){context.fillStyle=cells[y][x]?'white':'black';context.fillRect(60+x*40,60+y*40,40,40);} }
                draw(); const stream=canvas.captureStream(10); setInterval(draw,100); return stream;
              };
            ''')
            page.route('**/api/map', lambda route: route.fulfill(json={'environment': environment, 'sha256': 'a' * 64, 'revision': 1, 'updated': 1}))
            page.route('**/api/robot', lambda route: route.fulfill(json=robot))
            calls = []
            def submit(route):
                calls.append(json.loads(route.request.post_data))
                route.fulfill(json={**calls[-1], 'id': 'mobile-call', 'status': 'queued'})
            page.route('**/api/calls', submit)
            page.route('**/api/calls/*', lambda route: route.fulfill(json={'id': 'mobile-call', 'status': 'queued', 'detail': 'Waiting for controller'}))
            page.goto('http://127.0.0.1:4174/')
            page.get_by_role('img', name='Kenny live estimated location on the uploaded map').wait_for(timeout=20000)
            page.wait_for_function('document.querySelector("[data-robot-location]")?.getAttribute("transform")==="translate(1,3)"')
            robot['pose'].update(x=2, y=1.5)
            page.wait_for_function('document.querySelector("[data-robot-location]")?.getAttribute("transform")==="translate(2,2.5)"', timeout=15000)
            page.get_by_role('button', name='Follow Kenny').click()
            robot['source'] = 'simulation'
            page.get_by_text('Simulation position · not physical robot telemetry', exact=True).wait_for(timeout=15000)
            robot['stale'], robot['age_seconds'] = True, 7
            page.get_by_text('LAST KNOWN POSITION', exact=True).wait_for(timeout=15000)
            assert page.locator('[data-robot-location]').get_attribute('opacity') == '0.5'
            page.get_by_role('button', name='Scan ArUco marker').click()
            page.get_by_role('button', name='Scan ArUco', exact=True).click(timeout=15000)
            page.get_by_role('button', name='Request KENNY', exact=True).wait_for(timeout=15000)
            page.get_by_role('button', name='Request KENNY', exact=True).click()
            page.get_by_role('heading', name='Waiting in queue', exact=True).wait_for(timeout=15000)
            assert len(calls) == 1 and calls[0]['marker_id'] == 7 and calls[0]['dictionary'] == 'DICT_4X4_50'
            assert calls[0]['request_id']
            assert not errors, errors
            browser.close()
        print('Mobile browser: live map/pose, follow/stale labels, real ArUco decode, cloud call and queued tracking passed')
    finally:
        server.terminate()
        server.wait(timeout=10)


if __name__ == '__main__':
    main()
