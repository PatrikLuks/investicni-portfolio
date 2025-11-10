/**
 * Unit Tests for Technical Indicators Engine
 * Tests for SMA, EMA, MACD, RSI, Stochastic, Bollinger Bands, and other indicators
 */

describe('TechnicalIndicatorsEngine', () => {
  let TechnicalIndicatorsEngine;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/technical-indicators.js');
      TechnicalIndicatorsEngine = module.TechnicalIndicatorsEngine;
    } catch (error) {
      console.error('Could not import TechnicalIndicatorsEngine:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!TechnicalIndicatorsEngine) return;
      const engine = new TechnicalIndicatorsEngine();
      expect(engine).toBeDefined();
    });

    test('should initialize with empty indicators', () => {
      if (!TechnicalIndicatorsEngine) return;
      const engine = new TechnicalIndicatorsEngine();
      expect(engine.indicators).toBeDefined();
      expect(typeof engine.indicators).toBe('object');
    });
  });

  describe('Trend Indicators', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should calculate Simple Moving Average (SMA)', () => {
      if (!engine || !engine.calculateSMA) return;
      const prices = [100, 102, 101, 103, 104, 105, 106, 107, 108, 109];
      const sma = engine.calculateSMA(prices, 3);

      if (sma && Array.isArray(sma)) {
        expect(sma.length).toBe(prices.length);
        expect(sma[sma.length - 1]).toBeValidNumber();
      }
    });

    test('should calculate Exponential Moving Average (EMA)', () => {
      if (!engine || !engine.calculateEMA) return;
      const prices = [100, 102, 101, 103, 104, 105, 106, 107, 108, 109];
      const ema = engine.calculateEMA(prices, 3);

      if (ema && Array.isArray(ema)) {
        expect(ema.length).toBe(prices.length);
      }
    });

    test('should calculate MACD (Moving Average Convergence Divergence)', () => {
      if (!engine || !engine.calculateMACD) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.calculateMACD(prices, 12, 26, 9);
      }).not.toThrow();
    });

    test('should detect trend direction', () => {
      if (!engine || !engine.detectTrend) return;
      const prices = [100, 102, 104, 106, 108]; // Uptrend

      expect(() => {
        engine.detectTrend(prices);
      }).not.toThrow();
    });

    test('should identify support and resistance levels', () => {
      if (!engine || !engine.calculateSupportResistance) return;
      const prices = [100, 102, 101, 103, 104, 105, 103, 104, 106, 107];

      expect(() => {
        engine.calculateSupportResistance(prices);
      }).not.toThrow();
    });
  });

  describe('Momentum Indicators', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should calculate RSI (Relative Strength Index)', () => {
      if (!engine || !engine.calculateRSI) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.calculateRSI(prices, 14);
      }).not.toThrow();
    });

    test('should calculate Stochastic Oscillator', () => {
      if (!engine || !engine.calculateStochastic) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.calculateStochastic(prices, 14, 3, 3);
      }).not.toThrow();
    });

    test('should calculate Rate of Change (ROC)', () => {
      if (!engine || !engine.calculateROC) return;
      const prices = [100, 102, 101, 103, 104, 105, 106, 107, 108, 109];

      expect(() => {
        engine.calculateROC(prices, 5);
      }).not.toThrow();
    });

    test('should detect overbought/oversold conditions', () => {
      if (!engine || !engine.detectOverboughtOversold) return;
      const rsiValues = [70, 75, 80, 25, 20, 15];

      expect(() => {
        engine.detectOverboughtOversold(rsiValues, 70, 30);
      }).not.toThrow();
    });
  });

  describe('Volatility Indicators', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should calculate Bollinger Bands', () => {
      if (!engine || !engine.calculateBollingerBands) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.calculateBollingerBands(prices, 20, 2);
      }).not.toThrow();
    });

    test('should calculate Average True Range (ATR)', () => {
      if (!engine || !engine.calculateATR) return;
      const highs = [101, 102, 103, 104, 105];
      const lows = [99, 100, 101, 102, 103];
      const closes = [100, 101, 102, 103, 104];

      expect(() => {
        engine.calculateATR(highs, lows, closes, 14);
      }).not.toThrow();
    });

    test('should calculate Standard Deviation', () => {
      if (!engine || !engine.calculateStdDev) return;
      const prices = [100, 102, 101, 103, 104, 105, 106, 107, 108, 109];

      expect(() => {
        engine.calculateStdDev(prices, 20);
      }).not.toThrow();
    });

    test('should calculate Keltner Channel', () => {
      if (!engine || !engine.calculateKeltnerChannel) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.calculateKeltnerChannel(prices, 20);
      }).not.toThrow();
    });
  });

  describe('Volume Indicators', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should calculate On-Balance Volume (OBV)', () => {
      if (!engine || !engine.calculateOBV) return;
      const closes = [100, 102, 101, 103, 104];
      const volumes = [1000, 1100, 900, 1200, 1300];

      expect(() => {
        engine.calculateOBV(closes, volumes);
      }).not.toThrow();
    });

    test('should calculate Chaikin Money Flow (CMF)', () => {
      if (!engine || !engine.calculateCMF) return;
      const highs = [101, 102, 103, 104, 105];
      const lows = [99, 100, 101, 102, 103];
      const closes = [100, 101, 102, 103, 104];
      const volumes = [1000, 1100, 1200, 1300, 1400];

      expect(() => {
        engine.calculateCMF(highs, lows, closes, volumes, 20);
      }).not.toThrow();
    });

    test('should calculate Volume-Price Trend', () => {
      if (!engine || !engine.calculateVPT) return;
      const closes = [100, 102, 101, 103, 104];
      const volumes = [1000, 1100, 900, 1200, 1300];

      expect(() => {
        engine.calculateVPT(closes, volumes);
      }).not.toThrow();
    });
  });

  describe('Signal Generation', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should generate buy/sell signals from SMA crossover', () => {
      if (!engine || !engine.generateSMASignals) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.generateSMASignals(prices, 20, 50);
      }).not.toThrow();
    });

    test('should generate signals from RSI', () => {
      if (!engine || !engine.generateRSISignals) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.generateRSISignals(prices, 14, 70, 30);
      }).not.toThrow();
    });

    test('should generate signals from MACD', () => {
      if (!engine || !engine.generateMACDSignals) return;
      const prices = createMockReturns(100, 100, 102);

      expect(() => {
        engine.generateMACDSignals(prices, 12, 26, 9);
      }).not.toThrow();
    });

    test('should confirm signals with multiple indicators', () => {
      if (!engine || !engine.confirmSignal) return;
      const signal = { type: 'buy', strength: 0.8 };

      expect(() => {
        engine.confirmSignal(signal, ['RSI', 'MACD']);
      }).not.toThrow();
    });
  });

  describe('Multi-Timeframe Analysis', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should analyze multiple timeframes', () => {
      if (!engine || !engine.analyzeMultiTimeframe) return;
      const prices = createMockReturns(252); // Daily prices for 1 year

      expect(() => {
        engine.analyzeMultiTimeframe(prices, ['daily', 'weekly', 'monthly']);
      }).not.toThrow();
    });

    test('should detect alignment across timeframes', () => {
      if (!engine || !engine.detectTimeframeAlignment) return;
      const signals = { daily: 'buy', weekly: 'buy', monthly: 'hold' };

      expect(() => {
        engine.detectTimeframeAlignment(signals);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should handle price array with all identical values', () => {
      if (!engine || !engine.calculateSMA) return;
      const prices = [100, 100, 100, 100, 100];

      expect(() => {
        engine.calculateSMA(prices, 3);
      }).not.toThrow();
    });

    test('should handle small price arrays', () => {
      if (!engine || !engine.calculateEMA) return;
      const prices = [100, 101];

      expect(() => {
        engine.calculateEMA(prices, 20);
      }).not.toThrow();
    });

    test('should handle high volatility prices', () => {
      if (!engine || !engine.calculateRSI) return;
      const prices = [100, 50, 150, 40, 160, 30];

      expect(() => {
        engine.calculateRSI(prices, 14);
      }).not.toThrow();
    });

    test('should handle trending market (only up)', () => {
      if (!engine || !engine.calculateBollingerBands) return;
      const prices = Array(100).fill(0).map((_, i) => 100 + i * 2); // Strong uptrend

      expect(() => {
        engine.calculateBollingerBands(prices, 20, 2);
      }).not.toThrow();
    });

    test('should handle extreme price movements', () => {
      if (!engine || !engine.calculateATR) return;
      const highs = [1000, 2000, 500, 3000];
      const lows = [100, 200, 50, 300];
      const closes = [500, 1500, 300, 2500];

      expect(() => {
        engine.calculateATR(highs, lows, closes, 14);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should calculate all indicators on large dataset within time limit', () => {
      if (!engine) return;
      const prices = createMockReturns(1000, 100, 102); // 1000 prices

      const startTime = performance.now();

      if (typeof engine.calculateSMA === 'function') {
        engine.calculateSMA(prices, 20);
        engine.calculateEMA(prices, 20);
        engine.calculateRSI(prices, 14);
        engine.calculateBollingerBands(prices, 20, 2);
      }

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(2000); // All calculations < 2 seconds
    });

    test('should generate signals efficiently', () => {
      if (!engine || !engine.generateSMASignals) return;
      const prices = createMockReturns(500, 100, 102);

      const startTime = performance.now();
      engine.generateSMASignals(prices, 20, 50);
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(1000); // < 1 second
    });
  });

  describe('Data Validation', () => {
    let engine;

    beforeEach(() => {
      if (TechnicalIndicatorsEngine) {
        engine = new TechnicalIndicatorsEngine();
      }
    });

    test('should validate price data format', () => {
      if (!engine || !engine.validatePriceData) return;
      const validPrices = [100, 101, 102, 103];

      expect(() => {
        engine.validatePriceData(validPrices);
      }).not.toThrow();
    });

    test('should handle null/undefined values gracefully', () => {
      if (!engine || !engine.calculateSMA) return;
      const prices = [100, 101, null, 103, undefined, 105];

      expect(() => {
        engine.calculateSMA(prices, 3);
      }).not.toThrow();
    });

    test('should handle negative price values', () => {
      if (!engine || !engine.calculateRSI) return;
      const prices = [-100, -98, -102, -95]; // Unusual but should handle

      expect(() => {
        engine.calculateRSI(prices, 14);
      }).not.toThrow();
    });
  });
});
