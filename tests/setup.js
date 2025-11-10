/**
 * @fileoverview Jest Setup File for Phase 4 Tests
 * Configure test environment and initialize global mocks
 */

// ==================== GLOBAL TEST SETUP ====================

// Mock window object
global.window = {
  // Risk metrics
  advancedRiskMetrics: require('../src/js/utilities/advanced-risk-metrics.js'),
  // Portfolio optimization
  portfolioOptimization: require('../src/js/utilities/portfolio-optimization.js'),
  // Compliance
  regulatoryCompliance: require('../src/js/utilities/regulatory-compliance.js'),
  // Production quality
  productionQuality: require('../src/js/utilities/production-quality.js'),
  // Stress testing
  stressTesting: require('../src/js/utilities/stress-testing.js'),
  // Technical indicators
  technicalIndicators: require('../src/js/utilities/technical-indicators.js'),
  // UI Components
  correlationHeatmapUI: require('../src/js/utilities/correlation-heatmap-ui.js'),
  analyticsDashboard: require('../src/js/utilities/advanced-dashboard.js')
};

// Mock performance API
global.performance = {
  now: () => Date.now()
};

// Mock console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

// Suppress console output unless explicitly needed
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
console.info = jest.fn();

// Restore for specific tests if needed
global.restoreConsole = () => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
};

// ==================== TEST UTILITIES ====================

/**
 * Create mock portfolio with specified characteristics
 */
global.createMockPortfolio = (options = {}) => {
  return {
    assets: options.assets || [
      { symbol: 'AAPL', weight: 0.3, returns: [0.02, 0.015, -0.01, 0.025] },
      { symbol: 'GOOGL', weight: 0.25, returns: [0.018, 0.022, 0.01, 0.02] },
      { symbol: 'MSFT', weight: 0.25, returns: [0.025, 0.018, 0.005, 0.022] },
      { symbol: 'TSLA', weight: 0.2, returns: [-0.05, 0.08, -0.02, 0.06] }
    ],
    riskFreeRate: options.riskFreeRate || 0.02,
    investmentHorizon: options.horizon || '5years',
    ...options
  };
};

/**
 * Create mock returns array
 */
global.createMockReturns = (count = 100, volatility = 0.15) => {
  return Array(count)
    .fill(0)
    .map(() => (Math.random() - 0.5) * 2 * volatility);
};

/**
 * Create mock correlation matrix
 */
global.createMockCorrelationMatrix = (size = 4) => {
  const matrix = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));

  // Diagonal = 1.0
  for (let i = 0; i < size; i++) {
    matrix[i][i] = 1.0;
  }

  // Random off-diagonal (symmetric)
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      const correlation = Math.random() * 0.8 - 0.1; // -0.1 to 0.7
      matrix[i][j] = correlation;
      matrix[j][i] = correlation;
    }
  }

  return matrix;
};

/**
 * Assert number is within acceptable tolerance
 */
global.expectClose = (actual, expected, tolerance = 0.001) => {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
};

/**
 * Measure function execution time
 */
global.measureTime = (fn) => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
};

// ==================== EXTEND MATCHERS ====================

expect.extend({
  /**
   * Check if number is valid and finite
   */
  toBeValidNumber(received) {
    const isValid = typeof received === 'number' && Number.isFinite(received);
    return {
      pass: isValid,
      message: () =>
        `Expected ${received} to be a valid finite number`
    };
  },

  /**
   * Check if array sums to expected value
   */
  toSumTo(received, expected, tolerance = 0.001) {
    const sum = received.reduce((a, b) => a + b, 0);
    const pass = Math.abs(sum - expected) < tolerance;
    return {
      pass,
      message: () =>
        `Expected array to sum to ${expected}, but got ${sum}`
    };
  },

  /**
   * Check if array is sorted
   */
  toBeSorted(received, order = 'asc') {
    let pass = true;
    for (let i = 1; i < received.length; i++) {
      if (order === 'asc' && received[i] < received[i - 1]) {
        pass = false;
        break;
      }
      if (order === 'desc' && received[i] > received[i - 1]) {
        pass = false;
        break;
      }
    }
    return {
      pass,
      message: () =>
        `Expected array to be sorted in ${order} order`
    };
  },

  /**
   * Check if value is in range
   */
  toBeInRange(received, min, max) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () =>
        `Expected ${received} to be between ${min} and ${max}`
    };
  }
});

// ==================== MOCK MODULES ====================

// Mock Decimal.js if not available
if (!global.Decimal) {
  global.Decimal = function(value) {
    this.value = parseFloat(value);
  };
  global.Decimal.prototype.toNumber = function() {
    return this.value;
  };
}

// Mock Chart.js for UI component tests
global.Chart = {
  create: jest.fn(),
  destroy: jest.fn()
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// ==================== TEST HOOKS ====================

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.clearAllTimers();
});

// ==================== ERROR HANDLING ====================

// Suppress expected errors during tests
process.on('unhandledRejection', (reason) => {
  // Silently handle for test purposes
});

// ==================== INITIALIZATION MESSAGE ====================

console.log('✅ Jest test environment initialized for Phase 4 modules');
