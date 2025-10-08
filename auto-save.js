/**
 * Smart Auto-save Manager
 * Features: Debounced auto-save, offline queue, conflict resolution, version control
 */

class SmartAutoSaveManager {
  constructor() {
    this.saveDelay = 3000; // 3 seconds debounce
    this.saveTimeout = null;
    this.isSaving = false;
    this.isDirty = false;
    this.lastSavedData = null;
    this.lastSavedTime = null;
    this.offlineQueue = [];
    this.conflictResolver = null;
    this.onSaveCallback = null;
    this.onErrorCallback = null;
    this.saveHistory = [];
    this.maxHistorySize = 20;
    this.enabled = true;

    this.init();
  }

  /**
   * Initialize smart auto-save
   */
  init() {
    this.loadOfflineQueue();
    this.loadLastSavedData();
    this.setupOnlineListener();
    this.setupUnloadListener();
    console.log('✅ Smart Auto-save Manager initialized');
  }

  /**
   * Enable auto-save
   */
  enable() {
    this.enabled = true;
    console.log('✅ Auto-save enabled');
  }

  /**
   * Disable auto-save
   */
  disable() {
    this.enabled = false;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    console.log('❌ Auto-save disabled');
  }

  /**
   * Mark data as dirty and trigger debounced save
   * @param {Object} data - Data to save
   */
  markDirty(data) {
    if (!this.enabled) {
      return;
    }

    this.isDirty = true;

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout for debounced save
    this.saveTimeout = setTimeout(() => {
      this.save(data);
    }, this.saveDelay);

    console.log('⏳ Save scheduled in', this.saveDelay / 1000, 'seconds');
  }

  /**
   * Perform save operation
   * @param {Object} data - Data to save
   * @returns {Promise<boolean>} - Save success
   */
  async save(data) {
    if (this.isSaving) {
      console.log('⏳ Save already in progress, queuing...');
      return false;
    }

    this.isSaving = true;

    try {
      // Check for conflicts
      const hasConflict = await this.checkForConflicts(data);
      if (hasConflict) {
        const resolved = await this.resolveConflict(data);
        if (!resolved) {
          console.log('❌ Conflict not resolved, save cancelled');
          return false;
        }
      }

      // Check online status
      if (!navigator.onLine) {
        console.log('📵 Offline - adding to queue');
        this.addToOfflineQueue(data);
        this.updateSaveIndicator('offline');
        return false;
      }

      // Perform save
      const success = await this.performSave(data);

      if (success) {
        this.isDirty = false;
        this.lastSavedData = JSON.parse(JSON.stringify(data)); // Deep clone
        this.lastSavedTime = new Date().toISOString();
        this.addToSaveHistory(data);
        this.updateSaveIndicator('success');

        if (this.onSaveCallback) {
          this.onSaveCallback(data);
        }

        console.log('✅ Save successful');
        return true;
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      this.updateSaveIndicator('error');

      // Add to offline queue as fallback
      this.addToOfflineQueue(data);

      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }

      return false;
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Force immediate save
   * @param {Object} data - Data to save
   * @returns {Promise<boolean>} - Save success
   */
  async forceSave(data) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    return await this.save(data);
  }

  /**
   * Perform actual save operation
   * @param {Object} data - Data to save
   * @returns {Promise<boolean>} - Save success
   */
  async performSave(data) {
    try {
      // Use localStorage as primary storage
      localStorage.setItem('portfolio_data', JSON.stringify(data));

      // Also save to IndexedDB for larger data
      if (window.indexedDB) {
        await this.saveToIndexedDB(data);
      }

      return true;
    } catch (error) {
      console.error('Save operation failed:', error);
      throw error;
    }
  }

  /**
   * Save to IndexedDB
   * @param {Object} data - Data to save
   * @returns {Promise<void>}
   */
  saveToIndexedDB(data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PortfolioManagerDB', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['portfolios'], 'readwrite');
        const store = transaction.objectStore('portfolios');

        const saveRequest = store.put({
          id: 'current',
          data: data,
          timestamp: new Date().toISOString(),
        });

        saveRequest.onsuccess = () => resolve();
        saveRequest.onerror = () => reject(saveRequest.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('portfolios')) {
          db.createObjectStore('portfolios', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Load from IndexedDB
   * @returns {Promise<Object|null>} - Loaded data
   */
  loadFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PortfolioManagerDB', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['portfolios'], 'readonly');
        const store = transaction.objectStore('portfolios');
        const getRequest = store.get('current');

        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };

        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('portfolios')) {
          db.createObjectStore('portfolios', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Check for conflicts with last saved version
   * @param {Object} currentData - Current data
   * @returns {Promise<boolean>} - Has conflict
   */
  async checkForConflicts(currentData) {
    if (!this.lastSavedData) {
      return false;
    }

    try {
      // Load latest data from storage
      const latestData = JSON.parse(localStorage.getItem('portfolio_data') || 'null');
      if (!latestData) {
        return false;
      }

      // Compare timestamps or data content
      const currentHash = this.hashData(currentData);
      const savedHash = this.hashData(this.lastSavedData);
      const latestHash = this.hashData(latestData);

      // Conflict if saved version differs from both current and last known
      const hasConflict = savedHash !== latestHash && currentHash !== latestHash;

      if (hasConflict) {
        console.warn('⚠️ Conflict detected: data was modified externally');
      }

      return hasConflict;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return false;
    }
  }

  /**
   * Resolve conflict between versions
   * @param {Object} currentData - Current data
   * @returns {Promise<boolean>} - Resolution success
   */
  async resolveConflict(currentData) {
    try {
      const savedData = JSON.parse(localStorage.getItem('portfolio_data') || 'null');

      if (this.conflictResolver) {
        // Use custom resolver
        return await this.conflictResolver(currentData, savedData, this.lastSavedData);
      }

      // Default: Prompt user
      const choice = confirm(
        'Data byla změněna externě. Chcete přepsat uložená data?\n\n' +
          'OK = Použít aktuální verzi\n' +
          'Cancel = Ponechat uloženou verzi',
      );

      if (!choice) {
        // User chose to keep saved version - reload it
        if (typeof window.renderTable === 'function' && savedData) {
          window.renderTable(savedData);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }

  /**
   * Simple hash function for data comparison
   * @param {Object} data - Data to hash
   * @returns {string} - Hash string
   */
  hashData(data) {
    return JSON.stringify(data)
      .split('')
      .reduce((hash, char) => {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        return hash & hash;
      }, 0)
      .toString(36);
  }

  /**
   * Add data to offline queue
   * @param {Object} data - Data to queue
   */
  addToOfflineQueue(data) {
    this.offlineQueue.push({
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      timestamp: new Date().toISOString(),
    });

    this.persistOfflineQueue();
    console.log('📦 Added to offline queue. Queue size:', this.offlineQueue.length);
  }

  /**
   * Process offline queue when online
   * @returns {Promise<number>} - Number of items processed
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) {
      console.log('ℹ️ Offline queue is empty');
      return 0;
    }

    console.log('🔄 Processing offline queue:', this.offlineQueue.length, 'items');

    let processed = 0;

    while (this.offlineQueue.length > 0) {
      const item = this.offlineQueue[0];

      try {
        const success = await this.performSave(item.data);
        if (success) {
          this.offlineQueue.shift(); // Remove from queue
          processed++;
          console.log('✅ Processed offline item:', processed);
        } else {
          console.log('❌ Failed to process offline item, stopping');
          break;
        }
      } catch (error) {
        console.error('Error processing offline item:', error);
        break;
      }
    }

    this.persistOfflineQueue();
    console.log('✅ Offline queue processed:', processed, 'items');

    return processed;
  }

  /**
   * Add save to history
   * @param {Object} data - Saved data
   */
  addToSaveHistory(data) {
    this.saveHistory.unshift({
      data: JSON.parse(JSON.stringify(data)),
      timestamp: new Date().toISOString(),
      hash: this.hashData(data),
    });

    // Limit history size
    if (this.saveHistory.length > this.maxHistorySize) {
      this.saveHistory = this.saveHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get save history
   * @returns {Array} - Save history
   */
  getSaveHistory() {
    return this.saveHistory.map((h) => ({
      timestamp: h.timestamp,
      hash: h.hash,
    }));
  }

  /**
   * Restore from history
   * @param {number} index - History index
   * @returns {Object|null} - Restored data
   */
  restoreFromHistory(index) {
    if (index >= 0 && index < this.saveHistory.length) {
      return JSON.parse(JSON.stringify(this.saveHistory[index].data));
    }
    return null;
  }

  /**
   * Update save indicator UI
   * @param {string} status - Status: 'success', 'error', 'offline', 'saving'
   */
  updateSaveIndicator(status) {
    const indicator = document.getElementById('lastSaveIndicator');
    const timeEl = document.getElementById('lastSaveTime');

    if (!indicator || !timeEl) {
      return;
    }

    indicator.style.opacity = '1';

    switch (status) {
      case 'success':
        timeEl.textContent = `Uloženo ${new Date().toLocaleTimeString('cs-CZ')}`;
        indicator.style.color = '#4caf50';
        break;
      case 'error':
        timeEl.textContent = 'Chyba uložení';
        indicator.style.color = '#f44336';
        break;
      case 'offline':
        timeEl.textContent = 'Offline - zařazeno do fronty';
        indicator.style.color = '#ff9800';
        break;
      case 'saving':
        timeEl.textContent = 'Ukládám...';
        indicator.style.color = '#2196f3';
        break;
    }

    // Fade out after 3 seconds (except for error/offline)
    if (status === 'success') {
      setTimeout(() => {
        indicator.style.opacity = '0';
      }, 3000);
    }
  }

  /**
   * Setup online event listener
   */
  setupOnlineListener() {
    window.addEventListener('online', async () => {
      console.log('🌐 Back online - processing offline queue');
      const processed = await this.processOfflineQueue();

      if (processed > 0 && typeof showToast === 'function') {
        showToast('success', 'Synchronizace', `Synchronizováno ${processed} změn`);
      }
    });
  }

  /**
   * Setup beforeunload listener to warn about unsaved changes
   */
  setupUnloadListener() {
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return 'Máte neuložené změny. Opravdu chcete opustit stránku?';
      }
    });
  }

  /**
   * Load offline queue from storage
   */
  loadOfflineQueue() {
    try {
      const stored = localStorage.getItem('auto_save_offline_queue');
      this.offlineQueue = stored ? JSON.parse(stored) : [];

      if (this.offlineQueue.length > 0) {
        console.log('📦 Loaded offline queue:', this.offlineQueue.length, 'items');
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * Persist offline queue to storage
   */
  persistOfflineQueue() {
    try {
      localStorage.setItem('auto_save_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }

  /**
   * Load last saved data
   */
  loadLastSavedData() {
    try {
      const stored = localStorage.getItem('portfolio_data');
      this.lastSavedData = stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load last saved data:', error);
    }
  }

  /**
   * Set custom conflict resolver
   * @param {Function} resolver - Custom resolver function
   */
  setConflictResolver(resolver) {
    this.conflictResolver = resolver;
  }

  /**
   * Set save callback
   * @param {Function} callback - Callback function
   */
  onSave(callback) {
    this.onSaveCallback = callback;
  }

  /**
   * Set error callback
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Get statistics
   * @returns {Object} - Save statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      isDirty: this.isDirty,
      isSaving: this.isSaving,
      lastSavedTime: this.lastSavedTime,
      offlineQueueSize: this.offlineQueue.length,
      saveHistorySize: this.saveHistory.length,
      saveDelay: this.saveDelay,
    };
  }
}

// Global instance
window.smartAutoSaveManager = new SmartAutoSaveManager();

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmartAutoSave);
} else {
  initSmartAutoSave();
}

function initSmartAutoSave() {
  console.log('✅ Smart Auto-save initialized');

  // Process offline queue if online
  if (navigator.onLine) {
    window.smartAutoSaveManager.processOfflineQueue();
  }

  // Add global save trigger helper
  window.triggerAutoSave = function (data) {
    window.smartAutoSaveManager.markDirty(data);
  };

  window.forceSave = async function (data) {
    return await window.smartAutoSaveManager.forceSave(data);
  };
}
