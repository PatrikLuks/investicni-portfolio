# 📚 Documentation Index

Přehled všech dokumentů, kam jít pro co. Rychlejší orientace.

---

## 🚀 Pro Kubu (UI Integration)

| Dokument | Účel | Čas |
|----------|------|-----|
| [`KUBA_UI_TASKS.md`](./KUBA_UI_TASKS.md) | **15 konkrétních testů** – co ověřit v UI | 5 min |
| [`EXECUTION_CHECKLIST.md`](./EXECUTION_CHECKLIST.md) | Co je hotovo, co zbývá – project status | 5 min |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Git workflow, PR proces, Conventional Commits | 10 min |
| [`src/ui/index.html`](./src/ui/index.html) | Vstup do aplikace | – |
| [`src/ui/main.js`](./src/ui/main.js) | Orchestrace UI + state management | – |

---

## 📐 Pro Math/Domain

| Dokument | Účel | Obsah |
|----------|------|-------|
| [`src/domain/portfolioMath.js`](./src/domain/portfolioMath.js) | **8 čistých funkcí** – core math | normalizePositions, computeMarketValue, … |
| [`__tests__/portfolioMath.test.js`](./__tests__/portfolioMath.test.js) | **36 testů** – validace všech funkcí | 100% pass ✅ |
| [`docs/PORTFOLIO_MATH_README.md`](./docs/PORTFOLIO_MATH_README.md) | Technické shrnutí funkcí | Signatury, příklady |
| [`docs/ASSUMPTIONS.md`](./docs/ASSUMPTIONS.md) | Předpoklady všech výpočtů | Měna, presnost, edge cases |
| [`docs/PORTFOLIO_MATH_INTEGRATION_GUIDE.md`](./docs/PORTFOLIO_MATH_INTEGRATION_GUIDE.md) | Jak importovat a používat | API reference |

---

## 🎨 Pro UI/UX

| Soubor | Popis | Řádky |
|--------|-------|-------|
| [`src/ui/index.html`](./src/ui/index.html) | HTML + CSS struktury | 100 |
| [`src/ui/main.js`](./src/ui/main.js) | State + bootstrap + orchestrace | 130 |
| [`src/ui/summaryCards.js`](./src/ui/summaryCards.js) | 4 summary metric cards | 40 |
| [`src/ui/portfolioTable.js`](./src/ui/portfolioTable.js) | Editovatelná tabulka pozic | 90 |
| [`src/ui/charts.js`](./src/ui/charts.js) | Pure SVG grafy (pie + line) | 153 |

---

## 💾 Pro Data/IO

| Soubor | Popis | Funkcionalita |
|--------|-------|---|
| [`src/data/io.js`](./src/data/io.js) | I/O operace | localStorage, JSON/CSV import/export |

---

## 🔧 Pro DevOps/CI-CD

| Soubor | Popis | Obsah |
|--------|-------|-------|
| [`package.json`](./package.json) | Project metadata + npm scripts | test, lint, build, … |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | CI/CD pipeline | Lint → Test → Build |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Git workflow + governance | Branches, commits, PRs |
| [`.gitignore`](./.gitignore) | Git ignore rules | Security, build files |

---

## 📖 Pro Audit/Analysis

| Dokument | Účel | Status |
|----------|------|--------|
| [`docs/ZADANI_AUDIT.md`](./docs/ZADANI_AUDIT.md) | Šablona pro audit ZADANI souborů | 🔴 Čekám na ZADANI soubory |
| [`DELIVERY_REPORT.md`](./DELIVERY_REPORT.md) | Delivery shrnutí | ✅ hotovo |
| [`PROJECT_MAINTENANCE_REPORT.md`](./PROJECT_MAINTENANCE_REPORT.md) | Project maintenance log | ✅ hotovo |

---

## 🎯 Quick Navigation

### "Chci vidět aplikaci"
1. Jdi do [`src/ui/`](./src/ui/)
2. Otevři [`index.html`](./src/ui/index.html) v prohlížeči
3. Vidíš demo data (AAPL, SPY, CASH) + grafy

### "Chci pochopit math"
1. Přečti [`docs/ASSUMPTIONS.md`](./docs/ASSUMPTIONS.md) – základy
2. Koukni na [`src/domain/portfolioMath.js`](./src/domain/portfolioMath.js) – implementace
3. Spusť testy: `npm test -- __tests__/portfolioMath.test.js`

### "Chci integrovat UI"
1. Přečti [`KUBA_UI_TASKS.md`](./KUBA_UI_TASKS.md) – co testovat
2. Spusť: `git checkout -b feat/ui-mvp-integration`
3. Ověř všech 15 bodů
4. Pushni a vytvoř PR

### "Chci věřit CI/CD"
1. Koukni na [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
2. Přečti [`CONTRIBUTING.md`](./CONTRIBUTING.md) – governance
3. Vyzkoušej lokálně:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

---

## 📊 Project Structure

```
investicni-portfolio/
├── src/
│   ├── domain/
│   │   └── portfolioMath.js         [Math engine – 8 funkcí]
│   ├── ui/
│   │   ├── index.html
│   │   ├── main.js
│   │   ├── summaryCards.js
│   │   ├── portfolioTable.js
│   │   └── charts.js                [SVG, zero deps]
│   └── data/
│       └── io.js                     [localStorage + I/O]
├── __tests__/
│   └── portfolioMath.test.js         [36 testů ✅]
├── docs/
│   ├── ZADANI_AUDIT.md              [Audit template]
│   ├── ASSUMPTIONS.md               [Předpoklady]
│   ├── PORTFOLIO_MATH_README.md
│   └── PORTFOLIO_MATH_INTEGRATION_GUIDE.md
├── .github/
│   └── workflows/
│       └── ci.yml                    [GitHub Actions]
├── KUBA_UI_TASKS.md                 [15 konkrétních testů]
├── EXECUTION_CHECKLIST.md           [Project status]
├── CONTRIBUTING.md                  [Git workflow]
└── package.json
```

---

## ✅ Ready to Go?

| Role | Začni tady | Čas |
|------|-----------|-----|
| **Kuba (UI)** | [`KUBA_UI_TASKS.md`](./KUBA_UI_TASKS.md) | ~25 min |
| **Reviewer** | [`CONTRIBUTING.md`](./CONTRIBUTING.md) | ~10 min |
| **Maintainer** | [`EXECUTION_CHECKLIST.md`](./EXECUTION_CHECKLIST.md) | ~5 min |
| **New contributor** | [`CONTRIBUTING.md`](./CONTRIBUTING.md) → fork → branch → PR | 30+ min |

---

## 🔗 External Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Jest Testing](https://jestjs.io/)
- [Vite Build Tool](https://vitejs.dev/)
- [Semantic Versioning](https://semver.org/)

---

## 📞 Need Help?

1. **Testy failují?** → Zkontroluj [`__tests__/portfolioMath.test.js`](./__tests__/portfolioMath.test.js)
2. **UI se nerendruje?** → Zkontroluj [`src/ui/main.js`](./src/ui/main.js)
3. **Git issues?** → Přečti [`CONTRIBUTING.md`](./CONTRIBUTING.md)
4. **Nový task?** → Ulož do [`KUBA_UI_TASKS.md`](./KUBA_UI_TASKS.md)

---

**Last updated:** 22. října 2025  
**Version:** 3.2.1  
**Status:** 🟢 Ready for Kuba UI integration

