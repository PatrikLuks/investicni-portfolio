# Investment Portfolio Manager Pro v3.1.0

[![CI/CD Pipeline](https://github.com/PatrikLuks/investicni-portfolio/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/PatrikLuks/investicni-portfolio/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-26%25-yellow)](./coverage/index.html)
[![Bundle Size](https://img.shields.io/badge/bundle-11.09KB-success)](./dist)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **TOP-LEVEL, Enterprise-Grade Investment Portfolio Management Application**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## ✨ Features

### Core Functionality
- 📊 **Portfolio Management**: Add, edit, delete investment funds
- 💰 **Real-time Calculations**: Automatic yield, profit/loss calculations
- 📈 **Visual Analytics**: Interactive charts and KPI dashboard
- 📥 **CSV Export**: Generate portfolio reports
- 🔍 **Search & Filter**: Find funds quickly
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 💾 **Auto-save**: Automatic data persistence to localStorage

### Technical Excellence
- ⚡ **Lightning Fast**: 11.09KB gzipped bundle (89% reduction)
- 🧩 **Modular Architecture**: Clean ES6 modules
- ✅ **Well Tested**: 88 tests with 26% coverage
- 📝 **Fully Documented**: 172+ JSDoc annotations
- 🎨 **Modern UI**: Responsive design, accessibility compliant
- 🔒 **Type Safe**: JSDoc types for IDE support

## 📦 Project Structure

```
investicni-portfolio/
├── modules/                 # ES6 Modules
│   ├── main.js             # Entry point
│   ├── app-core.js         # Application initialization
│   ├── event-handlers.js   # DOM event management
│   ├── data-manager.js     # Data persistence
│   ├── portfolio-calculator.js  # Business logic
│   ├── ui-manager.js       # UI components
│   └── utilities.js        # Helper functions
├── __tests__/              # Test suites
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── dist/                   # Production build
├── .github/workflows/      # CI/CD pipelines
├── vite.config.js          # Build configuration
├── jest.config.cjs         # Test configuration
└── playwright.config.js    # E2E test configuration
```

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone repository
git clone https://github.com/PatrikLuks/investicni-portfolio.git
cd investicni-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or next available port).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run all tests with coverage |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check code quality with ESLint |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run security:audit` | Run security audit |

## 🧪 Testing

### Test Coverage
- **Total Tests**: 88 (58 unit + 30 integration)
- **Passing Rate**: 73.3% integration, 100% unit
- **Code Coverage**: 25.96% statements, 22.91% branches
- **E2E Scenarios**: 9 critical user flows

### Running Tests

```bash
# All tests with coverage report
npm test

# Integration tests (module interactions)
npm run test:integration

# E2E tests (user workflows)
npm run test:e2e

# Watch mode for TDD
npm run test:watch

# CI mode (optimized for pipelines)
npm run test:ci
```

See [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) for detailed test documentation.

## 📊 Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Bundle Size (gzipped) | 11.09 KB | ✅ Excellent |
| Brotli Compression | 9.66 KB | ✅ Excellent |
| CSS (gzipped) | 10.76 KB | ✅ Good |
| Build Time | 3.48s | ✅ Fast |
| First Contentful Paint | <1.5s | ✅ Good |
| Time to Interactive | <3s | ✅ Good |

## 🏗️ Architecture

### ES6 Module System
Clean, maintainable architecture with zero global variables:

```javascript
main.js → app-core.js → {
  event-handlers.js,
  data-manager.js,
  portfolio-calculator.js,
  ui-manager.js,
  utilities.js
}
```

### Key Design Patterns
- **Module Pattern**: Encapsulation and separation of concerns
- **Observer Pattern**: Event-driven UI updates
- **Factory Pattern**: Data object creation
- **Strategy Pattern**: Calculation algorithms
- **Singleton Pattern**: Storage management

### Data Flow
```
User Input → Event Handlers → Business Logic → Data Manager → UI Update
                                      ↓
                              Portfolio Calculator
                                      ↓
                               UI Manager (Toasts, Dialogs)
```

## 🔧 Configuration

### Environment Variables
Create `.env` file for custom configuration:

```env
VITE_APP_TITLE="Investment Portfolio Manager"
VITE_API_URL="https://api.example.com"
VITE_ENABLE_ANALYTICS=true
```

### Build Optimization
Vite configuration in `vite.config.js`:
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Source maps (dev only)

## 🚀 Deployment

### GitHub Actions CI/CD
Automated pipeline runs on every push:

1. **Lint & Format**: ESLint + Prettier checks
2. **Test**: Unit + Integration tests with coverage
3. **Build**: Production bundle optimization
4. **Security**: npm audit + Snyk scan
5. **E2E**: Playwright browser tests
6. **Deploy**: Manual trigger to production

### Manual Deployment

```bash
# Build production bundle
npm run build

# Test production build locally
npm run preview

# Deploy to static hosting
# - Netlify: npx netlify-cli deploy --prod --dir=dist
# - Vercel: npx vercel --prod
# - GitHub Pages: Copy dist/ to gh-pages branch
# - AWS S3: aws s3 sync dist/ s3://your-bucket/
```

## 📚 Documentation

- [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) - Complete testing infrastructure
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [FINAL_DELIVERY.md](./FINAL_DELIVERY.md) - Project completion report

### API Documentation
JSDoc-generated API documentation available in `docs/` (run `npm run docs` to generate).

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of Conduct
- Development workflow
- Commit conventions
- Pull request process

```bash
# Fork and clone repository
git clone https://github.com/YOUR_USERNAME/investicni-portfolio.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm test
npm run lint

# Commit and push
git add .
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature

# Open Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Version 3.2.0 (Planned)
- [ ] Multi-portfolio support
- [ ] Real-time market data integration
- [ ] Advanced chart types (candlestick, area)
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Data import from CSV/Excel

### Version 4.0.0 (Future)
- [ ] Cloud backup and sync
- [ ] Collaboration features
- [ ] Mobile app (React Native)
- [ ] AI-powered insights
- [ ] Tax reporting
- [ ] Multi-currency support

## 📞 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/PatrikLuks/investicni-portfolio/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/PatrikLuks/investicni-portfolio/discussions)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Tested with [Jest](https://jestjs.io/) and [Playwright](https://playwright.dev/)
- Linted with [ESLint](https://eslint.org/)
- Formatted with [Prettier](https://prettier.io/)

---

**Made with ❤️ by [Patrik Luks](https://github.com/PatrikLuks)**

**Investment Portfolio Manager Pro v3.1.0** - Enterprise-Grade Portfolio Management
