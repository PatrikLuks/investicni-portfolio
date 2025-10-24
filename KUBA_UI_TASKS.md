# 🎯 Konkrétní úkoly pro Kubu (Claude Haiku 4.5)

## Status

Všechny zdrojové soubory UI jsou hotovy a umístěny v:
- ✅ `src/ui/index.html`
- ✅ `src/ui/main.js`
- ✅ `src/ui/summaryCards.js`
- ✅ `src/ui/portfolioTable.js`
- ✅ `src/ui/charts.js`
- ✅ `src/data/io.js`

**Cíl:** Ověřit, že vše funguje bez chyb. Spustit aplikaci v prohlížeči.

---

## 🎬 Branch & Workflow

```bash
# Vytvoř nový branch
git checkout -b feat/ui-mvp-integration

# Pracuj na souborech výše
# … editace, testy …

# Commit & push
git add src/ui src/data
git commit -m "feat: UI skeleton + IO integration"
git push origin feat/ui-mvp-integration

# Pull request pro review
```

---

## ✅ Akceptační kritéria (Checklist)

### 1️⃣ **Aplikace se spustí bez JS chyb**
- [ ] Otevři `src/ui/index.html` v prohlížeči
- [ ] V Console (F12) by neměly být chyby
- [ ] Demo data jsou viditelná (3 pozice: AAPL, SPY, CASH)

### 2️⃣ **Summary karty**
- [ ] Karty ukazují: Celková hodnota, P/L, Denní změna, CAGR
- [ ] Hodnoty jsou správně spočítané (pro demo data)
  - Celková hodnota: 10×210 + 5×600 + 1000×1 = 5100 CZK
  - P/L: (5100 - (10×150 + 5×500 + 1000×1)) = 1100 CZK
  - Denní změna: Pozitivní (včera bylo 4950, dnes 5100)
  - CAGR: Nějaké procento (může být null pokud málo dat)

### 3️⃣ **Tabulka**
- [ ] Všechny 3 pozice jsou viditelné v tabulce
- [ ] Každá řada má: Ticker, Kusy, AvgCost, Třída, Cena, Hodnota, P/L
- [ ] Hodnoty **Hodnota** a **P/L** jsou správně spočítané

### 4️⃣ **Edita v tabulce**
- [ ] Klikni na buňku v tabulce (např. quantity pro AAPL)
- [ ] Změní obsah (např. na 15)
- [ ] Odebír focus → hodnota se aktualizuje
- [ ] Summary karty se okamžitě přepočítají
- [ ] Data zůstanou v localStorage (F5 → data jsou tam pořád)

### 5️⃣ **Tlačítko "Přidat pozici"**
- [ ] Klikni "➕ Přidat pozici"
- [ ] Přidá se nový řádek na konec tabulky
- [ ] Nová pozice má defaulty: ticker="", quantity=1
- [ ] Můžeš ji editovat jako ostatní

### 6️⃣ **Tlačítko "✕" (delete)**
- [ ] Klikni na ✕ u některé pozice
- [ ] Pozice se smaže z tabulky
- [ ] Summary se přepočítá
- [ ] Data se uloží do localStorage

### 7️⃣ **Export JSON**
- [ ] Klikni "💾 Export JSON"
- [ ] Stáhne se `portfolio.json`
- [ ] Otevři v textovém editoru → je to valid JSON se všemi daty

### 8️⃣ **Export CSV**
- [ ] Klikni "💾 Export CSV"
- [ ] Stáhne se `portfolio.csv`
- [ ] Má header: `ticker,quantity,avgCost,assetClass,priceToday`
- [ ] Má 3 řádky dat

### 9️⃣ **Import JSON**
- [ ] Vezmi exportovaný `portfolio.json`
- [ ] Klikni na Input a vlož soubor
- [ ] Alert: "✅ Importováno: 3 pozic"
- [ ] Tabulka se obnoví s původními daty
- [ ] localStorage je aktualizován

### 🔟 **Import CSV**
- [ ] Vezmi exportovaný `portfolio.csv`
- [ ] Klikni na Input a vlož soubor
- [ ] Alert: "✅ Importováno: 3 pozic"
- [ ] Tabulka se obnoví s CSVdaty
- [ ] CSV import korektně parsuje ticker, quantity, avgCost, assetClass, priceToday

### 1️⃣1️⃣ **Tlačítko "🔄 Reset demo"**
- [ ] Klikni "🔄 Reset demo"
- [ ] Confirm dialog: "Opravdu chceš smazat všechna data…?"
- [ ] OK → localStorage se smaže + stránka se reload
- [ ] Vidíš znovu demo data (AAPL, SPY, CASH)

### 1️⃣2️⃣ **Grafy**
- [ ] **Pie chart (Alokace):** Vidíš 3 slices (Equity, ETF, Cash) s procenty
  - Equity (AAPL): ~41% 
  - ETF (SPY): ~59%
  - Cash: zanedbatelné
- [ ] **Line chart (Časová řada):** Vidíš čáru s třemi daty (20., 21., 22. říjen)
  - Sklon nahoru (vzrostu)

### 1️⃣3️⃣ **No Console Errors**
- [ ] Žádné červené chyby v Console (F12)
- [ ] Jsou tu jen info zprávy (volitelné warning)

### 1️⃣4️⃣ **Testy prochází**
- [ ] Spusť: `npm test -- __tests__/portfolioMath.test.js`
- [ ] Výsledek: ✅ 36 passed

### 1️⃣5️⃣ **Linting (volitelné, ale přivítané)**
- [ ] Spusť: `npm run lint`
- [ ] Žádné chyby (warning ok, pokud nejde o security)

---

## 📋 Checklist (pro selbě)

Předtím, než udělíš **commit**:

- [ ] Všech 15 bodů výše je ✅
- [ ] Žádné console errory/warns
- [ ] localStorage funguje (F5 → data tam)
- [ ] Všechny formáty (JSON, CSV) korektní
- [ ] Code je čitelný a okomentovaný
- [ ] Žádné dead code / console.log ponechávky (ok pro debug, ale měly by být odstraněny)

---

## 🚀 Ready? Pak:

```bash
# Finální kontrola
npm test -- __tests__/portfolioMath.test.js
npm run lint  # (optional)

# Commit
git add .
git commit -m "feat: UI MVP complete – all acceptance criteria met"
git push origin feat/ui-mvp-integration

# Create Pull Request
# Review message:
# "UI MVP MVP integration complete.
#  - Demo app with 3 test positions
#  - All functionality per SPEC
#  - No console errors
#  - Tests pass (36/36)
#  - Ready for Code Review"
```

---

## 📞 Kam s otázkami?

- **Chyba v portfolioMath?** → Podívej se do `ASSUMPTIONS.md` nebo spusť `npm test`
- **Jak se má komponenta renderovat?** → Zkontroluj JSDoc v `src/ui/*.js`
- **localStorage není persistent?** → Zkontroluj `src/data/io.js`, `saveLocal()`
- **Grafy se nerendrují?** → Zkontroluj `src/ui/charts.js`, SVG syntax

---

## 🎓 Pro reference

| Soubor | Obsahuje | Používá |
|--------|----------|---------|
| `src/ui/main.js` | Orchestrace, state, renderAll | Všechny ostatní src/ui/ + portfolioMath |
| `src/ui/index.html` | HTML struktura + CSS | main.js |
| `src/ui/summaryCards.js` | 4 summary karty | computeMarketValue, computePnL, … |
| `src/ui/portfolioTable.js` | Editovatelná tabulka | computeMarketValue, computePnL |
| `src/ui/charts.js` | SVG grafy | (pure SVG, žádné deps) |
| `src/data/io.js` | I/O operace | localStorage, JSON, CSV parse/export |

---

## ⏳ Timeline

- **Nyní:** Přečti si tuto zprávu
- **5 min:** Setup (git branch, ověření souborů)
- **15 min:** Ruční testing (všech 15 bodů)
- **5 min:** Cleanup + commit
- **~25 minut TOTAL** 🎯

---

**Hotovo! Začni s akceptačním checklist. Pokud vše prpasuje → commit & PR! 🚀**
