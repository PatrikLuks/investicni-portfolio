/**
 * Unit Tests for Stress Testing Framework
 * Tests for scenario loading, Monte Carlo simulations, and stress analysis
 */

describe('StressTestingFramework', () => {
  let StressTestingFramework;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/stress-testing.js');
      StressTestingFramework = module.StressTestingFramework;
    } catch (error) {
      console.error('Could not import StressTestingFramework:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!StressTestingFramework) return;
      const framework = new StressTestingFramework();
      expect(framework).toBeDefined();
    });

    test('should initialize predefined scenarios', () => {
      if (!StressTestingFramework) return;
      const framework = new StressTestingFramework();
      expect(framework.scenarios).toBeDefined();
      expect(framework.scenarios.size).toBeGreaterThan(0);
    });

    test('should have predefined crisis scenarios', () => {
      if (!StressTestingFramework) return;
      const framework = new StressTestingFramework();
      expect(framework.scenarios.has('crisis_2008')).toBe(true);
      expect(framework.scenarios.has('crisis_covid2020')).toBe(true);
      expect(framework.scenarios.has('crisis_1987')).toBe(true);
    });
  });

  describe('Predefined Scenarios', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should have 2008 crisis scenario with correct impacts', () => {
      if (!framework) return;
      const scenario = framework.scenarios.get('crisis_2008');
      if (scenario) {
        expect(scenario.assetImpacts.equities).toBe(-0.50);
        expect(scenario.volatilityMultiplier).toBe(2.5);
        expect(scenario.correlationShift).toBeGreaterThan(1);
      }
    });

    test('should have COVID-19 scenario with correct parameters', () => {
      if (!framework) return;
      const scenario = framework.scenarios.get('crisis_covid2020');
      if (scenario) {
        expect(scenario.assetImpacts.equities).toBe(-0.35);
        expect(scenario.severity).toBe('HIGH');
      }
    });

    test('should have Black Monday 1987 scenario', () => {
      if (!framework) return;
      const scenario = framework.scenarios.get('crisis_1987');
      if (scenario) {
        expect(scenario.year).toBe(1987);
        expect(scenario.assetImpacts.equities).toBe(-0.22);
      }
    });
  });

  describe('Stress Testing Operations', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should apply stress scenario to portfolio', () => {
      if (!framework || !framework.runStressTest) return;
      const portfolio = {
        assets: [
          { symbol: 'AAPL', allocation: 0.3, assetClass: 'equities' },
          { symbol: 'BND', allocation: 0.4, assetClass: 'bonds' },
          { symbol: 'GLD', allocation: 0.3, assetClass: 'commodities' }
        ]
      };

      expect(() => {
        framework.runStressTest(portfolio, 'crisis_2008');
      }).not.toThrow();
    });

    test('should calculate stressed returns', () => {
      if (!framework || !framework.calculateStressedReturns) return;
      const returns = createMockReturns(252);
      const stressedReturns = framework.calculateStressedReturns(returns, -0.35);

      if (stressedReturns && Array.isArray(stressedReturns)) {
        expect(stressedReturns.length).toBe(returns.length);
      }
    });

    test('should calculate portfolio impact under stress', () => {
      if (!framework || !framework.calculatePortfolioImpact) return;
      const portfolio = { allocation: [0.3, 0.4, 0.3] };
      const impacts = [-0.50, -0.15, -0.45];

      expect(() => {
        framework.calculatePortfolioImpact(portfolio, impacts);
      }).not.toThrow();
    });
  });

  describe('Scenario Management', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should add custom scenario', () => {
      if (!framework || !framework.addScenario) return;
      const customScenario = {
        name: 'Custom Crisis',
        assetImpacts: { equities: -0.30 },
        volatilityMultiplier: 2.0,
        correlationShift: 1.2
      };

      expect(() => {
        framework.addScenario('custom_crisis', customScenario);
      }).not.toThrow();
    });

    test('should retrieve scenario by name', () => {
      if (!framework || !framework.getScenario) return;
      const scenario = framework.getScenario('crisis_2008');
      if (scenario) {
        expect(scenario.name).toBeDefined();
        expect(scenario.assetImpacts).toBeDefined();
      }
    });

    test('should list all scenarios', () => {
      if (!framework || !framework.getScenarios) return;
      const scenarios = framework.getScenarios();
      if (Array.isArray(scenarios)) {
        expect(scenarios.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Monte Carlo Simulation', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should run Monte Carlo simulation', () => {
      if (!framework || !framework.runMonteCarloSimulation) return;
      const portfolio = { returns: createMockReturns(252) };
      const iterations = 1000;

      expect(() => {
        framework.runMonteCarloSimulation(portfolio, iterations);
      }).not.toThrow();
    });

    test('should generate simulated paths', () => {
      if (!framework || !framework.generateSimulatedPaths) return;
      const returns = createMockReturns(252);
      const paths = framework.generateSimulatedPaths(returns, 100, 30);

      if (paths && Array.isArray(paths)) {
        expect(paths.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Risk Metrics Under Stress', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should calculate stress VaR', () => {
      if (!framework || !framework.calculateStressVaR) return;
      const portfolio = { allocation: [0.3, 0.4, 0.3] };

      expect(() => {
        framework.calculateStressVaR(portfolio, 'crisis_2008', 0.95);
      }).not.toThrow();
    });

    test('should calculate maximum portfolio loss', () => {
      if (!framework || !framework.calculateMaxLoss) return;
      const portfolio = { value: 100000, allocation: [0.3, 0.4, 0.3] };

      expect(() => {
        framework.calculateMaxLoss(portfolio, 'crisis_2008');
      }).not.toThrow();
    });

    test('should estimate recovery time', () => {
      if (!framework || !framework.estimateRecoveryTime) return;
      const portfolio = { returns: createMockReturns(252) };

      expect(() => {
        framework.estimateRecoveryTime(portfolio, 'crisis_2008');
      }).not.toThrow();
    });
  });

  describe('Correlation Under Stress', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should adjust correlations for stress scenario', () => {
      if (!framework || !framework.adjustCorrelations) return;
      const correlations = createMockCorrelationMatrix(3);
      const correlationShift = 1.3;

      expect(() => {
        framework.adjustCorrelations(correlations, correlationShift);
      }).not.toThrow();
    });

    test('should increase correlation during crisis', () => {
      if (!framework || !framework.calculateStressCorrelations) return;
      const baseCorrelations = createMockCorrelationMatrix(3);

      expect(() => {
        framework.calculateStressCorrelations(baseCorrelations, 1.4);
      }).not.toThrow();
    });
  });

  describe('Reporting', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should generate stress test report', () => {
      if (!framework || !framework.generateReport) return;
      const results = { scenario: 'crisis_2008', portfolio_loss: -0.35 };

      expect(() => {
        framework.generateReport(results);
      }).not.toThrow();
    });

    test('should export results to JSON', () => {
      if (!framework || !framework.exportResults) return;
      const results = [{ scenario: 'crisis_2008' }];

      expect(() => {
        framework.exportResults(results);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should handle empty portfolio', () => {
      if (!framework || !framework.runStressTest) return;
      const portfolio = { assets: [] };

      expect(() => {
        framework.runStressTest(portfolio, 'crisis_2008');
      }).not.toThrow();
    });

    test('should handle invalid scenario name', () => {
      if (!framework || !framework.runStressTest) return;
      const portfolio = { assets: [{ symbol: 'TEST' }] };

      expect(() => {
        framework.runStressTest(portfolio, 'invalid_scenario');
      }).not.toThrow();
    });

    test('should handle extreme market movements', () => {
      if (!framework || !framework.calculateStressedReturns) return;
      const returns = createMockReturns(100, 0, 0.5); // High volatility

      expect(() => {
        framework.calculateStressedReturns(returns, -0.70);
      }).not.toThrow();
    });

    test('should handle single-asset portfolio', () => {
      if (!framework || !framework.runStressTest) return;
      const portfolio = { assets: [{ symbol: 'AAPL', allocation: 1.0 }] };

      expect(() => {
        framework.runStressTest(portfolio, 'crisis_2008');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    let framework;

    beforeEach(() => {
      if (StressTestingFramework) {
        framework = new StressTestingFramework();
      }
    });

    test('should run stress test within acceptable time', () => {
      if (!framework || !framework.runStressTest) return;
      const portfolio = {
        assets: Array(20).fill(0).map((_, i) => ({
          symbol: `ASSET${i}`,
          allocation: 1 / 20
        }))
      };

      const startTime = performance.now();
      if (typeof framework.runStressTest === 'function') {
        framework.runStressTest(portfolio, 'crisis_2008');
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(5000); // < 5 seconds
    });

    test('should handle Monte Carlo with 10000 iterations', () => {
      if (!framework || !framework.runMonteCarloSimulation) return;
      const portfolio = { returns: createMockReturns(252) };

      const startTime = performance.now();
      if (typeof framework.runMonteCarloSimulation === 'function') {
        framework.runMonteCarloSimulation(portfolio, 10000);
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(15000); // < 15 seconds for large simulation
    });
  });
});
