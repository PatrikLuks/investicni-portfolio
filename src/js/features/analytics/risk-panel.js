/**
 * Risk Panel - Phase 6 UI Integration
 * Displays advanced risk metrics from AdvancedRiskMetricsEngine
 * @module risk-panel
 */

import AdvancedRiskMetricsEngine from '../../utilities/advanced-risk-metrics.js';
import { logError, logInfo } from '../../utilities/logger.js';
import { formatCurrency } from '../../utilities/formatting.js';

class RiskPanel {
  constructor(elementId = 'risk-panel') {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      logError('RiskPanel: Element not found', { elementId });
      return;
    }
    this.riskEngine = new AdvancedRiskMetricsEngine();
    this.currentMetrics = null;
    this.init();
  }

  /**
   * Initialize panel structure
   */
  init() {
    this.createPanelHTML();
    this.attachEventListeners();
  }

  /**
   * Create panel HTML structure
   */
  createPanelHTML() {
    this.element.innerHTML = `
      <div class="risk-panel-container">
        <div class="risk-panel-header">
          <h2>📊 Metriky rizika</h2>
          <button class="risk-panel-refresh" title="Obnovit metriky">↻</button>
        </div>
        
        <div class="risk-metrics-grid">
          <!-- Volatility -->
          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-label">Volatilita</div>
            <div class="metric-value" id="riskVolatility">-</div>
            <div class="metric-description">Roční standardní odchylka</div>
          </div>
          
          <!-- Value at Risk -->
          <div class="metric-card">
            <div class="metric-icon">⚠️</div>
            <div class="metric-label">VaR (95%)</div>
            <div class="metric-value" id="riskVar95">-</div>
            <div class="metric-description">Max. ztráta v 95% případů</div>
          </div>
          
          <!-- Conditional Value at Risk -->
          <div class="metric-card">
            <div class="metric-icon">🔴</div>
            <div class="metric-label">CVaR (95%)</div>
            <div class="metric-value" id="riskCvar95">-</div>
            <div class="metric-description">Průměr nejhorších 5%</div>
          </div>
          
          <!-- Sharpe Ratio -->
          <div class="metric-card">
            <div class="metric-icon">⭐</div>
            <div class="metric-label">Sharpe Ratio</div>
            <div class="metric-value" id="riskSharpe">-</div>
            <div class="metric-description">Výnos na jednotku rizika</div>
          </div>
          
          <!-- Sortino Ratio -->
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-label">Sortino Ratio</div>
            <div class="metric-value" id="riskSortino">-</div>
            <div class="metric-description">Výnos na downside riziko</div>
          </div>
          
          <!-- Max Drawdown -->
          <div class="metric-card">
            <div class="metric-icon">📉</div>
            <div class="metric-label">Max. pokles</div>
            <div class="metric-value" id="riskMaxDrawdown">-</div>
            <div class="metric-description">Největší propad od vrcholu</div>
          </div>
        </div>
        
        <div class="risk-panel-footer">
          <div class="risk-status" id="riskStatus"></div>
          <div class="risk-timestamp" id="riskTimestamp"></div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const refreshBtn = this.element.querySelector('.risk-panel-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }
  }

  /**
   * Update panel with portfolio data
   * @param {Array} portfolio - Portfolio items
   */
  updatePortfolio(portfolio) {
    try {
      if (!portfolio || portfolio.length === 0) {
        this.renderEmpty();
        return;
      }

      // Calculate risk metrics
      const metrics = this.riskEngine.analyzeRisk(portfolio);
      this.currentMetrics = metrics;

      // Render metrics
      this.render(metrics);

      logInfo('RiskPanel: Portfolio updated', { itemCount: portfolio.length });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Render metrics to DOM
   * @param {Object} metrics - Risk metrics object
   */
  render(metrics) {
    try {
      // Update volatility
      const volatilityEl = this.element.querySelector('#riskVolatility');
      if (volatilityEl) {
        volatilityEl.textContent = `${(metrics.volatility * 100).toFixed(2)}%`;
        volatilityEl.className = this.getRiskClass(metrics.volatility, 0.15);
      }

      // Update VaR
      const varEl = this.element.querySelector('#riskVar95');
      if (varEl) {
        varEl.textContent = `${formatCurrency(metrics.var95)}`;
        varEl.className = this.getRiskClass(-metrics.var95, 1000);
      }

      // Update CVaR
      const cvarEl = this.element.querySelector('#riskCvar95');
      if (cvarEl) {
        cvarEl.textContent = `${formatCurrency(metrics.cvar95)}`;
        cvarEl.className = this.getRiskClass(-metrics.cvar95, 1500);
      }

      // Update Sharpe Ratio
      const sharpeEl = this.element.querySelector('#riskSharpe');
      if (sharpeEl) {
        sharpeEl.textContent = metrics.sharpeRatio.toFixed(2);
        sharpeEl.className = this.getPerformanceClass(metrics.sharpeRatio, 1.0);
      }

      // Update Sortino Ratio
      const sortinoEl = this.element.querySelector('#riskSortino');
      if (sortinoEl) {
        sortinoEl.textContent = metrics.sortinoRatio.toFixed(2);
        sortinoEl.className = this.getPerformanceClass(metrics.sortinoRatio, 1.5);
      }

      // Update Max Drawdown
      const ddEl = this.element.querySelector('#riskMaxDrawdown');
      if (ddEl) {
        ddEl.textContent = `${(metrics.maxDrawdown * 100).toFixed(2)}%`;
        ddEl.className = this.getRiskClass(metrics.maxDrawdown, -0.2);
      }

      // Update status
      this.updateStatus(metrics);

      // Update timestamp
      const tsEl = this.element.querySelector('#riskTimestamp');
      if (tsEl) {
        tsEl.textContent = `Aktualizováno: ${new Date().toLocaleTimeString('cs-CZ')}`;
      }
    } catch (error) {
      logError('RiskPanel: Render error', error);
    }
  }

  /**
   * Update risk status indicator
   * @param {Object} metrics - Risk metrics
   */
  updateStatus(metrics) {
    const statusEl = this.element.querySelector('#riskStatus');
    if (!statusEl) {
      return;
    }

    let status = '✅ Nízké riziko';
    let riskLevel = 'low';

    if (metrics.volatility > 0.25) {
      status = '🔴 Vysoké riziko';
      riskLevel = 'high';
    } else if (metrics.volatility > 0.15) {
      status = '🟡 Střední riziko';
      riskLevel = 'medium';
    }

    statusEl.textContent = status;
    statusEl.className = `risk-status risk-${riskLevel}`;
  }

  /**
   * Get CSS class based on risk value
   * @param {number} value - Value to classify
   * @param {number} threshold - Threshold value
   * @returns {string} CSS class name
   */
  getRiskClass(value, threshold) {
    if (value <= threshold) {
      return 'metric-low';
    }
    if (value <= threshold * 1.5) {
      return 'metric-medium';
    }
    return 'metric-high';
  }

  /**
   * Get CSS class based on performance value
   * @param {number} value - Performance value
   * @param {number} goodThreshold - Good threshold
   * @returns {string} CSS class name
   */
  getPerformanceClass(value, goodThreshold) {
    if (value >= goodThreshold * 1.2) {
      return 'metric-high';
    }
    if (value >= goodThreshold) {
      return 'metric-medium';
    }
    return 'metric-low';
  }

  /**
   * Render empty state
   */
  renderEmpty() {
    const statusEl = this.element.querySelector('#riskStatus');
    if (statusEl) {
      statusEl.textContent = 'Žádné portfolio k analýze';
      statusEl.className = 'risk-status risk-empty';
    }

    // Clear metrics
    const cards = this.element.querySelectorAll('.metric-value');
    cards.forEach((card) => {
      card.textContent = '-';
      card.className = 'metric-value';
    });
  }

  /**
   * Handle errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    logError('RiskPanel: Error', error);
    const statusEl = this.element.querySelector('#riskStatus');
    if (statusEl) {
      statusEl.textContent = '❌ Chyba při výpočtu metrik';
      statusEl.className = 'risk-status risk-error';
    }
  }

  /**
   * Refresh metrics
   */
  refresh() {
    if (!this.currentMetrics) {
      return;
    }
    const refreshBtn = this.element.querySelector('.risk-panel-refresh');
    if (refreshBtn) {
      refreshBtn.classList.add('rotating');
      setTimeout(() => refreshBtn.classList.remove('rotating'), 600);
    }
  }

  /**
   * Get current metrics
   * @returns {Object} Current metrics object
   */
  getMetrics() {
    return this.currentMetrics;
  }
}

export { RiskPanel };
