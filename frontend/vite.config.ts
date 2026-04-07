import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    checker({
      typescript: true,
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: [
      '@mediapipe/pose',
      '@mediapipe/drawing_utils',
      '@mediapipe/camera_utils'
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
