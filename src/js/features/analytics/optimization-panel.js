/**
 * Optimization Panel - Phase 6 UI Integration
 * Displays portfolio optimization recommendations
 * @module optimization-panel
 */

import PortfolioOptimizationEngine from '../../utilities/portfolio-optimization.js';
import StressTestingFramework from '../../utilities/stress-testing.js';
import { logError, logInfo } from '../../utilities/logger.js';

class OptimizationPanel {
  constructor(elementId = 'optimization-panel') {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      logError('OptimizationPanel: Element not found', { elementId });
      return;
    }
    this.optimizer = new PortfolioOptimizationEngine();
    this.stressTester = new StressTestingFramework();
    this.currentRecommendation = null;
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
      <div class="optimization-panel-container">
        <div class="optimization-panel-header">
          <h2>🎯 Optimalizace portfolia</h2>
          <button class="optimization-panel-generate" title="Vygenerovat doporučení">
            Vygenerovat
          </button>
        </div>
        
        <div class="optimization-content" id="optimizationContent">
          <div class="optimization-empty">
            <p>Klikněte na "Vygenerovat" pro analýzu optimalizace portfolia</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const generateBtn = this.element.querySelector('.optimization-panel-generate');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateRecommendation());
    }
  }

  /**
   * Generate optimization recommendation
   * @param {Array} portfolio - Portfolio items
   */
  generateRecommendation(portfolio) {
    try {
      if (!portfolio || portfolio.length === 0) {
        this.renderEmpty();
        return;
      }

      // Show loading state
      this.renderLoading();

      // Get optimized allocation
      const optimized = this.optimizer.optimizeAllocation(portfolio);

      // Stress test the recommendation
      const stressTest = this.stressTester.runScenario(
        { name: 'market-downturn', priceShocks: {} },
        optimized
      );

      this.currentRecommendation = {
        portfolio,
        optimized,
        stressTest,
        generated: new Date(),
      };

      // Render results
      this.render();

      logInfo('OptimizationPanel: Recommendation generated', {
        itemCount: portfolio.length,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Render optimization panel
   */
  render() {
    if (!this.currentRecommendation) {
      this.renderEmpty();
      return;
    }

    const { stressTest } = this.currentRecommendation;

    const html = `
      <div class="optimization-results">
        <!-- Current vs Recommended Allocation -->
        <div class="allocation-comparison">
          <h3>📊 Porovnání alokace</h3>
          
          <div class="allocation-charts">
            <div class="allocation-column">
              <h4>Aktuální alokace</h4>
              <div class="allocation-bars" id="currentAllocation"></div>
            </div>
            
            <div class="allocation-column">
              <h4>Doporučená alokace</h4>
              <div class="allocation-bars" id="recommendedAllocation"></div>
            </div>
          </div>
        </div>
        
        <!-- Improvement Metrics -->
        <div class="improvement-metrics">
          <h3>📈 Očekávaná zlepšení</h3>
          
          <div class="improvement-grid">
            <div class="improvement-card">
              <div class="improvement-label">Očekávaný výnos</div>
              <div class="improvement-value" id="improvementReturn">-</div>
            </div>
            
            <div class="improvement-card">
              <div class="improvement-label">Riziko (volatilita)</div>
              <div class="improvement-value" id="improvementRisk">-</div>
            </div>
            
            <div class="improvement-card">
              <div class="improvement-label">Sharpe Ratio</div>
              <div class="improvement-value" id="improvementSharpe">-</div>
            </div>
            
            <div class="improvement-card">
              <div class="improvement-label">Diversifikace</div>
              <div class="improvement-value" id="improvementDiversity">-</div>
            </div>
          </div>
        </div>
        
        <!-- Stress Test Results -->
        <div class="stress-test-results">
          <h3>⚠️ Výsledky stresstestů</h3>
          
          <div class="stress-scenarios">
            ${this.renderStressScenarios(stressTest)}
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="optimization-actions">
          <button class="btn-secondary" id="acceptOptimization">
            ✓ Přijmout doporučení
          </button>
          <button class="btn-secondary" id="exportOptimization">
            📥 Exportovat analýzu
          </button>
        </div>
      </div>
    `;

    const contentEl = this.element.querySelector('#optimizationContent');
    if (contentEl) {
      contentEl.innerHTML = html;
      this.populateData();
      this.attachResultListeners();
    }
  }

  /**
   * Populate data in rendered template
   */
  populateData() {
    const { optimized } = this.currentRecommendation;

    // Populate return improvement
    const returnEl = this.element.querySelector('#improvementReturn');
    if (returnEl && optimized.expectedReturn) {
      const returnDiff = (optimized.expectedReturn * 100).toFixed(2);
      returnEl.textContent = `${returnDiff}%`;
      returnEl.className = returnDiff > 0 ? 'positive' : 'negative';
    }

    // Populate risk improvement
    const riskEl = this.element.querySelector('#improvementRisk');
    if (riskEl && optimized.expectedRisk) {
      const riskDiff = (optimized.expectedRisk * 100).toFixed(2);
      riskEl.textContent = `${riskDiff}%`;
      riskEl.className = riskDiff < 0 ? 'positive' : 'negative';
    }

    // Populate Sharpe ratio
    const sharpeEl = this.element.querySelector('#improvementSharpe');
    if (sharpeEl && optimized.sharpeRatio) {
      sharpeEl.textContent = optimized.sharpeRatio.toFixed(2);
      sharpeEl.className = optimized.sharpeRatio > 0 ? 'positive' : 'negative';
    }

    // Populate diversity
    const diversityEl = this.element.querySelector('#improvementDiversity');
    if (diversityEl && optimized.diversificationScore) {
      const diversity = (optimized.diversificationScore * 100).toFixed(0);
      diversityEl.textContent = `${diversity}%`;
    }
  }

  /**
   * Render stress test scenarios
   * @param {Object} stressTest - Stress test results
   * @returns {string} HTML string
   */
  renderStressScenarios(stressTest) {
    if (!stressTest || !stressTest.scenarios) {
      return '<p>Žádné výsledky stresstestů</p>';
    }

    return stressTest.scenarios
      .map(
        (scenario) => `
      <div class="stress-scenario">
        <div class="scenario-name">${scenario.name}</div>
        <div class="scenario-impact">${scenario.impact}</div>
      </div>
    `
      )
      .join('');
  }

  /**
   * Attach result action listeners
   */
  attachResultListeners() {
    const acceptBtn = this.element.querySelector('#acceptOptimization');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.handleAccept());
    }

    const exportBtn = this.element.querySelector('#exportOptimization');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }
  }

  /**
   * Handle accept recommendation
   */
  handleAccept() {
    const event = new CustomEvent('optimizationAccepted', {
      detail: this.currentRecommendation.optimized,
    });
    window.dispatchEvent(event);
    logInfo('OptimizationPanel: Recommendation accepted');
  }

  /**
   * Handle export
   */
  handleExport() {
    try {
      const json = JSON.stringify(this.currentRecommendation, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimization-${Date.now()}.json`;
      a.click();
      logInfo('OptimizationPanel: Analysis exported');
    } catch (error) {
      logError('OptimizationPanel: Export failed', error);
    }
  }

  /**
   * Render loading state
   */
  renderLoading() {
    const contentEl = this.element.querySelector('#optimizationContent');
    if (contentEl) {
      contentEl.innerHTML = '<div class="optimization-loading">⏳ Analýza probíhá...</div>';
    }
  }

  /**
   * Render empty state
   */
  renderEmpty() {
    const contentEl = this.element.querySelector('#optimizationContent');
    if (contentEl) {
      contentEl.innerHTML =
        '<div class="optimization-empty"><p>Klikněte na "Vygenerovat" pro analýzu optimalizace portfolia</p></div>';
    }
  }

  /**
   * Handle errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    logError('OptimizationPanel: Error', error);
    const contentEl = this.element.querySelector('#optimizationContent');
    if (contentEl) {
      contentEl.innerHTML =
        '<div class="optimization-error">❌ Chyba při optimalizaci portfolia</div>';
    }
  }

  /**
   * Get current recommendation
   * @returns {Object} Current recommendation
   */
  getRecommendation() {
    return this.currentRecommendation;
  }
}

export { OptimizationPanel };
