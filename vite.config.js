import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Custom plugin to handle SPA routing
const spaFallbackPlugin = () => {
  return {
    name: 'spa-fallback',
    writeBundle() {
      // Read the main index.html
      const indexPath = resolve(__dirname, 'dist/index.html')
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf-8')
        
        // Create a simple 404.html that redirects to index.html
        const fallbackContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
        // Simple redirect to index.html for SPA routing
        window.location.href = '/';
    </script>
</head>
<body>
    <p>Redirecting...</p>
</body>
</html>`
        
        // Write 404.html to dist
        fs.writeFileSync(resolve(__dirname, 'dist/404.html'), fallbackContent)
        console.log('✅ Created 404.html for SPA fallback')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-icons', 'react-scroll']
        }
      }
    },
    // Ensure SPA routing works by copying necessary files
    copyPublicDir: true
  },
  server: {
    port: 3000,
    host: true
  },
  // Add SPA fallback for development
  preview: {
    port: 3000,
    host: true
  }
})
