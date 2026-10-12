import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDetector, parseMarkerMap, markerLabel } from '../src/services/markerService.js';
const fixtures = JSON.parse(readFileSync(new URL('./fixtures/opencv-markers.json', import.meta.url)));
function frame(fixture, rotation = 0) {
  const { width, height } = fixture;
  const gray = Buffer.from(fixture.gray, 'base64');
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let sx = x, sy = y;
    for (let r = 0; r < rotation; r++) [sx, sy] = [sy, width - 1 - sx];
    const index = (y * width + x) * 4;
    data[index] = data[index + 1] = data[index + 2] = gray[sy * width + sx];
    data[index + 3] = 255;
  }
  return { width, height, data };
}
test('OpenCV 4x4 markers retain IDs in all four orientations', () => {
  const detector = createDetector('DICT_4X4_1000');
  for (const fixture of fixtures) for (let rotation = 0; rotation < 4; rotation++) {
    assert.deepEqual(detector.detect(frame(fixture, rotation)).map((m) => m.id), [fixture.id]);
  }
});
test('50-marker dictionary rejects IDs outside its range and blank frames', () => {
  const detector = createDetector('DICT_4X4_50');
  for (const fixture of fixtures) assert.deepEqual(detector.detect(frame(fixture)).map((m) => m.id), fixture.id < 50 ? [fixture.id] : []);
  const blank = frame(fixtures[0]); blank.data.fill(255);
  assert.deepEqual(detector.detect(blank), []);
});
test('map imports actual coordinates and preserves high IDs on reload', () => {
  const map = parseMarkerMap({ dictionary: 'DICT_4X4_1000', units: 'meters', markers: [{ id: 999, x: 2.5, y: 3, name: 'Lab' }] });
  assert.deepEqual(map.markers[0], { id: 'AR-999', x: 2.5, y: 3, zone: 'Lab' });
  assert.deepEqual(parseMarkerMap(JSON.parse(JSON.stringify(map))), map);
  assert.equal(markerLabel(0), 'AR-00');
  assert.equal(parseMarkerMap({ markers: [{ id: 7, position_m: [2, 4, 0] }] }).markers[0].y, 4);
});
test('maps reject missing, duplicate, invalid and out-of-range coordinates or IDs', () => {
  for (const value of [{ markers: [] }, { markers: [{ id: 7 }] }, { markers: [{ id: 50, x: 1, y: 2 }] }, { markers: [{ id: 1, x: '1', y: 2 }] }, { dictionary: 'wrong', markers: [] }, { markers: [{ id: 1, x: 1, y: 2 }, { id: 1, x: 2, y: 3 }] }]) assert.throws(() => parseMarkerMap(value));
});
