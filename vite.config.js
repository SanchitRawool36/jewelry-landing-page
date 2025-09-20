import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'public/libs/rhino3dm.wasm', dest: 'libs' }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['rhino3dm']
  },
  build: {
    assetsInlineLimit: 0
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
