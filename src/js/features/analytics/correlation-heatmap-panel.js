/**
 * Correlation Heatmap Panel - Phase 6 UI Integration
 * Displays asset correlation matrix as interactive heatmap
 * @module correlation-heatmap-panel
 */

import { logError, logInfo } from '../../utilities/logger.js';

class CorrelationHeatmapPanel {
  constructor(elementId = 'correlation-heatmap-panel') {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      logError('CorrelationHeatmapPanel: Element not found', { elementId });
      return;
    }
    this.currentMatrix = null;
    this.assets = [];
    this.init();
  }

  /**
   * Initialize panel structure
   */
  init() {
    this.createPanelHTML();
    this.attachEventListeners();
  }

  /**
   * Create panel HTML structure
   */
  createPanelHTML() {
    this.element.innerHTML = `
      <div class="heatmap-panel-container">
        <div class="heatmap-panel-header">
          <h2>🔥 Korelační matice</h2>
          <button class="heatmap-export-btn" id="heatmapExport" title="Exportovat">📥</button>
        </div>
        
        <div class="heatmap-wrapper">
          <div class="heatmap-content" id="heatmapContent">
            <div class="heatmap-empty">
              <p>Vytvořte portfolio pro analýzu korelací</p>
            </div>
          </div>
        </div>
        
        <div class="heatmap-legend">
          <div class="legend-title">Korelace</div>
          <div class="legend-gradient">
            <div class="legend-label">-1.0</div>
            <div class="legend-bar"></div>
            <div class="legend-label">0.0</div>
            <div class="legend-bar"></div>
            <div class="legend-label">+1.0</div>
          </div>
        </div>
        
        <div class="heatmap-info" id="heatmapInfo"></div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const exportBtn = this.element.querySelector('#heatmapExport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportMatrix());
    }
  }

  /**
   * Set correlation matrix and render
   * @param {Array<Array<number>>} matrix - Correlation matrix
   * @param {Array<string>} assets - Asset names/symbols
   */
  setCorrelationMatrix(matrix, assets) {
    try {
      if (!matrix || matrix.length === 0) {
        this.renderEmpty();
        return;
      }

      this.currentMatrix = matrix;
      this.assets = assets || this.generateAssetNames(matrix.length);

      this.render();

      logInfo('CorrelationHeatmapPanel: Matrix set', {
        size: matrix.length,
        assetCount: this.assets.length,
      });
    } catch (error) {
      logError('CorrelationHeatmapPanel: Error setting matrix', error);
    }
  }

  /**
   * Calculate correlations from portfolio
   * @param {Array} portfolio - Portfolio items
   */
  calculateFromPortfolio(portfolio) {
    try {
      if (!portfolio || portfolio.length === 0) {
        this.renderEmpty();
        return;
      }

      // Get unique symbols
      const symbols = [...new Set(portfolio.map((p) => p.symbol).filter(Boolean))];

      if (symbols.length < 2) {
        this.renderEmpty();
        return;
      }

      // Generate mock returns data
      const returns = this.generateMockReturns(symbols.length, 100);

      // Calculate correlation matrix
      const matrix = this.calculateCorrelationMatrix(returns);

      this.setCorrelationMatrix(matrix, symbols);

      logInfo('CorrelationHeatmapPanel: Correlations calculated', {
        assets: symbols.length,
      });
    } catch (error) {
      logError('CorrelationHeatmapPanel: Calculation error', error);
    }
  }

  /**
   * Calculate correlation matrix
   * @param {Array<Array<number>>} returns - Return data [asset][time]
   * @returns {Array<Array<number>>} Correlation matrix
   */
  calculateCorrelationMatrix(returns) {
    const n = returns.length;
    const matrix = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    // Calculate mean returns
    const means = returns.map((asset) => asset.reduce((a, b) => a + b, 0) / asset.length);

    // Calculate standard deviations
    const stdevs = returns.map((asset, i) => {
      const variance = asset.reduce((sum, val) => sum + Math.pow(val - means[i], 2), 0) / asset.length;
      return Math.sqrt(variance);
    });

    // Calculate correlations
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          let covariance = 0;
          for (let k = 0; k < returns[i].length; k++) {
            covariance += (returns[i][k] - means[i]) * (returns[j][k] - means[j]);
          }
          covariance /= returns[i].length;
          matrix[i][j] = covariance / (stdevs[i] * stdevs[j]);
        }
      }
    }

    return matrix;
  }

  /**
   * Render heatmap
   */
  render() {
    const contentEl = this.element.querySelector('#heatmapContent');
    if (!contentEl) return;

    // Create table
    let html = '<table class="correlation-table"><thead><tr><th></th>';

    // Header row
    this.assets.forEach((asset) => {
      html += `<th class="asset-label">${this.truncateAsset(asset)}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Data rows
    this.currentMatrix.forEach((row, i) => {
      html += `<tr><th class="asset-label">${this.truncateAsset(this.assets[i])}</th>`;

      row.forEach((value, j) => {
        const intensity = this.getColorIntensity(value);
        const className = this.getCellClass(value);
        const tooltip = `${this.assets[i]} ↔ ${this.assets[j]}: ${value.toFixed(3)}`;

        html += `
          <td class="correlation-cell ${className}" 
              style="background: ${intensity};"
              title="${tooltip}"
              data-i="${i}"
              data-j="${j}">
            <span class="correlation-value">${value.toFixed(2)}</span>
          </td>
        `;
      });

      html += '</tr>';
    });

    html += '</tbody></table>';
    contentEl.innerHTML = html;

    // Attach cell listeners
    this.attachCellListeners();

    // Update info
    this.updateInfo();
  }

  /**
   * Attach cell click listeners
   */
  attachCellListeners() {
    const cells = this.element.querySelectorAll('.correlation-cell');
    cells.forEach((cell) => {
      cell.addEventListener('click', (e) => {
        const i = parseInt(e.target.closest('.correlation-cell').dataset.i);
        const j = parseInt(e.target.closest('.correlation-cell').dataset.j);
        this.onCellClick(i, j);
      });
    });
  }

  /**
   * On cell click
   * @param {number} i - Row index
   * @param {number} j - Column index
   */
  onCellClick(i, j) {
    const value = this.currentMatrix[i][j];
    logInfo('CorrelationHeatmapPanel: Cell clicked', {
      asset1: this.assets[i],
      asset2: this.assets[j],
      correlation: value,
    });

    // Dispatch custom event
    const event = new CustomEvent('correlationCellClicked', {
      detail: {
        asset1: this.assets[i],
        asset2: this.assets[j],
        correlation: value,
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Get CSS class for correlation value
   * @param {number} value - Correlation value
   * @returns {string} CSS class
   */
  getCellClass(value) {
    if (value > 0.7) return 'strong-positive';
    if (value > 0.4) return 'moderate-positive';
    if (value > 0) return 'weak-positive';
    if (value > -0.4) return 'weak-negative';
    if (value > -0.7) return 'moderate-negative';
    return 'strong-negative';
  }

  /**
   * Get color intensity for value
   * @param {number} value - Correlation value (-1 to 1)
   * @returns {string} RGB color
   */
  getColorIntensity(value) {
    const normalized = (value + 1) / 2; // Convert from [-1,1] to [0,1]

    // Red for negative, Blue for positive
    if (value < 0) {
      // Red scale for negative correlation
      const intensity = Math.abs(value);
      const r = 255;
      const g = Math.round(255 * (1 - intensity));
      const b = Math.round(255 * (1 - intensity));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Blue scale for positive correlation
      const r = Math.round(255 * (1 - value));
      const g = Math.round(150 * (1 - value));
      const b = 255;
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  /**
   * Update info text
   */
  updateInfo() {
    const infoEl = this.element.querySelector('#heatmapInfo');
    if (!infoEl) return;

    // Find strongest positive and negative correlations
    let maxCorr = -2,
      minCorr = 2;
    let maxPair = null,
      minPair = null;

    for (let i = 0; i < this.currentMatrix.length; i++) {
      for (let j = i + 1; j < this.currentMatrix[i].length; j++) {
        const val = this.currentMatrix[i][j];
        if (val > maxCorr) {
          maxCorr = val;
          maxPair = [this.assets[i], this.assets[j]];
        }
        if (val < minCorr) {
          minCorr = val;
          minPair = [this.assets[i], this.assets[j]];
        }
      }
    }

    let info = '';
    if (maxPair) {
      info += `<div>📈 Silná kladná: ${maxPair[0]} ↔ ${maxPair[1]} (${maxCorr.toFixed(3)})</div>`;
    }
    if (minPair) {
      info += `<div>📉 Silná záporná: ${minPair[0]} ↔ ${minPair[1]} (${minCorr.toFixed(3)})</div>`;
    }

    infoEl.innerHTML = info || '<div>Žádné výrazné korelace</div>';
  }

  /**
   * Truncate asset name
   * @param {string} asset - Asset name
   * @returns {string} Truncated name
   */
  truncateAsset(asset) {
    return asset.length > 8 ? asset.substring(0, 8) : asset;
  }

  /**
   * Generate mock returns data
   * @param {number} assets - Number of assets
   * @param {number} periods - Number of periods
   * @returns {Array<Array<number>>} Returns data
   */
  generateMockReturns(assets, periods) {
    const returns = [];
    for (let i = 0; i < assets; i++) {
      const assetReturns = [];
      for (let j = 0; j < periods; j++) {
        assetReturns.push((Math.random() - 0.5) * 0.1);
      }
      returns.push(assetReturns);
    }
    return returns;
  }

  /**
   * Generate asset names
   * @param {number} count - Number of assets
   * @returns {Array<string>} Asset names
   */
  generateAssetNames(count) {
    return Array(count)
      .fill(0)
      .map((_, i) => `Asset ${i + 1}`);
  }

  /**
   * Export matrix
   */
  exportMatrix() {
    if (!this.currentMatrix) {
      logError('CorrelationHeatmapPanel: No matrix to export');
      return;
    }

    try {
      const data = {
        generated: new Date().toISOString(),
        assets: this.assets,
        matrix: this.currentMatrix,
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `correlation-matrix-${Date.now()}.json`;
      a.click();

      logInfo('CorrelationHeatmapPanel: Matrix exported');
    } catch (error) {
      logError('CorrelationHeatmapPanel: Export failed', error);
    }
  }

  /**
   * Render empty state
   */
  renderEmpty() {
    const contentEl = this.element.querySelector('#heatmapContent');
    if (contentEl) {
      contentEl.innerHTML =
        '<div class="heatmap-empty"><p>Vytvořte portfolio pro analýzu korelací</p></div>';
    }
  }

  /**
   * Get current matrix
   * @returns {Array<Array<number>>} Current correlation matrix
   */
  getMatrix() {
    return this.currentMatrix;
  }
}

export { CorrelationHeatmapPanel };
