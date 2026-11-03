import { defineConfig } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Commercial previews must never call the operational production API.
  ...(process.env.VERCEL_ENV === 'preview' ? { define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/preview-api-disabled') } } : {}),
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    env: {
      VITE_API_URL: 'http://localhost',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
