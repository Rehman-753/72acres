import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The React dev server proxies API, media and admin requests to Django,
// so the session cookie and CSRF cookie stay same-origin.
const django = process.env.DJANGO_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': django,
      '/media': django,
      '/admin': django,
      '/static': django,
    },
  },
})
