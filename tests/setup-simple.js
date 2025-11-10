/**
 * Simple Jest Setup for Phase 4 Tests
 * No complex module loading - tests import what they need directly
 */

// Mock global objects that might be needed
global.window = {};
global.document = {};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock performance
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {}
};

// Mock console - keep warning/errors visible
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

global.console = {
  log: (...args) => {
    if (process.env.DEBUG) originalConsole.log(...args);
  },
  warn: originalConsole.warn,
  error: originalConsole.error,
  info: () => {},
  debug: () => {}
};

// Custom Jest matchers
expect.extend({
  toBeValidNumber(received) {
    const pass = typeof received === 'number' && !isNaN(received) && isFinite(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid number`
    };
  },
  toSumTo(received, expected) {
    const sum = received.reduce((a, b) => a + b, 0);
    const pass = Math.abs(sum - expected) < 0.0001;
    return {
      pass,
      message: () => `expected array to sum to ${expected}, got ${sum}`
    };
  },
  toBeInRange(received, min, max) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => `expected ${received} to be between ${min} and ${max}`
    };
  }
});

// Helper functions for test data
global.createMockPortfolio = () => ({
  assets: [
    { symbol: 'AAPL', weight: 0.3, shares: 100, price: 150 },
    { symbol: 'MSFT', weight: 0.3, shares: 50, price: 300 },
    { symbol: 'GOOGL', weight: 0.4, shares: 30, price: 2800 }
  ],
  totalValue: 100000
});

global.createMockReturns = (length = 100, mean = 0.001, stdDev = 0.02) => {
  const returns = [];
  for (let i = 0; i < length; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    returns.push(mean + z * stdDev);
  }
  return returns;
};

global.createMockCorrelationMatrix = (assets = 3) => {
  const matrix = Array(assets).fill(0).map(() => Array(assets).fill(0));
  for (let i = 0; i < assets; i++) {
    for (let j = 0; j < assets; j++) {
      matrix[i][j] = i === j ? 1 : Math.random() * 0.5;
    }
  }
  return matrix;
};
