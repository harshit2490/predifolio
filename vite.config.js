import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Screener.in API to avoid CORS issues in dev
      '/api/screener': {
        target: 'https://www.screener.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/screener/, '/api'),
      },
    },
  },
})
