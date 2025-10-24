# portfolioMath.js – Čisté funkce pro portfolio výpočty

## 🎯 Cíl

Dodání **hotového, testovaného jádra** s čistými funkcemi (pure functions) pro výpočty portfolia, připraveného k napojení na UI.

---

## 📦 Co je připraveno

### ✅ Zdrojový kód
- **`src/domain/portfolioMath.js`** (240 řádků)
  - 8 exportovaných čistých funkcí
  - JSDoc anotace pro IDE
  - Validace vstupů

### ✅ Testy
- **`__tests__/portfolioMath.test.js`** (480 řádků)
  - 36 testů, 100% pass
  - Edge cases: nulové portfolia, chybné vstupy, …
  - Integrationtesty end-to-end

### ✅ Dokumentace
- **`ASSUMPTIONS.md`** – Detailní předpoklady (měna, ceny, pozice, …)
- **`PORTFOLIO_MATH_INTEGRATION_GUIDE.md`** – Mapování na UI komponenty s příklady
- **`AUDIT_TEMPLATE.md`** – Template pro auditování `ZADANI/`

### ✅ Konfigurace
- Jest config aktualizován (`jest.config.cjs`)
- Babel podporuje ESM
- npm skripty: `npm test`, `npm test:watch`, `npm test -- --coverage`

---

## 🚀 Spuštění testů

```bash
# Všechny testy
npm test -- __tests__/portfolioMath.test.js

# Watch mode
npm test:watch

# S pokrytím
npm test -- __tests__/portfolioMath.test.js --coverage
```

**Aktuální výsledky:**
```
✅ Test Suites: 1 passed
✅ Tests: 36 passed
⏱️  Time: ~1 sec
```

---

## 📊 Obsah – 8 čistých funkcí

| # | Funkce | Účel | Vstup | Výstup |
|---|--------|------|-------|--------|
| 1 | `normalizePositions()` | Validace & normalizace pozic | `Position[]` | `Position[]` nebo chyba |
| 2 | `computeMarketValue()` | Tržní hodnota portfolia | `Position[]`, `priceMap` | `{ items, total }` |
| 3 | `computeAllocation()` | Procentuální alokace dle třídy aktiv | `Position[]`, `priceMap` | `{ byKey, total }` |
| 4 | `computePnL()` | Zisk/Ztráta proti nákladové bázi | `Position[]`, `priceMap` | `{ items, totalPnl, … }` |
| 5 | `computeDailyChange()` | Denní změna hodnoty | `Position[]`, `priceToday`, `priceYesterday` | `{ delta, deltaPct, … }` |
| 6 | `computeTimeSeriesValue()` | Časová řada MV z denních cen | `Position[]`, `pricesByDate` | `[{date, value}, …]` |
| 7 | `computeAnnualizedReturn()` | CAGR – annualizovaný výnos | `series` | `number` (např. 0.081 = 8.1%) |
| 8 | `computeWeightedAverageReturn()` | TVWR – vážený průměr výnosů | `series` | `number` nebo `null` |

---

## 🔗 Integrační body

Mapování na typické UI komponenty:

```
Dashboard
├── Summary Card
│   └─ computeMarketValue() + computePnL()
├── Allocation Pie Chart
│   └─ computeAllocation()
├── Daily Change Badge
│   └─ computeDailyChange()
├── Performance Line Chart
│   └─ computeTimeSeriesValue()
├── Performance Metrics (% p.a., TVWR)
│   └─ computeAnnualizedReturn() + computeWeightedAverageReturn()
└── Position Details Table
    └─ computeMarketValue() + computePnL() + computeAllocation()
```

Detaily → **`PORTFOLIO_MATH_INTEGRATION_GUIDE.md`**

---

## 📋 Předpoklady (explicitně vyjádřené)

### 1. Měna
- **Všechny ceny v jedné měně** (bez konverze)
- Příklad: CZK, EUR nebo USD, ale ne smíchané

### 2. Ceny
- `priceMap` = `{ ticker -> jednotková cena za kus }`
- Všechny tickery v portfoliu musí mít cenu
- Ceny mohou být 0, ale ne `NaN` či `Infinity`

### 3. Pozice
```javascript
{
  ticker: string,          // AAPL, SPY, …
  quantity: number,        // počet kusů (≥ 0)
  avgCost?: number,        // pořizovací cena za kus (volitelné)
  assetClass?: string,     // Equity, ETF, Bond, Cash, Crypto (volitelné)
}
```

### 4. Denní změna
- Pozice se **mezi dny neměnily** (quantity konstanta)
- Obchodování mezi dny → nutné aktualizovat `quantity`

### 5. Výnosy (CAGR, TVWR)
- Žádné cash flows uprostřed (bez depozitů/výběrů)
- Minimálně 2 datové body v `series`
- Kladné počáteční a koncové hodnoty

---

## 💡 Příklad – Úplný workflow

```javascript
import {
  computeMarketValue,
  computeAllocation,
  computePnL,
  computeDailyChange,
  computeTimeSeriesValue,
  computeAnnualizedReturn,
} from "./src/domain/portfolioMath.js";

// 1. Data
const positions = [
  { ticker: "AAPL", quantity: 10, avgCost: 150, assetClass: "Equity" },
  { ticker: "SPY", quantity: 5, avgCost: 500, assetClass: "ETF" },
];
const prices = { AAPL: 210, SPY: 600 };

// 2. Výpočty
const mv = computeMarketValue(positions, prices);        // 5100 CZK
const alloc = computeAllocation(positions, prices);      // Equity: 41%, ETF: 59%
const pnl = computePnL(positions, prices);               // +1100 CZK (zisk)

console.log(mv.total);                 // 5100
console.log(alloc.byKey.Equity.weight); // 0.411...
console.log(pnl.totalPnl);             // 1100
```

Více příkladů → **`PORTFOLIO_MATH_INTEGRATION_GUIDE.md`**

---

## 🔧 Instalace & setup

### Skripty v package.json (již přidáné)
```json
{
  "scripts": {
    "test": "NODE_OPTIONS=--experimental-vm-modules jest --coverage",
    "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
    "test:unit": "NODE_OPTIONS=--experimental-vm-modules jest --testPathPattern=tests/.*\\.test\\.js"
  }
}
```

### Nové soubory
```
✅ src/domain/portfolioMath.js
✅ src/data/                     (placeholder)
✅ src/ui/                       (placeholder)
✅ __tests__/portfolioMath.test.js
✅ ASSUMPTIONS.md
✅ PORTFOLIO_MATH_INTEGRATION_GUIDE.md
✅ AUDIT_TEMPLATE.md
```

---

## 📖 Dokumentace

| Soubor | Obsah |
|--------|-------|
| **ASSUMPTIONS.md** | Detailní vysvětlení předpokladů, edge cases, FAQ |
| **PORTFOLIO_MATH_INTEGRATION_GUIDE.md** | Mapování na UI, příklady integrace, diagnostika chyb |
| **AUDIT_TEMPLATE.md** | Template pro auditování `ZADANI/` souborů |
| **portfolioMath.js** | Zdrojový kód se JSDoc |
| **portfolioMath.test.js** | 36 testů s příklady |

---

## 🎓 Pro Kubu (Claude Haiku 4.5)

Když máte hotový HTML/JS:

1. Vložte soubory z `ZADANI/` do workspacu
2. Spusťte audit: **`AUDIT_TEMPLATE.md`**
3. Zmapujte funkce na `portfolioMath.js`
4. Integrujeisazujeite do React/Vue/Vanilla JS komponent
5. Napojte na API/data layer

Všechna potřebná data a příklady jsou připraveni.

---

## 🚀 Status

| Položka | Status |
|---------|--------|
| Pure functions | ✅ 8/8 |
| Testy | ✅ 36/36 pass |
| Dokumentace | ✅ 4 soubory |
| Jest config | ✅ Aktualizován |
| Připraveno pro Kubu | ✅ ANO |

**→ Osamoceněně – Počkejme na `ZADANI/`** 🎯

---

## 📞 Otázky?

Podívejte se do `ASSUMPTIONS.md` (sekcích **FAQ**) nebo `PORTFOLIO_MATH_INTEGRATION_GUIDE.md` (sekcích **Diagnostika chyb**).

---

**Hotovo! 🎉 Připraveno k produkci.**
