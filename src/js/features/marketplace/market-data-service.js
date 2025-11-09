/**
 * Market Data Service - Real-Time Stock Quotes
 * Version: 3.1.0
 * Multi-provider API integration with fallback and caching
 */

class MarketDataService {
  constructor() {
    this.providers = {
      yahoo: {
        name: 'Yahoo Finance',
        baseUrl: 'https://query1.finance.yahoo.com',
        enabled: true,
        priority: 1,
      },
      alphavantage: {
        name: 'Alpha Vantage',
        baseUrl: 'https://www.alphavantage.co',
        enabled: false,
        priority: 2,
        apiKey: null, // User must provide
      },
      finnhub: {
        name: 'Finnhub',
        baseUrl: 'https://finnhub.io',
        enabled: false,
        priority: 3,
        apiKey: null, // User must provide
      },
    };

    this.cache = new Map();
    this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    this.rateLimits = new Map();
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 1000;

    this.loadApiKeys();

    // Show CORS warning once
    if (!localStorage.getItem('corsWarningShown')) {
      setTimeout(() => {
        if (window.notificationSystem) {
          window.notificationSystem.showInAppNotification(
            'Development Mode',
            'info',
            'Using mock market data due to CORS restrictions. For production, configure a backend proxy.'
          );
        }
        localStorage.setItem('corsWarningShown', 'true');
      }, 2000);
    }
  }

  loadApiKeys() {
    const saved = localStorage.getItem('marketDataApiKeys');
    if (saved) {
      try {
        const keys = JSON.parse(saved);
        if (keys.alphavantage) {
          this.providers.alphavantage.apiKey = keys.alphavantage;
          this.providers.alphavantage.enabled = true;
        }
        if (keys.finnhub) {
          this.providers.finnhub.apiKey = keys.finnhub;
          this.providers.finnhub.enabled = true;
        }
      } catch (e) {
        console.error('Failed to load API keys:', e);
      }
    }
  }

  saveApiKeys(keys) {
    localStorage.setItem('marketDataApiKeys', JSON.stringify(keys));
    this.loadApiKeys();
  }

  getCacheKey(symbol, type = 'quote') {
    return `${type}:${symbol.toUpperCase()}`;
  }

  isCacheValid(cacheEntry) {
    if (!cacheEntry) {
      return false;
    }
    const now = Date.now();
    return now - cacheEntry.timestamp < this.CACHE_DURATION;
  }

  getFromCache(symbol, type = 'quote') {
    const key = this.getCacheKey(symbol, type);
    const cached = this.cache.get(key);

    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    return null;
  }

  setCache(symbol, data, type = 'quote') {
    const key = this.getCacheKey(symbol, type);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  checkRateLimit(provider) {
    const now = Date.now();
    const limit = this.rateLimits.get(provider);

    if (!limit) {
      this.rateLimits.set(provider, { count: 1, resetTime: now + 60000 });
      return true;
    }

    if (now > limit.resetTime) {
      this.rateLimits.set(provider, { count: 1, resetTime: now + 60000 });
      return true;
    }

    if (limit.count >= 60) {
      // Max 60 requests per minute
      return false;
    }

    limit.count++;
    return true;
  }

  async fetchWithRetry(url, options = {}, retries = this.MAX_RETRIES) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async fetchYahooFinance(symbol) {
    // In development, use Vite proxy to bypass CORS
    const isDev =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const baseUrl = isDev
      ? '/api/yahoo' // Use Vite proxy in dev
      : this.providers.yahoo.baseUrl; // Use direct URL in production

    const url = `${baseUrl}/v8/finance/chart/${symbol}`;

    try {
      const data = await this.fetchWithRetry(url);

      if (!data.chart || !data.chart.result || !data.chart.result[0]) {
        throw new Error('Invalid response format');
      }

      const result = data.chart.result[0];
      const quote = result.meta;
      const indicators = result.indicators.quote[0];

      return {
        symbol: symbol,
        price: quote.regularMarketPrice,
        previousClose: quote.previousClose,
        change: quote.regularMarketPrice - quote.previousClose,
        changePercent:
          ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100,
        volume: quote.regularMarketVolume,
        marketState: quote.marketState,
        currency: quote.currency,
        timestamp: Date.now(),
        source: 'yahoo',
      };
    } catch (error) {
      throw new Error(`Yahoo Finance error: ${error.message}`);
    }
  }

  async fetchAlphaVantage(symbol) {
    if (!this.providers.alphavantage.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const url = `${this.providers.alphavantage.baseUrl}/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.providers.alphavantage.apiKey}`;

    try {
      const data = await this.fetchWithRetry(url);

      if (!data['Global Quote']) {
        throw new Error('Invalid response format');
      }

      const quote = data['Global Quote'];

      return {
        symbol: symbol,
        price: parseFloat(quote['05. price']),
        previousClose: parseFloat(quote['08. previous close']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        timestamp: Date.now(),
        source: 'alphavantage',
      };
    } catch (error) {
      throw new Error(`Alpha Vantage error: ${error.message}`);
    }
  }

  async fetchFinnhub(symbol) {
    if (!this.providers.finnhub.apiKey) {
      throw new Error('Finnhub API key not configured');
    }

    const url = `${this.providers.finnhub.baseUrl}/api/v1/quote?symbol=${symbol}&token=${this.providers.finnhub.apiKey}`;

    try {
      const data = await this.fetchWithRetry(url);

      if (!data.c) {
        throw new Error('Invalid response format');
      }

      return {
        symbol: symbol,
        price: data.c, // Current price
        previousClose: data.pc, // Previous close
        change: data.d, // Change
        changePercent: data.dp, // Change percent
        high: data.h, // High
        low: data.l, // Low
        open: data.o, // Open
        timestamp: data.t * 1000, // Convert to milliseconds
        source: 'finnhub',
      };
    } catch (error) {
      throw new Error(`Finnhub error: ${error.message}`);
    }
  }

  async getQuote(symbol) {
    // 1. Check cache first
    const cached = this.getFromCache(symbol);
    if (cached) {
      return { ...cached, cached: true };
    }

    // 2. Get enabled providers sorted by priority
    const enabledProviders = Object.entries(this.providers)
      .filter(([_, provider]) => provider.enabled)
      .sort((a, b) => a[1].priority - b[1].priority);

    // 3. Try each provider in order
    const errors = [];

    for (const [name, provider] of enabledProviders) {
      // Check rate limit
      if (!this.checkRateLimit(name)) {
        errors.push(`${provider.name}: Rate limit exceeded`);
        continue;
      }

      try {
        let quote;

        switch (name) {
          case 'yahoo':
            quote = await this.fetchYahooFinance(symbol);
            break;
          case 'alphavantage':
            quote = await this.fetchAlphaVantage(symbol);
            break;
          case 'finnhub':
            quote = await this.fetchFinnhub(symbol);
            break;
        }

        // Cache successful result
        this.setCache(symbol, quote);
        return { ...quote, cached: false };
      } catch (error) {
        errors.push(`${provider.name}: ${error.message}`);
        continue; // Try next provider
      }
    }

    // All providers failed
    throw new Error(`All providers failed:\n${errors.join('\n')}`);
  }

  async getBatchQuotes(symbols) {
    const promises = symbols.map((symbol) =>
      this.getQuote(symbol).catch((error) => ({
        symbol,
        error: error.message,
      }))
    );

    return Promise.all(promises);
  }

  async searchSymbol(query) {
    // Note: Yahoo Finance API has CORS restrictions
    // For production, use a backend proxy server
    // For now, return mock data for development

    // Log warning only once per session
    if (!window._marketDataWarningShown) {
      console.warn('⚠️ Yahoo Finance API blocked by CORS. Using mock data for development.');
      console.info('💡 For production: Set up a backend proxy server to access Yahoo Finance API');
      window._marketDataWarningShown = true;
    }

    // Mock data for common symbols
    const mockResults = {
      aapl: [{ symbol: 'AAPL', name: 'Apple Inc.', type: 'EQUITY', exchange: 'NASDAQ' }],
      google: [
        { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', type: 'EQUITY', exchange: 'NASDAQ' },
        { symbol: 'GOOG', name: 'Alphabet Inc. Class C', type: 'EQUITY', exchange: 'NASDAQ' },
      ],
      msft: [{ symbol: 'MSFT', name: 'Microsoft Corporation', type: 'EQUITY', exchange: 'NASDAQ' }],
      tsla: [{ symbol: 'TSLA', name: 'Tesla, Inc.', type: 'EQUITY', exchange: 'NASDAQ' }],
      amzn: [{ symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'EQUITY', exchange: 'NASDAQ' }],
      meta: [{ symbol: 'META', name: 'Meta Platforms, Inc.', type: 'EQUITY', exchange: 'NASDAQ' }],
      nvda: [{ symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'EQUITY', exchange: 'NASDAQ' }],
    };

    const searchKey = query.toLowerCase();

    // Try exact match first
    if (mockResults[searchKey]) {
      return mockResults[searchKey];
    }

    // Try partial match
    const matches = [];
    for (const [key, value] of Object.entries(mockResults)) {
      if (
        key.includes(searchKey) ||
        value.some(
          (item) =>
            item.symbol.toLowerCase().includes(searchKey) ||
            item.name.toLowerCase().includes(searchKey)
        )
      ) {
        matches.push(...value);
      }
    }

    if (matches.length > 0) {
      return matches;
    }

    // Return empty if no match
    return [];
  }

  clearCache() {
    this.cache.clear();
  }

  getProviderStatus() {
    return Object.entries(this.providers).map(([key, provider]) => ({
      name: provider.name,
      enabled: provider.enabled,
      hasApiKey: !!provider.apiKey,
      priority: provider.priority,
    }));
  }
}

// Auto-update service
class AutoUpdateService {
  constructor(marketDataService) {
    this.marketDataService = marketDataService;
    this.updateInterval = 15 * 60 * 1000; // 15 minutes
    this.isRunning = false;
    this.intervalId = null;
  }

  start(symbols) {
    if (this.isRunning) {
      return;
    }

    this.symbols = symbols;
    this.isRunning = true;

    // Initial update
    this.update();

    // Schedule periodic updates
    this.intervalId = setInterval(() => {
      this.update();
    }, this.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  async update() {
    if (!this.symbols || this.symbols.length === 0) {
      return;
    }

    try {
      const quotes = await this.marketDataService.getBatchQuotes(this.symbols);

      // Dispatch event with updated quotes
      window.dispatchEvent(
        new CustomEvent('marketDataUpdate', {
          detail: { quotes },
        })
      );

      // Show notification
      if (typeof showToast === 'function') {
        showToast('Market data updated', 'info');
      }
    } catch (error) {
      console.error('Auto-update failed:', error);
    }
  }

  setUpdateInterval(minutes) {
    this.updateInterval = minutes * 60 * 1000;

    if (this.isRunning) {
      this.stop();
      this.start(this.symbols);
    }
  }
}

// Initialize services
window.marketDataService = new MarketDataService();
window.autoUpdateService = new AutoUpdateService(window.marketDataService);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MarketDataService, AutoUpdateService };
}
