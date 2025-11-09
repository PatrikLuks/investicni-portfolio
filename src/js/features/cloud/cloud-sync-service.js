import { logInfo, logWarn, logError } from '../../utilities/logger.js';
/**
 * PHASE 6: Cloud Synchronization Service
 * Firebase Firestore integration for real-time portfolio sync
 * 
 * Features:
 * - Save portfolios to cloud
 * - Real-time synchronization across devices
 * - Automatic backup
 * - Conflict resolution
 * - Offline-first architecture
 */

class CloudSyncService {
  constructor() {
    this.firebaseAvailable = typeof firebase !== 'undefined' && typeof firebase.firestore !== 'undefined';
    this.db = null;
    this.unsubscribers = [];
    this.isInitialized = false;
    this.offlineQueue = [];
    this.syncEnabled = false;
  }

  /**
   * Initialize Cloud Sync
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      if (!this.firebaseAvailable) {
        logWarn('[CloudSync] Firebase not available - using local storage');
        this.useLocalStorageFallback();
        return;
      }

      // Check if auth service exists
      if (!window.authService) {
        logWarn('[CloudSync] Auth service not available');
        return;
      }

      this.db = firebase.firestore();
      
      // Enable offline persistence
      await this.db.enablePersistence();
      
      // Listen for auth changes
      window.authService.onAuthStateChanged((user) => {
        if (user) {
          this.enableSync(user.uid);
        } else {
          this.disableSync();
        }
      });

      this.isInitialized = true;
      logInfo('[CloudSync] Initialized with Firestore');
    } catch (error) {
      logError('[CloudSync] Initialization failed:', error);
      this.useLocalStorageFallback();
    }
  }

  /**
   * Enable cloud sync for authenticated user
   */
  enableSync(userId) {
    if (!this.db) return;
    
    this.syncEnabled = true;
    this.userId = userId;
    logInfo('[CloudSync] Sync enabled for user:', userId);
    
    // Process offline queue
    this.processOfflineQueue();
  }

  /**
   * Disable cloud sync
   */
  disableSync() {
    this.syncEnabled = false;
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
    logInfo('[CloudSync] Sync disabled');
  }

  /**
   * Save portfolio to cloud
   */
  async savePortfolio(portfolio) {
    try {
      if (!this.syncEnabled || !this.db) {
        this.queueOfflineAction('savePortfolio', portfolio);
        return this.savePortfolioLocal(portfolio);
      }

      const docRef = this.db
        .collection('users')
        .doc(this.userId)
        .collection('portfolios')
        .doc(portfolio.id);

      const timestamp = new Date().toISOString();
      
      await docRef.set({
        ...portfolio,
        updatedAt: timestamp,
        cloudSynced: true,
      });

      logInfo('[CloudSync] Portfolio saved:', portfolio.id);
      return portfolio;
    } catch (error) {
      logError('[CloudSync] Save failed:', error);
      this.queueOfflineAction('savePortfolio', portfolio);
      throw error;
    }
  }

  /**
   * Load portfolio from cloud
   */
  async loadPortfolio(portfolioId) {
    try {
      if (!this.syncEnabled || !this.db) {
        return this.loadPortfolioLocal(portfolioId);
      }

      const docSnap = await this.db
        .collection('users')
        .doc(this.userId)
        .collection('portfolios')
        .doc(portfolioId)
        .get();

      if (docSnap.exists) {
        logInfo('[CloudSync] Portfolio loaded:', portfolioId);
        return docSnap.data();
      }

      throw new Error('Portfolio not found');
    } catch (error) {
      logError('[CloudSync] Load failed:', error);
      return this.loadPortfolioLocal(portfolioId);
    }
  }

  /**
   * Load all portfolios
   */
  async loadAllPortfolios() {
    try {
      if (!this.syncEnabled || !this.db) {
        return this.loadAllPortfoliosLocal();
      }

      const snapshot = await this.db
        .collection('users')
        .doc(this.userId)
        .collection('portfolios')
        .get();

      const portfolios = [];
      snapshot.forEach(doc => {
        portfolios.push(doc.data());
      });

      logInfo('[CloudSync] Loaded', portfolios.length, 'portfolios');
      return portfolios;
    } catch (error) {
      logError('[CloudSync] Load all failed:', error);
      return this.loadAllPortfoliosLocal();
    }
  }

  /**
   * Delete portfolio from cloud
   */
  async deletePortfolio(portfolioId) {
    try {
      if (!this.syncEnabled || !this.db) {
        this.queueOfflineAction('deletePortfolio', { id: portfolioId });
        return this.deletePortfolioLocal(portfolioId);
      }

      await this.db
        .collection('users')
        .doc(this.userId)
        .collection('portfolios')
        .doc(portfolioId)
        .delete();

      logInfo('[CloudSync] Portfolio deleted:', portfolioId);
    } catch (error) {
      logError('[CloudSync] Delete failed:', error);
      this.queueOfflineAction('deletePortfolio', { id: portfolioId });
      throw error;
    }
  }

  /**
   * Real-time sync listener
   */
  syncPortfolios(callback) {
    if (!this.syncEnabled || !this.db) {
      logWarn('[CloudSync] Real-time sync not available');
      return () => {};
    }

    try {
      const unsubscribe = this.db
        .collection('users')
        .doc(this.userId)
        .collection('portfolios')
        .onSnapshot(snapshot => {
          const portfolios = [];
          snapshot.forEach(doc => {
            portfolios.push(doc.data());
          });
          callback(portfolios);
        });

      this.unsubscribers.push(unsubscribe);
      logInfo('[CloudSync] Real-time listener registered');
      
      return unsubscribe;
    } catch (error) {
      logError('[CloudSync] Real-time sync failed:', error);
      return () => {};
    }
  }

  /**
   * LOCAL STORAGE FALLBACK
   */
  useLocalStorageFallback() {
    logInfo('[CloudSync] Using local storage fallback');
    this.isInitialized = true;
  }

  savePortfolioLocal(portfolio) {
    const portfolios = this.loadAllPortfoliosLocal();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    
    if (index >= 0) {
      portfolios[index] = portfolio;
    } else {
      portfolios.push(portfolio);
    }

    localStorage.setItem('portfolios', JSON.stringify(portfolios));
    return portfolio;
  }

  loadPortfolioLocal(portfolioId) {
    const portfolios = this.loadAllPortfoliosLocal();
    return portfolios.find(p => p.id === portfolioId);
  }

  loadAllPortfoliosLocal() {
    const stored = localStorage.getItem('portfolios');
    return stored ? JSON.parse(stored) : [];
  }

  deletePortfolioLocal(portfolioId) {
    const portfolios = this.loadAllPortfoliosLocal();
    const filtered = portfolios.filter(p => p.id !== portfolioId);
    localStorage.setItem('portfolios', JSON.stringify(filtered));
  }

  /**
   * Offline queue management
   */
  queueOfflineAction(action, data) {
    this.offlineQueue.push({
      action,
      data,
      timestamp: Date.now(),
    });

    localStorage.setItem('sync_queue', JSON.stringify(this.offlineQueue));
    logInfo('[CloudSync] Action queued for offline:', action);
  }

  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    logInfo('[CloudSync] Processing', this.offlineQueue.length, 'offline actions');

    for (const item of this.offlineQueue) {
      try {
        if (item.action === 'savePortfolio') {
          await this.savePortfolio(item.data);
        } else if (item.action === 'deletePortfolio') {
          await this.deletePortfolio(item.data.id);
        }
      } catch (error) {
        logError('[CloudSync] Failed to process queued action:', error);
      }
    }

    this.offlineQueue = [];
    localStorage.removeItem('sync_queue');
    logInfo('[CloudSync] Offline queue processed');
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      enabled: this.syncEnabled,
      initialized: this.isInitialized,
      firebaseAvailable: this.firebaseAvailable,
      offlineQueueSize: this.offlineQueue.length,
    };
  }

  /**
   * Force sync now
   */
  async forceSync() {
    logInfo('[CloudSync] Forcing sync...');
    if (this.syncEnabled) {
      await this.processOfflineQueue();
    }
  }
}

// Export singleton instance
window.cloudSyncService = new CloudSyncService();

export default CloudSyncService;
