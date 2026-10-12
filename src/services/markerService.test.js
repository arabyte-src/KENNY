import assert from 'node:assert/strict';
import test from 'node:test';
import { createMarkerScanner } from './markerService.js';

// Render original ArUco code words into RGBA frames, rather than mocking the
// detector. This exercises thresholding, contour extraction, and ID decoding.
function markerFrame(id, turns = 0) {
  const words = ['10000', '10111', '01001', '01110'];
  let cells = Array.from({ length: 7 }, () => Array(7).fill(0));
  for (let row = 0; row < 5; row += 1) {
    const word = words[(id >> (2 * (4 - row))) & 3];
    for (let col = 0; col < 5; col += 1) cells[row + 1][col + 1] = Number(word[col]);
  }
  for (let turn = 0; turn < turns; turn += 1) {
    cells = cells[0].map((_, col) => cells.map((row) => row[col]).reverse());
  }
  const width = 360;
  const height = 360;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  const cellSize = 36;
  const margin = 54;
  for (let y = margin; y < margin + 7 * cellSize; y += 1) {
    for (let x = margin; x < margin + 7 * cellSize; x += 1) {
      const color = cells[Math.floor((y - margin) / cellSize)][Math.floor((x - margin) / cellSize)] * 255;
      const offset = (y * width + x) * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = color;
    }
  }
  return { width, height, data };
}

test('decodes registered markers in each orientation', () => {
  const location = { id: 'AR-01', zone: 'Test lab', x: 2, y: 3, map: { x: 50, y: 60 } };
  const scan = createMarkerScanner([location], 'ARUCO');
  for (let turns = 0; turns < 4; turns += 1) {
    const result = scan(markerFrame(1, turns));
    assert.equal(result.location, location);
    assert.deepEqual(result.markerIds, ['AR-01']);
  }
});

test('reports decoded IDs even when the registry is empty', () => {
  const result = createMarkerScanner([], 'ARUCO')(markerFrame(23));
  assert.equal(result.location, undefined);
  assert.deepEqual(result.markerIds, ['AR-23']);
});

test('does not assign an unregistered marker to another location', () => {
  const result = createMarkerScanner([{ id: 'AR-01' }], 'ARUCO')(markerFrame(123));
  assert.equal(result.location, undefined);
  assert.deepEqual(result.markerIds, ['AR-123']);
});

test('blank camera frames produce no marker or location', () => {
  const image = { width: 360, height: 360, data: new Uint8ClampedArray(360 * 360 * 4).fill(255) };
  assert.deepEqual(createMarkerScanner([{ id: 'AR-01' }])(image), { location: undefined, markerIds: [] });
});
