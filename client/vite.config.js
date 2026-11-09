import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// In development, /api calls are proxied to the Express server so no CORS setup is needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // An inline (even empty) PostCSS config stops Vite from loading a stray
  // postcss.config.js from a parent folder.
  css: { postcss: { plugins: [] } },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});