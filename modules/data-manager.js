/**
 * DATA MANAGER MODULE
 * Handles data persistence, storage operations, and validation
 */

// ==================== STORAGE & PERSISTENCE ====================
class PortfolioStorage {
  constructor() {
    this.storageKey = 'portfolioData_v2';
    this.clientKey = 'portfolioClient_v2';
    this.lastSaveKey = 'portfolioLastSave_v2';
    this.autosaveInterval = null;
  }

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

  loadData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Load failed:', e);
      return [];
    }
  }

  saveClient(client) {
    try {
      localStorage.setItem(this.clientKey, JSON.stringify(client));
      return true;
    } catch (e) {
      console.error('Client save failed:', e);
      return false;
    }
  }

  loadClient() {
    try {
      const client = localStorage.getItem(this.clientKey);
      return client ? JSON.parse(client) : null;
    } catch (e) {
      console.error('Client load failed:', e);
      return null;
    }
  }

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

  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

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

  getLastSaveTime() {
    const lastSave = localStorage.getItem(this.lastSaveKey);
    return lastSave ? new Date(lastSave) : null;
  }
}

// ==================== VALIDATION FUNCTIONS ====================
function parseSafeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed =
    typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

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
