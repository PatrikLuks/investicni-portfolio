# 🤝 Contributing to Portfolio Manager Pro

First off, **thank you** for considering contributing to Portfolio Manager Pro! 🎉

It's people like you that make this project such a great tool for the investment community.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

**Positive behavior includes:**
- ✅ Using welcoming and inclusive language
- ✅ Being respectful of differing viewpoints
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community
- ✅ Showing empathy towards other community members

**Unacceptable behavior includes:**
- ❌ Trolling, insulting/derogatory comments, and personal attacks
- ❌ Public or private harassment
- ❌ Publishing others' private information
- ❌ Other conduct which could reasonably be considered inappropriate

---

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/PatrikLuks/investicni-portfolio/issues) to avoid duplicates.

**How to submit a good bug report:**

1. **Use a clear and descriptive title**
2. **Describe the exact steps to reproduce**
3. **Provide specific examples**
4. **Describe the behavior you observed**
5. **Explain which behavior you expected**
6. **Include screenshots if possible**
7. **Include your environment details**:
   - OS: (e.g., Windows 10, macOS 12, Ubuntu 22.04)
   - Browser: (e.g., Chrome 120, Firefox 121, Safari 17)
   - Version: (check console for version)

**Bug Report Template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened

**Screenshots:**
If applicable, add screenshots

**Environment:**
- OS: 
- Browser: 
- Version: 
```

### ✨ Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/PatrikLuks/investicni-portfolio/issues).

**How to submit a good enhancement suggestion:**

1. **Use a clear and descriptive title**
2. **Provide a step-by-step description**
3. **Provide specific examples**
4. **Describe current behavior**
5. **Describe expected behavior**
6. **Explain why this enhancement would be useful**

**Enhancement Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
Alternative solutions or features you've considered

**Additional context**
Any other context, screenshots, or examples
```

### 🔧 Pull Requests

**Good First Issues:**
Look for issues labeled `good first issue` or `help wanted` to get started!

**Pull Request Guidelines:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

---

## 💻 Development Setup

### Prerequisites

- **Any modern browser** (Chrome, Firefox, Safari, Edge)
- **Text editor** (VS Code recommended)
- **Local web server** (optional but recommended)
  - Python: `python3 -m http.server 8000`
  - Node.js: `npx serve`
  - PHP: `php -S localhost:8000`

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/investicni-portfolio.git
cd investicni-portfolio

# 2. Create a branch
git checkout -b feature/my-awesome-feature

# 3. Start local server
python3 -m http.server 8000
# or
./DEPLOY.sh  # Choose option 1

# 4. Open in browser
http://localhost:8000/investPortfolio.html

# 5. Make changes and test
# Edit files in your favorite editor

# 6. Run tests
./enterprise-benchmark.sh
open qa-dashboard.html

# 7. Commit and push
git add .
git commit -m "feat: add amazing feature"
git push origin feature/my-awesome-feature
```

### Project Structure

```
investicni-portfolio/
├── investPortfolio.html      # Main HTML file
├── app.js                    # Core business logic (2,745 lines)
├── calculations-engine.js    # Financial calculations
├── charts-manager.js         # Chart rendering
├── error-handler.js          # Global error handling
├── notification-system.js    # Toast notifications
├── command-stack.js          # Undo/Redo system
├── service-worker-v3.js      # PWA offline support
├── manifest.json             # PWA manifest
├── *.css                     # Styling files
├── docs/                     # Documentation
├── tests/                    # Test files
└── icons/                    # App icons
```

---

## 📝 Coding Standards

### JavaScript Style Guide

**We follow these conventions:**

1. **ES6+ Syntax**
   ```javascript
   // ✅ Good
   const myFunction = (param) => {
       return param * 2;
   };

   // ❌ Bad
   var myFunction = function(param) {
       return param * 2;
   };
   ```

2. **Naming Conventions**
   ```javascript
   // ✅ Good
   const userName = 'John';           // camelCase for variables
   const MAX_RETRIES = 3;             // UPPER_SNAKE_CASE for constants
   function calculateTotal() {}       // camelCase for functions
   class PortfolioManager {}          // PascalCase for classes

   // ❌ Bad
   const user_name = 'John';
   const maxretries = 3;
   function CalculateTotal() {}
   class portfolioManager {}
   ```

3. **Comments & Documentation**
   ```javascript
   /**
    * Calculate portfolio ROI
    * @param {number} initialValue - Initial investment
    * @param {number} currentValue - Current value
    * @returns {number} ROI percentage
    */
   function calculateROI(initialValue, currentValue) {
       return ((currentValue - initialValue) / initialValue) * 100;
   }
   ```

4. **Error Handling**
   ```javascript
   // ✅ Good
   try {
       const data = JSON.parse(localStorage.getItem('portfolio'));
       if (!data) throw new Error('No data found');
   } catch (error) {
       console.error('Failed to load portfolio:', error);
       ErrorHandler.handleError(error, 'Portfolio Loading');
   }

   // ❌ Bad
   const data = JSON.parse(localStorage.getItem('portfolio'));
   ```

5. **Async Operations**
   ```javascript
   // ✅ Good
   async function loadData() {
       try {
           const response = await fetch('/api/data');
           const data = await response.json();
           return data;
       } catch (error) {
           ErrorHandler.handleError(error, 'Data Loading');
       }
   }

   // ❌ Bad
   function loadData() {
       fetch('/api/data').then(response => {
           return response.json();
       }).catch(error => {
           console.log(error);
       });
   }
   ```

### CSS Style Guide

1. **BEM Methodology**
   ```css
   /* ✅ Good */
   .portfolio-card {}
   .portfolio-card__title {}
   .portfolio-card__title--highlighted {}

   /* ❌ Bad */
   .portfolioCard {}
   .pc-title {}
   .highlighted {}
   ```

2. **CSS Variables**
   ```css
   /* ✅ Good */
   :root {
       --color-primary: #2563eb;
       --spacing-md: 16px;
   }

   .button {
       background: var(--color-primary);
       padding: var(--spacing-md);
   }

   /* ❌ Bad */
   .button {
       background: #2563eb;
       padding: 16px;
   }
   ```

3. **Mobile-First**
   ```css
   /* ✅ Good */
   .container {
       width: 100%;
   }

   @media (min-width: 768px) {
       .container {
           width: 750px;
       }
   }

   /* ❌ Bad */
   .container {
       width: 750px;
   }

   @media (max-width: 767px) {
       .container {
           width: 100%;
       }
   }
   ```

### HTML Best Practices

1. **Semantic HTML**
   ```html
   <!-- ✅ Good -->
   <header>
       <nav>
           <ul>
               <li><a href="#home">Home</a></li>
           </ul>
       </nav>
   </header>
   <main>
       <article>
           <h1>Portfolio Overview</h1>
       </article>
   </main>

   <!-- ❌ Bad -->
   <div class="header">
       <div class="nav">
           <div class="list">
               <div><a href="#home">Home</a></div>
           </div>
       </div>
   </div>
   ```

2. **Accessibility**
   ```html
   <!-- ✅ Good -->
   <button aria-label="Add transaction" onclick="addTransaction()">
       <svg aria-hidden="true">...</svg>
       <span class="sr-only">Add transaction</span>
   </button>

   <!-- ❌ Bad -->
   <div onclick="addTransaction()">
       <svg>...</svg>
   </div>
   ```

---

## 🔄 Pull Request Process

### Before Submitting

1. **✅ Check your code**
   - [ ] Follows coding standards
   - [ ] No console errors
   - [ ] Works in Chrome, Firefox, Safari
   - [ ] Responsive (mobile, tablet, desktop)
   - [ ] Accessible (keyboard navigation)

2. **✅ Test thoroughly**
   - [ ] Manual testing
   - [ ] Automated tests passing
   - [ ] Performance acceptable
   - [ ] No memory leaks

3. **✅ Update documentation**
   - [ ] Code comments added
   - [ ] README updated (if needed)
   - [ ] CHANGELOG updated

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested on mobile
- [ ] All tests passing

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks** run first (linting, tests)
2. **Code review** by maintainer(s)
3. **Changes requested** (if needed)
4. **Approval** when ready
5. **Merge** into main branch

**Review criteria:**
- Code quality
- Test coverage
- Documentation
- Performance impact
- Security implications
- Accessibility
- Browser compatibility

---

## 🧪 Testing Guidelines

### Manual Testing

**Before submitting PR, test:**

1. **Core Functionality**
   - [ ] Add transaction
   - [ ] Edit transaction
   - [ ] Delete transaction
   - [ ] Undo/Redo
   - [ ] Save/Load data

2. **Charts & Analytics**
   - [ ] All 4 chart types render
   - [ ] Charts are interactive
   - [ ] Metrics calculate correctly
   - [ ] Export to PDF works
   - [ ] Export to Excel works

3. **User Experience**
   - [ ] Smooth animations
   - [ ] No lag or freeze
   - [ ] Error messages clear
   - [ ] Loading states visible
   - [ ] Responsive design works

### Automated Testing

```bash
# Run all tests
./enterprise-benchmark.sh

# Open test dashboard
open qa-dashboard.html

# Check for errors
open test-debug.html
```

### Performance Testing

**Acceptable thresholds:**
- Load time: < 1s
- Bundle size: < 1MB
- CPU usage: < 60%
- Memory: < 150MB
- FPS: 60fps

---

## 📖 Documentation

### Code Documentation

**Every function should have JSDoc:**

```javascript
/**
 * Calculate portfolio Sharpe Ratio
 * 
 * Sharpe Ratio measures risk-adjusted return by comparing
 * excess return to volatility. Higher is better.
 * 
 * @param {number[]} returns - Array of periodic returns
 * @param {number} riskFreeRate - Risk-free rate (default 0.02)
 * @returns {number} Sharpe ratio
 * @throws {Error} If returns array is empty
 * 
 * @example
 * const returns = [0.05, 0.03, -0.02, 0.04];
 * const sharpe = calculateSharpeRatio(returns, 0.02);
 * console.log(sharpe); // 1.85
 */
function calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    // Implementation
}
```

### User Documentation

**Update these files when adding features:**
- `USER_GUIDE.md` - User-facing guide
- `README_FINAL.md` - GitHub README
- `FEATURE_LIST.md` - Feature catalog
- Help system in `help-system.js`

---

## 🌍 Community

### Get Help

- **GitHub Issues**: [Report bugs & request features](https://github.com/PatrikLuks/investicni-portfolio/issues)
- **GitHub Discussions**: [Ask questions & share ideas](https://github.com/PatrikLuks/investicni-portfolio/discussions)
- **Email**: support@portfoliomanager.pro

### Stay Updated

- **Watch** this repository for updates
- **Star** ⭐ if you find it useful
- **Share** with others who might benefit

### Recognition

Contributors are recognized in:
- `README_FINAL.md` contributors section
- GitHub contributors page
- Release notes

---

## 🎉 Thank You!

Every contribution, no matter how small, makes a difference!

**Common contributions we love:**
- 🐛 Bug fixes
- ✨ New features
- 📖 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌍 Translations
- 📝 Blog posts
- 🎥 Video tutorials
- 💬 Helping others in discussions

**Your time and effort are greatly appreciated!** 🙏

---

<div align="center">

**Made with ❤️ by the Portfolio Manager Pro community**

[⬆ Back to Top](#-contributing-to-portfolio-manager-pro)

</div>
