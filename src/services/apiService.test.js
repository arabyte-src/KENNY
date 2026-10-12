import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi, normalizeApiUrl, registeredLocations, trackingState, worldToMap, validateMap } from './apiService.js';

test('map projection handles translated and rotated ROS origins', () => {
  const point = worldToMap({ x: 9, y: 22 }, { width: 4, height: 3, resolution: 1, origin: [10, 20, Math.PI / 2] });
  assert.ok(Math.abs(point.x - 2) < 1e-9);
  assert.ok(Math.abs(point.y - 2) < 1e-9);
});

test('registered markers carry real ID, dictionary and coordinates for calls', () => {
  const locations = registeredLocations({ name: 'Room', dictionary: 'DICT_4X4_50',
    grid: { height: 4, resolution: 1, origin: [0, 0, 0] }, markers: [{ id: 7, x: 1, y: 2, yaw: 0 }] });
  assert.equal(locations[0].id, 'AR-07');
  assert.equal(locations[0].marker_id, 7);
  assert.equal(locations[0].dictionary, 'DICT_4X4_50');
  assert.deepEqual(locations[0].map, { x: 1, y: 2 });
});

test('stale and disconnected positions never retain a live label', () => {
  const robot = { pose: { frame_id: 'map', x: 1, y: 2, yaw: .5 }, age_seconds: 0, stale: false, stale_after_seconds: 5, source: 'physical' };
  assert.equal(trackingState(robot, 1000, 2000).stale, false);
  assert.equal(trackingState(robot, 1000, 7000).stale, true);
  assert.equal(trackingState(robot, 1000, 2000, 'Disconnected').stale, true);
  assert.equal(trackingState({ ...robot, source: 'simulation' }, 1000, 2000).label, 'SIMULATED');
  assert.equal(trackingState(null, 0).hasPose, false);
});

test('client uses the hosted URL and sends idempotent call metadata', async () => {
  let captured;
  const api = createApi('https://kenny-api.onrender.com/', async (url, options) => {
    captured = { url, options }; return { ok: true, json: async () => ({ id: 'job' }) };
  });
  const payload = { request_id: 'same-for-retry', marker_id: 7, dictionary: 'DICT_4X4_50' };
  assert.equal((await api('/api/calls', payload)).id, 'job');
  assert.equal(captured.url, 'https://kenny-api.onrender.com/api/calls');
  assert.deepEqual(JSON.parse(captured.options.body), payload);
  assert.throws(() => normalizeApiUrl('file:///etc/passwd'));
});

test('missing deployment errors and malformed maps are explicit', async () => {
  const api = createApi(undefined, async () => ({ ok: false, status: 404, json: async () => ({}) }));
  await assert.rejects(() => api('/api/robot'), /not deployed/);
  assert.throws(() => validateMap({ environment: {} }), /unsupported map/);
});
