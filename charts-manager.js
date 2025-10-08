/**
 * Advanced Charts Manager
 * Features: Interactive Chart.js charts, zoom, pan, export to PNG, multiple chart types
 */

class AdvancedChartsManager {
  constructor() {
    this.charts = new Map();
    this.chartInstances = new Map();
    this.defaultColors = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#4facfe',
      '#43e97b',
      '#38f9d7',
      '#fa709a',
      '#fee140',
      '#30cfd0',
      '#330867',
      '#a8edea',
      '#fed6e3',
    ];
    this.chartTypes = ['pie', 'doughnut', 'bar', 'line', 'polarArea', 'radar'];

    this.init();
  }

  /**
   * Initialize charts manager
   */
  init() {
    this.checkChartJsAvailability();
    this.createChartsPanel();
    console.log('✅ Advanced Charts Manager initialized');
  }

  /**
   * Check if Chart.js is available
   */
  checkChartJsAvailability() {
    if (typeof Chart === 'undefined') {
      console.warn('⚠️ Chart.js not loaded - loading from CDN...');
      this.loadChartJs();
    }
  }

  /**
   * Load Chart.js from CDN
   * @returns {Promise<void>}
   */
  loadChartJs() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = () => {
        console.log('✅ Chart.js loaded');
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Create portfolio allocation pie chart
   * @param {Array} data - Portfolio data
   * @param {string} containerId - Container element ID
   * @returns {Chart} - Chart instance
   */
  createAllocationChart(data, containerId = 'allocationChart') {
    const categoryData = this.aggregateByCategory(data);

    const config = {
      type: 'pie',
      data: {
        labels: categoryData.labels,
        datasets: [
          {
            data: categoryData.values,
            backgroundColor: this.defaultColors,
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Alokace portfolia podle kategorií',
            font: { size: 18, weight: 'bold' },
          },
          legend: {
            position: 'right',
            labels: {
              generateLabels: (chart) => {
                const { data } = chart;
                return data.labels.map((label, i) => ({
                  text: `${label}: ${this.formatCurrency(data.datasets[0].data[i])}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
              },
            },
          },
        },
      },
    };

    return this.renderChart(containerId, config);
  }

  /**
   * Create performance line chart
   * @param {Array} data - Portfolio data with historical values
   * @param {string} containerId - Container element ID
   * @returns {Chart} - Chart instance
   */
  createPerformanceChart(data, containerId = 'performanceChart') {
    // Simulate historical data (in real app, this would come from backend)
    const historicalData = this.generateHistoricalData(data);

    const config = {
      type: 'line',
      data: {
        labels: historicalData.dates,
        datasets: [
          {
            label: 'Hodnota portfolia',
            data: historicalData.values,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          title: {
            display: true,
            text: 'Vývoj hodnoty portfolia',
            font: { size: 18, weight: 'bold' },
          },
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => `Hodnota: ${this.formatCurrency(context.parsed.y)}`,
            },
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: 'x',
            },
            pan: {
              enabled: true,
              mode: 'x',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => this.formatCurrency(value),
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    return this.renderChart(containerId, config);
  }

  /**
   * Create holdings bar chart
   * @param {Array} data - Portfolio data
   * @param {string} containerId - Container element ID
   * @returns {Chart} - Chart instance
   */
  createHoldingsChart(data, containerId = 'holdingsChart') {
    // Sort by value and take top 10
    const sortedData = [...data]
      .sort((a, b) => parseFloat(b.aktuálníHodnota) - parseFloat(a.aktuálníHodnota))
      .slice(0, 10);

    const config = {
      type: 'bar',
      data: {
        labels: sortedData.map((item) => item.fond),
        datasets: [
          {
            label: 'Aktuální hodnota',
            data: sortedData.map((item) => parseFloat(item.aktuálníHodnota)),
            backgroundColor: this.defaultColors[0],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: 'Top 10 největších pozic',
            font: { size: 18, weight: 'bold' },
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `Hodnota: ${this.formatCurrency(context.parsed.x)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (value) => this.formatCurrency(value),
            },
          },
        },
      },
    };

    return this.renderChart(containerId, config);
  }

  /**
   * Create profit/loss bar chart
   * @param {Array} data - Portfolio data
   * @param {string} containerId - Container element ID
   * @returns {Chart} - Chart instance
   */
  createProfitLossChart(data, containerId = 'profitLossChart') {
    const profitLossData = data
      .map((item) => {
        const current = parseFloat(item.aktuálníHodnota);
        const original = parseFloat(item.nákupníCena) * parseFloat(item.počet);
        return {
          fond: item.fond,
          profitLoss: current - original,
        };
      })
      .sort((a, b) => b.profitLoss - a.profitLoss);

    const config = {
      type: 'bar',
      data: {
        labels: profitLossData.map((item) => item.fond),
        datasets: [
          {
            label: 'Zisk/Ztráta',
            data: profitLossData.map((item) => item.profitLoss),
            backgroundColor: profitLossData.map((item) =>
              item.profitLoss >= 0 ? '#4caf50' : '#f44336',
            ),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Zisk/Ztráta podle pozic',
            font: { size: 18, weight: 'bold' },
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${value >= 0 ? 'Zisk' : 'Ztráta'}: ${this.formatCurrency(Math.abs(value))}`;
              },
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => this.formatCurrency(value),
            },
          },
        },
      },
    };

    return this.renderChart(containerId, config);
  }

  /**
   * Render chart in container
   * @param {string} containerId - Container element ID
   * @param {Object} config - Chart configuration
   * @returns {Chart} - Chart instance
   */
  renderChart(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Destroy existing chart
    if (this.chartInstances.has(containerId)) {
      this.chartInstances.get(containerId).destroy();
    }

    // Create canvas
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      container.appendChild(canvas);
    }

    // Create chart
    const chart = new Chart(canvas, config);
    this.chartInstances.set(containerId, chart);

    console.log(`✅ Chart rendered: ${containerId}`);
    return chart;
  }

  /**
   * Update chart data
   * @param {string} containerId - Container element ID
   * @param {Array} newData - New portfolio data
   */
  updateChart(containerId, newData) {
    const chart = this.chartInstances.get(containerId);
    if (!chart) {
      console.error(`Chart ${containerId} not found`);
      return;
    }

    // Update based on chart type
    if (containerId === 'allocationChart') {
      const categoryData = this.aggregateByCategory(newData);
      chart.data.labels = categoryData.labels;
      chart.data.datasets[0].data = categoryData.values;
    }

    chart.update();
    console.log(`✅ Chart updated: ${containerId}`);
  }

  /**
   * Export chart as PNG
   * @param {string} containerId - Container element ID
   * @param {string} filename - Output filename
   */
  exportChartAsPNG(containerId, filename = 'chart.png') {
    const chart = this.chartInstances.get(containerId);
    if (!chart) {
      console.error(`Chart ${containerId} not found`);
      return;
    }

    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    console.log(`✅ Chart exported: ${filename}`);
  }

  /**
   * Export all charts as PNG
   */
  exportAllCharts() {
    const timestamp = new Date().toISOString().split('T')[0];

    this.chartInstances.forEach((chart, containerId) => {
      this.exportChartAsPNG(containerId, `${containerId}-${timestamp}.png`);
    });

    console.log('✅ All charts exported');
  }

  /**
   * Aggregate data by category
   * @param {Array} data - Portfolio data
   * @returns {Object} - Aggregated data
   */
  aggregateByCategory(data) {
    const categoryMap = new Map();

    data.forEach((item) => {
      const category = item.kategorie || 'Ostatní';
      const value = parseFloat(item.aktuálníHodnota) || 0;

      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category) + value);
      } else {
        categoryMap.set(category, value);
      }
    });

    return {
      labels: Array.from(categoryMap.keys()),
      values: Array.from(categoryMap.values()),
    };
  }

  /**
   * Generate historical data (simulation)
   * @param {Array} data - Current portfolio data
   * @returns {Object} - Historical data
   */
  generateHistoricalData(data) {
    const currentValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const dates = [];
    const values = [];
    const months = 12;

    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      dates.push(date.toLocaleDateString('cs-CZ', { month: 'short', year: 'numeric' }));

      // Simulate historical values with some randomness
      const volatility = 0.15; // 15% volatility
      const trend = 1 + (months - i) * 0.02; // 2% monthly growth
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      values.push(currentValue * trend * randomFactor);
    }

    return { dates, values };
  }

  /**
   * Format currency
   * @param {number} value - Value to format
   * @returns {string} - Formatted currency
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Create charts panel UI
   */
  createChartsPanel() {
    const panel = document.createElement('div');
    panel.id = 'charts-panel';
    panel.className = 'charts-panel hidden';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>📊 Grafy a analýzy</h3>
        <div class="panel-actions">
          <button id="export-all-charts" class="btn-secondary">📤 Export všech</button>
          <button id="close-charts-panel" class="btn-icon" aria-label="Zavřít">✕</button>
        </div>
      </div>
      
      <div class="charts-content">
        <div class="chart-grid">
          <div class="chart-container">
            <div id="allocationChart" class="chart"></div>
            <button onclick="window.chartsManager.exportChartAsPNG('allocationChart', 'alokace.png')" class="btn-export">💾 Export PNG</button>
          </div>
          
          <div class="chart-container">
            <div id="performanceChart" class="chart"></div>
            <button onclick="window.chartsManager.exportChartAsPNG('performanceChart', 'vykon.png')" class="btn-export">💾 Export PNG</button>
          </div>
          
          <div class="chart-container">
            <div id="holdingsChart" class="chart"></div>
            <button onclick="window.chartsManager.exportChartAsPNG('holdingsChart', 'pozice.png')" class="btn-export">💾 Export PNG</button>
          </div>
          
          <div class="chart-container">
            <div id="profitLossChart" class="chart"></div>
            <button onclick="window.chartsManager.exportChartAsPNG('profitLossChart', 'zisk-ztrata.png')" class="btn-export">💾 Export PNG</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Attach event listeners
    document.getElementById('close-charts-panel')?.addEventListener('click', () => {
      panel.classList.add('hidden');
    });

    document.getElementById('export-all-charts')?.addEventListener('click', () => {
      this.exportAllCharts();
    });
  }

  /**
   * Show charts panel and render all charts
   * @param {Array} data - Portfolio data
   */
  showChartsPanel(data) {
    const panel = document.getElementById('charts-panel');
    if (!panel) {
      return;
    }

    panel.classList.remove('hidden');

    // Render all charts
    setTimeout(() => {
      this.createAllocationChart(data);
      this.createPerformanceChart(data);
      this.createHoldingsChart(data);
      this.createProfitLossChart(data);
    }, 100);

    console.log('✅ Charts panel opened');
  }

  /**
   * Destroy all charts
   */
  destroyAllCharts() {
    this.chartInstances.forEach((chart, id) => {
      chart.destroy();
      console.log(`🗑️ Chart destroyed: ${id}`);
    });
    this.chartInstances.clear();
  }
}

// Global instance
window.chartsManager = new AdvancedChartsManager();

// Add button to open charts panel
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addChartsButton);
} else {
  addChartsButton();
}

function addChartsButton() {
  const portfolioCard = document.getElementById('portfolioCard');
  if (!portfolioCard) {
    return;
  }

  // Find button container
  const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
  if (!headerDiv) {
    return;
  }

  const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
  if (!buttonContainer) {
    return;
  }

  // Add charts button
  const chartsBtn = document.createElement('button');
  chartsBtn.id = 'openChartsPanel';
  chartsBtn.className = 'btn-icon';
  chartsBtn.title = 'Otevřít grafy a analýzy';
  chartsBtn.setAttribute('aria-label', 'Otevřít grafy');
  chartsBtn.style.cssText =
    'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;';
  chartsBtn.textContent = '📊 Grafy';

  chartsBtn.addEventListener('click', () => {
    const data = window.getFondyData ? window.getFondyData() : [];
    window.chartsManager.showChartsPanel(data);
  });

  buttonContainer.insertBefore(chartsBtn, buttonContainer.firstChild);

  console.log('✅ Charts button added');
}
