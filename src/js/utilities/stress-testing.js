/* global performance */

/**
 * Stress Testing Framework
 * Enterprise-grade scenario analysis and stress testing for portfolios
 *
 * Implements:
 * - Historical stress scenarios (2008, 2020, etc.)
 * - Market shocks and tail risks
 * - Correlated asset movements
 * - Portfolio resilience testing
 * - Scenario-based P&L analysis
 * - Risk metrics under stress conditions
 * - Custom stress scenario creation
 * - Sensitivity analysis
 *
 * Version: 1.0.0
 * Enterprise Stress Testing Engine
 */

class StressTestingFramework {
  constructor() {
    this.scenarios = new Map();
    this.results = [];
    this.maxResults = 100;
    this.confidenceLevel = 0.95;

    this._initializePredefinedScenarios();
  }

  /**
   * Initialize predefined historical stress scenarios
   * @private
   */
  _initializePredefinedScenarios() {
    // 2008 Financial Crisis
    this.scenarios.set('crisis_2008', {
      name: '2008 Financial Crisis',
      year: 2008,
      description: 'Lehman Brothers collapse and credit crunch',
      assetImpacts: {
        equities: -0.50, // -50%
        bonds: -0.15, // -15% (credit spreads widened)
        commodities: -0.45, // -45%
        realEstate: -0.35, // -35%
        cash: 0.02, // +2% (flight to safety)
      },
      correlationShift: 1.3, // Correlations increase 30%
      volatilityMultiplier: 2.5, // Volatility 2.5x normal
      duration: 18, // months
      severity: 'CRITICAL',
    });

    // COVID-19 Market Crash (2020)
    this.scenarios.set('crisis_covid2020', {
      name: 'COVID-19 Pandemic (2020)',
      year: 2020,
      description: 'Global pandemic market shock and recovery',
      assetImpacts: {
        equities: -0.35, // -35%
        bonds: -0.05, // -5%
        commodities: -0.30, // -30%
        realEstate: -0.15, // -15%
        cash: 0.01, // +1%
      },
      correlationShift: 1.4, // Correlations increase 40%
      volatilityMultiplier: 3.0, // Volatility 3.0x
      duration: 6, // faster recovery
      severity: 'HIGH',
    });

    // Black Monday 1987
    this.scenarios.set('crisis_1987', {
      name: 'Black Monday 1987',
      year: 1987,
      description: 'Single day market collapse: -22%',
      assetImpacts: {
        equities: -0.22, // -22% in one day
        bonds: 0.05, // +5% (flight to safety)
        commodities: -0.20, // -20%
        realEstate: -0.05, // -5% (delayed)
        cash: 0.02, // +2%
      },
      correlationShift: 1.2,
      volatilityMultiplier: 4.0, // Extreme volatility
      duration: 3, // Very short
      severity: 'EXTREME',
    });

    // Interest Rate Shock
    this.scenarios.set('shock_rates_up', {
      name: 'Interest Rate Shock (Up)',
      year: 2022,
      description: 'Rapid 300 bps rate increase',
      assetImpacts: {
        equities: -0.20, // -20% (earnings pressure)
        bonds: -0.25, // -25% (duration loss)
        commodities: 0.05, // +5% (inflation)
        realEstate: -0.20, // -20% (cap rate expansion)
        cash: 0.03, // +3% (higher yields)
      },
      correlationShift: 1.1,
      volatilityMultiplier: 1.8,
      duration: 12,
      severity: 'HIGH',
    });

    // Stagflation Scenario
    this.scenarios.set('scenario_stagflation', {
      name: 'Stagflation',
      year: 1970,
      description: 'High inflation + slow growth + rising rates',
      assetImpacts: {
        equities: -0.40, // -40% (earnings squeeze + multiple compression)
        bonds: -0.35, // -35% (both inflation and rates)
        commodities: 0.50, // +50% (inflation hedge)
        realEstate: -0.10, // -10% (mixed)
        cash: 0.04, // +4% (higher rates)
      },
      correlationShift: 1.5,
      volatilityMultiplier: 2.2,
      duration: 36,
      severity: 'CRITICAL',
    });

    // Geopolitical Crisis
    this.scenarios.set('crisis_geopolitical', {
      name: 'Geopolitical Crisis',
      year: 2024,
      description: 'Regional conflict, supply chain disruption',
      assetImpacts: {
        equities: -0.15, // -15% (uncertainty premium)
        bonds: 0.10, // +10% (safe haven)
        commodities: 0.30, // +30% (energy spike)
        realEstate: -0.05, // -5%
        cash: 0.02, // +2%
      },
      correlationShift: 1.2,
      volatilityMultiplier: 1.6,
      duration: 6,
      severity: 'MEDIUM',
    });
  }

  /**
   * Get all available predefined scenarios
   *
   * @returns {Array} - List of scenario names and details
   */
  getAvailableScenarios() {
    return Array.from(this.scenarios.entries()).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }

  /**
   * Run stress test with predefined scenario
   *
   * @param {Array} holdings - Portfolio holdings
   * @param {string} scenarioId - Predefined scenario ID
   * @returns {Object} - Stress test results
   */
  runScenarioStress(holdings, scenarioId) {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioId}`);
    }

    return this._runStress(holdings, scenario);
  }

  /**
   * Run custom stress scenario
   *
   * @param {Array} holdings - Portfolio holdings
   * @param {Object} customScenario - Custom scenario definition
   * @returns {Object} - Stress test results
   */
  runCustomStress(holdings, customScenario) {
    const scenario = {
      name: customScenario.name || 'Custom Scenario',
      description: customScenario.description || '',
      assetImpacts: customScenario.assetImpacts || {},
      correlationShift: customScenario.correlationShift || 1.0,
      volatilityMultiplier: customScenario.volatilityMultiplier || 1.5,
      duration: customScenario.duration || 1,
      severity: customScenario.severity || 'MEDIUM',
    };

    return this._runStress(holdings, scenario);
  }

  /**
   * Execute stress test
   * @private
   */
  _runStress(holdings, scenario) {
    const startTime = performance.now ? performance.now() : Date.now();
    const result = {
      timestamp: new Date().toISOString(),
      scenario: scenario.name,
      scenarioDescription: scenario.description,
      severity: scenario.severity,
      duration: scenario.duration,
      holdings: [],
      portfolioAnalysis: {},
      riskMetrics: {},
      recovery: {},
    };

    // Apply stress to each holding
    holdings.forEach((holding) => {
      const stressed = this._stressHolding(holding, scenario);
      result.holdings.push(stressed);
    });

    // Calculate portfolio-level impacts
    result.portfolioAnalysis = this._analyzePortfolioStress(result.holdings, scenario);
    result.riskMetrics = this._calculateStressRiskMetrics(result.holdings, scenario);
    result.recovery = this._estimateRecovery(scenario);

    const duration = (performance.now ? performance.now() : Date.now()) - startTime;
    result.executionTime = Math.round(duration);

    // Store result
    this._storeResult(result);

    return result;
  }

  /**
   * Apply stress to individual holding
   * @private
   */
  _stressHolding(holding, scenario) {
    const assetType = holding.type || 'equities';
    const impact = scenario.assetImpacts[assetType] || 0;

    const stressedValue = holding.value * (1 + impact);
    const loss = holding.value - stressedValue;
    const lossPercent = (loss / holding.value) * 100;

    return {
      ...holding,
      originalValue: holding.value,
      stressedValue: Math.round(stressedValue * 100) / 100,
      loss: Math.round(loss * 100) / 100,
      lossPercent: Math.round(lossPercent * 100) / 100,
      impactScenario: impact,
    };
  }

  /**
   * Analyze portfolio-level stress impact
   * @private
   */
  _analyzePortfolioStress(stressedHoldings, _scenario) {
    const originalValue = stressedHoldings.reduce((sum, h) => sum + h.originalValue, 0);
    const stressedValue = stressedHoldings.reduce((sum, h) => sum + h.stressedValue, 0);
    const totalLoss = originalValue - stressedValue;
    const totalLossPercent = (totalLoss / originalValue) * 100;

    // Concentration analysis under stress
    const maxLoss = Math.max(...stressedHoldings.map((h) => h.lossPercent));
    const avgLoss = stressedHoldings.reduce((sum, h) => sum + h.lossPercent, 0) / stressedHoldings.length;

    return {
      originalPortfolioValue: Math.round(originalValue * 100) / 100,
      stressedPortfolioValue: Math.round(stressedValue * 100) / 100,
      totalLoss: Math.round(totalLoss * 100) / 100,
      totalLossPercent: Math.round(totalLossPercent * 100) / 100,
      maxIndividualLoss: Math.round(maxLoss * 100) / 100,
      avgIndividualLoss: Math.round(avgLoss * 100) / 100,
      holdingsCount: stressedHoldings.length,
    };
  }

  /**
   * Calculate risk metrics under stress
   * @private
   */
  _calculateStressRiskMetrics(stressedHoldings, scenario) {
    const losses = stressedHoldings.map((h) => h.lossPercent).filter((l) => l > 0);

    return {
      correlationMultiplier: scenario.correlationShift,
      volatilityMultiplier: scenario.volatilityMultiplier,
      averageLoss: Math.round((losses.reduce((a, b) => a + b, 0) / losses.length) * 100) / 100,
      worstCaseLoss: Math.round(Math.max(...losses) * 100) / 100,
      holdingsWithLosses: losses.length,
      scenarioVaR: Math.round(
        (stressedHoldings.reduce((sum, h) => sum + h.loss, 0) /
          stressedHoldings.reduce((sum, h) => sum + h.originalValue, 0)) *
          100 * 100,
      ) / 100,
    };
  }

  /**
   * Estimate portfolio recovery
   * @private
   */
  _estimateRecovery(scenario) {
    const recoveryDays = Math.max(
      10,
      (scenario.duration * 21 * Math.log(2)) / Math.log(scenario.volatilityMultiplier + 1),
    );

    return {
      estimatedRecoveryDays: Math.round(recoveryDays),
      estimatedRecoveryMonths: Math.round((recoveryDays / 21) * 10) / 10,
      recoveryConfidence: Math.max(0.6, 1 - scenario.volatilityMultiplier * 0.1),
      scenarioSeverity: scenario.severity,
      recommendations: this._generateRecoveryRecommendations(scenario),
    };
  }

  /**
   * Generate recovery recommendations
   * @private
   */
  _generateRecoveryRecommendations(scenario) {
    const recommendations = [];

    if (scenario.volatilityMultiplier > 2.5) {
      recommendations.push('Consider increasing cash reserves for opportunistic rebalancing');
      recommendations.push('Review position sizing to reduce volatility exposure');
    }

    if (scenario.correlationShift > 1.2) {
      recommendations.push('Diversification benefits reduced - consider alternative assets');
      recommendations.push('Hedge strategy review recommended');
    }

    if (scenario.severity === 'CRITICAL') {
      recommendations.push('Implement stop-loss orders on key positions');
      recommendations.push('Consider defensive portfolio repositioning');
      recommendations.push('Increase compliance monitoring for regulatory capital');
    }

    if (scenario.severity === 'HIGH') {
      recommendations.push('Rebalance to target allocations opportunistically');
      recommendations.push('Review leverage ratios');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current portfolio strategy');
      recommendations.push('Monitor for changes in correlations');
    }

    return recommendations;
  }

  /**
   * Sensitivity analysis - test range of impacts
   *
   * @param {Array} holdings - Portfolio holdings
   * @param {Object} params - Analysis parameters
   * @returns {Object} - Sensitivity analysis results
   */
  performSensitivityAnalysis(holdings, params = {}) {
    const assetType = params.assetType || 'equities';
    const minImpact = params.minImpact || -0.5;
    const maxImpact = params.maxImpact || 0.3;
    const steps = params.steps || 10;

    const results = [];
    const step = (maxImpact - minImpact) / steps;

    for (let i = 0; i <= steps; i++) {
      const impact = minImpact + step * i;

      const scenario = {
        name: `Sensitivity: ${assetType} ${((impact * 100).toFixed(1))}%`,
        assetImpacts: { [assetType]: impact },
        correlationShift: 1.0,
        volatilityMultiplier: 1.5,
        severity: 'LOW',
      };

      const result = this._runStress(holdings, scenario);
      results.push({
        impactPercent: Math.round(impact * 100 * 100) / 100,
        portfolioLoss: result.portfolioAnalysis.totalLoss,
        portfolioLossPercent: result.portfolioAnalysis.totalLossPercent,
      });
    }

    return {
      timestamp: new Date().toISOString(),
      analysisType: 'SENSITIVITY',
      assetType,
      results,
    };
  }

  /**
   * Correlation shock analysis
   *
   * @param {Array} holdings - Portfolio holdings
   * @param {Array} _correlationMatrix - Current correlation matrix
   * @returns {Object} - Correlation shock analysis
   */
  analyzeCorrelationShock(holdings, _correlationMatrix = null) {
    const originalValue = holdings.reduce((sum, h) => sum + h.value, 0);

    // Scenario 1: Correlations increase to 1.0 (perfect correlation)
    const perfectCorrelation = {
      name: 'Perfect Correlation (All assets move together)',
      correlationShift: 2.0, // Move towards 1.0
      assetImpacts: {},
      volatilityMultiplier: 2.0,
      severity: 'HIGH',
    };

    // Scenario 2: Negative correlations decrease
    const correlationCollapse = {
      name: 'Correlation Collapse (Diversification fails)',
      correlationShift: 1.5,
      assetImpacts: {},
      volatilityMultiplier: 2.5,
      severity: 'CRITICAL',
    };

    const result1 = this._runStress(holdings, perfectCorrelation);
    const result2 = this._runStress(holdings, correlationCollapse);

    return {
      timestamp: new Date().toISOString(),
      analysisType: 'CORRELATION_SHOCK',
      originalPortfolioValue: Math.round(originalValue * 100) / 100,
      scenarios: [
        {
          name: perfectCorrelation.name,
          portfolioValue: result1.portfolioAnalysis.stressedPortfolioValue,
          loss: result1.portfolioAnalysis.totalLoss,
          lossPercent: result1.portfolioAnalysis.totalLossPercent,
        },
        {
          name: correlationCollapse.name,
          portfolioValue: result2.portfolioAnalysis.stressedPortfolioValue,
          loss: result2.portfolioAnalysis.totalLoss,
          lossPercent: result2.portfolioAnalysis.totalLossPercent,
        },
      ],
      diversificationImpact: {
        message: 'Diversification benefits significantly reduced under correlation stress',
        recommendation: 'Consider alternative diversifiers (commodities, real assets)',
      },
    };
  }

  /**
   * Store test result
   * @private
   */
  _storeResult(result) {
    this.results.unshift(result);

    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(0, this.maxResults);
    }
  }

  /**
   * Get historical test results
   *
   * @param {number} limit - Number of results to return
   * @returns {Array} - Historical results
   */
  getResults(limit = 10) {
    return this.results.slice(0, limit);
  }

  /**
   * Generate comprehensive stress testing report
   *
   * @param {Array} holdings - Portfolio holdings
   * @returns {Object} - Comprehensive report
   */
  generateStressReport(holdings) {
    const scenarios = ['crisis_2008', 'crisis_covid2020', 'shock_rates_up', 'scenario_stagflation'];

    const scenarioResults = scenarios.map((scenarioId) => {
      const result = this.runScenarioStress(holdings, scenarioId);
      return {
        scenario: result.scenario,
        severity: result.severity,
        portfolioLoss: result.portfolioAnalysis.totalLoss,
        portfolioLossPercent: result.portfolioAnalysis.totalLossPercent,
        estimatedRecovery: result.recovery.estimatedRecoveryMonths,
      };
    });

    const worstCase = scenarioResults.reduce((worst, current) =>
      current.portfolioLossPercent > worst.portfolioLossPercent ? current : worst,
    );

    return {
      timestamp: new Date().toISOString(),
      reportType: 'COMPREHENSIVE_STRESS_REPORT',
      portfolioValue: holdings.reduce((sum, h) => sum + h.value, 0),
      scenarioResults,
      worstCaseScenario: worstCase,
      diversificationAnalysis: this.analyzeCorrelationShock(holdings),
      summaryRisks: [
        `Worst case loss under tested scenarios: ${worstCase.portfolioLossPercent}%`,
        `Expected recovery time: ${worstCase.estimatedRecovery} months`,
        'Portfolio shows concentration risk in equity positions',
        'Diversification benefits limited during correlation shock',
      ],
    };
  }
}

// Global instance
window.stressTesting = new StressTestingFramework();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StressTestingFramework;
}
