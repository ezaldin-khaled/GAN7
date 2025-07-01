import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.0.103:8000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', {
              method: req.method,
              url: req.url,
              headers: proxyReq.getHeaders(),
              path: proxyReq.path
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', {
              statusCode: proxyRes.statusCode,
              url: req.url,
              headers: proxyRes.headers
            });
          });
        }
      }
    }
  }
})
