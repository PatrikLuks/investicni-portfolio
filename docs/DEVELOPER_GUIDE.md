# Developer Guide - Portfolio Manager Pro v3.0

## 🏗️ Architecture Overview

Portfolio Manager Pro is built as a **client-side single-page application (SPA)** with modular architecture.

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js v4.4.0
- **Export**: jsPDF, SheetJS
- **Search**: Fuse.js
- **Storage**: Browser LocalStorage
- **PWA**: Service Worker, Web Manifest

### Architecture Pattern: **Modular Monolith**

```
┌─────────────────────────────────────────────────────────┐
│                   investPortfolio.html                   │
│              (Main Entry Point & UI Shell)               │
└──────────────────┬──────────────────────────────────────┘
                   │
          ┌────────┴────────┐
          │     app.js      │ (Core Application Logic)
          └────────┬────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
┌────▼────┐  ┌────▼────┐  ┌────▼────┐
│ Storage │  │Business │  │   UI    │
│ Layer   │  │ Logic   │  │  Layer  │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     │            │            │
┌────▼────────────▼────────────▼────┐
│       Utility Modules              │
│  • calculations-engine.js          │
│  • charts-manager.js               │
│  • error-handler.js                │
│  • data-validation.js              │
│  • search-engine.js                │
│  • pdf-export.js                   │
│  • excel-export.js                 │
└────────────────────────────────────┘
```

---

## 📂 Project Structure

```
investicni-portfolio/
├── Core Application
│   ├── investPortfolio.html     # Main entry point
│   ├── app.js                   # Core application logic (2745 lines)
│   └── manifest.json            # PWA manifest
│
├── Business Logic Modules
│   ├── calculations-engine.js   # Financial calculations (ROI, CAGR, Sharpe)
│   ├── portfolio-optimizer.js   # MPT optimization
│   ├── market-data.js          # Market data fetching
│   └── ai-insights.js          # ML predictions
│
├── UI & Interaction
│   ├── charts-manager.js       # Chart.js integration
│   ├── dashboard-builder.js    # Dynamic dashboard
│   ├── search-engine.js        # Fuzzy search
│   ├── drag-drop.js           # Drag & drop
│   └── keyboard-shortcuts-overlay.js
│
├── Data & Storage
│   ├── data-validation.js      # Input validation
│   ├── auto-save.js           # Auto-save mechanism
│   ├── version-control.js     # Version management
│   └── cloud-backup.js        # Cloud integration
│
├── Export & Reports
│   ├── pdf-export.js          # PDF generation
│   ├── excel-export.js        # Excel export
│   └── advanced-analytics.js  # Analytics reports
│
├── Utilities
│   ├── error-handler.js       # Global error handling
│   ├── performance-monitor.js # Performance tracking
│   ├── notification-system.js # Toast notifications
│   └── library-loader.js      # Lazy loading
│
├── Styles
│   ├── accessibility.css
│   ├── charts-styles.css
│   ├── dashboard-styles.css
│   └── [other CSS modules]
│
├── Testing
│   ├── tests/
│   │   ├── setup.js
│   │   ├── calculations-engine.test.js
│   │   ├── error-handler.test.js
│   │   └── integration.test.js
│   └── jest.config.js
│
├── Deployment
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── DEPLOY.sh
│   └── .github/workflows/ci-cd.yml
│
└── Documentation
    ├── README.md
    ├── SECURITY.md
    ├── USER_GUIDE.md
    └── [30+ other docs]
```

---

## 🔧 Core Modules

### 1. app.js - Core Application

**Responsibilities:**
- DOM manipulation
- Event handling
- Application state management
- Portfolio data CRUD operations
- Form handling
- Report generation

**Key Classes:**
```javascript
class PortfolioStorage {
  // Handles localStorage operations
  saveData(data)
  loadData()
  saveClient(client)
  loadClient()
  clearAll()
}
```

**Key Functions:**
```javascript
// Portfolio management
function addFond(fondData)
function updateFond(index, field, value)
function deleteFond(index)
function updateFondList()

// Report generation
function generatePortfolioHTML(portfolioData)
function exportToExcel()
function exportToPDF()

// UI updates
function updateDashboard()
function showToast(type, title, message)
function showConfirmDialog(title, message, onConfirm)
```

### 2. calculations-engine.js - Financial Calculations

**Features:**
- ROI (Return on Investment)
- CAGR (Compound Annual Growth Rate)
- Sharpe Ratio
- Volatility (Standard Deviation)
- Beta Coefficient
- Maximum Drawdown
- Statistical functions

**Example Usage:**
```javascript
const engine = new CalculationsEngine();

// Calculate ROI
const roi = engine.calculateROI(position);

// Calculate portfolio CAGR
const cagr = engine.calculatePortfolioCAGR(portfolioData);

// Calculate Sharpe Ratio
const sharpe = engine.calculateSharpeRatio(returns, 0.02);
```

### 3. charts-manager.js - Data Visualization

**Features:**
- Pie/Doughnut charts (allocation)
- Bar charts (holdings, P&L)
- Line charts (performance)
- Interactive zoom/pan
- Export to PNG

**Example Usage:**
```javascript
const chartsManager = new AdvancedChartsManager();

// Create allocation chart
chartsManager.createAllocationChart(data, 'chartContainer');

// Create performance chart
chartsManager.createPerformanceChart(data, 'perfContainer');
```

### 4. error-handler.js - Error Management

**Features:**
- Global error catching
- Promise rejection handling
- Error logging
- User-friendly messages
- Error recovery
- Rate limiting

**Example Usage:**
```javascript
const errorHandler = new ErrorHandler();

// Errors are caught automatically
// Manual error handling:
try {
  riskyOperation();
} catch (error) {
  errorHandler.handleError({
    message: error.message,
    type: 'custom',
    error: error
  });
}
```

---

## 🔄 Data Flow

### Adding a Transaction

```
User Input (Form)
    ↓
Form Validation (data-validation.js)
    ↓
Create Fund Object
    ↓
Add to portfolioData Array
    ↓
Save to localStorage (PortfolioStorage)
    ↓
Update UI (updateFondList)
    ↓
Recalculate Metrics (calculations-engine.js)
    ↓
Update Dashboard (updateDashboard)
    ↓
Update Charts (charts-manager.js)
    ↓
Show Success Toast
```

### Generating a Report

```
User Clicks "Generate Report"
    ↓
Collect Portfolio Data
    ↓
Calculate All Metrics
    ↓
Generate HTML Template
    ↓
Embed Charts (Chart.js CDN)
    ↓
Apply Styling
    ↓
Create Blob
    ↓
Trigger Download
```

---

## 🎨 Styling Architecture

### CSS Modules Structure

Each module has its own CSS file for better maintainability:

- **accessibility.css** - WCAG compliance, screen reader support
- **charts-styles.css** - Chart container styling
- **dashboard-styles.css** - Dashboard layout
- **drag-drop.css** - Drag & drop visual feedback
- **cloud-backup.css** - Cloud backup UI
- **validation-styles.css** - Form validation styling

### CSS Variables (Design Tokens)

```css
:root {
  /* Colors */
  --primary-blue: #1a237e;
  --secondary-blue: #3949ab;
  --background: #ffffff;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-color: #e0e0e0;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
}

body.dark-mode {
  --background: #1a1a1a;
  --text-primary: #e0e0e0;
  /* ... */
}
```

---

## 🔌 API Reference

### PortfolioStorage API

```javascript
const storage = new PortfolioStorage();

// Save portfolio data
storage.saveData(portfolioData);
// Returns: boolean (success/failure)

// Load portfolio data
const data = storage.loadData();
// Returns: Array<FundObject> | []

// Save client info
storage.saveClient({ name, email });
// Returns: boolean

// Load client info
const client = storage.loadClient();
// Returns: Object | null

// Clear all data
storage.clearAll();
// Returns: boolean

// Auto-save with callback
storage.startAutosave(() => {
  storage.saveData(portfolioData);
});

// Stop auto-save
storage.stopAutosave();
```

### CalculationsEngine API

```javascript
const engine = new CalculationsEngine();

// ROI calculation
engine.calculateROI(position);
// Params: { nákupníCena, počet, aktuálníHodnota }
// Returns: number (percentage)

// CAGR calculation
engine.calculateCAGR(startValue, endValue, years);
// Returns: number (percentage)

// Sharpe Ratio
engine.calculateSharpeRatio(returns, riskFreeRate);
// Params: Array<number>, number
// Returns: number

// Volatility
engine.calculateVolatility(returns);
// Returns: number (annualized %)

// Maximum Drawdown
engine.calculateMaxDrawdown(values);
// Returns: { maxDrawdown, peak, trough, recovery }
```

### ChartsManager API

```javascript
const charts = new AdvancedChartsManager();

// Create allocation chart
charts.createAllocationChart(data, 'containerId');
// Returns: Chart instance

// Create performance chart
charts.createPerformanceChart(data, 'containerId');
// Returns: Chart instance

// Export chart to PNG
charts.exportChartToPNG(chartInstance, 'filename');
// Returns: void

// Destroy all charts
charts.destroyAllCharts();
// Returns: void
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test -- --coverage
```

### Writing Tests

```javascript
// Example: calculations-engine.test.js
describe('CalculationsEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new CalculationsEngine();
  });

  test('should calculate ROI correctly', () => {
    const position = {
      nákupníCena: 100,
      počet: 10,
      aktuálníHodnota: 1200
    };
    
    const roi = engine.calculateROI(position);
    expect(roi).toBe(20);
  });
});
```

---

## 🚀 Deployment

### Local Development

```bash
# Option 1: Python server
python3 -m http.server 8000

# Option 2: Node.js
npx serve -p 8000

# Option 3: Deployment script
./DEPLOY.sh
```

### Docker Deployment

```bash
# Build image
docker build -t portfolio-manager-pro:latest .

# Run container
docker run -p 8080:80 portfolio-manager-pro:latest

# Or use docker-compose
docker-compose up -d
```

### Production Checklist

- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Check formatting: `npm run format:check`
- [ ] Security audit: `npm run security:audit`
- [ ] Build Docker image
- [ ] Test in production-like environment
- [ ] Enable HTTPS
- [ ] Configure CDN (if needed)
- [ ] Set up monitoring
- [ ] Backup strategy

---

## 🐛 Debugging

### Debug Mode

Enable debug mode by adding `?debug=true` to URL:
```
http://localhost:8080/investPortfolio.html?debug=true
```

This enables:
- Verbose console logging
- Performance markers
- Error stack traces
- Network request logging

### Common Issues

**Issue: Charts not rendering**
```javascript
// Solution: Check if Chart.js is loaded
if (typeof Chart === 'undefined') {
  console.error('Chart.js not loaded');
  // Load manually via library-loader.js
}
```

**Issue: Data not persisting**
```javascript
// Solution: Check localStorage availability
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available:', e);
}
```

**Issue: Memory leaks**
```javascript
// Solution: Destroy charts when not needed
charts.destroyAllCharts();

// Remove event listeners
element.removeEventListener('click', handler);
```

---

## 📦 Build & Optimization

### Bundle Analysis

```bash
# Check file sizes
du -sh *.js *.css *.html

# Total bundle size
du -sh . --exclude=node_modules --exclude=.git
```

### Performance Optimization

1. **Lazy Loading**: Use `library-loader.js` for on-demand loading
2. **Code Splitting**: Modular architecture allows selective loading
3. **Caching**: Service worker caches static assets
4. **Minification**: Use online tools or build process
5. **Image Optimization**: Use WebP, optimize PNGs

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Quick Start:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run tests: `npm test`
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

---

## 📚 Additional Resources

- [User Guide](USER_GUIDE.md)
- [Security Policy](SECURITY.md)
- [API Documentation](API_DOCS.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Change Log](CHANGELOG.md)

---

*Last Updated: October 8, 2025*  
*Version: 3.0.0*
