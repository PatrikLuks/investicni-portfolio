# portfolioMath.js – Průvodce integrací & mapování funkcí

## 📋 Stav projektu

✅ **Hotovo:**
- `src/domain/portfolioMath.js` – 8 čistých funkcí
- `__tests__/portfolioMath.test.js` – 36 testů (100% pass)
- `ASSUMPTIONS.md` – detailní dokumentace předpokladů
- Jest config aktualizován

---

## 🎯 Čisté funkce – přehled

| Funkce | Vstup | Výstup | Vzorec | Vedlejší efekty |
|--------|-------|--------|--------|-----------------|
| `normalizePositions()` | `Position[]` | `Position[]` | Validace & normalizace | ŽÁDNÉ |
| `computeMarketValue()` | `Position[]`, `priceMap` | `{ items, total }` | `Σ (qty × price)` | ŽÁDNÉ |
| `computeAllocation()` | `Position[]`, `priceMap` | `{ byKey: {...}, total }` | `weight = value / total` | ŽÁDNÉ |
| `computePnL()` | `Position[]`, `priceMap` | `{ items, totalPnl, ... }` | `pnl = mv - cost` | ŽÁDNÉ |
| `computeDailyChange()` | `Position[]`, `priceToday`, `priceYesterday` | `{ delta, deltaPct, ... }` | `delta = mv_t - mv_{t-1}` | ŽÁDNÉ |
| `computeTimeSeriesValue()` | `Position[]`, `pricesByDate` | `[{date, value}, ...]` | Iterace přes data | ŽÁDNÉ |
| `computeAnnualizedReturn()` | `series` | `number \| null` | CAGR: `(Vf/Vi)^(1/y) - 1` | ŽÁDNÉ |
| `computeWeightedAverageReturn()` | `series` | `number \| null` | `Σ (w_i × r_i)` | ŽÁDNÉ |

---

## 🔗 Mapování na UI komponenty

Jakmile máte HTML/JS ze `ZADANI`, použijte toto mapování:

### **1. Portfolio Summary Card** 
```javascript
// Vstup: positions[] + prices
const { total } = computeMarketValue(positions, prices);
const { totalMV, totalCost, totalPnl } = computePnL(positions, prices);

// Výstup: přeposlat do HTML
displayCard({
  totalValue: total,
  gain: totalPnl,
  gainPercent: totalPnl / totalCost,
});
```

**Odkaz:** `computeMarketValue()`, `computePnL()`

---

### **2. Allocation Pie Chart**
```javascript
// Vstup: positions[] + prices
const { byKey } = computeAllocation(positions, prices);

// Výstup: (assetClass -> weight) → Chart.js, etc.
const chartData = Object.entries(byKey).map(([label, {weight}]) => ({
  label,
  value: weight * 100, // procenta
}));
```

**Odkaz:** `computeAllocation()`

---

### **3. Daily Change Badge**
```javascript
// Vstup: positions[], ceny dnes + včera
const { delta, deltaPct, mvToday, mvYesterday } = computeDailyChange(
  positions,
  priceToday,
  priceYesterday
);

// Výstup: 
displayBadge({
  label: delta > 0 ? "📈" : "📉",
  value: delta.toFixed(2),
  percent: (deltaPct * 100).toFixed(2),
  color: delta > 0 ? "green" : "red",
});
```

**Odkaz:** `computeDailyChange()`

---

### **4. Performance Chart (Line chart s denními hodnotami)**
```javascript
// Vstup: positions[], ceny po datech
const series = computeTimeSeriesValue(positions, pricesByDate);

// Výstup: Timestamp series pro Chart.js
const chartSeries = {
  labels: series.map(x => x.date),
  datasets: [{
    label: "Portfolio Value",
    data: series.map(x => x.value),
  }],
};

renderChart(chartSeries);
```

**Odkaz:** `computeTimeSeriesValue()`

---

### **5. Performance Metrics (Annualized Return, TVWR)**
```javascript
// Vstup: histórie denních hodnot
const series = computeTimeSeriesValue(positions, historicalPrices);

// Výstupy:
const cagr = computeAnnualizedReturn(series);
const tvwr = computeWeightedAverageReturn(series);

// Zobrazení:
displayMetrics({
  annualizedReturn: `${(cagr * 100).toFixed(2)}% p.a.`,
  weightedReturn: `${(tvwr * 100).toFixed(2)}%`,
});
```

**Odkaz:** `computeAnnualizedReturn()`, `computeWeightedAverageReturn()`

---

### **6. Position Details Table**
```javascript
// Vstup: positions[], prices
const mvResult = computeMarketValue(positions, prices);
const pnlResult = computePnL(positions, prices);
const allocation = computeAllocation(positions, prices);

// Výstup: řádky tabulky
const tableRows = positions.map((pos, idx) => ({
  ticker: pos.ticker,
  qty: mvResult.items[idx].quantity,
  price: mvResult.items[idx].price,
  value: mvResult.items[idx].marketValue,
  gain: pnlResult.items[idx].pnl,
  gainPct: pnlResult.items[idx].pnlPct,
  weight: allocation.byKey[pos.assetClass || pos.ticker]?.weight || 0,
}));

renderTable(tableRows);
```

**Odkaz:** `computeMarketValue()`, `computePnL()`, `computeAllocation()`

---

## 🧪 Test Results

```bash
$ npm test -- __tests__/portfolioMath.test.js --no-coverage

Test Suites: 1 passed, 1 total
Tests:       36 passed, 36 total
Time:        ~1 sec
```

**Pokrytí:**
- ✅ Normalizace & validace (5 testů)
- ✅ Tržní hodnota (5 testů)
- ✅ Alokace (4 testy)
- ✅ P&L (3 testy)
- ✅ Denní změna (4 testy)
- ✅ Časová řada (2 testy)
- ✅ CAGR (8 testů)
- ✅ TVWR (4 testy)
- ✅ End-to-end (1 test)

---

## 📥 Vstupní data – očekávaný formát

### Pozice

```javascript
const positions = [
  {
    ticker: "AAPL",
    quantity: 10,
    avgCost: 150,           // za kus (CZK/EUR…)
    assetClass: "Equity",   // volitelné
  },
  {
    ticker: "SPY",
    quantity: 5,
    avgCost: 500,
    assetClass: "ETF",
  },
  {
    ticker: "CASH",
    quantity: 1000,
    // avgCost chybí → nula cost (airdrop, hotovost)
    assetClass: "Cash",
  },
];
```

### Ceny (jednodenní)

```javascript
const prices = {
  AAPL: 210.35,
  SPY: 600.10,
  CASH: 1.00,
};
```

### Ceny (historické – pro výnosy)

```javascript
const pricesByDate = {
  "2025-10-20": { AAPL: 200, SPY: 590, CASH: 1 },
  "2025-10-21": { AAPL: 205, SPY: 595, CASH: 1 },
  "2025-10-22": { AAPL: 210, SPY: 600, CASH: 1 },
  // … další dny
};
```

---

## 🚀 Příklad – úplný workflow

```javascript
import {
  computeMarketValue,
  computeAllocation,
  computePnL,
  computeDailyChange,
  computeTimeSeriesValue,
  computeAnnualizedReturn,
} from "./src/domain/portfolioMath.js";

// 1. Načtení dat
const portfolio = await fetchPortfolio();
const positions = portfolio.positions;
const currentPrices = portfolio.currentPrices;
const historicalPrices = portfolio.historicalPrices;

// 2. Výpočty
const metrics = {
  // Dnešní situace
  market: computeMarketValue(positions, currentPrices),
  allocation: computeAllocation(positions, currentPrices),
  pnl: computePnL(positions, currentPrices),
  
  // Denní změna
  daily: computeDailyChange(
    positions,
    currentPrices,
    historicalPrices["2025-10-21"]
  ),
  
  // Historické metriky
  timeSeries: computeTimeSeriesValue(positions, historicalPrices),
};

// 3. Výpočet výnosů z časové řady
metrics.cagr = computeAnnualizedReturn(metrics.timeSeries);

// 4. Renderování UI
updateDashboard(metrics);
```

---

## 🔍 Diagnostika chyb

### ❌ Chyba: "Missing or invalid price for ticker X"

**Příčina:** `priceMap` neobsahuje ticker.

**Řešení:**
```javascript
// ❌ Špatně:
const prices = { AAPL: 210 }; // Chybí SPY
computeMarketValue(positions, prices); // ❌ Error

// ✅ Správně:
const prices = { AAPL: 210, SPY: 600 };
computeMarketValue(positions, prices); // ✅ OK
```

---

### ❌ Chyba: "quantity must be finite number"

**Příčina:** `quantity` není číslo nebo je `NaN`/`Infinity`.

**Řešení:**
```javascript
// ❌ Špatně:
{ ticker: "AAPL", quantity: "10" }      // string
{ ticker: "AAPL", quantity: NaN }        // NaN
{ ticker: "AAPL", quantity: Infinity }   // Infinity

// ✅ Správně:
{ ticker: "AAPL", quantity: 10 }        // number
{ ticker: "AAPL", quantity: 10.5 }      // decimální OK
```

---

### ❌ Negativní váhy v alokaci

**Příčina:** Možné pokud máte short pozice (zatím nepodporováno).

**Řešení:** Prozatím filtrujte short pozice (`quantity < 0`).

---

## 📖 Dokumentace

- **ASSUMPTIONS.md** – Detailní předpoklady, edge cases
- **portfolioMath.js** – Zdrojový kód s JSDoc
- **portfolioMath.test.js** – Příklady použití v testech

---

## 🔮 Budoucí rozšíření

### Plánované (v pořadí priority)

1. **Short pozice** – `quantity < 0` (margin/hedging)
2. **Multi-FX** – Konverze mezi měnami (kurzy k datu)
3. **Transakce** – Nákupy/prodeje mezi dny (cost basis update)
4. **Benchmark** – Relativní výnos vs. index
5. **Risk metriky** – Volatilita, correlation, VaR
6. **Reinvestice** – True TVWR s cash flow

### Architektura rozšíření

```javascript
// src/domain/portfolioMath.js – zůstává pure
export function computeShortValue(shortPositions, prices) { … }

// src/data/currencyConverter.js – I/O, side-effects
export async function convertPrices(prices, targetCurrency, date) { … }

// src/domain/riskMetrics.js – nový modul
export function computeVolatility(series) { … }
```

---

## 🎓 Čepování pro Kubu (Claude Haiku 4.5)

Jakmile je připraven Kuba:

1. **Vložte HTML/JS** ze `ZADANI/` do workspacu
2. **Zkopírujte cestu** – např. `/path/to/ZADANI/app.html`
3. **Poslat Kubovi:**
   ```
   "Přečti /path/to/ZADANI/app.html a app.js. 
    Vytvoř audit: funkce, vstupy, výstupy, side-effects. 
    Zmapuj na portfolioMath.js. 
    Napiš React/Vue komponenty s integrací."
   ```

4. **Kuba integrace spojí.**

---

## 📞 Q&A

**Q: Mohu spustit testy lokálně?**

A: Ano.
```bash
npm test -- __tests__/portfolioMath.test.js
npm test -- --watch  # Watch mode
npm test -- --coverage  # S pokrytím
```

---

**Q: Jak přidám novou metriku (např. Sharpe ratio)?**

A: Přidejte do `src/domain/portfolioMath.js`:
```javascript
export function computeSharpeRatio(series, riskFreeRate = 0.02) {
  // Implementace
}
```

Pak napište test v `__tests__/portfolioMath.test.js`.

---

**Q: Co když mám problémy s měnou?**

A: Všechny ceny konvertujte **na jednu měnu** před vstupem. Například:

```javascript
const conversionRates = { EUR: 1.08, GBP: 1.27 };
const prices = {
  AAPL: 210, // USD → CZK
  ASML: 870 * 1.08, // EUR → CZK
  GSK: 1600 * 1.27, // GBP → CZK
};
```

---

**Q: Funguje to s kryptem?**

A: Ano! Stačí přidat `avgCost` a `price` v Kč. Dezimální `quantity` je povolena.

```javascript
{
  ticker: "BTC",
  quantity: 0.5,
  avgCost: 1200000, // CZK/BTC
  assetClass: "Crypto",
}
```

---

## 🎉 Shrnutí

| Položka | Status |
|---------|--------|
| Čisté funkce | ✅ 8/8 |
| Testy | ✅ 36/36 |
| Dokumentace | ✅ ASSUMPTIONS.md |
| Integrační průvodce | ✅ Tento soubor |
| Kuba-ready | ✅ Čekáme HTML/JS |

**Hotovo! Připraveno pro Kubu.** 🚀
