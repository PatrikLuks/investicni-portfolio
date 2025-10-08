/**
 * MAIN ENTRY POINT
 * Investment Portfolio Manager Pro v3.1.0
 * ES6 Module Orchestrator - Clean Architecture
 */

// Import core application module
import { initializeApp } from './modules/app-core.js';

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for debugging purposes
export { initializeApp };
