# ZADANI – Technický audit (původní JPL HTML/JS)

**Cíl:** Popsat přesně, co dělá původní kód, jaké má závislosti, side-effects a jak ho mapujeme na `src/domain/portfolioMath.js` + UI/Data vrstvu.

**Status:** 🔴 Čekání na nahrání ZADANI souborů (`/_input/ZADANI/*.html,*.js`)

---

## 1) Seznam souborů

| Soubor | Typ | Popis | Poznámka |
|--------|-----|-------|----------|
| `index.html` | HTML | Struktura DOM, formuláře, tabulky, event listenery | *čekání* |
| `script.js` | JS | Hlavní logika, event handlery, globální proměnné | *čekání* |
| `styles.css` | CSS | Vzhled UI | *čekání* |
| (další...) | | | |

---

## 2) Funkce – signatury a side-effects

Vyplní se po analýze ZADANI.

| Funkce | Vstupy | Výstup | Vedlejší efekty | Mapování | Poznámky |
|--------|--------|--------|----------------|---------|---------:|
| `calcPortfolio()` | positions, prices | číslo | DOM update? localStorage? | ? | *待* |
| `addPosition()` | form data | position obj | DOM insert | ? | *待* |
| `deletePosition()` | id | – | DOM remove | ? | *待* |
| ... | | | | | |

---

## 3) Data model

### Struktura pozic

**Očekávaná struktura (dle ZADANI):**

```javascript
// Příklad – upravit dle skutečného ZADANI
const position = {
  id?: string,           // unique identifier
  ticker: string,        // např. "AAPL", "SPY", "CZK"
  quantity: number,      // počet kusů
  avgCost?: number,      // průměrná cena nákupu
  assetClass?: string,   // "equity", "etf", "bond", "cash"
  priceToday?: number,   // aktuální cena
  priceYesterday?: number, // včeraší cena (pro denní změnu)
  // ... další pole?
};
```

### Kde se data načítají?

- [ ] LocalStorage (JSON)?
- [ ] Inline v HTML (`<script>` pole)?
- [ ] File import (CSV, JSON)?
- [ ] API endpoint?
- [ ] Jiné?

### Kde se data ukládají?

- [ ] LocalStorage?
- [ ] Server (API POST)?
- [ ] File download (export)?
- [ ] Jiné?

---

## 4) Side-effects & rizika

### Zásahy do DOM

- [ ] Přímá manipulace s `element.innerHTML`?
- [ ] `document.querySelector()` v metodách?
- [ ] Renderování v rámci výpočtů?
- [ ] Global event listeners (bez cleanup)?

**Doporučení:** Oddělit výpočty (pure functions) od UI renderingu.

### Globální proměnné

- [ ] `window.state`, `window.data` atd.?
- [ ] Modulární scope nebo全局?
- [ ] Riziko race conditions?

**Doporučení:** State normalizovat do jednoho objektu, ideálně v `src/data/io.js`.

### Chyby a edge cases

| Scénář | Původní chování | Nové chování |
|--------|-----------------|---------------|
| Chybějící cena pro ticker | ? | Erro msg + fallback = 0 |
| NaN v quantity | ? | Validace + user alert |
| Prázdný portfolio | ? | Demo data / "Přidej pozici" CTA |
| localStorage fail (private mode) | ? | Graceful fallback |
| Multi-FX portfolia | ? | Zatím ne (scope v3.3) |

---

## 5) Mapování – Původní → Nové moduly

| Původní | Nový modul | Funkce | Důvod mapování |
|---------|-----------|--------|----------------|
| výpočet market value (SUM qty×price) | `src/domain/portfolioMath.js` | `computeMarketValue()` | Pure, testovatelné, bez side-effects |
| alokace % (value/total) | `src/domain/portfolioMath.js` | `computeAllocation()` | Pure, jasné formule |
| denní změna (today - yesterday) | `src/domain/portfolioMath.js` | `computeDailyChange()` | Pure, precizní |
| P/L (MV - cost basis) | `src/domain/portfolioMath.js` | `computePnL()` | Pure, přesná výpočet |
| CAGR (annualized return) | `src/domain/portfolioMath.js` | `computeAnnualizedReturn()` | Pure, komplexní matematika |
| váž. průměr výnosu | `src/domain/portfolioMath.js` | `computeWeightedAverageReturn()` | Pure, agregace |
| rendrování tabulky | `src/ui/portfolioTable.js` | `renderTable()` | DOM-aware, event handlers |
| rendrování karet (summary) | `src/ui/summaryCards.js` | `renderSummary()` | DOM-aware, formatting |
| import JSON/CSV | `src/data/io.js` | `importFileToPositions()` | File I/O, parsing |
| export JSON/CSV | `src/data/io.js` | `exportJson()`, `exportCsv()` | File I/O, formatting |
| localStorage read/write | `src/data/io.js` | `loadLocal()`, `saveLocal()` | Persistence |
| orchestrace + state | `src/ui/main.js` | `bootstrap()`, `renderAll()`, `wireIO()` | Central coordination |

---

## 6) Gaps & edge cases

### Chybějící funkcionality (dle ZADANI)

- [ ] Multi-portfolio support?
- [ ] Real-time quotes (API)?
- [ ] Benchmark vs. index?
- [ ] Tax reporting?
- [ ] Dividend tracking?
- [ ] Rebalancing alerts?

**Poznámka:** Prioritizovat dle ZADANI a user feedback. Fáze MVP zahrnuje: MV, P/L, alokace, denní změna.

### Neošetřené edge cases

| Edge case | Aktuální kód | Nový kód | Testy |
|-----------|--------------|---------|-------|
| `quantity=0` (prázdná pozice) | ? | Validace + error msg | ✅ `normalizePositions()` test |
| `price=undefined` | ? | Fallback = 0 (warning) | ✅ `computeMarketValue()` test |
| `avgCost=null` pro P/L | ? | Treat as 0 | ✅ `computePnL()` test |
| Časová řada s mezerami | ? | Interpolate nebo skip | ⏳ TODO |
| Měnový mix (CZK + EUR) | ? | Zatím CZK (scope v3.3) | ⏳ TODO |

### Přesnost / numerika

- [ ] Kolik des. míst pro procenta?
- [ ] Rounding error v sčítání MV?
- [ ] Leap year adjustments (365 vs. 365.25)?
- [ ] Timezone issues (daily close)?

**Doporučení:** Vše Intl.NumberFormat pro lokalizaci (CZK). Testy s fixními čísly.

---

## 7) Doporučení & akční plán

### Architektura

- ✅ **Oddělit výpočty od UI** – Pure functions v `src/domain/`
- ✅ **Centrální state** – `src/ui/main.js`
- ✅ **Data persistence** – `src/data/io.js`
- ⏳ **Validation layer** – `src/domain/validation.js` (pokud ZADANI vyžaduje)

### Testování

- ✅ **Unit testy** – Jest pro `portfolioMath.js` (36/36 ✅)
- ⏳ **Integration testy** – E2E pro UI flow (Playwright)
- ⏳ **Edge case testing** – Dle gaps v sekci 6)

### Governance

- ✅ **CI pipeline** – `.github/workflows/ci.yml` (npm test + lint + build)
- ✅ **Branching** – `main` (prod), `develop`, `feat/*`, `fix/*`
- ✅ **Code review** – Minimálně 1 reviewer

### Next steps (po obdržení ZADANI)

1. **Vyplnit tabulky** výše (funkce, side-effects, gaps)
2. **Identifikovat nové výpočty** (pokud nejsou v portfolioMath.js)
3. **Augmentovat testy** v `__tests__/portfolioMath.test.js`
4. **Validovat mapování** – zkontrolovat, že všechny ZADANI funkce jsou pokryty
5. **PR s doplňky** – Nové testy, bugfixy, docs

---

## 📝 Template pro novou sekci (pokud je potřeba)

```markdown
### [Nová oblast]

**Popis:**
- Co to dělá?
- Kde se používá?

**Aktuální stav (ZADANI):**
- (co tam je)

**Nový stav (nový kód):**
- (jak to řešíme)

**Testy:**
- [ ] Test case 1
- [ ] Test case 2
```

---

## 🔗 Reference

- **Domain functions:** [`src/domain/portfolioMath.js`](../src/domain/portfolioMath.js) (8 funkcí, 240 řádků)
- **Unit tests:** [`__tests__/portfolioMath.test.js`](../__tests__/portfolioMath.test.js) (36/36 ✅)
- **UI skeleton:** [`src/ui/main.js`](../src/ui/main.js), [`src/ui/index.html`](../src/ui/index.html)
- **Data I/O:** [`src/data/io.js`](../src/data/io.js)
- **Assumptions:** [`ASSUMPTIONS.md`](./ASSUMPTIONS.md)

---

## ✅ Checklist – готово k vyplnění

- [ ] ZADANI soubory dostupné
- [ ] Všechny funkce identifikovány
- [ ] Mapování 1:1 hotovo
- [ ] Edge cases zdokumentovány
- [ ] Nové testy vytvořeny (pokud třeba)
- [ ] PR merged do main
- [ ] Dokumentace aktualizována

**Kontakt:** Vlož ZADANI HTML/JS → vyplním zbývající sekce.

