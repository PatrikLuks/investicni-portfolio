/**
 * Analytics Integration Module - Phase 6
 * Integrates all analytics panels with portfolio data
 * @module analytics-integration
 */

import { RiskPanel } from '../analytics/risk-panel.js';
import { OptimizationPanel } from '../analytics/optimization-panel.js';
import { CompliancePanel } from '../analytics/compliance-panel.js';
import { TechnicalIndicatorsPanel } from '../analytics/technical-indicators-panel.js';
import { CorrelationHeatmapPanel } from '../analytics/correlation-heatmap-panel.js';
import { logInfo, logError } from '../../utilities/logger.js';

class AnalyticsIntegration {
  constructor() {
    this.panels = {};
    this.portfolio = null;
    this.init();
  }

  /**
   * Initialize all analytics panels
   */
  init() {
    try {
      // Check if analytics container exists
      const analyticsContainer = document.getElementById('analytics-container');
      if (!analyticsContainer) {
        logInfo('AnalyticsIntegration: No analytics container found');
        return;
      }

      // Initialize panels
      this.initializePanels();

      // Attach global listeners
      this.attachListeners();

      logInfo('AnalyticsIntegration: Initialized successfully');
    } catch (error) {
      logError('AnalyticsIntegration: Initialization error', error);
    }
  }

  /**
   * Initialize all panel instances
   */
  initializePanels() {
    try {
      this.panels.risk = new RiskPanel('risk-panel');
      this.panels.optimization = new OptimizationPanel('optimization-panel');
      this.panels.compliance = new CompliancePanel('compliance-panel');
      this.panels.technical = new TechnicalIndicatorsPanel('technical-indicators-panel');
      this.panels.heatmap = new CorrelationHeatmapPanel('correlation-heatmap-panel');

      logInfo('AnalyticsIntegration: All panels initialized');
    } catch (error) {
      logError('AnalyticsIntegration: Panel initialization error', error);
    }
  }

  /**
   * Attach global event listeners
   */
  attachListeners() {
    // Listen for portfolio updates
    window.addEventListener('portfolioUpdated', (e) => {
      if (e.detail) {
        this.updateAllPanels(e.detail);
      }
    });

    // Listen for optimization acceptance
    window.addEventListener('optimizationAccepted', (e) => {
      logInfo('AnalyticsIntegration: Optimization accepted', e.detail);
      this.showNotification('Doporučení přijato', 'success');
    });

    // Listen for correlation cell clicks
    window.addEventListener('correlationCellClicked', (e) => {
      logInfo('AnalyticsIntegration: Correlation cell clicked', e.detail);
    });
  }

  /**
   * Update all panels with new portfolio data
   * @param {Array} portfolio - Portfolio items
   */
  updateAllPanels(portfolio) {
    try {
      if (!portfolio || portfolio.length === 0) {
        this.clearAllPanels();
        return;
      }

      this.portfolio = portfolio;

      // Update risk panel
      if (this.panels.risk) {
        this.panels.risk.updatePortfolio(portfolio);
      }

      // Update compliance panel
      if (this.panels.compliance) {
        this.panels.compliance.updatePortfolio(portfolio);
      }

      // Update technical indicators panel
      if (this.panels.technical) {
        this.panels.technical.updatePortfolio(portfolio);
      }

      // Update correlation heatmap
      if (this.panels.heatmap) {
        this.panels.heatmap.calculateFromPortfolio(portfolio);
      }

      logInfo('AnalyticsIntegration: All panels updated', {
        itemCount: portfolio.length,
      });
    } catch (error) {
      logError('AnalyticsIntegration: Update error', error);
    }
  }

  /**
   * Generate optimization recommendation
   */
  generateOptimization() {
    if (!this.portfolio || !this.panels.optimization) {
      return;
    }

    this.panels.optimization.generateRecommendation(this.portfolio);
  }

  /**
   * Clear all panels
   */
  clearAllPanels() {
    if (this.panels.risk) {
      this.panels.risk.renderEmpty();
    }
    if (this.panels.optimization) {
      this.panels.optimization.renderEmpty();
    }
    if (this.panels.compliance) {
      this.panels.compliance.renderEmpty();
    }
    if (this.panels.technical) {
      this.panels.technical.renderEmpty();
    }
    if (this.panels.heatmap) {
      this.panels.heatmap.renderEmpty();
    }
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   */
  showNotification(message, type = 'info') {
    // Check if notification system exists
    if (typeof showToast === 'function') {
      showToast(type, 'Analytika', message);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Export analytics report
   * @returns {Object} Analytics data
   */
  exportReport() {
    const report = {
      generated: new Date().toISOString(),
      portfolio: this.portfolio,
      analytics: {
        risk: this.panels.risk?.getMetrics(),
        optimization: this.panels.optimization?.getRecommendation(),
        compliance: this.panels.compliance?.getStatus(),
        technical: this.panels.technical?.getSignals(),
        correlation: this.panels.heatmap?.getMatrix(),
      },
    };

    return report;
  }

  /**
   * Get specific panel
   * @param {string} panelName - Panel name
   * @returns {Object} Panel instance
   */
  getPanel(panelName) {
    return this.panels[panelName];
  }

  /**
   * Get all panels
   * @returns {Object} All panels
   */
  getPanels() {
    return this.panels;
  }
}

// Global instance
let analyticsIntegration = null;

/**
 * Initialize analytics integration
 */
function initializeAnalytics() {
  try {
    analyticsIntegration = new AnalyticsIntegration();
    window.analyticsIntegration = analyticsIntegration;
    logInfo('Analytics integration ready');
  } catch (error) {
    logError('Analytics initialization failed', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
  initializeAnalytics();
}

export { AnalyticsIntegration, analyticsIntegration, initializeAnalytics };
