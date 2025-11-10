/**
 * Advanced Risk Metrics Engine
 * Professional-grade risk analytics for institutional portfolios
 *
 * Implements:
 * - Value at Risk (VaR) - Parametric, Historical, Monte Carlo
 * - Conditional Value at Risk (CVaR/Expected Shortfall)
 * - Sortino Ratio (downside deviation focus)
 * - Calmar Ratio (return per unit of drawdown)
 * - Information Ratio (active return per tracking error)
 * - Omega Ratio (probability of outperformance)
 * - Maximum Drawdown Duration
 * - Recovery Factor
 * - Ulcer Index
 *
 * Version: 1.0.0
 * Enterprise-Grade Financial Metrics
 */

/* global Decimal */

class AdvancedRiskMetricsEngine {
  constructor() {
    this.confidenceLevel = 0.95; // 95% confidence for VaR
    this.riskFreeRate = 0.02; // 2% annual
    this.tradingDaysPerYear = 252;
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour

    this.init();
  }

  /**
   * Initialize metrics engine
   */
  init() {
    this.useDecimal = typeof Decimal !== 'undefined';
    console.log(`[AdvancedRiskMetrics] Using ${this.useDecimal ? 'Decimal.js' : 'native Math'}`);
  }

  // ==================== VALUE AT RISK ====================

  /**
   * Calculate Value at Risk (VaR) using Parametric method
   * VaR = Mean(returns) - Z-score * StdDev(returns)
   *
   * @param {Array} returns - Historical returns
   * @param {number} confidenceLevel - Confidence level (default 0.95 = 95%)
   * @returns {number} - VaR value (loss threshold)
   */
  calculateParametricVaR(returns, confidenceLevel = this.confidenceLevel) {
    if (!returns || returns.length < 30) {
      return 0; // Need sufficient data
    }

    const mean = this._calculateMean(returns);
    const stdDev = this._calculateStandardDeviation(returns);

    // Z-score for confidence level (95% = 1.645, 99% = 2.326)
    const zScore = this._getZScore(confidenceLevel);

    // VaR = Mean - Z-score * StdDev
    const var_value = mean - zScore * stdDev;

    return parseFloat((Math.abs(var_value) * 100).toFixed(2));
  }

  /**
   * Calculate Value at Risk using Historical method
   * Sorts returns and finds the percentile corresponding to confidence level
   *
   * @param {Array} returns - Historical returns
   * @param {number} confidenceLevel - Confidence level (default 0.95)
   * @returns {number} - VaR value (loss threshold percentage)
   */
  calculateHistoricalVaR(returns, confidenceLevel = this.confidenceLevel) {
    if (!returns || returns.length < 30) {
      return 0;
    }

    // Sort returns in ascending order (worst to best)
    const sortedReturns = [...returns].sort((a, b) => a - b);

    // Calculate the percentile index
    const percentileIndex = Math.ceil((1 - confidenceLevel) * sortedReturns.length);
    const varReturn = sortedReturns[percentileIndex];

    return parseFloat((Math.abs(varReturn) * 100).toFixed(2));
  }

  /**
   * Calculate Value at Risk using Monte Carlo simulation
   * Simulates portfolio returns based on historical distribution
   *
   * @param {Array} returns - Historical returns
   * @param {number} simulations - Number of simulations (default 10000)
   * @param {number} confidenceLevel - Confidence level
   * @returns {number} - VaR value (loss threshold percentage)
   */
  calculateMonteCarloVaR(returns, simulations = 10000, confidenceLevel = this.confidenceLevel) {
    if (!returns || returns.length < 30) {
      return 0;
    }

    const mean = this._calculateMean(returns);
    const stdDev = this._calculateStandardDeviation(returns);

    // Generate simulated returns
    const simulatedReturns = [];
    for (let i = 0; i < simulations; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const simulatedReturn = mean + z * stdDev;
      simulatedReturns.push(simulatedReturn);
    }

    // Sort and find VaR
    simulatedReturns.sort((a, b) => a - b);
    const index = Math.ceil((1 - confidenceLevel) * simulations);
    const varReturn = simulatedReturns[index];

    return parseFloat((Math.abs(varReturn) * 100).toFixed(2));
  }

  // ==================== CONDITIONAL VALUE AT RISK ====================

  /**
   * Calculate Conditional Value at Risk (CVaR) / Expected Shortfall
   * Average loss beyond VaR threshold
   *
   * @param {Array} returns - Historical returns
   * @param {number} confidenceLevel - Confidence level
   * @returns {number} - CVaR value (average loss beyond VaR)
   */
  calculateCVaR(returns, confidenceLevel = this.confidenceLevel) {
    if (!returns || returns.length < 30) {
      return 0;
    }

    const var_value = this.calculateHistoricalVaR(returns, confidenceLevel) / 100;

    // Find all returns worse than VaR
    const worseThanVaR = returns.filter((r) => r < -var_value);

    if (worseThanVaR.length === 0) {
      return parseFloat((var_value * 100).toFixed(2));
    }

    // Calculate average of returns worse than VaR
    const cvar = (worseThanVaR.reduce((a, b) => a + b, 0) / worseThanVaR.length) * 100;

    return parseFloat(Math.abs(cvar).toFixed(2));
  }

  // ==================== SORTINO RATIO ====================

  /**
   * Calculate Sortino Ratio
   * Similar to Sharpe but only penalizes downside volatility
   * Sortino = (Return - Risk-free) / Downside Deviation
   *
   * @param {Array} returns - Portfolio returns
   * @param {number} targetReturn - Target return threshold (default 0)
   * @returns {number} - Sortino ratio
   */
  calculateSortino(returns, targetReturn = 0) {
    if (!returns || returns.length < 2) {
      return 0;
    }

    const mean = this._calculateMean(returns);
    const downsideDeviation = this._calculateDownsideDeviation(returns, targetReturn);

    if (downsideDeviation === 0) {
      return 0;
    }

    // Annualize return and downside deviation
    const annualizedReturn = mean * this.tradingDaysPerYear;
    const annualizedDownsideDev = downsideDeviation * Math.sqrt(this.tradingDaysPerYear);

    const sortino = (annualizedReturn - this.riskFreeRate) / annualizedDownsideDev;

    return parseFloat(sortino.toFixed(2));
  }

  /**
   * Calculate downside deviation
   * Standard deviation of returns below target return
   *
   * @private
   * @param {Array} returns - Returns array
   * @param {number} targetReturn - Target return threshold
   * @returns {number} - Downside deviation
   */
  _calculateDownsideDeviation(returns, targetReturn = 0) {
    const downsideReturns = returns.filter((r) => r < targetReturn);

    if (downsideReturns.length === 0) {
      return 0;
    }

    const mean = downsideReturns.reduce((a, b) => a + b, 0) / downsideReturns.length;
    const variance =
      downsideReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / downsideReturns.length;

    return Math.sqrt(variance);
  }

  // ==================== CALMAR RATIO ====================

  /**
   * Calculate Calmar Ratio
   * Annual return / Maximum drawdown
   * Higher is better - indicates return per unit of drawdown risk
   *
   * @param {Array} values - Portfolio values over time
   * @returns {number} - Calmar ratio
   */
  calculateCalmarRatio(values) {
    if (!values || values.length < 2) {
      return 0;
    }

    // Calculate annual return
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const years = 1; // Assume 1 year for simplicity
    const totalReturn = (endValue - startValue) / startValue;
    const annualizedReturn = totalReturn / years;

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = values[0];

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
      }
      const drawdown = (peak - values[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    if (maxDrawdown === 0) {
      return 0;
    }

    const calmarRatio = annualizedReturn / maxDrawdown;

    return parseFloat(calmarRatio.toFixed(2));
  }

  // ==================== INFORMATION RATIO ====================

  /**
   * Calculate Information Ratio
   * (Portfolio return - Benchmark return) / Tracking error
   * Measures active management skill
   *
   * @param {Array} portfolioReturns - Portfolio returns
   * @param {Array} benchmarkReturns - Benchmark returns
   * @returns {number} - Information ratio
   */
  calculateInformationRatio(portfolioReturns, benchmarkReturns) {
    if (
      !portfolioReturns ||
      !benchmarkReturns ||
      portfolioReturns.length !== benchmarkReturns.length
    ) {
      return 0;
    }

    const portfolioReturn = this._calculateMean(portfolioReturns);
    const benchmarkReturn = this._calculateMean(benchmarkReturns);
    const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    const trackingError = this._calculateStandardDeviation(excessReturns);

    if (trackingError === 0) {
      return 0;
    }

    const informationRatio = (portfolioReturn - benchmarkReturn) / trackingError;

    return parseFloat(informationRatio.toFixed(2));
  }

  // ==================== OMEGA RATIO ====================

  /**
   * Calculate Omega Ratio
   * Probability-weighted ratio of gains to losses
   * Omega = Probability(Return > Target) * Avg Gain / Probability(Return < Target) * Avg Loss
   *
   * @param {Array} returns - Returns array
   * @param {number} targetReturn - Target return threshold
   * @returns {number} - Omega ratio
   */
  calculateOmegaRatio(returns, targetReturn = 0) {
    if (!returns || returns.length < 2) {
      return 0;
    }

    const gainsCount = returns.filter((r) => r > targetReturn).length;
    const lossesCount = returns.filter((r) => r < targetReturn).length;

    if (lossesCount === 0) {
      return parseFloat((gainsCount / returns.length).toFixed(2));
    }

    const avgGain =
      returns
        .filter((r) => r > targetReturn)
        .reduce((a, b) => a + b, 0) / (gainsCount || 1);
    const avgLoss =
      Math.abs(
        returns
          .filter((r) => r < targetReturn)
          .reduce((a, b) => a + b, 0),
      ) / (lossesCount || 1);

    if (avgLoss === 0) {
      return gainsCount / returns.length;
    }

    const omega = (avgGain * gainsCount) / (avgLoss * lossesCount);

    return parseFloat(omega.toFixed(2));
  }

  // ==================== DRAWDOWN METRICS ====================

  /**
   * Calculate Maximum Drawdown Duration
   * How long it took to recover from worst drawdown
   *
   * @param {Array} values - Portfolio values over time
   * @returns {Object} - Duration analysis
   */
  calculateMaxDrawdownDuration(values) {
    if (!values || values.length < 2) {
      return { maxDuration: 0, currentDuration: 0, recovered: true };
    }

    let maxDrawdown = 0;
    let maxDuration = 0;
    let currentDuration = 0;
    let peak = values[0];
    let recovered = true;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];

        // Check if recovered from previous drawdown
        if (currentDuration > 0) {
          maxDuration = Math.max(maxDuration, currentDuration);
          currentDuration = 0;
        }
      }

      const drawdown = (peak - values[i]) / peak;
      if (drawdown > 0) {
        currentDuration++;

        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }

    // If still in drawdown at end
    if (currentDuration > 0) {
      recovered = false;
    }

    return {
      maxDuration: Math.max(maxDuration, currentDuration),
      currentDuration,
      recovered,
      maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
    };
  }

  // ==================== RECOVERY FACTOR ====================

  /**
   * Calculate Recovery Factor
   * Net profit / Maximum drawdown
   * Higher is better - how many times profit exceeds drawdown
   *
   * @param {Array} values - Portfolio values
   * @param {Array} returns - Portfolio returns
   * @returns {number} - Recovery factor
   */
  calculateRecoveryFactor(values, returns) {
    if (!values || !returns || values.length < 2) {
      return 0;
    }

    const totalReturn = (values[values.length - 1] - values[0]) / values[0];
    const netProfit = totalReturn * 100;

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = values[0];

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
      }
      const drawdown = (peak - values[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown * 100);
    }

    if (maxDrawdown === 0) {
      return 0;
    }

    const recoveryFactor = Math.abs(netProfit) / maxDrawdown;

    return parseFloat(recoveryFactor.toFixed(2));
  }

  // ==================== ULCER INDEX ====================

  /**
   * Calculate Ulcer Index
   * Square root of mean squared drawdowns
   * Measures magnitude and duration of drawdowns
   *
   * @param {Array} values - Portfolio values
   * @returns {number} - Ulcer index (percentage)
   */
  calculateUlcerIndex(values) {
    if (!values || values.length < 2) {
      return 0;
    }

    let runningMax = values[0];
    const drawdowns = [];

    for (let i = 1; i < values.length; i++) {
      if (values[i] > runningMax) {
        runningMax = values[i];
      }

      const drawdown = ((values[i] - runningMax) / runningMax) * 100;
      drawdowns.push(Math.pow(drawdown, 2));
    }

    const meanSquaredDrawdown = drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length;
    const ulcerIndex = Math.sqrt(meanSquaredDrawdown);

    return parseFloat(ulcerIndex.toFixed(2));
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate mean (average)
   * @private
   */
  _calculateMean(returns) {
    if (!returns || returns.length === 0) {
      return 0;
    }
    return returns.reduce((a, b) => a + b, 0) / returns.length;
  }

  /**
   * Calculate standard deviation
   * @private
   */
  _calculateStandardDeviation(returns) {
    if (!returns || returns.length < 2) {
      return 0;
    }

    const mean = this._calculateMean(returns);
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return Math.sqrt(variance);
  }

  /**
   * Get Z-score for confidence level
   * @private
   */
  _getZScore(confidenceLevel) {
    const zScores = {
      0.9: 1.282,
      0.95: 1.645,
      0.99: 2.326,
      0.999: 3.09,
    };

    return zScores[confidenceLevel] || 1.645; // Default to 95%
  }

  /**
   * Generate comprehensive risk metrics report
   */
  generateRiskReport(values, returns) {
    if (!values || !returns) {
      return null;
    }

    return {
      timestamp: new Date().toISOString(),
      valueAtRisk: {
        parametric95: this.calculateParametricVaR(returns, 0.95),
        parametric99: this.calculateParametricVaR(returns, 0.99),
        historical95: this.calculateHistoricalVaR(returns, 0.95),
        historical99: this.calculateHistoricalVaR(returns, 0.99),
        monteCarlo95: this.calculateMonteCarloVaR(returns, 10000, 0.95),
      },
      conditionalValueAtRisk: {
        cvar95: this.calculateCVaR(returns, 0.95),
        cvar99: this.calculateCVaR(returns, 0.99),
      },
      ratios: {
        sortino: this.calculateSortino(returns),
        calmar: this.calculateCalmarRatio(values),
        omega: this.calculateOmegaRatio(returns),
        information: this.calculateInformationRatio(returns, returns.map(() => 0.001)), // Default benchmark
      },
      drawdownMetrics: {
        ulcerIndex: this.calculateUlcerIndex(values),
        maxDrawdownDuration: this.calculateMaxDrawdownDuration(values),
        recoveryFactor: this.calculateRecoveryFactor(values, returns),
      },
    };
  }
}

// Global instance
window.advancedRiskMetrics = new AdvancedRiskMetricsEngine();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedRiskMetricsEngine;
}
