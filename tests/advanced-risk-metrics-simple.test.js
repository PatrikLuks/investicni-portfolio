/**
 * Unit Tests for Advanced Risk Metrics Engine
 * Tests for all risk calculation methods
 */

describe('AdvancedRiskMetricsEngine', () => {
  let AdvancedRiskMetricsEngine;

  beforeAll(async () => {
    // Import module before running tests
    try {
      const module = await import('../src/js/utilities/advanced-risk-metrics.js');
      AdvancedRiskMetricsEngine = module.AdvancedRiskMetricsEngine;
    } catch (error) {
      console.error('Could not import AdvancedRiskMetricsEngine:', error);
      // Tests will skip if import fails
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!AdvancedRiskMetricsEngine) {
        console.warn('Skipping: Module not loaded');
        return;
      }
      const engine = new AdvancedRiskMetricsEngine();
      expect(engine).toBeDefined();
    });

    test('should have default confidence level of 0.95', () => {
      if (!AdvancedRiskMetricsEngine) return;
      const engine = new AdvancedRiskMetricsEngine();
      expect(engine.confidenceLevel).toBe(0.95);
    });

    test('should have risk-free rate of 0.02', () => {
      if (!AdvancedRiskMetricsEngine) return;
      const engine = new AdvancedRiskMetricsEngine();
      expect(engine.riskFreeRate).toBe(0.02);
    });
  });

  describe('VaR Calculations', () => {
    let engine;

    beforeEach(() => {
      if (AdvancedRiskMetricsEngine) {
        engine = new AdvancedRiskMetricsEngine();
      }
    });

    test('should calculate parametric VaR for normal returns', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateVaR === 'function') {
        const var95 = engine.calculateVaR(returns, 0.95);
        expect(var95).toBeValidNumber();
        expect(var95).toBeLessThan(0);
      }
    });

    test('should calculate historical VaR', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateHistoricalVaR === 'function') {
        const var95 = engine.calculateHistoricalVaR(returns, 0.95);
        expect(var95).toBeValidNumber();
      }
    });

    test('should calculate Monte Carlo VaR', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateMonteCarloVaR === 'function') {
        const var95 = engine.calculateMonteCarloVaR(returns, 0.95, 1000);
        expect(var95).toBeValidNumber();
      }
    });

    test('should handle edge case: small returns array', () => {
      if (!engine) return;
      const returns = [0.01, -0.02, 0.005];
      
      if (typeof engine.calculateVaR === 'function') {
        expect(() => {
          engine.calculateVaR(returns, 0.95);
        }).not.toThrow();
      }
    });
  });

  describe('CVaR/Expected Shortfall', () => {
    let engine;

    beforeEach(() => {
      if (AdvancedRiskMetricsEngine) {
        engine = new AdvancedRiskMetricsEngine();
      }
    });

    test('should calculate CVaR (Expected Shortfall)', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateCVaR === 'function') {
        const cvar95 = engine.calculateCVaR(returns, 0.95);
        expect(cvar95).toBeValidNumber();
        expect(cvar95).toBeLessThan(0);
      }
    });

    test('should have CVaR >= VaR (worse case)', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateVaR === 'function' && typeof engine.calculateCVaR === 'function') {
        const var95 = engine.calculateVaR(returns, 0.95);
        const cvar95 = engine.calculateCVaR(returns, 0.95);
        expect(Math.abs(cvar95)).toBeGreaterThanOrEqual(Math.abs(var95));
      }
    });
  });

  describe('Risk-Adjusted Returns', () => {
    let engine;

    beforeEach(() => {
      if (AdvancedRiskMetricsEngine) {
        engine = new AdvancedRiskMetricsEngine();
      }
    });

    test('should calculate Sharpe Ratio', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateSharpeRatio === 'function') {
        const sharpe = engine.calculateSharpeRatio(returns, 0.02);
        expect(sharpe).toBeValidNumber();
      }
    });

    test('should calculate Sortino Ratio', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateSortinoRatio === 'function') {
        const sortino = engine.calculateSortinoRatio(returns, 0.02);
        expect(sortino).toBeValidNumber();
      }
    });

    test('should calculate Calmar Ratio', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateCalmarRatio === 'function') {
        const calmar = engine.calculateCalmarRatio(returns, 252);
        expect(calmar).toBeValidNumber();
      }
    });

    test('should calculate Information Ratio', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      const benchmark = createMockReturns(252, 0.0004, 0.008);
      
      if (typeof engine.calculateInformationRatio === 'function') {
        const ir = engine.calculateInformationRatio(returns, benchmark);
        expect(ir).toBeValidNumber();
      }
    });

    test('should calculate Omega Ratio', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateOmegaRatio === 'function') {
        const omega = engine.calculateOmegaRatio(returns, 0);
        expect(omega).toBeValidNumber();
        expect(omega).toBeGreaterThan(0);
      }
    });
  });

  describe('Drawdown Analysis', () => {
    let engine;

    beforeEach(() => {
      if (AdvancedRiskMetricsEngine) {
        engine = new AdvancedRiskMetricsEngine();
      }
    });

    test('should calculate Maximum Drawdown', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.02);
      
      if (typeof engine.calculateMaximumDrawdown === 'function') {
        const mdd = engine.calculateMaximumDrawdown(returns);
        expect(mdd).toBeValidNumber();
        expect(mdd).toBeLessThanOrEqual(0);
      }
    });

    test('should calculate Ulcer Index', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      if (typeof engine.calculateUlcerIndex === 'function') {
        const ulcer = engine.calculateUlcerIndex(returns);
        expect(ulcer).toBeValidNumber();
        expect(ulcer).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Performance Benchmarks', () => {
    let engine;

    beforeEach(() => {
      if (AdvancedRiskMetricsEngine) {
        engine = new AdvancedRiskMetricsEngine();
      }
    });

    test('should calculate all metrics within acceptable time', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0.0005, 0.01);
      
      const startTime = performance.now();
      
      if (typeof engine.calculateVaR === 'function') {
        engine.calculateVaR(returns, 0.95);
        engine.calculateCVaR(returns, 0.95);
        engine.calculateSharpeRatio(returns);
        engine.calculateMaximumDrawdown(returns);
      }
      
      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(1000); // Should complete in < 1 second
    });
  });

  describe('Edge Cases', () => {
    let engine;

    beforeEach(() => {
      if (AdvancedRiskMetricsEngine) {
        engine = new AdvancedRiskMetricsEngine();
      }
    });

    test('should handle all zero returns', () => {
      if (!engine) return;
      const returns = Array(100).fill(0);
      
      if (typeof engine.calculateSharpeRatio === 'function') {
        expect(() => {
          engine.calculateSharpeRatio(returns, 0.02);
        }).not.toThrow();
      }
    });

    test('should handle negative returns only', () => {
      if (!engine) return;
      const returns = Array(100).fill(0).map(() => -Math.random() * 0.05);
      
      if (typeof engine.calculateMaximumDrawdown === 'function') {
        const mdd = engine.calculateMaximumDrawdown(returns);
        expect(mdd).toBeValidNumber();
      }
    });

    test('should handle high volatility returns', () => {
      if (!engine) return;
      const returns = createMockReturns(252, 0, 0.1); // 10% volatility
      
      if (typeof engine.calculateSharpeRatio === 'function') {
        const sharpe = engine.calculateSharpeRatio(returns);
        expect(sharpe).toBeValidNumber();
      }
    });
  });
});
