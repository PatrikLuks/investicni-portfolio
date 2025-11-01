/**
 * Real-time Market Data Module
 * Live price feeds and market updates via WebSocket
 */

class MarketDataFeed {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.subscriptions = new Set();
    this.priceData = new Map();
    this.updateCallbacks = [];
    this.simulationInterval = null;

    this.init();
  }

  /**
   * Initialize market data feed
   */
  async init() {
    try {
      // Create UI
      this.createMarketDataUI();

      // Start simulated feed (in production, use real WebSocket)
      this.startSimulatedFeed();
    } catch (error) {
      console.error('❌ Market Data Feed initialization failed:', error);
    }
  }

  /**
   * Connect to market data WebSocket
   * In production, replace with actual WebSocket server
   */
  async connect() {
    // Simulate connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.updateConnectionStatus(true);
        this.onConnected();
        resolve();
      }, 500);
    });
  }

  /**
   * Start simulated market data feed
   */
  startSimulatedFeed() {
    // Simulate real-time price updates
    this.simulationInterval = setInterval(() => {
      this.subscriptions.forEach((symbol) => {
        const currentPrice = this.priceData.get(symbol)?.price || this.generateInitialPrice();
        const change = (Math.random() - 0.5) * 2; // -1% to +1%
        const newPrice = currentPrice * (1 + change / 100);

        const priceUpdate = {
          symbol,
          price: newPrice,
          change: change,
          changePercent: change,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date(),
          bid: newPrice * 0.999,
          ask: newPrice * 1.001,
          high: newPrice * 1.02,
          low: newPrice * 0.98,
          open: newPrice * 0.99,
        };

        this.priceData.set(symbol, priceUpdate);
        this.notifySubscribers(symbol, priceUpdate);
      });
    }, 2000); // Update every 2 seconds
  }

  /**
   * Generate initial price for symbol
   */
  generateInitialPrice() {
    return 50 + Math.random() * 950; // $50 - $1000
  }

  /**
   * Subscribe to symbol updates
   * @param {string} symbol - Stock/asset symbol
   * @param {Function} callback - Update callback
   */
  subscribe(symbol, callback) {
    if (!symbol) {
      return;
    }

    this.subscriptions.add(symbol.toUpperCase());

    if (callback) {
      this.updateCallbacks.push({ symbol, callback });
    }

    // Send subscription request (simulated)

    // Return initial data if available
    return this.priceData.get(symbol.toUpperCase());
  }

  /**
   * Unsubscribe from symbol
   */
  unsubscribe(symbol) {
    this.subscriptions.delete(symbol.toUpperCase());
    this.updateCallbacks = this.updateCallbacks.filter((cb) => cb.symbol !== symbol);
  }

  /**
   * Notify subscribers of price updates
   */
  notifySubscribers(symbol, data) {
    this.updateCallbacks.filter((cb) => cb.symbol === symbol).forEach((cb) => cb.callback(data));

    // Update UI
    this.updatePriceInUI(symbol, data);

    // Trigger event
    window.dispatchEvent(
      new CustomEvent('market-data-update', {
        detail: { symbol, data },
      }),
    );
  }

  /**
   * On connected handler
   */
  onConnected() {
    // Resubscribe to all symbols
    this.subscriptions.forEach((symbol) => {});
  }

  /**
   * Get latest price for symbol
   */
  getPrice(symbol) {
    return this.priceData.get(symbol.toUpperCase());
  }

  /**
   * Get multiple prices
   */
  getPrices(symbols) {
    return symbols.map((symbol) => ({
      symbol,
      data: this.getPrice(symbol),
    }));
  }

  /**
   * Create market data UI
   */
  createMarketDataUI() {
    // Add market data button
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) {
      return;
    }

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) {
      return;
    }

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) {
      return;
    }

    const marketBtn = document.createElement('button');
    marketBtn.id = 'marketDataBtn';
    marketBtn.className = 'btn-icon';
    marketBtn.title = 'Live Market Data';
    marketBtn.setAttribute('aria-label', 'Živá data trhu');
    marketBtn.style.cssText =
      'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border: none; border-radius: 8px; cursor: pointer; position: relative;';
    marketBtn.innerHTML =
      '📡 <span id="liveIndicator" style="position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; animation: pulse 2s infinite;"></span>';

    marketBtn.addEventListener('click', () => this.toggleMarketPanel());

    buttonContainer.appendChild(marketBtn);

    // Create market data panel
    this.createMarketPanel();

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create market data panel
   */
  createMarketPanel() {
    const panel = document.createElement('div');
    panel.id = 'marketDataPanel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: none;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>📡</span>
            <span>Live Market Data</span>
          </h3>
          <div style="display: flex; gap: 8px; align-items: center;">
            <div id="marketStatus" style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
              <div style="width: 8px; height: 8px; background: #2ecc71; border-radius: 50%;"></div>
              <span>Live</span>
            </div>
            <button id="closeMarketPanel" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: white;">✕</button>
          </div>
        </div>
      </div>
      
      <div style="padding: 12px;">
        <input 
          type="text" 
          id="symbolSearch" 
          placeholder="Search symbol (e.g., AAPL, GOOGL)..."
          style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem;"
        >
      </div>
      
      <div id="marketDataList" style="max-height: 450px; overflow-y: auto; padding: 8px;">
        <div style="padding: 40px 20px; text-align: center; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 12px;">📡</div>
          <div>Search for symbols or view portfolio prices</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.setupPanelListeners();
  }

  /**
   * Setup panel listeners
   */
  setupPanelListeners() {
    document.getElementById('closeMarketPanel')?.addEventListener('click', () => {
      this.toggleMarketPanel();
    });

    const searchInput = document.getElementById('symbolSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const symbol = e.target.value.trim().toUpperCase();
        if (symbol.length >= 2) {
          this.searchSymbol(symbol);
        }
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const symbol = e.target.value.trim().toUpperCase();
          if (symbol) {
            this.addSymbolToWatch(symbol);
            e.target.value = '';
          }
        }
      });
    }

    // Add event delegation for dynamic elements
    const list = document.getElementById('marketDataList');
    if (list) {
      list.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]');
        if (action) {
          const actionType = action.getAttribute('data-action');
          const symbol = action.getAttribute('data-symbol');

          if (actionType === 'add-symbol' && symbol) {
            this.addSymbolToWatch(symbol);
          } else if (actionType === 'unsubscribe' && symbol) {
            this.unsubscribe(symbol);
            this.renderWatchlist();
          }
        }
      });
    }
  }

  /**
   * Toggle market panel
   */
  toggleMarketPanel() {
    const panel = document.getElementById('marketDataPanel');
    const isVisible = panel.style.display !== 'none';

    panel.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
      this.loadPortfolioSymbols();
    }
  }

  /**
   * Load symbols from portfolio
   */
  loadPortfolioSymbols() {
    const data = window.getFondyData ? window.getFondyData() : [];

    data.forEach((item) => {
      const symbol = this.extractSymbol(item.název);
      if (symbol) {
        this.subscribe(symbol, (priceData) => {
          // Auto-update portfolio with live prices
          this.updatePortfolioPrice(item, priceData);
        });
      }
    });

    this.renderWatchlist();
  }

  /**
   * Extract symbol from asset name
   */
  extractSymbol(name) {
    // Try to extract ticker symbol from name
    // e.g., "Apple Inc. (AAPL)" -> "AAPL"
    const match = name?.match(/\(([A-Z]{1,5})\)/);
    return match ? match[1] : name?.substring(0, 5).toUpperCase();
  }

  /**
   * Search for symbol
   */
  searchSymbol(query) {
    // Simulate search results
    const suggestions = [
      'AAPL',
      'GOOGL',
      'MSFT',
      'AMZN',
      'TSLA',
      'META',
      'NVDA',
      'BRK.B',
      'JNJ',
      'V',
    ].filter((symbol) => symbol.includes(query));

    this.renderSearchResults(suggestions);
  }

  /**
   * Render search results
   */
  renderSearchResults(suggestions) {
    const list = document.getElementById('marketDataList');
    if (!list) {
      return;
    }

    if (suggestions.length === 0) {
      list.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #999;">
          No symbols found
        </div>
      `;
      return;
    }

    list.innerHTML = suggestions
      .map(
        (symbol) => `
      <div 
        data-action="add-symbol" data-symbol="${symbol}"
        style="
          padding: 12px;
          margin: 4px;
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.background='#e9ecef'"
        onmouseout="this.style.background='#f8f9fa'"
      >
        <div style="font-weight: 600; color: #333;">${symbol}</div>
        <div style="font-size: 0.85rem; color: #666;">Click to add to watchlist</div>
      </div>
    `,
      )
      .join('');
  }

  /**
   * Add symbol to watchlist
   */
  addSymbolToWatch(symbol) {
    this.subscribe(symbol);
    this.renderWatchlist();

    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(`Added ${symbol} to watchlist`, 'success');
    }
  }

  /**
   * Render watchlist
   */
  renderWatchlist() {
    const list = document.getElementById('marketDataList');
    if (!list) {
      return;
    }

    if (this.subscriptions.size === 0) {
      list.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 12px;">📡</div>
          <div>No symbols in watchlist</div>
        </div>
      `;
      return;
    }

    list.innerHTML = Array.from(this.subscriptions)
      .map((symbol) => this.renderPriceCard(symbol))
      .join('');
  }

  /**
   * Render price card
   */
  renderPriceCard(symbol) {
    const priceData = this.priceData.get(symbol) || {
      price: this.generateInitialPrice(),
      change: 0,
      changePercent: 0,
      volume: 0,
    };

    const isPositive = priceData.change >= 0;
    const color = isPositive ? '#2ecc71' : '#e74c3c';

    return `
      <div id="price-${symbol}" style="
        padding: 16px;
        margin: 8px;
        background: white;
        border: 1px solid #eee;
        border-left: 4px solid ${color};
        border-radius: 8px;
        transition: all 0.3s;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-weight: 600; font-size: 1.1rem; color: #333;">${symbol}</div>
            <div style="font-size: 0.85rem; color: #666; margin-top: 2px;">
              Vol: ${this.formatVolume(priceData.volume)}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 1.3rem; color: #333;">
              $${priceData.price.toFixed(2)}
            </div>
            <div style="font-size: 0.9rem; color: ${color}; margin-top: 2px;">
              ${isPositive ? '+' : ''}${priceData.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 0.8rem; color: #999;">
          <span>Bid: $${priceData.bid?.toFixed(2) || '-'}</span>
          <span>Ask: $${priceData.ask?.toFixed(2) || '-'}</span>
        </div>
        <button 
          data-action="unsubscribe" data-symbol('${symbol}'); window.marketDataFeed.renderWatchlist();"
          style="
            margin-top: 8px;
            padding: 6px 12px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            width: 100%;
          "
        >
          Remove
        </button>
      </div>
    `;
  }

  /**
   * Update price in UI
   */
  updatePriceInUI(symbol, data) {
    const card = document.getElementById(`price-${symbol}`);
    if (!card) {
      return;
    }

    const isPositive = data.change >= 0;
    const color = isPositive ? '#2ecc71' : '#e74c3c';

    // Highlight on update
    card.style.background = isPositive ? '#e8f5e9' : '#ffebee';
    setTimeout(() => {
      card.style.background = 'white';
    }, 300);

    // Update values
    card.querySelector('[style*="font-size: 1.3rem"]').textContent = `$${data.price.toFixed(2)}`;

    const changeEl = card.querySelector(`[style*="color: ${color}"]`);
    if (changeEl) {
      changeEl.textContent = `${isPositive ? '+' : ''}${data.changePercent.toFixed(2)}%`;
      changeEl.style.color = color;
    }
  }

  /**
   * Update portfolio price with live data
   */
  updatePortfolioPrice(item, priceData) {
    // Update item's current price
    if (item.aktuálníCena !== undefined) {
      item.aktuálníCena = priceData.price;

      // Recalculate current value
      const pocet = parseFloat(item.počet || 0);
      item.aktuálníHodnota = pocet * priceData.price;

      // Trigger portfolio update
      if (window.aktualizovatTabulku) {
        window.aktualizovatTabulku();
      }
    }
  }

  /**
   * Update connection status
   */
  updateConnectionStatus(isConnected) {
    const status = document.getElementById('marketStatus');
    if (status) {
      status.innerHTML = `
        <div style="width: 8px; height: 8px; background: ${isConnected ? '#2ecc71' : '#e74c3c'}; border-radius: 50%;"></div>
        <span>${isConnected ? 'Live' : 'Offline'}</span>
      `;
    }
  }

  /**
   * Format volume
   */
  formatVolume(volume) {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Global instance
window.marketDataFeed = new MarketDataFeed();

// Auto-start connection
window.marketDataFeed.connect();
