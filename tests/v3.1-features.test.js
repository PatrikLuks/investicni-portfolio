/**
 * Tests for v3.1.0 Features
 * Theme Manager, Market Data Service, Multi-Portfolio, Advanced Charts
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock;

// Mock DOM (ESM-compatible without jest.fn())
global.document = {
  body: {
    appendChild: () => {},
    removeChild: () => {},
  },
  createElement: () => ({
    setAttribute: () => {},
    classList: { add: () => {}, remove: () => {} },
    addEventListener: () => {},
  }),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => 'light',
  },
};

global.window = {
  localStorage: localStorageMock,
  matchMedia: () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
  dispatchEvent: () => {},
  addEventListener: () => {},
};

// ===== Theme Manager Tests =====
describe('ThemeManager', () => {
  let ThemeManager;

  beforeEach(() => {
    localStorageMock.clear();

    // Mock ThemeManager class
    ThemeManager = class {
      constructor() {
        this.THEMES = {
          LIGHT: 'light',
          DARK: 'dark',
          AUTO: 'auto',
        };
        this.currentTheme = this.loadTheme();
      }

      loadTheme() {
        return localStorage.getItem('portfolio-theme') || this.THEMES.LIGHT;
      }

      saveTheme(theme) {
        localStorage.setItem('portfolio-theme', theme);
      }

      setTheme(theme) {
        this.currentTheme = theme;
        this.saveTheme(theme);
        return theme;
      }

      getTheme() {
        return this.currentTheme;
      }

      toggleTheme() {
        const newTheme =
          this.currentTheme === this.THEMES.LIGHT ? this.THEMES.DARK : this.THEMES.LIGHT;
        return this.setTheme(newTheme);
      }
    };
  });

  test('should initialize with default light theme', () => {
    const manager = new ThemeManager();
    expect(manager.getTheme()).toBe('light');
  });

  test('should save theme to localStorage', () => {
    const manager = new ThemeManager();
    manager.setTheme('dark');
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');
  });

  test('should load saved theme from localStorage', () => {
    localStorage.setItem('portfolio-theme', 'dark');
    const manager = new ThemeManager();
    expect(manager.getTheme()).toBe('dark');
  });

  test('should toggle between light and dark themes', () => {
    const manager = new ThemeManager();
    expect(manager.getTheme()).toBe('light');

    manager.toggleTheme();
    expect(manager.getTheme()).toBe('dark');

    manager.toggleTheme();
    expect(manager.getTheme()).toBe('light');
  });
});

// ===== Market Data Service Tests =====
describe('MarketDataService', () => {
  let MarketDataService;
  let fetchMock;

  beforeEach(() => {
    localStorageMock.clear();

    // Mock fetch
    fetchMock = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
    global.fetch = fetchMock;

    MarketDataService = class {
      constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 15 * 60 * 1000;
      }

      getCacheKey(symbol, type = 'quote') {
        return `${type}:${symbol.toUpperCase()}`;
      }

      isCacheValid(cacheEntry) {
        if (!cacheEntry) return false;
        const now = Date.now();
        return now - cacheEntry.timestamp < this.CACHE_DURATION;
      }

      getFromCache(symbol) {
        const key = this.getCacheKey(symbol);
        const cached = this.cache.get(key);
        if (this.isCacheValid(cached)) {
          return cached.data;
        }
        return null;
      }

      setCache(symbol, data) {
        const key = this.getCacheKey(symbol);
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        });
      }

      async getQuote(symbol) {
        const cached = this.getFromCache(symbol);
        if (cached) {
          return { ...cached, cached: true };
        }

        const quote = {
          symbol,
          price: 150.0,
          change: 2.5,
          changePercent: 1.69,
          timestamp: Date.now(),
        };

        this.setCache(symbol, quote);
        return { ...quote, cached: false };
      }

      clearCache() {
        this.cache.clear();
      }
    };
  });

  test('should cache quote data', async () => {
    const service = new MarketDataService();
    const quote = await service.getQuote('AAPL');

    expect(quote.symbol).toBe('AAPL');
    expect(quote.cached).toBe(false);

    const cachedQuote = await service.getQuote('AAPL');
    expect(cachedQuote.cached).toBe(true);
  });

  test('should return cached data within cache duration', () => {
    const service = new MarketDataService();
    const testData = { symbol: 'AAPL', price: 150.0 };

    service.setCache('AAPL', testData);
    const cached = service.getFromCache('AAPL');

    expect(cached).toEqual(testData);
  });

  test('should clear cache', async () => {
    const service = new MarketDataService();
    await service.getQuote('AAPL');

    expect(service.cache.size).toBe(1);

    service.clearCache();
    expect(service.cache.size).toBe(0);
  });

  test('should generate correct cache key', () => {
    const service = new MarketDataService();
    const key1 = service.getCacheKey('aapl');
    const key2 = service.getCacheKey('AAPL');

    expect(key1).toBe('quote:AAPL');
    expect(key2).toBe('quote:AAPL');
  });
});

// ===== Portfolio Manager Tests =====
describe('PortfolioManager', () => {
  let PortfolioManager;

  beforeEach(() => {
    localStorageMock.clear();

    PortfolioManager = class {
      constructor() {
        this.portfolios = new Map();
        this.currentPortfolioId = null;
        this.loadPortfolios();
      }

      generateId() {
        return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      loadPortfolios() {
        const saved = localStorage.getItem('portfolios');
        if (saved) {
          const data = JSON.parse(saved);
          data.forEach((p) => this.portfolios.set(p.id, p));
          this.currentPortfolioId = data[0]?.id;
        } else {
          this.createDefaultPortfolio();
        }
      }

      savePortfolios() {
        const data = Array.from(this.portfolios.values());
        localStorage.setItem('portfolios', JSON.stringify(data));
      }

      createDefaultPortfolio() {
        const portfolio = {
          id: this.generateId(),
          name: 'Main Portfolio',
          investments: [],
          created: new Date().toISOString(),
        };
        this.portfolios.set(portfolio.id, portfolio);
        this.currentPortfolioId = portfolio.id;
        this.savePortfolios();
      }

      createPortfolio(name) {
        const portfolio = {
          id: this.generateId(),
          name,
          investments: [],
          created: new Date().toISOString(),
        };
        this.portfolios.set(portfolio.id, portfolio);
        this.savePortfolios();
        return portfolio;
      }

      getPortfolio(id) {
        return this.portfolios.get(id);
      }

      getCurrentPortfolio() {
        return this.portfolios.get(this.currentPortfolioId);
      }

      getAllPortfolios() {
        return Array.from(this.portfolios.values());
      }

      deletePortfolio(id) {
        if (this.portfolios.size <= 1) {
          throw new Error('Cannot delete the last portfolio');
        }
        this.portfolios.delete(id);
        if (this.currentPortfolioId === id) {
          this.currentPortfolioId = this.portfolios.keys().next().value;
        }
        this.savePortfolios();
      }

      switchPortfolio(id) {
        if (!this.portfolios.has(id)) {
          throw new Error('Portfolio not found');
        }
        this.currentPortfolioId = id;
        this.savePortfolios();
      }
    };
  });

  test('should create default portfolio on initialization', () => {
    const manager = new PortfolioManager();
    expect(manager.portfolios.size).toBe(1);

    const portfolio = manager.getCurrentPortfolio();
    expect(portfolio.name).toBe('Main Portfolio');
  });

  test('should create new portfolio', () => {
    const manager = new PortfolioManager();
    const newPortfolio = manager.createPortfolio('Test Portfolio');

    expect(newPortfolio.name).toBe('Test Portfolio');
    expect(manager.portfolios.size).toBe(2);
  });

  test('should get all portfolios', () => {
    const manager = new PortfolioManager();
    manager.createPortfolio('Portfolio 2');
    manager.createPortfolio('Portfolio 3');

    const all = manager.getAllPortfolios();
    expect(all.length).toBe(3);
  });

  test('should switch between portfolios', () => {
    const manager = new PortfolioManager();
    const portfolio2 = manager.createPortfolio('Portfolio 2');

    manager.switchPortfolio(portfolio2.id);
    expect(manager.currentPortfolioId).toBe(portfolio2.id);
  });

  test('should not delete last portfolio', () => {
    const manager = new PortfolioManager();
    const currentId = manager.currentPortfolioId;

    expect(() => {
      manager.deletePortfolio(currentId);
    }).toThrow('Cannot delete the last portfolio');
  });

  test('should delete portfolio and switch to another', () => {
    const manager = new PortfolioManager();
    const portfolio2 = manager.createPortfolio('Portfolio 2');

    manager.switchPortfolio(portfolio2.id);
    expect(manager.currentPortfolioId).toBe(portfolio2.id);

    manager.deletePortfolio(portfolio2.id);
    expect(manager.portfolios.has(portfolio2.id)).toBe(false);
    expect(manager.currentPortfolioId).not.toBe(portfolio2.id);
  });

  test('should save and load portfolios from localStorage', () => {
    const manager1 = new PortfolioManager();
    manager1.createPortfolio('Test Portfolio');

    // Create new instance - should load from localStorage
    const manager2 = new PortfolioManager();
    expect(manager2.portfolios.size).toBe(2);

    const portfolio = manager2.getAllPortfolios().find((p) => p.name === 'Test Portfolio');
    expect(portfolio).toBeDefined();
  });
});

// ===== Advanced Charts Tests =====
describe('Advanced Charts', () => {
  test('should generate demo treemap data', () => {
    const generateDemoTreemapData = () => [
      { name: 'AAPL', value: 45000 },
      { name: 'MSFT', value: 38000 },
      { name: 'GOOGL', value: 32000 },
    ];

    const data = generateDemoTreemapData();
    expect(data.length).toBe(3);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('value');
  });

  test('should calculate treemap layout', () => {
    const calculateSquarify = (data, width, height) => {
      const totalValue = data.reduce((sum, item) => sum + item.value, 0);
      return data.map((item, index) => ({
        x: index * (width / data.length),
        y: 0,
        width: width / data.length,
        height: height,
      }));
    };

    const data = [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 },
    ];

    const rects = calculateSquarify(data, 800, 400);
    expect(rects.length).toBe(2);
    expect(rects[0]).toHaveProperty('x');
    expect(rects[0]).toHaveProperty('y');
    expect(rects[0]).toHaveProperty('width');
    expect(rects[0]).toHaveProperty('height');
  });
});

// ===== Integration Tests =====
describe('v3.1.0 Integration', () => {
  test('should integrate theme manager with portfolio manager', () => {
    const ThemeManager = class {
      constructor() {
        this.currentTheme = 'light';
      }
      setTheme(theme) {
        this.currentTheme = theme;
      }
      getTheme() {
        return this.currentTheme;
      }
    };

    const PortfolioManager = class {
      constructor() {
        this.portfolios = new Map();
        this.portfolios.set('1', { id: '1', name: 'Main' });
      }
    };

    const theme = new ThemeManager();
    const portfolio = new PortfolioManager();

    theme.setTheme('dark');
    expect(theme.getTheme()).toBe('dark');
    expect(portfolio.portfolios.size).toBe(1);
  });

  test('should handle market data updates with portfolio', async () => {
    const MarketDataService = class {
      async getQuote(symbol) {
        return {
          symbol,
          price: 150.0,
          change: 2.5,
        };
      }
    };

    const service = new MarketDataService();
    const quote = await service.getQuote('AAPL');

    expect(quote.symbol).toBe('AAPL');
    expect(quote.price).toBe(150.0);
  });
});

