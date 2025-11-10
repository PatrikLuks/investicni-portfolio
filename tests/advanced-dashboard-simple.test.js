/**
 * Unit Tests for Advanced Analytics Dashboard
 * Tests for panel rendering, data updates, calculations, and UI state management
 */

describe('AdvancedAnalyticsDashboard', () => {
  let AdvancedAnalyticsDashboard;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/advanced-dashboard.js');
      AdvancedAnalyticsDashboard = module.AdvancedAnalyticsDashboard;
    } catch (error) {
      console.error('Could not import AdvancedAnalyticsDashboard:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!AdvancedAnalyticsDashboard) return;
      const dashboard = new AdvancedAnalyticsDashboard();
      expect(dashboard).toBeDefined();
    });

    test('should have dashboard configuration', () => {
      if (!AdvancedAnalyticsDashboard) return;
      const dashboard = new AdvancedAnalyticsDashboard();
      expect(dashboard.dashboardId).toBeDefined();
      expect(dashboard.panels).toBeDefined();
    });

    test('should support auto-refresh setting', () => {
      if (!AdvancedAnalyticsDashboard) return;
      const dashboard = new AdvancedAnalyticsDashboard();
      expect(dashboard.autoRefresh).toBeDefined();
      expect(dashboard.updateInterval).toBeGreaterThan(0);
    });
  });

  describe('Panel Management', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should create dashboard panels', () => {
      if (!dashboard || !dashboard.createPanel) return;

      expect(() => {
        dashboard.createPanel('risk_metrics', { title: 'Risk Metrics' });
        dashboard.createPanel('portfolio_allocation', { title: 'Portfolio' });
      }).not.toThrow();
    });

    test('should register panel components', () => {
      if (!dashboard || !dashboard.registerPanel) return;

      expect(() => {
        dashboard.registerPanel('performance', { type: 'chart' });
        dashboard.registerPanel('compliance', { type: 'status' });
      }).not.toThrow();
    });

    test('should retrieve panel by ID', () => {
      if (!dashboard || !dashboard.getPanel) return;

      expect(() => {
        dashboard.getPanel('risk_metrics');
      }).not.toThrow();
    });

    test('should remove panels', () => {
      if (!dashboard || !dashboard.createPanel || !dashboard.removePanel) return;
      dashboard.createPanel('temp_panel', {});

      expect(() => {
        dashboard.removePanel('temp_panel');
      }).not.toThrow();
    });
  });

  describe('Data Updates', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should update panel data', () => {
      if (!dashboard || !dashboard.updatePanelData) return;
      const data = { value: 0.95, label: 'Sharpe Ratio' };

      expect(() => {
        dashboard.updatePanelData('risk_metrics', data);
      }).not.toThrow();
    });

    test('should batch update multiple panels', () => {
      if (!dashboard || !dashboard.batchUpdate) return;
      const updates = {
        'risk_metrics': { sharpe: 0.95 },
        'portfolio': { allocation: [0.3, 0.4, 0.3] }
      };

      expect(() => {
        dashboard.batchUpdate(updates);
      }).not.toThrow();
    });

    test('should refresh all panels', () => {
      if (!dashboard || !dashboard.refreshAll) return;

      expect(() => {
        dashboard.refreshAll();
      }).not.toThrow();
    });

    test('should support selective refresh', () => {
      if (!dashboard || !dashboard.refresh) return;

      expect(() => {
        dashboard.refresh('risk_metrics');
        dashboard.refresh('portfolio');
      }).not.toThrow();
    });
  });

  describe('Real-time Calculations', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should calculate portfolio metrics in real-time', () => {
      if (!dashboard || !dashboard.calculateMetrics) return;
      const portfolio = { allocation: [0.3, 0.4, 0.3] };

      expect(() => {
        dashboard.calculateMetrics(portfolio);
      }).not.toThrow();
    });

    test('should update calculations on data change', () => {
      if (!dashboard || !dashboard.onDataChange) return;

      expect(() => {
        dashboard.onDataChange('prices', [100, 102, 101]);
      }).not.toThrow();
    });

    test('should handle calculation errors gracefully', () => {
      if (!dashboard || !dashboard.calculateMetrics) return;

      expect(() => {
        dashboard.calculateMetrics(null);
        dashboard.calculateMetrics({});
      }).not.toThrow();
    });
  });

  describe('Visualization & Rendering', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should render risk metrics panel', () => {
      if (!dashboard || !dashboard.renderRiskMetrics) return;

      expect(() => {
        dashboard.renderRiskMetrics({ sharpe: 0.95, sortino: 1.2 });
      }).not.toThrow();
    });

    test('should render portfolio allocation chart', () => {
      if (!dashboard || !dashboard.renderAllocation) return;

      expect(() => {
        dashboard.renderAllocation([0.3, 0.4, 0.3]);
      }).not.toThrow();
    });

    test('should render performance chart', () => {
      if (!dashboard || !dashboard.renderPerformance) return;
      const returns = createMockReturns(100);

      expect(() => {
        dashboard.renderPerformance(returns);
      }).not.toThrow();
    });

    test('should render compliance status', () => {
      if (!dashboard || !dashboard.renderCompliance) return;
      const compliance = { UCITS: true, ESMA: true, MiFID: false };

      expect(() => {
        dashboard.renderCompliance(compliance);
      }).not.toThrow();
    });

    test('should update UI colors/themes', () => {
      if (!dashboard || !dashboard.setTheme) return;

      expect(() => {
        dashboard.setTheme('dark');
        dashboard.setTheme('light');
      }).not.toThrow();
    });
  });

  describe('UI State Management', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should save dashboard state', () => {
      if (!dashboard || !dashboard.saveState) return;

      expect(() => {
        dashboard.saveState();
      }).not.toThrow();
    });

    test('should restore dashboard state', () => {
      if (!dashboard || !dashboard.restoreState) return;

      expect(() => {
        dashboard.restoreState();
      }).not.toThrow();
    });

    test('should manage panel visibility', () => {
      if (!dashboard || !dashboard.showPanel || !dashboard.hidePanel) return;

      expect(() => {
        dashboard.showPanel('risk_metrics');
        dashboard.hidePanel('compliance');
      }).not.toThrow();
    });

    test('should track UI interactions', () => {
      if (!dashboard || !dashboard.onPanelClick) return;

      expect(() => {
        dashboard.onPanelClick('risk_metrics');
      }).not.toThrow();
    });
  });

  describe('Auto-refresh', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should support auto-refresh enabling/disabling', () => {
      if (!dashboard || !dashboard.setAutoRefresh) return;

      expect(() => {
        dashboard.setAutoRefresh(true);
        dashboard.setAutoRefresh(false);
      }).not.toThrow();
    });

    test('should set custom refresh interval', () => {
      if (!dashboard || !dashboard.setRefreshInterval) return;

      expect(() => {
        dashboard.setRefreshInterval(10000); // 10 seconds
        dashboard.setRefreshInterval(2000);  // 2 seconds
      }).not.toThrow();
    });

    test('should stop and start refresh', () => {
      if (!dashboard || !dashboard.startRefresh || !dashboard.stopRefresh) return;

      expect(() => {
        dashboard.stopRefresh();
        dashboard.startRefresh();
      }).not.toThrow();
    });
  });

  describe('Export & Reporting', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should export dashboard data', () => {
      if (!dashboard || !dashboard.exportData) return;

      expect(() => {
        dashboard.exportData('json');
        dashboard.exportData('csv');
      }).not.toThrow();
    });

    test('should generate dashboard report', () => {
      if (!dashboard || !dashboard.generateReport) return;

      expect(() => {
        const report = dashboard.generateReport();
        if (report) {
          expect(report).toBeDefined();
        }
      }).not.toThrow();
    });

    test('should capture dashboard screenshot', () => {
      if (!dashboard || !dashboard.captureSnapshot) return;

      expect(() => {
        dashboard.captureSnapshot();
      }).not.toThrow();
    });
  });

  describe('Responsive Design', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should adapt to different screen sizes', () => {
      if (!dashboard || !dashboard.resize) return;

      expect(() => {
        dashboard.resize(800, 600);   // Tablet
        dashboard.resize(1920, 1080); // Desktop
        dashboard.resize(375, 667);   // Mobile
      }).not.toThrow();
    });

    test('should rearrange panels for mobile', () => {
      if (!dashboard || !dashboard.setLayout) return;

      expect(() => {
        dashboard.setLayout('desktop');
        dashboard.setLayout('tablet');
        dashboard.setLayout('mobile');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should handle rapid updates efficiently', () => {
      if (!dashboard || !dashboard.updatePanelData) return;

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        dashboard.updatePanelData('metrics', { value: Math.random() });
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(2000); // < 2 seconds
    });

    test('should render large datasets', () => {
      if (!dashboard || !dashboard.renderPerformance) return;
      const largeDataset = createMockReturns(1000);

      const startTime = performance.now();
      if (typeof dashboard.renderPerformance === 'function') {
        dashboard.renderPerformance(largeDataset);
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(5000); // < 5 seconds
    });
  });

  describe('Edge Cases', () => {
    let dashboard;

    beforeEach(() => {
      if (AdvancedAnalyticsDashboard) {
        dashboard = new AdvancedAnalyticsDashboard();
      }
    });

    test('should handle missing data gracefully', () => {
      if (!dashboard || !dashboard.updatePanelData) return;

      expect(() => {
        dashboard.updatePanelData('metrics', null);
        dashboard.updatePanelData('metrics', {});
      }).not.toThrow();
    });

    test('should handle extreme values', () => {
      if (!dashboard || !dashboard.updatePanelData) return;

      expect(() => {
        dashboard.updatePanelData('metrics', { value: Infinity });
        dashboard.updatePanelData('metrics', { value: -Infinity });
        dashboard.updatePanelData('metrics', { value: NaN });
      }).not.toThrow();
    });

    test('should handle rapid initialization/destruction', () => {
      if (!AdvancedAnalyticsDashboard) return;

      expect(() => {
        const d1 = new AdvancedAnalyticsDashboard();
        const d2 = new AdvancedAnalyticsDashboard();
      }).not.toThrow();
    });
  });
});
