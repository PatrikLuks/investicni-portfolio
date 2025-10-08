/**
 * Advanced Analytics Dashboard Module
 * Custom metrics, benchmarking, and advanced visualizations
 */

class AdvancedAnalyticsDashboard {
  constructor() {
    this.benchmarks = {
      'SPY': { name: 'S&P 500', ytdReturn: 0.18 },
      'QQQ': { name: 'Nasdaq 100', ytdReturn: 0.22 },
      'DIA': { name: 'Dow Jones', ytdReturn: 0.15 },
      'IWM': { name: 'Russell 2000', ytdReturn: 0.12 }
    };
    
    this.customMetrics = new Map();
    this.dashboardWidgets = [];
    
    this.init();
  }

  /**
   * Initialize advanced analytics
   */
  init() {
    try {
      this.loadCustomMetrics();
      this.createAnalyticsUI();
      
      console.log('✅ Advanced Analytics Dashboard initialized');
    } catch (error) {
      console.error('❌ Advanced Analytics Dashboard initialization failed:', error);
    }
  }

  /**
   * Calculate portfolio metrics
   */
  calculateAdvancedMetrics(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const totalInvested = data.reduce((sum, item) => sum + parseFloat(item.investováno || 0), 0);
    const totalReturn = ((totalValue - totalInvested) / totalInvested) * 100;

    // Calculate additional metrics
    const metrics = {
      // Basic metrics
      totalValue,
      totalInvested,
      totalReturn,
      totalGainLoss: totalValue - totalInvested,
      
      // Asset allocation
      topHoldings: this.getTopHoldings(data, 5),
      concentrationRisk: this.calculateConcentrationRisk(data),
      diversificationScore: this.calculateDiversificationScore(data),
      
      // Performance metrics
      bestPerformer: this.getBestPerformer(data),
      worstPerformer: this.getWorstPerformer(data),
      averageReturn: data.reduce((sum, item) => {
        const ret = ((parseFloat(item.aktuálníHodnota || 0) - parseFloat(item.investováno || 0)) / parseFloat(item.investováno || 1)) * 100;
        return sum + ret;
      }, 0) / data.length,
      
      // Risk metrics
      volatility: this.calculateVolatility(data),
      downsideRisk: this.calculateDownsideRisk(data),
      valueAtRisk: this.calculateValueAtRisk(data, 0.95),
      
      // Benchmark comparison
      benchmarkComparison: this.compareToBenchmarks(totalReturn),
      alpha: this.calculateAlpha(totalReturn, 'SPY'),
      
      // Custom metrics
      customMetrics: this.evaluateCustomMetrics(data)
    };

    return metrics;
  }

  /**
   * Get top holdings
   */
  getTopHoldings(data, count) {
    return data
      .map(item => ({
        name: item.název,
        value: parseFloat(item.aktuálníHodnota || 0),
        percentage: 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, count)
      .map(item => {
        const total = data.reduce((sum, d) => sum + parseFloat(d.aktuálníHodnota || 0), 0);
        item.percentage = (item.value / total) * 100;
        return item;
      });
  }

  /**
   * Calculate concentration risk
   */
  calculateConcentrationRisk(data) {
    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const topHolding = Math.max(...data.map(item => parseFloat(item.aktuálníHodnota || 0)));
    const concentration = (topHolding / totalValue) * 100;
    
    return {
      percentage: concentration,
      level: concentration > 30 ? 'High' : concentration > 20 ? 'Medium' : 'Low',
      color: concentration > 30 ? '#e74c3c' : concentration > 20 ? '#f39c12' : '#2ecc71'
    };
  }

  /**
   * Calculate diversification score
   */
  calculateDiversificationScore(data) {
    // Simple Herfindahl Index
    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const herfindahl = data.reduce((sum, item) => {
      const weight = parseFloat(item.aktuálníHodnota || 0) / totalValue;
      return sum + (weight * weight);
    }, 0);
    
    // Convert to 0-100 scale (lower Herfindahl = higher diversification)
    const score = (1 - herfindahl) * 100;
    
    return {
      score: score,
      level: score > 70 ? 'Excellent' : score > 50 ? 'Good' : score > 30 ? 'Fair' : 'Poor',
      color: score > 70 ? '#2ecc71' : score > 50 ? '#3498db' : score > 30 ? '#f39c12' : '#e74c3c'
    };
  }

  /**
   * Get best performer
   */
  getBestPerformer(data) {
    let best = data[0];
    let bestReturn = -Infinity;
    
    data.forEach(item => {
      const ret = ((parseFloat(item.aktuálníHodnota || 0) - parseFloat(item.investováno || 0)) / parseFloat(item.investováno || 1)) * 100;
      if (ret > bestReturn) {
        bestReturn = ret;
        best = item;
      }
    });
    
    return {
      name: best.název,
      return: bestReturn
    };
  }

  /**
   * Get worst performer
   */
  getWorstPerformer(data) {
    let worst = data[0];
    let worstReturn = Infinity;
    
    data.forEach(item => {
      const ret = ((parseFloat(item.aktuálníHodnota || 0) - parseFloat(item.investováno || 0)) / parseFloat(item.investováno || 1)) * 100;
      if (ret < worstReturn) {
        worstReturn = ret;
        worst = item;
      }
    });
    
    return {
      name: worst.název,
      return: worstReturn
    };
  }

  /**
   * Calculate volatility (simplified)
   */
  calculateVolatility(data) {
    const returns = data.map(item => 
      ((parseFloat(item.aktuálníHodnota || 0) - parseFloat(item.investováno || 0)) / parseFloat(item.investováno || 1)) * 100
    );
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    return {
      value: volatility,
      level: volatility > 20 ? 'High' : volatility > 10 ? 'Medium' : 'Low'
    };
  }

  /**
   * Calculate downside risk
   */
  calculateDownsideRisk(data) {
    const returns = data.map(item => 
      ((parseFloat(item.aktuálníHodnota || 0) - parseFloat(item.investováno || 0)) / parseFloat(item.investováno || 1)) * 100
    );
    
    const negativeReturns = returns.filter(r => r < 0);
    
    if (negativeReturns.length === 0) {
      return { value: 0, level: 'Low' };
    }
    
    const avgNegative = negativeReturns.reduce((sum, r) => sum + r, 0) / negativeReturns.length;
    const downsideVariance = negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length;
    const downsideRisk = Math.sqrt(downsideVariance);
    
    return {
      value: downsideRisk,
      level: downsideRisk > 15 ? 'High' : downsideRisk > 7 ? 'Medium' : 'Low'
    };
  }

  /**
   * Calculate Value at Risk (VaR)
   */
  calculateValueAtRisk(data, confidenceLevel) {
    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    
    const returns = data.map(item => 
      ((parseFloat(item.aktuálníHodnota || 0) - parseFloat(item.investováno || 0)) / parseFloat(item.investováno || 1))
    );
    
    // Simplified VaR using normal distribution assumption
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Z-score for 95% confidence
    const zScore = 1.645;
    const var95 = totalValue * (zScore * stdDev);
    
    return {
      value: var95,
      percentage: (var95 / totalValue) * 100,
      confidenceLevel: confidenceLevel * 100
    };
  }

  /**
   * Compare to benchmarks
   */
  compareToBenchmarks(portfolioReturn) {
    const comparisons = {};
    
    for (const [symbol, benchmark] of Object.entries(this.benchmarks)) {
      const benchmarkReturn = benchmark.ytdReturn * 100;
      const outperformance = portfolioReturn - benchmarkReturn;
      
      comparisons[symbol] = {
        name: benchmark.name,
        return: benchmarkReturn,
        outperformance: outperformance,
        outperforming: outperformance > 0
      };
    }
    
    return comparisons;
  }

  /**
   * Calculate alpha (simplified)
   */
  calculateAlpha(portfolioReturn, benchmarkSymbol) {
    const benchmark = this.benchmarks[benchmarkSymbol];
    if (!benchmark) return 0;
    
    const benchmarkReturn = benchmark.ytdReturn * 100;
    const alpha = portfolioReturn - benchmarkReturn;
    
    return alpha;
  }

  /**
   * Add custom metric
   */
  addCustomMetric(name, formula, description) {
    this.customMetrics.set(name, {
      formula: formula,
      description: description,
      created: new Date()
    });
    
    this.saveCustomMetrics();
  }

  /**
   * Evaluate custom metrics
   */
  evaluateCustomMetrics(data) {
    const results = {};
    
    this.customMetrics.forEach((metric, name) => {
      try {
        // Safely evaluate formula (simplified)
        // In production, use a proper expression parser
        results[name] = {
          value: 0, // Placeholder
          description: metric.description
        };
      } catch (error) {
        results[name] = {
          value: 'Error',
          description: metric.description
        };
      }
    });
    
    return results;
  }

  /**
   * Create analytics UI
   */
  createAnalyticsUI() {
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) return;

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) return;

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) return;

    const analyticsBtn = document.createElement('button');
    analyticsBtn.id = 'advancedAnalyticsBtn';
    analyticsBtn.className = 'btn-icon';
    analyticsBtn.title = 'Advanced Analytics';
    analyticsBtn.setAttribute('aria-label', 'Pokročilá analytika');
    analyticsBtn.style.cssText = 'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
    analyticsBtn.textContent = '📊';

    analyticsBtn.addEventListener('click', () => this.showAnalyticsDashboard());

    buttonContainer.appendChild(analyticsBtn);
  }

  /**
   * Show analytics dashboard
   */
  showAnalyticsDashboard() {
    const data = window.getFondyData ? window.getFondyData() : [];
    
    if (data.length === 0) {
      alert('No portfolio data available');
      return;
    }

    const metrics = this.calculateAdvancedMetrics(data);
    
    // Create full-screen dashboard
    const dashboard = document.createElement('div');
    dashboard.id = 'advancedAnalyticsDashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #f5f7fa;
      z-index: 10001;
      overflow-y: auto;
      padding: 20px;
    `;

    dashboard.innerHTML = `
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 2rem;">📊</span>
            <span>Advanced Analytics Dashboard</span>
          </h1>
          <button onclick="document.getElementById('advancedAnalyticsDashboard').remove()" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            ✕ Close
          </button>
        </div>
        
        <!-- Key Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Total Value</div>
            <div style="font-size: 2rem; font-weight: bold; color: #333;">$${metrics.totalValue.toFixed(2)}</div>
            <div style="font-size: 0.85rem; color: ${metrics.totalGainLoss >= 0 ? '#2ecc71' : '#e74c3c'}; margin-top: 4px;">
              ${metrics.totalGainLoss >= 0 ? '+' : ''}$${metrics.totalGainLoss.toFixed(2)}
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Total Return</div>
            <div style="font-size: 2rem; font-weight: bold; color: ${metrics.totalReturn >= 0 ? '#2ecc71' : '#e74c3c'};">
              ${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(2)}%
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Diversification</div>
            <div style="font-size: 2rem; font-weight: bold; color: ${metrics.diversificationScore.color};">
              ${metrics.diversificationScore.score.toFixed(0)}/100
            </div>
            <div style="font-size: 0.85rem; color: #999; margin-top: 4px;">${metrics.diversificationScore.level}</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">VaR (95%)</div>
            <div style="font-size: 2rem; font-weight: bold; color: #e74c3c;">
              $${metrics.valueAtRisk.value.toFixed(2)}
            </div>
            <div style="font-size: 0.85rem; color: #999; margin-top: 4px;">${metrics.valueAtRisk.percentage.toFixed(1)}% of portfolio</div>
          </div>
        </div>
        
        <!-- Benchmark Comparison -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0;">Benchmark Comparison</h3>
          <div style="display: grid; gap: 12px;">
            ${Object.entries(metrics.benchmarkComparison).map(([symbol, comp]) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${comp.outperforming ? '#e8f5e9' : '#ffebee'}; border-radius: 8px;">
                <div>
                  <div style="font-weight: 600; color: #333;">${comp.name}</div>
                  <div style="font-size: 0.85rem; color: #666;">Return: ${comp.return.toFixed(2)}%</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: bold; font-size: 1.2rem; color: ${comp.outperforming ? '#2ecc71' : '#e74c3c'};">
                    ${comp.outperforming ? '+' : ''}${comp.outperformance.toFixed(2)}%
                  </div>
                  <div style="font-size: 0.85rem; color: #666;">${comp.outperforming ? 'Outperforming' : 'Underperforming'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Top/Bottom Performers -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 16px 0;">🏆 Best Performer</h3>
            <div style="padding: 16px; background: #e8f5e9; border-radius: 8px;">
              <div style="font-weight: 600; font-size: 1.1rem; color: #333; margin-bottom: 8px;">${metrics.bestPerformer.name}</div>
              <div style="font-weight: bold; font-size: 1.8rem; color: #2ecc71;">+${metrics.bestPerformer.return.toFixed(2)}%</div>
            </div>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 16px 0;">📉 Worst Performer</h3>
            <div style="padding: 16px; background: #ffebee; border-radius: 8px;">
              <div style="font-weight: 600; font-size: 1.1rem; color: #333; margin-bottom: 8px;">${metrics.worstPerformer.name}</div>
              <div style="font-weight: bold; font-size: 1.8rem; color: #e74c3c;">${metrics.worstPerformer.return.toFixed(2)}%</div>
            </div>
          </div>
        </div>
        
        <!-- Risk Metrics -->
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 16px 0;">Risk Analysis</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="padding: 16px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Volatility</div>
              <div style="font-weight: bold; font-size: 1.5rem; color: #333;">${metrics.volatility.value.toFixed(2)}%</div>
              <div style="font-size: 0.85rem; color: #999; margin-top: 4px;">${metrics.volatility.level}</div>
            </div>
            
            <div style="padding: 16px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Downside Risk</div>
              <div style="font-weight: bold; font-size: 1.5rem; color: #333;">${metrics.downsideRisk.value.toFixed(2)}%</div>
              <div style="font-size: 0.85rem; color: #999; margin-top: 4px;">${metrics.downsideRisk.level}</div>
            </div>
            
            <div style="padding: 16px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Concentration Risk</div>
              <div style="font-weight: bold; font-size: 1.5rem; color: ${metrics.concentrationRisk.color};">${metrics.concentrationRisk.percentage.toFixed(1)}%</div>
              <div style="font-size: 0.85rem; color: #999; margin-top: 4px;">${metrics.concentrationRisk.level}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dashboard);
    
    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(
        'Advanced analytics loaded',
        'success'
      );
    }
  }

  /**
   * Save custom metrics
   */
  saveCustomMetrics() {
    try {
      localStorage.setItem('customMetrics', JSON.stringify(Array.from(this.customMetrics.entries())));
    } catch (error) {
      console.error('Failed to save custom metrics:', error);
    }
  }

  /**
   * Load custom metrics
   */
  loadCustomMetrics() {
    try {
      const data = localStorage.getItem('customMetrics');
      if (data) {
        this.customMetrics = new Map(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load custom metrics:', error);
    }
  }
}

// Global instance
window.advancedAnalyticsDashboard = new AdvancedAnalyticsDashboard();

console.log('✅ Advanced Analytics Dashboard loaded');
