import { defineConfig } from 'vite'

export default defineConfig({
  // Set the base path for GitHub Pages deployment
  // Replace 'D3_tutorial' with your actual GitHub repository name
  base: process.env.NODE_ENV === 'production' ? '/D3_tutorial/' : '/',
  
  build: {
    // Output directory for built files
    outDir: 'dist',
    
    // Generate source maps for debugging
    sourcemap: true,
    
    // Optimize for modern browsers
    target: 'es2015',
    
    rollupOptions: {
      // Ensure proper handling of assets
      output: {
        manualChunks: {
          vendor: ['d3', 'vega-lite', 'vega-embed'],
          monaco: ['monaco-editor']
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 4173,
    host: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['d3', 'vega-lite', 'vega-embed', 'monaco-editor']
  }
})