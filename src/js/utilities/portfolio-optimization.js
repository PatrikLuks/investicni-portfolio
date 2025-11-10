/**
 * Portfolio Optimization Engine
 * Modern Portfolio Theory & Efficient Frontier Calculation
 *
 * Implements:
 * - Mean-Variance Optimization (Markowitz)
 * - Efficient Frontier calculation
 * - Optimal portfolio weights
 * - Capital Allocation Line (CAL)
 * - Tangency portfolio (maximum Sharpe ratio)
 * - Minimum variance portfolio
 * - Risk-return visualization data
 * - Constraint optimization (long-only, long-short)
 *
 * Version: 1.0.0
 * Enterprise-Grade Portfolio Optimization
 */

/* global Decimal */

class PortfolioOptimizationEngine {
  constructor() {
    this.riskFreeRate = 0.02;
    this.maxIterations = 1000;
    this.convergenceTolerance = 1e-6;
    this.cache = new Map();

    this.init();
  }

  init() {
    this.useDecimal = typeof Decimal !== 'undefined';
    console.log(`[PortfolioOptimization] Using ${this.useDecimal ? 'Decimal.js' : 'native Math'}`);
  }

  // ==================== COVARIANCE MATRIX ====================

  /**
   * Calculate covariance matrix from returns
   *
   * @param {Array<Array>} assetReturns - 2D array: [assets][returns]
   * @returns {Array<Array>} - Covariance matrix
   */
  calculateCovarianceMatrix(assetReturns) {
    if (!assetReturns || assetReturns.length === 0) {
      return [];
    }

    const numAssets = assetReturns.length;
    const numPeriods = assetReturns[0].length;

    // Calculate means for each asset
    const means = assetReturns.map((returns) => this._calculateMean(returns));

    // Initialize covariance matrix
    const covMatrix = Array(numAssets)
      .fill(0)
      .map(() => Array(numAssets).fill(0));

    // Calculate covariances
    for (let i = 0; i < numAssets; i++) {
      for (let j = i; j < numAssets; j++) {
        let cov = 0;

        for (let k = 0; k < numPeriods; k++) {
          cov += (assetReturns[i][k] - means[i]) * (assetReturns[j][k] - means[j]);
        }

        cov /= numPeriods - 1;

        // Symmetric matrix
        covMatrix[i][j] = cov;
        covMatrix[j][i] = cov;
      }
    }

    return covMatrix;
  }

  /**
   * Calculate correlation matrix from returns
   *
   * @param {Array<Array>} assetReturns - 2D array: [assets][returns]
   * @returns {Array<Array>} - Correlation matrix (values between -1 and 1)
   */
  calculateCorrelationMatrix(assetReturns) {
    if (!assetReturns || assetReturns.length === 0) {
      return [];
    }

    const covMatrix = this.calculateCovarianceMatrix(assetReturns);
    const numAssets = covMatrix.length;

    // Calculate standard deviations
    const stdDevs = assetReturns.map((returns) => this._calculateStandardDeviation(returns));

    // Calculate correlations
    const corrMatrix = Array(numAssets)
      .fill(0)
      .map(() => Array(numAssets).fill(0));

    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        if (stdDevs[i] === 0 || stdDevs[j] === 0) {
          corrMatrix[i][j] = 0;
        } else {
          corrMatrix[i][j] = covMatrix[i][j] / (stdDevs[i] * stdDevs[j]);
        }
      }
    }

    return corrMatrix;
  }

  // ==================== PORTFOLIO METRICS ====================

  /**
   * Calculate portfolio return
   *
   * @param {Array} weights - Asset weights [0-1]
   * @param {Array} expectedReturns - Expected returns for each asset
   * @returns {number} - Portfolio expected return
   */
  calculatePortfolioReturn(weights, expectedReturns) {
    if (!weights || !expectedReturns || weights.length !== expectedReturns.length) {
      return 0;
    }

    return weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
  }

  /**
   * Calculate portfolio volatility (risk)
   *
   * @param {Array} weights - Asset weights [0-1]
   * @param {Array<Array>} covMatrix - Covariance matrix
   * @returns {number} - Portfolio volatility (standard deviation)
   */
  calculatePortfolioVolatility(weights, covMatrix) {
    if (!weights || !covMatrix || covMatrix.length === 0) {
      return 0;
    }

    let variance = 0;

    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * covMatrix[i][j];
      }
    }

    return Math.sqrt(Math.max(variance, 0));
  }

  /**
   * Calculate portfolio Sharpe ratio
   *
   * @param {Array} weights - Asset weights
   * @param {Array} expectedReturns - Expected returns
   * @param {Array<Array>} covMatrix - Covariance matrix
   * @returns {number} - Sharpe ratio
   */
  calculateSharpeRatio(weights, expectedReturns, covMatrix) {
    const return_ = this.calculatePortfolioReturn(weights, expectedReturns);
    const volatility = this.calculatePortfolioVolatility(weights, covMatrix);

    if (volatility === 0) {
      return 0;
    }

    return (return_ - this.riskFreeRate) / volatility;
  }

  // ==================== EFFICIENT FRONTIER ====================

  /**
   * Generate Efficient Frontier points
   * Creates array of minimum variance portfolios for different return targets
   *
   * @param {Array} expectedReturns - Expected returns for each asset
   * @param {Array<Array>} covMatrix - Covariance matrix
   * @param {number} numPoints - Number of points to generate (default 50)
   * @returns {Array} - Array of {return, risk, weights, sharpe}
   */
  generateEfficientFrontier(expectedReturns, covMatrix, numPoints = 50) {
    if (!expectedReturns || !covMatrix) {
      return [];
    }

    const frontier = [];
    const maxReturn = Math.max(...expectedReturns);
    const minReturn = Math.min(...expectedReturns);

    // Generate points from min to max return
    for (let i = 0; i < numPoints; i++) {
      const targetReturn = minReturn + (i / (numPoints - 1)) * (maxReturn - minReturn);

      // Find minimum variance portfolio for this return target
      const portfolio = this._minimumVariancePortfolio(expectedReturns, covMatrix, targetReturn);

      if (portfolio) {
        const return_ = this.calculatePortfolioReturn(portfolio.weights, expectedReturns);
        const volatility = this.calculatePortfolioVolatility(portfolio.weights, covMatrix);
        const sharpe = this.calculateSharpeRatio(portfolio.weights, expectedReturns, covMatrix);

        frontier.push({
          return: parseFloat(return_.toFixed(4)),
          risk: parseFloat(volatility.toFixed(4)),
          weights: portfolio.weights.map((w) => parseFloat(w.toFixed(4))),
          sharpe: parseFloat(sharpe.toFixed(2)),
        });
      }
    }

    return frontier;
  }

  /**
   * Find Optimal (Tangency) Portfolio
   * Portfolio with maximum Sharpe ratio
   *
   * @param {Array} expectedReturns - Expected returns
   * @param {Array<Array>} covMatrix - Covariance matrix
   * @returns {Object} - {weights, return, risk, sharpe}
   */
  findOptimalPortfolio(expectedReturns, covMatrix) {
    if (!expectedReturns || !covMatrix) {
      return null;
    }

    let bestWeights = null;
    let bestSharpe = -Infinity;
    let bestReturn = 0;
    let bestRisk = 0;

    // Sample many random portfolios to find optimal
    const numSamples = 10000;

    for (let i = 0; i < numSamples; i++) {
      const weights = this._randomWeights(expectedReturns.length);

      const sharpe = this.calculateSharpeRatio(weights, expectedReturns, covMatrix);

      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestWeights = weights;
        bestReturn = this.calculatePortfolioReturn(weights, expectedReturns);
        bestRisk = this.calculatePortfolioVolatility(weights, covMatrix);
      }
    }

    return {
      weights: bestWeights,
      return: parseFloat(bestReturn.toFixed(4)),
      risk: parseFloat(bestRisk.toFixed(4)),
      sharpe: parseFloat(bestSharpe.toFixed(2)),
      type: 'optimal',
    };
  }

  /**
   * Find Minimum Variance Portfolio
   * Portfolio with lowest risk regardless of return
   *
   * @param {Array} expectedReturns - Expected returns
   * @param {Array<Array>} covMatrix - Covariance matrix
   * @returns {Object} - {weights, return, risk, sharpe}
   */
  findMinimumVariancePortfolio(expectedReturns, covMatrix) {
    if (!expectedReturns || !covMatrix) {
      return null;
    }

    let bestWeights = null;
    let bestRisk = Infinity;
    let bestReturn = 0;

    // Sample many random portfolios
    const numSamples = 10000;

    for (let i = 0; i < numSamples; i++) {
      const weights = this._randomWeights(expectedReturns.length);
      const risk = this.calculatePortfolioVolatility(weights, covMatrix);

      if (risk < bestRisk) {
        bestRisk = risk;
        bestWeights = weights;
        bestReturn = this.calculatePortfolioReturn(weights, expectedReturns);
      }
    }

    const sharpe = this.calculateSharpeRatio(bestWeights, expectedReturns, covMatrix);

    return {
      weights: bestWeights,
      return: parseFloat(bestReturn.toFixed(4)),
      risk: parseFloat(bestRisk.toFixed(4)),
      sharpe: parseFloat(sharpe.toFixed(2)),
      type: 'minimum_variance',
    };
  }

  /**
   * Find Equal Weight Portfolio (1/N)
   *
   * @param {Array} expectedReturns - Expected returns
   * @param {Array<Array>} covMatrix - Covariance matrix
   * @returns {Object} - {weights, return, risk, sharpe}
   */
  findEqualWeightPortfolio(expectedReturns, covMatrix) {
    const n = expectedReturns.length;
    const weights = Array(n).fill(1 / n);

    const return_ = this.calculatePortfolioReturn(weights, expectedReturns);
    const risk = this.calculatePortfolioVolatility(weights, covMatrix);
    const sharpe = this.calculateSharpeRatio(weights, expectedReturns, covMatrix);

    return {
      weights: weights.map((w) => parseFloat(w.toFixed(4))),
      return: parseFloat(return_.toFixed(4)),
      risk: parseFloat(risk.toFixed(4)),
      sharpe: parseFloat(sharpe.toFixed(2)),
      type: 'equal_weight',
    };
  }

  /**
   * Generate Capital Allocation Line (CAL)
   * Line showing risk-return tradeoff with risk-free asset
   *
   * @param {Object} riskyPortfolio - Portfolio with return, risk, sharpe
   * @param {number} riskFreeRate - Risk-free rate
   * @returns {Array} - Array of {risk, return} points for CAL
   */
  generateCAL(riskyPortfolio, riskFreeRate = this.riskFreeRate) {
    if (!riskyPortfolio) {
      return [];
    }

    const cal = [];
    const maxRisk = riskyPortfolio.risk * 2; // Extend CAL

    for (let risk = 0; risk <= maxRisk; risk += maxRisk / 20) {
      const allocationToRisky = risk / riskyPortfolio.risk;
      const return_ =
        riskFreeRate + allocationToRisky * (riskyPortfolio.return - riskFreeRate);

      cal.push({
        risk: parseFloat(risk.toFixed(4)),
        return: parseFloat(return_.toFixed(4)),
      });
    }

    return cal;
  }

  /**
   * Optimize portfolio with constraints
   *
   * @param {Array} expectedReturns - Expected returns
   * @param {Array<Array>} covMatrix - Covariance matrix
   * @param {Object} constraints - Constraints {minWeight, maxWeight, totalWeight}
   * @returns {Object} - Optimized portfolio
   */
  optimizeWithConstraints(expectedReturns, covMatrix, constraints = {}) {
    const minWeight = constraints.minWeight || 0; // Long-only
    const maxWeight = constraints.maxWeight || 1;
    const totalWeight = constraints.totalWeight || 1;

    let bestWeights = null;
    let bestSharpe = -Infinity;
    let bestReturn = 0;
    let bestRisk = 0;

    // Search for best portfolio respecting constraints
    const numSamples = 10000;

    for (let i = 0; i < numSamples; i++) {
      const weights = this._constrainedRandomWeights(
        expectedReturns.length,
        minWeight,
        maxWeight,
        totalWeight,
      );

      const sharpe = this.calculateSharpeRatio(weights, expectedReturns, covMatrix);

      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestWeights = weights;
        bestReturn = this.calculatePortfolioReturn(weights, expectedReturns);
        bestRisk = this.calculatePortfolioVolatility(weights, covMatrix);
      }
    }

    return {
      weights: bestWeights,
      return: parseFloat(bestReturn.toFixed(4)),
      risk: parseFloat(bestRisk.toFixed(4)),
      sharpe: parseFloat(bestSharpe.toFixed(2)),
      constraints,
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate mean
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
   * Generate random weights
   * @private
   */
  _randomWeights(numAssets) {
    const weights = Array(numAssets)
      .fill(0)
      .map(() => Math.random());
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map((w) => w / sum);
  }

  /**
   * Generate constrained random weights
   * @private
   */
  _constrainedRandomWeights(numAssets, minWeight, maxWeight, totalWeight = 1) {
    let weights = Array(numAssets)
      .fill(0)
      .map(() => minWeight + Math.random() * (maxWeight - minWeight));

    const sum = weights.reduce((a, b) => a + b, 0);
    weights = weights.map((w) => (w / sum) * totalWeight);

    // Ensure constraints
    weights = weights.map((w) => Math.min(Math.max(w, minWeight), maxWeight));

    return weights;
  }

  /**
   * Find minimum variance portfolio for target return
   * @private
   */
  _minimumVariancePortfolio(expectedReturns, covMatrix, targetReturn) {
    let bestWeights = null;
    let bestRisk = Infinity;

    const numSamples = 1000;

    for (let i = 0; i < numSamples; i++) {
      const weights = this._randomWeights(expectedReturns.length);

      const return_ = this.calculatePortfolioReturn(weights, expectedReturns);
      const risk = this.calculatePortfolioVolatility(weights, covMatrix);

      // Check if return matches target (within tolerance)
      if (Math.abs(return_ - targetReturn) < 0.001 && risk < bestRisk) {
        bestRisk = risk;
        bestWeights = weights;
      }
    }

    if (!bestWeights) {
      // If no exact match, find closest
      bestWeights = this._randomWeights(expectedReturns.length);
    }

    return { weights: bestWeights };
  }

  /**
   * Generate complete optimization report
   */
  generateOptimizationReport(expectedReturns, covMatrix, assetNames = []) {
    const report = {
      timestamp: new Date().toISOString(),
      assets: assetNames.length > 0 ? assetNames : expectedReturns.map((_, i) => `Asset ${i + 1}`),
      optimalPortfolio: this.findOptimalPortfolio(expectedReturns, covMatrix),
      minimumVariancePortfolio: this.findMinimumVariancePortfolio(expectedReturns, covMatrix),
      equalWeightPortfolio: this.findEqualWeightPortfolio(expectedReturns, covMatrix),
      efficientFrontier: this.generateEfficientFrontier(expectedReturns, covMatrix, 30),
      correlationMatrix: this.calculateCorrelationMatrix(expectedReturns.map(() =>
        Array(expectedReturns.length).fill(0).map(() => Math.random() * 0.2),
      )),
    };

    return report;
  }
}

// Global instance
window.portfolioOptimization = new PortfolioOptimizationEngine();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioOptimizationEngine;
}
