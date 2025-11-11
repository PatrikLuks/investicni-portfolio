import { logError } from './logger.js';
/**
 * UTILITIES MODULE
 * Shared utility functions for export, import, and data operations
 * Investment Portfolio Manager Pro v3.1.0
 * @module utilities
 */

/**
 * @typedef {Object} FundData
 * @property {string} name - Fund name
 * @property {string} producer - Fund producer
 * @property {number} investment - Investment amount
 * @property {number} value - Current value
 * @property {string} investmentDate - Investment date (YYYY-MM-DD)
 */

/**
 * Generate CSV export file from portfolio data
 * @param {FundData[]} data - Portfolio data to export
 * @param {string} [clientName='client'] - Client name for filename
 * @returns {void}
 */
export function generateCSV(data, clientName = 'client') {
  // Check if currency switch is enabled
  const currencySwitch = document.getElementById('currencySwitch');
  const useEuros = currencySwitch ? currencySwitch.checked : false;
  const currencySymbol = useEuros ? '€' : 'Kč';

  // Always export in funds format
  const csvRows = [
    `Název fondu,Producent,Datum investice,Čistá investice (${currencySymbol}),Aktuální hodnota (${currencySymbol})`,
  ];

  data.forEach((item) => {
    const row = [
      `"${item.name}"`,
      `"${item.producer}"`,
      item.investmentDate || '',
      item.investment,
      item.value,
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel
  const csvContentWithBOM = BOM + csvContent;

  const blob = new Blob([csvContentWithBOM], {
    type: 'text/csv;charset=utf-8',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  const fileName = `portfolio-${clientName}-${date}.csv`;

  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Format number as currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: 'CZK')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'CZK') {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text to maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
  // ES2024 nullish coalescing for cleaner null/undefined check
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
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely execute function with try-catch
 * @param {Function} fn - Function to execute
 * @param {*} fallback - Fallback value if error occurs
 * @returns {*} Function result or fallback
 */
export function safeExecute(fn, fallback = null) {
  try {
    return fn();
  } catch (error) {
    logError('safeExecute error:', error);
    return fallback;
  }
}

/**
 * Download text content as file
 * @param {string} content - Text content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type (default: 'text/plain')
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
