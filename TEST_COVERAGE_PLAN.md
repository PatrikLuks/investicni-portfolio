# 📋 Test Coverage Improvement Plan

**Goal:** Increase code coverage from 9.69% to 75%+  
**Focus:** Critical business logic modules  
**Target Modules:** calculations-engine.js, data-validation.js, market-data-service.js

---

## 🎯 Module 1: calculations-engine.js (Priority: HIGH)

### Current Coverage: ~10%
### Target Coverage: 85%+

### Functions to Test:

#### 1. ROI Calculations
- ✅ `calculateROI(position)` - Basic ROI calculation
  - Test: Normal position with profit
  - Test: Normal position with loss
  - Test: Zero original value (edge case)
  - Test: Negative values
  - Test: Missing fields

- ✅ `calculateTotalROI(data)` - Portfolio total ROI
  - Test: Multiple positions
  - Test: Mixed profits and losses
  - Test: Empty portfolio
  - Test: Single position

#### 2. CAGR Calculations
- ✅ `calculateCAGR(startValue, endValue, years)` - Compound growth
  - Test: Positive growth over 5 years
  - Test: Negative growth (loss)
  - Test: Zero start value (edge case)
  - Test: Zero years (edge case)
  - Test: Less than 1 year

- ✅ `calculatePortfolioCAGR(data)` - Portfolio CAGR
  - Test: Portfolio with multiple positions
  - Test: Portfolio with old positions (5+ years)
  - Test: New portfolio (<1 month)
  - Test: No purchase dates
  - Test: Empty portfolio

#### 3. Sharpe Ratio & Risk Metrics
- ⚠️ `calculateSharpeRatio(returns)` - Risk-adjusted returns
  - Test: Normal returns with volatility
  - Test: Constant returns (zero volatility)
  - Test: Negative returns
  - Test: Empty returns array
  - Test: Single return value

- ⚠️ `calculateVolatility(returns)` - Standard deviation
  - Test: High volatility (tech stocks)
  - Test: Low volatility (bonds)
  - Test: Zero volatility (constant)
  - Test: Empty array
  - Test: Single value

#### 4. Beta & Correlation
- ⚠️ `calculateBeta(assetReturns, marketReturns)` - Market correlation
  - Test: High beta stock (2.0)
  - Test: Low beta stock (0.5)
  - Test: Negative beta
  - Test: Mismatched array lengths
  - Test: Zero variance

#### 5. Drawdown Analysis
- ⚠️ `calculateMaxDrawdown(values)` - Maximum loss
  - Test: Portfolio with significant drawdown
  - Test: Always increasing portfolio
  - Test: Multiple drawdowns (find max)
  - Test: Empty values
  - Test: Single value

### Test Cases: 30+ tests
### Estimated Coverage: 85-90%

---

## 🎯 Module 2: data-validation.js (Priority: HIGH)

### Current Coverage: ~5%
### Target Coverage: 90%+

### Functions to Test:

#### 1. Input Validation
- ✅ `validateNumber(value, min, max)` - Number validation
  - Test: Valid numbers
  - Test: Out of range
  - Test: Non-numeric strings
  - Test: Null/undefined
  - Test: Negative numbers
  - Test: Decimals

- ✅ `validateRequired(value)` - Required field check
  - Test: Valid values
  - Test: Empty string
  - Test: Null
  - Test: Undefined
  - Test: Whitespace only

- ✅ `validateDate(dateString)` - Date validation
  - Test: Valid dates (ISO format)
  - Test: Invalid formats
  - Test: Future dates
  - Test: Past dates (1900s)
  - Test: Empty/null

#### 2. Portfolio Data Validation
- ✅ `validatePosition(position)` - Position validation
  - Test: Complete valid position
  - Test: Missing required fields
  - Test: Invalid field types
  - Test: Negative quantities
  - Test: Zero price

- ✅ `validatePortfolio(portfolio)` - Portfolio validation
  - Test: Valid portfolio object
  - Test: Missing name
  - Test: Invalid structure
  - Test: Empty positions array

#### 3. Financial Data Validation
- ⚠️ `validateTicker(ticker)` - Stock ticker validation
  - Test: Valid tickers (AAPL, GOOGL)
  - Test: Invalid characters
  - Test: Too long (>5 chars)
  - Test: Empty string
  - Test: Special characters

- ⚠️ `validateCurrency(amount)` - Currency validation
  - Test: Valid amounts (decimal)
  - Test: Negative amounts
  - Test: Too many decimals
  - Test: Invalid format
  - Test: Very large numbers

### Test Cases: 25+ tests
### Estimated Coverage: 90-95%

---

## 🎯 Module 3: market-data-service.js (Priority: MEDIUM)

### Current Coverage: ~8%
### Target Coverage: 70%+

### Functions to Test:

#### 1. API Integration (Mock Tests)
- ⚠️ `fetchQuote(symbol)` - Fetch stock quote
  - Test: Successful API response
  - Test: API error (404)
  - Test: API timeout
  - Test: Rate limiting
  - Test: Invalid symbol
  - Mock: Axios/fetch responses

- ⚠️ `fetchHistoricalData(symbol, period)` - Historical data
  - Test: Valid date range
  - Test: Invalid date range
  - Test: API error
  - Test: Empty response
  - Mock: Historical data

#### 2. Caching
- ⚠️ `getCachedQuote(symbol)` - Cache retrieval
  - Test: Cache hit
  - Test: Cache miss
  - Test: Expired cache
  - Test: Cache invalidation

- ⚠️ `setCachedQuote(symbol, data)` - Cache storage
  - Test: Store new data
  - Test: Update existing
  - Test: Cache size limit
  - Test: TTL expiration

#### 3. Rate Limiting
- ⚠️ `checkRateLimit()` - Rate limit check
  - Test: Within limit
  - Test: Exceeded limit
  - Test: Reset after timeout
  - Test: Multiple symbols

#### 4. Error Handling
- ⚠️ `handleAPIError(error)` - Error handler
  - Test: Network errors
  - Test: API errors (400, 500)
  - Test: Timeout errors
  - Test: Parse errors

### Test Cases: 20+ tests
### Estimated Coverage: 70-75%

---

## 📊 Overall Coverage Goals

| Module | Current | Target | Test Cases |
|--------|---------|--------|------------|
| **calculations-engine.js** | ~10% | 85% | 30+ |
| **data-validation.js** | ~5% | 90% | 25+ |
| **market-data-service.js** | ~8% | 70% | 20+ |
| **Other modules** | ~10% | 50% | 15+ |
| **TOTAL** | 9.69% | 75%+ | 90+ |

---

## 🛠️ Implementation Strategy

### Phase 1: Critical Functions (Day 1)
1. ✅ ROI calculations (calculations-engine.js)
2. ✅ Input validation (data-validation.js)
3. Basic tests for immediate coverage boost

### Phase 2: Advanced Metrics (Day 2)
1. ⚠️ Sharpe Ratio, Beta, Drawdown
2. ⚠️ Portfolio validation
3. Edge cases and error handling

### Phase 3: API & Integration (Day 3)
1. ⚠️ Market data service mocking
2. ⚠️ Cache and rate limiting
3. ⚠️ Error handling and retries

### Phase 4: Cleanup & Polish (Day 4)
1. Add remaining test cases
2. Improve test descriptions
3. Run coverage report
4. Fix any gaps

---

## 🧪 Testing Tools

- **Jest**: Unit testing framework
- **Jest Coverage**: Code coverage reporting
- **Jest Mocks**: Mock external dependencies
- **Supertest**: API testing (if needed)

---

## 📈 Success Metrics

✅ **Primary Goal:** 75%+ overall coverage  
✅ **Secondary Goals:**
  - 85%+ for calculations-engine.js
  - 90%+ for data-validation.js
  - 70%+ for market-data-service.js
  - All critical paths tested
  - All edge cases covered
  - 100% test pass rate

---

## 🚀 Ready to Start!

Priority order:
1. **calculations-engine.test.js** - Expand existing tests
2. **data-validation.test.js** - Create new test file
3. **market-data-service.test.js** - Create with mocks

Let's begin! 🎯
