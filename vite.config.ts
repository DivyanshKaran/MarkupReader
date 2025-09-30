import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MarkupReader/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-highlight'],
          'ui-vendor': ['lucide-react'],
          // Feature chunks
          'markdown': ['./src/components/MarkdownRenderer.tsx', './src/components/LazyMarkdownRenderer.tsx'],
          'sidebar': ['./src/components/Sidebar.tsx', './src/components/VirtualizedList.tsx'],
          'images': ['./src/components/ProgressiveImage.tsx'],
        },
      },
    },
    // Optimize for mobile
    target: 'es2015',
    minify: 'esbuild',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Enable gzip compression
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
})
