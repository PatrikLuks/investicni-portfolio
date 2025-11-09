/**
 * @module main
 * PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED
 * MAIN ENTRY POINT
 * Investment Portfolio Manager Pro v3.3.0
 * ES6 Module Orchestrator - Clean Architecture
 *
 * © 2025 Portfolio Manager Pro. All Rights Reserved.
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * See LICENSE file for complete license terms.
 *
 * This is the main entry point that bootstraps the application.
 * It imports the core initialization function and starts the app when DOM is ready.
 */

// Import core application module
import { initializeApp } from './modules/app-core.js';

// Import legacy modules loader (replaces 21 <script> tags in index.html)
import { loadLegacyModules, lazyLoadMarketplace, lazyLoadCharts } from './src/js/loaders/legacy-modules-loader.js';

// Help system is lazy-loaded for better performance
let helpSystemInitialized = false;

/**
 * Lazy load help system module
 * Loaded with 2s delay to prioritize critical features
 */
async function lazyInitializeHelpSystem() {
  if (helpSystemInitialized) {
    return;
  }

  try {
    const { initializeHelpSystem } = await import('./modules/help-system.js');
    initializeHelpSystem();
    helpSystemInitialized = true;
  } catch (error) {
    console.error('Failed to load help system:', error);
  }
}

/**
 * Start application when DOM is ready
 * Handles both loading and interactive/complete states
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    // Load all legacy modules first (core features)
    await loadLegacyModules();
    // Initialize core app
    initializeApp();
    // Load marketplace after 3 seconds (lower priority feature)
    setTimeout(() => lazyLoadMarketplace(), 3000);
    // Load help system after 2 seconds (low priority)
    setTimeout(() => lazyInitializeHelpSystem(), 2000);
  });
} else {
  // Load all legacy modules first
  loadLegacyModules().then(() => {
    initializeApp();
    // Load marketplace after 3 seconds
    setTimeout(() => lazyLoadMarketplace(), 3000);
    setTimeout(() => lazyInitializeHelpSystem(), 2000);
  });
}

// Export for debugging purposes
export { initializeApp, lazyInitializeHelpSystem };
