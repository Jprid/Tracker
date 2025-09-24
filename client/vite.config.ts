/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fakeDataPlugin } from './src/vite-fake-data.plugin';

export default defineConfig(({ mode }) => {
  // Define environment variables based on mode
  const defineValues = mode === 'screenshot' ? {
    'import.meta.env.VITE_API_BASE_URL': '"http://localhost:5173/api"',
    'import.meta.env.VITE_USE_FAKE_DATA': '"true"'
  } : {};

  return {
    plugins: [
        react(),
        fakeDataPlugin(),
    ],
    root: "./src",
    build: {
        outDir: "../dist",
    },
    define: defineValues,
    server: {
        // Remove any proxy configuration when using fake data
        proxy: process.env.VITE_USE_FAKE_DATA === 'true' ? undefined : {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
        }
    }
  }
})
