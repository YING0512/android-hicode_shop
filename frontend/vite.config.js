import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/1208/',
  server: {
    host: true,
    proxy: {
      '/1208/backend': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
      }
    },
    allowedHosts: true,
  }
})
