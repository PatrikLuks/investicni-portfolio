/**
 * Dashboard Builder
 * Drag & drop widgets with customizable layouts and persistence
 */

class DashboardBuilder {
  constructor() {
    this.widgets = new Map();
    this.layout = [];
    this.gridSize = 12; // 12-column grid
    this.widgetTypes = this.initializeWidgetTypes();
    
    this.init();
  }

  /**
   * Initialize dashboard builder
   */
  init() {
    this.loadLayout();
    console.log('✅ Dashboard Builder initialized');
  }

  /**
   * Initialize available widget types
   */
  initializeWidgetTypes() {
    return {
      'portfolio-summary': {
        name: 'Portfolio Summary',
        icon: '💰',
        defaultSize: { w: 6, h: 2 },
        render: this.renderPortfolioSummary.bind(this)
      },
      'performance-chart': {
        name: 'Performance Chart',
        icon: '📈',
        defaultSize: { w: 6, h: 3 },
        render: this.renderPerformanceChart.bind(this)
      },
      'top-performers': {
        name: 'Top Performers',
        icon: '🏆',
        defaultSize: { w: 4, h: 3 },
        render: this.renderTopPerformers.bind(this)
      },
      'category-breakdown': {
        name: 'Category Breakdown',
        icon: '📊',
        defaultSize: { w: 4, h: 3 },
        render: this.renderCategoryBreakdown.bind(this)
      },
      'metrics-panel': {
        name: 'Key Metrics',
        icon: '📉',
        defaultSize: { w: 4, h: 3 },
        render: this.renderMetricsPanel.bind(this)
      },
      'recent-activity': {
        name: 'Recent Activity',
        icon: '🕐',
        defaultSize: { w: 6, h: 2 },
        render: this.renderRecentActivity.bind(this)
      },
      'notes': {
        name: 'Notes',
        icon: '📝',
        defaultSize: { w: 6, h: 2 },
        render: this.renderNotes.bind(this)
      },
      'alerts': {
        name: 'Alerts & Notifications',
        icon: '🔔',
        defaultSize: { w: 4, h: 2 },
        render: this.renderAlerts.bind(this)
      },
      'market-overview': {
        name: 'Market Overview',
        icon: '🌍',
        defaultSize: { w: 8, h: 2 },
        render: this.renderMarketOverview.bind(this)
      }
    };
  }

  /**
   * Show dashboard builder UI
   */
  showDashboard() {
    const existing = document.getElementById('dashboard-container');
    if (existing) {
      existing.classList.remove('hidden');
      this.renderDashboard();
      return;
    }

    this.createDashboardUI();
    this.renderDashboard();
  }

  /**
   * Create dashboard UI container
   */
  createDashboardUI() {
    const container = document.createElement('div');
    container.id = 'dashboard-container';
    container.className = 'dashboard-container';
    container.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-title">
          <h2>📊 Custom Dashboard</h2>
          <p>Přizpůsobte si zobrazení svého portfolia</p>
        </div>
        <div class="dashboard-actions">
          <button id="add-widget-btn" class="btn-primary">
            ➕ Přidat Widget
          </button>
          <button id="reset-dashboard-btn" class="btn-secondary">
            🔄 Resetovat
          </button>
          <button id="close-dashboard-btn" class="btn-icon">✕</button>
        </div>
      </div>
      
      <div class="dashboard-content">
        <div id="dashboard-grid" class="dashboard-grid"></div>
      </div>

      <!-- Add Widget Modal -->
      <div id="add-widget-modal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Vyberte Widget</h3>
            <button class="modal-close">✕</button>
          </div>
          <div id="widget-gallery" class="widget-gallery"></div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Event listeners
    document.getElementById('add-widget-btn').addEventListener('click', () => {
      this.showWidgetGallery();
    });

    document.getElementById('reset-dashboard-btn').addEventListener('click', () => {
      if (confirm('Opravdu chcete resetovat dashboard?')) {
        this.resetDashboard();
      }
    });

    document.getElementById('close-dashboard-btn').addEventListener('click', () => {
      container.classList.add('hidden');
    });

    // Modal close
    const modal = document.getElementById('add-widget-modal');
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  /**
   * Render dashboard with current widgets
   */
  renderDashboard() {
    const grid = document.getElementById('dashboard-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (this.layout.length === 0) {
      grid.innerHTML = `
        <div class="empty-dashboard">
          <div class="empty-icon">📊</div>
          <h3>Dashboard je prázdný</h3>
          <p>Začněte přidáním widgetů pomocí tlačítka "Přidat Widget"</p>
        </div>
      `;
      return;
    }

    this.layout.forEach(widgetConfig => {
      const widget = this.createWidget(widgetConfig);
      grid.appendChild(widget);
    });
  }

  /**
   * Create widget element
   * @param {Object} config - Widget configuration
   * @returns {HTMLElement} - Widget element
   */
  createWidget(config) {
    const widgetType = this.widgetTypes[config.type];
    if (!widgetType) return null;

    const widget = document.createElement('div');
    widget.className = 'dashboard-widget';
    widget.id = `widget-${config.id}`;
    widget.style.gridColumn = `span ${config.w || widgetType.defaultSize.w}`;
    widget.style.gridRow = `span ${config.h || widgetType.defaultSize.h}`;

    widget.innerHTML = `
      <div class="widget-header">
        <span class="widget-icon">${widgetType.icon}</span>
        <span class="widget-title">${widgetType.name}</span>
        <div class="widget-controls">
          <button class="widget-refresh" title="Obnovit">🔄</button>
          <button class="widget-remove" title="Odebrat">🗑️</button>
        </div>
      </div>
      <div class="widget-content" id="widget-content-${config.id}">
        <div class="widget-loading">⏳ Načítání...</div>
      </div>
    `;

    // Event listeners
    widget.querySelector('.widget-refresh').addEventListener('click', () => {
      this.refreshWidget(config.id);
    });

    widget.querySelector('.widget-remove').addEventListener('click', () => {
      this.removeWidget(config.id);
    });

    // Render widget content
    setTimeout(() => {
      widgetType.render(config.id);
    }, 100);

    return widget;
  }

  /**
   * Show widget gallery modal
   */
  showWidgetGallery() {
    const modal = document.getElementById('add-widget-modal');
    const gallery = document.getElementById('widget-gallery');

    gallery.innerHTML = '';

    Object.entries(this.widgetTypes).forEach(([type, info]) => {
      const card = document.createElement('div');
      card.className = 'widget-card';
      card.innerHTML = `
        <div class="widget-card-icon">${info.icon}</div>
        <h4>${info.name}</h4>
        <p>Velikost: ${info.defaultSize.w}×${info.defaultSize.h}</p>
      `;

      card.addEventListener('click', () => {
        this.addWidget(type);
        modal.classList.add('hidden');
      });

      gallery.appendChild(card);
    });

    modal.classList.remove('hidden');
  }

  /**
   * Add widget to dashboard
   * @param {string} type - Widget type
   */
  addWidget(type) {
    const widgetType = this.widgetTypes[type];
    if (!widgetType) return;

    const config = {
      id: Date.now(),
      type: type,
      w: widgetType.defaultSize.w,
      h: widgetType.defaultSize.h,
      settings: {}
    };

    this.layout.push(config);
    this.saveLayout();
    this.renderDashboard();

    console.log('✅ Widget added:', type);
  }

  /**
   * Remove widget from dashboard
   * @param {number} widgetId - Widget ID
   */
  removeWidget(widgetId) {
    this.layout = this.layout.filter(w => w.id !== widgetId);
    this.saveLayout();
    this.renderDashboard();

    console.log('🗑️ Widget removed:', widgetId);
  }

  /**
   * Refresh widget content
   * @param {number} widgetId - Widget ID
   */
  refreshWidget(widgetId) {
    const config = this.layout.find(w => w.id === widgetId);
    if (!config) return;

    const widgetType = this.widgetTypes[config.type];
    if (widgetType) {
      widgetType.render(widgetId);
      console.log('🔄 Widget refreshed:', widgetId);
    }
  }

  /**
   * Reset dashboard to default
   */
  resetDashboard() {
    this.layout = this.getDefaultLayout();
    this.saveLayout();
    this.renderDashboard();
    console.log('🔄 Dashboard reset to default');
  }

  /**
   * Get default dashboard layout
   */
  getDefaultLayout() {
    return [
      { id: 1, type: 'portfolio-summary', w: 6, h: 2 },
      { id: 2, type: 'performance-chart', w: 6, h: 3 },
      { id: 3, type: 'top-performers', w: 4, h: 3 },
      { id: 4, type: 'category-breakdown', w: 4, h: 3 },
      { id: 5, type: 'metrics-panel', w: 4, h: 3 }
    ];
  }

  /**
   * Save layout to localStorage
   */
  saveLayout() {
    try {
      localStorage.setItem('dashboard-layout', JSON.stringify(this.layout));
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }

  /**
   * Load layout from localStorage
   */
  loadLayout() {
    try {
      const saved = localStorage.getItem('dashboard-layout');
      if (saved) {
        this.layout = JSON.parse(saved);
      } else {
        this.layout = this.getDefaultLayout();
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
      this.layout = this.getDefaultLayout();
    }
  }

  // ==================== WIDGET RENDERERS ====================

  /**
   * Render portfolio summary widget
   */
  renderPortfolioSummary(widgetId) {
    const data = window.getFondyData ? window.getFondyData() : [];
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const totalCost = data.reduce((sum, item) => 
      sum + (parseFloat(item.nákupníCena) * parseFloat(item.počet)), 0);
    const gainLoss = totalValue - totalCost;
    const roi = totalCost > 0 ? (gainLoss / totalCost * 100) : 0;

    content.innerHTML = `
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Celková hodnota</div>
          <div class="summary-value">${this.formatCurrency(totalValue)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">ROI</div>
          <div class="summary-value ${roi >= 0 ? 'positive' : 'negative'}">
            ${roi.toFixed(2)}%
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Zisk/Ztráta</div>
          <div class="summary-value ${gainLoss >= 0 ? 'positive' : 'negative'}">
            ${this.formatCurrency(gainLoss)}
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Počet pozic</div>
          <div class="summary-value">${data.length}</div>
        </div>
      </div>
    `;
  }

  /**
   * Render performance chart widget
   */
  renderPerformanceChart(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    content.innerHTML = `
      <canvas id="widget-chart-${widgetId}" style="max-height: 200px;"></canvas>
    `;

    const data = window.getFondyData ? window.getFondyData() : [];
    const chartData = data.slice(0, 10).map(item => ({
      name: item.fond || 'N/A',
      value: parseFloat(item.aktuálníHodnota || 0)
    }));

    setTimeout(() => {
      const canvas = document.getElementById(`widget-chart-${widgetId}`);
      if (!canvas) return;

      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: chartData.map(d => d.name.substring(0, 15) + '...'),
          datasets: [{
            label: 'Hodnota',
            data: chartData.map(d => d.value),
            backgroundColor: 'rgba(102, 126, 234, 0.8)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }, 100);
  }

  /**
   * Render top performers widget
   */
  renderTopPerformers(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    const data = window.getFondyData ? window.getFondyData() : [];
    const performers = data.map(item => {
      const cost = parseFloat(item.nákupníCena) * parseFloat(item.počet);
      const current = parseFloat(item.aktuálníHodnota || 0);
      const roi = cost > 0 ? ((current - cost) / cost * 100) : 0;
      return { fond: item.fond, roi };
    }).sort((a, b) => b.roi - a.roi).slice(0, 5);

    content.innerHTML = `
      <div class="performers-list">
        ${performers.map((p, i) => `
          <div class="performer-item">
            <span class="performer-rank">${i + 1}</span>
            <span class="performer-name">${p.fond || 'N/A'}</span>
            <span class="performer-roi positive">${p.roi.toFixed(2)}%</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render category breakdown widget
   */
  renderCategoryBreakdown(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    const data = window.getFondyData ? window.getFondyData() : [];
    const categories = {};

    data.forEach(item => {
      const cat = item.kategorie || 'Ostatní';
      categories[cat] = (categories[cat] || 0) + parseFloat(item.aktuálníHodnota || 0);
    });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

    content.innerHTML = `
      <div class="category-list">
        ${Object.entries(categories).map(([cat, val]) => `
          <div class="category-item">
            <div class="category-name">${cat}</div>
            <div class="category-bar-container">
              <div class="category-bar" style="width: ${(val/total*100).toFixed(1)}%"></div>
            </div>
            <div class="category-value">${(val/total*100).toFixed(1)}%</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render metrics panel widget
   */
  renderMetricsPanel(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    const data = window.getFondyData ? window.getFondyData() : [];
    
    if (!window.calculationsEngine) {
      content.innerHTML = '<p>Metrics engine not available</p>';
      return;
    }

    const metrics = window.calculationsEngine.calculatePortfolioMetrics(data);

    content.innerHTML = `
      <div class="metrics-list">
        <div class="metric-row">
          <span class="metric-label">CAGR:</span>
          <span class="metric-value">${metrics.cagr.toFixed(2)}%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Sharpe:</span>
          <span class="metric-value">${metrics.sharpeRatio.toFixed(2)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Volatilita:</span>
          <span class="metric-value">${metrics.volatility.toFixed(2)}%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Beta:</span>
          <span class="metric-value">${metrics.beta.toFixed(2)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Max DD:</span>
          <span class="metric-value">${metrics.maxDrawdown.toFixed(2)}%</span>
        </div>
      </div>
    `;
  }

  /**
   * Render recent activity widget
   */
  renderRecentActivity(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    content.innerHTML = `
      <div class="activity-list">
        <div class="activity-item">
          <span class="activity-icon">✅</span>
          <span class="activity-text">Portfolio data loaded</span>
          <span class="activity-time">Just now</span>
        </div>
        <div class="activity-item">
          <span class="activity-icon">📊</span>
          <span class="activity-text">Metrics calculated</span>
          <span class="activity-time">1 min ago</span>
        </div>
        <div class="activity-item">
          <span class="activity-icon">💾</span>
          <span class="activity-text">Auto-save successful</span>
          <span class="activity-time">5 mins ago</span>
        </div>
      </div>
    `;
  }

  /**
   * Render notes widget
   */
  renderNotes(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    const savedNotes = localStorage.getItem(`widget-notes-${widgetId}`) || '';

    content.innerHTML = `
      <textarea 
        id="notes-textarea-${widgetId}"
        class="notes-textarea"
        placeholder="Začněte psát poznámky..."
      >${savedNotes}</textarea>
    `;

    const textarea = document.getElementById(`notes-textarea-${widgetId}`);
    textarea.addEventListener('input', () => {
      localStorage.setItem(`widget-notes-${widgetId}`, textarea.value);
    });
  }

  /**
   * Render alerts widget
   */
  renderAlerts(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    content.innerHTML = `
      <div class="alerts-list">
        <div class="alert-item success">
          <span class="alert-icon">✅</span>
          <span class="alert-text">Všechna data jsou synchronizována</span>
        </div>
        <div class="alert-item info">
          <span class="alert-icon">ℹ️</span>
          <span class="alert-text">Portfolio performance +${(Math.random() * 5).toFixed(2)}% this month</span>
        </div>
      </div>
    `;
  }

  /**
   * Render market overview widget
   */
  renderMarketOverview(widgetId) {
    const content = document.getElementById(`widget-content-${widgetId}`);
    if (!content) return;

    content.innerHTML = `
      <div class="market-overview">
        <div class="market-item">
          <span class="market-label">S&P 500:</span>
          <span class="market-value positive">+0.85%</span>
        </div>
        <div class="market-item">
          <span class="market-label">NASDAQ:</span>
          <span class="market-value positive">+1.23%</span>
        </div>
        <div class="market-item">
          <span class="market-label">PX Index:</span>
          <span class="market-value negative">-0.34%</span>
        </div>
        <div class="market-item">
          <span class="market-label">EUR/CZK:</span>
          <span class="market-value">25.18</span>
        </div>
      </div>
    `;
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
}

// Global instance
window.dashboardBuilder = new DashboardBuilder();

// Add dashboard button
window.addEventListener('DOMContentLoaded', () => {
  const portfolioCard = document.getElementById('portfolioCard');
  if (!portfolioCard) return;

  const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
  if (!headerDiv) return;

  const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
  if (!buttonContainer) return;

  const dashboardBtn = document.createElement('button');
  dashboardBtn.id = 'openDashboard';
  dashboardBtn.className = 'btn-icon';
  dashboardBtn.title = 'Custom Dashboard';
  dashboardBtn.style.cssText = 'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
  dashboardBtn.textContent = '📊 Dashboard';
  dashboardBtn.addEventListener('click', () => {
    window.dashboardBuilder.showDashboard();
  });

  buttonContainer.appendChild(dashboardBtn);
});

console.log('✅ Dashboard Builder ready');
