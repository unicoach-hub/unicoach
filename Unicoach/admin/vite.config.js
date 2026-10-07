import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@ant-design/icons')) {
              return 'vendor-antd-icons';
            }
            if (id.includes('antd') || id.includes('ant-design')) {
              return 'vendor-antd';
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'vendor-charts';
            }
            if (id.includes('react-quill-new') || id.includes('quill')) {
              return 'vendor-quill';
            }
            if (id.includes('react-router') || id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor-misc';
          }
        }
      }
    }
  }
})
