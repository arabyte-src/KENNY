// Convert the upstream browser/CommonJS globals into explicit ES module exports.
import { readFileSync, writeFileSync } from 'node:fs';
const cv = readFileSync('node_modules/js-aruco2/src/cv.js', 'utf8').replace('var CV = CV || {};\nthis.CV = CV;', 'export const CV = {};');
const ar = readFileSync('node_modules/js-aruco2/src/aruco.js', 'utf8').replace("var AR = {};\nvar CV = this.CV || require('./cv').CV;\nthis.AR = AR;", "import { CV } from './cv.js';\nexport const AR = {};");
writeFileSync('src/vendor/cv.js', cv);
writeFileSync('src/vendor/aruco.js', ar);
