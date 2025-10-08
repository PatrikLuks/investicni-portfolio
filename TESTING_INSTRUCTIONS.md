# 🚀 FORCE REFRESH INSTRUCTIONS

## Pro testování oprav:

1. **Otevři hlavní aplikaci**: http://localhost:8002/investPortfolio.html

2. **Hard refresh (vymaž cache)**:
   - **Chrome/Edge**: Ctrl+Shift+R nebo F12 → Network → Disable cache + F5
   - **Firefox**: Ctrl+Shift+R nebo F12 → Network → Gear icon → Disable HTTP cache + F5  
   - **Safari**: Cmd+Option+R

3. **Otevři Developer Console** (F12) a sleduj logy

4. **Očekávaný výstup (BEZ chyb)**:
   ```
   ✅ Error Handler initialized
   ✅ SW V3: Registered
   ✅ Library Loader initialized  
   ✅ Loaded: library-loader.js
   ✅ Accessibility Manager initialized
   ✅ Loaded: accessibility.js
   ✅ Loaded: notification-system.js     ← Žádná SyntaxError!
   ✅ Loaded: command-stack.js           ← Žádná SyntaxError!
   ✅ Data Validation Manager ready
   ✅ Loaded: data-validation.js
   ✅ Calculations Engine ready
   ✅ Loaded: calculations-engine.js
   ✅ Loaded: app.js                     ← Žádná TypeError!
   ```

5. **Pokud stále vidíš chyby**:
   - Zkus Incognito/Private mode
   - Nebo otevři: http://localhost:8002/investPortfolio.html?v=3&clear=cache

## ✅ Fix Summary:

- **Error Handler**: Debounce + vyšší threshold
- **Progressive Loading**: 200ms pauzy mezi moduly  
- **DOM Fix**: initializeApp() wrapper
- **Variable Conflicts**: Unikátní style názvy
- **Cache Bust**: Nová SW verze