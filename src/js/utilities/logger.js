/**
 * @module logger
 * PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED
 * Global Logger Utility - Debug Flag Management
 *
 * Provides conditional logging based on DEBUG flag
 * In production: only errors and warnings visible
 * In development: all logs visible
 *
 * © 2025 Portfolio Manager Pro. All Rights Reserved.
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

/**
 * Global debug flag - controls console output
 * Set to false in production, true in development
 */
const DEBUG = (() => {
  // Check environment variables
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV === "production"
  ) {
    return false;
  }

  // Check URL query parameter (?debug=true)
  if (typeof window !== "undefined" && window.location) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("debug")) {
      return params.get("debug") === "true";
    }
  }

  // Check localStorage preference
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("app-debug");
    if (stored !== null) {
      return stored === "true";
    }
  }

  // Default: development mode has debug logs, production doesn't
  // In Vite dev server: use debug, in built version: no debug
  return (
    typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV
  );
})();

/**
 * Conditional info log - only shows in debug mode
 * @param {...any} args - Arguments to log
 */
function logInfo(...args) {
  if (DEBUG) {
    console.log("[DEBUG]", ...args);
  }
}

/**
 * Conditional debug log - only shows in debug mode
 * @param {...any} args - Arguments to log
 */
function logDebug(...args) {
  if (DEBUG) {
    console.debug("[DEBUG]", ...args);
  }
}

/**
 * Always shown warning - important for production diagnostics
 * @param {...any} args - Arguments to log
 */
function logWarn(...args) {
  console.warn("[WARNING]", ...args);
}

/**
 * Always shown error - critical issues
 * @param {...any} args - Arguments to log
 */
function logError(...args) {
  console.error("[ERROR]", ...args);
}

/**
 * Set debug mode at runtime
 * @param {boolean} enabled - Enable or disable debug mode
 */
function setDebugMode(enabled) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("app-debug", enabled ? "true" : "false");
  }
  location.reload();
}

/**
 * Get current debug status
 * @returns {boolean} Current debug mode status
 */
function isDebugMode() {
  return DEBUG;
}

export {
  DEBUG,
  logInfo,
  logDebug,
  logWarn,
  logError,
  setDebugMode,
  isDebugMode,
};
