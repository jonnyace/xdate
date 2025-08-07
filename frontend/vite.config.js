import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Ensure JSX in .js files is transformed
      include: [/\.jsx?$/],
    }),
  ],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  esbuild: {
    jsx: 'automatic',
    loader: {
      '.js': 'jsx',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});


