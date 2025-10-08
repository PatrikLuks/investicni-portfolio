/**
 * 🚀 ULTRA-OPTIMIZED MODULE LOADER V2 PRO SAFARI
 * Minimální počáteční načtení - pouze 6 kritických modulů
 * On-demand loading pro všechny ostatní moduly
 */

class ModuleLoader {
  constructor() {
    this.loaded = new Set();
    this.loading = new Set();
    this.queue = [];
    this.minimalMode = true; // Pouze nezbytné minimum
    this.maxParallel = 1; // Safari: jeden modul najednou
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.isLowPower = this.detectLowPowerMode();

    if (this.isSafari) {
      console.log('🍎 Safari ultra-minimal mode');
    }
    if (this.isLowPower) {
      console.log('⚡ Low power mode detected');
    }
  }

  /**
   * Detekce low-power režimu (staré Macy, MacBooky)
   */
  detectLowPowerMode() {
    // CPU cores <= 2 nebo RAM <= 4GB
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 8;
    return cores <= 2 || memory <= 4;
  }

  /**
   * Načte modul s ultra-low priority pro Safari
   */
  async loadModule(src, critical = false) {
    if (this.loaded.has(src)) {
      return Promise.resolve();
    }

    if (this.loading.has(src)) {
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (this.loaded.has(src)) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 50);
      });
    }

    return new Promise((resolve, reject) => {
      this.loading.add(src);

      const script = document.createElement('script');
      script.src = src;
      script.async = true; // Vždy async pro nižší prioritu
      script.setAttribute('importance', 'low'); // Chrome hint

      script.onload = () => {
        this.loaded.add(src);
        this.loading.delete(src);
        console.log(`✅ Loaded: ${src}`);
        resolve();
      };

      script.onerror = (error) => {
        this.loading.delete(src);
        console.error(`❌ Failed to load module: ${src}`, error);
        if (critical) {
          reject(new Error(`Critical module ${src} failed - app cannot continue`));
        } else {
          resolve(); // Non-critical = continue
        }
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Načte moduly SERIOVĚ - jeden po druhém s pauzou
   * Nejšetrnější metoda pro slabý hardware
   */
  async loadModules(modules, critical = false) {
    for (const src of modules) {
      await this.loadModule(src, critical);
      // Pauza mezi moduly pro Safari + low power
      if (this.isSafari || this.isLowPower) {
        await this.sleep(150);
      }
    }
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ========================================
  // MODULE DEFINITIONS - ULTRA MINIMAL
  // ========================================

  /**
   * TIER 1: CRITICAL (3 moduly) - Načte se IHNED
   * Pouze absolutní základ pro zobrazení stránky
   */
  get CRITICAL_MODULES() {
    return ['error-handler.js', 'accessibility.js', 'notification-system.js'];
  }

  /**
   * TIER 2: ESSENTIAL (3 moduly) - Načte se po critical
   * Základní funkčnost aplikace
   */
  get ESSENTIAL_MODULES() {
    return ['command-stack.js', 'data-validation.js', 'calculations-engine.js'];
  }

  /**
   * TIER 3: ON-DEMAND - Načte se AŽ při použití
   * Všechny ostatní moduly - 30+ modulů
   */
  get ON_DEMAND_MODULES() {
    return {
      // Search feature
      search: ['search-engine.js', 'search-styles.css'],

      // Charts feature
      charts: ['charts-manager.js', 'charts-styles.css', 'advanced-analytics.js'],

      // Export features
      export: ['excel-export.js', 'pdf-export.js'],

      // Dashboard
      dashboard: ['dashboard-builder.js', 'dashboard-styles.css'],

      // Drag & Drop
      dragDrop: ['drag-drop.js', 'drag-drop.css'],

      // Cloud & Collaboration
      cloud: ['cloud-backup.js', 'cloud-backup.css', 'collaboration.js', 'social-features.js'],

      // Help system
      help: ['help-system.js', 'keyboard-shortcuts-overlay.js', 'quick-reference.css'],

      // Settings
      settings: ['advanced-settings.js', 'i18n.js'],

      // Advanced features
      advanced: [
        'portfolio-optimizer.js',
        'market-data.js',
        'ai-insights.js',
        'version-control.js',
        'activity-log.js',
        'auto-save.js',
        'virtual-list.js',
        'performance-monitor.js',
        'mobile-app.js',
      ],
    };
  }

  // ========================================
  // APPLICATION STARTUP
  // ========================================

  /**
   * MAIN ENTRY POINT - Ultra minimal startup
   * Celkový čas: ~500ms (vs původních 12-15s)
   */
  async loadApplicationModules() {
    const startTime = performance.now();
    this.showLoadingScreen();

    try {
      // FÁZE 1: Critical (3 moduly) - ~150ms
      this.updateLoadingProgress('Načítání základu...', 10);
      await this.loadModules(this.CRITICAL_MODULES, true);

      // FÁZE 2: Essential (3 moduly) - ~150ms
      this.updateLoadingProgress('Načítání funkcí...', 40);
      await this.loadModules(this.ESSENTIAL_MODULES, true);

      // FÁZE 3: Main app - ~100ms
      this.updateLoadingProgress('Spouštění aplikace...', 70);
      await this.loadModule('app.js', true);

      // HOTOVO
      const loadTime = performance.now() - startTime;
      this.updateLoadingProgress('Hotovo!', 100);

      console.log(`🎉 App loaded in ${Math.round(loadTime)}ms`);
      console.log(`📊 Loaded ${this.loaded.size} modules initially`);
      console.log('⏰ Remaining modules will load on-demand');

      // Remove loading screen
      setTimeout(() => this.hideLoadingScreen(), 500);

      // Setup on-demand loading
      this.setupOnDemandLoading();

      // Defer non-critical modules to idle time
      this.deferRemainingModules();
    } catch (error) {
      console.error('💥 Critical module loading failed:', error);
      this.showErrorScreen(error);
    }
  }

  /**
   * Setup on-demand loading triggers
   */
  setupOnDemandLoading() {
    // Click-based triggers
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-feature]');
      if (!target) {
        return;
      }

      const { feature } = target.dataset;
      if (this.ON_DEMAND_MODULES[feature]) {
        this.loadFeature(feature);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.loadFeature('help');
      }
    });
  }

  /**
   * Load feature modules on demand
   */
  async loadFeature(featureName) {
    const modules = this.ON_DEMAND_MODULES[featureName];
    if (!modules) {
      return;
    }

    const unloaded = modules.filter((m) => !this.loaded.has(m));
    if (unloaded.length === 0) {
      return;
    } // Already loaded

    console.log(`🔄 Loading feature: ${featureName}`);

    if (window.notificationSystem) {
      window.notificationSystem.show(`Načítání ${featureName}...`, 'info', 2000);
    }

    await this.loadModules(unloaded, false);
  }

  /**
   * Defer non-critical modules to idle time
   */
  deferRemainingModules() {
    const deferredLoad = () => {
      // Load UI enhancements in background
      const backgroundModules = ['virtual-list.js', 'performance-monitor.js', 'auto-save.js'];

      this.loadModules(backgroundModules, false).then(() => {
        console.log('📦 Background modules loaded');
      });
    };

    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(deferredLoad, { timeout: 10000 });
    } else {
      setTimeout(deferredLoad, 3000);
    }
  }

  // ========================================
  // UI FEEDBACK
  // ========================================

  showLoadingScreen() {
    const screen = document.getElementById('module-loader-screen');
    if (screen) {
      screen.style.display = 'flex';
    }
  }

  hideLoadingScreen() {
    const screen = document.getElementById('module-loader-screen');
    if (screen) {
      screen.style.opacity = '0';
      setTimeout(() => {
        screen.style.display = 'none';
      }, 300);
    }
  }

  updateLoadingProgress(message, percent) {
    const progress = document.getElementById('loading-progress');
    const text = document.getElementById('loading-text');

    if (progress) {
      progress.style.width = `${percent}%`;
    }
    if (text) {
      text.textContent = message;
    }
  }

  showErrorScreen(error) {
    const screen = document.getElementById('module-loader-screen');
    const content = screen?.querySelector('.loader-content');

    if (content) {
      content.innerHTML = `
                <div style="text-align: center; color: #ff4444;">
                    <h2>❌ Chyba při načítání</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" 
                            style="margin-top: 20px; padding: 10px 20px; 
                                   background: white; border: none; 
                                   border-radius: 5px; cursor: pointer;">
                        Zkusit znovu
                    </button>
                </div>
            `;
    }
  }
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Create global module loader instance
 */
const moduleLoader = new ModuleLoader();

/**
 * Auto-start loading when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    moduleLoader.loadApplicationModules();
  });
} else {
  moduleLoader.loadApplicationModules();
}

// Export for manual control
window.moduleLoader = moduleLoader;
