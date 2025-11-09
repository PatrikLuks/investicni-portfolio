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
      })
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
   * Get top gainers
   */
  getTopGainers(limit = 5) {
    return Array.from(this.priceData.entries())
      .sort((a, b) => (b[1].changePercent || 0) - (a[1].changePercent || 0))
      .slice(0, limit)
      .map(([symbol, data]) => ({ symbol, ...data }));
  }

  /**
   * Get top losers
   */
  getTopLosers(limit = 5) {
    return Array.from(this.priceData.entries())
      .sort((a, b) => (a[1].changePercent || 0) - (b[1].changePercent || 0))
      .slice(0, limit)
      .map(([symbol, data]) => ({ symbol, ...data }));
  }

  /**
   * Get market statistics
   */
  getMarketStats() {
    if (this.priceData.size === 0) {
      return null;
    }

    const prices = Array.from(this.priceData.values());
    const avgChange = prices.reduce((sum, p) => sum + (p.changePercent || 0), 0) / prices.length;
    const gainers = prices.filter((p) => p.changePercent > 0).length;
    const losers = prices.filter((p) => p.changePercent < 0).length;
    const totalVolume = prices.reduce((sum, p) => sum + (p.volume || 0), 0);

    return {
      avgChange,
      gainers,
      losers,
      totalVolume,
      total: prices.length,
    };
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
    marketBtn.style.cssText = `
      font-size: 1rem;
      padding: 10px 18px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      position: relative;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    `;
    marketBtn.innerHTML = `
      <span>�</span>
      <span>Market</span>
      <div id="liveIndicator" style="
        width: 8px;
        height: 8px;
        background: #2ecc71;
        border-radius: 50%;
        animation: pulse 2s infinite;
        margin-left: 4px;
      "></div>
    `;

    marketBtn.addEventListener('mouseenter', () => {
      marketBtn.style.transform = 'translateY(-2px)';
      marketBtn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
    });

    marketBtn.addEventListener('mouseleave', () => {
      marketBtn.style.transform = 'translateY(0)';
      marketBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
    });

    marketBtn.addEventListener('click', () => this.toggleMarketPanel());

    buttonContainer.appendChild(marketBtn);

    // Create market data panel
    this.createMarketPanel();

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(102, 126, 234, 0); }
        50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
      }
      
      #marketDataPanel {
        animation: slideIn 0.3s ease-out;
      }
      
      #marketDataPanel [id^="price-"] {
        animation: slideIn 0.3s ease-out;
      }
      
      #marketDataPanel #symbolSearch:focus {
        animation: glow 2s ease-in-out;
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
      width: 420px;
      max-height: 680px;
      background: var(--card-background);
      color: var(--text-primary);
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 1002;
      display: none;
      overflow: hidden;
      backdrop-filter: blur(10px);
    `;

    panel.innerHTML = `
      <div style="
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom: 2px solid rgba(255,255,255,0.1);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 12px; font-size: 1.3rem; font-weight: 700;">
            <span style="font-size: 1.5rem;">�</span>
            <span>Live Market Data</span>
          </h3>
          <button id="closeMarketPanel" style="
            background: rgba(255,255,255,0.2);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            color: white;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
        </div>
        <div id="marketStatus" style="
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          opacity: 0.95;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #2ecc71;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <span>Live Updates • 2s refresh</span>
        </div>
      </div>
      
      <div style="padding: 16px; background: var(--background);">
        <div style="position: relative;">
          <input 
            type="text" 
            id="symbolSearch" 
            placeholder="Search symbol (AAPL, GOOGL, BTC...)..."
            style="
              width: 100%;
              padding: 12px 16px 12px 40px;
              border: 2px solid var(--border-color);
              border-radius: 10px;
              font-size: 0.95rem;
              background: var(--card-background);
              color: var(--text-primary);
              transition: all 0.2s;
            "
            onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102,126,234,0.1)'"
            onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none'"
          >
          <span style="
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1rem;
          ">🔍</span>
        </div>
      </div>
      
      <div id="marketDataList" style="
        max-height: 520px;
        overflow-y: auto;
        padding: 12px;
        background: var(--background);
      ">
        <div style="
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
        ">
          <div style="font-size: 3.5rem; margin-bottom: 16px; opacity: 0.3;">�</div>
          <div style="font-size: 1rem; font-weight: 600;">Market Ready</div>
          <div style="font-size: 0.9rem; margin-top: 8px; opacity: 0.7;">Search symbols or browse trending assets</div>
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 20px;
          ">
            <button onclick="window.marketDataFeed.showTrendingSymbols()" style="
              padding: 12px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              transition: all 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              🔥 Trending
            </button>
            <button onclick="window.marketDataFeed.showTopGainers()" style="
              padding: 12px;
              background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              transition: all 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              📈 Top Gainers
            </button>
          </div>
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
    // Read from localStorage like market-data-ui.js does
    try {
      const portfolio = JSON.parse(localStorage.getItem('investmentPortfolio') || '[]');

      // portfolio contains: { name, producer, investmentDate, investment, value }
      // Extract symbols from fund names
      portfolio.forEach((item) => {
        // Try to extract ticker from fund name (e.g., "Apple (AAPL)" -> "AAPL")
        const symbol = this.extractSymbol(item.name || item.producer || '');
        if (symbol && symbol.length > 0) {
          this.subscribe(symbol, (priceData) => {
            // Auto-update portfolio with live prices
            this.updatePortfolioPrice(item, priceData);
          });
        }
      });
    } catch (e) {
      console.error('Failed to load portfolio symbols:', e);
    }

    this.renderWatchlist();
  }

  /**
   * Extract symbol from asset name
   */
  extractSymbol(name) {
    if (!name) {
      return null;
    }

    // Try to extract ticker symbol from name
    // e.g., "Apple Inc. (AAPL)" -> "AAPL"
    const match = name.match(/\(([A-Z]{1,5})\)/);
    if (match && match[1]) {
      return match[1];
    }

    // If no ticker found, create from first letters of words
    // e.g., "Conseq Invest Akcie Nové" -> "CIAN"
    const words = name.split(/\s+/).filter((w) => w.length > 0);
    if (words.length > 0) {
      let symbol = words
        .slice(0, 4)
        .map((w) => w[0].toUpperCase())
        .join('');
      if (symbol.length >= 2 && symbol.length <= 5) {
        return symbol;
      }
    }

    // Fallback: first 2-5 characters uppercase
    const fallback = name
      .substring(0, 5)
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    return fallback.length >= 2 ? fallback : null;
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
        <div style="
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
        ">
          <div style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4;">🔍</div>
          <div style="font-weight: 500;">No symbols found</div>
          <div style="font-size: 0.85rem; margin-top: 8px; opacity: 0.6;">Try a different search term</div>
        </div>
      `;
      return;
    }

    list.innerHTML = suggestions
      .map(
        (symbol) => `
      <div 
        onclick="window.marketDataFeed.addSymbolToWatch('${symbol}');"
        style="
          padding: 14px 16px;
          margin: 6px 0;
          background: var(--card-background);
          border: 2px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 12px;
        "
        onmouseover="this.style.borderColor='#667eea'; this.style.background='rgba(102, 126, 234, 0.05)'; this.style.transform='translateX(4px)'"
        onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--card-background)'; this.style.transform='translateX(0)'"
      >
        <span style="font-size: 1.2rem;">📊</span>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: var(--text-primary); font-size: 1rem; letter-spacing: 0.5px;">${symbol}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Click to add to watchlist</div>
        </div>
        <span style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          font-size: 1.2rem;
        ">+</span>
      </div>
    `
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
   * Show trending symbols
   */
  showTrendingSymbols() {
    const trending = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
    trending.forEach((symbol) => {
      if (!this.priceData.has(symbol)) {
        this.priceData.set(symbol, {
          symbol,
          price: this.generateInitialPrice(),
          change: (Math.random() - 0.5) * 5,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 5000000),
          bid: 0,
          ask: 0,
          high: 0,
          low: 0,
          open: 0,
        });
      }
    });

    this.renderSearchResults(trending);
  }

  /**
   * Show top gainers
   */
  showTopGainers() {
    const gainers = this.getTopGainers(8);
    const list = document.getElementById('marketDataList');
    
    if (!list || gainers.length === 0) {
      this.showTrendingSymbols();
      return;
    }

    list.innerHTML = gainers
      .map((data) => this.renderPriceCard(data.symbol))
      .join('');
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
        <div style="
          padding: 60px 20px;
          text-align: center;
          color: var(--text-secondary);
        ">
          <div style="font-size: 4rem; margin-bottom: 16px; opacity: 0.3;">�</div>
          <div style="font-size: 1rem; font-weight: 500;">No symbols in watchlist</div>
          <div style="font-size: 0.85rem; margin-top: 8px; opacity: 0.7;">Search and add symbols above to get started</div>
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
    const bgColor = isPositive ? 'rgba(46, 204, 113, 0.08)' : 'rgba(231, 76, 60, 0.08)';
    const borderColor = isPositive ? '#2ecc71' : '#e74c3c';
    const textColor = isPositive ? '#27ae60' : '#c0392b';

    return `
      <div id="price-${symbol}" style="
        padding: 16px;
        margin: 8px 0;
        background: ${bgColor};
        border: 2px solid ${borderColor};
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--text-primary);
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 2s infinite;
          pointer-events: none;
        "></div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 1;">
          <div style="flex: 1;">
            <div style="
              font-weight: 700;
              font-size: 1.2rem;
              color: var(--text-primary);
              letter-spacing: 0.5px;
            ">${symbol}</div>
            <div style="
              font-size: 0.8rem;
              color: var(--text-secondary);
              margin-top: 4px;
              display: flex;
              gap: 12px;
            ">
              <span>Vol: ${this.formatVolume(priceData.volume)}</span>
            </div>
          </div>
          
          <div style="text-align: right;">
            <div style="
              font-weight: 700;
              font-size: 1.4rem;
              color: ${textColor};
              letter-spacing: -0.5px;
            ">
              $${priceData.price.toFixed(2)}
            </div>
            <div style="
              font-size: 0.95rem;
              font-weight: 600;
              color: ${textColor};
              margin-top: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
              justify-content: flex-end;
            ">
              <span>${isPositive ? '▲' : '▼'}</span>
              <span>${isPositive ? '+' : ''}${priceData.changePercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid ${borderColor}33;
          font-size: 0.8rem;
          color: var(--text-secondary);
          position: relative;
          z-index: 1;
        ">
          <div>
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Bid</div>
            <div style="color: ${textColor}; font-weight: 500;">$${priceData.bid?.toFixed(2) || '-'}</div>
          </div>
          <div>
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Ask</div>
            <div style="color: ${textColor}; font-weight: 500;">$${priceData.ask?.toFixed(2) || '-'}</div>
          </div>
        </div>
        
        <button 
          onclick="window.marketDataFeed.unsubscribe('${symbol}'); window.marketDataFeed.renderWatchlist();"
          style="
            margin-top: 12px;
            padding: 8px 14px;
            background: ${textColor};
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 600;
            width: 100%;
            transition: all 0.2s;
            position: relative;
            z-index: 2;
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px ${textColor}40'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
        >
          × Remove from watchlist
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

    try {
      const isPositive = data.change >= 0;
      const textColor = isPositive ? '#27ae60' : '#c0392b';
      const bgColor = isPositive ? 'rgba(46, 204, 113, 0.08)' : 'rgba(231, 76, 60, 0.08)';

      // Update background for highlight
      card.style.background = bgColor;

      // Find all text elements in the card and update appropriately
      const allDivs = card.querySelectorAll('div');
      
      // Update price (find the one with $)
      allDivs.forEach((div) => {
        if (div.textContent.includes('$') && div.textContent.length < 20) {
          const currentText = div.textContent;
          if (currentText.includes('.')) {
            div.textContent = `$${data.price.toFixed(2)}`;
            div.style.color = textColor;
          }
        }
      });

      // Update percentage change
      allDivs.forEach((div) => {
        if (div.textContent.includes('%') && div.textContent.length < 15) {
          const changeText = `${isPositive ? '▲' : '▼'} ${isPositive ? '+' : ''}${data.changePercent.toFixed(2)}%`;
          div.textContent = changeText;
          div.style.color = textColor;
        }
      });

      // Update volume
      allDivs.forEach((div) => {
        if (div.textContent.includes('Vol:')) {
          div.textContent = `Vol: ${this.formatVolume(data.volume)}`;
        }
      });

    } catch (error) {
      console.error(`❌ Error updating price for ${symbol}:`, error);
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
