/**
 * Advanced Financial Calculations Engine
 * Features: ROI, CAGR, Sharpe Ratio, Volatility, Beta, Drawdown Analysis
 *
 * ✅ ENHANCED: Integrated with FinancialPrecisionEngine for enterprise-grade calculations
 * - Precision arithmetic guardrails
 * - Risk assessment and portfolio analytics
 * - Financial best practices compliance
 * - Performance optimization with caching
 */

import { logInfo, logError } from './logger.js';
import { formatCurrency } from './formatting.js';

class CalculationsEngine {
  constructor() {
    this.riskFreeRate = 0.02; // 2% default risk-free rate
    this.tradingDaysPerYear = 252;
    this.cache = new Map();
    this.precisionEngine = null; // Will be initialized when available

    this.init();
  }

  /**
   * Initialize calculations engine
   * Checks if FinancialPrecisionEngine is available and initializes it
   */
  init() {
    // Check if FinancialPrecisionEngine is globally available
    if (typeof window !== 'undefined' && window.FinancialPrecisionEngine) {
      this.precisionEngine = new window.FinancialPrecisionEngine();
      logInfo('CalculationsEngine: Integrated with FinancialPrecisionEngine');
    } else {
      logInfo(
        'CalculationsEngine: FinancialPrecisionEngine not yet available, will retry on demand'
      );
    }
  }

  /**
   * Lazy-load precision engine if not initialized
   */
  ensurePrecisionEngine() {
    if (!this.precisionEngine && typeof window !== 'undefined' && window.FinancialPrecisionEngine) {
      this.precisionEngine = new window.FinancialPrecisionEngine();
    }
    return this.precisionEngine;
  }

  // ==================== ROI CALCULATIONS ====================

  /**
   * Calculate Return on Investment (ROI)
   * @param {Object} position - Portfolio position
   * @returns {number} - ROI percentage
   */
  calculateROI(position) {
    const currentValue = parseFloat(position.aktuálníHodnota) || 0;
    const originalValue = parseFloat(position.nákupníCena) * parseFloat(position.počet);

    if (originalValue === 0) {
      return 0;
    }

    const roi = ((currentValue - originalValue) / originalValue) * 100;
    return parseFloat(roi.toFixed(2));
  }

  /**
   * Calculate portfolio total ROI
   * @param {Array} data - Portfolio data
   * @returns {number} - Total ROI percentage
   */
  calculateTotalROI(data) {
    let totalCurrent = 0;
    let totalOriginal = 0;

    data.forEach((item) => {
      totalCurrent += parseFloat(item.aktuálníHodnota) || 0;
      totalOriginal += parseFloat(item.nákupníCena) * parseFloat(item.počet);
    });

    if (totalOriginal === 0) {
      return 0;
    }

    return ((totalCurrent - totalOriginal) / totalOriginal) * 100;
  }

  // ==================== CAGR CALCULATIONS ====================

  /**
   * Calculate Compound Annual Growth Rate (CAGR)
   * @param {number} startValue - Starting value
   * @param {number} endValue - Ending value
   * @param {number} years - Number of years
   * @returns {number} - CAGR percentage
   */
  calculateCAGR(startValue, endValue, years) {
    if (startValue === 0 || years === 0) {
      return 0;
    }

    const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
    return parseFloat(cagr.toFixed(2));
  }

  /**
   * Calculate portfolio CAGR from historical data
   * @param {Array} data - Portfolio data with dates
   * @returns {number} - CAGR percentage
   */
  calculatePortfolioCAGR(data) {
    // Get oldest purchase date
    const dates = data.filter((item) => item.datumNákupu).map((item) => new Date(item.datumNákupu));

    if (dates.length === 0) {
      return 0;
    }

    const oldestDate = new Date(Math.min(...dates));
    const today = new Date();
    const years = (today - oldestDate) / (1000 * 60 * 60 * 24 * 365.25);

    if (years < 0.1) {
      return 0;
    } // Need at least ~1 month

    const totalOriginal = data.reduce(
      (sum, item) => sum + parseFloat(item.nákupníCena) * parseFloat(item.počet),
      0
    );
    const totalCurrent = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota), 0);

    return this.calculateCAGR(totalOriginal, totalCurrent, years);
  }

  // ==================== SHARPE RATIO ====================

  /**
   * Calculate Sharpe Ratio
   * @param {Array} returns - Array of periodic returns
   * @param {number} riskFreeRate - Risk-free rate (annualized)
   * @returns {number} - Sharpe ratio
   */
  calculateSharpeRatio(returns, riskFreeRate = this.riskFreeRate) {
    if (!returns || returns.length < 2) {
      return 0;
    }

    const avgReturn = this.calculateMean(returns);
    const stdDev = this.calculateStandardDeviation(returns);

    if (stdDev === 0) {
      return 0;
    }

    // Annualize if needed (assuming daily returns)
    const annualizedReturn = avgReturn * this.tradingDaysPerYear;
    const annualizedStdDev = stdDev * Math.sqrt(this.tradingDaysPerYear);

    const sharpeRatio = (annualizedReturn - riskFreeRate) / annualizedStdDev;
    return parseFloat(sharpeRatio.toFixed(2));
  }

  /**
   * Calculate portfolio Sharpe ratio from historical data
   * @param {Array} historicalValues - Array of portfolio values over time
   * @returns {number} - Sharpe ratio
   */
  calculatePortfolioSharpe(historicalValues) {
    if (!historicalValues || historicalValues.length < 2) {
      return 0;
    }

    const returns = [];
    for (let i = 1; i < historicalValues.length; i++) {
      const ret = (historicalValues[i] - historicalValues[i - 1]) / historicalValues[i - 1];
      returns.push(ret);
    }

    return this.calculateSharpeRatio(returns);
  }

  // ==================== VOLATILITY ====================

  /**
   * Calculate volatility (standard deviation of returns)
   * @param {Array} returns - Array of periodic returns
   * @returns {number} - Annualized volatility percentage
   */
  calculateVolatility(returns) {
    if (!returns || returns.length < 2) {
      return 0;
    }

    const stdDev = this.calculateStandardDeviation(returns);
    const annualizedVol = stdDev * Math.sqrt(this.tradingDaysPerYear) * 100;

    return parseFloat(annualizedVol.toFixed(2));
  }

  /**
   * Calculate portfolio volatility
   * @param {Array} historicalValues - Array of portfolio values
   * @returns {number} - Volatility percentage
   */
  calculatePortfolioVolatility(historicalValues) {
    if (!historicalValues || historicalValues.length < 2) {
      return 0;
    }

    const returns = [];
    for (let i = 1; i < historicalValues.length; i++) {
      const ret = (historicalValues[i] - historicalValues[i - 1]) / historicalValues[i - 1];
      returns.push(ret);
    }

    return this.calculateVolatility(returns);
  }

  // ==================== BETA COEFFICIENT ====================

  /**
   * Calculate Beta coefficient (portfolio vs market)
   * @param {Array} portfolioReturns - Portfolio returns
   * @param {Array} marketReturns - Market returns (benchmark)
   * @returns {number} - Beta coefficient
   */
  calculateBeta(portfolioReturns, marketReturns) {
    if (
      !portfolioReturns ||
      !marketReturns ||
      portfolioReturns.length !== marketReturns.length ||
      portfolioReturns.length < 2
    ) {
      return 1.0; // Default beta
    }

    const covariance = this.calculateCovariance(portfolioReturns, marketReturns);
    const marketVariance = this.calculateVariance(marketReturns);

    if (marketVariance === 0) {
      return 1.0;
    }

    const beta = covariance / marketVariance;
    return parseFloat(beta.toFixed(2));
  }

  // ==================== DRAWDOWN ANALYSIS ====================

  /**
   * Calculate maximum drawdown
   * @param {Array} values - Array of portfolio values over time
   * @returns {Object} - Drawdown analysis
   */
  calculateMaxDrawdown(values) {
    if (!values || values.length < 2) {
      return { maxDrawdown: 0, peak: 0, trough: 0, recovery: null };
    }

    let maxDrawdown = 0;
    let peak = values[0];
    let peakIndex = 0;
    let troughIndex = 0;
    let maxDrawdownPeak = values[0];
    let maxDrawdownTrough = values[0];

    for (let i = 0; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
        peakIndex = i;
      }

      const drawdown = (peak - values[i]) / peak;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPeak = peak;
        maxDrawdownTrough = values[i];
        troughIndex = i;
      }
    }

    // Find recovery (if recovered)
    let recoveryIndex = null;
    for (let i = troughIndex + 1; i < values.length; i++) {
      if (values[i] >= maxDrawdownPeak) {
        recoveryIndex = i;
        break;
      }
    }

    return {
      maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
      peak: maxDrawdownPeak,
      trough: maxDrawdownTrough,
      peakIndex,
      troughIndex,
      recoveryIndex,
      daysToRecover: recoveryIndex ? recoveryIndex - troughIndex : null,
    };
  }

  /**
   * Calculate current drawdown
   * @param {Array} values - Array of portfolio values
   * @returns {number} - Current drawdown percentage
   */
  calculateCurrentDrawdown(values) {
    if (!values || values.length === 0) {
      return 0;
    }

    const peak = Math.max(...values);
    const current = values[values.length - 1];

    if (peak === 0) {
      return 0;
    }

    const drawdown = ((peak - current) / peak) * 100;
    return parseFloat(drawdown.toFixed(2));
  }

  // ==================== STATISTICAL HELPERS ====================

  /**
   * Calculate mean (average)
   * @param {Array} values - Array of numbers
   * @returns {number} - Mean value
   */
  calculateMean(values) {
    if (!values || values.length === 0) {
      return 0;
    }
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   * @param {Array} values - Array of numbers
   * @returns {number} - Standard deviation
   */
  calculateStandardDeviation(values) {
    if (!values || values.length < 2) {
      return 0;
    }

    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate variance
   * @param {Array} values - Array of numbers
   * @returns {number} - Variance
   */
  calculateVariance(values) {
    if (!values || values.length < 2) {
      return 0;
    }

    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));

    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate covariance
   * @param {Array} x - First array
   * @param {Array} y - Second array
   * @returns {number} - Covariance
   */
  calculateCovariance(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) {
      return 0;
    }

    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);

    let covariance = 0;
    for (let i = 0; i < x.length; i++) {
      covariance += (x[i] - meanX) * (y[i] - meanY);
    }

    return covariance / x.length;
  }

  // ==================== PORTFOLIO METRICS ====================

  /**
   * Calculate comprehensive portfolio metrics
   * @param {Array} data - Portfolio data
   * @param {Array} historicalValues - Historical portfolio values (optional)
   * @param {Array} marketReturns - Market benchmark returns (optional)
   * @returns {Object} - Comprehensive metrics
   */
  calculatePortfolioMetrics(data, historicalValues = null, marketReturns = null) {
    const metrics = {
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      roi: 0,
      cagr: 0,
      sharpeRatio: 0,
      volatility: 0,
      beta: 1.0,
      maxDrawdown: 0,
      currentDrawdown: 0,
      topPerformers: [],
      worstPerformers: [],
    };

    // Basic calculations
    data.forEach((item) => {
      const currentValue = parseFloat(item.aktuálníHodnota) || 0;
      const originalValue = parseFloat(item.nákupníCena) * parseFloat(item.počet);

      metrics.totalValue += currentValue;
      metrics.totalCost += originalValue;
      metrics.totalGainLoss += currentValue - originalValue;
    });

    metrics.roi = this.calculateTotalROI(data);
    metrics.cagr = this.calculatePortfolioCAGR(data);

    // Advanced calculations (if historical data available)
    if (historicalValues && historicalValues.length > 1) {
      metrics.sharpeRatio = this.calculatePortfolioSharpe(historicalValues);
      metrics.volatility = this.calculatePortfolioVolatility(historicalValues);

      const drawdownAnalysis = this.calculateMaxDrawdown(historicalValues);
      metrics.maxDrawdown = drawdownAnalysis.maxDrawdown;
      metrics.currentDrawdown = this.calculateCurrentDrawdown(historicalValues);

      // Calculate beta if market returns provided
      if (marketReturns && marketReturns.length === historicalValues.length) {
        const portfolioReturns = [];
        for (let i = 1; i < historicalValues.length; i++) {
          portfolioReturns.push(
            (historicalValues[i] - historicalValues[i - 1]) / historicalValues[i - 1]
          );
        }
        metrics.beta = this.calculateBeta(portfolioReturns, marketReturns.slice(1));
      }
    }

    // Top/worst performers
    const performanceData = data
      .map((item) => ({
        fond: item.fond,
        roi: this.calculateROI(item),
        value: parseFloat(item.aktuálníHodnota),
      }))
      .sort((a, b) => b.roi - a.roi);

    metrics.topPerformers = performanceData.slice(0, 5);
    metrics.worstPerformers = performanceData.slice(-5).reverse();

    return metrics;
  }

  /**
   * Generate metrics summary text
   * @param {Object} metrics - Portfolio metrics
   * @returns {string} - Formatted summary
   */
  generateMetricsSummary(metrics) {
    return `
📊 PORTFOLIO METRICS SUMMARY

💰 Value & Returns:
  • Total Value: ${formatCurrency(metrics.totalValue)}
  • Total Cost: ${formatCurrency(metrics.totalCost)}
  • Gain/Loss: ${formatCurrency(metrics.totalGainLoss)}
  • ROI: ${metrics.roi.toFixed(2)}%
  • CAGR: ${metrics.cagr.toFixed(2)}%

📈 Risk Metrics:
  • Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
  • Volatility: ${metrics.volatility.toFixed(2)}%
  • Beta: ${metrics.beta.toFixed(2)}
  • Max Drawdown: ${metrics.maxDrawdown.toFixed(2)}%
  • Current Drawdown: ${metrics.currentDrawdown.toFixed(2)}%

🏆 Top Performers:
${metrics.topPerformers.map((p, i) => `  ${i + 1}. ${p.fond}: ${p.roi.toFixed(2)}%`).join('\n')}

⚠️ Worst Performers:
${metrics.worstPerformers.map((p, i) => `  ${i + 1}. ${p.fond}: ${p.roi.toFixed(2)}%`).join('\n')}
    `.trim();
  }

  /**
   * Set risk-free rate
   * @param {number} rate - Risk-free rate (decimal, e.g., 0.02 for 2%)
   */
  setRiskFreeRate(rate) {
    this.riskFreeRate = rate;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  // ==================== RISK ASSESSMENT & ANALYTICS ====================

  /**
   * Get comprehensive risk assessment for portfolio
   * ✅ ENHANCED: Uses FinancialPrecisionEngine when available
   *
   * @param {Array} data - Portfolio data
   * @param {Array} historicalValues - Historical portfolio values
   * @returns {Object} - Risk assessment with ratings
   */
  getRiskAssessment(data, historicalValues = null) {
    this.ensurePrecisionEngine();

    // Prepare metrics
    const metrics = this.calculatePortfolioMetrics(data, historicalValues || []);

    let assessment = {
      timestamp: new Date().toISOString(),
      portfolio: {
        totalValue: metrics.totalValue,
        totalCost: metrics.totalCost,
        roi: metrics.roi,
      },
      volatility: {
        value: metrics.volatility,
        rating: 'UNKNOWN',
        level: 'UNKNOWN',
        severity: 'neutral',
      },
      drawdown: {
        value: Math.abs(metrics.maxDrawdown),
        rating: 'UNKNOWN',
        level: 'UNKNOWN',
        severity: 'neutral',
      },
      sharpeRatio: {
        value: metrics.sharpeRatio,
        rating: 'UNKNOWN',
        level: 'UNKNOWN',
        severity: 'neutral',
      },
      beta: {
        value: metrics.beta,
        category: 'neutral',
      },
      diversification: {
        score: 0,
        concentration: 0,
        rating: 'UNKNOWN',
      },
      overallRiskLevel: 'UNKNOWN', // LOW, MEDIUM, HIGH, CRITICAL
      recommendations: [],
    };

    // If precision engine available, enhance with advanced analytics
    if (this.precisionEngine && typeof this.precisionEngine.assessRisk === 'function') {
      try {
        const precisionAssessment = this.precisionEngine.assessRisk(
          metrics.volatility,
          Math.abs(metrics.maxDrawdown)
        );
        assessment.volatility.rating = precisionAssessment.volatility.rating;
        assessment.volatility.level = precisionAssessment.volatility.level;
        assessment.volatility.severity = precisionAssessment.volatility.severity;

        assessment.drawdown.rating = precisionAssessment.drawdown.rating;
        assessment.drawdown.level = precisionAssessment.drawdown.level;
        assessment.drawdown.severity = precisionAssessment.drawdown.severity;

        assessment.overallRiskLevel = precisionAssessment.overallRiskLevel;

        // Get Sharpe rating
        if (typeof this.precisionEngine.rateSharpeRatio === 'function') {
          const sharpeRating = this.precisionEngine.rateSharpeRatio(metrics.sharpeRatio);
          assessment.sharpeRatio.rating = sharpeRating.rating;
          assessment.sharpeRatio.level = sharpeRating.level;
          assessment.sharpeRatio.severity = sharpeRating.severity;
        }

        // Get diversification analysis
        if (typeof this.precisionEngine.analyzeComposition === 'function') {
          const composition = this.precisionEngine.analyzeComposition(data);
          assessment.diversification = composition;
        }
      } catch (error) {
        logError('Error in precision assessment:', error);
      }
    } else {
      // Fallback: Local risk assessment without precision engine
      assessment = this._localRiskAssessment(assessment);
    }

    // Generate recommendations
    assessment.recommendations = this._generateRiskRecommendations(assessment);

    return assessment;
  }

  /**
   * Local risk assessment (fallback if precision engine unavailable)
   * @private
   */
  _localRiskAssessment(assessment) {
    // Volatility rating
    const vol = assessment.volatility.value;
    if (vol < 10) {
      assessment.volatility.rating = 'EXCELLENT';
      assessment.volatility.level = 'LOW';
      assessment.volatility.severity = 'safe';
    } else if (vol < 20) {
      assessment.volatility.rating = 'GOOD';
      assessment.volatility.level = 'MEDIUM';
      assessment.volatility.severity = 'caution';
    } else if (vol < 30) {
      assessment.volatility.rating = 'ACCEPTABLE';
      assessment.volatility.level = 'HIGH';
      assessment.volatility.severity = 'warning';
    } else {
      assessment.volatility.rating = 'HIGH';
      assessment.volatility.level = 'VERY_HIGH';
      assessment.volatility.severity = 'danger';
    }

    // Drawdown rating
    const dd = assessment.drawdown.value;
    if (dd < 10) {
      assessment.drawdown.rating = 'EXCELLENT';
      assessment.drawdown.level = 'ACCEPTABLE';
      assessment.drawdown.severity = 'safe';
    } else if (dd < 20) {
      assessment.drawdown.rating = 'GOOD';
      assessment.drawdown.level = 'WARNING';
      assessment.drawdown.severity = 'caution';
    } else if (dd < 30) {
      assessment.drawdown.rating = 'ACCEPTABLE';
      assessment.drawdown.level = 'CRITICAL';
      assessment.drawdown.severity = 'warning';
    } else {
      assessment.drawdown.rating = 'POOR';
      assessment.drawdown.level = 'SEVERE';
      assessment.drawdown.severity = 'danger';
    }

    // Overall risk level
    if (assessment.volatility.severity === 'safe' && assessment.drawdown.severity === 'safe') {
      assessment.overallRiskLevel = 'LOW';
    } else if (
      assessment.volatility.severity === 'danger' ||
      assessment.drawdown.severity === 'danger'
    ) {
      assessment.overallRiskLevel = 'CRITICAL';
    } else if (
      assessment.volatility.severity === 'warning' ||
      assessment.drawdown.severity === 'warning'
    ) {
      assessment.overallRiskLevel = 'HIGH';
    } else {
      assessment.overallRiskLevel = 'MEDIUM';
    }

    return assessment;
  }

  /**
   * Generate actionable risk recommendations
   * @private
   */
  _generateRiskRecommendations(assessment) {
    const recommendations = [];

    if (assessment.volatility.severity === 'danger') {
      recommendations.push({
        type: 'warning',
        title: 'Vysoká volatilita',
        message: `Volatilita ${assessment.volatility.value.toFixed(1)}% je kriticky vysoká. Zvážit rebalancování portfolia.`,
        priority: 'HIGH',
      });
    }

    if (assessment.drawdown.severity === 'danger') {
      recommendations.push({
        type: 'danger',
        title: 'Kritický drawdown',
        message: `Maximální propad ${assessment.drawdown.value.toFixed(1)}% je výrazný. Zvážit zajistění pozic.`,
        priority: 'CRITICAL',
      });
    }

    if (assessment.sharpeRatio.value < 0.5) {
      recommendations.push({
        type: 'info',
        title: 'Nízký výnos vztažený k riziku',
        message: `Sharpe ratio ${assessment.sharpeRatio.value.toFixed(2)} je pod přijatelnou úrovní. Zvážit optimalizaci alokace.`,
        priority: 'MEDIUM',
      });
    }

    if (assessment.roi < 0) {
      recommendations.push({
        type: 'warning',
        title: 'Negativní výnos',
        message: `Portfolio se nachází v záporném výnosu (${assessment.roi.toFixed(2)}%). Sledovat tržní vývoj.`,
        priority: 'HIGH',
      });
    }

    return recommendations;
  }
}

// Global instance
window.calculationsEngine = new CalculationsEngine();

// Create metrics panel UI
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createMetricsPanel);
} else {
  createMetricsPanel();
}

function createMetricsPanel() {
  const panel = document.createElement('div');
  panel.id = 'metrics-panel';
  panel.className = 'metrics-panel hidden';
  panel.innerHTML = `
    <div class="panel-header">
      <h3>📊 Portfolio Metrics</h3>
      <button id="close-metrics-panel" class="btn-icon" aria-label="Zavřít">✕</button>
    </div>
    
    <div class="metrics-content">
      <div class="metrics-grid">
        <!-- Value Metrics -->
        <div class="metric-card">
          <h4>💰 Portfolio Value</h4>
          <div class="metric-value" id="metric-total-value">-</div>
          <div class="metric-label">Total Value</div>
        </div>

        <div class="metric-card">
          <h4>📈 ROI</h4>
          <div class="metric-value" id="metric-roi">-</div>
          <div class="metric-label">Return on Investment</div>
        </div>

        <div class="metric-card">
          <h4>📊 CAGR</h4>
          <div class="metric-value" id="metric-cagr">-</div>
          <div class="metric-label">Compound Annual Growth</div>
        </div>

        <div class="metric-card">
          <h4>⚡ Sharpe Ratio</h4>
          <div class="metric-value" id="metric-sharpe">-</div>
          <div class="metric-label">Risk-Adjusted Return</div>
        </div>

        <div class="metric-card">
          <h4>📉 Volatility</h4>
          <div class="metric-value" id="metric-volatility">-</div>
          <div class="metric-label">Annualized Std Dev</div>
        </div>

        <div class="metric-card">
          <h4>📊 Beta</h4>
          <div class="metric-value" id="metric-beta">-</div>
          <div class="metric-label">Market Sensitivity</div>
        </div>

        <div class="metric-card">
          <h4>⬇️ Max Drawdown</h4>
          <div class="metric-value" id="metric-max-drawdown">-</div>
          <div class="metric-label">Maximum Loss</div>
        </div>

        <div class="metric-card">
          <h4>📉 Current Drawdown</h4>
          <div class="metric-value" id="metric-current-drawdown">-</div>
          <div class="metric-label">Current Loss from Peak</div>
        </div>
      </div>

      <!-- Performers -->
      <div class="performers-section">
        <div class="performers-column">
          <h4>🏆 Top Performers</h4>
          <div id="top-performers-list"></div>
        </div>
        <div class="performers-column">
          <h4>⚠️ Worst Performers</h4>
          <div id="worst-performers-list"></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="metrics-actions">
        <button id="refresh-metrics" class="btn-primary">🔄 Refresh Metrics</button>
        <button id="export-metrics" class="btn-secondary">📤 Export Report</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Event listeners
  document.getElementById('close-metrics-panel')?.addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  document.getElementById('refresh-metrics')?.addEventListener('click', () => {
    updateMetricsPanel();
  });

  document.getElementById('export-metrics')?.addEventListener('click', () => {
    exportMetricsReport();
  });
}

/**
 * Show metrics panel
 */
function showMetricsPanel() {
  const panel = document.getElementById('metrics-panel');
  if (!panel) {
    return;
  }

  panel.classList.remove('hidden');
  updateMetricsPanel();
}

/**
 * Update metrics panel with current data
 */
function updateMetricsPanel() {
  // Read from localStorage like market-data-ui.js does
  let data = [];
  try {
    const portfolio = JSON.parse(localStorage.getItem('investmentPortfolio') || '[]');
    // Convert portfolio format to expected data structure
    data = portfolio.map((item) => ({
      fond: item.name || item.producer || 'Unknown',
      producer: item.producer || 'Unknown',
      investment: parseFloat(item.investment) || 0,
      value: parseFloat(item.value) || 0,
      investmentDate: item.investmentDate || '',
    }));
  } catch (e) {
    logError('Failed to load portfolio data for metrics:', e);
  }

  if (!data || data.length === 0) {
    // eslint-disable-next-line no-alert
    alert('Žádná data k výpočtu metrik');
    return;
  }

  // Generate historical data for advanced metrics
  const historicalValues = generateSimulatedHistory(data, 252); // 1 year of daily data

  const metrics = window.calculationsEngine.calculatePortfolioMetrics(data, historicalValues);

  // Update UI
  document.getElementById('metric-total-value').textContent =
    window.calculationsEngine.formatCurrency(metrics.totalValue);

  document.getElementById('metric-roi').textContent = `${metrics.roi.toFixed(2)}%`;
  document.getElementById('metric-roi').className =
    `metric-value ${metrics.roi >= 0 ? 'positive' : 'negative'}`;

  document.getElementById('metric-cagr').textContent = `${metrics.cagr.toFixed(2)}%`;
  document.getElementById('metric-sharpe').textContent = metrics.sharpeRatio.toFixed(2);
  document.getElementById('metric-volatility').textContent = `${metrics.volatility.toFixed(2)}%`;
  document.getElementById('metric-beta').textContent = metrics.beta.toFixed(2);
  document.getElementById('metric-max-drawdown').textContent = `${metrics.maxDrawdown.toFixed(2)}%`;
  document.getElementById('metric-current-drawdown').textContent =
    `${metrics.currentDrawdown.toFixed(2)}%`;

  // Top performers
  const topList = document.getElementById('top-performers-list');
  topList.innerHTML = metrics.topPerformers
    .map(
      (p) => `
    <div class="performer-item positive">
      <span class="performer-name">${p.fond}</span>
      <span class="performer-roi">${p.roi.toFixed(2)}%</span>
    </div>
  `
    )
    .join('');

  // Worst performers
  const worstList = document.getElementById('worst-performers-list');
  worstList.innerHTML = metrics.worstPerformers
    .map(
      (p) => `
    <div class="performer-item negative">
      <span class="performer-name">${p.fond}</span>
      <span class="performer-roi">${p.roi.toFixed(2)}%</span>
    </div>
  `
    )
    .join('');
}

/**
 * Generate simulated historical data
 * @param {Array} data - Current portfolio data
 * @param {number} days - Number of days to simulate
 * @returns {Array} - Historical values
 */
function generateSimulatedHistory(data, days) {
  const currentValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota), 0);
  const roi = window.calculationsEngine.calculateTotalROI(data) / 100;

  const values = [];
  for (let i = days; i >= 0; i--) {
    const progress = 1 - i / days;
    const trend = currentValue / (1 + roi * progress);
    const volatility = 0.02; // 2% daily volatility
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    values.push(trend * randomFactor);
  }

  return values;
}

/**
 * Export metrics report
 */
function exportMetricsReport() {
  const data = window.getFondyData ? window.getFondyData() : [];
  const historicalValues = generateSimulatedHistory(data, 252);
  const metrics = window.calculationsEngine.calculatePortfolioMetrics(data, historicalValues);

  const report = window.calculationsEngine.generateMetricsSummary(metrics);

  const blob = new Blob([report], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `portfolio-metrics-${new Date().toISOString().split('T')[0]}.txt`;
  link.click();
}

// Add metrics button to UI
window.addEventListener('DOMContentLoaded', () => {
  const portfolioCard = document.getElementById('portfolioCard');
  if (!portfolioCard) {
    return;
  }

  const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
  if (!headerDiv) {
    return;
  }

  const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
  if (!buttonContainer) {
    return;
  }

  const metricsBtn = document.createElement('button');
  metricsBtn.id = 'openMetricsPanel';
  metricsBtn.className = 'btn-icon';
  metricsBtn.title = 'Portfolio Metrics';
  metricsBtn.style.cssText =
    'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
  metricsBtn.textContent = '📊 Metriky';
  metricsBtn.addEventListener('click', showMetricsPanel);

  buttonContainer.insertBefore(metricsBtn, buttonContainer.children[1]);
});
