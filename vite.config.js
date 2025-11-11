/**
 * VITE CONFIGURATION - 2025 Edition
 * Investment Portfolio Manager Pro v3.2.1
 * Production-ready build setup with modern optimizations
 * Node.js 20+ | Vite 7+ | ES2024
 */

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // Base public path
  base: './',

  // 🚀 PERFORMANCE: Enable persistent cache for faster rebuilds
  cacheDir: '.vite',

  // Server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
    proxy: {
      // Proxy for Yahoo Finance API to bypass CORS in dev
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
      },
      // Proxy for market data endpoints
      '/api/market': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/market/, ''),
      },
    },
  },

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',

    // Assets directory
    assetsDir: 'assets',

    // 🚀 PERFORMANCE: Faster builds
    emptyOutDir: true,
    reportCompressedSize: true, // Enable to see bundle size

    // Source maps for debugging
    sourcemap: true,

    // Target browsers - ES2022 for modern features
    target: ['es2022', 'edge88', 'firefox78', 'chrome87', 'safari14'],

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
            './src/js/utilities/data-manager.js',
          ],
          // UI components
          'ui-components': ['./src/js/utilities/ui-manager.js', './modules/event-handlers.js'],
          // Business logic
          'portfolio-logic': ['./src/js/utilities/portfolio-calculator.js'],
          // Help system (lazy loaded separately)
          'help-system': ['./modules/help-system.js'],
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
      targets: ['Chrome >= 87', 'Firefox >= 78', 'Safari >= 14', 'Edge >= 88'],
      polyfills: true,
      modernPolyfills: true,
      additionalLegacyPolyfills: [], // Remove regenerator-runtime (not needed)
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

    // Bundle visualizer (generates stats.html)
    visualizer({
      filename: './dist/stats.html',
      open: false, // Don't auto-open browser
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: treemap, sunburst, network
    }),
  ],

  // Optimization
  optimizeDeps: {
    include: [
      'modules/app-core',
      'src/js/utilities/data-manager',
      'src/js/utilities/ui-manager',
    ],
    exclude: [
      'modules/help-system', // Lazy loaded
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
