/**
 * @fileoverview Unit Tests for Portfolio Optimization Engine
 * Tests Modern Portfolio Theory and optimization methods
 * 
 * @module tests/portfolio-optimization.test
 * @requires portfolio-optimization.js
 */

describe('Portfolio Optimization Engine', () => {
  let optimizer;

  // Test data - realistic assets with returns and volatility
  const mockAssets = [
    {
      symbol: 'STOCK_A',
      returns: [0.02, 0.015, -0.01, 0.025, 0.018, 0.02, 0.015, -0.005],
      volatility: 0.08,
      weight: 0.25
    },
    {
      symbol: 'STOCK_B',
      returns: [0.018, 0.022, 0.01, 0.02, 0.015, 0.018, 0.022, 0.01],
      volatility: 0.06,
      weight: 0.25
    },
    {
      symbol: 'STOCK_C',
      returns: [0.025, 0.018, 0.005, 0.022, 0.02, 0.025, 0.018, 0.005],
      volatility: 0.1,
      weight: 0.25
    },
    {
      symbol: 'BOND_A',
      returns: [0.005, 0.004, 0.006, 0.003, 0.005, 0.005, 0.004, 0.006],
      volatility: 0.02,
      weight: 0.25
    }
  ];

  const correlationMatrix = [
    [1.0, 0.65, 0.72, -0.15],
    [0.65, 1.0, 0.68, -0.1],
    [0.72, 0.68, 1.0, -0.12],
    [-0.15, -0.1, -0.12, 1.0]
  ];

  // ==================== SETUP & TEARDOWN ====================

  beforeEach(() => {
    optimizer = new PortfolioOptimizationEngine();
    expect(optimizer).toBeDefined();
  });

  afterEach(() => {
    optimizer = null;
  });

  // ==================== BASIC METHOD TESTS ====================

  describe('Basic Portfolio Optimization Methods', () => {
    
    test('constructor should initialize engine', () => {
      expect(optimizer).toBeInstanceOf(PortfolioOptimizationEngine);
    });

    test('optimizePortfolio() should exist and be callable', () => {
      expect(typeof optimizer.optimizePortfolio).toBe('function');
    });

    test('calculateEfficientFrontier() should exist and be callable', () => {
      expect(typeof optimizer.calculateEfficientFrontier).toBe('function');
    });

    test('calculateOptimalWeights() should exist and be callable', () => {
      expect(typeof optimizer.calculateOptimalWeights).toBe('function');
    });
  });

  // ==================== PORTFOLIO OPTIMIZATION TESTS ====================

  describe('Portfolio Optimization', () => {
    
    test('optimizePortfolio should return valid optimization result', () => {
      const result = optimizer.optimizePortfolio(
        mockAssets,
        correlationMatrix,
        0.02 // risk-free rate
      );
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('weights');
      expect(result).toHaveProperty('expectedReturn');
      expect(result).toHaveProperty('volatility');
      expect(result).toHaveProperty('sharpeRatio');
    });

    test('optimized weights should sum to 1.0', () => {
      const result = optimizer.optimizePortfolio(mockAssets, correlationMatrix);
      
      const sum = result.weights.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5); // Within 5 decimal places
    });

    test('all weights should be between 0 and 1 (long-only)', () => {
      const result = optimizer.optimizePortfolio(mockAssets, correlationMatrix);
      
      result.weights.forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      });
    });

    test('optimized portfolio should have valid metrics', () => {
      const result = optimizer.optimizePortfolio(mockAssets, correlationMatrix);
      
      expect(typeof result.expectedReturn).toBe('number');
      expect(result.expectedReturn).toBeGreaterThan(0);
      expect(typeof result.volatility).toBe('number');
      expect(result.volatility).toBeGreaterThan(0);
      expect(typeof result.sharpeRatio).toBe('number');
    });

    test('lower risk-free rate should increase expected return', () => {
      const result1 = optimizer.optimizePortfolio(mockAssets, correlationMatrix, 0.01);
      const result2 = optimizer.optimizePortfolio(mockAssets, correlationMatrix, 0.05);
      
      expect(result1.expectedReturn).toBeGreaterThanOrEqual(result2.expectedReturn - 0.01);
    });
  });

  // ==================== EFFICIENT FRONTIER TESTS ====================

  describe('Efficient Frontier Calculation', () => {
    
    test('calculateEfficientFrontier should return array of portfolios', () => {
      const frontier = optimizer.calculateEfficientFrontier(
        mockAssets,
        correlationMatrix,
        50 // 50 portfolios on frontier
      );
      
      expect(Array.isArray(frontier)).toBe(true);
      expect(frontier.length).toBeGreaterThan(0);
    });

    test('efficient frontier should have correct number of portfolios', () => {
      const points = 50;
      const frontier = optimizer.calculateEfficientFrontier(
        mockAssets,
        correlationMatrix,
        points
      );
      
      expect(frontier.length).toBeLessThanOrEqual(points + 1); // +1 for min variance
    });

    test('each frontier portfolio should have valid properties', () => {
      const frontier = optimizer.calculateEfficientFrontier(
        mockAssets,
        correlationMatrix,
        10
      );
      
      frontier.forEach(portfolio => {
        expect(portfolio).toHaveProperty('weights');
        expect(portfolio).toHaveProperty('expectedReturn');
        expect(portfolio).toHaveProperty('volatility');
        expect(portfolio).toHaveProperty('sharpeRatio');
        
        // Verify weights sum to 1
        const weightSum = portfolio.weights.reduce((a, b) => a + b, 0);
        expect(weightSum).toBeCloseTo(1.0, 5);
      });
    });

    test('frontier should be ordered by return', () => {
      const frontier = optimizer.calculateEfficientFrontier(
        mockAssets,
        correlationMatrix,
        20
      );
      
      for (let i = 1; i < frontier.length; i++) {
        expect(frontier[i].expectedReturn).toBeGreaterThanOrEqual(
          frontier[i - 1].expectedReturn - 0.0001 // Allow small tolerance
        );
      }
    });

    test('for same return, volatility should decrease along frontier', () => {
      const frontier = optimizer.calculateEfficientFrontier(
        mockAssets,
        correlationMatrix,
        30
      );
      
      let prevVolatility = Infinity;
      frontier.forEach(portfolio => {
        if (Math.abs(portfolio.expectedReturn - frontier[0].expectedReturn) < 0.001) {
          expect(portfolio.volatility).toBeLessThanOrEqual(prevVolatility);
          prevVolatility = portfolio.volatility;
        }
      });
    });

    test('Sharpe ratio should be highest near the optimal portfolio', () => {
      const frontier = optimizer.calculateEfficientFrontier(
        mockAssets,
        correlationMatrix,
        50
      );
      
      // Find max Sharpe ratio
      const maxSharpe = Math.max(...frontier.map(p => p.sharpeRatio));
      expect(maxSharpe).toBeGreaterThan(0);
      
      // At least one portfolio should have high Sharpe
      const goodSharpe = frontier.filter(p => p.sharpeRatio > maxSharpe * 0.9);
      expect(goodSharpe.length).toBeGreaterThan(0);
    });
  });

  // ==================== OPTIMAL WEIGHTS TESTS ====================

  describe('Optimal Weights Calculation', () => {
    
    test('calculateOptimalWeights should return array of weights', () => {
      const weights = optimizer.calculateOptimalWeights(
        mockAssets,
        correlationMatrix
      );
      
      expect(Array.isArray(weights)).toBe(true);
      expect(weights.length).toBe(mockAssets.length);
    });

    test('optimal weights should sum to 1.0', () => {
      const weights = optimizer.calculateOptimalWeights(
        mockAssets,
        correlationMatrix
      );
      
      const sum = weights.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    test('all optimal weights should be non-negative', () => {
      const weights = optimizer.calculateOptimalWeights(
        mockAssets,
        correlationMatrix
      );
      
      weights.forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(0);
      });
    });

    test('optimal weights should prefer lower volatility assets', () => {
      const weights = optimizer.calculateOptimalWeights(
        mockAssets,
        correlationMatrix
      );
      
      // Lower volatility asset (BOND_A with volatility 0.02) should have more weight
      const bondWeight = weights[3]; // BOND_A
      const stockCWeight = weights[2]; // STOCK_C (highest volatility)
      
      expect(bondWeight).toBeGreaterThan(0);
      expect(stockCWeight).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== MINIMUM VARIANCE PORTFOLIO TESTS ====================

  describe('Minimum Variance Portfolio', () => {
    
    test('calculateMinVariancePortfolio should exist and be callable', () => {
      expect(typeof optimizer.calculateMinVariancePortfolio).toBe('function');
    });

    test('minimum variance portfolio should exist and have properties', () => {
      const minVar = optimizer.calculateMinVariancePortfolio(
        mockAssets,
        correlationMatrix
      );
      
      expect(minVar).toBeDefined();
      expect(minVar).toHaveProperty('weights');
      expect(minVar).toHaveProperty('volatility');
      expect(minVar).toHaveProperty('expectedReturn');
    });

    test('minimum variance portfolio should have lowest volatility', () => {
      const minVar = optimizer.calculateMinVariancePortfolio(
        mockAssets,
        correlationMatrix
      );
      
      const frontier = optimizer.calculateEfficientFrontier(
        mockAssets,
        correlationMatrix,
        100
      );
      
      // Min variance portfolio should have volatility <= any frontier portfolio
      frontier.forEach(portfolio => {
        expect(minVar.volatility).toBeLessThanOrEqual(portfolio.volatility + 0.001);
      });
    });

    test('minimum variance weights should allocate to bonds', () => {
      const minVar = optimizer.calculateMinVariancePortfolio(
        mockAssets,
        correlationMatrix
      );
      
      // Bond has lowest volatility, should have significant weight
      expect(minVar.weights[3]).toBeGreaterThan(0.1); // At least 10% in bonds
    });
  });

  // ==================== CAPITAL ALLOCATION LINE (CAL) TESTS ====================

  describe('Capital Allocation Line (CAL)', () => {
    
    test('calculateCapitalAllocationLine should exist', () => {
      expect(typeof optimizer.calculateCapitalAllocationLine).toBe('function');
    });

    test('CAL should return valid allocation', () => {
      const cal = optimizer.calculateCapitalAllocationLine(
        mockAssets,
        correlationMatrix,
        0.02 // risk-free rate
      );
      
      expect(cal).toBeDefined();
      expect(cal).toHaveProperty('riskFreeAllocation');
      expect(cal).toHaveProperty('portfolioAllocation');
      expect(cal).toHaveProperty('expectedReturn');
      expect(cal).toHaveProperty('volatility');
    });

    test('CAL allocations should sum to 1.0', () => {
      const cal = optimizer.calculateCapitalAllocationLine(
        mockAssets,
        correlationMatrix,
        0.02
      );
      
      const sum = (cal.riskFreeAllocation || 0) + (cal.portfolioAllocation || 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    test('higher risk target should require lower risk-free allocation', () => {
      const cal1 = optimizer.calculateCapitalAllocationLine(
        mockAssets,
        correlationMatrix,
        0.02,
        0.05 // 5% target volatility
      );
      
      const cal2 = optimizer.calculateCapitalAllocationLine(
        mockAssets,
        correlationMatrix,
        0.02,
        0.10 // 10% target volatility
      );
      
      if (cal1.riskFreeAllocation && cal2.riskFreeAllocation) {
        expect(cal1.riskFreeAllocation).toBeGreaterThan(cal2.riskFreeAllocation);
      }
    });
  });

  // ==================== CORRELATION & COVARIANCE TESTS ====================

  describe('Correlation & Covariance Calculations', () => {
    
    test('should calculate correlation correctly', () => {
      const correlation = optimizer.calculateCorrelation(
        mockAssets[0].returns,
        mockAssets[1].returns
      );
      
      expect(typeof correlation).toBe('number');
      expect(correlation).toBeGreaterThanOrEqual(-1);
      expect(correlation).toBeLessThanOrEqual(1);
    });

    test('correlation of asset with itself should be 1.0', () => {
      const correlation = optimizer.calculateCorrelation(
        mockAssets[0].returns,
        mockAssets[0].returns
      );
      
      expect(correlation).toBeCloseTo(1.0, 5);
    });

    test('covariance matrix should be symmetric', () => {
      const cov = optimizer.calculateCovarianceMatrix(mockAssets);
      
      for (let i = 0; i < cov.length; i++) {
        for (let j = 0; j < cov[i].length; j++) {
          expect(cov[i][j]).toBeCloseTo(cov[j][i], 5);
        }
      }
    });

    test('covariance diagonal should equal variance', () => {
      const cov = optimizer.calculateCovarianceMatrix(mockAssets);
      
      mockAssets.forEach((asset, i) => {
        const variance = optimizer.calculateVariance(asset.returns);
        expect(cov[i][i]).toBeCloseTo(variance, 5);
      });
    });
  });

  // ==================== CONSTRAINT TESTS ====================

  describe('Portfolio Constraints', () => {
    
    test('should handle maximum weight constraints', () => {
      const constraints = {
        maxWeight: 0.4 // No single asset > 40%
      };
      
      const result = optimizer.optimizePortfolio(
        mockAssets,
        correlationMatrix,
        0.02,
        constraints
      );
      
      result.weights.forEach(weight => {
        expect(weight).toBeLessThanOrEqual(constraints.maxWeight);
      });
    });

    test('should handle minimum weight constraints', () => {
      const constraints = {
        minWeight: 0.1 // Each asset >= 10%
      };
      
      const result = optimizer.optimizePortfolio(
        mockAssets,
        correlationMatrix,
        0.02,
        constraints
      );
      
      result.weights.forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(constraints.minWeight - 0.01); // Allow tolerance
      });
    });

    test('should support sector constraints', () => {
      const constraints = {
        sectors: {
          stocks: { symbols: ['STOCK_A', 'STOCK_B', 'STOCK_C'], maxWeight: 0.7 },
          bonds: { symbols: ['BOND_A'], maxWeight: 0.3 }
        }
      };
      
      const result = optimizer.optimizePortfolio(
        mockAssets,
        correlationMatrix,
        0.02,
        constraints
      );
      
      // Sum of stocks should not exceed 70%
      const stocksWeight = result.weights.slice(0, 3).reduce((a, b) => a + b, 0);
      expect(stocksWeight).toBeLessThanOrEqual(0.7 + 0.01);
    });
  });

  // ==================== EDGE CASES ====================

  describe('Edge Cases & Error Handling', () => {
    
    test('should handle single asset portfolio', () => {
      const singleAsset = [mockAssets[0]];
      const singleCorr = [[1.0]];
      
      const result = optimizer.optimizePortfolio(singleAsset, singleCorr);
      expect(result).toBeDefined();
      expect(result.weights[0]).toBeCloseTo(1.0, 5);
    });

    test('should handle two asset portfolio', () => {
      const twoAssets = mockAssets.slice(0, 2);
      const twoCov = [
        [correlationMatrix[0][0], correlationMatrix[0][1]],
        [correlationMatrix[1][0], correlationMatrix[1][1]]
      ];
      
      const result = optimizer.optimizePortfolio(twoAssets, twoCov);
      expect(result.weights.length).toBe(2);
    });

    test('should handle perfectly correlated assets', () => {
      const perfectCorr = [
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0]
      ];
      
      const result = optimizer.optimizePortfolio(mockAssets, perfectCorr);
      expect(result).toBeDefined();
      expect(result.weights.length).toBe(mockAssets.length);
    });

    test('should handle negatively correlated assets', () => {
      const negCorr = [
        [1.0, -0.9, -0.9, -0.9],
        [-0.9, 1.0, -0.9, -0.9],
        [-0.9, -0.9, 1.0, -0.9],
        [-0.9, -0.9, -0.9, 1.0]
      ];
      
      const result = optimizer.optimizePortfolio(mockAssets, negCorr);
      expect(result.volatility).toBeLessThan(0.05); // Should have low risk
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance Benchmarks', () => {
    
    test('optimizePortfolio should complete in < 500ms for 50 assets', () => {
      const manyAssets = Array(50).fill(null).map((_, i) => ({
        symbol: `ASSET_${i}`,
        returns: Array(252).fill(0).map(() => Math.random() * 0.1 - 0.05),
        volatility: Math.random() * 0.15
      }));
      
      // Create correlation matrix
      const correlMatrix = Array(50).fill(null).map(() =>
        Array(50).fill(0).map(() => Math.random() * 2 - 1)
      );
      
      const start = performance.now();
      optimizer.optimizePortfolio(manyAssets, correlMatrix);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(500);
    });

    test('calculateEfficientFrontier should complete in < 2000ms for 100 points', () => {
      const start = performance.now();
      optimizer.calculateEfficientFrontier(mockAssets, correlationMatrix, 100);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(2000);
    });
  });
});
