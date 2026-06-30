import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: ["es2018", "safari12"],
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": "http://localhost:3001"
    }
  }
});
