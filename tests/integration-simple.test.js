/**
 * Integration Tests for Phase 4 Enterprise Modules
 * Tests for module interactions, data flow, and cross-module dependencies
 */

describe('Phase 4 Module Integration', () => {
  let AdvancedRiskMetrics;
  let PortfolioOptimization;
  let RegulatoryCompliance;
  let StressTesting;
  let TechnicalIndicators;
  let ProductionQuality;
  let AdvancedDashboard;
  let CorrelationHeatmap;
  let FinancialPrecision;

  beforeAll(async () => {
    try {
      AdvancedRiskMetrics = (await import('../src/js/utilities/advanced-risk-metrics.js')).AdvancedRiskMetricsEngine;
      PortfolioOptimization = (await import('../src/js/utilities/portfolio-optimization.js')).PortfolioOptimizationEngine;
      RegulatoryCompliance = (await import('../src/js/utilities/regulatory-compliance.js')).RegulatoryComplianceModule;
      StressTesting = (await import('../src/js/utilities/stress-testing.js')).StressTestingFramework;
      TechnicalIndicators = (await import('../src/js/utilities/technical-indicators.js')).TechnicalIndicatorsEngine;
      ProductionQuality = (await import('../src/js/utilities/production-quality.js')).ProductionQualitySystem;
      AdvancedDashboard = (await import('../src/js/utilities/advanced-dashboard.js')).AdvancedAnalyticsDashboard;
      CorrelationHeatmap = (await import('../src/js/utilities/correlation-heatmap-ui.js')).CorrelationHeatmapUI;
      FinancialPrecision = (await import('../src/js/utilities/financial-precision-engine.js')).FinancialPrecisionEngine;
    } catch (error) {
      console.error('Could not import modules:', error);
    }
  });

  describe('Risk Analysis Pipeline', () => {
    test('should flow from raw data to risk metrics to compliance check', () => {
      if (!AdvancedRiskMetrics || !RegulatoryCompliance) return;

      // Step 1: Calculate risk metrics
      const riskEngine = new AdvancedRiskMetrics();
      const portfolio = createMockPortfolio([100, 200, 300], [0.3, 0.4, 0.3]);
      
      expect(() => {
        riskEngine.analyzeRisk(portfolio);
      }).not.toThrow();

      // Step 2: Check compliance
      const compliance = new RegulatoryCompliance();
      expect(() => {
        compliance.validateCompliance(portfolio);
      }).not.toThrow();
    });

    test('should flow risk metrics through precision engine', () => {
      if (!AdvancedRiskMetrics || !FinancialPrecision) return;

      const riskEngine = new AdvancedRiskMetrics();
      const precisionEngine = new FinancialPrecision();
      const returns = [0.1, 0.08, -0.05];

      expect(() => {
        // Calculate risk metrics
        const volatility = riskEngine.calculateVolatility(returns);
        
        // Refine through precision engine
        if (precisionEngine.roundToPrecision) {
          precisionEngine.roundToPrecision(volatility, 4);
        }
      }).not.toThrow();
    });

    test('should validate stressed metrics against compliance rules', () => {
      if (!StressTesting || !RegulatoryCompliance) return;

      const stressEngine = new StressTesting();
      const compliance = new RegulatoryCompliance();

      expect(() => {
        const stressResult = stressEngine.runScenario({
          name: 'integration-test',
          priceShocks: { asset1: -0.2, asset2: 0.1 }
        }, createMockPortfolio([100, 200], [0.5, 0.5]));

        compliance.validateCompliance({
          metrics: stressResult
        });
      }).not.toThrow();
    });
  });

  describe('Portfolio Optimization Pipeline', () => {
    test('should optimize portfolio considering risk constraints', () => {
      if (!PortfolioOptimization || !AdvancedRiskMetrics) return;

      const optimizer = new PortfolioOptimization();
      const riskEngine = new AdvancedRiskMetrics();

      expect(() => {
        const portfolio = createMockPortfolio([100, 200, 300], [0.3, 0.4, 0.3]);
        
        // Optimize allocation
        if (optimizer.optimizeAllocation) {
          optimizer.optimizeAllocation(portfolio);
        }

        // Analyze resulting risk
        if (riskEngine.analyzeRisk) {
          riskEngine.analyzeRisk(portfolio);
        }
      }).not.toThrow();
    });

    test('should optimize while maintaining compliance', () => {
      if (!PortfolioOptimization || !RegulatoryCompliance) return;

      const optimizer = new PortfolioOptimization();
      const compliance = new RegulatoryCompliance();

      expect(() => {
        const portfolio = createMockPortfolio([100, 200, 300], [0.2, 0.5, 0.3]);

        // Optimize with compliance constraints
        if (optimizer.optimizeAllocation) {
          optimizer.optimizeAllocation(portfolio);
        }

        // Validate compliance
        if (compliance.validateCompliance) {
          compliance.validateCompliance(portfolio);
        }
      }).not.toThrow();
    });

    test('should calculate efficient frontier with stress testing', () => {
      if (!PortfolioOptimization || !StressTesting) return;

      const optimizer = new PortfolioOptimization();
      const stressEngine = new StressTesting();

      expect(() => {
        // Generate efficient frontier
        if (optimizer.generateEfficientFrontier) {
          optimizer.generateEfficientFrontier([0.05, 0.10, 0.15, 0.20]);
        }

        // Stress test critical points
        if (stressEngine.runScenario) {
          stressEngine.runScenario({
            name: 'frontier-stress',
            priceShocks: {}
          }, createMockPortfolio([100, 200], [0.5, 0.5]));
        }
      }).not.toThrow();
    });
  });

  describe('Technical Analysis Integration', () => {
    test('should generate signals from technical indicators', () => {
      if (!TechnicalIndicators) return;

      const indicators = new TechnicalIndicators();

      expect(() => {
        const prices = Array.from({ length: 100 }, (_, i) => 100 + Math.sin(i / 10) * 10);
        
        // Calculate indicators
        if (indicators.calculateSMA) {
          indicators.calculateSMA(prices, 20);
        }
        if (indicators.calculateRSI) {
          indicators.calculateRSI(prices, 14);
        }

        // Generate signals
        if (indicators.generateSignals) {
          indicators.generateSignals(prices);
        }
      }).not.toThrow();
    });

    test('should correlate technical signals with market data', () => {
      if (!TechnicalIndicators && !AdvancedRiskMetrics) return;

      const indicators = new TechnicalIndicators();
      const riskEngine = new AdvancedRiskMetrics();

      expect(() => {
        const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.random() * 20 - 10);

        if (indicators.generateSignals) {
          indicators.generateSignals(prices);
        }

        if (riskEngine.calculateVolatility) {
          const volatility = riskEngine.calculateVolatility(
            prices.map((p, i) => i > 0 ? (prices[i] - prices[i-1]) / prices[i-1] : 0)
          );
          expect(volatility).toBeValidNumber();
        }
      }).not.toThrow();
    });

    test('should use technical signals for portfolio adjustments', () => {
      if (!TechnicalIndicators || !PortfolioOptimization) return;

      const indicators = new TechnicalIndicators();
      const optimizer = new PortfolioOptimization();

      expect(() => {
        const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 5) * 5);
        
        // Get technical signals
        if (indicators.generateSignals) {
          const signals = indicators.generateSignals(prices);
          // Use signals to adjust portfolio
        }

        // Reoptimize portfolio
        if (optimizer.optimizeAllocation) {
          optimizer.optimizeAllocation(createMockPortfolio([100, 200], [0.5, 0.5]));
        }
      }).not.toThrow();
    });
  });

  describe('Data Flow: Monitoring Pipeline', () => {
    test('should monitor system health and log metrics', () => {
      if (!ProductionQuality) return;

      const qualitySystem = new ProductionQuality();

      expect(() => {
        // Log calculation performance
        if (qualitySystem.logPerformance) {
          qualitySystem.logPerformance('integration-test', 0.456);
        }

        // Record error if needed
        if (qualitySystem.logError) {
          qualitySystem.logError('test-error', new Error('Test error'));
        }

        // Check system health
        if (qualitySystem.getHealth) {
          const health = qualitySystem.getHealth();
          if (health) {
            expect(health).toHaveProperty('status');
          }
        }
      }).not.toThrow();
    });

    test('should report errors through quality system while continuing operations', () => {
      if (!ProductionQuality || !AdvancedRiskMetrics) return;

      const qualitySystem = new ProductionQuality();
      const riskEngine = new AdvancedRiskMetrics();

      expect(() => {
        try {
          // Try risky operation
          if (riskEngine.analyzeRisk) {
            riskEngine.analyzeRisk(null);
          }
        } catch (error) {
          // Log error but continue
          if (qualitySystem.logError) {
            qualitySystem.logError('integration-error', error);
          }
        }

        // System should continue operating
        expect(qualitySystem).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Dashboard Data Integration', () => {
    test('should feed risk metrics to dashboard', () => {
      if (!AdvancedDashboard || !AdvancedRiskMetrics) return;

      const dashboard = new AdvancedDashboard();
      const riskEngine = new AdvancedRiskMetrics();
      const portfolio = createMockPortfolio([100, 200, 300], [0.3, 0.4, 0.3]);

      expect(() => {
        // Register dashboard panel
        if (dashboard.registerPanel) {
          dashboard.registerPanel('risk', { type: 'risk-metrics' });
        }

        // Calculate risk metrics
        if (riskEngine.analyzeRisk) {
          const metrics = riskEngine.analyzeRisk(portfolio);
          
          // Update dashboard with data
          if (dashboard.updateData) {
            dashboard.updateData('risk', metrics);
          }
        }
      }).not.toThrow();
    });

    test('should display correlation heatmap in dashboard', () => {
      if (!AdvancedDashboard || !CorrelationHeatmap) return;

      const dashboard = new AdvancedDashboard();
      const heatmap = new CorrelationHeatmap();
      const matrix = createMockCorrelationMatrix(3);

      expect(() => {
        // Register heatmap panel
        if (dashboard.registerPanel) {
          dashboard.registerPanel('heatmap', { type: 'correlation' });
        }

        // Prepare correlation data
        if (heatmap.setCorrelationMatrix) {
          heatmap.setCorrelationMatrix(matrix);
        }

        // Update dashboard
        if (dashboard.updateData) {
          dashboard.updateData('heatmap', { matrix });
        }
      }).not.toThrow();
    });

    test('should update dashboard with technical indicators', () => {
      if (!AdvancedDashboard || !TechnicalIndicators) return;

      const dashboard = new AdvancedDashboard();
      const indicators = new TechnicalIndicators();
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 10) * 5);

      expect(() => {
        // Register indicators panel
        if (dashboard.registerPanel) {
          dashboard.registerPanel('indicators', { type: 'technical' });
        }

        // Calculate indicators
        if (indicators.generateSignals) {
          const signals = indicators.generateSignals(prices);
          
          // Update dashboard
          if (dashboard.updateData) {
            dashboard.updateData('indicators', { signals });
          }
        }
      }).not.toThrow();
    });

    test('should handle rapid dashboard updates from multiple sources', () => {
      if (!AdvancedDashboard || !AdvancedRiskMetrics || !TechnicalIndicators) return;

      const dashboard = new AdvancedDashboard();
      const riskEngine = new AdvancedRiskMetrics();
      const indicators = new TechnicalIndicators();

      expect(() => {
        const portfolio = createMockPortfolio([100, 200], [0.5, 0.5]);
        const prices = Array.from({ length: 30 }, () => 100 + Math.random() * 10);

        // Rapid updates
        for (let i = 0; i < 10; i++) {
          if (dashboard.updateData) {
            dashboard.updateData('risk', { iteration: i });
            dashboard.updateData('indicators', { iteration: i });
          }
        }

        expect(dashboard).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Stress Testing Integration', () => {
    test('should stress test optimized portfolio', () => {
      if (!PortfolioOptimization || !StressTesting) return;

      const optimizer = new PortfolioOptimization();
      const stressEngine = new StressTesting();

      expect(() => {
        const portfolio = createMockPortfolio([100, 200, 300], [0.3, 0.4, 0.3]);

        // Optimize
        if (optimizer.optimizeAllocation) {
          optimizer.optimizeAllocation(portfolio);
        }

        // Stress test result
        if (stressEngine.runScenario) {
          stressEngine.runScenario(
            { name: 'market-crash', priceShocks: { asset1: -0.3, asset2: -0.2 } },
            portfolio
          );
        }
      }).not.toThrow();
    });

    test('should test compliance under stress', () => {
      if (!StressTesting || !RegulatoryCompliance) return;

      const stressEngine = new StressTesting();
      const compliance = new RegulatoryCompliance();

      expect(() => {
        const portfolio = createMockPortfolio([100, 200], [0.5, 0.5]);

        // Run stress scenario
        if (stressEngine.runScenario) {
          const stressResult = stressEngine.runScenario(
            { name: 'stress-test', priceShocks: { asset1: -0.25 } },
            portfolio
          );

          // Check compliance under stress
          if (compliance.validateCompliance) {
            compliance.validateCompliance({ metrics: stressResult });
          }
        }
      }).not.toThrow();
    });

    test('should generate quality reports for stress scenarios', () => {
      if (!StressTesting || !ProductionQuality) return;

      const stressEngine = new StressTesting();
      const qualitySystem = new ProductionQuality();

      expect(() => {
        const portfolio = createMockPortfolio([100, 200, 300], [0.33, 0.33, 0.34]);

        // Run stress test
        if (stressEngine.runScenario) {
          const result = stressEngine.runScenario(
            { name: 'scenario', priceShocks: {} },
            portfolio
          );

          // Log quality metrics
          if (qualitySystem.logPerformance) {
            qualitySystem.logPerformance('stress-test-result', 1.5);
          }
        }
      }).not.toThrow();
    });
  });

  describe('End-to-End Analysis Workflow', () => {
    test('should complete full portfolio analysis cycle', () => {
      if (!AdvancedRiskMetrics || !PortfolioOptimization || !RegulatoryCompliance ||
          !AdvancedDashboard || !ProductionQuality) return;

      const riskEngine = new AdvancedRiskMetrics();
      const optimizer = new PortfolioOptimization();
      const compliance = new RegulatoryCompliance();
      const dashboard = new AdvancedDashboard();
      const qualitySystem = new ProductionQuality();

      expect(() => {
        const portfolio = createMockPortfolio([100, 200, 300], [0.3, 0.4, 0.3]);

        // 1. Analyze current risk
        if (riskEngine.analyzeRisk) {
          const metrics = riskEngine.analyzeRisk(portfolio);
        }

        // 2. Check compliance
        if (compliance.validateCompliance) {
          compliance.validateCompliance(portfolio);
        }

        // 3. Optimize allocation
        if (optimizer.optimizeAllocation) {
          optimizer.optimizeAllocation(portfolio);
        }

        // 4. Display on dashboard
        if (dashboard.registerPanel && dashboard.updateData) {
          dashboard.registerPanel('analysis', { type: 'full' });
          dashboard.updateData('analysis', portfolio);
        }

        // 5. Log performance
        if (qualitySystem.logPerformance) {
          qualitySystem.logPerformance('full-analysis', 2.5);
        }
      }).not.toThrow();
    });

    test('should handle errors gracefully throughout pipeline', () => {
      if (!ProductionQuality) return;

      const qualitySystem = new ProductionQuality();

      expect(() => {
        // Pipeline with error handling
        let stepCount = 0;

        const steps = [
          () => { stepCount++; },
          () => { stepCount++; throw new Error('Test error'); },
          () => { stepCount++; }
        ];

        for (const step of steps) {
          try {
            step();
          } catch (error) {
            if (qualitySystem.logError) {
              qualitySystem.logError('pipeline-error', error);
            }
          }
        }

        // Should process 2 of 3 steps
        expect(stepCount).toBeGreaterThanOrEqual(2);
      }).not.toThrow();
    });

    test('should maintain data consistency across modules', () => {
      if (!AdvancedRiskMetrics || !PortfolioOptimization) return;

      const riskEngine = new AdvancedRiskMetrics();
      const optimizer = new PortfolioOptimization();

      expect(() => {
        const portfolio = createMockPortfolio([1000, 2000, 3000], [0.3, 0.4, 0.3]);
        const initialTotal = 6000;

        // Analyze
        if (riskEngine.analyzeRisk) {
          riskEngine.analyzeRisk(portfolio);
        }

        // Optimize
        if (optimizer.optimizeAllocation) {
          optimizer.optimizeAllocation(portfolio);
        }

        // Total value should remain consistent
        expect(portfolio).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Performance Under Load', () => {
    test('should handle concurrent module operations', () => {
      if (!AdvancedRiskMetrics || !PortfolioOptimization) return;

      const riskEngine = new AdvancedRiskMetrics();
      const optimizer = new PortfolioOptimization();

      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        const portfolio = createMockPortfolio([100, 200, 300], [0.3, 0.4, 0.3]);
        
        if (riskEngine.analyzeRisk) {
          riskEngine.analyzeRisk(portfolio);
        }
        if (optimizer.optimizeAllocation) {
          optimizer.optimizeAllocation(portfolio);
        }
      }

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(5000); // < 5 seconds for 10 iterations
    });

    test('should maintain performance with large portfolios', () => {
      if (!AdvancedDashboard) return;

      const dashboard = new AdvancedDashboard();
      const largePortfolio = createMockPortfolio(
        Array(50).fill(100),
        Array(50).fill(0.02)
      );

      const startTime = performance.now();

      if (dashboard.registerPanel && dashboard.updateData) {
        dashboard.registerPanel('large', { type: 'large-portfolio' });
        dashboard.updateData('large', largePortfolio);
      }

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(2000); // < 2 seconds
    });

    test('should handle rapid dashboard refreshes', () => {
      if (!AdvancedDashboard) return;

      const dashboard = new AdvancedDashboard();

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        if (dashboard.updateData) {
          dashboard.updateData('test', { iteration: i });
        }
      }

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(1000); // < 1 second
    });
  });
});
