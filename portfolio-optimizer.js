/**
 * Portfolio Optimization Module
 * Modern Portfolio Theory with Efficient Frontier
 */

class PortfolioOptimizer {
  constructor() {
    this.returns = [];
    this.covariance = [];
    this.weights = [];
    this.riskFreeRate = 0.02; // 2% annual

    this.init();
  }

  /**
   * Initialize portfolio optimizer
   */
  init() {
    try {
      this.createOptimizerUI();
      console.log('✅ Portfolio Optimizer initialized');
    } catch (error) {
      console.error('❌ Portfolio Optimizer initialization failed:', error);
    }
  }

  /**
   * Calculate optimal portfolio
   * @param {Array} data - Portfolio data
   * @param {string} objective - 'max_sharpe', 'min_volatility', 'max_return'
   */
  optimize(data, objective = 'max_sharpe') {
    if (!data || data.length === 0) {
      throw new Error('No data to optimize');
    }

    // Calculate returns and covariance
    this.calculateReturns(data);
    this.calculateCovariance(data);

    // Optimize based on objective
    let optimalWeights;
    switch (objective) {
      case 'max_sharpe':
        optimalWeights = this.maximizeSharpeRatio(data);
        break;
      case 'min_volatility':
        optimalWeights = this.minimizeVolatility(data);
        break;
      case 'max_return':
        optimalWeights = this.maximizeReturn(data);
        break;
      default:
        optimalWeights = this.maximizeSharpeRatio(data);
    }

    return this.formatOptimizationResult(data, optimalWeights, objective);
  }

  /**
   * Calculate expected returns
   */
  calculateReturns(data) {
    this.returns = data.map((item) => {
      const currentValue = parseFloat(item.aktuálníHodnota || 0);
      const investedValue = parseFloat(item.investováno || 1);
      return (currentValue - investedValue) / investedValue;
    });
  }

  /**
   * Calculate covariance matrix
   */
  calculateCovariance(data) {
    const n = data.length;
    this.covariance = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    // Simplified covariance (in production, use historical price data)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          // Variance on diagonal
          this.covariance[i][j] = Math.pow(this.returns[i] * 0.2, 2);
        } else {
          // Correlation between assets (simplified)
          const correlation = 0.3; // Assume 30% correlation
          this.covariance[i][j] =
            correlation * Math.sqrt(this.covariance[i][i]) * Math.sqrt(this.covariance[j][j]);
        }
      }
    }
  }

  /**
   * Maximize Sharpe Ratio
   */
  maximizeSharpeRatio(data) {
    const n = data.length;
    const weights = Array(n).fill(1 / n); // Start with equal weights

    // Simple optimization using gradient ascent
    const learningRate = 0.01;
    const iterations = 100;

    for (let iter = 0; iter < iterations; iter++) {
      const sharpe = this.calculateSharpeRatio(weights);
      const gradient = this.calculateGradient(weights, 'sharpe');

      // Update weights
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradient[i];
      }

      // Normalize weights
      this.normalizeWeights(weights);
    }

    return weights;
  }

  /**
   * Minimize Volatility
   */
  minimizeVolatility(data) {
    const n = data.length;
    const weights = Array(n).fill(1 / n);

    const learningRate = 0.01;
    const iterations = 100;

    for (let iter = 0; iter < iterations; iter++) {
      const gradient = this.calculateGradient(weights, 'volatility');

      for (let i = 0; i < n; i++) {
        weights[i] -= learningRate * gradient[i]; // Minus for minimization
      }

      this.normalizeWeights(weights);
    }

    return weights;
  }

  /**
   * Maximize Return
   */
  maximizeReturn(data) {
    const n = data.length;
    const weights = Array(n).fill(0);

    // Simple: put all weight on highest return asset
    let maxReturn = -Infinity;
    let maxIndex = 0;

    this.returns.forEach((ret, i) => {
      if (ret > maxReturn) {
        maxReturn = ret;
        maxIndex = i;
      }
    });

    weights[maxIndex] = 1;
    return weights;
  }

  /**
   * Calculate Sharpe Ratio
   */
  calculateSharpeRatio(weights) {
    const portfolioReturn = this.calculatePortfolioReturn(weights);
    const portfolioVolatility = this.calculatePortfolioVolatility(weights);

    return (portfolioReturn - this.riskFreeRate) / portfolioVolatility;
  }

  /**
   * Calculate portfolio return
   */
  calculatePortfolioReturn(weights) {
    return weights.reduce((sum, w, i) => sum + w * this.returns[i], 0);
  }

  /**
   * Calculate portfolio volatility
   */
  calculatePortfolioVolatility(weights) {
    let variance = 0;

    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * this.covariance[i][j];
      }
    }

    return Math.sqrt(Math.abs(variance));
  }

  /**
   * Calculate gradient
   */
  calculateGradient(weights, objective) {
    const n = weights.length;
    const gradient = Array(n).fill(0);
    const epsilon = 0.001;

    for (let i = 0; i < n; i++) {
      const weightsPlus = [...weights];
      weightsPlus[i] += epsilon;
      this.normalizeWeights(weightsPlus);

      const weightsMinus = [...weights];
      weightsMinus[i] -= epsilon;
      this.normalizeWeights(weightsMinus);

      let valuePlus, valueMinus;

      if (objective === 'sharpe') {
        valuePlus = this.calculateSharpeRatio(weightsPlus);
        valueMinus = this.calculateSharpeRatio(weightsMinus);
      } else {
        valuePlus = this.calculatePortfolioVolatility(weightsPlus);
        valueMinus = this.calculatePortfolioVolatility(weightsMinus);
      }

      gradient[i] = (valuePlus - valueMinus) / (2 * epsilon);
    }

    return gradient;
  }

  /**
   * Normalize weights to sum to 1
   */
  normalizeWeights(weights) {
    const sum = weights.reduce((s, w) => s + Math.abs(w), 0);
    for (let i = 0; i < weights.length; i++) {
      weights[i] = Math.abs(weights[i]) / sum;
    }
  }

  /**
   * Generate efficient frontier
   */
  generateEfficientFrontier(data, points = 50) {
    const frontier = [];

    for (let i = 0; i < points; i++) {
      const targetReturn = (i / points) * 0.3; // 0% to 30% return

      // Find weights that achieve target return with minimum volatility
      const weights = this.minimizeVolatilityWithTargetReturn(data, targetReturn);

      const portfolioReturn = this.calculatePortfolioReturn(weights);
      const portfolioVolatility = this.calculatePortfolioVolatility(weights);
      const sharpeRatio = this.calculateSharpeRatio(weights);

      frontier.push({
        return: portfolioReturn,
        volatility: portfolioVolatility,
        sharpe: sharpeRatio,
        weights: weights,
      });
    }

    return frontier;
  }

  /**
   * Minimize volatility with target return
   */
  minimizeVolatilityWithTargetReturn(data, targetReturn) {
    const n = data.length;
    const weights = Array(n).fill(1 / n);

    const learningRate = 0.005;
    const iterations = 50;

    for (let iter = 0; iter < iterations; iter++) {
      // Calculate current return and volatility
      const currentReturn = this.calculatePortfolioReturn(weights);
      const returnError = targetReturn - currentReturn;

      // Gradient for volatility minimization
      const volGradient = this.calculateGradient(weights, 'volatility');

      // Update weights
      for (let i = 0; i < n; i++) {
        // Move toward minimum volatility
        weights[i] -= learningRate * volGradient[i];

        // Adjust for target return
        weights[i] += learningRate * returnError * this.returns[i];
      }

      this.normalizeWeights(weights);
    }

    return weights;
  }

  /**
   * Format optimization result
   */
  formatOptimizationResult(data, weights, objective) {
    const portfolioReturn = this.calculatePortfolioReturn(weights);
    const portfolioVolatility = this.calculatePortfolioVolatility(weights);
    const sharpeRatio = this.calculateSharpeRatio(weights);

    const allocations = data.map((item, i) => ({
      asset: item.název,
      currentWeight:
        parseFloat(item.aktuálníHodnota || 0) /
        data.reduce((sum, d) => sum + parseFloat(d.aktuálníHodnota || 0), 0),
      optimalWeight: weights[i],
      difference:
        weights[i] -
        parseFloat(item.aktuálníHodnota || 0) /
          data.reduce((sum, d) => sum + parseFloat(d.aktuálníHodnota || 0), 0),
      expectedReturn: this.returns[i],
    }));

    return {
      objective,
      portfolioReturn: portfolioReturn * 100,
      portfolioVolatility: portfolioVolatility * 100,
      sharpeRatio,
      allocations: allocations.sort((a, b) => b.optimalWeight - a.optimalWeight),
    };
  }

  /**
   * Create optimizer UI
   */
  createOptimizerUI() {
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) {return;}

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) {return;}

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) {return;}

    const optimizeBtn = document.createElement('button');
    optimizeBtn.id = 'optimizeBtn';
    optimizeBtn.className = 'btn-icon';
    optimizeBtn.title = 'Portfolio Optimization';
    optimizeBtn.setAttribute('aria-label', 'Optimalizace portfolia');
    optimizeBtn.style.cssText =
      'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
    optimizeBtn.textContent = '🎯';

    optimizeBtn.addEventListener('click', () => this.showOptimizationPanel());

    buttonContainer.appendChild(optimizeBtn);
  }

  /**
   * Show optimization panel
   */
  showOptimizationPanel() {
    const data = window.getFondyData ? window.getFondyData() : [];

    if (data.length === 0) {
      alert('No data to optimize');
      return;
    }

    // Create optimization panel
    const panel = document.createElement('div');
    panel.id = 'optimizationPanel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-height: 80vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10000;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <h2 style="margin: 0; display: flex; align-items: center; gap: 10px;">
          <span>🎯</span>
          <span>Portfolio Optimization</span>
        </h2>
      </div>
      
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 16px 0;">Select Optimization Objective:</h3>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button onclick="window.portfolioOptimizer.runOptimization('max_sharpe')" style="padding: 16px; background: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; text-align: left;">
            📈 Maximize Sharpe Ratio
            <div style="font-size: 0.85rem; font-weight: normal; margin-top: 4px; opacity: 0.9;">Best risk-adjusted returns</div>
          </button>
          
          <button onclick="window.portfolioOptimizer.runOptimization('min_volatility')" style="padding: 16px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; text-align: left;">
            🛡️ Minimize Volatility
            <div style="font-size: 0.85rem; font-weight: normal; margin-top: 4px; opacity: 0.9;">Lowest risk portfolio</div>
          </button>
          
          <button onclick="window.portfolioOptimizer.runOptimization('max_return')" style="padding: 16px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; text-align: left;">
            🚀 Maximize Return
            <div style="font-size: 0.85rem; font-weight: normal; margin-top: 4px; opacity: 0.9;">Highest expected return</div>
          </button>
        </div>
        
        <button onclick="document.getElementById('optimizationPanel').remove()" style="width: 100%; margin-top: 16px; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Cancel
        </button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  /**
   * Run optimization
   */
  runOptimization(objective) {
    // Close selection panel
    document.getElementById('optimizationPanel')?.remove();

    const data = window.getFondyData();
    const result = this.optimize(data, objective);

    this.showOptimizationResults(result);
  }

  /**
   * Show optimization results
   */
  showOptimizationResults(result) {
    const panel = document.createElement('div');
    panel.id = 'optimizationResults';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      max-height: 85vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10000;
      overflow: hidden;
    `;

    const objectiveNames = {
      max_sharpe: 'Maximum Sharpe Ratio',
      min_volatility: 'Minimum Volatility',
      max_return: 'Maximum Return',
    };

    panel.innerHTML = `
      <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <h2 style="margin: 0;">🎯 Optimization Results</h2>
        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.95;">
          ${objectiveNames[result.objective]}
        </div>
      </div>
      
      <div style="max-height: calc(85vh - 80px); overflow-y: auto; padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="padding: 16px; background: #e8f5e9; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">Expected Return</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #2ecc71;">
              ${result.portfolioReturn.toFixed(2)}%
            </div>
          </div>
          
          <div style="padding: 16px; background: #fff3cd; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">Volatility</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #ffc107;">
              ${result.portfolioVolatility.toFixed(2)}%
            </div>
          </div>
          
          <div style="padding: 16px; background: #e3f2fd; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">Sharpe Ratio</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">
              ${result.sharpeRatio.toFixed(2)}
            </div>
          </div>
        </div>
        
        <h3 style="margin: 20px 0 12px 0;">Recommended Allocation:</h3>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
          ${result.allocations
    .map(
      (alloc) => `
            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #dee2e6;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-weight: 600; color: #333;">${alloc.asset}</div>
                <div style="font-size: 1.1rem; font-weight: bold; color: ${alloc.difference > 0 ? '#2ecc71' : '#e74c3c'};">
                  ${(alloc.optimalWeight * 100).toFixed(1)}%
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; margin-bottom: 4px;">
                <span>Current: ${(alloc.currentWeight * 100).toFixed(1)}%</span>
                <span>Change: ${alloc.difference > 0 ? '+' : ''}${(alloc.difference * 100).toFixed(1)}%</span>
              </div>
              
              <div style="height: 6px; background: #dee2e6; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${alloc.optimalWeight * 100}%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s;"></div>
              </div>
            </div>
          `
    )
    .join('')}
        </div>
        
        <button onclick="document.getElementById('optimizationResults').remove()" style="width: 100%; margin-top: 20px; padding: 14px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
          Close
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification('Portfolio optimization complete', 'success');
    }
  }
}

// Global instance
window.portfolioOptimizer = new PortfolioOptimizer();

console.log('✅ Portfolio Optimizer loaded');
