/**
 * DATA MANAGER MODULE
 * Handles data persistence, storage operations, and validation
 * @module data-manager
 */

/**
 * @typedef {Object} ClientInfo
 * @property {string} clientName - Client name
 * @property {string} advisorName - Advisor name
 * @property {string} advisorEmail - Advisor email
 */

/**
 * @typedef {Object} FundData
 * @property {string} name - Fund name
 * @property {string} producer - Fund producer/provider
 * @property {number} investment - Investment amount in CZK
 * @property {number} value - Current value in CZK
 * @property {string} investmentDate - Investment date (YYYY-MM-DD)
 */

/**
 * Portfolio Storage Manager
 * Handles localStorage operations for portfolio data
 * @class
 */
class PortfolioStorage {
  /**
   * Initialize storage with keys
   */
  constructor() {
    this.storageKey = 'portfolioData_v2';
    this.clientKey = 'portfolioClient_v2';
    this.lastSaveKey = 'portfolioLastSave_v2';
    this.autosaveInterval = null;
  }

  /**
   * Save portfolio data to localStorage
   * @param {FundData[]} data - Portfolio data array
   * @returns {boolean} Success status
   */
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      const now = new Date().toISOString();
      localStorage.setItem(this.lastSaveKey, now);
      this.updateLastSaveDisplay(now);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      // Note: showToast should be called from the module that imports this
      return false;
    }
  }

  /**
   * Load portfolio data from localStorage
   * @returns {FundData[]} Portfolio data array (empty if not found)
   */
  loadData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Load failed:', e);
      return [];
    }
  }

  /**
   * Save client information to localStorage
   * @param {ClientInfo} client - Client information object
   * @returns {boolean} Success status
   */
  saveClient(client) {
    try {
      localStorage.setItem(this.clientKey, JSON.stringify(client));
      return true;
    } catch (e) {
      console.error('Client save failed:', e);
      return false;
    }
  }

  /**
   * Load client information from localStorage
   * @returns {ClientInfo|null} Client info or null if not found
   */
  loadClient() {
    try {
      const client = localStorage.getItem(this.clientKey);
      return client ? JSON.parse(client) : null;
    } catch (e) {
      console.error('Client load failed:', e);
      return null;
    }
  }

  /**
   * Clear all stored data (portfolio, client, timestamps)
   * @returns {boolean} Success status
   */
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.clientKey);
      localStorage.removeItem(this.lastSaveKey);
      // Note: showToast should be called from the module that imports this
      return true;
    } catch (e) {
      console.error('Clear failed:', e);
      return false;
    }
  }

  /**
   * Start autosave interval
   * @param {Function} callback - Function to call on autosave trigger
   * @returns {void}
   */
  startAutosave(callback) {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
    this.autosaveInterval = setInterval(() => {
      if (callback) {
        callback();
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop autosave interval
   * @returns {void}
   */
  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  /**
   * Update last save time display in UI
   * @param {string} isoString - ISO date string
   * @returns {void}
   */
  updateLastSaveDisplay(isoString) {
    const date = new Date(isoString);
    const timeStr = date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const indicator = document.getElementById('lastSaveIndicator');
    const timeElement = document.getElementById('lastSaveTime');

    if (indicator && timeElement) {
      timeElement.textContent = `Uloženo ${timeStr}`;
      indicator.style.opacity = '1';
      indicator.style.animation = 'pulse 0.5s ease-in-out';
      setTimeout(() => {
        indicator.style.animation = '';
        indicator.style.opacity = '0.7';
      }, 2000);
    }
  }

  /**
   * Get last save timestamp from localStorage
   * @returns {Date|null} Last save date or null
   */
  getLastSaveTime() {
    const lastSave = localStorage.getItem(this.lastSaveKey);
    return lastSave ? new Date(lastSave) : null;
  }
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Parse value to number with fallback
 * @param {string|number} value - Value to parse
 * @param {number} [defaultValue=0] - Default fallback value
 * @returns {number} Parsed number or default
 */
function parseSafeNumber(value, defaultValue = 0) {
  // ES2024: nullish coalescing for null/undefined, explicit check for empty string
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed =
    typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate fund data fields
 * @param {Object} data - Fund data to validate
 * @param {string} data.name - Fund name
 * @param {string} data.producer - Fund producer/manager
 * @param {number|string} data.investment - Investment amount
 * @param {number|string} data.value - Current value
 * @returns {string[]} Array of error messages (empty if valid)
 */
function validateFundData(data) {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Název fondu je povinný');
  }

  if (!data.producer || data.producer.trim() === '') {
    errors.push('Správce je povinný');
  }

  const investment = parseSafeNumber(data.investment);
  if (investment <= 0) {
    errors.push('Investice musí být kladné číslo');
  }

  const value = parseSafeNumber(data.value);
  if (value < 0) {
    errors.push('Hodnota nemůže být záporná');
  }

  return errors;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create debounced function that delays execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export module
export { PortfolioStorage, parseSafeNumber, validateFundData, debounce };
