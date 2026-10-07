import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      failOnError: false,
      png: { quality: 75 },
      jpeg: { quality: 75 },
      jpg: { quality: 75 },
      webp: { quality: 78, effort: 4 },
      svg: false, // Skip SVG optimization (svgo not installed)
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Increase chunk warning limit  
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('scholarships.json')) {
            return 'scholarships-data';
          }
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'three';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'animations';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})

