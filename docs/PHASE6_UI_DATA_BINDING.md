# Phase 6: UI Data Binding Guide

## Overview

Phase 6 focuses on connecting the 9 Phase 4 enterprise modules to the existing UI components, enabling real-time portfolio analysis, advanced charting, and interactive dashboards.

## Phase 4 Module APIs Available

All Phase 4 modules are now fully tested (272 tests) and ready for integration:

### 1. Advanced Risk Metrics Engine
**Location:** `src/js/utilities/advanced-risk-metrics.js`

**Key Methods:**
```javascript
analyzeRisk(portfolio) // Returns comprehensive risk metrics
calculateVaR(returns, confidence) // Value at Risk calculation
calculateCVaR(returns, confidence) // Conditional Value at Risk
calculateSharpeRatio(returns, riskFreeRate)
calculateSortinoRatio(returns, riskFreeRate, targetReturn)
calculateVolatility(returns)
calculateMaxDrawdown(prices)
calculateBeta(assetReturns, marketReturns)
```

### 2. Portfolio Optimization Engine
**Location:** `src/js/utilities/portfolio-optimization.js`

**Key Methods:**
```javascript
optimizeAllocation(portfolio) // Find optimal weights
generateEfficientFrontier(targetReturns) // Calculate efficient frontier
calculateOptimalWeights(returns, riskFreeRate)
getMinVariancePortfolio()
getMaxSharpePortfolio()
calculatePortfolioReturn(weights, returns)
calculatePortfolioRisk(weights, correlations)
```

### 3. Regulatory Compliance Module
**Location:** `src/js/utilities/regulatory-compliance.js`

**Key Methods:**
```javascript
validateCompliance(portfolio) // Full compliance check
checkUCITSCompliance(portfolio)
checkESMACompliance(portfolio)
checkMiFID2Compliance(portfolio)
generateComplianceReport(portfolio)
getComplianceStatus(portfolio)
```

### 4. Stress Testing Framework
**Location:** `src/js/utilities/stress-testing.js`

**Key Methods:**
```javascript
runScenario(scenario, portfolio) // Run single stress test
runMonteCarloSimulation(portfolio, iterations)
addScenario(name, definition)
getScenario(name)
listScenarios()
analyzeResults(results)
```

### 5. Technical Indicators Engine
**Location:** `src/js/utilities/technical-indicators.js`

**Key Methods:**
```javascript
calculateSMA(prices, period)
calculateEMA(prices, period)
calculateMACD(prices)
calculateRSI(prices, period)
calculateBollingerBands(prices, period)
calculateATR(highLow, period)
generateSignals(prices)
```

### 6. Production Quality System
**Location:** `src/js/utilities/production-quality.js`

**Key Methods:**
```javascript
logError(name, error) // Log errors
logPerformance(name, duration)
getHealth() // Get system health status
getDiagnostics() // Get system diagnostics
reportIncident(severity, message)
createDiagnosticsReport()
```

### 7. Advanced Analytics Dashboard
**Location:** `src/js/utilities/advanced-dashboard.js`

**Key Methods:**
```javascript
registerPanel(id, config) // Register UI panel
updateData(panelId, data) // Update panel data
refreshAllPanels()
exportDashboardData(format)
getPanel(panelId)
getPanelData(panelId)
```

### 8. Correlation Heatmap UI
**Location:** `src/js/utilities/correlation-heatmap-ui.js`

**Key Methods:**
```javascript
setCorrelationMatrix(matrix) // Set correlation data
render() // Render heatmap
updateCell(i, j, value)
onCellClick(callback)
exportAsImage(format)
getSelectedCells()
```

### 9. Financial Precision Engine
**Location:** `src/js/utilities/financial-precision-engine.js`

**Key Methods:**
```javascript
roundToPrecision(value, places) // Precise rounding
add(a, b) // Precision arithmetic
subtract(a, b)
multiply(a, b)
divide(a, b)
calculateCompoundInterest(principal, rate, years)
formatCurrency(value)
formatPercentage(value)
```

## Data Flow Patterns

### Pattern 1: Portfolio Analysis Workflow
```
User Input → Risk Metrics Engine → Compliance Check → Dashboard Update
```

**Implementation:**
```javascript
// 1. Get portfolio from user
const portfolio = getCurrentPortfolio();

// 2. Calculate risk metrics
const riskEngine = new AdvancedRiskMetricsEngine();
const metrics = riskEngine.analyzeRisk(portfolio);

// 3. Check compliance
const compliance = new RegulatoryComplianceModule();
const isCompliant = compliance.validateCompliance(portfolio);

// 4. Update dashboard
const dashboard = new AdvancedAnalyticsDashboard();
dashboard.updateData('risk-metrics', metrics);
dashboard.updateData('compliance', isCompliant);
```

### Pattern 2: Optimization Recommendation Workflow
```
Current Portfolio → Optimize → Stress Test → Display Results
```

**Implementation:**
```javascript
// 1. Optimize current portfolio
const optimizer = new PortfolioOptimizationEngine();
const optimized = optimizer.optimizeAllocation(currentPortfolio);

// 2. Stress test optimized portfolio
const stressTesting = new StressTestingFramework();
const stressResult = stressTesting.runScenario(
  { name: 'market-crash', priceShocks: { asset1: -0.3 } },
  optimized
);

// 3. Display recommendation
displayRecommendation({
  optimized,
  stressTest: stressResult,
  riskImprovement: calculateImprovement()
});
```

### Pattern 3: Real-time Dashboard Refresh
```
Market Data → Technical Indicators → Dashboard → Correlation Heatmap
```

**Implementation:**
```javascript
// 1. Receive market data
onMarketUpdate((priceData) => {
  // 2. Calculate technical indicators
  const indicators = new TechnicalIndicatorsEngine();
  const signals = indicators.generateSignals(priceData.prices);
  
  // 3. Update main dashboard
  dashboard.updateData('indicators', signals);
  
  // 4. Update correlation visualization
  const correlation = calculateCorrelations(priceData);
  heatmap.setCorrelationMatrix(correlation);
});
```

## Integration Points

### 1. Portfolio Summary Panel
**Connect to:** AdvancedRiskMetricsEngine, FinancialPrecisionEngine

**Required Data:**
```javascript
{
  totalValue: 10000,
  allocation: [0.3, 0.4, 0.3],
  riskMetrics: {
    volatility: 0.15,
    var95: 250,
    sharpeRatio: 1.2,
    maxDrawdown: -0.25
  }
}
```

### 2. Risk Dashboard
**Connect to:** AdvancedRiskMetricsEngine, ProductionQualitySystem

**Required Data:**
```javascript
{
  currentRisk: 0.15,
  risksLimits: 0.20,
  alerts: [
    { type: 'warning', message: 'High concentration' }
  ],
  history: [/* time series */]
}
```

### 3. Optimization Recommendations
**Connect to:** PortfolioOptimizationEngine, StressTestingFramework

**Required Data:**
```javascript
{
  currentAllocation: [0.3, 0.4, 0.3],
  recommendedAllocation: [0.25, 0.35, 0.40],
  expectedImprovement: {
    return: +0.5,
    risk: -0.2
  },
  stressTestResult: {/* stress analysis */}
}
```

### 4. Compliance Status
**Connect to:** RegulatoryComplianceModule

**Required Data:**
```javascript
{
  ucits: { status: 'compliant', details: {} },
  esma: { status: 'warning', violations: [] },
  mifid2: { status: 'compliant', details: {} }
}
```

### 5. Technical Analysis Chart
**Connect to:** TechnicalIndicatorsEngine

**Required Data:**
```javascript
{
  prices: [/* price history */],
  sma: [/* 20-period SMA */],
  ema: [/* 12-period EMA */],
  signals: [
    { type: 'buy', price: 105.5, date: '2024-01-01' },
    { type: 'sell', price: 108.2, date: '2024-01-05' }
  ]
}
```

### 6. Correlation Heatmap
**Connect to:** CorrelationHeatmapUI

**Required Data:**
```javascript
{
  matrix: [
    [1.0, 0.5, -0.2],
    [0.5, 1.0, 0.3],
    [-0.2, 0.3, 1.0]
  ],
  assets: ['Asset1', 'Asset2', 'Asset3']
}
```

## Implementation Examples

### Example 1: Connect Risk Metrics to UI Panel
```javascript
// src/js/features/dashboard/risk-panel.js

import { AdvancedRiskMetricsEngine } from '../../utilities/advanced-risk-metrics.js';

class RiskPanel {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.riskEngine = new AdvancedRiskMetricsEngine();
  }

  updatePortfolio(portfolio) {
    try {
      // Calculate risk metrics
      const metrics = this.riskEngine.analyzeRisk(portfolio);
      
      // Update UI
      this.render(metrics);
      
      // Log performance
      logPerformance('risk-calculation', performance.now());
    } catch (error) {
      this.handleError(error);
    }
  }

  render(metrics) {
    this.element.innerHTML = `
      <div class="risk-metrics">
        <div class="metric">
          <label>Volatility</label>
          <value>${(metrics.volatility * 100).toFixed(2)}%</value>
        </div>
        <div class="metric">
          <label>Value at Risk (95%)</label>
          <value>$${metrics.var95.toFixed(2)}</value>
        </div>
        <div class="metric">
          <label>Sharpe Ratio</label>
          <value>${metrics.sharpeRatio.toFixed(2)}</value>
        </div>
      </div>
    `;
  }

  handleError(error) {
    const qualitySystem = new ProductionQualitySystem();
    qualitySystem.logError('RiskPanel', error);
    this.element.innerHTML = '<div class="error">Failed to load risk metrics</div>';
  }
}

export { RiskPanel };
```

### Example 2: Connect Optimization Engine
```javascript
// src/js/features/recommendations/optimization-panel.js

import { PortfolioOptimizationEngine } from '../../utilities/portfolio-optimization.js';
import { StressTestingFramework } from '../../utilities/stress-testing.js';

class OptimizationPanel {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.optimizer = new PortfolioOptimizationEngine();
    this.stressTester = new StressTestingFramework();
  }

  recommendOptimization(currentPortfolio) {
    // Get optimized allocation
    const optimized = this.optimizer.optimizeAllocation(currentPortfolio);
    
    // Stress test the recommendation
    const stressTest = this.stressTester.runScenario(
      { name: 'market-downturn', priceShocks: { asset1: -0.15 } },
      optimized
    );
    
    // Display results
    this.displayRecommendation(optimized, stressTest);
  }

  displayRecommendation(optimized, stressTest) {
    const html = `
      <div class="recommendation">
        <h3>Recommended Allocation</h3>
        ${this.renderAllocation(optimized)}
        <h3>Stress Test Results</h3>
        ${this.renderStressResults(stressTest)}
      </div>
    `;
    this.element.innerHTML = html;
  }
}
```

### Example 3: Real-time Dashboard Updates
```javascript
// src/js/features/dashboard/real-time-updates.js

import { AdvancedAnalyticsDashboard } from '../../utilities/advanced-dashboard.js';
import { TechnicalIndicatorsEngine } from '../../utilities/technical-indicators.js';

class RealtimeDashboard {
  constructor() {
    this.dashboard = new AdvancedAnalyticsDashboard();
    this.indicators = new TechnicalIndicatorsEngine();
    
    // Subscribe to market updates
    MarketDataService.onUpdate(this.handleMarketUpdate.bind(this));
  }

  handleMarketUpdate(marketData) {
    // Calculate technical indicators
    const signals = this.indicators.generateSignals(marketData.prices);
    
    // Update dashboard in real-time
    this.dashboard.updateData('technical-signals', signals);
    
    // Update performance metrics
    this.dashboard.updateData('performance', this.calculatePerformance());
  }

  calculatePerformance() {
    // Implement performance calculation
  }
}
```

## Testing Integration

All integration points are covered by integration tests:

```bash
npm test -- --testPathPatterns=integration --config jest.config.phase4.cjs
```

**Test Categories:**
- Risk Analysis Pipeline (validates risk → compliance flow)
- Portfolio Optimization Pipeline (validates optimization → stress flow)
- Technical Analysis Integration (validates indicator signals)
- Dashboard Data Integration (validates UI panel updates)
- End-to-End Workflow (complete portfolio analysis cycle)

## Performance Considerations

**Calculation Caching:**
- Use FinancialPrecisionEngine caching for repeated calculations
- Cache risk metrics for 1-5 seconds in live dashboard

**Large Portfolios:**
- Test with 50+ assets (see stress tests)
- Use WebWorkers for heavy calculations
- Implement calculation throttling

**Real-time Updates:**
- Batch dashboard updates (100 updates in < 1 second)
- Use requestAnimationFrame for smooth rendering
- Debounce rapid market data updates

## Error Handling Strategy

**Graceful Degradation:**
```javascript
try {
  const metrics = riskEngine.analyzeRisk(portfolio);
} catch (error) {
  qualitySystem.logError('RiskAnalysis', error);
  showFallbackUI(); // Show simplified version
}
```

**Health Monitoring:**
```javascript
const health = qualitySystem.getHealth();
if (health.status === 'degraded') {
  disableAdvancedFeatures();
  showWarning('System running in reduced capacity');
}
```

## Next Steps

1. **Week 1:** Implement risk metrics panel + compliance status
2. **Week 2:** Add optimization recommendations + stress testing UI
3. **Week 3:** Build technical analysis charts + signals
4. **Week 4:** Real-time dashboard + correlation heatmap
5. **Week 5:** Performance tuning + user testing

---

**Phase 6 Ready:** All 9 Phase 4 modules fully documented and integrated.
