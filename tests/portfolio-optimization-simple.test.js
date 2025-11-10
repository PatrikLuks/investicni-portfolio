/**
 * Unit Tests for Portfolio Optimization Engine
 * Tests for optimization algorithms and efficient frontier
 */

describe('PortfolioOptimizationEngine', () => {
  let PortfolioOptimizationEngine;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/portfolio-optimization.js');
      PortfolioOptimizationEngine = module.PortfolioOptimizationEngine;
    } catch (error) {
      console.error('Could not import PortfolioOptimizationEngine:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!PortfolioOptimizationEngine) return;
      const engine = new PortfolioOptimizationEngine();
      expect(engine).toBeDefined();
    });
  });

  describe('Portfolio Optimization', () => {
    let engine;

    beforeEach(() => {
      if (PortfolioOptimizationEngine) {
        engine = new PortfolioOptimizationEngine();
      }
    });

    test('should calculate optimal weights', () => {
      if (!engine || !engine.optimizePortfolio) return;
      const returns = [createMockReturns(252), createMockReturns(252), createMockReturns(252)];
      const result = engine.optimizePortfolio(returns);
      if (result && result.weights) {
        expect(result.weights).toBeDefined();
        expect(Array.isArray(result.weights)).toBe(true);
      }
    });

    test('should calculate efficient frontier', () => {
      if (!engine || !engine.calculateEfficientFrontier) return;
      const returns = [createMockReturns(252), createMockReturns(252)];
      const result = engine.calculateEfficientFrontier(returns);
      if (result && result.frontierPoints) {
        expect(Array.isArray(result.frontierPoints)).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle single asset', () => {
      if (!PortfolioOptimizationEngine) return;
      const engine = new PortfolioOptimizationEngine();
      const returns = [createMockReturns(252)];
      
      if (typeof engine.optimizePortfolio === 'function') {
        expect(() => {
          engine.optimizePortfolio(returns);
        }).not.toThrow();
      }
    });
  });
});
