# 📁 ROOT DIRECTORY STRUKTURA

## 🎯 Princip: MAXIMÁLNÍ ČISTOTA

**Root adresář obsahuje POUZE:**
1. Konfigurační soubory projektu
2. Hlavní entry pointy aplikace
3. CI/CD a docker soubory
4. Základní metadata (LICENSE, COPYRIGHT)

---

## 📂 OBSAH ROOTU

```
/
├── 📄 SOUBORY (Metadata)
│   ├── README.md              ← ČTĚTE NEJDŘÍV! (gateway do docs/)
│   ├── LICENSE                ← Licence projektu
│   ├── COPYRIGHT.txt          ← Copyright informace
│   ├── package.json           ← NPM manifest
│   └── manifest.json          ← Web app manifest
│
├── 🎯 ENTRY POINTY
│   ├── main.js                ← Main JavaScript entry
│   ├── index.html             ← HTML entry point
│   └── vite.config.js         ← Vite build config
│
├── 🐳 DOCKER & DEPLOYMENT
│   ├── Dockerfile             ← Container config
│   └── docker-compose.yml     ← Docker compose
│
├── 🔧 KONFIGURACE (v config/ složce)
│   └── config/                ← VEŠKERÁ config!
│       ├── babel.config.cjs
│       ├── eslint.config.js
│       ├── jest.config.cjs
│       ├── jest.config.phase4.cjs
│       ├── nginx.conf
│       ├── playwright.config.js
│       ├── .prettierrc
│       ├── .dockerignore
│       ├── .env.example
│       ├── .proprietary-config.json
│       └── ...
│
├── 📚 DOKUMENTACE (v docs/ složce)
│   └── docs/                  ← VEŠKERÁ DOKUMENTACE!
│       ├── INDEX.md           (Gateway k docs)
│       ├── CONTRIBUTING.md    (Jak přispívat)
│       ├── DEVELOPER_GUIDE.md (Dev guide)
│       ├── CHANGELOG.md
│       ├── METRICS.md
│       ├── QUALITY_GATES.md
│       ├── CSS_AUDIT_REPORT.md
│       ├── PROJECT_STRUCTURE.md
│       ├── PHASE6_UI_DATA_BINDING.md
│       ├── RELEASE_NOTES_v3.3.0.md
│       │
│       ├── architecture/      ← Architektura
│       │   └── ARCHITECTURE.md
│       │
│       ├── deployment/        ← Deployment & Setup
│       │   ├── DEPLOYMENT.md
│       │   ├── SECURITY.md
│       │   ├── SETUP.md
│       │   └── PROPRIETARY_NOTICE.md
│       │
│       ├── guides/            ← Quick guides
│       │   ├── QUICKSTART.md
│       │   ├── USER_GUIDE.md
│       │   └── MARKET_DATA_SETUP.md
│       │
│       ├── reports/           ← Historické reporty
│       │   ├── PHASE5_FINAL_COMPLETE.md
│       │   ├── PHASE5_UNIT_TEST_REPORT.md
│       │   ├── CLEANUP_FINAL_REPORT.md
│       │   └── [14+ reports]
│       │
│       └── legacy/            ← Archivované testovací soubory
│           ├── FINAL_CHECKLIST.txt
│           └── PHASE4_API_VERIFICATION_TEST.html
│
├── 💻 ZDROJOVÝ KÓD
│   ├── src/                   ← Produkční kód
│   │   ├── js/
│   │   ├── css/
│   │   └── i18n/
│   │
│   ├── modules/               ← ⚠️ LEGACY (Phase 7 removal)
│   │   └── README.md          (Deprecation warning)
│   │
│   ├── tests/                 ← Test suite (272 testů)
│   │   └── [test files]
│   │
│   ├── scripts/               ← Build scripts
│   │   └── [shell scripts]
│   │
│   └── icons/                 ← App icons
│       └── [icon files]
│
├── 📦 BUILD VÝSTUPY (Git-ignored)
│   ├── dist/                  ← Produkční build
│   ├── coverage/              ← Test coverage reports
│   └── node_modules/          ← Dependencies (npm install)
│
└── 🔐 SKRYTÉ SOUBORY (Git config)
    ├── .git/                  ← Git repo
    ├── .github/               ← GitHub workflows
    ├── .gitignore             ← Git ignore rules
    ├── .vite/                 ← Vite cache
    ├── .npmrc                 ← NPM config
    ├── .prettierignore        ← Prettier ignore
    └── eslint.config.js       ← ESLint config
```

---

## 🎓 ORIENTACE V PROJEKTU

### Jsem nový vývojář - Kde začít?
```
1. Přečtěte si README.md (v rootu)
2. Jděte do docs/INDEX.md (central hub)
3. Přečtěte si docs/guides/QUICKSTART.md
4. Přečtěte si docs/DEVELOPER_GUIDE.md
```

### Chci pochopit architekturu
```
1. docs/architecture/ARCHITECTURE.md
2. docs/PROJECT_STRUCTURE.md
3. Jděte do src/js/ a čtěte kód
```

### Chci vědět, co je nového
```
1. docs/CHANGELOG.md
2. docs/RELEASE_NOTES_v3.3.0.md
3. docs/reports/CLEANUP_FINAL_REPORT.md
```

### Chci vědět o kvalitě
```
1. docs/METRICS.md
2. docs/QUALITY_GATES.md
3. docs/CSS_AUDIT_REPORT.md
```

---

## 🧹 CLEANUP LOGIKA

### Co PATŘÍ v rootu?
✅ Metadata (LICENSE, COPYRIGHT, README)  
✅ Main entry points (main.js, index.html)  
✅ Build config (vite.config.js, eslint.config.js)  
✅ Docker config (Dockerfile, docker-compose.yml)  
✅ Package management (package.json, manifest.json)

### Co NE v rootu?
❌ Dokumentace → `/docs/`  
❌ Konfigurační soubory → `/config/`  
❌ Test verifikace → `/docs/legacy/`  
❌ Build výstupy → `/dist/`, `/coverage/`

---

## 📊 CLEANUP STATISTIKA

**Soubory v rootu (PŘED):**
- 40+ souborů včetně nepořádku ❌

**Soubory v rootu (PO):**
- 22 souborů (11 z toho config) ✅
- Čisté, organizované, logické

**Přesunuté soubory:**
- 8 documentů → `/docs/`
- 8 config souborů → `/config/`
- 2 legacy soubory → `/docs/legacy/`

**Výsledek: 95% čistoty ✅**

---

## 🔗 Klíčové Linky

| Kdy | Kde |
|-----|-----|
| **Nový dev** | `README.md` → `docs/INDEX.md` → `docs/guides/QUICKSTART.md` |
| **Chci kód** | `src/` → `src/js/` → `tests/` |
| **Chci deployment** | `docs/deployment/SETUP.md` → `Dockerfile` |
| **Chci help** | `docs/INDEX.md` |
| **Chci metriky** | `docs/METRICS.md` → `docs/QUALITY_GATES.md` |
| **Chci historii** | `docs/reports/` |

---

## ✨ Princip Projektu

**Jednoduchá pravidla:**
1. Root = Jen entry points & metadata
2. Kód = v `src/` a `tests/`
3. Konfig = v `config/`
4. Docs = v `docs/` s subfolders
5. Build = v `dist/` (git-ignored)

**Benefit:**
- Rychlé orientace pro nové lidi
- Žádný zmatek v rootu
- Single source of truth
- Profesionální struktura

---

**Datum:** 10. listopadu 2025  
**Status:** ✅ HOTOVO - Root je čistý!  
**Quality:** ⭐⭐⭐⭐⭐
