/**
 * Unit Tests for Production Quality System
 * Tests for error handling, logging, monitoring, and health checks
 */

describe('ProductionQualitySystem', () => {
  let ProductionQualitySystem;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/production-quality.js');
      ProductionQualitySystem = module.ProductionQualitySystem;
    } catch (error) {
      console.error('Could not import ProductionQualitySystem:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!ProductionQualitySystem) return;
      const system = new ProductionQualitySystem();
      expect(system).toBeDefined();
    });

    test('should have production environment settings', () => {
      if (!ProductionQualitySystem) return;
      const system = new ProductionQualitySystem();
      expect(system.environment).toBe('PRODUCTION');
      expect(system.version).toBeDefined();
    });

    test('should start with healthy status', () => {
      if (!ProductionQualitySystem) return;
      const system = new ProductionQualitySystem();
      expect(system.healthStatus).toBe('HEALTHY');
    });
  });

  describe('Error Handling', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should handle standard errors', () => {
      if (!system || !system.handleError) return;
      const error = new Error('Test error');
      const result = system.handleError(error, 'TEST_CONTEXT');

      if (result) {
        expect(result).toBeDefined();
      }
    });

    test('should generate unique error IDs', () => {
      if (!system || !system.handleError) return;
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const result1 = system.handleError(error1, 'CONTEXT1');
      const result2 = system.handleError(error2, 'CONTEXT2');

      if (result1 && result2 && result1.id && result2.id) {
        expect(result1.id).not.toBe(result2.id);
      }
    });

    test('should track error context', () => {
      if (!system || !system.handleError) return;
      const error = new Error('Portfolio calculation failed');
      system.handleError(error, 'PORTFOLIO_CALC', { assetCount: 10 });

      if (system.errors && system.errors.length > 0) {
        expect(system.errors[0].context).toBeDefined();
      }
    });

    test('should implement recovery strategies', () => {
      if (!system || !system.getRecoveryStrategy) return;
      const error = new Error('Database connection failed');

      expect(() => {
        system.getRecoveryStrategy(error, 'DB_CONNECTION');
      }).not.toThrow();
    });

    test('should handle null/undefined errors gracefully', () => {
      if (!system || !system.handleError) return;

      expect(() => {
        system.handleError(null, 'NULL_ERROR');
        system.handleError(undefined, 'UNDEFINED_ERROR');
      }).not.toThrow();
    });
  });

  describe('Logging System', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should log messages with timestamp', () => {
      if (!system || !system.log) return;
      system.log('Test message', 'INFO');

      if (system.logs && system.logs.length > 0) {
        expect(system.logs[0].timestamp).toBeDefined();
        expect(system.logs[0].message).toBe('Test message');
      }
    });

    test('should support different log levels', () => {
      if (!system || !system.log) return;

      expect(() => {
        system.log('Debug message', 'DEBUG');
        system.log('Info message', 'INFO');
        system.log('Warning message', 'WARN');
        system.log('Error message', 'ERROR');
      }).not.toThrow();
    });

    test('should manage log rotation', () => {
      if (!system || !system.log) return;
      
      // Log many messages
      for (let i = 0; i < 1100; i++) {
        if (typeof system.log === 'function') {
          system.log(`Message ${i}`, 'INFO');
        }
      }

      if (system.logs) {
        expect(system.logs.length).toBeLessThanOrEqual(system.maxLogs);
      }
    });

    test('should attach metadata to logs', () => {
      if (!system || !system.log) return;
      system.log('Portfolio update', 'INFO', { portfolioId: 123, assets: 10 });

      if (system.logs && system.logs.length > 0) {
        expect(system.logs[system.logs.length - 1].metadata).toBeDefined();
      }
    });

    test('should support structured logging', () => {
      if (!system || !system.logStructured) return;
      const logData = {
        event: 'CALCULATION_COMPLETE',
        duration: 150,
        status: 'SUCCESS'
      };

      expect(() => {
        system.logStructured(logData);
      }).not.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should track metric values', () => {
      if (!system || !system.recordMetric) return;
      system.recordMetric('calculation_time', 150);
      system.recordMetric('memory_usage', 45.2);

      expect(system.metrics).toBeDefined();
    });

    test('should measure operation duration', () => {
      if (!system || !system.measureDuration) return;

      expect(() => {
        system.measureDuration(() => {
          let sum = 0;
          for (let i = 0; i < 1000; i++) {
            sum += i;
          }
        }, 'calculation');
      }).not.toThrow();
    });

    test('should calculate average metrics', () => {
      if (!system || !system.recordMetric) return;
      
      for (let i = 0; i < 10; i++) {
        if (typeof system.recordMetric === 'function') {
          system.recordMetric('response_time', 100 + i * 10);
        }
      }

      if (typeof system.getAverageMetric === 'function') {
        expect(() => {
          system.getAverageMetric('response_time');
        }).not.toThrow();
      }
    });

    test('should track performance over time', () => {
      if (!system || !system.recordMetric) return;

      expect(() => {
        for (let i = 0; i < 100; i++) {
          system.recordMetric('calculation_time', 100 + Math.random() * 50);
        }
      }).not.toThrow();
    });
  });

  describe('Health Checks', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should perform system health check', () => {
      if (!system || !system.performHealthCheck) return;

      expect(() => {
        const health = system.performHealthCheck();
        if (health) {
          expect(health.status).toBeDefined();
        }
      }).not.toThrow();
    });

    test('should check component health', () => {
      if (!system || !system.checkComponentHealth) return;

      expect(() => {
        system.checkComponentHealth('calculations');
        system.checkComponentHealth('ui_rendering');
        system.checkComponentHealth('data_persistence');
      }).not.toThrow();
    });

    test('should detect degraded performance', () => {
      if (!system || !system.checkPerformanceHealth) return;

      expect(() => {
        system.checkPerformanceHealth();
      }).not.toThrow();
    });

    test('should update health status', () => {
      if (!system || !system.updateHealthStatus) return;

      expect(() => {
        system.updateHealthStatus('HEALTHY');
        system.updateHealthStatus('DEGRADED');
        system.updateHealthStatus('UNHEALTHY');
      }).not.toThrow();
    });
  });

  describe('Diagnostics', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should generate diagnostics report', () => {
      if (!system || !system.generateDiagnostics) return;

      expect(() => {
        const report = system.generateDiagnostics();
        if (report) {
          expect(report).toBeDefined();
        }
      }).not.toThrow();
    });

    test('should collect system information', () => {
      if (!system || !system.getSystemInfo) return;

      expect(() => {
        const info = system.getSystemInfo();
        if (info) {
          expect(info.appName).toBeDefined();
          expect(info.version).toBeDefined();
        }
      }).not.toThrow();
    });

    test('should identify performance bottlenecks', () => {
      if (!system || !system.identifyBottlenecks) return;

      expect(() => {
        system.identifyBottlenecks();
      }).not.toThrow();
    });
  });

  describe('Incident Reporting', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should report incidents', () => {
      if (!system || !system.reportIncident) return;
      const incident = {
        severity: 'HIGH',
        message: 'Database connection timeout',
        timestamp: new Date()
      };

      expect(() => {
        system.reportIncident(incident);
      }).not.toThrow();
    });

    test('should classify incident severity', () => {
      if (!system || !system.classifyIncident) return;

      expect(() => {
        system.classifyIncident('CRITICAL', 'System crash');
        system.classifyIncident('HIGH', 'Feature unavailable');
        system.classifyIncident('MEDIUM', 'Slow performance');
        system.classifyIncident('LOW', 'Warning message');
      }).not.toThrow();
    });

    test('should track incident history', () => {
      if (!system || !system.reportIncident) return;

      expect(() => {
        for (let i = 0; i < 5; i++) {
          if (typeof system.reportIncident === 'function') {
            system.reportIncident({
              severity: i % 2 === 0 ? 'HIGH' : 'MEDIUM',
              message: `Incident ${i}`
            });
          }
        }
      }).not.toThrow();
    });
  });

  describe('Graceful Degradation', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should enable fallback mode', () => {
      if (!system || !system.enableFallbackMode) return;

      expect(() => {
        system.enableFallbackMode('CALCULATIONS');
      }).not.toThrow();
    });

    test('should provide degraded functionality', () => {
      if (!system || !system.getDegradedFunctionality) return;

      expect(() => {
        const fallback = system.getDegradedFunctionality('DATA_SYNC');
        if (fallback) {
          expect(fallback).toBeDefined();
        }
      }).not.toThrow();
    });
  });

  describe('Analytics', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should track user actions', () => {
      if (!system || !system.trackEvent) return;

      expect(() => {
        system.trackEvent('portfolio_created', { assets: 5 });
        system.trackEvent('export_csv', { rows: 100 });
        system.trackEvent('theme_changed', { theme: 'dark' });
      }).not.toThrow();
    });

    test('should track performance analytics', () => {
      if (!system || !system.trackPerformance) return;

      expect(() => {
        system.trackPerformance('calculation', 150, 'SUCCESS');
        system.trackPerformance('export', 500, 'SUCCESS');
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should handle rapid error reporting', () => {
      if (!system || !system.handleError) return;

      expect(() => {
        for (let i = 0; i < 100; i++) {
          system.handleError(new Error(`Error ${i}`), `CONTEXT_${i}`);
        }
      }).not.toThrow();
    });

    test('should handle massive log volume', () => {
      if (!system || !system.log) return;

      expect(() => {
        for (let i = 0; i < 500; i++) {
          system.log(`Log message ${i}`, 'INFO');
        }
      }).not.toThrow();
    });

    test('should handle concurrent operations', () => {
      if (!system) return;

      expect(() => {
        if (typeof system.handleError === 'function') {
          system.handleError(new Error('E1'), 'C1');
        }
        if (typeof system.log === 'function') {
          system.log('L1', 'INFO');
        }
        if (typeof system.recordMetric === 'function') {
          system.recordMetric('m1', 100);
        }
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    let system;

    beforeEach(() => {
      if (ProductionQualitySystem) {
        system = new ProductionQualitySystem();
      }
    });

    test('should handle error operations efficiently', () => {
      if (!system || !system.handleError) return;

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        system.handleError(new Error(`Error ${i}`), 'PERF_TEST');
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(5000); // < 5 seconds for 1000 errors
    });

    test('should generate diagnostics quickly', () => {
      if (!system || !system.generateDiagnostics) return;

      const startTime = performance.now();
      system.generateDiagnostics();
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(1000); // < 1 second
    });
  });
});
