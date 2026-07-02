import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is hard-coded to the GitHub Project Pages URL (no custom domain).
// Change this value to '/' if you fork and serve under a different path.
export default defineConfig({
  base: '/DOMus/',
  plugins: [react()],
  server: { port: 5173 },
});
