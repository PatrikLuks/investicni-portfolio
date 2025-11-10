/**
 * @fileoverview Unit Tests for Advanced Risk Metrics Engine
 * Tests all risk calculation methods with various portfolio scenarios
 * 
 * @module tests/advanced-risk-metrics.test
 * @requires advanced-risk-metrics.js
 */

import AdvancedRiskMetricsEngine from '../src/js/utilities/advanced-risk-metrics.js';

describe('Advanced Risk Metrics Engine', () => {
  let riskMetrics;
  
  // Test data - realistic portfolio scenarios
  const mockPortfolio = {
    assets: [
      { symbol: 'AAPL', weight: 0.3, returns: [0.02, 0.015, -0.01, 0.025, 0.018] },
      { symbol: 'GOOGL', weight: 0.25, returns: [0.018, 0.022, 0.01, 0.02, 0.015] },
      { symbol: 'MSFT', weight: 0.25, returns: [0.025, 0.018, 0.005, 0.022, 0.02] },
      { symbol: 'TSLA', weight: 0.2, returns: [-0.05, 0.08, -0.02, 0.06, 0.04] }
    ],
    riskFreeRate: 0.02,
    totalReturn: 0.15
  };

  const mockReturns = [0.02, 0.015, -0.01, 0.025, 0.018, -0.005, 0.022, 0.03, -0.015, 0.025];
  const mockDownsideReturns = [-0.01, -0.005, -0.015]; // Only negative returns

  // ==================== SETUP & TEARDOWN ====================

  beforeEach(() => {
    // Initialize AdvancedRiskMetrics engine
    riskMetrics = new AdvancedRiskMetricsEngine();
    expect(riskMetrics).toBeDefined();
  });

  afterEach(() => {
    riskMetrics = null;
  });

  // ==================== VALUE AT RISK (VaR) TESTS ====================

  describe('Value at Risk (VaR) Calculations', () => {
    
    test('calculateVaR() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateVaR).toBe('function');
    });

    test('calculateVaR with parametric method should return valid VaR', () => {
      const vaR = riskMetrics.calculateVaR(mockPortfolio.assets, 0.95, 'parametric');
      
      expect(vaR).toBeDefined();
      expect(typeof vaR).toBe('number');
      expect(vaR).toBeGreaterThan(0);
      expect(vaR).toBeLessThan(1); // VaR should be between 0-100%
    });

    test('calculateVaR with historical method should return valid VaR', () => {
      const vaR = riskMetrics.calculateVaR(mockReturns, 0.95, 'historical');
      
      expect(vaR).toBeDefined();
      expect(typeof vaR).toBe('number');
      expect(vaR).toBeGreaterThan(0);
    });

    test('calculateVaR with Monte Carlo method should return valid VaR', () => {
      const vaR = riskMetrics.calculateVaR(mockReturns, 0.95, 'montecarlo');
      
      expect(vaR).toBeDefined();
      expect(typeof vaR).toBe('number');
      expect(vaR).toBeGreaterThan(0);
    });

    test('higher confidence level should produce higher VaR', () => {
      const vaR95 = riskMetrics.calculateVaR(mockReturns, 0.95, 'parametric');
      const vaR99 = riskMetrics.calculateVaR(mockReturns, 0.99, 'parametric');
      
      expect(vaR99).toBeGreaterThan(vaR95);
    });

    test('calculateVaR should handle empty returns gracefully', () => {
      const vaR = riskMetrics.calculateVaR([], 0.95, 'parametric');
      
      expect(vaR).toBeDefined();
      expect(typeof vaR).toBe('number');
    });
  });

  // ==================== CONDITIONAL VALUE AT RISK (CVaR) TESTS ====================

  describe('Conditional Value at Risk (CVaR) Calculations', () => {
    
    test('calculateCVaR() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateCVaR).toBe('function');
    });

    test('calculateCVaR should return valid CVaR value', () => {
      const cvaR = riskMetrics.calculateCVaR(mockReturns, 0.95);
      
      expect(cvaR).toBeDefined();
      expect(typeof cvaR).toBe('number');
      expect(cvaR).toBeGreaterThan(0);
    });

    test('CVaR should be greater than or equal to VaR', () => {
      const vaR = riskMetrics.calculateVaR(mockReturns, 0.95, 'parametric');
      const cvaR = riskMetrics.calculateCVaR(mockReturns, 0.95);
      
      expect(cvaR).toBeGreaterThanOrEqual(vaR);
    });

    test('CVaR should increase with confidence level', () => {
      const cvaR95 = riskMetrics.calculateCVaR(mockReturns, 0.95);
      const cvaR99 = riskMetrics.calculateCVaR(mockReturns, 0.99);
      
      expect(cvaR99).toBeGreaterThanOrEqual(cvaR95);
    });
  });

  // ==================== SHARPE RATIO TESTS ====================

  describe('Sharpe Ratio Calculations', () => {
    
    test('calculateSharpeRatio() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateSharpeRatio).toBe('function');
    });

    test('calculateSharpeRatio should return valid Sharpe ratio', () => {
      const sharpe = riskMetrics.calculateSharpeRatio(mockReturns, 0.02);
      
      expect(sharpe).toBeDefined();
      expect(typeof sharpe).toBe('number');
    });

    test('positive returns with low volatility should have high Sharpe', () => {
      const stableReturns = [0.01, 0.011, 0.009, 0.01, 0.012];
      const sharpe = riskMetrics.calculateSharpeRatio(stableReturns, 0.005);
      
      expect(sharpe).toBeGreaterThan(0);
    });

    test('negative excess returns should produce negative Sharpe', () => {
      const poorReturns = [0.005, 0.004, 0.006, 0.003, 0.005];
      const sharpe = riskMetrics.calculateSharpeRatio(poorReturns, 0.01);
      
      expect(sharpe).toBeLessThan(0);
    });

    test('Sharpe ratio should handle equal prices gracefully', () => {
      const flatReturns = [0, 0, 0, 0, 0];
      const sharpe = riskMetrics.calculateSharpeRatio(flatReturns, 0.02);
      
      expect(typeof sharpe).toBe('number');
    });
  });

  // ==================== SORTINO RATIO TESTS ====================

  describe('Sortino Ratio Calculations', () => {
    
    test('calculateSortinoRatio() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateSortinoRatio).toBe('function');
    });

    test('calculateSortinoRatio should return valid Sortino ratio', () => {
      const sortino = riskMetrics.calculateSortinoRatio(mockReturns, 0.02);
      
      expect(sortino).toBeDefined();
      expect(typeof sortino).toBe('number');
    });

    test('Sortino ratio should be >= Sharpe ratio (downside focus)', () => {
      const sharpe = riskMetrics.calculateSharpeRatio(mockReturns, 0.02);
      const sortino = riskMetrics.calculateSortinoRatio(mockReturns, 0.02);
      
      // Sortino focuses on downside, so generally >= Sharpe
      expect(sortino).toBeGreaterThanOrEqual(sharpe - 0.1); // Allow small margin
    });

    test('Sortino should ignore upside volatility', () => {
      const upsideReturns = [0.05, 0.06, 0.04, 0.07, 0.05]; // All positive
      const sortino = riskMetrics.calculateSortinoRatio(upsideReturns, 0.02);
      
      expect(sortino).toBeGreaterThan(0);
    });
  });

  // ==================== CALMAR RATIO TESTS ====================

  describe('Calmar Ratio Calculations', () => {
    
    test('calculateCalmárRatio() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateCalmárRatio).toBe('function');
    });

    test('calculateCalmárRatio should return valid Calmar ratio', () => {
      const calmar = riskMetrics.calculateCalmárRatio(mockReturns, 12);
      
      expect(calmar).toBeDefined();
      expect(typeof calmar).toBe('number');
    });

    test('higher annual return should increase Calmar ratio', () => {
      const calmarLow = riskMetrics.calculateCalmárRatio([0.005, 0.004, 0.006], 12);
      const calmarHigh = riskMetrics.calculateCalmárRatio([0.05, 0.04, 0.06], 12);
      
      expect(calmarHigh).toBeGreaterThan(calmarLow);
    });
  });

  // ==================== INFORMATION RATIO TESTS ====================

  describe('Information Ratio Calculations', () => {
    
    test('calculateInformationRatio() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateInformationRatio).toBe('function');
    });

    test('calculateInformationRatio should return valid IR', () => {
      const benchmarkReturns = [0.01, 0.008, 0.012, 0.009, 0.011];
      const ir = riskMetrics.calculateInformationRatio(mockReturns, benchmarkReturns);
      
      expect(ir).toBeDefined();
      expect(typeof ir).toBe('number');
    });

    test('outperforming benchmark should have positive IR', () => {
      const benchmarkReturns = [0.005, 0.004, 0.006, 0.003, 0.005];
      const outperformReturns = [0.02, 0.015, -0.01, 0.025, 0.018];
      const ir = riskMetrics.calculateInformationRatio(outperformReturns, benchmarkReturns);
      
      expect(ir).toBeGreaterThan(0);
    });
  });

  // ==================== OMEGA RATIO TESTS ====================

  describe('Omega Ratio Calculations', () => {
    
    test('calculateOmegaRatio() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateOmegaRatio).toBe('function');
    });

    test('calculateOmegaRatio should return valid Omega', () => {
      const omega = riskMetrics.calculateOmegaRatio(mockReturns, 0.01);
      
      expect(omega).toBeDefined();
      expect(typeof omega).toBe('number');
      expect(omega).toBeGreaterThan(0);
    });

    test('Omega > 1 indicates more gains than losses above threshold', () => {
      const goodReturns = [0.05, 0.04, 0.03, 0.06, 0.05]; // All positive
      const omega = riskMetrics.calculateOmegaRatio(goodReturns, 0.01);
      
      expect(omega).toBeGreaterThan(1);
    });

    test('Omega < 1 indicates more losses than gains above threshold', () => {
      const badReturns = [-0.05, -0.04, -0.03, -0.06, -0.05]; // All negative
      const omega = riskMetrics.calculateOmegaRatio(badReturns, 0.01);
      
      expect(omega).toBeLessThan(1);
    });
  });

  // ==================== ULCER INDEX TESTS ====================

  describe('Ulcer Index Calculations', () => {
    
    test('calculateUlcerIndex() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateUlcerIndex).toBe('function');
    });

    test('calculateUlcerIndex should return valid Ulcer Index', () => {
      const ulcer = riskMetrics.calculateUlcerIndex(mockReturns);
      
      expect(ulcer).toBeDefined();
      expect(typeof ulcer).toBe('number');
      expect(ulcer).toBeGreaterThanOrEqual(0);
    });

    test('high volatility portfolio should have high Ulcer Index', () => {
      const volatileReturns = [-0.2, 0.3, -0.15, 0.25, -0.1];
      const ulcer = riskMetrics.calculateUlcerIndex(volatileReturns);
      
      expect(ulcer).toBeGreaterThan(0.01); // Significant ulcer
    });

    test('stable portfolio should have low Ulcer Index', () => {
      const stableReturns = [0.01, 0.011, 0.009, 0.01, 0.012];
      const ulcer = riskMetrics.calculateUlcerIndex(stableReturns);
      
      expect(ulcer).toBeLessThan(0.001); // Low ulcer
    });
  });

  // ==================== MAXIMUM DRAWDOWN TESTS ====================

  describe('Maximum Drawdown Calculations', () => {
    
    test('calculateMaxDrawdown() should exist and be callable', () => {
      expect(typeof riskMetrics.calculateMaxDrawdown).toBe('function');
    });

    test('calculateMaxDrawdown should return valid drawdown value', () => {
      const drawdown = riskMetrics.calculateMaxDrawdown(mockReturns);
      
      expect(drawdown).toBeDefined();
      expect(typeof drawdown).toBe('number');
      expect(drawdown).toBeGreaterThanOrEqual(0);
      expect(drawdown).toBeLessThanOrEqual(1);
    });

    test('portfolio with 50% drop should have significant drawdown', () => {
      const declineReturns = [-0.1, -0.15, -0.2, -0.05, 0.1]; // -50% cumulative
      const drawdown = riskMetrics.calculateMaxDrawdown(declineReturns);
      
      expect(drawdown).toBeGreaterThan(0.3);
    });

    test('all positive returns should have zero drawdown', () => {
      const positiveReturns = [0.05, 0.04, 0.03, 0.06, 0.05];
      const drawdown = riskMetrics.calculateMaxDrawdown(positiveReturns);
      
      expect(drawdown).toBe(0);
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Risk Metrics Integration', () => {
    
    test('calculateRiskProfile should return comprehensive risk metrics', () => {
      const profile = riskMetrics.calculateRiskProfile(mockPortfolio.assets);
      
      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('vaR');
      expect(profile).toHaveProperty('cvar');
      expect(profile).toHaveProperty('sharpeRatio');
      expect(profile).toHaveProperty('sortinoRatio');
      expect(profile).toHaveProperty('maxDrawdown');
    });

    test('all risk metrics should be non-null numbers', () => {
      const profile = riskMetrics.calculateRiskProfile(mockReturns);
      
      expect(typeof profile.vaR).toBe('number');
      expect(typeof profile.cvar).toBe('number');
      expect(typeof profile.sharpeRatio).toBe('number');
      expect(typeof profile.maxDrawdown).toBe('number');
    });

    test('risk metrics should be consistent across methods', () => {
      const profile1 = riskMetrics.calculateRiskProfile(mockReturns);
      const profile2 = riskMetrics.calculateRiskProfile(mockReturns);
      
      expect(profile1.vaR).toBe(profile2.vaR);
      expect(profile1.sharpeRatio).toBe(profile2.sharpeRatio);
    });
  });

  // ==================== EDGE CASE TESTS ====================

  describe('Edge Cases & Error Handling', () => {
    
    test('should handle null/undefined gracefully', () => {
      expect(() => {
        riskMetrics.calculateVaR(null, 0.95);
      }).not.toThrow();
    });

    test('should handle single return value', () => {
      const sharpe = riskMetrics.calculateSharpeRatio([0.05], 0.02);
      expect(typeof sharpe).toBe('number');
    });

    test('should handle very large values', () => {
      const largeReturns = [1000, 2000, 1500, 2500];
      const sharpe = riskMetrics.calculateSharpeRatio(largeReturns, 100);
      
      expect(typeof sharpe).toBe('number');
      expect(Number.isFinite(sharpe)).toBe(true);
    });

    test('should handle very small values', () => {
      const smallReturns = [0.00001, 0.00002, 0.00001, 0.00003];
      const sharpe = riskMetrics.calculateSharpeRatio(smallReturns, 0.000005);
      
      expect(typeof sharpe).toBe('number');
      expect(Number.isFinite(sharpe)).toBe(true);
    });

    test('should handle extreme negative returns', () => {
      const extremeReturns = [-0.99, -0.95, -0.9, -0.85, -0.99];
      const drawdown = riskMetrics.calculateMaxDrawdown(extremeReturns);
      
      expect(drawdown).toBeGreaterThan(0.8);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance Benchmarks', () => {
    
    test('calculateVaR should complete in < 100ms for 1000 returns', () => {
      const largeReturns = Array(1000).fill(0).map(() => Math.random() * 0.1 - 0.05);
      
      const start = performance.now();
      riskMetrics.calculateVaR(largeReturns, 0.95, 'parametric');
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    test('calculateRiskProfile should complete in < 500ms for complex portfolio', () => {
      const complexAssets = Array(100).fill(null).map((_, i) => ({
        symbol: `ASSET_${i}`,
        weight: 1/100,
        returns: Array(252).fill(0).map(() => Math.random() * 0.1 - 0.05)
      }));
      
      const start = performance.now();
      riskMetrics.calculateRiskProfile(complexAssets);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });
});
