# 📊 Market Data Configuration Guide

**Version:** 3.3.0  
**Status:** ✅ Production Ready  
**Last Updated:** 1. listopadu 2025

---

## 📖 Overview

Portfolio Manager Pro includes real-time market data integration with live stock prices. This guide explains how to configure market data providers for optimal experience.

---

## 🚀 Quick Start (Recommended: Yahoo Finance)

### Option 1: Yahoo Finance (NO API Key Required) ✅ EASIEST

Yahoo Finance doesn't require authentication, making it the easiest option.

**Status:** ✅ Works out-of-the-box  
**Cost:** FREE  
**Setup time:** 0 minutes

```javascript
// Already configured - just add stocks to watchlist!
// No additional setup needed
```

**To use:**
1. Open the Portfolio Manager
2. Click "Market Data" button
3. Search for stock symbols (e.g., `AAPL`, `MSFT`, `TSLA`)
4. Click to add to watchlist
5. Watch live prices update!

**Popular symbols to try:**
- `AAPL` - Apple
- `MSFT` - Microsoft
- `GOOGL` - Google
- `AMZN` - Amazon
- `TSLA` - Tesla
- `META` - Meta Platforms
- `NVDA` - NVIDIA

---

## 🔌 Advanced: Other Providers

### Option 2: Alpha Vantage (Free Tier Available)

**Cost:** FREE (5 API calls/minute) → Premium available  
**Setup time:** 5 minutes  
**Priority:** Medium

1. **Get API Key:**
   - Go to https://www.alphavantage.co/
   - Sign up (free)
   - Check your email for API key
   - Copy the key

2. **Configure in Application:**
   - Open `.env.production` (or create it)
   - Add:
   ```bash
   VITE_ALPHA_VANTAGE_API_KEY=your-api-key-here
   ```

3. **Enable in Code:**
   - Edit `src/js/features/marketplace/real-market-data-service.js`
   - Change `enabled: false` to `enabled: true`:
   ```javascript
   alphavantage: {
     name: 'Alpha Vantage',
     enabled: true,  // ← Change this to true
     apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
   }
   ```

4. **Rebuild:**
   ```bash
   npm run build
   npm run preview
   ```

---

### Option 3: Finnhub (Recommended for Advanced Users)

**Cost:** FREE (60 API calls/minute) → Premium available  
**Setup time:** 5 minutes  
**Priority:** High (best free tier)

1. **Get API Key:**
   - Go to https://finnhub.io/
   - Sign up (free)
   - Go to Dashboard → API keys
   - Copy your API key

2. **Configure:**
   - Edit `.env.production`:
   ```bash
   VITE_FINNHUB_API_KEY=your-api-key-here
   ```

3. **Enable in Code:**
   - Edit `src/js/features/marketplace/real-market-data-service.js`:
   ```javascript
   finnhub: {
     name: 'Finnhub',
     enabled: true,  // ← Change this to true
     apiKey: import.meta.env.VITE_FINNHUB_API_KEY,
   }
   ```

4. **Rebuild:**
   ```bash
   npm run build
   npm run preview
   ```

---

## ⚙️ Configuration File

### Environment Variables

Create or edit `.env.production`:

```bash
# Market Data API Keys (all optional - Yahoo Finance works without them)
VITE_ALPHA_VANTAGE_API_KEY=
VITE_FINNHUB_API_KEY=
VITE_CORS_PROXY=https://cors-anywhere.herokuapp.com/

# Firebase (optional for cloud sync)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=

# Analytics
VITE_GA_MEASUREMENT_ID=

# Environment
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.investicni-portfolio.cz
```

### Code Configuration

**File:** `src/js/features/marketplace/real-market-data-service.js`

```javascript
// Lines 14-42: Provider configuration
this.config = {
  providers: {
    yahoo: {
      name: 'Yahoo Finance',
      enabled: true,          // ← Set to true/false
      priority: 1,            // ← Priority order (1=highest)
    },
    alphavantage: {
      name: 'Alpha Vantage',
      enabled: false,         // ← Set to true to enable
      priority: 2,
      apiKey: process.env.VITE_ALPHA_VANTAGE_API_KEY,
    },
    finnhub: {
      name: 'Finnhub',
      enabled: false,         // ← Set to true to enable
      priority: 3,
      apiKey: process.env.VITE_FINNHUB_API_KEY,
    },
  },
  cache: {
    duration: 15 * 60 * 1000, // Cache for 15 minutes
  },
  retry: {
    maxAttempts: 3,           // Retry failed requests 3 times
    delayMs: 1000,            // Wait 1 second between retries
  },
};
```

---

## 🐛 Troubleshooting

### "Market Data - Not configured"

**Problem:** Message shows "Not configured"

**Solutions:**
1. ✅ Yahoo Finance should work without any setup
2. If using other providers, check:
   - API key is correct (copy/paste exactly)
   - Provider is enabled in code (`enabled: true`)
   - Application is rebuilt (`npm run build`)
   - Environment variable is set properly

### No prices appearing

**Cause 1: Provider not configured**
- Check that `enabled: true` for at least one provider
- Rebuild with `npm run build`

**Cause 2: API rate limit hit**
- Wait a few minutes
- Try switching providers (priority order will auto-switch)
- Upgrade to paid tier

**Cause 3: Stock symbol not found**
- Use correct symbol (e.g., `AAPL` not `Apple`)
- Check symbol exists on the exchange

### Stock search isn't working

**Solution:** This was a bug in v3.3.0 that's now fixed!
- Update to latest version
- Run `npm run build`
- Clear browser cache (Cmd+Shift+Delete)
- Try searching again

---

## 📊 How It Works

### Market Data Flow

```
User searches for "AAPL"
        ↓
Application tries providers in priority order:
  1. Yahoo Finance (if enabled)
  2. Alpha Vantage (if enabled + API key)
  3. Finnhub (if enabled + API key)
        ↓
First successful provider returns price data
        ↓
Data is cached for 15 minutes
        ↓
Price is displayed and updated every 2 seconds
```

### Fallback System

If all providers fail:
- ✅ App still works with simulated demo prices
- Prices update realistically
- You can still use all features
- Perfect for testing/development

---

## 🎯 Live Price Features

Once configured, you get:

✅ **Real-time price updates** - Every 2 seconds  
✅ **Price history** - Track price changes  
✅ **Volume data** - Trading volume  
✅ **Bid/Ask spreads** - Market depth  
✅ **High/Low** - Daily ranges  
✅ **Change indicators** - % change visualization  
✅ **Automatic caching** - Smart 15-minute cache  
✅ **Fallback system** - Works even if API fails  

---

## 🔐 Security Notes

- **API Keys** are NOT sent to client
- Keys stay in `.env.production` (server-side only)
- CORS proxy handles cross-origin requests safely
- No sensitive data exposed in browser

---

## 📈 Production Deployment

### Netlify / Vercel / Cloudflare

1. Add environment variables in dashboard:
   ```
   VITE_ALPHA_VANTAGE_API_KEY=xxx
   VITE_FINNHUB_API_KEY=yyy
   ```

2. Deploy (environment variables are automatically used)

3. Verify in browser console:
   ```javascript
   window.marketDataService.config
   ```

### Docker

```dockerfile
# Build with environment variables
docker build --build-arg VITE_ALPHA_VANTAGE_API_KEY=xxx \
             --build-arg VITE_FINNHUB_API_KEY=yyy \
             -t portfolio-manager:latest .
```

---

## 📊 Testing

### Test Market Data Integration

```javascript
// In browser console:

// Test Yahoo Finance
window.marketDataFeed.getPrice('AAPL')

// Add symbol to watchlist
window.marketDataFeed.addSymbolToWatch('MSFT')

// Check subscriptions
window.marketDataFeed.subscriptions

// Check cached prices
window.marketDataFeed.priceData
```

---

## 💡 Tips & Tricks

**1. Start with Yahoo Finance**
- No API key needed
- Works globally
- Good enough for most use cases

**2. Use Finnhub for high-frequency**
- Best free tier (60 calls/minute)
- More reliable for detailed data
- Best documentation

**3. Use Alpha Vantage for technical analysis**
- Good for historical data
- Free tier includes technical indicators
- Good API documentation

**4. Combine providers**
- Set multiple providers to true
- System automatically switches if one fails
- Provides redundancy

**5. Cache efficiently**
- 15-minute cache reduces API calls
- Adjust if needed in config
- Prevents rate limiting

---

## 🚀 Next Steps

1. ✅ Try Yahoo Finance (works out-of-the-box)
2. 🔌 Add more providers if needed
3. 📊 Monitor API usage
4. 🚀 Deploy to production
5. 📈 Track your portfolio!

---

## 📞 Support

- **Setup help:** This guide
- **API Issues:** Check provider documentation
- **Bug reports:** GitHub Issues
- **Questions:** GitHub Discussions

---

## 🔗 Useful Links

- [Yahoo Finance](https://finance.yahoo.com/)
- [Alpha Vantage](https://www.alphavantage.co/)
- [Finnhub](https://finnhub.io/)
- [Portfolio Manager GitHub](https://github.com/PatrikLuks/investicni-portfolio)

---

**Happy investing! 📈💰**
