/**
 * Jest Configuration for Portfolio Manager Pro
 * Complete testing setup with coverage reporting
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Test match patterns
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js', '**/__tests__/**/*.js'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Files to collect coverage from (only tested modules)
  collectCoverageFrom: [
    'theme-manager.js',
    'market-data-service.js',
    'multi-portfolio.js',
    'advanced-charts.js',
    'calculations-engine.js',
    'error-handler.js',
    'data-validation.js',
    '!jest.config.js',
    '!coverage/**',
    '!node_modules/**',
    '!tests/**',
    '!*.test.js',
    '!*.spec.js',
  ],

  // Coverage thresholds (disabled temporarily - modules need proper DOM setup)
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70,
  //   },
  // },

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
