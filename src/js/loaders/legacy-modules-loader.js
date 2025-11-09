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

    // FEATURES: Market data
    await import('../features/marketplace/market-data-service.js');
    await import('../features/marketplace/market-data-ui.js');
    await import('../features/marketplace/market-data.js');

    // FEATURES: Portfolio management
    await import('../features/portfolio/multi-portfolio.js');
    await import('../features/portfolio/app-portfolio.js');

    // FEATURES: Charts and visualization
    await import('../features/charts/charts-manager.js');
    await import('../features/charts/advanced-charts.js');

    // FEATURES: Export functionality
    await import('../features/export/excel-export.js');

    console.info('✓ All legacy modules loaded and initialized as ES6 imports');
  } catch (error) {
    console.error('✗ Failed to load legacy modules:', error);
    throw error;
  }
}

export { loadLegacyModules };
