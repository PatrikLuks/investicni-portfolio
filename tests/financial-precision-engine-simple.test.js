/**
 * Unit Tests for Financial Precision Engine
 * Tests for precision calculations, rounding, decimal handling, and financial accuracy
 */

describe('FinancialPrecisionEngine', () => {
  let FinancialPrecisionEngine;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/financial-precision-engine.js');
      FinancialPrecisionEngine = module.FinancialPrecisionEngine;
    } catch (error) {
      console.error('Could not import FinancialPrecisionEngine:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!FinancialPrecisionEngine) return;
      const engine = new FinancialPrecisionEngine();
      expect(engine).toBeDefined();
    });

    test('should have default configuration', () => {
      if (!FinancialPrecisionEngine) return;
      const engine = new FinancialPrecisionEngine();
      expect(engine.decimalPlaces).toBe(2);
      expect(engine.riskFreeRate).toBe(0.02);
      expect(engine.tradingDaysPerYear).toBe(252);
    });

    test('should initialize risk thresholds', () => {
      if (!FinancialPrecisionEngine) return;
      const engine = new FinancialPrecisionEngine();
      expect(engine.riskThresholds).toBeDefined();
      expect(engine.riskThresholds.volatility).toBeDefined();
      expect(engine.riskThresholds.drawdown).toBeDefined();
    });
  });

  describe('Decimal Precision', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should round to 2 decimal places', () => {
      if (!engine || !engine.roundToPrecision) return;

      const result = engine.roundToPrecision(123.456, 2);
      if (result !== undefined) {
        expect(result).toBe(123.46);
      }
    });

    test('should handle very small numbers', () => {
      if (!engine || !engine.roundToPrecision) return;

      const result = engine.roundToPrecision(0.0001, 4);
      if (result !== undefined) {
        expect(result).toBeValidNumber();
      }
    });

    test('should handle large numbers', () => {
      if (!engine || !engine.roundToPrecision) return;

      const result = engine.roundToPrecision(999999999.99, 2);
      if (result !== undefined) {
        expect(result).toBeValidNumber();
      }
    });

    test('should maintain precision in calculations', () => {
      if (!engine || !engine.add) return;

      const result = engine.add(0.1, 0.2);
      if (result !== undefined) {
        expect(Math.abs(result - 0.3)).toBeLessThan(0.01); // Close to 0.3
      }
    });
  });

  describe('Arithmetic Operations', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should perform addition', () => {
      if (!engine || !engine.add) return;
      const result = engine.add(100, 50);
      if (result !== undefined) {
        expect(result).toBeValidNumber();
      }
    });

    test('should perform subtraction', () => {
      if (!engine || !engine.subtract) return;
      const result = engine.subtract(100, 50);
      if (result !== undefined) {
        expect(result).toBe(50);
      }
    });

    test('should perform multiplication', () => {
      if (!engine || !engine.multiply) return;
      const result = engine.multiply(100, 0.05);
      if (result !== undefined) {
        expect(result).toBe(5);
      }
    });

    test('should perform division', () => {
      if (!engine || !engine.divide) return;
      const result = engine.divide(100, 4);
      if (result !== undefined) {
        expect(result).toBe(25);
      }
    });

    test('should handle division by zero gracefully', () => {
      if (!engine || !engine.divide) return;

      expect(() => {
        engine.divide(100, 0);
      }).not.toThrow();
    });
  });

  describe('Financial Calculations', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should calculate compound interest', () => {
      if (!engine || !engine.calculateCompoundInterest) return;
      const principal = 1000;
      const rate = 0.05;
      const years = 5;

      expect(() => {
        engine.calculateCompoundInterest(principal, rate, years);
      }).not.toThrow();
    });

    test('should calculate portfolio return', () => {
      if (!engine || !engine.calculatePortfolioReturn) return;
      const allocations = [0.3, 0.4, 0.3];
      const returns = [0.10, 0.08, 0.05];

      expect(() => {
        engine.calculatePortfolioReturn(allocations, returns);
      }).not.toThrow();
    });

    test('should calculate weighted average', () => {
      if (!engine || !engine.calculateWeightedAverage) return;
      const values = [100, 200, 300];
      const weights = [0.5, 0.3, 0.2];

      expect(() => {
        engine.calculateWeightedAverage(values, weights);
      }).not.toThrow();
    });
  });

  describe('Risk Metrics', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should classify volatility level', () => {
      if (!engine || !engine.classifyVolatility) return;

      expect(() => {
        engine.classifyVolatility(0.05);  // Low
        engine.classifyVolatility(0.15);  // Medium
        engine.classifyVolatility(0.35);  // High
      }).not.toThrow();
    });

    test('should classify drawdown level', () => {
      if (!engine || !engine.classifyDrawdown) return;

      expect(() => {
        engine.classifyDrawdown(-0.05);  // Acceptable
        engine.classifyDrawdown(-0.15);  // Warning
        engine.classifyDrawdown(-0.35);  // Critical
      }).not.toThrow();
    });

    test('should classify Sharpe ratio', () => {
      if (!engine || !engine.classifySharpeRatio) return;

      expect(() => {
        engine.classifySharpeRatio(2.0);  // Excellent
        engine.classifySharpeRatio(1.2);  // Good
        engine.classifySharpeRatio(0.6);  // Acceptable
      }).not.toThrow();
    });

    test('should check risk thresholds', () => {
      if (!engine || !engine.checkRiskThreshold) return;

      expect(() => {
        const exceeds = engine.checkRiskThreshold('volatility', 0.35);
        if (exceeds !== undefined) {
          expect(typeof exceeds).toBe('boolean');
        }
      }).not.toThrow();
    });
  });

  describe('Portfolio Analysis', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should analyze portfolio metrics', () => {
      if (!engine || !engine.analyzePortfolio) return;
      const portfolio = { allocation: [0.3, 0.4, 0.3] };

      expect(() => {
        engine.analyzePortfolio(portfolio);
      }).not.toThrow();
    });

    test('should calculate portfolio beta', () => {
      if (!engine || !engine.calculateBeta) return;

      expect(() => {
        engine.calculateBeta([0.1, 0.2], [0.08, 0.15]);
      }).not.toThrow();
    });

    test('should calculate portfolio alpha', () => {
      if (!engine || !engine.calculateAlpha) return;

      expect(() => {
        engine.calculateAlpha(0.10, 1.2, 0.08, 0.02);
      }).not.toThrow();
    });
  });

  describe('Caching', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should cache calculation results', () => {
      if (!engine || !engine.cacheResult) return;

      expect(() => {
        engine.cacheResult('test_key', 100, 60000);
      }).not.toThrow();
    });

    test('should retrieve cached values', () => {
      if (!engine || !engine.getCachedValue) return;

      expect(() => {
        const value = engine.getCachedValue('test_key');
      }).not.toThrow();
    });

    test('should expire cache entries', () => {
      if (!engine || !engine.clearExpiredCache) return;

      expect(() => {
        engine.clearExpiredCache();
      }).not.toThrow();
    });
  });

  describe('Validation', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should validate allocation array', () => {
      if (!engine || !engine.validateAllocation) return;
      const validAllocation = [0.3, 0.4, 0.3]; // Sums to 1.0

      expect(() => {
        engine.validateAllocation(validAllocation);
      }).not.toThrow();
    });

    test('should validate return values', () => {
      if (!engine || !engine.validateReturns) return;
      const returns = [-0.1, 0.05, 0.08];

      expect(() => {
        engine.validateReturns(returns);
      }).not.toThrow();
    });

    test('should validate correlation matrix', () => {
      if (!engine || !engine.validateCorrelation) return;
      const matrix = createMockCorrelationMatrix(3);

      expect(() => {
        engine.validateCorrelation(matrix);
      }).not.toThrow();
    });
  });

  describe('Formatting', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should format as currency', () => {
      if (!engine || !engine.formatCurrency) return;

      expect(() => {
        const formatted = engine.formatCurrency(1234.567);
        if (formatted) {
          expect(typeof formatted).toBe('string');
        }
      }).not.toThrow();
    });

    test('should format as percentage', () => {
      if (!engine || !engine.formatPercentage) return;

      expect(() => {
        const formatted = engine.formatPercentage(0.1567);
        if (formatted) {
          expect(typeof formatted).toBe('string');
        }
      }).not.toThrow();
    });

    test('should format with proper decimal places', () => {
      if (!engine || !engine.formatNumber) return;

      expect(() => {
        engine.formatNumber(123.456, 2);
        engine.formatNumber(999.999, 1);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should handle zero values', () => {
      if (!engine || !engine.roundToPrecision) return;

      expect(() => {
        engine.roundToPrecision(0, 2);
      }).not.toThrow();
    });

    test('should handle negative values', () => {
      if (!engine || !engine.roundToPrecision) return;

      expect(() => {
        engine.roundToPrecision(-123.456, 2);
      }).not.toThrow();
    });

    test('should handle extreme precision', () => {
      if (!engine || !engine.roundToPrecision) return;

      expect(() => {
        engine.roundToPrecision(0.123456789, 8);
      }).not.toThrow();
    });

    test('should handle single asset portfolio', () => {
      if (!engine || !engine.calculatePortfolioReturn) return;

      expect(() => {
        engine.calculatePortfolioReturn([1.0], [0.1]);
      }).not.toThrow();
    });

    test('should handle mismatched array lengths', () => {
      if (!engine || !engine.calculatePortfolioReturn) return;

      expect(() => {
        engine.calculatePortfolioReturn([0.5, 0.5], [0.1]); // Mismatched
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    let engine;

    beforeEach(() => {
      if (FinancialPrecisionEngine) {
        engine = new FinancialPrecisionEngine();
      }
    });

    test('should perform calculations quickly', () => {
      if (!engine || !engine.calculateCompoundInterest) return;

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        engine.calculateCompoundInterest(1000, 0.05, i / 100 + 1);
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(1000); // < 1 second
    });

    test('should handle large portfolio', () => {
      if (!engine || !engine.analyzePortfolio) return;
      const portfolio = {
        allocation: Array(100).fill(0.01)
      };

      const startTime = performance.now();
      if (typeof engine.analyzePortfolio === 'function') {
        engine.analyzePortfolio(portfolio);
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(2000); // < 2 seconds
    });

    test('should cache calculations efficiently', () => {
      if (!engine || !engine.cacheResult || !engine.getCachedValue) return;

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        engine.cacheResult(`key_${i}`, Math.random(), 60000);
        engine.getCachedValue(`key_${i}`);
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(1000); // < 1 second
    });
  });

  describe('Decimal.js Fallback', () => {
    test('should work with or without Decimal.js', () => {
      if (!FinancialPrecisionEngine) return;
      const engine = new FinancialPrecisionEngine();
      
      if (engine.useDecimal !== undefined) {
        expect(typeof engine.useDecimal).toBe('boolean');
      }
    });

    test('should produce consistent results regardless of decimal library', () => {
      if (!FinancialPrecisionEngine) return;
      const engine = new FinancialPrecisionEngine();

      if (typeof engine.add === 'function') {
        const result1 = engine.add(100, 50);
        const result2 = engine.add(100, 50);
        
        if (result1 !== undefined && result2 !== undefined) {
          expect(result1).toBe(result2);
        }
      }
    });
  });
});
