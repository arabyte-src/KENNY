import { AR } from '../vendor/aruco.js';
import codes from '../data/aruco4x4.js';
import { locations } from '../data/locations.js';

export const DEFAULT_MARKER_DICTIONARY = 'DICT_4X4_50';
export const dictionaries = ['DICT_4X4_50', 'DICT_4X4_1000', 'ARUCO'];
export const markerDictionaries = dictionaries;
for (const [name, count] of [['DICT_4X4_50', 50], ['DICT_4X4_1000', 1000]]) {
  // Exact matching avoids ambiguous corrections in the dense 1000-marker dictionary.
  AR.DICTIONARIES[name] = { nBits: 16, tau: 1, codeList: codes.slice(0, count) };
}
export function createDetector(dictionaryName) {
  if (!dictionaries.includes(dictionaryName)) throw Error('Unsupported marker dictionary.');
  return new AR.Detector({ dictionaryName });
}
export const markerLabel = id => `AR-${String(id).padStart(2, '0')}`;
export const formatMarkerId = markerLabel;

export function createMarkerScanner(registry, dictionaryName = DEFAULT_MARKER_DICTIONARY) {
  const detector = createDetector(dictionaryName);
  return image => {
    const markers = detector.detect(image);
    const location = registry.find(entry => (!entry.dictionary || entry.dictionary === dictionaryName)
      && markers.some(marker => entry.id === markerLabel(marker.id)));
    return { location, markerIds: markers.map(marker => markerLabel(marker.id)) };
  };
}

export function parseMarkerMap(value) {
  const dictionary = value.dictionary || DEFAULT_MARKER_DICTIONARY;
  if (!dictionaries.includes(dictionary)) throw Error('Unsupported marker dictionary.');
  if (value.units && value.units !== 'meters') throw Error('Marker coordinates must use meters.');
  const source = Array.isArray(value) ? value : value.markers;
  if (!Array.isArray(source) || !source.length) throw Error('The file must contain markers with IDs and X/Y coordinates.');
  const seen = new Set();
  const markers = source.map(marker => {
    const id = typeof marker.id === 'string' && /^AR-\d+$/.test(marker.id) ? Number(marker.id.slice(3)) : marker.id;
    const x = marker.x ?? marker.position_m?.[0], y = marker.y ?? marker.position_m?.[1];
    const limit = dictionary === 'DICT_4X4_50' ? 50 : dictionary === 'ARUCO' ? 1024 : 1000;
    if (!Number.isInteger(id) || id < 0 || id >= limit || !Number.isFinite(x) || !Number.isFinite(y) || seen.has(id)) {
      throw Error('Each marker needs a unique valid ID and numeric X/Y coordinates in meters.');
    }
    seen.add(id);
    return { id: markerLabel(id), x, y, zone: marker.zone || marker.name || `Marker ${id}` };
  });
  return { dictionary, markers };
}

export function loadMarkerMap() {
  try {
    const stored = localStorage.getItem('kenny-marker-map');
    if (stored) return parseMarkerMap(JSON.parse(stored));
  } catch { /* Invalid saved data must not prevent opening the camera. */ }
  return { dictionary: DEFAULT_MARKER_DICTIONARY, markers: locations };
}
