# Contributing Guidelines

⚠️ **PROPRIETARY SOFTWARE NOTICE** - This project is proprietary software. Contributions are not accepted through open-source channels.

If you are an authorized contributor, please follow the guidelines below. Unauthorized contributors should contact licensing@portfoliomanager.pro for inquiries.

---

## 📋 Quick Links

- 🎯 **[Quality Gates](./QUALITY_GATES.md)** - CI/CD standards & enforcement
- 📊 **[Metrics](./METRICS.md)** - Current project status
- 🏗️ **[Architecture](./architecture/ARCHITECTURE.md)** - System design
- 👨‍💻 **[Developer Guide](../DEVELOPER_GUIDE.md)** - Development workflow

---

## Git workflow

### Setup lokálního repa

```bash
# Klonuj repo
git clone https://github.com/PatrikLuks/investicni-portfolio.git
cd investicni-portfolio

# Instaluj dependencies
npm ci

# Vytvoř feature branch
git checkout -b feat/your-feature-name
```

### Synchronizace s main

```bash
# Fetch latest changes
git fetch origin

# Rebase na main (preferujeme před merge-committy)
git rebase origin/main

# Push s force-with-lease (bezpečněji než force)
git push origin feat/your-feature-name --force-with-lease
```

---

## Branching strategy

Používáme **Git Flow** s tyto větve:

| Branch | Účel | Pravidla |
|--------|------|---------|
| `main` | **Production** – pouze hotové, testované features | Merge jen z `develop` nebo hotfix PRs |
| `develop` | **Integration** – staging, kde se sbírají features | Merge z `feat/*`, `fix/*`, `chore/*` |
| `feat/*` | **Feature** – nová funkcionalita | Vychází z `develop`, Conventional Commits |
| `fix/*` | **Bugfix** – oprava chyby | Vychází z `main`, urgentní merge |
| `chore/*` | **Maintenance** – deps, docs, linting | Vychází z `develop` |
| `docs/*` | **Documentation** – README, guides | Vychází z `develop` |

### Pojmenování branches

Formát: `<type>/<short-description>`

| Typ | Příklady |
|-----|----------|
| `feat/` | `feat/ui-mvp-integration`, `feat/real-time-quotes` |
| `fix/` | `fix/portfolio-calculation-bug`, `fix/csv-import-error` |
| `chore/` | `chore/update-deps`, `chore/eslint-config` |
| `docs/` | `docs/api-guide`, `docs/deployment` |

✅ Dobré: `feat/portfolio-calculation-bug`
❌ Špatně: `fix-bug`, `newfeature`, `my-stuff`

---

## Conventional Commits

Všechny commit messages **musí** dodržovat [Conventional Commits](https://www.conventionalcommits.org/).

### Formát

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Typy

| Typ | Popis | Bump version |
|-----|-------|--------------|
| `feat` | Nová funkcionalita | Minor (v1.0.0 → v1.1.0) |
| `fix` | Oprava chyby | Patch (v1.0.0 → v1.0.1) |
| `docs` | Dokumentace (README, guides) | – |
| `style` | Formátování, bez změny logiky (spacing, commas) | – |
| `refactor` | Refaktoring bez nové funkce | – |
| `perf` | Performance improvement | Patch |
| `test` | Přidání/úprava testů | – |
| `chore` | Build, deps, CI config | – |
| `ci` | CI/CD workflow changes | – |
| `revert` | Revert předchozího commitu | – |

### Scopes (volitelné, ale doporučené)

```
feat(portfolioMath): add weighted average return calculation
fix(ui): fix chart rendering on mobile
chore(deps): upgrade vite to 5.0
test(jest): add edge case tests
```

### Příklady

✅ **Dobré:**
```
feat(portfolioMath): add computeAnnualizedReturn() function

- Implements CAGR formula: (Vf/Vi)^(1/years) - 1
- Handles edge cases (0 years, negative returns)
- 100% test coverage (8 tests)

Closes #42
```

```
fix(ui): fix table edit causing NaN in calculations

- Validate quantity input before update
- Show error message if invalid
- Prevent DOM update until validation passes
```

❌ **Špatně:**
```
fix stuff
Updated files
BUGFIX
```

### Semantic Versioning (semver)

```
v<MAJOR>.<MINOR>.<PATCH>

- MAJOR: Breaking changes (incompatible API)
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)
```

Příklady:
- `v1.0.0` – Initial release
- `v1.1.0` – Add new feature (feat commit)
- `v1.1.1` – Bug fix (fix commit)
- `v2.0.0` – Breaking change (feat! commit)

---

## Pull Request proces

### 1️⃣ Před Push-nutím

```bash
# Aktualizuj branch
git fetch origin
git rebase origin/develop

# Spusť testy lokálně
npm test

# Spusť linting
npm run lint --fix

# Build check
npm run build

# Commit s Conventional Commits
git commit -m "feat(ui): add summary cards component"

# Push
git push origin feat/your-feature-name
```

### 2️⃣ Vytvoření PR

**Na GitHub:**

1. Vyber **base branch** (obvykle `develop`, pro hotfix `main`)
2. Vyber **compare branch** (tvoje `feat/*`)
3. Vyplň **PR title** (Conventional Commits format)
4. Vyplň **description** (viz template níže)

### PR Template (`.github/pull_request_template.md`)

```markdown
## 📋 Popis

Krátké shrnutí, co PR dělá.

## 🎯 Motivace a kontext

Proč tato změna? Co řeší?

## 🧪 Jak to bylo testováno?

- [ ] Unit tests (npm test)
- [ ] Lint (npm run lint)
- [ ] Build (npm run build)
- [ ] Manual testing (kroky níže)

## ✅ Checklist

- [ ] Moje code sleduje coding style projektu
- [ ] Aktualizoval jsem dokumentaci (README, docs/)
- [ ] Přidal jsem testy pro nový kód
- [ ] Všechny testy procházejí lokálně
- [ ] CI je zelená (GitHub Actions)
- [ ] Žádné console errors/warnings

## 📸 Screenshots (pokud je UI změna)

Vložit screenshot nebo video z browser.

## 🔗 Issue reference

Closes #123 (automaticky zavře issue)
```

### 3️⃣ Code Review

- ✅ Minimálně **1 reviewer** (obvykle maintainer)
- ✅ **CI musí být zelená** (lint + test + build)
- ✅ **Všechny komentáře řešené** (approval)
- ✅ **Branch updated** s `main`/`develop`

### 4️⃣ Merge

```bash
# Reviewer či ty sám mergneš PR na GitHub (preferujeme "Squash and merge")
# Tím se feature branch automaticky smaže

# Lokálně
git checkout develop
git pull origin develop
git branch -d feat/your-feature-name
```

---

## Code review

### Recenzent (reviewer)

Při review si všimni:

- ✅ **Correctness:** Kód dělá, co má?
- ✅ **Testing:** Jsou tam testy? Pokrývají edge cases?
- ✅ **Performance:** Je to efektivní? Nema N+1 queries?
- ✅ **Security:** Nema SQL injection, XSS, auth issues?
- ✅ **Readability:** Je kód jasný a srozumitelný?
- ✅ **Consistency:** Dodržuje coding style?
- ✅ **Documentation:** Jsou comments/docs kde třeba?

### Autor (PR creator)

- Reaguj na feedback konstruktivně
- Pushni fixní commits (`git commit --amend` + `git push --force-with-lease`)
- Oznamem recenzentovi: "Opraveno, prosím re-review"

---

## Testing & CI

### Lokální testing (před push)

```bash
# Unit testy
npm test

# Unit testy (watch mode)
npm test:watch

# Linting
npm run lint
npm run lint:fix  # Automaticky fixnout co jde

# Build
npm run build

# Všechno najednou (doporučujeme)
npm test && npm run lint && npm run build
```

### GitHub Actions CI

Automaticky běží na každý push do `main`, `develop` a pull requestu.

Pipeline:
1. **Lint** – ESLint
2. **Tests** – Jest (36 tests, 100% pass)
3. **Build** – Vite
4. **Security** – npm audit, Snyk (volitelné)
5. **E2E** – Playwright (jen na `main`)

Pokud CI selže → merge je blokován. Musíš fixnout a re-push.

---

## Bezpečnost

### Doporučení

1. ✅ **Nikdy nepushuj secrets** (API klíče, tokeny) → `.gitignore`
2. ✅ **Use `.env.local`** pro lokální config
3. ✅ **Review před merge** – druhá sada očí
4. ✅ **Dependencies** – `npm audit` regulárně
5. ✅ **Branch protection** – `main` vyžaduje review + CI

### Hlášení security issues

Pokud najdeš security hole:

- ❌ Nepublickuj na Issues
- ✅ Napiš email na [security contact]
- ✅ Include: popis, steps to reproduce, impact
- ✅ Dej nám čas na patch (obvykle 7 dní)

---

## FAQ

### Q: Mohu přímo pushovat do `main`?
**A:** Ne. Vždy přes feature branch + PR. `main` je chráněná.

### Q: Co když udělám špatný commit?
**A:**
```bash
# Oprav poslední commit (bez zmenu historie)
git commit --amend

# Nebo revert starou změnu
git revert <commit-hash>
```

### Q: Jak se synchronizuji s `develop`?
**A:**
```bash
git fetch origin
git rebase origin/develop  # Preferujeme místo merge
git push origin feat/your-feature-name --force-with-lease
```

### Q: Testy failují lokálně, ale CI je zelená. Co?
**A:** Pravděpodobně verze Node. Zkontroluj:
```bash
node --version  # Měl by být v20
npm ci          # Včdy použi ci místo install
```

### Q: Kolik reviewerů potřebuji?
**A:** Minimálně 1 (obvykle maintainer). Více věcích můžou být 2+.

---

## Kontakt

- **Issues:** [GitHub Issues](https://github.com/PatrikLuks/investicni-portfolio/issues)
- **Discussions:** [GitHub Discussions](https://github.com/PatrikLuks/investicni-portfolio/discussions)
- **Security:** [security@example.com] (Edituj podle vašeho kontaktu)

---

## Děkujeme! 🎉

Vážíme si tvého příspění. Bez komunitních devů by to nešlo!

Happy coding! 🚀
