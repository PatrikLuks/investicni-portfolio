# 🎓 Portfolio Manager Pro - Quick Reference

**Version**: 3.0.0  
**Last Updated**: October 8, 2025

---

## ⚡ Quick Commands

### Starting the Application
```bash
# Simplest (no server needed)
open investPortfolio.html

# Python server
python3 -m http.server 8080

# Node.js server
npx serve -p 8080

# Docker
docker-compose up -d

# Quick start script
./QUICKSTART.sh
```

### Testing
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:unit          # Unit tests only
npm run lint               # Check code quality
```

### Building
```bash
docker build -t pm-pro .   # Build Docker image
npm run format             # Format code
npm run security:audit     # Security check
```

---

## 🎯 Common Tasks

### Adding a Transaction
1. Fill in fund name, producer, investment, current value
2. Click "Přidat fond"
3. Auto-saved to localStorage

### Generating a Report
1. Add transactions
2. Click "Generovat report"
3. Downloads HTML file with charts

### Exporting Data
- **PDF**: Click PDF export button
- **Excel**: Click Excel export button
- **JSON**: Save from browser console

### Keyboard Shortcuts
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+S` - Manual save
- `Ctrl+F` - Search
- `Ctrl+D` - Toggle dark mode
- `?` - Show shortcuts

---

## 📁 Project Structure (Simplified)

```
investicni-portfolio/
├── investPortfolio.html    ← Main entry point
├── app.js                  ← Core logic
├── calculations-engine.js  ← Financial math
├── charts-manager.js       ← Visualizations
├── tests/                  ← Test files
├── Dockerfile              ← Container config
└── docs/                   ← Documentation
```

---

## 🔧 Configuration

### LocalStorage Keys
- `portfolioData_v2` - Main data
- `portfolioClient_v2` - Client info
- `portfolioLastSave_v2` - Last save time

### Environment Variables (Docker)
- `PORT` - Server port (default: 80)
- `NODE_ENV` - Environment (production/development)
- `TZ` - Timezone (default: Europe/Prague)

---

## 📊 Key Metrics Explained

| Metric | Description | Good Value |
|--------|-------------|------------|
| **ROI** | Return on Investment | >10% |
| **CAGR** | Compound Annual Growth Rate | >8% |
| **Sharpe Ratio** | Risk-adjusted return | >1.0 |
| **Volatility** | Price fluctuation | <20% |
| **Max Drawdown** | Largest peak-to-trough decline | <30% |

---

## 🐛 Troubleshooting

### Charts Not Showing
```javascript
// Check console for errors
// Ensure Chart.js loaded
console.log(typeof Chart); // Should not be "undefined"
```

### Data Not Saving
```javascript
// Test localStorage
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ localStorage works');
} catch(e) {
  console.error('❌ localStorage blocked');
}
```

### Performance Issues
1. Clear browser cache
2. Reduce number of chart points
3. Disable animations (in settings)
4. Check browser extensions

### Error Messages
- **"Cannot read property..."** → Refresh page
- **"localStorage full"** → Clear old data
- **"Network error"** → Check internet connection

---

## 🔒 Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Keep dependencies updated
3. ✅ Review security logs weekly
4. ✅ Backup data regularly
5. ✅ Use strong passwords for cloud sync

---

## 📞 Quick Links

- [Full Documentation](README.md)
- [User Guide](USER_GUIDE.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
- [Security Policy](SECURITY.md)
- [GitHub Issues](https://github.com/PatrikLuks/investicni-portfolio/issues)

---

## 💡 Tips & Tricks

### Performance
- Use "Minimal mode" for large portfolios
- Enable lazy loading for charts
- Disable animations if needed

### Data Management
- Export data monthly as backup
- Use version control features
- Tag important milestones

### Workflow
- Set up auto-save interval (default: 30s)
- Use keyboard shortcuts for speed
- Create custom dashboards

---

**Need Help?** Check [USER_GUIDE.md](USER_GUIDE.md) for detailed instructions.
