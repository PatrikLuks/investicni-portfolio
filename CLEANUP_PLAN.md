# 🧹 PROJEKT CLEANUP & SPRÁVA KVALITY

**Priorita:** Nejvyšší  
**Zaměření:** Kvalita, struktura, udržitelnost  
**Status:** Plán

---

## 📋 Identifikované Problémy

### 1. **Neorganizované Root Dokumenty** ⚠️
- 15+ report souborů v rootu (`PHASE5_*`, `AUDIT_*`, `FINANCIAL_*`, atd.)
- Měly by být v `/docs/reports/` nebo `/docs/changelog/`
- **Akce:** Reorganizace do logické struktury

### 2. **Duplicitní Dokumentace** ⚠️
- Stejné informace v více souborech
- `PROJECT_REVIEW.md`, `DETAILED_CONTROL_SUMMARY.md`
- `PHASE5_COMPLETION_REPORT.md` vs `PHASE5_FINAL_COMPLETE.md`
- **Akce:** Konsolidace, centralizace

### 3. **Nestrukturované Kódování** ⚠️
- `/modules/` vs `/src/js/utilities/` (dvě místa se kódem!)
- Legacy code v `/modules/` není jasně označen
- **Akce:** Jasné oddělení legacy vs. Phase 4

### 4. **Test Soubory v .gitignore** ⚠️
- Test soubory jsou v `.gitignore`
- Měly by být verzovány v gitu pro CI/CD
- **Akce:** Přesunutí do version controlu

### 5. **Chybějící Projekt Metriky** ⚠️
- Žádný centrální místo pro:
  - Code quality metrics
  - Build status
  - Test coverage
  - Performance benchmarks
- **Akce:** Vytvoření METRICS.md

### 6. **Neformální Bezpečnostní Politika** ⚠️
- Bezpečnost v SECURITY.md, ale nepravidelně aktualizován
- **Akce:** Zlepšit, formalizovat

---

## 🎯 Fáze Úklidu

### FÁZE 1: Reorganizace Dokumentace
```
docs/
├── index.md (hlavní guide)
├── contributing.md
├── changelog/
│   ├── v3.3.0.md
│   ├── v3.2.0.md
│   └── CHANGELOG.md (master index)
├── reports/
│   ├── phase4-completion.md
│   ├── phase5-testing.md
│   ├── quality-metrics.md
│   └── audit-log.md
├── api/
│   ├── phase4-modules.md
│   ├── ui-binding.md
│   └── endpoints.md
├── deployment/
│   ├── setup.md
│   ├── deployment.md
│   ├── docker-setup.md
│   └── troubleshooting.md
└── guides/
    ├── quickstart.md
    ├── user-guide.md
    └── developer-guide.md
```

### FÁZE 2: Úklid Kódu
- [ ] Zmazat starý kód z `/modules/`
- [ ] Přesunout relevantní parts do `/src/js/legacy/` (jasně označeno)
- [ ] Aktualizovat import cesty

### FÁZE 3: Test Management
- [ ] Přesunout testy z `.gitignore` do verze
- [ ] Organizovat test struktur (unit/integration/e2e)
- [ ] Nastavit proper paths v Jest config

### FÁZE 4: Metriky & Monitoring
- [ ] Vytvorit `METRICS.md`
- [ ] Nastavit coverage tracking
- [ ] Vytvorit quality gates

### FÁZE 5: Bezpečnost
- [ ] Auditor security policies
- [ ] Aktualizovat SECURITY.md
- [ ] Nastavit security scanning

### FÁZE 6: Build & Deploy
- [ ] Auditor build process
- [ ] Optimalizovat build čas
- [ ] Nastavit pre-commit hooks

---

## ✅ Implementační Kroky

1. **Soubory k přesunutí do `/docs/reports/`:**
   - AUDIT_REPORT_PHASE4_INTEGRATION.md
   - PHASE4_API_VERIFICATION_TEST.html
   - PHASE5_AKCELERACE_CZ.md
   - PHASE5_COMPLETION_REPORT.md
   - PHASE5_FINAL_COMPLETE.md
   - PHASE5_SESSION_ACCELERATION.md
   - PHASE5_SUMMARY_CZ.md
   - PHASE5_UNIT_TEST_REPORT.md
   - PHASE_4_COMPLETE.md
   - PROJECT_REVIEW.md
   - FINANCIAL_IMPLEMENTATION_SUMMARY.md
   - ENTERPRISE_FINANCIAL_LAYER_README.md
   - FINANCIAL_PRECISION_INTEGRATION.md
   - LIVE_MARKET_DATA_UPGRADE.md
   - FAZE5_ZPRAVA_AGENTA_CZ.md
   - EXECUTIVE_SUMMARY.md

2. **Soubory k úpravě/konsolidaci:**
   - README.md - hlavní gateway
   - QUICKSTART.md - sloučit s docs/quickstart.md
   - USER_GUIDE.md - sloučit s docs/guides/user-guide.md
   - SETUP.md - sloučit s docs/deployment/setup.md

3. **Nové soubory k vytvoření:**
   - docs/METRICS.md
   - docs/ARCHITECTURE.md
   - docs/QUALITY_GATES.md
   - .npmrc (pro npm configuration)
   - .eslintignore (update)
   - .prettierignore (update)

4. **Soubory k smazání/refactoru:**
   - `/modules/*` (audit a reorganizace)
   - Duplicitní CSS v `/src/css/`

---

## 🎯 Kvalitativní Standarty

### Code Quality
- ✅ ESLint: 0 errors (musí zůstat)
- ✅ Prettier: Jednotná formátování
- ✅ Tests: 272/272 passing (musí zůstat)
- ✅ Coverage: Track a dokumentovat

### Documentation Quality
- ✅ Single source of truth
- ✅ Keine Duplikation
- ✅ Updated regularly
- ✅ Searchable

### Project Structure
- ✅ Clear organization
- ✅ Consistent naming
- ✅ Well-documented paths
- ✅ Easy to onboard

### Build & Deploy
- ✅ Fast builds (< 20s)
- ✅ Small bundle size
- ✅ Security checked
- ✅ Performance monitored

---

## 📊 Success Criteria

- [ ] Root directory < 10 dokumentu (max 5 config)
- [ ] Všechna dokumentace v `/docs/`
- [ ] Test soubory v gitu (verzovany)
- [ ] Clear ARCHITECTURE.md
- [ ] Zero lint errors
- [ ] All tests passing
- [ ] Build < 15 seconds
- [ ] Coverage tracked
- [ ] Security audit clean
- [ ] README je single entry point

---

**Začátek:** Hned po schválení plánu
**Očekávaný čas:** 2-3 hodiny
**Výsledek:** Profesionální, enterprise-ready projekt
