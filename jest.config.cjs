/**
 * Jest Configuration for Portfolio Manager Pro
 * Complete testing setup with coverage reporting and ESM support
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Test match patterns
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js', '**/__tests__/**/*.js'],

  // No transform needed with NODE_OPTIONS=--experimental-vm-modules
  transform: {},

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Files to collect coverage from (all modules)
  collectCoverageFrom: [
    'modules/**/*.js',
    'theme-manager.js',
    'market-data-service.js',
    'multi-portfolio.js',
    'advanced-charts.js',
    'calculations-engine.js',
    'error-handler.js',
    'data-validation.js',
    '!jest.config.cjs',
    '!babel.config.cjs',
    '!coverage/**',
    '!node_modules/**',
    '!tests/**',
    '!__tests__/**',
    '!*.test.js',
    '!*.spec.js',
  ],

  // Coverage thresholds (re-enabled after Jest/ESM fixes)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Transform files
  transform: {},

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/coverage/', '/ORIGINAL/'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Timeout for tests (10 seconds)
  testTimeout: 10000,

  // Global test setup
  globals: {
    NODE_ENV: 'test',
  },
};
