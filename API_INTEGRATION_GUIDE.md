# 🔌 API Integration Guide - v3.1.0

## Overview

Investment Portfolio Manager Pro v3.1.0 introduces **real-time market data integration** through multiple API providers with automatic fallback and intelligent caching.

## Supported Providers

### 1. Yahoo Finance (Default - Free, No API Key)

- **Status**: ✅ Enabled by default
- **Rate Limit**: ~2,000 requests/hour
- **Coverage**: All major exchanges (NYSE, NASDAQ, LSE, etc.)
- **Features**: Real-time quotes, historical data, company info
- **Best for**: General market data, no configuration needed

```javascript
// Yahoo Finance is ready out-of-the-box
const quote = await marketDataService.getQuote('AAPL');
```

### 2. Alpha Vantage (Optional - Free Tier Available)

- **Status**: 🔒 Requires API key
- **Rate Limit**: 500 requests/day (free tier)
- **Coverage**: Global equities, forex, crypto
- **Get API Key**: [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
- **Best for**: Backup provider, technical indicators

**Setup:**
```javascript
// In UI: Settings → API Settings → Enter Alpha Vantage Key
// Or programmatically:
marketDataService.saveApiKeys({
  alphavantage: 'YOUR_API_KEY_HERE'
});
```

### 3. Finnhub (Optional - Free Tier Available)

- **Status**: 🔒 Requires API key
- **Rate Limit**: 60 calls/minute (free tier)
- **Coverage**: US, EU, Asian markets
- **Get API Key**: [https://finnhub.io/register](https://finnhub.io/register)
- **Best for**: High-frequency updates, extended hours trading

**Setup:**
```javascript
marketDataService.saveApiKeys({
  finnhub: 'YOUR_FINNHUB_TOKEN'
});
```

## Multi-Provider Fallback System

The system automatically tries providers in priority order:

```
Yahoo Finance (Priority 1)
    ↓ (fails)
Alpha Vantage (Priority 2)
    ↓ (fails)
Finnhub (Priority 3)
    ↓ (all failed)
Error reported to user
```

**Fallback triggers:**
- HTTP errors (503, 429, etc.)
- Rate limit exceeded
- Invalid response format
- Network timeout

## Data Caching

**Cache Duration**: 15 minutes (configurable)

```javascript
// First request - fetches from API
const quote1 = await marketDataService.getQuote('AAPL');
console.log(quote1.cached); // false

// Second request within 15 min - returns cached
const quote2 = await marketDataService.getQuote('AAPL');
console.log(quote2.cached); // true

// Clear cache manually
marketDataService.clearCache();
```

**Benefits:**
- ⚡ Faster response times (< 5ms for cached data)
- 💰 Reduces API usage costs
- 🛡️ Avoids rate limit violations
- 🌐 Works offline with cached data

## Usage Examples

### Basic Quote Retrieval

```javascript
// Single quote
const apple = await marketDataService.getQuote('AAPL');

console.log(apple);
// {
//   symbol: 'AAPL',
//   price: 178.45,
//   previousClose: 176.20,
//   change: 2.25,
//   changePercent: 1.28,
//   volume: 52430000,
//   marketState: 'REGULAR',
//   currency: 'USD',
//   timestamp: 1704124800000,
//   source: 'yahoo',
//   cached: false
// }
```

### Batch Quotes

```javascript
// Get multiple quotes at once
const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
const quotes = await marketDataService.getBatchQuotes(symbols);

quotes.forEach(quote => {
  if (quote.error) {
    console.error(`${quote.symbol}: ${quote.error}`);
  } else {
    console.log(`${quote.symbol}: $${quote.price} (${quote.changePercent}%)`);
  }
});
```

### Symbol Search

```javascript
// Search for companies
const results = await marketDataService.searchSymbol('apple');

console.log(results);
// [
//   {
//     symbol: 'AAPL',
//     name: 'Apple Inc.',
//     type: 'EQUITY',
//     exchange: 'NASDAQ'
//   },
//   {
//     symbol: 'AAPL.MX',
//     name: 'Apple Inc.',
//     type: 'EQUITY',
//     exchange: 'MEX'
//   }
// ]
```

## Auto-Update Feature

Enable automatic portfolio updates every 15 minutes:

```javascript
// Start auto-update
const symbols = ['AAPL', 'MSFT', 'GOOGL'];
autoUpdateService.start(symbols);

// Listen for updates
window.addEventListener('marketDataUpdate', (event) => {
  const { quotes } = event.detail;
  console.log('Portfolio updated:', quotes.length, 'symbols');
  updatePortfolioWithQuotes(quotes);
});

// Stop auto-update
autoUpdateService.stop();

// Change update interval
autoUpdateService.setUpdateInterval(5); // 5 minutes
```

**UI Controls:**
- ⚙️ Settings → Enable auto-update
- 🔄 Manual refresh button
- ⏰ Configurable interval (5-60 minutes)

## Error Handling

```javascript
try {
  const quote = await marketDataService.getQuote('INVALID_SYMBOL');
} catch (error) {
  console.error('Failed to fetch quote:', error.message);
  // Error message includes all provider failures:
  // "All providers failed:
  //  Yahoo Finance: Invalid symbol
  //  Alpha Vantage: Symbol not found
  //  Finnhub: No data available"
}
```

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Rate limit exceeded` | Too many requests | Wait 60 seconds or add API keys |
| `Invalid API key` | Wrong/expired key | Check API key in settings |
| `Symbol not found` | Invalid ticker | Use symbol search feature |
| `Network error` | No internet | Check connection, use cached data |

## Rate Limiting

Built-in rate limit protection:

```javascript
// Automatic rate limiting (60 requests/minute per provider)
for (let i = 0; i < 100; i++) {
  const quote = await marketDataService.getQuote(`SYMBOL${i}`);
  // Automatically skips provider if rate limit hit
}
```

**Rate Limits by Provider:**

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Yahoo Finance | ~2,000/hour | N/A |
| Alpha Vantage | 500/day | 75-1,200/min |
| Finnhub | 60/min | 300-600/min |

## Best Practices

### 1. Use Caching Wisely

```javascript
// ❌ Bad: Clearing cache unnecessarily
setInterval(() => {
  marketDataService.clearCache();
}, 1000);

// ✅ Good: Let cache expire naturally
const quote = await marketDataService.getQuote('AAPL');
```

### 2. Batch Requests

```javascript
// ❌ Bad: Individual requests
for (const symbol of symbols) {
  await marketDataService.getQuote(symbol);
}

// ✅ Good: Batch request
const quotes = await marketDataService.getBatchQuotes(symbols);
```

### 3. Handle Errors Gracefully

```javascript
// ❌ Bad: Unhandled errors crash app
const quote = await marketDataService.getQuote('AAPL');

// ✅ Good: Graceful degradation
try {
  const quote = await marketDataService.getQuote('AAPL');
  updateUI(quote);
} catch (error) {
  showToast('Using cached prices', 'warning');
  updateUI(getCachedPrice('AAPL'));
}
```

### 4. Configure Multiple Providers

```javascript
// ✅ Best: Configure all 3 providers for maximum reliability
marketDataService.saveApiKeys({
  alphavantage: 'YOUR_KEY',
  finnhub: 'YOUR_TOKEN'
});
// Yahoo Finance works automatically
```

## API Response Format

### Standard Quote Object

```typescript
interface Quote {
  symbol: string;           // Ticker symbol
  price: number;            // Current price
  previousClose: number;    // Previous closing price
  change: number;           // Price change ($)
  changePercent: number;    // Price change (%)
  volume?: number;          // Trading volume
  marketState?: string;     // 'REGULAR' | 'CLOSED' | 'PRE' | 'POST'
  currency?: string;        // 'USD' | 'EUR' | etc.
  high?: number;            // Day high
  low?: number;             // Day low
  open?: number;            // Opening price
  timestamp: number;        // Unix timestamp
  source: string;           // 'yahoo' | 'alphavantage' | 'finnhub'
  cached: boolean;          // true if from cache
}
```

## Configuration

### localStorage Keys

```javascript
// API keys storage
{
  "marketDataApiKeys": {
    "alphavantage": "YOUR_KEY",
    "finnhub": "YOUR_TOKEN"
  }
}

// Auto-update preference
{
  "marketDataAutoUpdate": "true"
}
```

### Provider Configuration

```javascript
// Get provider status
const status = marketDataService.getProviderStatus();
console.log(status);
// [
//   { name: 'Yahoo Finance', enabled: true, hasApiKey: false, priority: 1 },
//   { name: 'Alpha Vantage', enabled: true, hasApiKey: true, priority: 2 },
//   { name: 'Finnhub', enabled: false, hasApiKey: false, priority: 3 }
// ]
```

## Security Considerations

1. **API Keys**: Stored in localStorage (client-side only)
2. **HTTPS**: All API calls use HTTPS
3. **CSP**: Content Security Policy restricts external requests
4. **No Server**: No backend = no server-side key exposure

**Recommendation**: For production apps, use a backend proxy to hide API keys.

## Troubleshooting

### Issue: "All providers failed"

**Solution:**
1. Check internet connection
2. Verify API keys are correct
3. Check rate limits (wait 60 seconds)
4. Try different symbol

### Issue: "Cached data is old"

**Solution:**
```javascript
// Clear cache and force fresh data
marketDataService.clearCache();
const quote = await marketDataService.getQuote('AAPL');
```

### Issue: "Symbol not found"

**Solution:**
```javascript
// Use symbol search first
const results = await marketDataService.searchSymbol('apple');
const correctSymbol = results[0].symbol; // 'AAPL'
const quote = await marketDataService.getQuote(correctSymbol);
```

## Advanced Features

### Custom Provider Priority

```javascript
// Change provider priority (higher = first)
marketDataService.providers.finnhub.priority = 1;
marketDataService.providers.yahoo.priority = 2;
```

### Historical Data (Coming Soon)

```javascript
// Planned for v3.2.0
const history = await marketDataService.getHistoricalData('AAPL', {
  from: '2024-01-01',
  to: '2024-12-31',
  interval: '1d'
});
```

## Support

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/yourusername/portfolio-manager/issues)
- 💬 [Discussions](https://github.com/yourusername/portfolio-manager/discussions)

---

**Last Updated**: 2024-01-15 | **Version**: 3.1.0
