import { logError } from '../utilities/logger.js';
/**
 * @module legacy-modules-loader
 * PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED
 * Legacy Module Loader - ES6 Migration Bridge
 *
 * Consolidates all legacy <script> src="..." tags into ES6 modules
 * This loader replaces 21 individual script tags with single import
 *
 * © 2025 Portfolio Manager Pro. All Rights Reserved.
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

/**
 * Load all legacy modules and initialize them
 * Ensures global window objects are available for backward compatibility
 *
 * @returns {Promise<void>}
 */
async function loadLegacyModules() {
  try {
    // THEME: Dark/Light mode system (must load first!)
    await import('../features/themes/theme-manager.js');

    // CORE: Error handling and accessibility
    await import('../core/error-handler.js');
    await import('../core/accessibility.js');
    await import('../core/notification-system.js');

    // LOADERS: Library loading system
    await import('./library-loader.js');

    // UTILITIES: Core utilities
    await import('../utilities/dom-safety.js');
    await import('../utilities/command-stack.js');
    await import('../utilities/data-validation.js');
    await import('../utilities/calculations-engine.js');
    await import('../utilities/auto-save.js');
    await import('../utilities/drag-drop.js');
    await import('../utilities/keyboard-shortcuts-overlay.js');
    await import('../utilities/service-worker.js');

    // ENTERPRISE MODULES: Phase 4 - Financial & Compliance Excellence
    // Financial precision & calculations
    await import('../utilities/financial-precision-engine.js');
    await import('../utilities/advanced-risk-metrics.js');
    await import('../utilities/portfolio-optimization.js');

    // Compliance & Quality
    await import('../utilities/regulatory-compliance.js');
    await import('../utilities/production-quality.js');

    // Advanced analysis
    await import('../utilities/stress-testing.js');
    await import('../utilities/technical-indicators.js');

    // UI Components
    await import('../utilities/correlation-heatmap-ui.js');
    await import('../utilities/advanced-dashboard.js');

    // FEATURES: Market data (lazy-loaded for better performance)
    // Marketplace loads after 3 seconds to prioritize core features
    // await import('../features/marketplace/market-data-service.js');
    // await import('../features/marketplace/market-data-ui.js');
    // await import('../features/marketplace/market-data.js');

    // FEATURES: Portfolio management
    await import('../features/portfolio/multi-portfolio.js');
    await import('../features/portfolio/app-portfolio.js');

    // FEATURES: Charts and visualization (lazy-loaded for better performance)
    // Charts load after 4 seconds to prioritize portfolio features
    // await import('../features/charts/charts-manager.js');
    // await import('../features/charts/advanced-charts.js');

    // FEATURES: Export functionality
    await import('../features/export/excel-export.js');

    console.info('✓ All legacy modules loaded and initialized as ES6 imports');
  } catch (error) {
    logError('✗ Failed to load legacy modules:', error);
    throw error;
  }
}

/**
 * Lazy load marketplace modules
 * Called after main app initialization to prioritize core features
 * Reduces initial bundle and improves Time to Interactive (TTI)
 *
 * @returns {Promise<void>}
 */
async function lazyLoadMarketplace() {
  try {
    await import('../features/marketplace/market-data-service.js');
    await import('../features/marketplace/market-data-ui.js');
    await import('../features/marketplace/market-data.js');
    console.info('✓ Marketplace modules loaded lazily');
  } catch (error) {
    logError('✗ Failed to lazy-load marketplace modules:', error);
  }
}

/**
 * Lazy load advanced charts modules
 * Called after marketplace to further optimize initial load
 * Charts typically not needed on first load, loaded on-demand
 *
 * @returns {Promise<void>}
 */
async function lazyLoadCharts() {
  try {
    await import('../features/charts/charts-manager.js');
    await import('../features/charts/advanced-charts.js');
    console.info('✓ Charts modules loaded lazily');
  } catch (error) {
    logError('✗ Failed to lazy-load charts modules:', error);
  }
}

export { loadLegacyModules, lazyLoadMarketplace, lazyLoadCharts };
