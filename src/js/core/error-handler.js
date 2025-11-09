/**
 * Advanced Error Handler for Portfolio Manager
 * Version: 1.0.0
 * Features: Global error catching, graceful degradation, error logging, recovery mechanisms
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.errorCountThreshold = 200; // Zvýšeno z 50 na 200 pro startup
    this.timeWindow = 10000; // 10 sekund místo 1 minuty
    this.recentErrors = [];
    this.lastErrorTime = 0;
    this.errorDebounceMs = 100; // Debounce pro duplikátní chyby

    this.init();
  }

  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      // Ignore Chart.js source map errors (non-critical)
      if (event.message && event.message.includes('chart.js') && event.message.includes('.map')) {
        return;
      }

      this.handleError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        type: 'javascript',
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        type: 'promise',
      });
    });

    // Console error override for logging
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.handleError({
        message: args.join(' '),
        type: 'console',
        stack: new Error().stack,
      });
      originalConsoleError.apply(console, args);
    };

    console.log('✅ Error Handler initialized');
  }

  handleError(errorInfo) {
    // Debounce duplicate errors
    const now = Date.now();
    if (now - this.lastErrorTime < this.errorDebounceMs) {
      return; // Skip if error came too quickly (likely duplicate)
    }
    this.lastErrorTime = now;

    const errorEntry = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      id: this.generateErrorId(),
    };

    // Add to errors array
    this.errors.push(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Track recent errors for rate limiting
    this.recentErrors.push(now);
    this.recentErrors = this.recentErrors.filter((time) => now - time < this.timeWindow);

    // Log to localStorage (but not too frequently)
    if (this.recentErrors.length % 10 === 0) {
      this.logToStorage(errorEntry);
    }

    // Check if we should show error to user
    if (this.shouldNotifyUser(errorInfo)) {
      this.showErrorToUser(errorEntry);
    }

    // Check for error storm
    if (this.recentErrors.length > this.errorCountThreshold) {
      this.handleErrorStorm();
    }

    // Send to analytics (if configured) - but not for every error
    if (this.recentErrors.length % 5 === 0) {
      this.sendToAnalytics(errorEntry);
    }

    // Only log every 5th error to console to reduce overhead
    if (this.recentErrors.length % 5 === 0) {
      console.error('🔴 Error caught:', errorEntry);
    }
  }

  generateErrorId() {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  shouldNotifyUser(errorInfo) {
    // Don't spam user with too many errors
    if (this.recentErrors.length > 5) {
      return false;
    }

    // Critical errors should always be shown
    const criticalKeywords = ['cannot read', 'undefined', 'null', 'network', 'fetch'];
    return criticalKeywords.some((keyword) => errorInfo.message?.toLowerCase().includes(keyword));
  }

  showErrorToUser(errorEntry) {
    // Use toast notification if available
    if (typeof showToast === 'function') {
      showToast('error', 'Chyba aplikace', this.getUserFriendlyMessage(errorEntry.message), 5000);
    } else {
      // Fallback to custom error UI
      this.showErrorUI(errorEntry);
    }
  }

  showErrorUI(errorEntry) {
    const existingError = document.getElementById('error-notification');
    if (existingError) {
      return;
    } // Don't show multiple

    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-notification';
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
            z-index: 100000;
            animation: slideInRight 0.3s ease-out;
        `;

    errorDiv.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="font-size: 24px;">⚠️</div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 1rem; margin-bottom: 8px;">
                        Došlo k chybě
                    </div>
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 12px;">
                        ${this.getUserFriendlyMessage(errorEntry.message)}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="error-recover-btn" 
                                style="flex: 1; padding: 8px 12px; background: rgba(255,255,255,0.2); 
                                       border: 1px solid rgba(255,255,255,0.3); color: white; 
                                       border-radius: 6px; cursor: pointer; font-size: 0.813rem;">
                            🔄 Zkusit znovu
                        </button>
                        <button class="error-dismiss-btn" 
                                style="padding: 8px 12px; background: rgba(255,255,255,0.1); 
                                       border: 1px solid rgba(255,255,255,0.2); color: white; 
                                       border-radius: 6px; cursor: pointer; font-size: 0.813rem;">
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(errorDiv);

    // Add event listeners (secure - no inline handlers)
    const recoverBtn = errorDiv.querySelector('.error-recover-btn');
    const dismissBtn = errorDiv.querySelector('.error-dismiss-btn');
    if (recoverBtn) {
      recoverBtn.addEventListener('click', () => window.errorHandler.tryRecover());
    }
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => errorDiv.remove());
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => errorDiv.remove(), 300);
      }
    }, 10000);
  }

  getUserFriendlyMessage(technicalMessage) {
    const messageMap = {
      'cannot read': 'Nepodařilo se načíst data. Zkuste obnovit stránku.',
      undefined: 'Některá data chybí. Zkontrolujte své portfolio.',
      network: 'Problém s připojením k internetu.',
      'fetch failed': 'Nepodařilo se načíst data ze serveru.',
      'quota exceeded': 'Došlo místo v úložišti. Smažte stará data.',
      'script error': 'Chyba při načítání skriptu. Zkuste obnovit stránku.',
      default: 'Něco se pokazilo. Zkuste obnovit stránku nebo kontaktujte podporu.',
    };

    for (const [key, message] of Object.entries(messageMap)) {
      if (technicalMessage?.toLowerCase().includes(key)) {
        return message;
      }
    }

    return messageMap.default;
  }

  handleErrorStorm() {
    console.warn('🌩️ Error storm detected! Too many errors in short time.');

    // Clear recent errors to stop spam
    this.recentErrors = [];

    // Show critical error message
    const stormDiv = document.createElement('div');
    stormDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            flex-direction: column;
            gap: 20px;
            padding: 40px;
            text-align: center;
        `;

    stormDiv.innerHTML = `
            <div style="font-size: 64px;">⚠️</div>
            <h1 style="font-size: 2rem; margin: 0;">Kritická chyba aplikace</h1>
            <p style="font-size: 1rem; opacity: 0.8; max-width: 500px;">
                Aplikace narazila na několik chyb. Pro zabránění dalším problémům 
                doporučujeme obnovit stránku.
            </p>
            <div style="display: flex; gap: 12px;">
                <button class="reload-btn"
                        style="padding: 12px 24px; background: #dc2626; color: white; 
                               border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                    🔄 Obnovit stránku
                </button>
                <button class="clear-reload-btn"
                        style="padding: 12px 24px; background: #991b1b; color: white; 
                               border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                    🗑️ Vymazat data a obnovit
                </button>
            </div>
            <details style="margin-top: 20px; max-width: 600px; text-align: left;">
                <summary style="cursor: pointer; opacity: 0.6;">Technické detaily</summary>
                <pre style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 4px;
                    font-size: 0.75rem; overflow: auto; max-height: 200px; margin-top: 10px;">
                  ${this.errors
    .slice(-5)
    .map((e) => `${e.timestamp}: ${e.message}`)
    .join('\n')}
                </pre>
            </details>
        `;

    document.body.appendChild(stormDiv);

    // Add event listeners
    const reloadBtn = stormDiv.querySelector('.reload-btn');
    const clearReloadBtn = stormDiv.querySelector('.clear-reload-btn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => window.location.reload());
    }
    if (clearReloadBtn) {
      clearReloadBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.reload();
      });
    }
  }

  tryRecover() {
    console.log('🔄 Attempting to recover from error...');

    // Remove error notification
    const notification = document.getElementById('error-notification');
    if (notification) {
      notification.remove();
    }

    // Try to reload data
    // eslint-disable-next-line no-undef
    if (typeof storage !== 'undefined' && storage.loadData) {
      try {
        const data = storage.loadData();

        if (typeof portfolioData !== 'undefined') {
          portfolioData.length = 0;
          portfolioData.push(...data);
        }

        if (typeof updateFondTable === 'function') {
          updateFondTable();
        }

        if (typeof updateDashboard === 'function') {
          updateDashboard();
        }

        if (typeof showToast === 'function') {
          showToast('success', 'Obnoveno', 'Data byla úspěšně obnovena');
        }

        console.log('✅ Recovery successful');
      } catch (error) {
        console.error('❌ Recovery failed:', error);
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  }

  logToStorage(errorEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      logs.push(errorEntry);

      // Keep only last 100 errors
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to log error to storage:', e);
    }
  }

  sendToAnalytics(errorEntry) {
    // Placeholder for analytics integration
    // You can integrate with Google Analytics, Sentry, etc.

    if (window.gtag) {
      // eslint-disable-next-line no-undef
      gtag('event', 'exception', {
        description: errorEntry.message,
        fatal: false,
      });
    }
  }

  getErrorReport() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.recentErrors.length,
      errors: this.errors,
      timestamp: new Date().toISOString(),
    };
  }

  clearErrors() {
    this.errors = [];
    this.recentErrors = [];
    localStorage.removeItem('errorLogs');
    console.log('✅ Error logs cleared');
  }

  exportErrors() {
    const report = this.getErrorReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Error report exported');
  }
}

// Safe async wrapper with error handling
// eslint-disable-next-line no-unused-vars
function safeAsync(fn, errorMessage = 'Operation failed') {
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      console.error(errorMessage, error);
      if (window.errorHandler) {
        window.errorHandler.handleError({
          message: `${errorMessage}: ${error.message}`,
          error: error,
          type: 'async',
        });
      }
      throw error;
    }
  };
}

// Safe sync wrapper with error handling
// eslint-disable-next-line no-unused-vars
function safeSyncFunction(fn, errorMessage = 'Operation failed') {
  return function (...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.error(errorMessage, error);
      if (window.errorHandler) {
        window.errorHandler.handleError({
          message: `${errorMessage}: ${error.message}`,
          error: error,
          type: 'sync',
        });
      }
      return null;
    }
  };
}

// Initialize error handler globally
window.errorHandler = new ErrorHandler();

// Add animation for error notifications
const errorHandlerStyle = document.createElement('style');
errorHandlerStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(errorHandlerStyle);

console.log('✅ Error Handler module loaded');
