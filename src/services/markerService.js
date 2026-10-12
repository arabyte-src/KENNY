import aruco from 'js-aruco2';
import 'js-aruco2/src/dictionaries/aruco_4x4_1000.js';
import 'js-aruco2/src/dictionaries/aruco_5x5_1000.js';
import 'js-aruco2/src/dictionaries/aruco_6x6_1000.js';
import 'js-aruco2/src/dictionaries/aruco_7x7_1000.js';
import 'js-aruco2/src/dictionaries/aruco_default_opencv.js';

const { AR } = aruco;

export const DEFAULT_MARKER_DICTIONARY = 'DICT_4X4_50';
export const markerDictionaries = [];

// OpenCV's 50/100/250 dictionaries are prefixes of the corresponding 1000
// dictionary. Slice before decoding so IDs outside the selected set are rejected.
for (const bits of [4, 5, 6, 7]) {
  const source = AR.DICTIONARIES[`ARUCO_${bits}X${bits}_1000`];
  for (const count of [50, 100, 250, 1000]) {
    const name = `DICT_${bits}X${bits}_${count}`;
    AR.DICTIONARIES[name] = { nBits: source.nBits, tau: 1, codeList: source.codeList.slice(0, count) };
    markerDictionaries.push(name);
  }
}
AR.DICTIONARIES.DICT_ARUCO_ORIGINAL = AR.DICTIONARIES.ARUCO_DEFAULT_OPENCV;
markerDictionaries.push('DICT_ARUCO_ORIGINAL', 'ARUCO', 'ARUCO_MIP_36h12');

export const formatMarkerId = (id) => `AR-${String(id).padStart(2, '0')}`;

export function createMarkerScanner(locations, dictionaryName = DEFAULT_MARKER_DICTIONARY) {
  if (!markerDictionaries.includes(dictionaryName)) throw new Error('Unsupported marker dictionary.');
  // js-aruco2 accepts distances strictly less than this value: 1 means exact
  // code matching, avoiding guessed IDs across marker families.
  const detector = new AR.Detector({ dictionaryName, maxHammingDistance: 1 });
  return (imageData) => {
    const markers = detector.detect(imageData);
    const location = locations.find((entry) => (!entry.dictionary || entry.dictionary === dictionaryName)
      && markers.some((marker) => entry.id === formatMarkerId(marker.id)));
    return { location, markerIds: markers.map((marker) => formatMarkerId(marker.id)) };
  };
}
