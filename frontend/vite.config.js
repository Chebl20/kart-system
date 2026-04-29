import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        ws: true,
        logLevel: 'info'
      }
    },
    host: true,
    middleware: (req, res, next) => {
      console.log(`[Proxy Debug] ${req.method} ${req.url}`);
      next();
    }
  }
})
