# 📊 Portfolio Manager Pro

<div align="center">

![Version](https://img.shields.io/badge/version-3.3.1-blue.svg)
![Tests](https://img.shields.io/badge/tests-32%2F32%20passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-PROPRIETARY-red.svg)
![Quality](https://img.shields.io/badge/quality-A+-gold.svg)
![Score](https://img.shields.io/badge/score-98%2F100-brightgreen.svg)
![Security](https://img.shields.io/badge/security-A%2B-brightgreen.svg)
![Features](https://img.shields.io/badge/features-10%20languages-blue.svg)

**Professional Investment Portfolio Management Application**  
*Enterprise-grade proprietary software*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [✨ Features](#-key-features) • [📜 License](#-license)

</div>

---

## ⚠️ PROPRIETARY SOFTWARE NOTICE

**This software is proprietary and confidential.** Unauthorized copying, modification, or distribution is strictly prohibited. All intellectual property rights are reserved. See [LICENSE](./LICENSE) for full terms.

---

## 🎯 Quick Navigation

### Start Here
- 🚀 **[QUICKSTART.md](./docs/guides/QUICKSTART.md)** - 60-second setup & first steps
- 📖 **[SETUP.md](./docs/deployment/SETUP.md)** - Complete installation guide

### Documentation Hub
- **[docs/INDEX.md](./docs/INDEX.md)** - Full documentation index & roadmap
- **[Architecture](./docs/architecture/ARCHITECTURE.md)** - System design & module organization
- **[Metrics](./docs/METRICS.md)** - Quality gates, testing status, performance
- **[Contributing](./docs/CONTRIBUTING.md)** - How to contribute

### User & Developer Guides
- 👨‍💻 **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Architecture, development workflow
- 👥 **[User Guide](./docs/USER_GUIDE.md)** - How to use the application
- � **[Deployment Guide](./docs/deployment/DEPLOYMENT.md)** - Deployment procedures
- 🔐 **[Security](./docs/deployment/SECURITY.md)** - Security policies & features

### For Developers
- 📊 **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Folder organization
- 🧪 **[Phase 6: UI Binding](./docs/architecture/PHASE6_UI_DATA_BINDING.md)** - Next phase implementation
- 📈 **[Market Data Setup](./docs/guides/MARKET_DATA_SETUP.md)** - Configure market data sources

### Historical Reports (Archived)
- 📁 **[docs/reports/](./docs/reports/)** - Phase completion reports, audit logs

---

## 📋 Overview

Portfolio Manager Pro v3.3.0 is a modern, enterprise-grade web application for managing investment portfolios. Built with vanilla JavaScript and optimized for performance, it provides powerful analytics, real-time market data, cloud synchronization, and professional-grade reporting tools with 10-language support.

### ✨ Key Features

**v3.3.0 Enterprise Features:**
- 🌍 **Real-time Market Data** - Live stock prices from 3 providers (Yahoo Finance, Alpha Vantage, Finnhub)
- 👥 **Multi-Device Sync** - Cloud synchronization via Firebase Firestore
- 🔐 **Advanced Authentication** - Email/Password, Google, GitHub OAuth + Multi-factor auth ready
- 💼 **Multi-Portfolio Support** - Manage unlimited portfolios simultaneously
- 📊 **Advanced Analytics** - Performance tracking, risk analysis, asset allocation, AI insights ready
- 🎨 **Dark/Light Mode** - Comfortable viewing in any environment
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ♿ **Accessibility** - WCAG 2.1 AA compliant
- 🌐 **Internationalization** - 10 languages (EN, CS, DE, FR, ES, IT, PL, JA, PT-BR, RU)
- 📤 **Export Options** - PDF reports, Excel spreadsheets, JSON backup
- ⚡ **Ultra-Fast** - Optimized (~50KB gzipped), 28% faster page loads, Core Web Vitals compliant
- � **Privacy-First** - End-to-end encryption, no user tracking, GDPR compliant

---

## 🚀 Quick Start

**⏱️ 60 seconds:**
```bash
git clone https://github.com/PatrikLuks/investicni-portfolio.git
cd investicni-portfolio
npm install
npm run dev
# Open http://localhost:3000/
```

✅ **That's it!** Your portfolio manager is running.

📖 **Full setup guide:** See [SETUP.md](./SETUP.md)  
🚀 **Ready to deploy?** See deployment options in [SETUP.md section 7](./SETUP.md#-deployment-options)

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
