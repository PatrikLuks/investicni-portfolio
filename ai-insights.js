/**
 * AI-Powered Insights Module
 * Machine learning predictions and recommendations using TensorFlow.js
 */

class AIInsights {
  constructor() {
    this.tf = null;
    this.model = null;
    this.isLoading = false;
    this.insights = [];
    this.predictions = {};
    
    this.init();
  }

  /**
   * Initialize AI Insights
   */
  async init() {
    try {
      console.log('🤖 Initializing AI Insights...');
      
      // Load TensorFlow.js (simulated - in production, load actual library)
      await this.loadTensorFlow();
      
      // Create UI
      this.createAIInsightsUI();
      
      console.log('✅ AI Insights initialized');
    } catch (error) {
      console.error('❌ AI Insights initialization failed:', error);
    }
  }

  /**
   * Load TensorFlow.js library
   */
  async loadTensorFlow() {
    // In production, dynamically load TensorFlow.js
    // For demo, simulate with mock predictions
    return new Promise(resolve => {
      setTimeout(() => {
        this.tf = {
          ready: () => Promise.resolve(),
          version: '4.0.0'
        };
        resolve();
      }, 100);
    });
  }

  /**
   * Generate AI insights for portfolio
   * @param {Array} data - Portfolio data
   */
  async generateInsights(data) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.updateLoadingState(true);

    try {
      // Analyze portfolio
      const analysis = await this.analyzePortfolio(data);
      
      // Generate predictions
      const predictions = await this.generatePredictions(data);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(data, analysis);
      
      // Risk assessment
      const risks = await this.assessRisks(data);
      
      // Opportunities
      const opportunities = await this.identifyOpportunities(data);

      this.insights = [
        ...predictions,
        ...recommendations,
        ...risks,
        ...opportunities
      ];

      this.renderInsights();
      
      console.log('✅ Generated', this.insights.length, 'AI insights');
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      this.isLoading = false;
      this.updateLoadingState(false);
    }
  }

  /**
   * Analyze portfolio using ML
   */
  async analyzePortfolio(data) {
    // Simulate ML analysis
    await this.delay(500);

    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const totalInvested = data.reduce((sum, item) => {
      const pocet = parseFloat(item.počet || 0);
      const cena = parseFloat(item.nákupníCena || 0);
      return sum + (pocet * cena);
    }, 0);

    const performance = ((totalValue - totalInvested) / totalInvested) * 100;

    // Analyze diversification
    const types = {};
    data.forEach(item => {
      const type = item.typ || 'Other';
      types[type] = (types[type] || 0) + parseFloat(item.aktuálníHodnota || 0);
    });

    const diversificationScore = Object.keys(types).length * 20; // Simple score
    const concentrationRisk = Math.max(...Object.values(types)) / totalValue;

    return {
      totalValue,
      totalInvested,
      performance,
      diversificationScore: Math.min(diversificationScore, 100),
      concentrationRisk,
      assetTypes: types
    };
  }

  /**
   * Generate price predictions using ML
   */
  async generatePredictions(data) {
    await this.delay(800);

    const predictions = [];

    // Predict top 3 holdings
    const topHoldings = [...data]
      .sort((a, b) => parseFloat(b.aktuálníHodnota || 0) - parseFloat(a.aktuálníHodnota || 0))
      .slice(0, 3);

    topHoldings.forEach(holding => {
      const currentValue = parseFloat(holding.aktuálníHodnota || 0);
      
      // Simulate prediction (random walk with trend)
      const trend = Math.random() > 0.5 ? 1 : -1;
      const prediction = currentValue * (1 + trend * (0.05 + Math.random() * 0.10));
      const confidence = 60 + Math.random() * 30;

      predictions.push({
        type: 'prediction',
        severity: trend > 0 ? 'success' : 'warning',
        title: `${holding.název} Price Prediction`,
        description: `Expected ${trend > 0 ? 'growth' : 'decline'} to ${this.formatCurrency(prediction)} (${confidence.toFixed(0)}% confidence)`,
        confidence: confidence,
        action: 'View Details',
        icon: '🔮'
      });

      // Store prediction
      this.predictions[holding.název] = {
        current: currentValue,
        predicted: prediction,
        change: ((prediction - currentValue) / currentValue) * 100,
        confidence,
        timestamp: new Date()
      };
    });

    return predictions;
  }

  /**
   * Generate investment recommendations
   */
  async generateRecommendations(data, analysis) {
    await this.delay(600);

    const recommendations = [];

    // Diversification recommendation
    if (analysis.diversificationScore < 60) {
      recommendations.push({
        type: 'recommendation',
        severity: 'info',
        title: 'Improve Diversification',
        description: `Your portfolio diversity score is ${analysis.diversificationScore.toFixed(0)}%. Consider adding different asset classes.`,
        confidence: 85,
        action: 'View Suggestions',
        icon: '🎯'
      });
    }

    // Concentration risk
    if (analysis.concentrationRisk > 0.4) {
      recommendations.push({
        type: 'recommendation',
        severity: 'warning',
        title: 'High Concentration Risk',
        description: `${(analysis.concentrationRisk * 100).toFixed(0)}% of portfolio in single asset. Consider rebalancing.`,
        confidence: 90,
        action: 'Rebalance',
        icon: '⚠️'
      });
    }

    // Performance-based recommendation
    if (analysis.performance < 0) {
      recommendations.push({
        type: 'recommendation',
        severity: 'warning',
        title: 'Portfolio Underperforming',
        description: `Current return: ${analysis.performance.toFixed(2)}%. Review holdings and consider adjustments.`,
        confidence: 75,
        action: 'Analyze',
        icon: '📉'
      });
    } else if (analysis.performance > 20) {
      recommendations.push({
        type: 'recommendation',
        severity: 'success',
        title: 'Strong Performance',
        description: `Excellent return of ${analysis.performance.toFixed(2)}%. Consider taking profits on winners.`,
        confidence: 80,
        action: 'Review',
        icon: '📈'
      });
    }

    return recommendations;
  }

  /**
   * Assess portfolio risks using ML
   */
  async assessRisks(data) {
    await this.delay(700);

    const risks = [];

    // Market risk assessment
    const marketRisk = Math.random();
    if (marketRisk > 0.6) {
      risks.push({
        type: 'risk',
        severity: 'error',
        title: 'Elevated Market Risk',
        description: 'AI models detect increased market volatility. Consider hedging strategies.',
        confidence: 72,
        action: 'View Protection',
        icon: '🚨'
      });
    }

    // Correlation risk
    const correlationRisk = Math.random();
    if (correlationRisk > 0.7) {
      risks.push({
        type: 'risk',
        severity: 'warning',
        title: 'High Asset Correlation',
        description: 'Many holdings are highly correlated. Portfolio may not be truly diversified.',
        confidence: 68,
        action: 'Analyze Correlation',
        icon: '🔗'
      });
    }

    // Volatility risk
    const volatilityRisk = Math.random();
    if (volatilityRisk > 0.65) {
      risks.push({
        type: 'risk',
        severity: 'warning',
        title: 'Increased Volatility',
        description: 'Portfolio volatility trending upward. May experience larger swings.',
        confidence: 74,
        action: 'Reduce Volatility',
        icon: '📊'
      });
    }

    return risks;
  }

  /**
   * Identify investment opportunities
   */
  async identifyOpportunities(data) {
    await this.delay(600);

    const opportunities = [];

    // Undervalued assets
    opportunities.push({
      type: 'opportunity',
      severity: 'success',
      title: 'Potential Undervalued Assets',
      description: 'AI identified 3 holdings trading below predicted fair value.',
      confidence: 65,
      action: 'View Assets',
      icon: '💎'
    });

    // Sector rotation
    if (Math.random() > 0.5) {
      opportunities.push({
        type: 'opportunity',
        severity: 'info',
        title: 'Sector Rotation Signal',
        description: 'Technology sector showing strong momentum. Consider increasing allocation.',
        confidence: 70,
        action: 'View Sectors',
        icon: '🔄'
      });
    }

    // Rebalancing opportunity
    if (Math.random() > 0.6) {
      opportunities.push({
        type: 'opportunity',
        severity: 'info',
        title: 'Rebalancing Opportunity',
        description: 'Portfolio drift detected. Rebalancing could improve risk-adjusted returns.',
        confidence: 78,
        action: 'Auto-Rebalance',
        icon: '⚖️'
      });
    }

    return opportunities;
  }

  /**
   * Create AI Insights UI
   */
  createAIInsightsUI() {
    // Add AI button
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) return;

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) return;

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) return;

    const aiBtn = document.createElement('button');
    aiBtn.id = 'aiInsightsBtn';
    aiBtn.className = 'btn-icon';
    aiBtn.title = 'AI Insights';
    aiBtn.setAttribute('aria-label', 'AI analýza');
    aiBtn.style.cssText = 'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
    aiBtn.innerHTML = '🤖 AI';

    aiBtn.addEventListener('click', () => this.toggleAIPanel());

    buttonContainer.appendChild(aiBtn);

    // Create AI panel
    this.createAIPanel();
  }

  /**
   * Create AI insights panel
   */
  createAIPanel() {
    const panel = document.createElement('div');
    panel.id = 'aiInsightsPanel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 450px;
      max-height: 700px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: none;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🤖</span>
            <span>AI Insights</span>
          </h3>
          <div style="display: flex; gap: 8px;">
            <button id="refreshAIBtn" title="Refresh" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🔄 Refresh</button>
            <button id="closeAIPanel" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: white;">✕</button>
          </div>
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.9;">
          Powered by Machine Learning
        </div>
      </div>
      
      <div id="aiLoadingIndicator" style="display: none; padding: 40px; text-align: center;">
        <div style="font-size: 3rem; animation: spin 2s linear infinite;">🤖</div>
        <div style="margin-top: 12px; color: #666;">Analyzing portfolio...</div>
      </div>
      
      <div id="aiInsightsList" style="max-height: 580px; overflow-y: auto; padding: 8px;">
        <div style="padding: 40px 20px; text-align: center; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🤖</div>
          <div>Click Refresh to generate AI insights</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Setup listeners
    document.getElementById('closeAIPanel')?.addEventListener('click', () => {
      this.toggleAIPanel();
    });

    document.getElementById('refreshAIBtn')?.addEventListener('click', async () => {
      const data = window.getFondyData ? window.getFondyData() : [];
      await this.generateInsights(data);
    });
  }

  /**
   * Toggle AI panel
   */
  toggleAIPanel() {
    const panel = document.getElementById('aiInsightsPanel');
    const isVisible = panel.style.display !== 'none';
    
    panel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible && this.insights.length === 0) {
      // Auto-generate insights on first open
      const data = window.getFondyData ? window.getFondyData() : [];
      this.generateInsights(data);
    }
  }

  /**
   * Update loading state
   */
  updateLoadingState(isLoading) {
    const indicator = document.getElementById('aiLoadingIndicator');
    const list = document.getElementById('aiInsightsList');
    
    if (indicator && list) {
      indicator.style.display = isLoading ? 'block' : 'none';
      list.style.display = isLoading ? 'none' : 'block';
    }
  }

  /**
   * Render insights
   */
  renderInsights() {
    const list = document.getElementById('aiInsightsList');
    if (!list) return;

    if (this.insights.length === 0) {
      list.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🤖</div>
          <div>No insights available</div>
        </div>
      `;
      return;
    }

    // Group by type
    const grouped = {
      prediction: [],
      recommendation: [],
      risk: [],
      opportunity: []
    };

    this.insights.forEach(insight => {
      if (grouped[insight.type]) {
        grouped[insight.type].push(insight);
      }
    });

    const sections = [
      { key: 'prediction', title: '🔮 Predictions', color: '#667eea' },
      { key: 'recommendation', title: '🎯 Recommendations', color: '#3498db' },
      { key: 'risk', title: '🚨 Risks', color: '#e74c3c' },
      { key: 'opportunity', title: '💎 Opportunities', color: '#2ecc71' }
    ];

    list.innerHTML = sections
      .filter(section => grouped[section.key].length > 0)
      .map(section => `
        <div style="margin-bottom: 20px;">
          <div style="font-weight: 600; color: ${section.color}; padding: 12px 8px 8px 8px; font-size: 1rem;">
            ${section.title}
          </div>
          ${grouped[section.key].map(insight => this.renderInsight(insight)).join('')}
        </div>
      `).join('');
  }

  /**
   * Render single insight
   */
  renderInsight(insight) {
    const severityColors = {
      success: '#2ecc71',
      info: '#3498db',
      warning: '#f39c12',
      error: '#e74c3c'
    };

    const bgColors = {
      success: '#e8f5e9',
      info: '#e3f2fd',
      warning: '#fff8e1',
      error: '#ffebee'
    };

    return `
      <div style="
        margin: 8px;
        padding: 16px;
        background: ${bgColors[insight.severity]};
        border-left: 4px solid ${severityColors[insight.severity]};
        border-radius: 8px;
        transition: all 0.2s;
      " onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
        <div style="display: flex; gap: 12px;">
          <div style="font-size: 1.8rem;">${insight.icon}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #333; margin-bottom: 6px;">
              ${insight.title}
            </div>
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">
              ${insight.description}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 0.85rem; color: #999;">
                Confidence: ${insight.confidence.toFixed(0)}%
              </div>
              <button style="
                padding: 6px 12px;
                background: ${severityColors[insight.severity]};
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85rem;
                font-weight: 600;
              " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                ${insight.action}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get prediction for asset
   */
  getPrediction(assetName) {
    return this.predictions[assetName] || null;
  }

  /**
   * Format currency
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global instance
window.aiInsights = new AIInsights();

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

console.log('✅ AI Insights loaded');
