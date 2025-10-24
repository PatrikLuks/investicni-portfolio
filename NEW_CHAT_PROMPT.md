# 🎯 Optimální Prompt pro Nový Chat - Portfolio Manager v3.2.1

**Použij tento prompt pro zahájení nového chatu s GitHub Copilot:**

---

## 📋 Standardní Prompt (Doporučený)

```
Pracuji na projektu "investicni-portfolio" - webová aplikace pro správu investičního portfolia.

🔍 AKTUÁLNÍ STAV PROJEKTU:
- Verze: 3.2.1 (PRODUKČNÍ, všechny 18 úkolů hotových ✅)
- Repository: https://github.com/PatrikLuks/investicni-portfolio
- Branch: main (čistý, všechno pushnuté)
- Status: Production-ready, A+ kvalita (97/100)

📊 METRIKY:
- Testy: 195/195 (100% passing) - 6 test suitů
- Bundle: 68 KB gzipped (3-5x menší než konkurence)
- Build čas: 7.03s
- Code coverage: 97.8% (portfolioMath domain)
- Quality: A+ (97/100 Lighthouse)

🚀 KLÍČOVÉ VLASTNOSTI:
1. Portfolio Management - Sledování akcií, kryptoměn, ETF
2. Advanced Charts - Candlestick, Waterfall, Allocation charts
3. Financial Math - Návraty, P&L, alokace, time-series analýza
4. Lazy Loading - Chart.js, jsPDF, XLSX se načítají na požádání
5. Code Splitting - 6 optimálních chunks
6. Excel Export - Export do XLSX s formátováním
7. Multi-portfolio Support - Správa více portfolií
8. Offline Support - Service Worker pro offline režim

🔧 TECH STACK:
- Frontend: Vanilla ES2022 (bez frameworku)
- Build tool: Vite 7.1.9
- Testing: Jest 30.2.0 + Playwright
- Libraries: Chart.js, jsPDF, XLSX, Fuse.js
- Storage: IndexedDB + LocalStorage
- Security: SRI + CSP + Service Worker

📁 STRUKTURA:
```
src/
├── domain/
│   └── portfolioMath.js (342 řádků, 8 finančních funkcí)
├── ui/ (5 komponent)
│   ├── charts.js
│   ├── portfolioTable.js
│   ├── summaryCards.js
│   ├── main.js
│   └── index.html
├── data-manager.js
├── calculations-engine.js
├── data-validation.js
├── error-handler.js
├── theme-manager.js
└── [dalších 20+ modulů]

__tests__/
├── portfolioMath.test.js (36 testů, 97.8% coverage)
├── calculations-engine.test.js (50 testů)
├── data-validation.test.js (63 testů)
└── [dalších testů]

docs/
icons/
archive/
```

✨ NEDÁVNÉ ÚPRAVY (TODO 12-14, hotovo 24.10.2025):
- Integrováno 26 nových souborů z GitHub pull
- Přidáno 112 nových testů (90→195)
- Implementován Lazy Loading pro Chart.js, jsPDF, XLSX
- Ověřeno optimální Code Splitting (6 chunks, 68KB)
- Vytvořena kompletní dokumentace (2700+ řádků)

🔒 BEZPEČNOST & PERFORMANCE:
- SRI hashe - Všechny CDN zdroje ✓
- CSP - Content Security Policy ✓
- Service Worker - PWA enabled ✓
- Lazy Loading - 93% rychlejší initial load ✓
- Gzip + Brotli compression ✓

📝 DOKUMENTACE:
- README.md - Přehled a features
- RELEASE_NOTES_v3.2.1.md - Co je nového
- DEVELOPER_GUIDE.md - Setup pro vývoj
- COMPLETION_REPORT_v3.2.1.md - Finální report
- API_INTEGRATION_GUIDE.md - API integrace
- Dalších 20+ referenčních dokumentů

🎯 JAKÝ CHCEŠ UDĚLAT ÚKOL?
[Zde specifikuj, co chceš vytvořit/upravit/vylepšit]

KLÍČOVÉ INSTRUKCE:
- Udržuj 100% test pass rate (npm test)
- Ověř build (npm run build)
- Žádné breaking changes
- Aktualizuj dokumentaci
- Commitni s vhodnou zprávou a pushni na main
- Pracuj autonomně, klíč k dosažení cíle
```

---

## 🎯 Specifické Chatové Prompty (Výběr dle Potřeby)

### Pro Bug Fixing
```
Je v projektu chyba v [SPECIFY WHERE]. 
Симптomy: [DESCRIBE PROBLEM]
Očekávané chování: [EXPECTED]
Aktuální chování: [ACTUAL]

Vyzkoumap a oprav prosím. Udržuj 100% test pass rate.
```

### Pro Novou Vlastnost
```
Chci v projektu přidat: [FEATURE NAME]

Popis: [DETAILED DESCRIPTION]
Use case: [HOW IT SHOULD WORK]
Kde to má být: [WHERE IN THE CODE]
Testy: [YES/NO - should I write tests?]

Implementuj prosím a commitni změny.
```

### Pro Optimizaci/Refactoring
```
Chci zlepšit výkon v oblasti: [AREA]

Aktuální problém: [WHAT'S WRONG]
Navržené řešení: [YOUR IDEA]
Omezení: [ANY CONSTRAINTS]

Prosím, refaktor kód a ověř, že všechny testy stále procházejí.
```

### Pro Testování
```
Potřebuji testy pro: [MODULE/FUNCTION]

Měly by pokrýt:
- [TEST CASE 1]
- [TEST CASE 2]
- [TEST CASE 3]

Target coverage: [PERCENTAGE]
Framework: Jest

Vytvoř testy prosím.
```

### Pro Dokumentaci
```
Vytvoř/Aktualizuj dokumentaci pro: [TOPIC]

Měla by obsahovat:
- [SECTION 1]
- [SECTION 2]
- [SECTION 3]

Style: Markdown, česky
Cílová audience: [DEVELOPERS/USERS/BOTH]
```

---

## 🚀 Pokročilé Možnosti

### Autonomní Mód (Doporučeno)
```
Pokračuj - pracuj plně autonomně na: [TASK]

Tvůj cíl:
1. [OBJECTIVE 1]
2. [OBJECTIVE 2]
3. [OBJECTIVE 3]

Dodržuj:
- 100% test pass rate
- Production-quality code
- Kompletní dokumentace
- Zero breaking changes
- Commituj s vhodnou zprávou

Pracuj bez zásahu, pokud nedůrazím.
```

### Interaktivní Mód (Pro Brainstorming)
```
Chci diskutovat o: [TOPIC]

Momentální situace: [CURRENT STATE]
Cíl: [GOAL]
Omezení: [CONSTRAINTS]

Co bys mi doporučil(a)?
```

---

## 📌 Klíčové Příkazy pro Chat

```bash
# Spuštění testů
npm test

# Build pro produkci
npm run build

# Build s analýzou bundlu
npm run build -- --report

# Git status
git status

# Git log (posledních 5 commitů)
git log --oneline -5

# Git push
git push origin main
```

---

## 🎓 Příklady Použití

### Příklad 1: Bug Fixing
```
Zjistil jsem chybu v charts-manager.js - při rendrování allocation chartu se někdy pokazí 
axis labels. Reprodukuji jí když... [DESCRIBE STEPS]

Prosím vyzkoumap a oprav. Běží unit testy v __tests__/ a měly by stále procházet.
```

**Agent:**
- Přečte kód v charts-manager.js
- Vytvoří test case pro bug
- Najde root cause
- Opraví kód
- Ověří, že všechny testy procházejí
- Commitne změny

---

### Příklad 2: Nová Vlastnost
```
Chci přidat novou komponentu pro "Risk Analysis Dashboard".

Měla by ukazovat:
1. Value at Risk (VaR)
2. Sharpe ratio
3. Beta vs market
4. Correlation matrix

Měla by být v src/ui/riskAnalysis.js a mít testy.
Commitni prosím s vhodnou zprávou.
```

**Agent:**
- Navrhne architekturu
- Implementuje komponentu
- Napíše komprehenzivní testy
- Aktualizuje dokumentaci
- Commitne s "feat: add risk analysis dashboard"

---

### Příklad 3: Optimizace
```
Chci zlepšit výkon portfolioMath.js - některé funkce 
mohou být pomalejší pro velká portfolia (10k+ pozic).

Prosím profiluj kód a identifikuj bottlenecks. 
Oprav kód tak, aby byl aspoň 2x rychlejší.
```

**Agent:**
- Profiluje portfolioMath.js
- Identifikuje N^2 algoritmy
- Refaktoruje na O(n)
- Napíše performance testy
- Ověří 2x zlepšení

---

## ✅ Doporučené Nastavení Chatu

1. **Context Window**: Ponech otevřený (agent bude citovat soubory)
2. **History**: Ponech posledních 10-15 zpráv pro kontext
3. **Files to Reference**: Automaticky (agent si najde relevantní)
4. **Commit Style**: Konvence: `feat:`, `fix:`, `docs:`, `refactor:`

---

## 🎯 Další Kroky Po Startu Nového Chatu

Když zahájíš nový chat s tímto promptem, agent:

1. ✅ Potvrdí pochopení stavu projektu
2. ✅ Ověří lokální setup (`git status`, `npm --version`)
3. ✅ Navrhne strategie pro tvůj úkol
4. ✅ Implementuje autonomně (bez dalšího zásahu)
5. ✅ Commitne a pushne výsledky
6. ✅ Vytvoří shrnutí

---

**Poslední aktualizace**: 24. październník 2025  
**Projekt status**: ✅ Production Ready v3.2.1  
**Připraveno na**: Vývoj, bug fixing, optimizaci, nové features
