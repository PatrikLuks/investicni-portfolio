# Audit – Mapování funkcí z ZADANI → portfolioMath.js

## Instrukce pro Kubu

Jakmile máte soubory z `ZADANI/`, vyplňte tento template:

---

## 📄 Zdrojové soubory

- [ ] `ZADANI/...html` (cesta)
- [ ] `ZADANI/...js` (cesta)
- [ ] Ostatní soubory: ...

---

## 🔎 Audit funkcí

Pro každou funkci v `ZADANI/**/*.js`:

### Funkce #1: `[NÁZEV]`

**Lokace:** `[soubor:řádek]`

**Signatury:**
```javascript
function [name]([parametry]) {
  // [zdrojový kód]
}
```

**Vstupy (parametry):**
- `param1`: `[typ]` – [popis]
- `param2`: `[typ]` – [popis]

**Výstupy (return):**
- `[typ]` – [popis]

**Vedlejší efekty (side-effects):**
- ✅ Bez vedlejších efektů (PURE)
- ❌ Modifikuje globální stav: [KTERÉ]
- ❌ I/O (DOM, API, storage): [JAKÉ]
- ❌ Jiné: [JAKÉ]

**Mapování na portfolioMath.js:**

| ZADANI funkce | portfolioMath funkce | Poznámka |
|--|--|--|
| `[název]()` | `computeMarketValue()` | Počítá MV |
| `[název]()` | NOVÁ – `compute[X]()` | Zatím neimplementováno |

**Příklady:**
```javascript
// Vstup:
const result = [název](...);

// Odpovídá:
import { computeMarketValue } from "./src/domain/portfolioMath.js";
const result = computeMarketValue(...);
```

---

### Funkce #2: `[DALŠÍ]`

[Opakujte šablonu výše]

---

## 🗺️ Mapovací matice

| ZADANI | portfolioMath | UI komponenta | Status |
|--|--|--|--|
| `getUserPortfolio()` | N/A (data layer) | Dashboard | 🔵 External |
| `calculateTotal()` | `computeMarketValue()` | Summary card | ✅ Mapped |
| `getAssets()` | `computeAllocation()` | Pie chart | ✅ Mapped |
| `getPnL()` | `computePnL()` | P&L table | ✅ Mapped |
| `getDailyChange()` | `computeDailyChange()` | Badge | ✅ Mapped |
| `renderChart()` | N/A (UI layer) | Performance | 🔵 External |

---

## 🚨 Konflikty & poznámky

### Konflikt #1: [NÁZEV]

**Problém:** [POPIS]

**Řešení:** [NAVRŽENÉ ŘEŠENÍ]

---

## ✅ Checklist – Integrace

- [ ] Všechny funkce zmapovány
- [ ] Žádné nové pure funkce potřebné
- [ ] Všechny side-effects identifikovány
- [ ] Testovací data dostupná
- [ ] Komponenty připraveny na integraci

---

## 📝 Poznatky

[Vaše poznámky, gotchas, zajímavé descobery]

---

## 🔗 Dodatečné prostředky

- `ASSUMPTIONS.md` – Detailní předpoklady
- `PORTFOLIO_MATH_INTEGRATION_GUIDE.md` – Příklady integrací
- `__tests__/portfolioMath.test.js` – Testovací příklady

---

**Datum auditu:** [DNES]  
**Autor:** [VÁŠ JMÉ]  
**Status:** ⏳ Čekáme na ZADANI
