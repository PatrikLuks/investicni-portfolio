# ✅ Checklist – Začátek pro Kubu (Claude Haiku 4.5)

## 🎯 Cíl

Bezpečně integrovat `portfolioMath.js` do UI komponent a namapovat funkce z `ZADANI/`.

---

## 📋 Phase 0 – Verifikace setup (5 minut)

### Kroku 1: Zkontrolujte strukturu
```bash
# Ověřit všechny soubory na místě
ls -la src/domain/portfolioMath.js
ls -la __tests__/portfolioMath.test.js
ls -la ASSUMPTIONS.md
ls -la PORTFOLIO_MATH_INTEGRATION_GUIDE.md
ls -la AUDIT_TEMPLATE.md
```

**Očekávání:** Všechny soubory existují ✅

---

### Kroku 2: Spusťte testy
```bash
npm test -- __tests__/portfolioMath.test.js --no-coverage
```

**Očekávání:**
```
✅ Test Suites: 1 passed, 1 total
✅ Tests:       36 passed, 36 total
⏱️  Time:        ~1 sec
```

---

### Kroku 3: Přečtěte si dokumentaci (15 minut)
- ✅ `PORTFOLIO_MATH_README.md` – Overview
- ✅ `ASSUMPTIONS.md` – Detailní vysvětlení
- ✅ `PORTFOLIO_MATH_INTEGRATION_GUIDE.md` – Příklady integrací

**Cíl:** Pochopit co dělá každá funkce

---

## 📥 Phase 1 – Vložení & audit ZADANI (20 minut)

### Kroku 4: Vložte soubory z ZADANI
```bash
# Příklad:
cp -r /path/to/ZADANI/* src/data/  # nebo jiný adresář
# nebo ručně přes VS Code file explorer
```

**Cíl:** Mít zdrojové soubory v workspacu

---

### Kroku 5: Vyplňte AUDIT_TEMPLATE.md
```bash
# Otevřete si AUDIT_TEMPLATE.md a pro každou funkci v ZADANI napište:
# - Název funkce
# - Signatury (vstupy/výstupy)
# - Side-effects (má DOM, I/O, globální stav?)
# - Mapování na portfolioMath.js (která funkce odpovídá?)
```

**Příklad:**
```markdown
### Funkce #1: `calculatePortfolioValue()`

**Lokace:** app.js:42

**Vstupy:**
- `positions`: Array of {ticker, quantity, cost}
- `prices`: Object {ticker: price}

**Výstupy:**
- Number: total market value

**Side-effects:**
- ✅ PURE (žádné side-effects)

**Mapování:**
- portfolioMath.js: `computeMarketValue()`
```

**Cíl:** Jasné pochopení mapování funkcí

---

## 🔗 Phase 2 – Integrace do UI (30 minut)

### Kroku 6: Napište jednoduchou React komponentu
```jsx
// Příklad: src/components/SummaryCard.jsx

import React from "react";
import { computeMarketValue, computePnL } from "@/src/domain/portfolioMath";

export function SummaryCard({ positions, prices }) {
  const mv = computeMarketValue(positions, prices);
  const pnl = computePnL(positions, prices);

  return (
    <div className="summary-card">
      <h2>Portfolio Summary</h2>
      <p>Total Value: ${mv.total.toFixed(2)}</p>
      <p>Gain/Loss: ${pnl.totalPnl.toFixed(2)} ({((pnl.totalPnl / pnl.totalCost) * 100).toFixed(2)}%)</p>
    </div>
  );
}
```

**Cíl:** Ověřit, že import a API fungují

---

### Kroku 7: Ověřte, že komponenta funguje
```bash
npm run dev  # Spusťte dev server
# Navigujte na komponentu v prohlížeči
# Měly by se zobrazit správné hodnoty
```

**Cíl:** End-to-end ověření

---

## 🧪 Phase 3 – Přidejte vlastní testy (20 minut)

### Kroku 8: Napište testy pro integraci
```javascript
// Příklad: __tests__/integration/SummaryCard.test.js

import { render, screen } from "@testing-library/react";
import { SummaryCard } from "@/src/components/SummaryCard";

test("SummaryCard displays correct total value", () => {
  const positions = [
    { ticker: "AAPL", quantity: 10, avgCost: 150 },
  ];
  const prices = { AAPL: 210 };

  render(<SummaryCard positions={positions} prices={prices} />);

  expect(screen.getByText(/2100/)).toBeInTheDocument();
});
```

**Cíl:** Zajistit, že komponenty správně používají portfolioMath

---

### Kroku 9: Spusťte všechny testy
```bash
npm test  # Všechny testy
npm test -- --coverage  # S pokrytím
```

**Očekávání:** Žádné chyby

---

## 📊 Phase 4 – Příprava na produkci (15 minut)

### Kroku 10: Ověřte výkon
```bash
# Měřit čas výpočtu s velkým portfoliem
npm test -- __tests__/portfolioMath.test.js --verbose

# Ověřit: výpočty < 1ms i pro 100+ pozic
```

**Cíl:** Performance benchmark

---

### Kroku 11: Finální checklist
- [ ] Všechny testy procházejí (`npm test`)
- [ ] Komponenty mají správné vstupy/výstupy
- [ ] JSDoc je viditelný v IDE (Ctrl+Space)
- [ ] ASSUMPTIONS.md je přečten a pochopen
- [ ] AUDIT_TEMPLATE.md je vyplněn
- [ ] Žádné TypeScript/ESLint chyby
- [ ] Performance benchmark OK (<1ms)

---

## 🚨 Řešení problémů

### ❌ Test selhají

```bash
npm test -- __tests__/portfolioMath.test.js
```

Pokud vidíte chyby:
1. Zkontrolujte `jest.config.cjs` (měl by mít `src/domain/`)
2. Spusťte `npm install` (v případě chybějících balíčků)
3. Přečtěte si error message → mapujte na ASSUMPTIONS.md

---

### ❌ Import selhává

```javascript
// ❌ Špatně:
import { computeMarketValue } from "portfolioMath.js";

// ✅ Správně:
import { computeMarketValue } from "@/src/domain/portfolioMath.js";
// nebo
import { computeMarketValue } from "./src/domain/portfolioMath.js";
```

---

### ❌ Komponenta vyhodí chybu na neplatné vstupy

```javascript
// ❌ Špatně:
computeMarketValue([], {}); // Chybějící ceny

// ✅ Správně:
const positions = [{ ticker: "AAPL", quantity: 10 }];
const prices = { AAPL: 210 };
computeMarketValue(positions, prices); // OK
```

Viz `ASSUMPTIONS.md` → **Diagnostika chyb**

---

## 📞 Komunikační kanály

| Situace | Řešení |
|---------|--------|
| Nejasné jak API funguje | Čti `PORTFOLIO_MATH_INTEGRATION_GUIDE.md` |
| Edge case neobsažený v testech | Podívej se na `__tests__/portfolioMath.test.js` |
| Chyba při integraci do UI | Zkontroluj `ASSUMPTIONS.md` → FAQ |
| Výkon je pomalý | Měř s `console.time()`, optimalizuj data layer |

---

## 🎯 Timeline

| Phase | Čas | Status |
|-------|------|--------|
| **Phase 0** – Setup & verifikace | 5 min | ⏳ Start here |
| **Phase 1** – Audit ZADANI | 20 min | ⏳ Next |
| **Phase 2** – UI integrace | 30 min | ⏳ Next |
| **Phase 3** – Testy | 20 min | ⏳ Next |
| **Phase 4** – Produkce | 15 min | ⏳ Next |
| **TOTAL** | ~90 min | ⏳ |

---

## ✅ Checkpoints (Odpověď: YES/OK)

### Start Phase 1
```bash
npm test -- __tests__/portfolioMath.test.js
# Odpověď: ✅ 36 passed? → Pokračuj na Phase 1
```

### Před Phase 2
```bash
cat AUDIT_TEMPLATE.md | grep -c "##"
# Odpověď: > 3 sekce vyplneny? → Pokračuj na Phase 2
```

### Před Phase 3
```bash
npm run dev
# Odpověď: Komponenta je viditelná & data správná? → Pokračuj na Phase 3
```

### Před Phase 4
```bash
npm test -- --coverage | grep "portfolioMath"
# Odpověď: 100% coverage? → Pokračuj na Phase 4
```

---

## 🎓 Shrnutí – co se od tebe očekává

1. ✅ Ověřit, že base setup funguje (Phase 0)
2. ✅ Auditovat & mapovat ZADANI (Phase 1)
3. ✅ Napsat React/Vue komponenty (Phase 2)
4. ✅ Přidat testy (Phase 3)
5. ✅ Ověřit výkon & produkční readiness (Phase 4)

---

## 🚀 Teď jste připravení!

Máš veškerou dokumentaci, testy a příklady. Jdi na to! 🎯

**Začni Phase 0 → npm test** ✅

---

**Dokument:** Checklist pro Kubu  
**Verzev:** 1.0  
**Poslední aktualizace:** 22. října 2025
