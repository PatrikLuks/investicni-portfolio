# 📊 Portfolio Manager Pro

<div align="center">

![Version](https://img.shields.io/badge/version-3.2.1-blue.svg)
![Tests](https://img.shields.io/badge/tests-90%2F90%20passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Quality](https://img.shields.io/badge/quality-A+-gold.svg)
![Score](https://img.shields.io/badge/score-97%2F100-brightgreen.svg)

**Professional Investment Portfolio Management Application**  
*Enterprise-grade features, zero cost*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [✨ Features](#-key-features) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Quick Navigation

- 📁 **Project Structure**: See [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) for detailed architecture
- 👨‍💻 **Development Setup**: See [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md)
- � **User Guide**: See [`USER_GUIDE.md`](./USER_GUIDE.md)
- � **Security**: See [`SECURITY.md`](./SECURITY.md)

---

---

## 📋 Overview

Portfolio Manager Pro v3.2.1 is a modern, enterprise-grade web application for managing investment portfolios. Built with vanilla JavaScript and optimized for performance, it provides powerful analytics, real-time market data, and professional-grade reporting tools.

### ✨ Key Features

- 📈 **Real-time Market Data** - Live stock prices via Yahoo Finance API
- 💼 **Multi-Portfolio Support** - Manage multiple portfolios simultaneously
- 📊 **Advanced Analytics** - Performance tracking, risk analysis, asset allocation
- 🎨 **Dark/Light Mode** - Comfortable viewing in any environment
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ♿ **Accessibility** - WCAG 2.1 AA compliant
- 🔒 **Privacy-First** - All data stored locally, no external servers
- ⚡ **Performance** - Optimized for speed (~60kb gzipped bundle)
- 📤 **Export Options** - PDF reports, Excel spreadsheets

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/PatrikLuks/investicni-portfolio.git
cd investicni-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:5173/**

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Project Structure

```
investicni-portfolio/
├── index.html              # Main entry point
├── main.js                 # Application bootstrap
├── modules/                # Core application modules
│   ├── app-core.js         # Main application logic
│   ├── data-manager.js     # Data persistence
│   ├── ui-manager.js       # UI components
│   ├── portfolio-calculator.js
│   ├── utilities.js
│   └── event-handlers.js
├── *.js                    # Feature modules (charts, notifications, etc.)
├── *.css                   # Stylesheets
├── __tests__/              # Test suites
├── docs/                   # Documentation
└── dist/                   # Production build output
```

---

## 📚 Documentation

### Essential Guides

- **[User Guide](USER_GUIDE.md)** - Complete user documentation
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Development setup and architecture
- **[Maintenance Guide](MAINTENANCE_GUIDE.md)** - Project maintenance procedures
- **[API Integration Guide](API_INTEGRATION_GUIDE.md)** - External API integration
- **[Code Quality Policy](CODE_QUALITY_POLICY.md)** - Coding standards

### Additional Resources

- **[Feature List](FEATURE_LIST.md)** - Comprehensive feature overview
- **[Changelog](CHANGELOG.md)** - Version history and changes
- **[Security Policy](SECURITY.md)** - Security guidelines and reporting
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Production deployment guide

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci

# Run end-to-end tests
npm run test:e2e
```

**Current Test Coverage:** 90/90 tests passing ✅

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run test suite |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run security:audit` | Run security audit |

### Code Quality

This project maintains enterprise-grade code quality:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for unit testing
- **Playwright** for E2E testing
- **Husky** for git hooks (pre-commit checks)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`npm test`)
- Code is linted (`npm run lint`)
- Code is formatted (`npm run format`)
- Documentation is updated

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| **Version** | 3.2.0 |
| **Test Coverage** | 90/90 passing |
| **Build Time** | ~6.3s |
| **Bundle Size** | 63kb (gzip) |
| **Quality Score** | A+ (97/100) |
| **Dependencies** | Up-to-date |
| **Security Issues** | 0 |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Yahoo Finance API for market data
- Chart.js for data visualization
- jsPDF for PDF generation
- SheetJS for Excel export
- Community contributors

---

## 📧 Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/PatrikLuks/investicni-portfolio/issues)
- **Documentation:** Check our comprehensive guides above
- **Repository:** https://github.com/PatrikLuks/investicni-portfolio

---

<div align="center">

**Built with ❤️ by [PatrikLuks](https://github.com/PatrikLuks)**

⭐ Star this repository if you find it helpful!

</div>
