// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ✅ points to your project's ./src no matter where it builds
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
