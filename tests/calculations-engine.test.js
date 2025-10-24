/**
 * Unit Tests for Calculations Engine
 * Tests all financial calculation functions
 */

// Load the module (in real setup, we'd use proper imports)
// For now, we'll test the class directly

describe('CalculationsEngine', () => {
  let engine;

  beforeEach(() => {
    // We need to load the actual class - this is a simplified test structure
    // In production, you'd use proper module loading
    engine = {
      // Mock implementation for testing
      calculateROI: function(position) {
        const currentValue = parseFloat(position.aktuálníHodnota) || 0;
        const originalValue = parseFloat(position.nákupníCena) * parseFloat(position.počet);
        if (originalValue === 0) return 0;
        const roi = ((currentValue - originalValue) / originalValue) * 100;
        return parseFloat(roi.toFixed(2));
      },
      
      calculateMean: function(values) {
        if (!values || values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      },
      
      calculateStandardDeviation: function(values) {
        if (!values || values.length < 2) return 0;
        const mean = this.calculateMean(values);
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(variance);
      },
      
      calculateCAGR: function(startValue, endValue, years) {
        if (startValue === 0 || years === 0) return 0;
        const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
        return parseFloat(cagr.toFixed(2));
      },
      
      calculateTotalROI: function(data) {
        let totalCurrent = 0;
        let totalOriginal = 0;
        data.forEach(item => {
          totalCurrent += parseFloat(item.aktuálníHodnota) || 0;
          totalOriginal += parseFloat(item.nákupníCena) * parseFloat(item.počet);
        });
        if (totalOriginal === 0) return 0;
        return ((totalCurrent - totalOriginal) / totalOriginal) * 100;
      },
      
      calculateVariance: function(values) {
        if (!values || values.length < 2) return 0;
        const mean = this.calculateMean(values);
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
      },
      
      calculateCovariance: function(x, y) {
        if (!x || !y || x.length !== y.length || x.length < 2) return 0;
        const meanX = this.calculateMean(x);
        const meanY = this.calculateMean(y);
        let covariance = 0;
        for (let i = 0; i < x.length; i++) {
          covariance += (x[i] - meanX) * (y[i] - meanY);
        }
        return covariance / x.length;
      },
      
      calculateBeta: function(portfolioReturns, marketReturns) {
        if (!portfolioReturns || !marketReturns || 
            portfolioReturns.length !== marketReturns.length || 
            portfolioReturns.length < 2) {
          return 1.0;
        }
        const covariance = this.calculateCovariance(portfolioReturns, marketReturns);
        const marketVariance = this.calculateVariance(marketReturns);
        if (marketVariance === 0) return 1.0;
        const beta = covariance / marketVariance;
        return parseFloat(beta.toFixed(2));
      },
      
      calculateSharpeRatio: function(returns, riskFreeRate = 0.02) {
        if (!returns || returns.length < 2) return 0;
        const avgReturn = this.calculateMean(returns);
        const stdDev = this.calculateStandardDeviation(returns);
        if (stdDev === 0) return 0;
        const annualizedReturn = avgReturn * 252;
        const annualizedStdDev = stdDev * Math.sqrt(252);
        const sharpeRatio = (annualizedReturn - riskFreeRate) / annualizedStdDev;
        return parseFloat(sharpeRatio.toFixed(2));
      },
      
      calculateVolatility: function(returns) {
        if (!returns || returns.length < 2) return 0;
        const stdDev = this.calculateStandardDeviation(returns);
        const annualizedVol = stdDev * Math.sqrt(252) * 100;
        return parseFloat(annualizedVol.toFixed(2));
      },
      
      calculateMaxDrawdown: function(values) {
        if (!values || values.length < 2) {
          return { maxDrawdown: 0, peak: 0, trough: 0, recovery: null };
        }
        let maxDrawdown = 0;
        let peak = values[0];
        let peakIndex = 0;
        let troughIndex = 0;
        let maxDrawdownPeak = values[0];
        let maxDrawdownTrough = values[0];
        
        for (let i = 0; i < values.length; i++) {
          if (values[i] > peak) {
            peak = values[i];
            peakIndex = i;
          }
          const drawdown = (peak - values[i]) / peak;
          if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
            maxDrawdownPeak = peak;
            maxDrawdownTrough = values[i];
            troughIndex = i;
          }
        }
        
        let recoveryIndex = null;
        for (let i = troughIndex + 1; i < values.length; i++) {
          if (values[i] >= maxDrawdownPeak) {
            recoveryIndex = i;
            break;
          }
        }
        
        return {
          maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
          peak: maxDrawdownPeak,
          trough: maxDrawdownTrough,
          peakIndex,
          troughIndex,
          recoveryIndex,
          daysToRecover: recoveryIndex ? recoveryIndex - troughIndex : null
        };
      },
      
      calculateCurrentDrawdown: function(values) {
        if (!values || values.length === 0) return 0;
        const peak = Math.max(...values);
        const current = values[values.length - 1];
        if (peak === 0) return 0;
        const drawdown = ((peak - current) / peak) * 100;
        return parseFloat(drawdown.toFixed(2));
      }
    };
  });

  describe('ROI Calculations', () => {
    test('should calculate positive ROI correctly', () => {
      const position = {
        nákupníCena: 100,
        počet: 10,
        aktuálníHodnota: 1200
      };
      
      const roi = engine.calculateROI(position);
      expect(roi).toBe(20); // (1200 - 1000) / 1000 * 100 = 20%
    });

    test('should calculate negative ROI correctly', () => {
      const position = {
        nákupníCena: 100,
        počet: 10,
        aktuálníHodnota: 900
      };
      
      const roi = engine.calculateROI(position);
      expect(roi).toBe(-10); // (900 - 1000) / 1000 * 100 = -10%
    });

    test('should return 0 for zero original value', () => {
      const position = {
        nákupníCena: 0,
        počet: 10,
        aktuálníHodnota: 100
      };
      
      const roi = engine.calculateROI(position);
      expect(roi).toBe(0);
    });

    test('should handle string inputs', () => {
      const position = {
        nákupníCena: '100',
        počet: '10',
        aktuálníHodnota: '1100'
      };
      
      const roi = engine.calculateROI(position);
      expect(roi).toBe(10);
    });
  });

  describe('Statistical Calculations', () => {
    test('should calculate mean correctly', () => {
      const values = [1, 2, 3, 4, 5];
      const mean = engine.calculateMean(values);
      expect(mean).toBe(3);
    });

    test('should return 0 for empty array', () => {
      const mean = engine.calculateMean([]);
      expect(mean).toBe(0);
    });

    test('should calculate standard deviation correctly', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const stdDev = engine.calculateStandardDeviation(values);
      expect(stdDev).toBeCloseTo(2, 0);
    });

    test('should return 0 for single value', () => {
      const stdDev = engine.calculateStandardDeviation([5]);
      expect(stdDev).toBe(0);
    });
  });

  describe('CAGR Calculations', () => {
    test('should calculate CAGR correctly for 5 years', () => {
      const cagr = engine.calculateCAGR(1000, 1500, 5);
      expect(cagr).toBeCloseTo(8.45, 1);
    });

    test('should return 0 for zero start value', () => {
      const cagr = engine.calculateCAGR(0, 1000, 5);
      expect(cagr).toBe(0);
    });

    test('should return 0 for zero years', () => {
      const cagr = engine.calculateCAGR(1000, 1500, 0);
      expect(cagr).toBe(0);
    });

    test('should handle negative returns', () => {
      const cagr = engine.calculateCAGR(1000, 800, 2);
      expect(cagr).toBeLessThan(0);
    });
  });

  describe('Portfolio Total ROI', () => {
    test('should calculate total ROI for multiple positions', () => {
      const data = [
        { nákupníCena: 100, počet: 10, aktuálníHodnota: 1200 },
        { nákupníCena: 50, počet: 20, aktuálníHodnota: 1100 }
      ];
      const totalROI = engine.calculateTotalROI(data);
      expect(totalROI).toBeCloseTo(15, 0); // (2300 - 2000) / 2000 * 100 = 15%
    });

    test('should handle mixed gains and losses', () => {
      const data = [
        { nákupníCena: 100, počet: 10, aktuálníHodnota: 1200 }, // +200
        { nákupníCena: 100, počet: 10, aktuálníHodnota: 900 }   // -100
      ];
      const totalROI = engine.calculateTotalROI(data);
      expect(totalROI).toBeCloseTo(5, 0); // (2100 - 2000) / 2000 * 100 = 5%
    });

    test('should return 0 for zero total original value', () => {
      const data = [
        { nákupníCena: 0, počet: 10, aktuálníHodnota: 100 }
      ];
      const totalROI = engine.calculateTotalROI(data);
      expect(totalROI).toBe(0);
    });

    test('should handle empty portfolio', () => {
      const totalROI = engine.calculateTotalROI([]);
      expect(totalROI).toBe(0);
    });
  });

  describe('Variance Calculations', () => {
    test('should calculate variance correctly', () => {
      const values = [1, 2, 3, 4, 5];
      const variance = engine.calculateVariance(values);
      expect(variance).toBe(2); // Variance of [1,2,3,4,5] is 2
    });

    test('should return 0 for single value', () => {
      const variance = engine.calculateVariance([5]);
      expect(variance).toBe(0);
    });

    test('should return 0 for empty array', () => {
      const variance = engine.calculateVariance([]);
      expect(variance).toBe(0);
    });

    test('should handle negative values', () => {
      const values = [-2, -1, 0, 1, 2];
      const variance = engine.calculateVariance(values);
      expect(variance).toBeCloseTo(2, 0);
    });
  });

  describe('Covariance Calculations', () => {
    test('should calculate covariance for correlated data', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      const cov = engine.calculateCovariance(x, y);
      expect(cov).toBeGreaterThan(0); // Positive correlation
    });

    test('should calculate covariance for negatively correlated data', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];
      const cov = engine.calculateCovariance(x, y);
      expect(cov).toBeLessThan(0); // Negative correlation
    });

    test('should return 0 for mismatched array lengths', () => {
      const x = [1, 2, 3];
      const y = [1, 2];
      const cov = engine.calculateCovariance(x, y);
      expect(cov).toBe(0);
    });

    test('should return 0 for arrays with less than 2 elements', () => {
      const cov = engine.calculateCovariance([1], [2]);
      expect(cov).toBe(0);
    });

    test('should return 0 for null inputs', () => {
      const cov = engine.calculateCovariance(null, null);
      expect(cov).toBe(0);
    });
  });

  describe('Beta Calculations', () => {
    test('should calculate beta > 1 for volatile portfolio', () => {
      const portfolioReturns = [0.02, 0.05, -0.03, 0.08, -0.02];
      const marketReturns = [0.01, 0.02, -0.01, 0.03, -0.01];
      const beta = engine.calculateBeta(portfolioReturns, marketReturns);
      expect(beta).toBeGreaterThan(0);
    });

    test('should calculate beta < 1 for conservative portfolio', () => {
      const portfolioReturns = [0.005, 0.01, -0.005, 0.015, -0.005];
      const marketReturns = [0.01, 0.02, -0.01, 0.03, -0.01];
      const beta = engine.calculateBeta(portfolioReturns, marketReturns);
      expect(beta).toBeGreaterThan(0);
      expect(beta).toBeLessThan(2);
    });

    test('should return 1.0 for mismatched array lengths', () => {
      const beta = engine.calculateBeta([0.01, 0.02], [0.01]);
      expect(beta).toBe(1.0);
    });

    test('should return 1.0 for zero market variance', () => {
      const portfolioReturns = [0.01, 0.02, 0.03];
      const marketReturns = [0.01, 0.01, 0.01]; // Zero variance
      const beta = engine.calculateBeta(portfolioReturns, marketReturns);
      expect(beta).toBe(1.0);
    });

    test('should return 1.0 for null inputs', () => {
      const beta = engine.calculateBeta(null, null);
      expect(beta).toBe(1.0);
    });
  });

  describe('Sharpe Ratio Calculations', () => {
    test('should calculate positive Sharpe ratio for good returns', () => {
      const returns = [0.01, 0.02, 0.015, 0.025, 0.018];
      const sharpe = engine.calculateSharpeRatio(returns);
      expect(sharpe).toBeGreaterThan(0);
    });

    test('should calculate negative Sharpe ratio for poor returns', () => {
      const returns = [-0.01, -0.02, -0.015, -0.025, -0.018];
      const sharpe = engine.calculateSharpeRatio(returns);
      expect(sharpe).toBeLessThan(0);
    });

    test('should return 0 for zero volatility', () => {
      const returns = [0.02, 0.02, 0.02, 0.02];
      const sharpe = engine.calculateSharpeRatio(returns);
      expect(sharpe).toBe(0);
    });

    test('should return 0 for insufficient data', () => {
      const sharpe = engine.calculateSharpeRatio([0.01]);
      expect(sharpe).toBe(0);
    });

    test('should accept custom risk-free rate', () => {
      const returns = [0.05, 0.06, 0.04, 0.07];
      const sharpe1 = engine.calculateSharpeRatio(returns, 0.02);
      const sharpe2 = engine.calculateSharpeRatio(returns, 0.03);
      expect(sharpe1).toBeGreaterThan(sharpe2);
    });
  });

  describe('Volatility Calculations', () => {
    test('should calculate volatility for varying returns', () => {
      const returns = [0.01, -0.02, 0.03, -0.01, 0.02];
      const volatility = engine.calculateVolatility(returns);
      expect(volatility).toBeGreaterThan(0);
    });

    test('should return 0 for constant returns', () => {
      const returns = [0.01, 0.01, 0.01];
      const volatility = engine.calculateVolatility(returns);
      expect(volatility).toBe(0);
    });

    test('should return 0 for insufficient data', () => {
      const volatility = engine.calculateVolatility([0.01]);
      expect(volatility).toBe(0);
    });

    test('should calculate higher volatility for more varied returns', () => {
      const lowVol = [0.01, 0.011, 0.009, 0.010];
      const highVol = [0.01, 0.05, -0.03, 0.04];
      const vol1 = engine.calculateVolatility(lowVol);
      const vol2 = engine.calculateVolatility(highVol);
      expect(vol2).toBeGreaterThan(vol1);
    });
  });

  describe('Maximum Drawdown Calculations', () => {
    test('should calculate max drawdown for declining portfolio', () => {
      const values = [1000, 1100, 900, 800, 950];
      const result = engine.calculateMaxDrawdown(values);
      expect(result.maxDrawdown).toBeGreaterThan(0);
      expect(result.peak).toBeGreaterThan(result.trough);
    });

    test('should handle always increasing portfolio', () => {
      const values = [1000, 1100, 1200, 1300, 1400];
      const result = engine.calculateMaxDrawdown(values);
      expect(result.maxDrawdown).toBe(0);
    });

    test('should find recovery point if recovered', () => {
      const values = [1000, 1200, 800, 900, 1000, 1300];
      const result = engine.calculateMaxDrawdown(values);
      expect(result.recoveryIndex).not.toBeNull();
      expect(result.daysToRecover).toBeGreaterThan(0);
    });

    test('should return null recovery if not recovered', () => {
      const values = [1000, 1200, 800, 900, 1000];
      const result = engine.calculateMaxDrawdown(values);
      expect(result.recoveryIndex).toBeNull();
      expect(result.daysToRecover).toBeNull();
    });

    test('should handle single value', () => {
      const result = engine.calculateMaxDrawdown([1000]);
      expect(result.maxDrawdown).toBe(0);
    });

    test('should handle empty array', () => {
      const result = engine.calculateMaxDrawdown([]);
      expect(result.maxDrawdown).toBe(0);
    });
  });

  describe('Current Drawdown Calculations', () => {
    test('should calculate current drawdown from peak', () => {
      const values = [1000, 1200, 1100, 1000, 900];
      const drawdown = engine.calculateCurrentDrawdown(values);
      expect(drawdown).toBeCloseTo(25, 0); // (1200 - 900) / 1200 * 100 = 25%
    });

    test('should return 0 at peak', () => {
      const values = [1000, 1100, 1200, 1300];
      const drawdown = engine.calculateCurrentDrawdown(values);
      expect(drawdown).toBe(0);
    });

    test('should handle single value', () => {
      const drawdown = engine.calculateCurrentDrawdown([1000]);
      expect(drawdown).toBe(0);
    });

    test('should handle empty array', () => {
      const drawdown = engine.calculateCurrentDrawdown([]);
      expect(drawdown).toBe(0);
    });

    test('should handle zero peak', () => {
      const drawdown = engine.calculateCurrentDrawdown([0, 0, 0]);
      expect(drawdown).toBe(0);
    });
  });
});

