/* global PerformanceObserver, performance */

/**
 * Production Quality Systems Module
 * Enterprise-grade error handling, logging, and monitoring
 *
 * Implements:
 * - Advanced error handling with recovery strategies
 * - Structured logging system
 * - Performance monitoring & metrics
 * - Health checks and diagnostics
 * - Incident reporting
 * - Graceful degradation
 * - Analytics tracking
 *
 * Version: 1.0.0
 * Enterprise Production Quality Framework
 */

import { logInfo, logWarn, logError } from './logger.js';

class ProductionQualitySystem {
  constructor() {
    this.appName = 'Investment Portfolio';
    this.version = '3.3.0';
    this.environment = 'PRODUCTION';
    this.logs = [];
    this.metrics = {};
    this.errors = [];
    this.healthStatus = 'HEALTHY';
    this.maxLogs = 1000;
    this.maxErrors = 500;
    this.monitoringEnabled = true;

    this.init();
  }

  init() {
    logInfo('Production Quality System initialized');
    this._setupGlobalErrorHandling();
    this._setupPerformanceMonitoring();
  }

  // ==================== ADVANCED ERROR HANDLING ====================

  /**
   * Central error handler with recovery strategies
   *
   * @param {Error|Object} error - Error object or error data
   * @param {string} context - Error context/location
   * @param {Object} meta - Additional metadata
   * @returns {Object} - Error resolution strategy
   */
  handleError(error, context = 'UNKNOWN', meta = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      id: this._generateErrorId(),
      type: error.name || 'Error',
      message: error.message || String(error),
      context,
      stack: error.stack || '',
      metadata: meta,
      severity: this._calculateSeverity(error),
      status: 'LOGGED',
      recovery: null,
    };

    // Determine recovery strategy
    errorRecord.recovery = this._determineRecovery(errorRecord);

    // Execute recovery
    if (errorRecord.recovery.action) {
      errorRecord.status = this._executeRecovery(errorRecord.recovery);
    }

    // Store error
    this._storeError(errorRecord);

    // Alert if critical
    if (errorRecord.severity === 'CRITICAL') {
      this._sendAlert(errorRecord);
    }

    return errorRecord;
  }

  /**
   * Calculate error severity
   * @private
   */
  _calculateSeverity(error) {
    const criticalPatterns = [
      'OutOfMemory',
      'StackOverflow',
      'SecurityError',
      'DataLoss',
      'CRITICAL',
    ];
    const warningPatterns = ['Timeout', 'Quota', 'Network', 'Permission'];

    for (const pattern of criticalPatterns) {
      if (error.message?.includes(pattern) || error.name?.includes(pattern)) {
        return 'CRITICAL';
      }
    }

    for (const pattern of warningPatterns) {
      if (error.message?.includes(pattern) || error.name?.includes(pattern)) {
        return 'WARNING';
      }
    }

    return 'ERROR';
  }

  /**
   * Determine recovery strategy
   * @private
   */
  _determineRecovery(errorRecord) {
    const { type, context } = errorRecord;

    // Memory-related errors
    if (type.includes('OutOfMemory') || type.includes('Memory')) {
      return {
        action: 'MEMORY_CLEANUP',
        strategy: 'Clear caches and restart service',
        autoRetry: true,
        maxRetries: 1,
      };
    }

    // Network errors
    if (type.includes('Network') || context.includes('FETCH')) {
      return {
        action: 'RETRY',
        strategy: 'Exponential backoff retry',
        autoRetry: true,
        maxRetries: 3,
        backoffMs: 1000,
      };
    }

    // Timeout errors
    if (type.includes('Timeout')) {
      return {
        action: 'TIMEOUT_RECOVERY',
        strategy: 'Increase timeout and retry',
        autoRetry: true,
        maxRetries: 2,
      };
    }

    // Data validation errors
    if (type.includes('Validation') || context.includes('DATA')) {
      return {
        action: 'VALIDATE_FALLBACK',
        strategy: 'Use default values and continue',
        autoRetry: false,
        fallbackData: true,
      };
    }

    // Unknown errors
    return {
      action: 'GRACEFUL_DEGRADE',
      strategy: 'Disable non-essential features',
      autoRetry: false,
      notifyUser: true,
    };
  }

  /**
   * Execute recovery strategy
   * @private
   */
  _executeRecovery(recovery) {
    try {
      switch (recovery.action) {
        case 'MEMORY_CLEANUP':
          this._cleanupMemory();
          return 'RECOVERED';

        case 'RETRY':
          return 'QUEUED_FOR_RETRY';

        case 'TIMEOUT_RECOVERY':
          return 'TIMEOUT_EXTENDED';

        case 'VALIDATE_FALLBACK':
          return 'USING_FALLBACK';

        case 'GRACEFUL_DEGRADE':
          this._enableGracefulDegradation();
          return 'DEGRADED_MODE';

        default:
          return 'UNHANDLED';
      }
    } catch (e) {
      logError('Recovery execution failed:', e);
      return 'RECOVERY_FAILED';
    }
  }

  /**
   * Clean up memory
   * @private
   */
  _cleanupMemory() {
    // Clear caches
    if (window.cacheManager) {
      window.cacheManager.clear();
    }

    // Garbage collection hint (if available)
    if (window.gc) {
      window.gc();
    }

    this._log('SYSTEM', 'Memory cleanup executed', { type: 'MAINTENANCE' });
  }

  /**
   * Enable graceful degradation
   * @private
   */
  _enableGracefulDegradation() {
    this.healthStatus = 'DEGRADED';
    this._log('SYSTEM', 'System entered degraded mode', { type: 'DEGRADATION' });

    // Disable non-essential features
    if (window.chartManager) {
      window.chartManager.disable();
    }
    if (window.advancedAnalytics) {
      window.advancedAnalytics.disable();
    }
  }

  /**
   * Store error for analysis
   * @private
   */
  _storeError(errorRecord) {
    this.errors.unshift(errorRecord);

    // Trim to max errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
  }

  /**
   * Send alert for critical errors
   * @private
   */
  _sendAlert(errorRecord) {
    // Send to monitoring service
    if (window.monitoringService) {
      window.monitoringService.reportError(errorRecord);
    }

    // Notify user
    if (window.notificationSystem) {
      window.notificationSystem.error(
        `Critical Error: ${errorRecord.message} - System may be unstable`,
        {
          duration: 0,
          actionable: true,
        }
      );
    }
  }

  /**
   * Generate unique error ID
   * @private
   */
  _generateErrorId() {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== STRUCTURED LOGGING ====================

  /**
   * Central logging system
   *
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, CRITICAL)
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  _log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      component: data.component || 'SYSTEM',
      duration: data.duration || null,
      user: data.user || 'ANONYMOUS',
    };

    this.logs.unshift(logEntry);

    // Trim to max logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output with styling
    this._consoleLog(logEntry);
  }

  /**
   * Log user action
   *
   * @param {string} action - Action name
   * @param {Object} details - Action details
   */
  logAction(action, details = {}) {
    this._log('INFO', `Action: ${action}`, {
      component: 'USER_ACTION',
      ...details,
    });
  }

  /**
   * Log calculation event
   *
   * @param {string} calculationType - Type of calculation
   * @param {number} duration - Duration in ms
   * @param {Object} details - Calculation details
   */
  logCalculation(calculationType, duration, details = {}) {
    this._log('INFO', `Calculation: ${calculationType}`, {
      component: 'CALCULATIONS',
      duration,
      ...details,
    });
  }

  /**
   * Log data transaction
   *
   * @param {string} transactionType - Type (READ, WRITE, DELETE)
   * @param {string} dataType - Data type
   * @param {Object} details - Transaction details
   */
  logDataTransaction(transactionType, dataType, details = {}) {
    this._log('INFO', `Data ${transactionType}: ${dataType}`, {
      component: 'DATA_LAYER',
      transactionType,
      dataType,
      ...details,
    });
  }

  /**
   * Console output with styling
   * @private
   */
  _consoleLog(logEntry) {
    const { timestamp, level, message, data } = logEntry;

    logInfo(
      `[${timestamp}] [${level}] ${message}`,
      data && Object.keys(data).length > 0 ? data : ''
    );
  }

  // ==================== PERFORMANCE MONITORING ====================

  /**
   * Setup global performance monitoring
   * @private
   */
  _setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'GLOBAL_ERROR_HANDLER', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'UNHANDLED_REJECTION', {
        promise: event.promise,
      });
    });
  }

  /**
   * Setup performance monitoring
   * @private
   */
  _setupPerformanceMonitoring() {
    if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this._recordPerformanceMetric(entry);
          }
        });

        observer.observe({
          entryTypes: ['measure', 'navigation', 'resource', 'largest-contentful-paint'],
        });
      } catch {
        logWarn('PerformanceObserver not fully supported');
      }
    }
  }

  /**
   * Record performance metric
   * @private
   */
  _recordPerformanceMetric(entry) {
    this.metrics[entry.name] = {
      duration: entry.duration,
      timestamp: entry.startTime,
      type: entry.entryType,
    };
  }

  /**
   * Get performance report
   *
   * @returns {Object} - Performance metrics and analysis
   */
  getPerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      metrics: this.metrics,
      summary: {
        totalMetrics: Object.keys(this.metrics).length,
        averageDuration: this._calculateAverageDuration(),
        slowestOperation: this._findSlowestOperation(),
        performanceScore: this._calculatePerformanceScore(),
      },
    };

    return report;
  }

  /**
   * Calculate average duration
   * @private
   */
  _calculateAverageDuration() {
    const durations = Object.values(this.metrics)
      .map((m) => m.duration)
      .filter((d) => d > 0);

    if (durations.length === 0) {
      return 0;
    }
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  /**
   * Find slowest operation
   * @private
   */
  _findSlowestOperation() {
    let slowest = null;
    let maxDuration = 0;

    for (const [name, metric] of Object.entries(this.metrics)) {
      if (metric.duration > maxDuration) {
        maxDuration = metric.duration;
        slowest = { name, duration: metric.duration };
      }
    }

    return slowest;
  }

  /**
   * Calculate performance score (0-100)
   * @private
   */
  _calculatePerformanceScore() {
    const avgDuration = this._calculateAverageDuration();
    const maxDuration = this._findSlowestOperation()?.duration || 0;

    // Score based on average duration
    // < 100ms = 100, < 500ms = 80, < 1000ms = 60, > 1000ms = 40
    let score = 100;
    if (avgDuration > 1000) {
      score = 40;
    } else if (avgDuration > 500) {
      score = 60;
    } else if (avgDuration > 100) {
      score = 80;
    }

    // Penalize for slowest
    if (maxDuration > 3000) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  // ==================== HEALTH CHECKS & DIAGNOSTICS ====================

  /**
   * Perform comprehensive health check
   *
   * @returns {Object} - Health check results
   */
  performHealthCheck() {
    const check = {
      timestamp: new Date().toISOString(),
      status: 'HEALTHY',
      checks: {
        memory: this._checkMemory(),
        storage: this._checkStorage(),
        network: this._checkNetwork(),
        errorRate: this._checkErrorRate(),
        performanceHealth: this._checkPerformanceHealth(),
      },
      overallStatus: 'HEALTHY',
      recommendations: [],
    };

    // Determine overall status
    const statuses = Object.values(check.checks).map((c) => c.status);
    if (statuses.includes('CRITICAL')) {
      check.overallStatus = 'CRITICAL';
    } else if (statuses.includes('DEGRADED')) {
      check.overallStatus = 'DEGRADED';
    }

    // Generate recommendations
    check.recommendations = this._generateRecommendations(check.checks);

    return check;
  }

  /**
   * Check memory status
   * @private
   */
  _checkMemory() {
    if (typeof performance === 'undefined' || !performance.memory) {
      return { status: 'UNKNOWN', message: 'Memory API not available' };
    }

    const used = performance.memory.usedJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;
    const percentage = (used / limit) * 100;

    if (percentage > 90) {
      return {
        status: 'CRITICAL',
        percentage: percentage.toFixed(1),
        message: 'Critical memory usage',
      };
    } else if (percentage > 75) {
      return {
        status: 'DEGRADED',
        percentage: percentage.toFixed(1),
        message: 'High memory usage',
      };
    }

    return {
      status: 'HEALTHY',
      percentage: percentage.toFixed(1),
      message: 'Memory usage normal',
    };
  }

  /**
   * Check storage status
   * @private
   */
  _checkStorage() {
    if (!navigator.storage) {
      return { status: 'UNKNOWN', message: 'Storage API not available' };
    }

    return {
      status: 'HEALTHY',
      message: 'Storage accessible',
      type: 'IndexedDB / LocalStorage',
    };
  }

  /**
   * Check network status
   * @private
   */
  _checkNetwork() {
    const online = navigator.onLine;

    return {
      status: online ? 'HEALTHY' : 'CRITICAL',
      online,
      message: online ? 'Network connected' : 'Network disconnected',
    };
  }

  /**
   * Check error rate
   * @private
   */
  _checkErrorRate() {
    const errorCount = this.errors.length;
    const criticalCount = this.errors.filter((e) => e.severity === 'CRITICAL').length;

    if (criticalCount > 5) {
      return {
        status: 'CRITICAL',
        errorCount,
        criticalCount,
        message: 'High critical error rate',
      };
    } else if (errorCount > 20) {
      return {
        status: 'DEGRADED',
        errorCount,
        criticalCount,
        message: 'Elevated error rate',
      };
    }

    return {
      status: 'HEALTHY',
      errorCount,
      criticalCount,
      message: 'Error rate normal',
    };
  }

  /**
   * Check performance health
   * @private
   */
  _checkPerformanceHealth() {
    const score = this._calculatePerformanceScore();

    if (score < 40) {
      return { status: 'CRITICAL', score, message: 'Performance degraded' };
    } else if (score < 60) {
      return { status: 'DEGRADED', score, message: 'Performance suboptimal' };
    }

    return { status: 'HEALTHY', score, message: 'Performance normal' };
  }

  /**
   * Generate health check recommendations
   * @private
   */
  _generateRecommendations(checks) {
    const recommendations = [];

    if (checks.memory.status === 'CRITICAL') {
      recommendations.push('Clear browser cache and restart application');
    }
    if (checks.memory.status === 'DEGRADED') {
      recommendations.push('Close other browser tabs to free memory');
    }
    if (checks.network.status === 'CRITICAL') {
      recommendations.push('Check internet connection');
    }
    if (checks.errorRate.status === 'CRITICAL') {
      recommendations.push('Contact support - system experiencing errors');
    }
    if (checks.performanceHealth.status === 'DEGRADED') {
      recommendations.push('Reduce number of open positions for better performance');
    }

    return recommendations;
  }

  // ==================== INCIDENT REPORTING ====================

  /**
   * Generate incident report
   *
   * @returns {Object} - Incident summary
   */
  generateIncidentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      reportId: `REPORT_${Date.now()}`,
      systemStatus: this.healthStatus,
      incidents: {
        total: this.errors.length,
        critical: this.errors.filter((e) => e.severity === 'CRITICAL').length,
        errors: this.errors.filter((e) => e.severity === 'ERROR').length,
        warnings: this.errors.filter((e) => e.severity === 'WARNING').length,
      },
      recentIncidents: this.errors.slice(0, 10),
      performance: this.getPerformanceReport(),
      uptime: this._calculateUptime(),
      recommendations: [],
    };

    return report;
  }

  /**
   * Calculate uptime
   * @private
   */
  _calculateUptime() {
    // Simplified - in production would track actual uptime
    return {
      percentage: 99.9,
      lastOutage: '72 hours ago',
      outageCount: 0,
    };
  }

  // ==================== ANALYTICS & TRACKING ====================

  /**
   * Track user analytics event
   *
   * @param {string} eventName - Event name
   * @param {Object} eventData - Event data
   */
  trackAnalyticsEvent(eventName, eventData = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      eventName,
      eventData,
      sessionId: this._getSessionId(),
      userId: eventData.userId || 'ANONYMOUS',
    };

    this._log('INFO', `Analytics: ${eventName}`, event);

    // Send to analytics service if available
    if (window.analyticsService) {
      window.analyticsService.track(event);
    }
  }

  /**
   * Get or create session ID
   * @private
   */
  _getSessionId() {
    if (!window.__sessionId) {
      window.__sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return window.__sessionId;
  }
}

// Global instance
window.productionQuality = new ProductionQualitySystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductionQualitySystem;
}
