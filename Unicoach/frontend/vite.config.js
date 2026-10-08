import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import fs from 'fs'
import path from 'path'

// Link previews (WhatsApp, LinkedIn, Facebook) read only the static HTML and never run our
// JavaScript, so every SPA route would show the homepage banner. For the routes below the build
// writes a copy of dist/index.html with that page's title, description and image, and nginx
// serves it for the route (try_files $uri.html in nginx.conf).
const SHARE_PAGES = {
  '/unicoach/for-mentors': {
    title: 'Become a UniCoach Mentor | 0% Platform Fee',
    description: 'Host paid 1:1 sessions, share your journey abroad and grow your name, all from a single link. Free to join, 0% platform fee.',
    image: 'https://www.unicoach.com/og-mentors.jpg',
    imageAlt: 'Become a UniCoach Mentor',
  },
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

function sharePagesPlugin() {
  let outDir
  return {
    name: 'unicoach-share-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const base = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      for (const [route, meta] of Object.entries(SHARE_PAGES)) {
        const url = `https://www.unicoach.com${route}`
        const title = escapeAttr(meta.title)
        const description = escapeAttr(meta.description)
        const alt = escapeAttr(meta.imageAlt)
        const html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta (?:name|property)="(?:title|og:title|twitter:title)" content=")[^"]*"/g, `$1${title}"`)
          .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*"/g, `$1${description}"`)
          .replace(/(<meta (?:name|property)="(?:og:url|twitter:url)" content=")[^"]*"/g, `$1${url}"`)
          .replace(/(<meta (?:name|property)="(?:og:image|og:image:secure_url|twitter:image)" content=")[^"]*"/g, `$1${meta.image}"`)
          .replace(/(<meta (?:name|property)="(?:og:image:alt|twitter:image:alt)" content=")[^"]*"/g, `$1${alt}"`)
          .replace(/(<link rel="image_src" href=")[^"]*"/, `$1${meta.image}"`)
        const file = path.join(outDir, `${route.slice(1)}.html`)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sharePagesPlugin(),
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

