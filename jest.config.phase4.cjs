/**
 * @fileoverview Jest Configuration for Phase 4 Enterprise Modules Tests
 * Configure test environment for Advanced Risk Metrics, Portfolio Optimization, 
 * Regulatory Compliance, and other Phase 4 modules
 */

module.exports = {
  // Use jsdom for browser-like environment
  testEnvironment: 'jsdom',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@utilities/(.*)$': '<rootDir>/src/js/utilities/$1'
  },

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup-simple.js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/js/utilities/*.js',
    'modules/*.js',
    '!src/js/utilities/**/*.test.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],

  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },

  // Transform settings
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],

  // Test timeout (ms)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Reporter
  reporters: [
    'default'
  ],

  // Globals
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react'
      }
    }
  }
};
