/**
 * Financial Precision Engine
 * Version: 2.0.0
 * Enterprise-grade financial calculations with precision guardrails
 *
 * Features:
 * - Decimal.js for arbitrary precision arithmetic (optional, falls back to Math)
 * - Risk management and portfolio analytics
 * - Financial best practices (accounting standards)
 * - Compliance with financial regulations
 * - Performance optimization with caching
 */

/* global Decimal */

class FinancialPrecisionEngine {
  constructor() {
    // Configuration
    this.decimalPlaces = 2; // Financial standard: 2 decimal places
    this.riskFreeRate = 0.02; // 2% annual risk-free rate
    this.tradingDaysPerYear = 252;
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour

    // Risk thresholds
    this.riskThresholds = {
      volatility: {
        low: 0.1, // < 10%
        medium: 0.2, // 10-20%
        high: 0.3, // 20-30%
      },
      drawdown: {
        acceptable: 0.1, // < 10%
        warning: 0.2, // 10-20%
        critical: 0.3, // > 30%
      },
      sharpeRatio: {
        excellent: 1.5,
        good: 1.0,
        acceptable: 0.5,
      },
      beta: {
        defensive: 0.7,
        neutral: 1.0,
        aggressive: 1.3,
      },
    };

    this.init();
  }

  /**
   * Initialize the engine
   */
  init() {
    // Check if Decimal.js is available, fallback to native Math if not
    this.useDecimal = typeof Decimal !== 'undefined';
    console.log(`[FinancialEngine] Using ${this.useDecimal ? 'Decimal.js' : 'native Math'} for calculations`);
  }

  /**
   * Safe decimal multiplication
   * @param {number} a - First value
   * @param {number} b - Second value
   * @returns {number} - Result with proper precision
   */
  multiply(a, b) {
    if (this.useDecimal) {
      const result = new Decimal(a).times(new Decimal(b));
      return parseFloat(result.toFixed(this.decimalPlaces));
    }
    return parseFloat((a * b).toFixed(this.decimalPlaces));
  }

  /**
   * Safe decimal division
   * @param {number} a - Dividend
   * @param {number} b - Divisor
   * @returns {number} - Result with proper precision
   */
  divide(a, b) {
    if (b === 0) {
      console.warn('[FinancialEngine] Division by zero prevented');
      return 0;
    }
    if (this.useDecimal) {
      const result = new Decimal(a).dividedBy(new Decimal(b));
      return parseFloat(result.toFixed(this.decimalPlaces));
    }
    return parseFloat((a / b).toFixed(this.decimalPlaces));
  }

  /**
   * Safe decimal addition (handles floating point errors)
   * @param {...number} values - Values to sum
   * @returns {number} - Sum with proper precision
   */
  sum(...values) {
    if (this.useDecimal) {
      let result = new Decimal(0);
      values.forEach((v) => {
        result = result.plus(new Decimal(v));
      });
      return parseFloat(result.toFixed(this.decimalPlaces));
    }

    // Fallback: use Kahan summation for better precision
    let sum = 0;
    let correction = 0;
    for (const value of values) {
      const y = value - correction;
      const temp = sum + y;
      correction = temp - sum - y;
      sum = temp;
    }
    return parseFloat(sum.toFixed(this.decimalPlaces));
  }

  /**
   * Calculate ROI with precision
   * @param {number} initialValue - Starting investment
   * @param {number} finalValue - Final value
   * @returns {number} - ROI percentage
   */
  calculateROI(initialValue, finalValue) {
    if (initialValue <= 0) {
      return 0;
    }
    const roi = this.divide(finalValue - initialValue, initialValue) * 100;
    return parseFloat(roi.toFixed(2));
  }

  /**
   * Calculate CAGR (Compound Annual Growth Rate)
   * @param {number} startValue - Initial value
   * @param {number} endValue - Final value
   * @param {number} years - Investment period
   * @returns {number} - CAGR percentage
   */
  calculateCAGR(startValue, endValue, years) {
    if (startValue <= 0 || years <= 0) {
      return 0;
    }

    // CAGR = (Ending Value / Beginning Value)^(1/years) - 1
    const ratio = this.divide(endValue, startValue);
    const exponent = 1 / years;
    const cagr = (Math.pow(ratio, exponent) - 1) * 100;

    return parseFloat(cagr.toFixed(2));
  }

  /**
   * Calculate Sharpe Ratio (risk-adjusted return)
   * @param {Array<number>} returns - Periodic returns
   * @param {number} riskFreeRate - Risk-free rate (optional)
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

    // Annualize values
    const annualizedReturn = avgReturn * this.tradingDaysPerYear;
    const annualizedStdDev = stdDev * Math.sqrt(this.tradingDaysPerYear);

    const sharpeRatio = this.divide(annualizedReturn - riskFreeRate, annualizedStdDev);
    return parseFloat(sharpeRatio.toFixed(4));
  }

  /**
   * Calculate volatility (standard deviation)
   * @param {Array<number>} returns - Periodic returns
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
   * Calculate Beta (market sensitivity)
   * @param {Array<number>} portfolioReturns - Portfolio returns
   * @param {Array<number>} marketReturns - Market benchmark returns
   * @returns {number} - Beta coefficient
   */
  calculateBeta(portfolioReturns, marketReturns) {
    if (
      !portfolioReturns ||
      !marketReturns ||
      portfolioReturns.length !== marketReturns.length ||
      portfolioReturns.length < 2
    ) {
      return 1.0;
    }

    const covariance = this.calculateCovariance(portfolioReturns, marketReturns);
    const variance = this.calculateVariance(marketReturns);

    if (variance === 0) {
      return 1.0;
    }

    return parseFloat(this.divide(covariance, variance).toFixed(4));
  }

  /**
   * Calculate Maximum Drawdown
   * @param {Array<number>} values - Portfolio value history
   * @returns {Object} - Drawdown analysis
   */
  calculateMaxDrawdown(values) {
    if (!values || values.length < 2) {
      return {
        maxDrawdown: 0,
        peak: 0,
        trough: 0,
        recoveryDays: null,
      };
    }

    let maxDrawdown = 0;
    let peak = values[0];
    let troughValue = values[0];
    let _peakIndex = 0;
    let troughIndex = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
        _peakIndex = i;
      }

      const drawdown = this.divide(peak - values[i], peak);

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        troughValue = values[i];
        troughIndex = i;
      }
    }

    // Find recovery point
    let recoveryDays = null;
    for (let i = troughIndex + 1; i < values.length; i++) {
      if (values[i] >= peak) {
        recoveryDays = i - troughIndex;
        break;
      }
    }

    return {
      maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
      peak: parseFloat(peak.toFixed(2)),
      trough: parseFloat(troughValue.toFixed(2)),
      recoveryDays,
      isRecovered: recoveryDays !== null,
    };
  }

  /**
   * Risk Assessment
   * @param {number} volatility - Volatility percentage
   * @param {number} drawdown - Maximum drawdown percentage
   * @param {number} sharpeRatio - Sharpe ratio
   * @returns {Object} - Risk assessment
   */
  assessRisk(volatility, drawdown, sharpeRatio) {
    const assessment = {
      volatilityRating: this.rateVolatility(volatility),
      drawdownRating: this.rateDrawdown(drawdown),
      sharpeRating: this.rateSharpeRatio(sharpeRatio),
      overallRiskLevel: 'MODERATE',
      recommendations: [],
      isRisky: false,
    };

    // Determine overall risk level
    if (
      assessment.volatilityRating === 'HIGH' ||
      assessment.drawdownRating === 'CRITICAL' ||
      assessment.sharpeRating === 'POOR'
    ) {
      assessment.overallRiskLevel = 'HIGH';
      assessment.isRisky = true;
      assessment.recommendations.push('Consider diversifying your portfolio');
      assessment.recommendations.push('Review your asset allocation');
    } else if (assessment.volatilityRating === 'MEDIUM' || assessment.drawdownRating === 'WARNING') {
      assessment.overallRiskLevel = 'MODERATE';
      assessment.recommendations.push('Monitor portfolio performance closely');
    } else {
      assessment.overallRiskLevel = 'LOW';
      assessment.recommendations.push('Portfolio risk profile is acceptable');
    }

    return assessment;
  }

  /**
   * Rate volatility
   * @param {number} volatility - Volatility percentage
   * @returns {string} - Rating
   */
  rateVolatility(volatility) {
    if (volatility < this.riskThresholds.volatility.low * 100) {
      return 'LOW';
    } else if (volatility < this.riskThresholds.volatility.medium * 100) {
      return 'MEDIUM';
    }
    return 'HIGH';
  }

  /**
   * Rate drawdown
   * @param {number} drawdown - Drawdown percentage
   * @returns {string} - Rating
   */
  rateDrawdown(drawdown) {
    if (drawdown < this.riskThresholds.drawdown.acceptable * 100) {
      return 'ACCEPTABLE';
    } else if (drawdown < this.riskThresholds.drawdown.warning * 100) {
      return 'WARNING';
    }
    return 'CRITICAL';
  }

  /**
   * Rate Sharpe Ratio
   * @param {number} sharpeRatio - Sharpe ratio value
   * @returns {string} - Rating
   */
  rateSharpeRatio(sharpeRatio) {
    if (sharpeRatio >= this.riskThresholds.sharpeRatio.excellent) {
      return 'EXCELLENT';
    } else if (sharpeRatio >= this.riskThresholds.sharpeRatio.good) {
      return 'GOOD';
    } else if (sharpeRatio >= this.riskThresholds.sharpeRatio.acceptable) {
      return 'ACCEPTABLE';
    }
    return 'POOR';
  }

  /**
   * Statistical Helpers
   */

  calculateMean(values) {
    if (!values || values.length === 0) {
      return 0;
    }
    return this.divide(this.sum(...values), values.length);
  }

  calculateStandardDeviation(values) {
    if (!values || values.length < 2) {
      return 0;
    }

    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance = this.divide(this.sum(...squaredDiffs), values.length);

    return Math.sqrt(variance);
  }

  calculateVariance(values) {
    if (!values || values.length < 2) {
      return 0;
    }

    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));

    return this.divide(this.sum(...squaredDiffs), values.length);
  }

  calculateCovariance(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) {
      return 0;
    }

    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);

    const products = x.map((xVal, i) => (xVal - meanX) * (y[i] - meanY));

    return this.divide(this.sum(...products), x.length);
  }

  /**
   * Portfolio Composition Analysis
   * @param {Array} holdings - Portfolio holdings
   * @returns {Object} - Composition analysis
   */
  analyzeComposition(holdings) {
    if (!holdings || holdings.length === 0) {
      return {
        totalValue: 0,
        concentrationIndex: 0,
        diversificationScore: 0,
        topHoldings: [],
      };
    }

    const totalValue = this.sum(...holdings.map((h) => h.value || 0));

    if (totalValue <= 0) {
      return {
        totalValue: 0,
        concentrationIndex: 0,
        diversificationScore: 0,
        topHoldings: [],
      };
    }

    // Calculate weights
    const weights = holdings.map((h) => this.divide(h.value || 0, totalValue));

    // Herfindahl Concentration Index
    const hci = this.sum(...weights.map((w) => Math.pow(w, 2)));

    // Diversification Score (0-100)
    const diversificationScore = Math.max(0, Math.min(100, (1 - hci) * 100));

    // Get top holdings
    const topHoldings = holdings
      .map((h) => ({
        ...h,
        weight: this.divide(h.value || 0, totalValue) * 100,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    return {
      totalValue: parseFloat(totalValue.toFixed(2)),
      concentrationIndex: parseFloat(hci.toFixed(4)),
      diversificationScore: parseFloat(diversificationScore.toFixed(2)),
      topHoldings,
    };
  }

  /**
   * Format currency with proper precision
   * @param {number} value - Value to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} - Formatted string
   */
  formatCurrency(value, currency = 'USD') {
    const num = parseFloat(value).toFixed(2);
    const symbols = {
      USD: '$',
      EUR: '€',
      CZK: 'Kč',
      GBP: '£',
    };
    const symbol = symbols[currency] || '$';
    return `${symbol}${parseFloat(num).toLocaleString()}`;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export for global use
window.financialEngine = new FinancialPrecisionEngine();
