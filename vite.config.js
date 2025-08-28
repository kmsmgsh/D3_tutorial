import { defineConfig } from 'vite'
import { resolve } from 'path'

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
      // Multiple entry points for all HTML files
      input: {
        main: resolve(__dirname, 'index.html'),
        'chart-builder': resolve(__dirname, 'chart-builder.html'),
        'chart-builder-v2': resolve(__dirname, 'chart-builder-v2.html'),
        'monaco-sandbox': resolve(__dirname, 'monaco-sandbox.html'),
        'python-sandbox': resolve(__dirname, 'python-sandbox.html'),
        sandbox: resolve(__dirname, 'sandbox.html')
      },
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
  },

  // Copy additional directories to build output
  plugins: [
    {
      name: 'copy-assets',
      generateBundle() {
        // This will be handled by a simple copy in the build script
      }
    }
  ]
})