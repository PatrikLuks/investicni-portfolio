/**
 * Advanced Charts Module
 * Version: 3.1.0
 * Treemap, Heatmap, Candlestick, and Sankey charts using Chart.js + D3.js
 */

/* global Chart */

/**
 * Format currency value
 * @param {number} value - Value to format
 * @returns {string} Formatted currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Treemap Chart - Portfolio Asset Allocation Visualization
class TreemapChart {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }
  }

  render(data) {
    // Clear container
    this.container.innerHTML = '';

    // Calculate total value
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    // Create SVG
    const width = this.container.clientWidth || 800;
    const height = 500;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'treemap-chart');

    // Sort by value descending
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // Simple treemap layout (squarified)
    const rects = this.squarify(sortedData, width, height);

    // Render rectangles
    rects.forEach((rect, index) => {
      const item = sortedData[index];
      const percentage = ((item.value / totalValue) * 100).toFixed(1);

      // Rectangle
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'treemap-cell');

      const rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectEl.setAttribute('x', rect.x);
      rectEl.setAttribute('y', rect.y);
      rectEl.setAttribute('width', rect.width);
      rectEl.setAttribute('height', rect.height);
      rectEl.setAttribute('fill', this.getColor(index));
      rectEl.setAttribute('stroke', '#fff');
      rectEl.setAttribute('stroke-width', '2');

      // Label
      if (rect.width > 80 && rect.height > 50) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', rect.x + rect.width / 2);
        text.setAttribute('y', rect.y + rect.height / 2 - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.textContent = item.name;

        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', rect.x + rect.width / 2);
        valueText.setAttribute('y', rect.y + rect.height / 2 + 10);
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('fill', '#fff');
        valueText.setAttribute('font-size', '12');
        valueText.textContent = `${formatCurrency(item.value)} (${percentage}%)`;

        g.appendChild(text);
        g.appendChild(valueText);
      }

      // Tooltip
      rectEl.addEventListener('mouseenter', (e) => {
        this.showTooltip(e, item, percentage);
      });
      rectEl.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });

      g.appendChild(rectEl);
      svg.appendChild(g);
    });

    this.container.appendChild(svg);
  }

  squarify(data, width, height) {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const rects = [];
    const x = 0;
    let y = 0;
    let remainingHeight = height;

    // Simple row-based layout
    const currentRow = [];
    let currentRowValue = 0;
    const targetRowRatio = width / height;

    data.forEach((item, index) => {
      currentRow.push(item);
      currentRowValue += item.value;

      const isLastItem = index === data.length - 1;
      const currentRatio = ((currentRowValue / totalValue) * width) / remainingHeight;

      if (currentRatio >= targetRowRatio || isLastItem) {
        // Layout current row
        const rowHeight = ((currentRowValue / totalValue) * width * height) / width;
        const rowWidth = width;

        let rowX = x;
        currentRow.forEach((rowItem) => {
          const cellWidth = (rowItem.value / currentRowValue) * rowWidth;
          rects.push({
            x: rowX,
            y,
            width: cellWidth,
            height: rowHeight,
          });
          rowX += cellWidth;
        });

        y += rowHeight;
        remainingHeight -= rowHeight;
        currentRow.length = 0;
        currentRowValue = 0;
      }
    });

    return rects;
  }

  getColor(index) {
    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#06b6d4',
      '#f97316',
      '#14b8a6',
      '#a855f7',
      '#ef4444',
    ];
    return colors[index % colors.length];
  }

  showTooltip(event, item, percentage) {
    let tooltip = document.getElementById('treemap-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'treemap-tooltip';
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `
      <strong>${item.name}</strong><br>
      Value: ${formatCurrency(item.value)}<br>
      Percentage: ${percentage}%
    `;

    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
  }

  hideTooltip() {
    const tooltip = document.getElementById('treemap-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}

// Heatmap Chart - Performance Matrix
class HeatmapChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas ${canvasId} not found`);
    }
    this.ctx = this.canvas.getContext('2d');
  }

  render(data) {
    // data format: { labels: ['Stock A', 'Stock B'], values: [[1.2, -0.5], [2.3, 1.1]] }
    const { labels, values } = data;

    const cellWidth = this.canvas.width / labels.length;
    const cellHeight = this.canvas.height / labels.length;

    // Find min/max for color scale
    const allValues = values.flat();
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw cells
    values.forEach((row, i) => {
      row.forEach((value, j) => {
        const x = j * cellWidth;
        const y = i * cellHeight;

        // Color based on value (red for negative, green for positive)
        const color = this.getHeatColor(value, minValue, maxValue);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, cellWidth, cellHeight);

        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Value text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${value.toFixed(1)}%`, x + cellWidth / 2, y + cellHeight / 2);
      });
    });

    // Draw labels
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 12px Arial';
    labels.forEach((label, i) => {
      // X-axis labels
      this.ctx.save();
      this.ctx.translate(i * cellWidth + cellWidth / 2, this.canvas.height + 20);
      this.ctx.rotate(-Math.PI / 4);
      this.ctx.textAlign = 'right';
      this.ctx.fillText(label, 0, 0);
      this.ctx.restore();

      // Y-axis labels
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(label, -10, i * cellHeight + cellHeight / 2);
    });
  }

  getHeatColor(value, min, max) {
    // Normalize value to 0-1
    const normalized = (value - min) / (max - min);

    // Red (0) -> Yellow (0.5) -> Green (1)
    let r, g, b;

    if (normalized < 0.5) {
      // Red to Yellow
      r = 255;
      g = Math.floor(normalized * 2 * 255);
      b = 0;
    } else {
      // Yellow to Green
      r = Math.floor((1 - normalized) * 2 * 255);
      g = 255;
      b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Candlestick Chart - Stock Price History
class CandlestickChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas ${canvasId} not found`);
    }

    this.chart = null;
  }

  async render(data) {
    // Load Chart.js on-demand
    if (!window.libraryLoader?.loaded?.chart) {
      await window.libraryLoader.loadChart();
    }

    // data format: [{ date, open, high, low, close }]
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.canvas.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: 'Price',
            data: data.map((d) => ({
              x: new Date(d.date),
              o: d.open,
              h: d.high,
              l: d.low,
              c: d.close,
            })),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Price History',
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
          },
          y: {
            beginAtZero: false,
          },
        },
      },
    });
  }
}

// Waterfall Chart - Portfolio Changes
class WaterfallChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas ${canvasId} not found`);
    }

    this.chart = null;
  }

  async render(data) {
    // Load Chart.js on-demand
    if (!window.libraryLoader?.loaded?.chart) {
      await window.libraryLoader.loadChart();
    }

    // data format: [{ label, value }]
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.canvas.getContext('2d');

    // Calculate cumulative values
    let cumulative = 0;
    const chartData = data.map((item) => {
      const start = cumulative;
      cumulative += item.value;
      return {
        label: item.label,
        start: start,
        end: cumulative,
        value: item.value,
      };
    });

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map((d) => d.label),
        datasets: [
          {
            label: 'Start',
            data: chartData.map((d) => d.start),
            backgroundColor: 'transparent',
          },
          {
            label: 'Change',
            data: chartData.map((d) => d.value),
            backgroundColor: chartData.map((d) => (d.value >= 0 ? '#10b981' : '#ef4444')),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Portfolio Changes',
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }
}

// Generate demo data for testing
function generateDemoTreemapData() {
  return [
    { name: 'AAPL', value: 45000 },
    { name: 'MSFT', value: 38000 },
    { name: 'GOOGL', value: 32000 },
    { name: 'AMZN', value: 28000 },
    { name: 'TSLA', value: 22000 },
    { name: 'META', value: 18000 },
    { name: 'NVDA', value: 15000 },
    { name: 'BRK.B', value: 12000 },
  ];
}

function generateDemoHeatmapData() {
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
  const values = stocks.map(() => stocks.map(() => (Math.random() - 0.5) * 10));

  return {
    labels: stocks,
    values: values,
  };
}

/**
 * Generate demo candlestick data
 * @returns {Array} Demo data array
 */
function generateDemoCandlestickData() {
  const data = [];
  let price = 150;

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const open = price + (Math.random() - 0.5) * 5;
    const close = open + (Math.random() - 0.5) * 8;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    price = close;
  }

  return data;
}

// Export classes
window.TreemapChart = TreemapChart;
window.HeatmapChart = HeatmapChart;
window.CandlestickChart = CandlestickChart;
window.WaterfallChart = WaterfallChart;

// Export demo data generators
window.generateDemoTreemapData = generateDemoTreemapData;
window.generateDemoHeatmapData = generateDemoHeatmapData;
window.generateDemoCandlestickData = generateDemoCandlestickData;

// Register Chart.js candlestick type
if (typeof Chart !== 'undefined') {
  Chart.register({
    id: 'candlestick',
    beforeDraw: (chart) => {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];

      dataset.data.forEach((point, index) => {
        const meta = chart.getDatasetMeta(0);
        const element = meta.data[index];

        if (!element) {
          return;
        }

        const { x } = element;
        const yOpen = chart.scales.y.getPixelForValue(point.o);
        const yClose = chart.scales.y.getPixelForValue(point.c);
        const yHigh = chart.scales.y.getPixelForValue(point.h);
        const yLow = chart.scales.y.getPixelForValue(point.l);

        const color = point.c >= point.o ? '#10b981' : '#ef4444';

        // Draw high-low line
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Draw body
        ctx.fillStyle = color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.abs(yOpen - yClose) || 1;
        ctx.fillRect(x - 5, bodyTop, 10, bodyHeight);
      });
    },
  });
}
