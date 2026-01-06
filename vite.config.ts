import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Copy service worker and manifest to dist during build
        {
          name: 'copy-pwa-files',
          closeBundle() {
            try {
              copyFileSync('sw.js', 'dist/sw.js');
              copyFileSync('manifest.json', 'dist/manifest.json');
            } catch (err) {
              console.warn('Could not copy PWA files:', err);
            }
          }
        }
      ],
      // Removed unused GEMINI_API_KEY references for security
      // If needed in future, add back with proper environment variable handling
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: undefined
          }
        }
      }
    };
});
