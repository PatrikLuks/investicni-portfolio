# 🔧 TECHNICKÉ DETAILY MODULŮ
**Datum:** 11. listopadu 2025  
**Fokus:** src/js/utilities/ a klíčové systémové moduly

---

## 📚 POPIS JEDNOTLIVÝCH MODULŮ

### A. DATA BINDING & STATE MANAGEMENT

#### **data-binding.js** (379 LOC) ⭐ NEW
```javascript
Class: DataBinding
Purpose: Reactive two-way data binding framework
Key Features:
  - Proxy-based reactivity (ES6 Proxy)
  - Two-way binding: model ↔ UI
  - Property watchers (multiple listeners)
  - Computed properties with caching
  - Form binding with field mapping
  - Element property binding (value, textContent, class, style, etc.)
  - Automatic cleanup & unbinding
  
Key Methods:
  bind(dataProperty, element, elementProperty, options)
  watch(property, callback) → unwatch()
  computed(property, getter, setter)
  bindForm(form, mapping)
  unbind(element) / unbindProperty(property)
  updateData(updates, merge=true)
  destroy()

Example:
  const binding = new DataBinding({ email: '', name: '' });
  binding.bind('email', emailInput, 'value');
  binding.watch('email', (newVal, oldVal) => console.log(newVal));
  binding.computed('fullDisplay', () => binding.data.email + ' - ' + binding.data.name);
```

**Test Coverage:** 26 tests (100% pass rate)
- Basic binding (input, textContent, innerHTML)
- Element properties (class, style, attributes)
- Form binding with mapping
- Watchers (multiple listeners, unsubscribe)
- Computed properties (lazy, caching)
- Unbinding (cleanup, removal)
- Data management (merge vs replace)
- Error handling (graceful propagation)

---

#### **data-manager.js** (250 LOC)
```javascript
Class: PortfolioStorage
Purpose: Data persistence and retrieval
Key Methods:
  loadPortfolio(id) - Load from storage
  savePortfolio(data) - Save to storage
  deletePortfolio(id) - Delete portfolio
  getPortfolioList() - List all portfolios
  clearStorage() - Clear all data

Used for:
  - localStorage/sessionStorage management
  - Fund data persistence
  - Client info storage
  - Portfolio snapshots
```

**Integrated with:** DataBinding, app-core.js, legacy modules

---

#### **data-validation.js** (variable LOC)
```javascript
Purpose: Input validation and sanitization
Key Functions:
  validateFundData(fund) - Validate fund structure
  validateEmail(email) - Email validation
  validateNumber(num, min, max) - Number range check
  validatePortfolioData(portfolio) - Full portfolio check
  
Uses:
  - Regex patterns for format validation
  - Range checks for numerical data
  - Presence checks for required fields
```

---

### B. PORTFOLIO CALCULATIONS & ANALYTICS

#### **portfolio-calculator.js** (255 LOC)
```javascript
Class: PortfolioCalculator
Purpose: Core portfolio metrics calculation
Key Methods:
  calculatePortfolioMetrics(funds) - Overall metrics
  calculateFundYield(fund) - Individual fund yield
  calculateDiversification(portfolio) - Diversification index
  sortFunds(funds, criterion) - Fund sorting
  filterFunds(funds, criteria) - Fund filtering
  calculateRiskReturn(portfolio) - Risk/return analysis
  calculateEfficiencyRatio(fund) - Efficiency metric

Metrics Calculated:
  - Total value
  - Weighted return
  - Portfolio composition
  - Asset allocation
  - Risk metrics (volatility, Sharpe, etc.)
```

**Integration:** Used by advanced-risk-metrics.js, advanced-dashboard.js

---

#### **portfolio-optimization.js** (518 LOC) - Phase 4
```javascript
Class: PortfolioOptimizationEngine
Purpose: Modern Portfolio Theory (MPT) implementation
Key Methods:
  calculateOptimalWeights(returns, constraints) - MPT weights
  calculateEfficientFrontier(returns, numPoints) - Frontier curve
  findMinimumVariancePortfolio() - Min variance allocation
  findMaximumSharpeRatio() - Max Sharpe allocation
  optimizeWithConstraints(returns, constraints) - Constrained optimization
  validateWeights(weights) - Weight validation

Algorithms:
  - Matrix operations (covariance calculation)
  - Gradient descent optimization
  - Linear programming (if available)
  - Monte Carlo simulation

Performance:
  - Handles portfolios with 100+ assets
  - < 1s calculation for typical portfolio
  - Numerical stability maintained
```

**Test Coverage:** 7 tests
- Instance creation
- Optimal weight calculation
- Efficient frontier generation
- Single asset handling
- Edge cases

---

### C. RISK & FINANCIAL ANALYTICS (Phase 4)

#### **advanced-risk-metrics.js** (546 LOC) ⭐ Phase 4
```javascript
Class: AdvancedRiskMetricsEngine
Purpose: Professional risk measurement & analysis
Key Methods - VaR Calculations:
  calculateParametricVaR(returns, confidence) - Parametric method
  calculateHistoricalVaR(returns, confidence) - Historical method
  calculateMonteCarloVaR(returns, sims, confidence) - Simulation method

Key Methods - Risk Metrics:
  calculateConditionalVaR(returns, confidence) - Expected shortfall
  calculateSortinoRatio(returns, targetReturn) - Downside focus
  calculateCalmarRatio(returns, periods) - Return/drawdown
  calculateInformationRatio(returns, benchmark) - Active return
  calculateOmegaRatio(returns, threshold) - Outperformance prob
  calculateMaxDrawdown(returns) - Maximum loss
  calculateUlcerIndex(returns) - Volatility measure

Key Methods - Advanced:
  calculateCorrelationMatrix(portfolios) - Cross-asset correlation
  calculateBetaAnalysis(security, market) - Beta coefficient
  stressTestPortfolio(portfolio, scenarios) - Stress testing
  performanceAttribution(returns, factors) - Return decomposition

Features:
  - Decimal.js support for precision
  - Caching for performance
  - Configurable confidence levels
  - Multiple calculation methods
```

**Test Coverage:** 20 tests (simple.test.js)
- VaR calculations (all methods)
- Ratio calculations
- Drawdown analysis
- Correlation matrix
- Stress testing

---

#### **regulatory-compliance.js** (512 LOC) - Phase 4
```javascript
Class: RegulatoryComplianceEngine
Purpose: Regulatory requirement checking
Key Methods:
  validateMiFIDCompliance(portfolio) - MiFID II rules (EU)
  validateDoddFrankCompliance(portfolio) - Dodd-Frank (US)
  validateSuitabilityRequirements(client, portfolio) - Suitability
  validateConcentrationLimits(portfolio) - Concentration checks
  calculateRegulatoryRatio(portfolio, regulation) - Compliance ratio
  generateComplianceReport(portfolio) - Full report

Regulations Supported:
  - MiFID II (EU)
  - Dodd-Frank (US)
  - UCITS (Investment funds)
  - Proprietary limits
  - Risk category classifications

Checks Performed:
  - Asset concentration limits
  - Liquidity requirements
  - Risk factor exposure
  - Counterparty limits
  - Derivative restrictions
```

**Test Coverage:** 6 tests
- MiFID compliance
- Dodd-Frank compliance
- Suitability validation
- Concentration limits

---

#### **stress-testing.js** (523 LOC) - Phase 4
```javascript
Class: StressTestingEngine
Purpose: Portfolio resilience testing
Key Methods:
  createStressScenario(name, changes) - Define scenario
  applyStressScenario(portfolio, scenario) - Apply stress
  generateHistoricalStress(portfolio, historicalPeriod) - Historical stress
  generateParallelShock(portfolio, magnitude) - Uniform shock
  generateCurveShock(portfolio, shifts) - Yield curve shift
  runStressTest(portfolio, scenarios) - Full test suite
  analyzeStressResults(results) - Results analysis

Stress Scenarios Included:
  - Market crash (2008, 2020 style)
  - Interest rate shock (+200, -100 bps)
  - Currency crash
  - Commodity spike
  - Volatility spike
  - Credit spread widening
  - Liquidity shock

Output:
  - P&L impact per asset
  - Portfolio delta
  - Recovery scenarios
  - Recommendation alerts
```

**Test Coverage:** 28 tests
- Scenario creation & execution
- Historical stress
- Parallel shocks
- Curve shifts
- Edge cases

---

#### **financial-precision-engine.js** (484 LOC) - Phase 4
```javascript
Class: FinancialPrecisionEngine
Purpose: High-precision financial calculations
Key Methods:
  calculateCompoundReturn(returns, periods) - Compound growth
  calculateInternalReturn(cashFlows, dates) - IRR calculation
  calculateDuration(bonds, yields) - Bond duration
  calculateConvexity(bonds, yields) - Bond convexity
  calculatePrincipalValue(cashFlows, discountRate) - NPV
  calculateYieldToMaturity(bond, currentPrice) - YTM
  interpolateYieldCurve(maturities, yields) - Curve interpolation

Key Features:
  - Double precision math
  - Decimal.js integration
  - Numerical stability
  - Bootstrap methods
  - Interpolation algorithms

Use Cases:
  - Fixed income analysis
  - Bond pricing
  - Present value calculations
  - Cash flow analysis
  - Economic metrics
```

**Test Coverage:** 31 tests
- Compound calculations
- Return metrics
- Bond analysis
- Time series operations

---

### D. ANALYTICS & VISUALIZATION (Phase 4)

#### **advanced-dashboard.js** (564 LOC) - Phase 4
```javascript
Class: AdvancedDashboardEngine
Purpose: Dashboard data aggregation & display management
Key Methods:
  aggregateMetrics(portfolio) - Collect all metrics
  generateDashboardSnapshot(portfolio) - Current state
  calculateTrendAnalysis(historicalData) - Trend detection
  generateAlerts(portfolio, thresholds) - Alert generation
  optimizeChartData(fullData, sampleSize) - Data optimization
  cacheMetrics(key, data) - Performance caching
  invalidateCache(key) - Cache invalidation

Features:
  - Real-time metric updates
  - Trend analysis (SMA, EMA)
  - Alert generation
  - Widget management
  - Data caching
  - Performance optimization

Metrics Included:
  - Portfolio value & changes
  - Return metrics (daily, YTD, total)
  - Risk metrics (volatility, Sharpe, VaR)
  - Allocation breakdown
  - Performance attribution
  - Comparative analysis
```

**Test Coverage:** 36 tests
- Metric aggregation
- Trend calculation
- Alert generation
- Data optimization
- Cache management

---

#### **correlation-heatmap-ui.js** (476 LOC) - Phase 4
```javascript
Class: CorrelationHeatmapUI
Purpose: Correlation matrix visualization & interaction
Key Methods:
  calculateCorrelationMatrix(securities) - Calculate correlations
  generateHeatmapData(correlations) - Format for display
  createHeatmapVisualization(container, data) - Render heatmap
  updateCorrelationOnFilter(newSecurities) - Dynamic updates
  exportHeatmapData(format) - Export functionality
  analyzeCorrelationClusters(correlations) - Cluster detection
  highlightCells(correlation, threshold) - Interactive highlighting

Features:
  - Interactive heatmap rendering
  - Color-coded correlations
  - Clustering analysis
  - Export capabilities
  - Performance optimized
  - Responsive design
  - Legend & labels

Visualizations:
  - Color intensity = correlation strength
  - Clustering groups = similar assets
  - Filtering = dynamic updates
  - Hoverable = detailed information
```

**Test Coverage:** 44 tests
- Matrix calculation
- Data formatting
- Visualization generation
- Clustering algorithms
- Export functions
- Interactive features

---

#### **technical-indicators.js** (515 LOC) - Phase 4
```javascript
Class: TechnicalIndicatorsEngine
Purpose: Technical analysis indicators calculation
Key Methods - Trend:
  calculateMovingAverage(prices, period) - MA (SMA, EMA, WMA)
  calculateTrendLine(prices) - Trend detection
  calculateMACD(prices) - Momentum indicator
  calculateRSI(prices, period) - Relative strength

Key Methods - Volatility:
  calculateBollingerBands(prices, period, std) - Volatility bands
  calculateATR(prices, period) - Average true range
  calculateKeltnerChannel(prices, period) - Channel bands

Key Methods - Volume:
  calculateOnBalanceVolume(prices, volumes) - OBV
  calculateVolumeWeightedAvg(prices, volumes) - VWAP
  calculateADLine(prices, volumes) - Accumulation/distribution

Key Methods - Oscillators:
  calculateStochastic(prices, period) - Stochastic
  calculateRateOfChange(prices, period) - ROC
  calculateCCI(prices, period) - Commodity channel

Features:
  - Multiple calculation methods
  - Window function optimization
  - Caching for performance
  - Alerts on signal crosses
  - Configurable parameters
```

**Test Coverage:** 35 tests
- Moving average calculations
- Trend detection
- Volatility metrics
- Volume analysis
- Oscillator calculations
- Signal generation

---

### E. QUALITY & PRODUCTION SYSTEMS

#### **production-quality.js** (773 LOC) - Phase 4 ⭐
```javascript
Class: ProductionQualitySystem
Purpose: Comprehensive quality monitoring & enforcement
Key Components:
  Performance Monitoring:
    - Track load times
    - Monitor memory usage
    - Track interaction latency
    - Alert on threshold violations

  Error Tracking:
    - Capture uncaught errors
    - Stack trace collection
    - Error categorization
    - Reporting mechanism

  Logging System:
    - Structured logging
    - Log levels (DEBUG, INFO, WARN, ERROR)
    - Performance logging
    - User action tracking

  Analytics:
    - Session tracking
    - User interaction metrics
    - Feature usage analysis
    - Performance statistics

  Code Coverage:
    - Coverage tracking
    - Coverage reports
    - Trend analysis
    - Target enforcement

  Security Monitoring:
    - CORS policy tracking
    - CSP violation detection
    - Authentication failures
    - Security alerts

Key Methods:
  startPerformanceMonitoring()
  captureError(error, context)
  log(level, message, data)
  trackUserAction(action, metadata)
  generateQualityReport()
  checkCoverageMet()
  validateSecurityPolicies()

Integration:
  - Works with all modules
  - Non-intrusive logging
  - Performance optimized
  - Configurable thresholds
  - Alert system
```

**Test Coverage:** 31 tests
- Performance tracking
- Error capture
- Logging operations
- Analytics collection
- Coverage validation
- Security checks

---

### F. CORE UTILITIES

#### **calculations-engine.js**
```javascript
Purpose: Mathematical calculations for portfolio analysis
Key Functions:
  calculateWeightedReturn(weights, returns) - Portfolio return
  calculateStandardDeviation(returns) - Volatility
  calculateSharpeRatio(returns, riskFreeRate) - Risk-adjusted return
  calculateCumulativeReturn(returns) - Growth calculation
  calculateCorrelation(series1, series2) - Correlation coefficient
  calculateBeta(assetReturns, marketReturns) - Systematic risk
```

---

#### **dom-safety.js**
```javascript
Purpose: Safe DOM manipulation with defensive checks
Key Functions:
  getElement(selector) - Safe element access
  addClass(element, className) - Safe class add
  removeClass(element, className) - Safe class remove
  setText(element, text) - Safe text setting
  setHTML(element, html) - Safe HTML setting (sanitized)
  addEventListener(element, event, handler) - Safe event binding
  
Features:
  - Null checks
  - Error logging
  - Type validation
  - Memory leak prevention
```

---

#### **auto-save.js**
```javascript
Purpose: Automatic data persistence
Key Methods:
  initAutoSave(interval, callback) - Start auto-save
  triggerAutoSave(data) - Manual trigger
  clearAutoSave() - Stop auto-save
  getAutoSaveData() - Retrieve saved data
  
Configuration:
  - Configurable intervals (default 30s)
  - Debounced saves (prevent spam)
  - localStorage persistence
  - Notification on save
```

---

#### **drag-drop.js**
```javascript
Purpose: Drag & drop functionality
Key Methods:
  enableDragDrop(element, options) - Enable drag-drop
  onDragStart(handler) - Start handler
  onDrag(handler) - Drag handler
  onDrop(handler) - Drop handler
  disableDragDrop(element) - Disable drag-drop
  
Features:
  - Multiple element support
  - Custom drop zones
  - Visual feedback
  - Accessibility support
```

---

#### **service-worker.js**
```javascript
Purpose: PWA offline support & caching
Key Features:
  - Cache versioning
  - Offline fallback
  - Background sync
  - Push notifications
  - Asset caching strategies
  
Caching Strategy:
  - Cache-first for assets
  - Network-first for APIs
  - Stale-while-revalidate for data
```

---

### G. FEATURE MODULES

#### **ui-manager.js** (272 LOC - migrated to src/js/utilities/)
```javascript
Purpose: UI component management
Key Methods:
  createElement(type, options) - Element factory
  showToast(message, type) - Notifications
  showModal(content, options) - Modal dialogs
  hideAll() - Hide all components
  updateElement(id, data) - Update elements
  setupEventDelegation() - Event handling
  
Used for:
  - Toast notifications
  - Modal management
  - Element creation
  - Dynamic updates
```

---

## 📊 MODULŲ INTEGRACIÓN MAPA

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│              (modules/event-handlers.js)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────v──────┐  ┌─────v──────┐  ┌─────v───────────┐
│ data-binding │  │ ui-manager │  │ dom-safety      │
│ (reactive)   │  │ (UI comps) │  │ (safe access)   │
└───────┬──────┘  └─────┬──────┘  └─────┬───────────┘
        │                │                │
┌───────v──────────────────v──────────────v─────────────────┐
│           DATA LAYER (data-manager.js)                     │
│    - localStorage persistence                              │
│    - Portfolio data management                             │
│    - Client information storage                            │
└───────┬────────────────────────────────────────────────────┘
        │
┌───────v──────────────────────────────────────────────────┐
│         CALCULATION ENGINE                                │
│    (portfolio-calculator.js)                              │
│    (calculations-engine.js)                               │
│    - Basic metrics                                        │
│    - Fund yields                                          │
│    - Portfolio composition                                │
└───────┬────────────────────────────────────────────────────┘
        │
        │
 ┌──────v──────────────────────────────────────────────┐
 │   ADVANCED ANALYTICS (Phase 4 Modules)              │
 │                                                     │
 │  ┌─────────────────────────────────────────────┐   │
 │  │ Risk & Financial                            │   │
 │  │ - advanced-risk-metrics.js (VaR, ratios)   │   │
 │  │ - financial-precision-engine.js (bonds)    │   │
 │  │ - portfolio-optimization.js (MPT)          │   │
 │  │ - stress-testing.js (scenarios)            │   │
 │  └─────────────────────────────────────────────┘   │
 │                                                     │
 │  ┌─────────────────────────────────────────────┐   │
 │  │ Analytics & Visualization                   │   │
 │  │ - technical-indicators.js (TA)             │   │
 │  │ - advanced-dashboard.js (aggregation)      │   │
 │  │ - correlation-heatmap-ui.js (matrix viz)   │   │
 │  │ - regulatory-compliance.js (rules)         │   │
 │  └─────────────────────────────────────────────┘   │
 │                                                     │
 │  ┌─────────────────────────────────────────────┐   │
 │  │ Quality & Performance                       │   │
 │  │ - production-quality.js (monitoring)        │   │
 │  │ - logger.js (logging)                       │   │
 │  └─────────────────────────────────────────────┘   │
 └──────┬──────────────────────────────────────────────┘
        │
        └──> Output to UI/Features

```

---

## 🚦 DATA FLOW PŘÍKLAD

```
User fills portfolio form
    ↓
event-handlers.js captures input
    ↓
data-binding.js updates proxy (two-way)
    ↓
data-manager.js saves to localStorage
    ↓
portfolio-calculator.js calculates metrics
    ↓
advanced-risk-metrics.js calculates VaR, Sharpe, etc.
    ↓
advanced-dashboard.js aggregates all metrics
    ↓
technical-indicators.js calculates TA signals
    ↓
correlation-heatmap-ui.js updates correlations
    ↓
production-quality.js logs performance/errors
    ↓
UI updated with fresh data
```

---

## ✅ CURRENT STATUS

- **Total Modules:** 23 utility modules + 9 feature modules
- **Total LOC:** ~22,228 in src/js/
- **Test Coverage:** 298 tests, 100% pass rate
- **ESLint:** 0 errors
- **Build:** 13.64s
- **Vulnerabilities:** 0

---

*Report generován: 11. listopadu 2025*
