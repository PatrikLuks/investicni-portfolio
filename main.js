/**
 * @module main
 * MAIN ENTRY POINT
 * Investment Portfolio Manager Pro v3.1.0
 * ES6 Module Orchestrator - Clean Architecture
 *
 * This is the main entry point that bootstraps the application.
 * It imports the core initialization function and starts the app when DOM is ready.
 */

// Import core application module
import { initializeApp } from './modules/app-core.js';

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
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    // Load help system after 2 seconds (low priority)
    setTimeout(() => lazyInitializeHelpSystem(), 2000);
  });
} else {
  initializeApp();
  setTimeout(() => lazyInitializeHelpSystem(), 2000);
}

// Export for debugging purposes
export { initializeApp, lazyInitializeHelpSystem };
