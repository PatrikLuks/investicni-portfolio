# 📐 Code Quality Policy - Portfolio Manager Pro

> **Version**: 3.2.0  
> **Effective Date**: January 2025  
> **Owner**: Chief Project Maintainer

---

## 🎯 Purpose

This policy establishes code quality standards, development practices, and governance rules for Portfolio Manager Pro to ensure maintainability, reliability, and scalability.

---

## ⭐ Quality Standards

### Overall Project Goals
```
✅ Enterprise-Grade Quality: 95/100 minimum score
✅ Test Success Rate: 100% (all tests passing)
✅ Build Time: <10 seconds
✅ Bundle Size: <100kb (Brotli compressed)
✅ Security Rating: A+ (SRI, CSP, HTTPS)
✅ Browser Support: Modern browsers (last 2 versions)
```

---

## 📏 Code Style & Formatting

### ESLint Configuration
**Tool**: ESLint 9.37.0 (Flat Config)

#### Enforced Rules
```javascript
// eslint.config.js
export default [
  {
    languageOptions: {
      ecmaVersion: 2024, // ES2024 syntax
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    rules: {
      // Errors (block commit)
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['error'] }], // Only console.error allowed
      
      // Warnings (should fix)
      'prefer-const': 'warn',
      'arrow-body-style': 'warn',
      'no-var': 'warn',
      
      // Code quality
      'eqeqeq': ['error', 'always'], // === instead of ==
      'curly': ['error', 'all'], // Always use braces
      'brace-style': ['error', '1tbs'], // One True Brace Style
    },
  },
];
```

### Prettier Configuration
**Tool**: Prettier 3.6.2

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### Manual Commands
```bash
# Check linting errors
npm run lint

# Auto-fix issues
npm run lint:fix

# Format with Prettier
npm run format
```

---

## 🧪 Testing Requirements

### Coverage Targets
```
Minimum Coverage: 85% (current: working towards after v3.2 cleanup)
- Statements: 75%+
- Branches: 70%+
- Functions: 75%+
- Lines: 75%+
```

### Test Categories

#### 1. Unit Tests
**Location**: `tests/__tests__/*.test.js`  
**Tool**: Jest 30.2.0  
**Coverage**: All pure functions, utilities, calculators

```javascript
// Example unit test
describe('portfolioCalculator.calculateROI', () => {
  test('should calculate positive ROI correctly', () => {
    const result = calculateROI(1000, 1200);
    expect(result).toBeCloseTo(20.0, 2);
  });

  test('should handle negative ROI', () => {
    const result = calculateROI(1000, 800);
    expect(result).toBeCloseTo(-20.0, 2);
  });
});
```

#### 2. Integration Tests
**Location**: `tests/__tests__/api-integration.test.js`  
**Coverage**: External API calls, data flow

```javascript
// Example integration test
describe('API Integration', () => {
  test('should fetch market data successfully', async () => {
    const data = await fetchMarketData('BTC');
    expect(data).toHaveProperty('price');
    expect(data).toHaveProperty('change');
  });
});
```

#### 3. E2E Tests (Future)
**Tool**: Playwright 1.56.0  
**Coverage**: Critical user workflows

---

## 🏗️ Code Architecture

### Module Structure (DRY Principle)
```
modules/
├── app-core.js              # Core initialization & state
├── data-manager.js          # localStorage persistence
├── portfolio-calculator.js  # Financial calculations
├── ui-manager.js            # UI rendering & updates
├── event-handlers.js        # Event delegation
├── utilities.js             # Shared helper functions
└── help-system.js           # Documentation system
```

### Naming Conventions

#### Files
```bash
kebab-case.js          # JavaScript modules
kebab-case.test.js     # Test files
SCREAMING_CASE.md      # Documentation
```

#### Variables & Functions
```javascript
// camelCase for variables & functions
const portfolioData = {};
function calculateTotalValue() {}

// PascalCase for classes
class PortfolioManager {}

// UPPER_CASE for constants
const MAX_PORTFOLIO_SIZE = 100;
```

#### Functions (Descriptive)
```javascript
✅ Good: calculateROI(), fetchMarketData(), renderPortfolioChart()
❌ Bad: calc(), get(), do()
```

---

## 🚫 Forbidden Practices

### 1. Console Logging
```javascript
❌ NEVER:
console.log('Debug message'); // Forbidden (except in error-handler.js)
console.warn('Warning');       // Forbidden
console.info('Info');          // Forbidden

✅ ALLOWED:
console.error('Critical error:', error); // Only in error-handler.js
```

**Enforcement**: ESLint rule `no-console: ['warn', { allow: ['error'] }]`

### 2. Magic Numbers
```javascript
❌ BAD:
if (portfolio.length > 50) { ... }

✅ GOOD:
const MAX_PORTFOLIO_SIZE = 50;
if (portfolio.length > MAX_PORTFOLIO_SIZE) { ... }
```

### 3. Var Keyword
```javascript
❌ NEVER use var:
var x = 10;

✅ Use const/let:
const x = 10;
let y = 20;
```

### 4. == Operator
```javascript
❌ BAD:
if (value == null) { ... }

✅ GOOD:
if (value === null) { ... }
if (value === undefined) { ... }
if (value == null) { ... } // Only when checking both null/undefined
```

### 5. Inline Event Handlers (HTML)
```html
❌ NEVER:
<button onclick="doSomething()">Click</button>

✅ GOOD (Event Delegation):
<button data-action="save">Click</button>
<!-- JavaScript: -->
document.addEventListener('click', (e) => {
  if (e.target.dataset.action === 'save') { ... }
});
```

### 6. Global Variables
```javascript
❌ BAD:
window.myGlobalVar = 123;

✅ GOOD (Module Scope):
// Inside module
const myModuleVar = 123;
export { myModuleVar };
```

---

## ✅ Best Practices

### 1. ES2024 Modern Syntax

#### Nullish Coalescing (`??`)
```javascript
✅ Use:
const value = input ?? defaultValue;

❌ Avoid:
const value = input !== null && input !== undefined ? input : defaultValue;
```

#### Optional Chaining (`?.`)
```javascript
✅ Use:
const city = user?.address?.city;

❌ Avoid:
const city = user && user.address && user.address.city;
```

#### Array/Object Destructuring
```javascript
✅ Use:
const { name, age } = user;
const [first, second] = array;

❌ Avoid:
const name = user.name;
const age = user.age;
```

### 2. Pure Functions (Functional Programming)
```javascript
✅ GOOD (Pure):
function calculateROI(investment, currentValue) {
  return ((currentValue - investment) / investment) * 100;
}

❌ BAD (Side Effects):
let total = 0;
function addToTotal(value) {
  total += value; // Mutates external state
}
```

### 3. DRY (Don't Repeat Yourself)
```javascript
❌ BAD:
function calculatePortfolio1() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return total;
}
function calculatePortfolio2() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return total;
}

✅ GOOD:
function sumValues(data) {
  return data.reduce((sum, item) => sum + item.value, 0);
}
```

### 4. Error Handling
```javascript
✅ GOOD:
try {
  const data = JSON.parse(input);
  return processData(data);
} catch (error) {
  console.error('Parsing failed:', error);
  return null;
}

❌ BAD:
const data = JSON.parse(input); // No error handling
```

### 5. Async/Await (Preferred over Promises)
```javascript
✅ GOOD:
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

❌ BAD:
function fetchData() {
  return fetch(url)
    .then(res => res.json())
    .then(data => data)
    .catch(err => console.error(err));
}
```

---

## 🔒 Security Standards

### Input Validation
```javascript
// Always validate user input
function validatePortfolioData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }
  
  if (!Number.isFinite(data.investment)) {
    throw new Error('Investment must be a number');
  }
  
  return true;
}
```

### XSS Prevention
```javascript
// Sanitize HTML output
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### SRI (Subresource Integrity)
```html
<!-- All CDN scripts MUST have SRI hashes -->
<script 
  src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"
></script>
```

---

## 📦 Dependency Management

### Update Policy
```bash
# Weekly: Check for updates
npm outdated

# Monthly: Update minor/patch versions
npm update

# Quarterly: Review major version updates
npm install <package>@latest
```

### Security Audits
```bash
# Before each release
npm audit

# Fix high-severity issues immediately
npm audit fix --force
```

### Approved Dependencies
```json
{
  "vite": "^7.x",        // Build tool
  "jest": "^30.x",       // Testing
  "eslint": "^9.x",      // Linting
  "prettier": "^3.x",    // Formatting
  "playwright": "^1.x"   // E2E testing
}
```

---

## 🔄 Git Workflow & Commits

### Conventional Commits (Required)
```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation only
refactor: Code change (no new feature/bug fix)
test:     Adding/updating tests
chore:    Build/tooling changes
perf:     Performance improvement
style:    Code style (formatting, semicolons)

# Examples:
git commit -m "feat(portfolio): add rebalancing tool"
git commit -m "fix(calculator): correct ROI decimal precision"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(data-manager): use ES2024 optional chaining"
git commit -m "test(ui-manager): add snapshot tests"
git commit -m "chore(deps): upgrade Jest to v30"
```

### Branch Naming
```bash
main              # Production-ready code
feature/name      # New features
fix/bug-name      # Bug fixes
refactor/name     # Code refactoring
docs/topic        # Documentation changes

# Examples:
git checkout -b feature/portfolio-analytics
git checkout -b fix/roi-calculation-bug
git checkout -b refactor/remove-console-logs
```

### Pull Request Requirements
```
☐ All tests passing (npm test)
☐ Linting clean (npm run lint)
☐ Build successful (npm run build)
☐ Code reviewed by 1+ person
☐ Conventional commit format
☐ CHANGELOG.md updated (if applicable)
☐ Documentation updated (if applicable)
```

---

## 📊 Performance Standards

### Build Metrics
```
Build Time: <10 seconds
Bundle Size (Brotli): <100kb
Bundle Size (Gzip): <150kb
Cold Start: <3 seconds
Time to Interactive: <5 seconds
```

### Code Splitting
```javascript
// Lazy load heavy modules
const chartModule = await import('./charts-manager.js');
const excelModule = await import('./excel-export.js');
```

### Lighthouse Scores (Target)
```
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 90+
```

---

## 🧹 Code Cleanup Policy

### Regular Cleanup Tasks
```bash
# Remove dead code
- Unused imports
- Unused functions
- Commented-out code (>1 week old)

# Remove backup files
- *.bak, *.old, *-backup.*

# Remove debug code
- console.log/warn/info (except error-handler.js)
- Temporary test files
```

### File Organization
```
Root Directory: Max 15 core files
- index.html, app.js, vite.config.js, package.json, etc.

modules/: Organized by feature
tests/: Organized by module
docs/: Organized by topic
```

---

## 🎓 Code Review Checklist

### For Reviewers
```
☐ Follows ESLint/Prettier rules
☐ Uses ES2024 modern syntax
☐ No console.log/warn/info (except error-handler.js)
☐ No magic numbers (constants used)
☐ No == operator (=== used)
☐ No var keyword (const/let used)
☐ Functions are pure (no side effects when possible)
☐ Error handling present
☐ Tests added/updated
☐ Documentation updated
☐ Conventional commit format
☐ No security vulnerabilities
☐ Performance not degraded
```

---

## 📚 Documentation Standards

### Code Comments
```javascript
/**
 * Calculate Return on Investment (ROI)
 * @param {number} investment - Initial investment amount
 * @param {number} currentValue - Current portfolio value
 * @returns {number} ROI percentage (e.g., 20.5 for 20.5%)
 * @example
 * calculateROI(1000, 1200) // Returns 20.0
 */
function calculateROI(investment, currentValue) {
  return ((currentValue - investment) / investment) * 100;
}
```

### README Updates
- Update README.md when adding major features
- Keep installation steps current
- Update screenshots/demos

---

## ⚠️ Violation Handling

### Severity Levels

#### 🔴 Critical (Block Merge)
- Build fails
- Tests fail
- Linting errors
- Security vulnerabilities (high/critical)
- console.log in production code

#### 🟡 Warning (Fix Before Next Release)
- Coverage below 85%
- Deprecated dependencies
- Performance degradation >10%
- Missing documentation

#### 🟢 Low (Fix When Possible)
- Code style inconsistencies
- Missing JSDoc comments
- Non-critical linting warnings

---

## 📅 Review Schedule

### Daily (Automated CI/CD)
- Run tests on every push
- Run linting on every commit
- Build verification

### Weekly (Manual Review)
- Check npm outdated
- Review open issues
- Code quality metrics

### Monthly (Maintenance)
- Update dependencies
- Run npm audit
- Review performance metrics
- Update documentation

### Quarterly (Major Review)
- Major version updates
- Architecture review
- Lighthouse audit
- Security penetration testing

---

## 🏆 Quality Metrics Dashboard

### Current Status (v3.2.0)
```
✅ Overall Score: 96/100
✅ Tests Passing: 90/90 (100%)
⚠️ Coverage: Working towards 85% target
✅ Build Time: 6.2s (<10s target)
✅ Bundle Size: 78kb (<100kb target)
✅ Linting Errors: 0
✅ Security Rating: A+
✅ Node.js: 20.19.5 LTS
✅ npm: 11.6.2
```

---

## 📞 Enforcement & Exceptions

### Policy Enforcement
- **Automated**: ESLint, Prettier, Jest (pre-commit hooks recommended)
- **Manual**: Code review, PR approval

### Exception Process
1. Document reason for exception
2. Get approval from project maintainer
3. Add exception to code comments
4. Track in technical debt log

---

**Version**: 3.2.0  
**Effective**: January 2025  
**Next Review**: April 2025  
**Owner**: Chief Project Maintainer  
**Status**: ✅ Active
