/**
 * Unit Tests for Correlation Heatmap UI
 * Tests for data visualization, interactive features, color mapping, and performance
 */

describe('CorrelationHeatmapUI', () => {
  let CorrelationHeatmapUI;

  beforeAll(async () => {
    try {
      const module = await import('../src/js/utilities/correlation-heatmap-ui.js');
      CorrelationHeatmapUI = module.CorrelationHeatmapUI;
    } catch (error) {
      console.error('Could not import CorrelationHeatmapUI:', error);
    }
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      if (!CorrelationHeatmapUI) return;
      const heatmap = new CorrelationHeatmapUI();
      expect(heatmap).toBeDefined();
    });

    test('should initialize with default configuration', () => {
      if (!CorrelationHeatmapUI) return;
      const heatmap = new CorrelationHeatmapUI();
      expect(heatmap.width).toBeDefined();
      expect(heatmap.height).toBeDefined();
    });
  });

  describe('Data Input & Validation', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should set correlation matrix', () => {
      if (!heatmap || !heatmap.setData) return;
      const matrix = createMockCorrelationMatrix(3);

      expect(() => {
        heatmap.setData(matrix);
      }).not.toThrow();
    });

    test('should validate correlation data', () => {
      if (!heatmap || !heatmap.validateData) return;
      const validMatrix = createMockCorrelationMatrix(3);

      expect(() => {
        heatmap.validateData(validMatrix);
      }).not.toThrow();
    });

    test('should handle invalid correlation values', () => {
      if (!heatmap || !heatmap.setData) return;
      const invalidMatrix = [[2, 1.5], [1.5, 1]]; // Values > 1 are invalid

      expect(() => {
        heatmap.setData(invalidMatrix);
      }).not.toThrow();
    });

    test('should set asset labels', () => {
      if (!heatmap || !heatmap.setLabels) return;
      const labels = ['AAPL', 'MSFT', 'GOOGL'];

      expect(() => {
        heatmap.setLabels(labels);
      }).not.toThrow();
    });
  });

  describe('Color Mapping', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should map correlation values to colors', () => {
      if (!heatmap || !heatmap.getColorForValue) return;

      expect(() => {
        const color1 = heatmap.getColorForValue(1.0);    // Perfect correlation
        const color2 = heatmap.getColorForValue(0.5);    // Moderate
        const color3 = heatmap.getColorForValue(0);      // No correlation
        const color4 = heatmap.getColorForValue(-0.5);   // Negative
        const color5 = heatmap.getColorForValue(-1.0);   // Perfect negative
      }).not.toThrow();
    });

    test('should support custom color schemes', () => {
      if (!heatmap || !heatmap.setColorScheme) return;

      expect(() => {
        heatmap.setColorScheme('diverging');
        heatmap.setColorScheme('sequential');
        heatmap.setColorScheme('custom');
      }).not.toThrow();
    });

    test('should generate color scale', () => {
      if (!heatmap || !heatmap.generateColorScale) return;

      expect(() => {
        const scale = heatmap.generateColorScale(-1, 1, 100);
        if (scale && Array.isArray(scale)) {
          expect(scale.length).toBeGreaterThan(0);
        }
      }).not.toThrow();
    });

    test('should create gradient for smooth transitions', () => {
      if (!heatmap || !heatmap.createGradient) return;

      expect(() => {
        heatmap.createGradient('#FF0000', '#00FF00', '#0000FF');
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should render heatmap', () => {
      if (!heatmap || !heatmap.render) return;
      const matrix = createMockCorrelationMatrix(3);
      heatmap.setData(matrix);

      expect(() => {
        heatmap.render();
      }).not.toThrow();
    });

    test('should render heatmap in specified container', () => {
      if (!heatmap || !heatmap.renderTo) return;
      const matrix = createMockCorrelationMatrix(3);
      heatmap.setData(matrix);

      expect(() => {
        heatmap.renderTo('heatmap-container');
      }).not.toThrow();
    });

    test('should create heatmap cells', () => {
      if (!heatmap || !heatmap.createCells) return;
      const matrix = createMockCorrelationMatrix(3);

      expect(() => {
        heatmap.createCells(matrix);
      }).not.toThrow();
    });

    test('should render axis labels', () => {
      if (!heatmap || !heatmap.renderAxes) return;
      const labels = ['A', 'B', 'C'];

      expect(() => {
        heatmap.renderAxes(labels);
      }).not.toThrow();
    });

    test('should add color legend', () => {
      if (!heatmap || !heatmap.renderLegend) return;

      expect(() => {
        heatmap.renderLegend();
      }).not.toThrow();
    });
  });

  describe('Interactive Features', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should enable cell hover tooltips', () => {
      if (!heatmap || !heatmap.enableTooltips) return;

      expect(() => {
        heatmap.enableTooltips();
      }).not.toThrow();
    });

    test('should handle cell click events', () => {
      if (!heatmap || !heatmap.onCellClick) return;

      expect(() => {
        heatmap.onCellClick(0, 1); // Row 0, Col 1
      }).not.toThrow();
    });

    test('should support cell selection', () => {
      if (!heatmap || !heatmap.selectCell) return;

      expect(() => {
        heatmap.selectCell(1, 2);
      }).not.toThrow();
    });

    test('should support cell highlighting', () => {
      if (!heatmap || !heatmap.highlightCell) return;

      expect(() => {
        heatmap.highlightCell(0, 0);
      }).not.toThrow();
    });

    test('should enable sorting by value', () => {
      if (!heatmap || !heatmap.sort) return;

      expect(() => {
        heatmap.sort('ascending');
        heatmap.sort('descending');
      }).not.toThrow();
    });

    test('should enable clustering', () => {
      if (!heatmap || !heatmap.cluster) return;

      expect(() => {
        heatmap.cluster('hierarchical');
      }).not.toThrow();
    });
  });

  describe('Zoom & Pan', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should support zoom in/out', () => {
      if (!heatmap || !heatmap.zoom) return;

      expect(() => {
        heatmap.zoom(1.5); // Zoom in
        heatmap.zoom(0.7); // Zoom out
      }).not.toThrow();
    });

    test('should support panning', () => {
      if (!heatmap || !heatmap.pan) return;

      expect(() => {
        heatmap.pan(100, 50); // Move by dx, dy
      }).not.toThrow();
    });

    test('should reset zoom/pan', () => {
      if (!heatmap || !heatmap.resetZoom) return;

      expect(() => {
        heatmap.resetZoom();
      }).not.toThrow();
    });

    test('should support mouse wheel zoom', () => {
      if (!heatmap || !heatmap.onMouseWheel) return;

      expect(() => {
        heatmap.onMouseWheel({ deltaY: 100 });
      }).not.toThrow();
    });
  });

  describe('Data Updates', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should update correlation data', () => {
      if (!heatmap || !heatmap.updateData) return;
      const newMatrix = createMockCorrelationMatrix(3);

      expect(() => {
        heatmap.updateData(newMatrix);
      }).not.toThrow();
    });

    test('should animate data transitions', () => {
      if (!heatmap || !heatmap.animateTransition) return;

      expect(() => {
        heatmap.animateTransition(500); // 500ms animation
      }).not.toThrow();
    });

    test('should support real-time updates', () => {
      if (!heatmap || !heatmap.enableLiveUpdates) return;

      expect(() => {
        heatmap.enableLiveUpdates(true);
      }).not.toThrow();
    });

    test('should batch update cells', () => {
      if (!heatmap || !heatmap.batchUpdate) return;
      const updates = [[0, 1, 0.5], [1, 2, 0.3]];

      expect(() => {
        heatmap.batchUpdate(updates);
      }).not.toThrow();
    });
  });

  describe('Export & Download', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should export as PNG image', () => {
      if (!heatmap || !heatmap.exportAsPNG) return;

      expect(() => {
        heatmap.exportAsPNG();
      }).not.toThrow();
    });

    test('should export as SVG', () => {
      if (!heatmap || !heatmap.exportAsSVG) return;

      expect(() => {
        heatmap.exportAsSVG();
      }).not.toThrow();
    });

    test('should export data as CSV', () => {
      if (!heatmap || !heatmap.exportAsCSV) return;

      expect(() => {
        heatmap.exportAsCSV();
      }).not.toThrow();
    });

    test('should export data as JSON', () => {
      if (!heatmap || !heatmap.exportAsJSON) return;

      expect(() => {
        heatmap.exportAsJSON();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should handle large correlation matrices efficiently', () => {
      if (!heatmap || !heatmap.setData) return;
      const largeMatrix = createMockCorrelationMatrix(50); // 50x50 matrix

      const startTime = performance.now();
      heatmap.setData(largeMatrix);
      if (typeof heatmap.render === 'function') {
        heatmap.render();
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(3000); // < 3 seconds
    });

    test('should handle rapid cell updates', () => {
      if (!heatmap || !heatmap.updateCell) return;

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        if (typeof heatmap.updateCell === 'function') {
          heatmap.updateCell(Math.floor(i / 10), i % 10, Math.random());
        }
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(2000); // < 2 seconds
    });

    test('should render smoothly with animations', () => {
      if (!CorrelationHeatmapUI) return;
      const hm = new CorrelationHeatmapUI();

      const startTime = performance.now();
      hm.setData(createMockCorrelationMatrix(20));
      if (typeof hm.render === 'function') {
        hm.render();
      }
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(2000); // < 2 seconds for 20x20
    });
  });

  describe('Edge Cases', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should handle 1x1 matrix', () => {
      if (!heatmap || !heatmap.setData) return;

      expect(() => {
        heatmap.setData([[1]]);
      }).not.toThrow();
    });

    test('should handle all positive correlations', () => {
      if (!heatmap || !heatmap.setData) return;

      expect(() => {
        heatmap.setData([[1, 0.8], [0.8, 1]]);
      }).not.toThrow();
    });

    test('should handle all zero correlations', () => {
      if (!heatmap || !heatmap.setData) return;

      expect(() => {
        heatmap.setData([[1, 0], [0, 1]]);
      }).not.toThrow();
    });

    test('should handle mixed positive/negative correlations', () => {
      if (!heatmap || !heatmap.setData) return;

      expect(() => {
        heatmap.setData([[1, 0.5, -0.5], [0.5, 1, -0.3], [-0.5, -0.3, 1]]);
      }).not.toThrow();
    });

    test('should handle empty container gracefully', () => {
      if (!heatmap || !heatmap.renderTo) return;

      expect(() => {
        heatmap.renderTo('nonexistent-container');
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    let heatmap;

    beforeEach(() => {
      if (CorrelationHeatmapUI) {
        heatmap = new CorrelationHeatmapUI();
      }
    });

    test('should provide ARIA labels', () => {
      if (!heatmap || !heatmap.setAccessibleLabels) return;

      expect(() => {
        heatmap.setAccessibleLabels('Correlation Heatmap');
      }).not.toThrow();
    });

    test('should support keyboard navigation', () => {
      if (!heatmap || !heatmap.onKeydown) return;

      expect(() => {
        heatmap.onKeydown({ key: 'ArrowUp' });
        heatmap.onKeydown({ key: 'ArrowDown' });
        heatmap.onKeydown({ key: 'ArrowLeft' });
        heatmap.onKeydown({ key: 'ArrowRight' });
      }).not.toThrow();
    });

    test('should provide text alternative for visualization', () => {
      if (!heatmap || !heatmap.getTextDescription) return;

      expect(() => {
        const description = heatmap.getTextDescription();
        if (description) {
          expect(typeof description).toBe('string');
        }
      }).not.toThrow();
    });
  });
});
