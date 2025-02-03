import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Default to port 10005, but this will be detected by the client
const backendPort = process.env.VITE_BACKEND_PORT || '10005'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  define: {
    // Inject environment variables at build time
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
    'process.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN),
    'process.env.VITE_GA_TRACKING_ID': JSON.stringify(process.env.VITE_GA_TRACKING_ID),
  },
});
