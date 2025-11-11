import { logError } from './logger.js';
/**
 * Correlation & Covariance Heatmap UI Component
 * Interactive visualization of portfolio asset correlations and relationships
 *
 * Implements:
 * - Dynamic correlation matrix heatmap
 * - Covariance matrix visualization
 * - Interactive asset exploration
 * - Correlation strength indicators
 * - Diversification insights
 * - Responsive design
 *
 * Version: 1.0.0
 * Enterprise Portfolio Analytics Visualization
 */

class CorrelationHeatmapUI {
  constructor() {
    this.containerId = 'correlation-heatmap';
    this.correlationData = null;
    this.scale = 'correlation'; // 'correlation' or 'covariance'
    this.colorScale = {
      perfect: '#e74c3c', // Red - perfect positive correlation
      high: '#e8875e',
      medium: '#f1c40f', // Yellow
      low: '#95a5a6', // Gray
      negative: '#3498db', // Blue - negative correlation
    };
  }

  /**
   * Initialize heatmap container
   *
   * @param {string} containerId - Container element ID
   * @param {Array} assetNames - Array of asset names
   */
  init(containerId, assetNames = []) {
    this.containerId = containerId;
    this.assetNames = assetNames;

    const container = document.getElementById(containerId);
    if (!container) {
      logError(`[CorrelationHeatmap] Container not found: ${containerId}`);
      return;
    }

    container.innerHTML = '';
    this._createHeatmapStructure(container);
  }

  /**
   * Create heatmap HTML structure
   * @private
   */
  _createHeatmapStructure(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'correlation-heatmap-wrapper';
    wrapper.style.cssText = `
      width: 100%;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'heatmap-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 15px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Asset Correlation Matrix';
    title.style.cssText = 'margin: 0; color: #2c3e50; font-size: 18px;';
    header.appendChild(title);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'heatmap-controls';
    controls.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    // Scale toggle
    const scaleLabel = document.createElement('label');
    scaleLabel.textContent = 'Scale: ';
    scaleLabel.style.cssText = 'margin-right: 5px; font-size: 14px;';
    controls.appendChild(scaleLabel);

    const scaleSelect = document.createElement('select');
    scaleSelect.id = 'heatmap-scale';
    scaleSelect.style.cssText = `
      padding: 6px 10px;
      border: 1px solid #bdc3c7;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    scaleSelect.innerHTML = `
      <option value="correlation">Correlation</option>
      <option value="covariance">Covariance</option>
    `;
    scaleSelect.addEventListener('change', (e) => {
      this.scale = e.target.value;
      this.render(this.correlationData);
    });
    controls.appendChild(scaleSelect);

    // Refresh button
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Refresh';
    refreshBtn.style.cssText = `
      padding: 6px 12px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    `;
    refreshBtn.addEventListener('mouseover', () => (refreshBtn.style.background = '#2980b9'));
    refreshBtn.addEventListener('mouseout', () => (refreshBtn.style.background = '#3498db'));
    refreshBtn.addEventListener('click', () => this.refresh());
    controls.appendChild(refreshBtn);

    header.appendChild(controls);
    wrapper.appendChild(header);

    // Heatmap grid
    const heatmapContainer = document.createElement('div');
    heatmapContainer.id = 'heatmap-grid-container';
    heatmapContainer.style.cssText = `
      overflow-x: auto;
      margin-bottom: 20px;
      border-radius: 4px;
    `;

    const heatmapGrid = document.createElement('div');
    heatmapGrid.id = 'heatmap-grid';
    heatmapGrid.className = 'heatmap-grid';
    heatmapContainer.appendChild(heatmapGrid);
    wrapper.appendChild(heatmapContainer);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'heatmap-legend';
    legend.innerHTML = `
      <div style="font-size: 12px; color: #7f8c8d; margin-top: 15px;">
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: #e74c3c; border-radius: 2px;"></div>
            <span>Perfect (+1.0)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: #f1c40f; border-radius: 2px;"></div>
            <span>Medium (0.0)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: #3498db; border-radius: 2px;"></div>
            <span>Negative (-1.0)</span>
          </div>
        </div>
      </div>
    `;
    wrapper.appendChild(legend);

    // Stats panel
    const stats = document.createElement('div');
    stats.id = 'heatmap-stats';
    stats.className = 'heatmap-stats';
    stats.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background: #ecf0f1;
      border-radius: 4px;
      border-left: 4px solid #3498db;
    `;
    wrapper.appendChild(stats);

    container.appendChild(wrapper);
  }

  /**
   * Render heatmap with data
   *
   * @param {Array} correlationMatrix - 2D correlation matrix
   * @param {Array} assetNames - Asset names for labels
   */
  render(correlationMatrix, assetNames = null) {
    if (!correlationMatrix) {
      logError('[CorrelationHeatmap] No correlation data provided');
      return;
    }

    this.correlationData = correlationMatrix;

    if (assetNames) {
      this.assetNames = assetNames;
    }

    const grid = document.getElementById('heatmap-grid');
    if (!grid) {
      logError('[CorrelationHeatmap] Grid container not found');
      return;
    }

    grid.innerHTML = '';

    // Create matrix visualization
    const matrix = correlationMatrix;
    const size = matrix.length;

    // Create header row with asset names
    const headerRow = document.createElement('div');
    headerRow.style.cssText = `
      display: grid;
      grid-template-columns: 100px repeat(${size}, 60px);
      gap: 1px;
      background: #bdc3c7;
      padding: 1px;
    `;

    // Corner cell
    const cornerCell = document.createElement('div');
    cornerCell.style.cssText = `
      background: white;
      padding: 8px;
      font-weight: bold;
      font-size: 11px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    headerRow.appendChild(cornerCell);

    // Column headers
    for (let i = 0; i < size; i++) {
      const headerCell = document.createElement('div');
      headerCell.style.cssText = `
        background: #34495e;
        color: white;
        padding: 8px 4px;
        font-weight: bold;
        font-size: 11px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        writing-mode: vertical-rl;
        text-orientation: mixed;
      `;
      headerCell.textContent = this.assetNames[i] || `A${i + 1}`;
      headerRow.appendChild(headerCell);
    }

    grid.appendChild(headerRow);

    // Create data rows
    for (let i = 0; i < size; i++) {
      const row = document.createElement('div');
      row.style.cssText = `
        display: grid;
        grid-template-columns: 100px repeat(${size}, 60px);
        gap: 1px;
        background: #bdc3c7;
        padding: 1px;
      `;

      // Row header
      const rowHeader = document.createElement('div');
      rowHeader.style.cssText = `
        background: #34495e;
        color: white;
        padding: 8px;
        font-weight: bold;
        font-size: 11px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      rowHeader.textContent = this.assetNames[i] || `A${i + 1}`;
      rowHeader.title = this.assetNames[i] || `Asset ${i + 1}`;
      row.appendChild(rowHeader);

      // Data cells
      for (let j = 0; j < size; j++) {
        const value = matrix[i][j];
        const cell = document.createElement('div');

        // Determine color
        const color = this._getColor(value);

        cell.style.cssText = `
          background: ${color};
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 12px;
          font-weight: bold;
          color: ${Math.abs(value) > 0.5 ? 'white' : '#2c3e50'};
          position: relative;
        `;

        cell.textContent = value.toFixed(2);

        // Hover effect
        cell.addEventListener('mouseover', () => {
          cell.style.transform = 'scale(1.1)';
          cell.style.zIndex = '10';
          cell.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';

          // Show tooltip
          const tooltip = document.createElement('div');
          tooltip.style.cssText = `
            position: absolute;
            bottom: 105%;
            left: 50%;
            transform: translateX(-50%);
            background: #2c3e50;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
          `;
          tooltip.textContent = `${this.assetNames[i] || `A${i + 1}`} ↔ ${
            this.assetNames[j] || `A${j + 1}`
          }: ${value.toFixed(4)}`;
          cell.appendChild(tooltip);

          setTimeout(() => tooltip.remove(), 2000);
        });

        cell.addEventListener('mouseout', () => {
          cell.style.transform = 'scale(1)';
          cell.style.boxShadow = 'none';
        });

        row.appendChild(cell);
      }

      grid.appendChild(row);
    }

    // Update stats
    this._updateStats(matrix);
  }

  /**
   * Get color for correlation value
   * @private
   */
  _getColor(value) {
    if (value === 1 || value === -1) {
      return value > 0 ? this.colorScale.perfect : this.colorScale.negative;
    }

    if (value > 0) {
      if (value > 0.7) {
        return this.colorScale.perfect;
      }
      if (value > 0.5) {
        return this.colorScale.high;
      }
      if (value > 0.2) {
        return this.colorScale.medium;
      }
      return this.colorScale.low;
    } else {
      if (value < -0.7) {
        return this.colorScale.negative;
      }
      if (value < -0.5) {
        return '#3d8fc4';
      }
      if (value < -0.2) {
        return '#5dade2';
      }
      return this.colorScale.low;
    }
  }

  /**
   * Update statistics panel
   * @private
   */
  _updateStats(matrix) {
    const stats = document.getElementById('heatmap-stats');
    if (!stats) {
      return;
    }

    // Calculate statistics
    const values = [];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i + 1; j < matrix.length; j++) {
        values.push(matrix[i][j]);
      }
    }

    const avgCorrelation = values.reduce((a, b) => a + b, 0) / values.length;
    const maxCorrelation = Math.max(...values);
    const minCorrelation = Math.min(...values);
    const posCount = values.filter((v) => v > 0).length;
    const negCount = values.filter((v) => v < 0).length;

    stats.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
        <div>
          <div style="font-size: 12px; color: #7f8c8d;">Average Correlation</div>
          <div style="font-size: 18px; font-weight: bold; color: #2c3e50;">${avgCorrelation.toFixed(3)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #7f8c8d;">Strongest Correlation</div>
          <div style="font-size: 18px; font-weight: bold; color: #e74c3c;">${maxCorrelation.toFixed(3)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #7f8c8d;">Weakest Correlation</div>
          <div style="font-size: 18px; font-weight: bold; color: #3498db;">${minCorrelation.toFixed(3)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #7f8c8d;">Diversification</div>
          <div style="font-size: 18px; font-weight: bold; color: #27ae60;">${(
    ((1 - avgCorrelation) * 100).toFixed(1)
  )
    .toString()}%</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #7f8c8d;">Positive Pairs</div>
          <div style="font-size: 18px; font-weight: bold; color: #2c3e50;">${posCount}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #7f8c8d;">Negative Pairs</div>
          <div style="font-size: 18px; font-weight: bold; color: #2c3e50;">${negCount}</div>
        </div>
      </div>
    `;
  }

  /**
   * Refresh heatmap with new data
   */
  refresh() {
    if (this.correlationData) {
      this.render(this.correlationData, this.assetNames);
    }
  }
}

// Global instance
window.correlationHeatmapUI = new CorrelationHeatmapUI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CorrelationHeatmapUI;
}
