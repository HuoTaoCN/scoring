import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  assetsInclude: ['**/*.md'],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['mermaid'],
          'pdf': ['jspdf', 'html-to-image'],
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-raw'],
          'utils': ['openai', 'hono', 'clsx', 'tailwind-merge', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
