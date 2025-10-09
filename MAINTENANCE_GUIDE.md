# 📘 Maintenance Guide - Portfolio Manager Pro

> **Version**: 3.2.0  
> **Last Updated**: January 2025  
> **Maintainer**: Chief Project Maintainer

---

## 🎯 Overview

This guide provides comprehensive maintenance procedures for Portfolio Manager Pro, covering development setup, common tasks, troubleshooting, and best practices.

---

## 🚀 Development Setup

### Prerequisites
```bash
Node.js: >=20.0.0 LTS (currently 20.19.5)
npm: >=11.0.0 (currently 11.6.2)
Git: Latest version
```

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd investicni-portfolio

# Install dependencies
npm install

# Verify installation
node --version  # Should be >=20.x
npm --version   # Should be >=11.x
```

### Development Commands
```bash
# Start development server (hot reload)
npm run dev
# → Opens http://localhost:5173

# Run tests
npm test
# → Runs Jest test suite (90 tests)

# Linting & formatting
npm run lint        # Check code style
npm run lint:fix    # Auto-fix issues
npm run format      # Prettier formatting

# Build production
npm run build
# → Outputs to dist/ (ES2022, Brotli compressed)

# Preview production build
npm run preview
# → Opens http://localhost:4173
```

---

## 📊 Project Health Metrics

### Current Status (v3.2.0)
```
✅ Score: 96/100 (Enterprise-grade)
✅ Tests: 90/90 passing (100% test success)
✅ Build Time: 6.2-6.5 seconds
✅ Bundle Size: 78kb (Brotli compressed)
✅ Security: A+ rating (SRI hashes, CSP)
✅ Node.js: 20.19.5 LTS
✅ npm: 11.6.2
```

### Quality Standards
- **Code Style**: ESLint 9 (strict rules) + Prettier 3.6
- **Testing**: Jest 30 + Playwright 1.56
- **ES Version**: ECMAScript 2024 (nullish coalescing, optional chaining)
- **Build Target**: ES2022
- **Browser Support**: Modern browsers (last 2 versions)

---

## 🔧 Common Maintenance Tasks

### 1. Updating Dependencies

#### Check for Updates
```bash
npm outdated
```

#### Update Packages
```bash
# Update all minor/patch versions
npm update

# Update specific package
npm update <package-name>

# Update major versions (careful!)
npm install <package-name>@latest
```

#### After Update Checklist
```bash
# 1. Run tests
npm test

# 2. Check linting
npm run lint

# 3. Build project
npm run build

# 4. Manual testing
npm run preview
```

### 2. Adding New Features

#### Feature Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Implement feature
# - Add code to appropriate module
# - Write tests in tests/__tests__/
# - Update documentation

# 3. Validate
npm test
npm run lint:fix
npm run build

# 4. Commit (Conventional Commits)
git commit -m "feat: add new portfolio analytics"

# 5. Push and create PR
git push origin feature/new-feature
```

#### Module Structure
```
modules/
├── app-core.js          # Core application logic
├── data-manager.js      # Data persistence (localStorage)
├── portfolio-calculator.js  # Financial calculations
├── ui-manager.js        # UI rendering
├── utilities.js         # Helper functions
└── help-system.js       # Documentation system
```

### 3. Debugging Issues

#### Enable Debug Mode
```javascript
// Temporarily add console logs (remove before commit!)
console.error('DEBUG:', variable); // Only console.error allowed
```

#### Common Issues

**Build Fails**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**Tests Fail**
```bash
# Run specific test
npm test -- --testNamePattern="test name"

# Update snapshots
npm test -- -u

# Debug test
npm test -- --verbose
```

**Linting Errors**
```bash
# Auto-fix most issues
npm run lint:fix

# Check specific file
npx eslint file.js
```

---

## 📦 Build & Deployment

### Production Build Process
```bash
# 1. Clean previous build
rm -rf dist

# 2. Build production bundle
npm run build
# Creates:
# - dist/index.html (main entry)
# - dist/assets/js/*.js (code-split bundles)
# - dist/assets/css/*.css (optimized styles)
# - *.gz (Gzip compression)
# - *.br (Brotli compression)

# 3. Verify build
npm run preview

# 4. Test production build
npm test
```

### Build Optimization Features
- **Code Splitting**: Automatic lazy loading
- **Tree Shaking**: Dead code elimination
- **Compression**: Brotli (~78kb) + Gzip fallback
- **Legacy Support**: @vitejs/plugin-legacy for older browsers
- **SRI Hashes**: Subresource Integrity for CDN scripts
- **HTTP/2 Preload**: Optimized resource loading

### Deployment Checklist
```
☐ All tests passing (npm test)
☐ Linting clean (npm run lint)
☐ Build successful (npm run build)
☐ Preview tested (npm run preview)
☐ Git committed (conventional commits)
☐ Version tagged (git tag v3.2.0)
☐ CHANGELOG.md updated
☐ Documentation updated
```

---

## 🧪 Testing Strategy

### Test Structure
```
tests/
├── __tests__/
│   ├── data-manager.test.js         # localStorage operations
│   ├── portfolio-calculator.test.js # Financial calculations
│   ├── ui-manager.test.js           # UI rendering
│   ├── utilities.test.js            # Helper functions
│   ├── api-integration.test.js      # External API calls
│   └── v3.1-features.test.js        # New feature tests
└── setup.js                          # Jest configuration
```

### Writing Tests
```javascript
// Example test structure
describe('Module Name', () => {
  beforeEach(() => {
    // Setup
  });

  test('should do something', () => {
    // Arrange
    const input = {...};
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  afterEach(() => {
    // Cleanup
  });
});
```

### Coverage Requirements
```
Target Coverage: 85%+ (currently not met after cleanup)
- Statements: 75%
- Branches: 70%
- Functions: 75%
- Lines: 75%
```

---

## 🔒 Security Maintenance

### Regular Security Checks
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# High-severity only
npm audit fix --only=prod
```

### Security Features
- **SRI Hashes**: All CDN resources verified
- **CSP**: Content Security Policy headers
- **Input Validation**: data-validation.js module
- **XSS Prevention**: Sanitized user inputs
- **HTTPS Required**: Service worker enforces HTTPS

---

## 🌐 Browser Compatibility

### Supported Browsers
```
Chrome: Last 2 versions
Firefox: Last 2 versions
Safari: Last 2 versions
Edge: Last 2 versions
```

### Legacy Support
- **@vitejs/plugin-legacy**: Transpiles for older browsers
- **Polyfills**: Automatic injection for missing features

---

## 📝 Code Quality Standards

### ESLint Rules
```javascript
// .eslintrc or eslint.config.js
ecmaVersion: 2024
rules:
  - no-console: warn (except console.error in error-handler.js)
  - no-unused-vars: error
  - prefer-const: error
  - arrow-body-style: error
```

### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Commit Convention (Conventional Commits)
```bash
feat: New feature
fix: Bug fix
docs: Documentation changes
refactor: Code refactoring
test: Test additions/changes
chore: Build/tooling changes

# Examples:
git commit -m "feat: add portfolio rebalancing tool"
git commit -m "fix: correct ROI calculation for dividends"
git commit -m "docs: update API integration guide"
```

---

## 🐛 Known Issues & Workarounds

### Issue 1: Coverage Thresholds Not Met
**Status**: Known issue after v3.2.0 cleanup  
**Cause**: Removed debug console.log calls, exposed untested files  
**Workaround**: Add tests for uncovered modules or adjust thresholds  
**Fix**: In progress (see CODE_QUALITY_POLICY.md)

### Issue 2: Vite Plugin Legacy Warning
**Status**: Expected behavior  
**Message**: "plugin-legacy overrode 'build.target'"  
**Cause**: Legacy plugin takes precedence over vite.config.js target  
**Workaround**: Ignore - this is intentional behavior  
**Fix**: Not needed

---

## 📚 Documentation Locations

```
README.md                    - Project overview
MAINTENANCE_GUIDE.md         - This file
CODE_QUALITY_POLICY.md       - Quality standards
DEVELOPER_GUIDE.md           - Development workflows
API_INTEGRATION_GUIDE.md     - External API documentation
CHANGELOG.md                 - Version history
FINAL_DELIVERY_SUMMARY.md    - Project completion report
```

---

## 🔄 Continuous Integration (Future)

### Planned GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    - npm install
    - npm run lint
    - npm test
    - npm run build
```

---

## 📞 Support & Contact

**Issue Reporting**: GitHub Issues  
**Documentation**: See docs/ directory  
**Code Review**: Pull request required for main branch  

---

## ✅ Maintenance Checklist (Monthly)

```
☐ Run npm outdated and update dependencies
☐ Run npm audit and fix vulnerabilities
☐ Run full test suite (npm test)
☐ Check linting (npm run lint)
☐ Review CHANGELOG.md
☐ Update documentation if needed
☐ Test production build (npm run preview)
☐ Review performance metrics
☐ Check browser compatibility
☐ Backup database (if applicable)
```

---

**Version**: 3.2.0  
**Maintenance**: January 2025  
**Status**: ✅ Active Development
