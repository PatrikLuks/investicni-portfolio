/**
 * VITE CONFIGURATION
 * Investment Portfolio Manager Pro v3.1.0
 * Production-ready build setup with optimization
 */

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';

export default defineConfig({
  // Base public path
  base: './',

  // Server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
    },
  },

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Assets directory
    assetsDir: 'assets',
    
    // Source maps for debugging
    sourcemap: true,
    
    // Target browsers
    target: 'es2015',
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 600,
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core application
          'app-core': [
            './modules/app-core.js',
            './modules/data-manager.js',
            './modules/utilities.js',
          ],
          // UI components
          'ui-components': [
            './modules/ui-manager.js',
            './modules/event-handlers.js',
          ],
          // Business logic
          'portfolio-logic': [
            './modules/portfolio-calculator.js',
          ],
          // Third-party libraries (if any heavy libs are added)
          // 'vendor': ['chart.js', 'jspdf']
        },
        // Asset file naming
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          } else if (/woff2?|ttf|otf|eot/i.test(extType)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
  },

  // Plugins
  plugins: [
    // Legacy browser support (for older browsers)
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files >10KB
      deleteOriginFile: false,
    }),
    
    // Brotli compression (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],

  // Optimization
  optimizeDeps: {
    include: [
      // Add dependencies that need pre-bundling
    ],
    exclude: [
      // Add dependencies that should not be pre-bundled
    ],
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@modules': '/modules',
      '@': '/src',
    },
  },

  // Environment variables prefix
  envPrefix: 'PORTFOLIO_',

  // Preview server (for production build)
  preview: {
    port: 4173,
    open: true,
  },
});
