import { defineConfig } from 'vite';

// js-aruco2 exposes its legacy modules through top-level `this`. Convert those
// bindings explicitly for Vite's ESM pipeline without changing the dependency.
export default defineConfig({
  cacheDir: 'node_modules/.vite-kenny-app',
  optimizeDeps: { exclude: ['js-aruco2'] },
  plugins: [{
    name: 'aruco-legacy-modules',
    enforce: 'pre',
    transform(source, id) {
      id = id.split('?')[0];
      if (!id.includes('/node_modules/js-aruco2/src/')) return;
      if (id.endsWith('/aruco.js')) {
        return source.replace("var CV = this.CV || require('./cv').CV;", "import { CV } from './cv.js';")
          .replace('this.AR = AR;', 'export { AR }; export default { AR };');
      }
      if (id.endsWith('/cv.js')) return source.replace('this.CV = CV;', 'export { CV };');
      if (id.includes('/dictionaries/')) {
        return source.replace("var AR = this.AR || require('../aruco').AR;", "import { AR } from '../aruco.js';");
      }
    },
  }],
});
