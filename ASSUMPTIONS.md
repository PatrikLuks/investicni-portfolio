# Předpoklady a architektura – portfolioMath.js

## Přehled

Doména `src/domain/portfolioMath.js` obsahuje **čisté funkce** (pure functions) pro výpočty s portfoliem. Není závislá na DOM, I/O, globálních stavech nebo měnové konverzi.

---

## 1. Fundamentální předpoklady

### 1.1 Měna (Currency)

**Předpoklad:** Všechny ceny a hodnoty jsou v **jedné měně** (CZK, EUR, USD, …). 

- Funkce **NEKONVERTUJE** mezi měnami.
- Pokud chcete multi-FX portfolio, připravte ceny s konverzí **mimo** `portfolioMath.js`.
- Příklad:
  ```javascript
  // ❌ ŠPATNĚ (smíchané měny)
  const prices = { AAPL: 210, EURUSD: 1.08 }; // Nesmíšit CZK s EUR!
  
  // ✅ SPRÁVNĚ (jedna měna)
  const prices = { AAPL: 210 * 1.08, EURUSD: 1.08 }; // Všechno v CZK
  ```

### 1.2 Ceny (Prices)

**Předpoklad:** `priceMap` je slovník `{ ticker -> jednotková cena }`.

- **Jednotková cena** = cena **za jeden kus** (za jednu akcii, za jedno ETF, …).
- Všechny tickery v portfoliu **musí** mít cenu; jinak vyhodíme chybu.
- Ceny mohou být 0 (např. dluhopisy bez tržní hodnoty dne).
- Ceny nesmí být `NaN`, `Infinity`, `null`.

```javascript
const prices = {
  'AAPL': 210.35,
  'SPY': 600.10,
  'BND': 98.75,
  'CASH': 1.00,
};
```

### 1.3 Pozice (Positions)

**Struktura:**
```javascript
{
  ticker:     string,        // Identifikátor (AAPL, SPY, BTC, …)
  quantity:   number,        // Počet kusů (může být decimální)
  avgCost:    number | null, // Průměrná pořizovací cena za kus (volitelná)
  assetClass: string | null, // Kategorie (Equity, ETF, Bond, Cash, Crypto)
}
```

**Předpoklady:**
- `quantity` ≥ 0 (bez short pozic – přidáme později).
- `quantity` je konečné číslo (NaN je chyba).
- `avgCost` je buď:
  - **Zadáno:** průměrná pořizovací cena na kus (pro P&L);
  - **Chybí** (`undefined`): portfolio bylo zdarma (airdrop, hedge, …) → P&L se počítá bez cost báze.
- `assetClass` je volitelný (fallback: používáme `ticker`).

```javascript
const positions = [
  { ticker: 'AAPL', quantity: 10, avgCost: 150, assetClass: 'Equity' },
  { ticker: 'SPY', quantity: 5, avgCost: 500, assetClass: 'ETF' },
  { ticker: 'AIRDROP', quantity: 100, /* avgCost chybí */ },
  { ticker: 'CASH', quantity: 1000, assetClass: 'Cash' },
];
```

---

## 2. Funkce & vzorce

### 2.1 `normalizePositions(positions) → Position[]`

**Co:** Validuje a normalizuje pozice.

**Chyby:**
- `positions` není pole
- `ticker` chybí nebo není string
- `quantity` není konečné číslo
- `quantity` < 0
- `avgCost` není finite nebo < 0

**Side-effects:** ŽÁDNÉ (pure)

---

### 2.2 `computeMarketValue(positions, priceMap) → { items, total }`

**Co:** Tržní hodnota (MV) = suma všech pozic.

**Vzorec:**
```
MV = Σ (quantity_i * price_i)
```

**Výstup:**
```javascript
{
  items: [
    { ticker, quantity, price, marketValue },
    …
  ],
  total: number,
}
```

**Předpoklady:**
- Ceny jsou **jednotkové** (za jeden kus).
- Cena musí existovat pro všechny tickery.

**Příklad:**
```javascript
const positions = [
  { ticker: 'AAPL', quantity: 10 },
  { ticker: 'SPY', quantity: 5 },
];
const prices = { AAPL: 210, SPY: 600 };
const result = computeMarketValue(positions, prices);
// result.total = 10*210 + 5*600 = 5100
```

---

### 2.3 `computeAllocation(positions, priceMap) → { byKey, total }`

**Co:** Alokace portfolia dle `assetClass` (nebo fallback na `ticker`).

**Vzorec:**
```
weight[k] = MV[k] / total_MV
```

**Výstup:**
```javascript
{
  byKey: {
    'Equity': { value: 3000, weight: 0.588... },
    'ETF': { value: 2100, weight: 0.411... },
    …
  },
  total: 5100,
}
```

**Poznámka:**
- Váhy jsou **normalizovány** (suma = 1.0, pokud total > 0).
- Pokud `total = 0`, všechny váhy = 0.

---

### 2.4 `computePnL(positions, priceMap) → { items, totalPnl, totalCost, totalMV }`

**Co:** Zisk/Ztráta (P&L) vůči `avgCost`.

**Vzorec:**
```
cost_i = avgCost_i * quantity_i
pnl_i = (price_i * quantity_i) - cost_i
pnl_pct_i = pnl_i / cost_i  (pokud cost_i > 0)
```

**Výstup:**
```javascript
{
  items: [
    { ticker, pnl, pnlPct },
    …
  ],
  totalPnl: number,
  totalCost: number,
  totalMV: number,
}
```

**Poznámky:**
- Pokud `avgCost` chybí, bereme jej jako 0 (airdrop → veškerá MV je P&L).
- `pnlPct` je `null`, pokud `cost = 0` (dělení nulou).
- `totalCost` = suma všech `(avgCost * quantity)`.
- `totalPnl = totalMV - totalCost`.

**Příklad:**
```javascript
const positions = [
  { ticker: 'AAPL', quantity: 10, avgCost: 150 },
];
const prices = { AAPL: 210 };
const result = computePnL(positions, prices);
// cost = 10 * 150 = 1500
// mv = 10 * 210 = 2100
// pnl = 2100 - 1500 = 600
// pnl_pct = 600 / 1500 = 0.4 (40%)
```

---

### 2.5 `computeDailyChange(positions, priceToday, priceYesterday) → { delta, deltaPct, mvToday, mvYesterday }`

**Co:** Denní změna MV.

**Vzorec:**
```
delta = MV_today - MV_yesterday
deltaPct = delta / MV_yesterday  (pokud MV_yesterday > 0)
```

**Výstup:**
```javascript
{
  delta: number,              // Absolutní změna (CZK)
  deltaPct: number | null,    // Relativní změna (%)
  mvToday: number,
  mvYesterday: number,
}
```

**Předpoklady:**
- Pozice se **mezi dny neměnily** (quantity zůstaly stejné).
- Jsou-li pozice změněny (nákup/prodej), funkce vrátí **nesprávný** výsledek.
  - Řešení: napravit `quantity` podle skutečných obchodů.

**Příklad:**
```javascript
const positions = [
  { ticker: 'AAPL', quantity: 10 },
  { ticker: 'SPY', quantity: 5 },
];
const pricesYesterday = { AAPL: 200, SPY: 590 };
const pricesToday = { AAPL: 210, SPY: 600 };
const result = computeDailyChange(positions, pricesToday, pricesYesterday);
// mvYesterday = 10*200 + 5*590 = 4950
// mvToday = 10*210 + 5*600 = 5100
// delta = 150
// deltaPct = 150/4950 ≈ 0.0303 (3.03%)
```

---

### 2.6 `computeTimeSeriesValue(positions, pricesByDate) → [{ date, value }, …]`

**Co:** Časová řada MV z denních cen.

**Vstup:**
```javascript
const pricesByDate = {
  '2025-10-20': { AAPL: 200, SPY: 590 },
  '2025-10-21': { AAPL: 210, SPY: 600 },
  '2025-10-22': { AAPL: 215, SPY: 605 },
};
```

**Výstup:**
```javascript
[
  { date: '2025-10-20', value: 4950 },
  { date: '2025-10-21', value: 5100 },
  { date: '2025-10-22', value: 5225 },
]
```

**Předpoklady:**
- Výstup je seřazený **vzestupně** podle data (ISO-8601).
- Pokud `pricesByDate = {}`, vrátíme `[]`.

---

### 2.7 `computeAnnualizedReturn(series) → number | null`

**Co:** Annualizovaný výnos (CAGR – Compound Annual Growth Rate) z časové řady.

**Vzorec:**
```
r_annual = (V_final / V_initial) ^ (1 / years) - 1
```

Kde:
```
years = (date_final - date_initial) / 365.25 let
```

**Výstup:**
- `number`: annualizovaná míra (0.081 = 8.1% p.a.)
- `null`: pokud nelze spočítat

**Vrací `null` když:**
- `series.length < 2`
- `V_initial ≤ 0` nebo `V_final ≤ 0`
- `years ≤ 0` (stejný den)

**Příklad:**
```javascript
const series = [
  { date: '2024-10-22', value: 10000 },
  { date: '2025-10-22', value: 11000 }, // +10% za 1 rok
];
const cagr = computeAnnualizedReturn(series);
// cagr ≈ 0.1 (10% p.a.)
```

---

### 2.8 `computeWeightedAverageReturn(series) → number | null`

**Co:** Vážený průměr denních výnosů (TVWR – Time Weighted Return).

**Vzorec:**
```
r_i = (V_i - V_{i-1}) / V_{i-1}     (denní výnos)
w_i = (days_i / total_days)          (váha podle trvání)
TVWR = Σ (w_i * r_i)
```

**Výstup:**
- `number`: vážený průměr výnosu
- `null`: pokud nelze spočítat

**Vrací `null` když:**
- `series.length < 2`
- Všechny hodnoty jsou ≤ 0

**Předpoklady:**
- Není to "true" TVWR (ten by vyžadoval `pricesByDate` s denními reinvesticemi).
- Toto je **zjednodušený** průměr, užitečný pro audit trendu.

---

## 3. Edge cases & chování

### Nulová portfolio

```javascript
const positions = [];
computeMarketValue(positions, {}).total;  // 0
computeAllocation(positions, {});          // { byKey: {}, total: 0 }
```

### Nulové ceny

```javascript
const prices = { AAPL: 0 };
computeMarketValue([{ ticker: 'AAPL', quantity: 100 }], prices).total;
// 0 (100 * 0 = 0) — korektní; nejde o chybu
```

### Chybějící ceny

```javascript
const prices = { /* AAPL chybí */ };
computeMarketValue([{ ticker: 'AAPL', quantity: 100 }], prices);
// ❌ Chyba: "Missing or invalid price for ticker \"AAPL\""
```

### Nulová vstupní MV (dělení nulou)

```javascript
const series = [
  { date: '2025-10-20', value: 10000 },
  { date: '2025-10-21', value: 0 }, // → kolaps
];
computeWeightedAverageReturn(series);
// Vrací null (skip prvního výnosu s V=0)
```

---

## 4. Bezpečnost & type-checking

### JSDoc

Všechny funkce mají **JSDoc anotace** pro IDE a Copilot:

```javascript
/**
 * @param {Position[]} positions
 * @param {Record<string, number>} priceMap
 * @returns {{items: Array<...>, total: number}}
 */
export function computeMarketValue(positions, priceMap) { … }
```

### Validace

Každá funkce:
- Ověřuje typy vstupů (`typeof`, `Array.isArray`, `Number.isFinite`).
- Vyhodí `Error` s **jasnou zprávou** (index pozice, problém).
- **Nemodifikuje** vstupní objekty (čistá funkce).

---

## 5. Napojení na UI & data layer

### ✅ Doporučeno: Separace vrstev

```
UI (React/Vue)
  ↓
Data Layer (API, cache)
  ↓
portfolioMath.js (čisté výpočty)
  ↓
Rendering (grafy, tabulky)
```

### Příklad:

```javascript
// Data layer: fetch prices & positions
const positions = await db.getPositions();
const prices = await api.getPrices(tickers);

// Domain layer: compute metrics
const metrics = {
  totalMV: computeMarketValue(positions, prices).total,
  allocation: computeAllocation(positions, prices),
  pnl: computePnL(positions, prices),
};

// UI: render results
renderSummary(metrics);
renderAllocationChart(metrics.allocation.byKey);
renderPnLTable(metrics.pnl.items);
```

---

## 6. Budoucí rozšíření

### Plán (Later)

- **Multi-FX:** kurzy k datu pro konverzi
- **Short pozice:** `quantity < 0` (margins, hedging)
- **Transakce:** nákupy/prodeje mezi dny (LIFO, FIFO, avgCost update)
- **Benchmark:** porovnání s indexem (relativity)
- **Risk:** volatilita, correlation, VaR (Value at Risk)
- **True TVWR:** s reinvesticemi

### Architektura

- Nové funkce jdou do `src/domain/portfolioMath.js` (pure).
- Side-effecty (API, DB) zůstávají v data layer.

---

## 7. Testing

### Pokrytí

Všechny testy v `__tests__/portfolioMath.test.js`:
- ✅ Normalizace & validace
- ✅ Market Value (MV)
- ✅ Alokace (weights)
- ✅ P&L (gains/losses)
- ✅ Daily Change (Δ)
- ✅ Time Series & CAGR
- ✅ Weighted Average Return
- ✅ Edge cases (nula, chyby, délka dat)

### Spuštění

```bash
npm test                        # Všechny testy
npm test -- portfolioMath       # Jen portfolioMath
npm test:watch                  # Watch mode
npm test -- --coverage          # S pokrytím
```

---

## 8. FAQ

### Q: Mohu mít záporné `quantity` (short prodej)?

**A:** Momentálně ne. Funkce vyhoří na validaci. Přidáme později s margin mechanismy.

### Q: Jak se řeší obchodování během dne?

**A:** Vaše odpovědnost! Aktualizujte `quantity` podle tradů. `computeDailyChange` vrátí správný výsledek, pokud jsou `quantity` správné.

### Q: Je to "true" CAGR?

**A:** Ano, geometrická anualizace. Předpokládá **žádné** cash flow uprostřed (bez depozitů/výběrů).

### Q: Co když chybí `avgCost`?

**A:** Bereme jej jako 0. Celek se chová jako "airdrop" – celá MV je P&L.

---

## Kontakt & integrace

Když je připraven Kuba (Claude Haiku 4.5):
1. Vložte HTML/JS ze `ZADANI/`.
2. Spusťte `npm test` → mělo by projít 100%.
3. Integruji výpočty do UI komponent.

**Hotovo!** 🎉
