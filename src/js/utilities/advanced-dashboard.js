import { logError } from './logger.js';
/**
 * Advanced Dashboard & Analytics UI
 * Comprehensive enterprise analytics dashboard for portfolio management
 *
 * Implements:
 * - Real-time risk metrics display
 * - Portfolio optimization results visualization
 * - Regulatory compliance status
 * - Technical analysis signals
 * - Performance metrics
 * - Stress test results
 * - Interactive analytics panels
 *
 * Version: 1.0.0
 * Enterprise Portfolio Analytics Dashboard
 */

class AdvancedAnalyticsDashboard {
  constructor() {
    this.dashboardId = 'analytics-dashboard';
    this.panels = new Map();
    this.updateInterval = 5000; // 5 seconds
    this.autoRefresh = true;
  }

  /**
   * Initialize dashboard
   *
   * @param {string} dashboardId - Container element ID
   * @param {Object} config - Dashboard configuration
   */
  init(dashboardId, config = {}) {
    this.dashboardId = dashboardId;
    this.config = config;

    const container = document.getElementById(dashboardId);
    if (!container) {
      logError(`[AnalyticsDashboard] Container not found: ${dashboardId}`);
      return;
    }

    this._createDashboardStructure(container);
    this._startAutoRefresh();
  }

  /**
   * Create dashboard HTML structure
   * @private
   */
  _createDashboardStructure(container) {
    container.innerHTML = '';
    container.className = 'analytics-dashboard';

    // Dashboard header
    const header = document.createElement('div');
    header.className = 'dashboard-header';
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    `;

    const title = document.createElement('div');
    title.innerHTML = `
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📊 Enterprise Portfolio Analytics</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Real-time Risk & Performance Metrics</p>
    `;
    header.appendChild(title);

    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'dashboard-status';
    statusIndicator.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    `;
    statusIndicator.innerHTML = `
      <div style="width: 12px; height: 12px; background: #2ecc71; border-radius: 50%; animation: pulse 2s infinite;"></div>
      <span>LIVE</span>
    `;
    header.appendChild(statusIndicator);

    container.appendChild(header);

    // Dashboard grid
    const grid = document.createElement('div');
    grid.id = 'dashboard-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      padding: 20px;
    `;

    // Create panels
    this._createPanel(grid, 'risk-metrics', '⚠️ Risk Metrics');
    this._createPanel(grid, 'portfolio-optimization', '🎯 Portfolio Optimization');
    this._createPanel(grid, 'compliance-status', '✓ Regulatory Compliance');
    this._createPanel(grid, 'technical-signals', '📈 Technical Signals');
    this._createPanel(grid, 'performance', '📊 Performance');
    this._createPanel(grid, 'stress-test', '💥 Stress Test Results');

    container.appendChild(grid);

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      .dashboard-panel {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 20px;
        transition: all 0.3s ease;
      }
      
      .dashboard-panel:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }
      
      .panel-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #2c3e50;
        border-bottom: 2px solid #ecf0f1;
        padding-bottom: 10px;
      }
      
      .metric-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #ecf0f1;
      }
      
      .metric-row:last-child {
        border-bottom: none;
      }
      
      .metric-label {
        font-size: 13px;
        color: #7f8c8d;
        font-weight: 500;
      }
      
      .metric-value {
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
      }
      
      .metric-value.positive {
        color: #27ae60;
      }
      
      .metric-value.negative {
        color: #e74c3c;
      }
      
      .metric-value.neutral {
        color: #3498db;
      }
      
      .signal-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        margin-right: 5px;
        margin-bottom: 5px;
      }
      
      .signal-buy {
        background: #d5f4e6;
        color: #27ae60;
      }
      
      .signal-sell {
        background: #fadbd8;
        color: #e74c3c;
      }
      
      .signal-neutral {
        background: #d6eaf8;
        color: #3498db;
      }
      
      .compliance-compliant {
        background: #d5f4e6;
        color: #27ae60;
      }
      
      .compliance-warning {
        background: #fdeaa0;
        color: #f39c12;
      }
      
      .compliance-violation {
        background: #fadbd8;
        color: #e74c3c;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create individual panel
   * @private
   */
  _createPanel(grid, panelId, title) {
    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'dashboard-panel';

    const panelTitle = document.createElement('div');
    panelTitle.className = 'panel-title';
    panelTitle.textContent = title;
    panel.appendChild(panelTitle);

    const content = document.createElement('div');
    content.id = `${panelId}-content`;
    panel.appendChild(content);

    grid.appendChild(panel);
    this.panels.set(panelId, { element: panel, content });
  }

  /**
   * Update risk metrics panel
   *
   * @param {Object} riskData - Risk metrics data
   */
  updateRiskMetrics(riskData) {
    const panel = this.panels.get('risk-metrics');
    if (!panel) {
      return;
    }

    const html = `
      <div class="metric-row">
        <span class="metric-label">Value at Risk (95%)</span>
        <span class="metric-value negative">${(riskData.varEqualWeight?.['95%'] || 0).toFixed(2)}%</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Expected Shortfall (95%)</span>
        <span class="metric-value negative">${(riskData.expected_shortfall || 0).toFixed(2)}%</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Volatility (Annualized)</span>
        <span class="metric-value neutral">${(riskData.volatility || 0).toFixed(2)}%</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Sharpe Ratio</span>
        <span class="metric-value ${(riskData.sharpeRatio || 0) > 1 ? 'positive' : 'neutral'}">${(
  riskData.sharpeRatio || 0
).toFixed(2)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Max Drawdown</span>
        <span class="metric-value negative">${(riskData.maxDrawdown || 0).toFixed(2)}%</span>
      </div>
    `;

    panel.content.innerHTML = html;
  }

  /**
   * Update portfolio optimization panel
   *
   * @param {Object} optimalPortfolio - Optimal portfolio data
   */
  updatePortfolioOptimization(optimalPortfolio) {
    const panel = this.panels.get('portfolio-optimization');
    if (!panel) {
      return;
    }

    const html = `
      <div class="metric-row">
        <span class="metric-label">Expected Return</span>
        <span class="metric-value positive">${(optimalPortfolio.expectedReturn || 0).toFixed(2)}%</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Portfolio Volatility</span>
        <span class="metric-value neutral">${(optimalPortfolio.volatility || 0).toFixed(2)}%</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Sharpe Ratio</span>
        <span class="metric-value ${(optimalPortfolio.sharpeRatio || 0) > 1 ? 'positive' : 'neutral'}">${(
  optimalPortfolio.sharpeRatio || 0
).toFixed(2)}</span>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ecf0f1;">
        <div class="metric-label" style="margin-bottom: 10px;">Allocations:</div>
        ${this._renderAllocations(optimalPortfolio.weights)}
      </div>
    `;

    panel.content.innerHTML = html;
  }

  /**
   * Render allocation bars
   * @private
   */
  _renderAllocations(weights) {
    if (!weights || !Array.isArray(weights)) {
      return '';
    }

    return weights
      .slice(0, 5) // Show top 5
      .map(
        (weight, idx) => `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 12px;">Asset ${idx + 1}</span>
          <span style="font-size: 12px; font-weight: bold;">${(weight * 100).toFixed(1)}%</span>
        </div>
        <div style="background: #ecf0f1; height: 6px; border-radius: 3px; overflow: hidden;">
          <div style="width: ${weight * 100}%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2);"></div>
        </div>
      </div>
    `,
      )
      .join('');
  }

  /**
   * Update compliance status panel
   *
   * @param {Object} complianceData - Compliance data
   */
  updateComplianceStatus(complianceData) {
    const panel = this.panels.get('compliance-status');
    if (!panel) {
      return;
    }

    const ucitsCompliant = complianceData.ucits?.compliant ?? true;
    const mifidCompliant = complianceData.mifid?.compliant ?? true;
    const esmaCompliant = complianceData.esma?.compliant ?? true;

    const html = `
      <div class="metric-row">
        <span class="metric-label">UCITS Compliance</span>
        <span class="signal-badge ${ucitsCompliant ? 'compliance-compliant' : 'compliance-violation'}">
          ${ucitsCompliant ? '✓ Compliant' : '✗ Violation'}
        </span>
      </div>
      <div class="metric-row">
        <span class="metric-label">MiFID II</span>
        <span class="signal-badge ${mifidCompliant ? 'compliance-compliant' : 'compliance-violation'}">
          ${mifidCompliant ? '✓ Compliant' : '✗ Violation'}
        </span>
      </div>
      <div class="metric-row">
        <span class="metric-label">ESMA Guidelines</span>
        <span class="signal-badge ${esmaCompliant ? 'compliance-compliant' : 'compliance-violation'}">
          ${esmaCompliant ? '✓ Compliant' : '✗ Violation'}
        </span>
      </div>
      <div class="metric-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ecf0f1;">
        <span class="metric-label">Overall Status</span>
        <span class="metric-value ${ucitsCompliant && mifidCompliant && esmaCompliant ? 'positive' : 'negative'}">
          ${ucitsCompliant && mifidCompliant && esmaCompliant ? '✓ ALL CLEAR' : '⚠ REVIEW REQUIRED'}
        </span>
      </div>
    `;

    panel.content.innerHTML = html;
  }

  /**
   * Update technical signals panel
   *
   * @param {Object} signalsData - Technical signals
   */
  updateTechnicalSignals(signalsData) {
    const panel = this.panels.get('technical-signals');
    if (!panel) {
      return;
    }

    const overallSignal = signalsData.overallSignal || 'NEUTRAL';
    const confidence = signalsData.confidence || 0;

    let signalBadges = '';
    if (signalsData.signals && Array.isArray(signalsData.signals)) {
      signalBadges = signalsData.signals
        .slice(0, 3)
        .map((signal) => {
          const signalType = signal.type.toLowerCase().includes('buy') ? 'buy' : 'sell';
          return `
        <span class="signal-badge signal-${signalType}" title="${signal.type}">
          ${signal.type.replace(/_/g, ' ')}
        </span>
      `;
        })
        .join('');
    }

    const html = `
      <div class="metric-row">
        <span class="metric-label">Overall Signal</span>
        <span class="signal-badge signal-${overallSignal.toLowerCase()}">
          ${overallSignal}
        </span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Confidence</span>
        <span class="metric-value neutral">${confidence.toFixed(0)}%</span>
      </div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ecf0f1;">
        <div class="metric-label" style="margin-bottom: 8px;">Active Signals:</div>
        ${signalBadges || '<span style="color: #7f8c8d; font-size: 12px;">No active signals</span>'}
      </div>
    `;

    panel.content.innerHTML = html;
  }

  /**
   * Update performance panel
   *
   * @param {Object} performanceData - Performance metrics
   */
  updatePerformance(performanceData) {
    const panel = this.panels.get('performance');
    if (!panel) {
      return;
    }

    const html = `
      <div class="metric-row">
        <span class="metric-label">YTD Return</span>
        <span class="metric-value ${(performanceData.ytdReturn || 0) > 0 ? 'positive' : 'negative'}">
          ${(performanceData.ytdReturn || 0).toFixed(2)}%
        </span>
      </div>
      <div class="metric-row">
        <span class="metric-label">1-Year Return</span>
        <span class="metric-value ${(performanceData.oneYearReturn || 0) > 0 ? 'positive' : 'negative'}">
          ${(performanceData.oneYearReturn || 0).toFixed(2)}%
        </span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Sortino Ratio</span>
        <span class="metric-value neutral">${(performanceData.sortinoRatio || 0).toFixed(2)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Calmar Ratio</span>
        <span class="metric-value neutral">${(performanceData.calmarRatio || 0).toFixed(2)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Information Ratio</span>
        <span class="metric-value neutral">${(performanceData.informationRatio || 0).toFixed(2)}</span>
      </div>
    `;

    panel.content.innerHTML = html;
  }

  /**
   * Update stress test results panel
   *
   * @param {Object} stressResults - Stress test results
   */
  updateStressTest(stressResults) {
    const panel = this.panels.get('stress-test');
    if (!panel) {
      return;
    }

    const scenarios = stressResults.scenarioResults || [];
    const worstCase = stressResults.worstCaseScenario || {};

    const scenarioHtml = scenarios
      .slice(0, 3)
      .map(
        (scenario) => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
        <span style="font-size: 12px;">${scenario.scenario}</span>
        <span class="metric-value negative">${scenario.portfolioLossPercent.toFixed(2)}%</span>
      </div>
    `,
      )
      .join('');

    const html = `
      <div class="metric-row">
        <span class="metric-label">Worst Case Loss</span>
        <span class="metric-value negative">${(worstCase.portfolioLossPercent || 0).toFixed(2)}%</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Est. Recovery</span>
        <span class="metric-value neutral">${(worstCase.estimatedRecovery || 0).toFixed(0)} months</span>
      </div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ecf0f1;">
        <div class="metric-label" style="margin-bottom: 8px;">Top Scenarios:</div>
        ${scenarioHtml}
      </div>
    `;

    panel.content.innerHTML = html;
  }

  /**
   * Start auto-refresh
   * @private
   */
  _startAutoRefresh() {
    if (this.autoRefresh && this.updateInterval > 0) {
      this.refreshTimer = setInterval(() => {
        // Dispatch custom event for data refresh
        const event = new CustomEvent('analytics-dashboard-refresh');
        window.dispatchEvent(event);
      }, this.updateInterval);
    }
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  /**
   * Destroy dashboard
   */
  destroy() {
    this.stopAutoRefresh();
    const container = document.getElementById(this.dashboardId);
    if (container) {
      container.innerHTML = '';
    }
  }
}

// Global instance
window.analyticsDashboard = new AdvancedAnalyticsDashboard();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedAnalyticsDashboard;
}
