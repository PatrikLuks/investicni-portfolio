/**
 * Formatting Utilities Module
 * Centralized formatting functions for currency, numbers, and text
 * @module formatting
 */

/**
 * Format number as Czech currency (CZK)
 * @param {number} value - Number to format
 * @param {number} [decimals=0] - Decimal places to show
 * @returns {string} Formatted currency string with Kč symbol
 * @example
 * formatCurrency(12345) // "12 345 Kč"
 * formatCurrency(12345.67, 2) // "12 345,67 Kč"
 */
export function formatCurrency(value, decimals = 0) {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with Czech locale
 * @param {number} value - Number to format
 * @param {number} [decimals=2] - Decimal places
 * @returns {string} Formatted number with Czech locale (spaces as thousands separator)
 * @example
 * formatNumber(12345.67) // "12 345,67"
 */
export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 * @param {number} value - Number to format as percentage
 * @param {number} [decimals=2] - Decimal places
 * @returns {string} Formatted percentage (e.g., "12.34%")
 * @example
 * formatPercentage(0.1234) // "12.34%"
 * formatPercentage(12.34, 0) // "12%"
 */
export function formatPercentage(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text to maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=50] - Maximum length
 * @returns {string} Truncated text with "..." if exceeds max length
 * @example
 * truncateText("Very long text here", 10) // "Very long ..."
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Deep clone an object using JSON serialization
 * Note: Cannot clone functions, circular references, or special objects
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 * @example
 * const cloned = deepClone({ a: { b: 1 } }) // { a: { b: 1 } }
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if value is considered empty
 * @example
 * isEmpty(null) // true
 * isEmpty("") // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty("hello") // false
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} Promise that resolves after delay
 * @example
 * await sleep(1000) // Wait 1 second
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely execute function with error handling
 * @param {Function} fn - Function to execute
 * @param {*} [fallback=null] - Value to return if function throws
 * @returns {*} Function result or fallback value
 * @example
 * const result = safeExecute(() => riskyFunction(), null)
 */
export function safeExecute(fn, fallback = null) {
  try {
    return fn();
  } catch (error) {
    console.error('safeExecute error:', error);
    return fallback;
  }
}

/**
 * Generate unique ID combining timestamp and random string
 * @returns {string} Unique ID (e.g., "1699999999999-a1b2c3d4e")
 * @example
 * const id = generateId() // "1699999999999-a1b2c3d4e"
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Download text content as file
 * @param {string} content - Text content to download
 * @param {string} filename - Filename for downloaded file
 * @param {string} [mimeType='text/plain'] - MIME type of content
 * @returns {void}
 * @example
 * downloadTextFile("Hello, world!", "hello.txt", "text/plain")
 */
export function downloadTextFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
