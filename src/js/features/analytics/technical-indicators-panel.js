/**
 * Technical Indicators Panel - Phase 6 UI Integration
 * Displays technical analysis indicators
 * @module technical-indicators-panel
 */

import TechnicalIndicatorsEngine from '../../utilities/technical-indicators.js';
import { logError, logInfo } from '../../utilities/logger.js';

class TechnicalIndicatorsPanel {
  constructor(elementId = 'technical-indicators-panel') {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      logError('TechnicalIndicatorsPanel: Element not found', { elementId });
      return;
    }
    this.indicators = new TechnicalIndicatorsEngine();
    this.currentSignals = null;
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
      <div class="technical-panel-container">
        <div class="technical-panel-header">
          <h2>📊 Technické indikátory</h2>
          <div class="technical-controls">
            <select id="technicalSymbol" class="technical-symbol-select">
              <option value="">Vyberte symbol...</option>
            </select>
          </div>
        </div>
        
        <div class="indicators-grid">
          <!-- SMA -->
          <div class="indicator-card">
            <div class="indicator-header">
              <h3>SMA (Simple Moving Average)</h3>
              <div class="indicator-period">20-period</div>
            </div>
            <div class="indicator-value" id="smaPeriod20">-</div>
            <div class="indicator-description">Jednoduchý klouzavý průměr</div>
          </div>
          
          <!-- EMA -->
          <div class="indicator-card">
            <div class="indicator-header">
              <h3>EMA (Exponential MA)</h3>
              <div class="indicator-period">12-period</div>
            </div>
            <div class="indicator-value" id="emaPeriod12">-</div>
            <div class="indicator-description">Exponenciální klouzavý průměr</div>
          </div>
          
          <!-- RSI -->
          <div class="indicator-card">
            <div class="indicator-header">
              <h3>RSI (Relative Strength)</h3>
              <div class="indicator-period">14-period</div>
            </div>
            <div class="indicator-value" id="rsiValue">-</div>
            <div class="indicator-description">Relativní síla (0-100)</div>
          </div>
          
          <!-- MACD -->
          <div class="indicator-card">
            <div class="indicator-header">
              <h3>MACD (Moving Avg Conv/Div)</h3>
              <div class="indicator-period">12/26/9</div>
            </div>
            <div class="indicator-subvalue">
              <div>MACD: <span id="macdLine">-</span></div>
              <div>Signal: <span id="macdSignal">-</span></div>
            </div>
            <div class="indicator-description">Momentum indikátor</div>
          </div>
          
          <!-- Bollinger Bands -->
          <div class="indicator-card">
            <div class="indicator-header">
              <h3>Bollinger Bands</h3>
              <div class="indicator-period">20-period</div>
            </div>
            <div class="indicator-subvalue">
              <div>Upper: <span id="bbUpper">-</span></div>
              <div>Lower: <span id="bbLower">-</span></div>
            </div>
            <div class="indicator-description">Volatility indicator</div>
          </div>
          
          <!-- ATR -->
          <div class="indicator-card">
            <div class="indicator-header">
              <h3>ATR (Average True Range)</h3>
              <div class="indicator-period">14-period</div>
            </div>
            <div class="indicator-value" id="atrValue">-</div>
            <div class="indicator-description">Průměrný pravý rozsah</div>
          </div>
        </div>
        
        <!-- Trading Signals -->
        <div class="trading-signals">
          <h3>📈 Obchodní signály</h3>
          <div class="signals-list" id="signalsList">
            <div class="no-signals">Žádné signály nejsou dostupné</div>
          </div>
        </div>
        
        <div class="technical-footer">
          <div class="technical-info" id="technicalInfo"></div>
          <button class="technical-refresh-btn" id="technicalRefresh" title="Obnovit">↻</button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const refreshBtn = this.element.querySelector('#technicalRefresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    const symbolSelect = this.element.querySelector('#technicalSymbol');
    if (symbolSelect) {
      symbolSelect.addEventListener('change', (e) => this.onSymbolChange(e));
    }
  }

  /**
   * Update with portfolio data
   * @param {Array} portfolio - Portfolio items
   */
  updatePortfolio(portfolio) {
    try {
      if (!portfolio || portfolio.length === 0) {
        this.renderEmpty();
        return;
      }

      // Populate symbol dropdown
      this.populateSymbols(portfolio);

      logInfo('TechnicalIndicatorsPanel: Portfolio updated', {
        itemCount: portfolio.length,
      });
    } catch (error) {
      logError('TechnicalIndicatorsPanel: Error updating portfolio', error);
    }
  }

  /**
   * Populate symbol dropdown
   * @param {Array} portfolio - Portfolio items
   */
  populateSymbols(portfolio) {
    const select = this.element.querySelector('#technicalSymbol');
    if (!select) {
      return;
    }

    const symbols = [...new Set(portfolio.map((p) => p.symbol).filter(Boolean))];

    const optionsHtml = symbols
      .map((symbol) => `<option value="${symbol}">${symbol}</option>`)
      .join('');

    select.innerHTML = `<option value="">Vyberte symbol...</option>${optionsHtml}`;

    // Auto-select first
    if (symbols.length > 0) {
      select.value = symbols[0];
      this.analyzeSymbol(symbols[0]);
    }
  }

  /**
   * On symbol change
   * @param {Event} e - Change event
   */
  onSymbolChange(e) {
    const symbol = e.target.value;
    if (symbol) {
      this.analyzeSymbol(symbol);
    }
  }

  /**
   * Analyze symbol indicators
   * @param {string} symbol - Symbol to analyze
   */
  analyzeSymbol(symbol) {
    try {
      // Generate mock price data for demonstration
      const prices = this.generateMockPrices(100);

      // Calculate indicators
      const sma20 = this.indicators.calculateSMA(prices, 20);
      const ema12 = this.indicators.calculateEMA(prices, 12);
      const rsi = this.indicators.calculateRSI(prices, 14);
      const macd = this.indicators.calculateMACD(prices);
      const bb = this.indicators.calculateBollingerBands(prices, 20);
      const signals = this.indicators.generateSignals(prices);

      this.currentSignals = {
        symbol,
        sma20: sma20[sma20.length - 1],
        ema12: ema12[ema12.length - 1],
        rsi: rsi[rsi.length - 1],
        macd,
        bb,
        signals,
        currentPrice: prices[prices.length - 1],
      };

      this.render();

      logInfo('TechnicalIndicatorsPanel: Symbol analyzed', { symbol });
    } catch (error) {
      logError('TechnicalIndicatorsPanel: Analysis error', error);
    }
  }

  /**
   * Render indicators
   */
  render() {
    if (!this.currentSignals) {
      this.renderEmpty();
      return;
    }

    const s = this.currentSignals;

    // Update SMA
    const smaEl = this.element.querySelector('#smaPeriod20');
    if (smaEl) {
      smaEl.textContent = this.formatPrice(s.sma20);
    }

    // Update EMA
    const emaEl = this.element.querySelector('#emaPeriod12');
    if (emaEl) {
      emaEl.textContent = this.formatPrice(s.ema12);
    }

    // Update RSI
    const rsiEl = this.element.querySelector('#rsiValue');
    if (rsiEl) {
      rsiEl.textContent = `${s.rsi.toFixed(2)}`;
      rsiEl.className = this.getRSIClass(s.rsi);
    }

    // Update MACD
    if (s.macd) {
      const macdLineEl = this.element.querySelector('#macdLine');
      if (macdLineEl) {
        macdLineEl.textContent = s.macd.macdLine?.toFixed(4) || '-';
      }

      const signalEl = this.element.querySelector('#macdSignal');
      if (signalEl) {
        signalEl.textContent = s.macd.signal?.toFixed(4) || '-';
      }
    }

    // Update Bollinger Bands
    if (s.bb) {
      const upperEl = this.element.querySelector('#bbUpper');
      if (upperEl) {
        upperEl.textContent = this.formatPrice(s.bb.upper);
      }

      const lowerEl = this.element.querySelector('#bbLower');
      if (lowerEl) {
        lowerEl.textContent = this.formatPrice(s.bb.lower);
      }
    }

    // Update signals
    this.renderSignals(s.signals);

    // Update info
    const infoEl = this.element.querySelector('#technicalInfo');
    if (infoEl) {
      infoEl.textContent = `${s.symbol} • Cena: ${this.formatPrice(s.currentPrice)}`;
    }
  }

  /**
   * Render trading signals
   * @param {Array} signals - Trading signals
   */
  renderSignals(signals) {
    const listEl = this.element.querySelector('#signalsList');
    if (!listEl) {
      return;
    }

    if (!signals || signals.length === 0) {
      listEl.innerHTML = '<div class="no-signals">Žádné signály nejsou dostupné</div>';
      return;
    }

    const html = signals
      .map(
        (signal) => `
      <div class="signal-item signal-${signal.type}">
        <span class="signal-type">${signal.type === 'buy' ? '📈 BUY' : '📉 SELL'}</span>
        <span class="signal-price">${this.formatPrice(signal.price)}</span>
        <span class="signal-confidence">${(signal.confidence * 100).toFixed(0)}%</span>
      </div>
    `
      )
      .join('');

    listEl.innerHTML = html;
  }

  /**
   * Get RSI CSS class
   * @param {number} rsi - RSI value
   * @returns {string} CSS class
   */
  getRSIClass(rsi) {
    if (rsi >= 70) {
      return 'overbought';
    }
    if (rsi <= 30) {
      return 'oversold';
    }
    return 'neutral';
  }

  /**
   * Format price
   * @param {number} value - Price value
   * @returns {string} Formatted price
   */
  formatPrice(value) {
    if (!value) {
      return '-';
    }
    return value.toFixed(2);
  }

  /**
   * Generate mock price data
   * @param {number} count - Number of prices
   * @returns {Array} Price array
   */
  generateMockPrices(count) {
    const prices = [];
    let price = 100;
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.48) * 2;
      price = Math.max(price + change, 50);
      prices.push(price);
    }
    return prices;
  }

  /**
   * Render empty state
   */
  renderEmpty() {
    const listEl = this.element.querySelector('#signalsList');
    if (listEl) {
      listEl.innerHTML = '<div class="no-signals">Vyberte symbol pro analýzu</div>';
    }
  }

  /**
   * Refresh analysis
   */
  refresh() {
    const refreshBtn = this.element.querySelector('#technicalRefresh');
    if (refreshBtn) {
      refreshBtn.classList.add('rotating');
      setTimeout(() => refreshBtn.classList.remove('rotating'), 600);
    }

    const select = this.element.querySelector('#technicalSymbol');
    if (select && select.value) {
      this.analyzeSymbol(select.value);
    }
  }

  /**
   * Get current signals
   * @returns {Object} Current signals
   */
  getSignals() {
    return this.currentSignals;
  }
}

export { TechnicalIndicatorsPanel };
