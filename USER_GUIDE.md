# 📊 Portfolio Manager Pro - Úživateslká Příručka

## 🎯 Co je Portfolio Manager Pro?

**Portfolio Manager Pro** je profesionální aplikace pro správu investičních portfolií s pokročilými analytickými nástroji. Umožňuje vám sledovat, analyzovat a optimalizovat vaše investice v reálném čase.

---

## ⚡ Klíčové Funkce

### 📈 Pokročilá Analýza
- **Výpočty výnosů**: IRR, CAGR, celkový výnos
- **Metriky rizika**: Sharpe ratio, Sortino ratio, Max Drawdown
- **Diverzifikace**: Analýza alokace aktiv
- **Technické indikátory**: SMA, EMA, RSI, Bollinger Bands

### 💾 Správa Dat
- **Bezpečné ukládání**: Local Storage + Firebase Firestore
- **Automatické zálohování**: Cloudové uložení s SSL/TLS
- **Importování**: CSV, Excel, JSON
- **Exportování**: PDF, Excel, JSON s formátováním

### 🎨 Přizpůsobení
- **Tmavý/Světlý režim**: Přepínaní na jedno kliknutí
- **Vlastní barvy**: Přizpůsobení vzhledu
- **Responzivní design**: Optimalizován pro mobil, tablet, desktop
- **10 jazyků**: ČJ, EN, DE, FR, ES, IT, PT, RU, JA, ZH

### 🔔 Notifikace & Upozornění
- **Cenové upozornění**: Automatické notifikace při dosažení ceny
- **Portfoliová upozornění**: Sledování změn
- **E-mailové notifikace**: Pravidelné zprávy
- **Push notifikace**: Desktop a mobilní upozornění

### 📊 Grafy & Visualizace
- **Historické grafy**: Výkon portfolia v čase
- **Koláčové diagramy**: Alokace aktiv
- **Sloupcové grafy**: Srovnání investic
- **Interaktivní zoom**: Detailní analýza

### 🌐 Tržní Data
- **Yahoo Finance**: Aktuální ceny akcií
- **Alpha Vantage**: Technické analýzy
- **Finnhub**: Zprávy a data
- **Automatické aktualizace**: Real-time data

---

## 🚀 Rychlý Start (60 Sekund)

### 1. **Spustit Aplikaci**
```bash
npm install
npm run dev
# Aplikace běží na http://localhost:3000
```

### 2. **Přidat Prvou Investici**
- Klikni **"+ Přidat Investici"**
- Vyplň: Název, Symbol (AAPL, MSFT), Počet akcií, Kupní cena
- Klikni **"Přidat"**

### 3. **Prohlédnout Dashboard**
- **Souhrn**: Celkový výnos, aktuální hodnota
- **Grafy**: Vývoj portfolia
- **Metriky**: Sharpe ratio, Sortino ratio

### 4. **Nastavit Režim**
- Klikni **☀️/🌙** (tmavý/světlý režim)
- Zvolte čeština 🇨🇿

---

## 📖 Detailní Průvodce

### Správa Portfolia

#### Přidání Investice
1. Naviguj na **"Portfolio"**
2. Klikni **"+ Nová Investice"**
3. Vyplň podrobnosti:
   - **Název**: Název společnosti
   - **Symbol**: Burzovní symbol (AAPL, MSFT, ...)
   - **Počet akcií**: Množství vlastnící
   - **Kupní cena**: Cena za akcii
   - **Datum nákupu**: Kdy jste koupili
   - **Kategorie**: Akcie, ETF, Dluhopisy, ...
4. Klikni **"Přidat"**

#### Úprava Investice
1. Najdi investici v tabulce
2. Klikni **Upravit** (tužka ikona)
3. Změň potřebné údaje
4. Klikni **"Uložit"**

#### Odstranění Investice
1. Najdi investici v tabulce
2. Klikni **Smazat** (koš ikona)
3. Potvrdi akci

### Analýza Portfolia

#### Metriky Výkonu
- **Celkový Výnos**: (Aktuální Hodnota - Vložené) / Vložené × 100%
- **CAGR**: Složená roční míra růstu
- **IRR**: Interní míra návratnosti
- **Sharpe Ratio**: Výnos na jednotku rizika
- **Sortino Ratio**: Výnos na jednotku negativního rizika

#### Analýza Rizika
- **Volatilita**: Standardní odchylka výnosů
- **Beta**: Citlivost na tržní pohyby
- **Max Drawdown**: Největší pokles od vrcholu
- **Value at Risk**: Maximální očekávaná ztráta

### Importování & Exportování

#### Importování CSV
1. Naviguj na **"Nastavení" → "Import/Export"**
2. Klikni **"Vybrat Soubor"**
3. Vyber CSV soubor ve formátu:
   ```
   Název,Symbol,Počet,Cena,Datum
   Apple,AAPL,10,150,2023-01-15
   ```
4. Klikni **"Importovat"**

#### Exportování do PDF
1. Klikni **"Exportovat PDF"**
2. Výběr obsahu (grafy, tabulky, metriky)
3. Klikni **"Generovat PDF"**
4. Soubor se stáhne automaticky

### Správa Tržních Dat

#### Konfiguraci API Klíčů
1. Klikni **"⚙️ Nastavení"**
2. Naviguj na **"Tržní Data"**
3. Vyplň API klíče:
   - **Yahoo Finance**: Bez klíče (veřejný)
   - **Alpha Vantage**: [Zaregistruj se](https://www.alphavantage.co/api/)
   - **Finnhub**: [Zaregistruj se](https://finnhub.io/)
4. Klikni **"Uložit"**

#### Automatické Aktualizace
1. Jdi na **"Nastavení" → "Auto-Update"**
2. Zaškrtni **"Povolit automatické aktualizace"**
3. Nastav interval (5, 15, 30 minut)
4. Klikni **"Uložit"**

---

## ⚙️ Nastavení

### Vzhled & Chování
- **Tema**: Tmavý, Světlý, Auto (dle OS)
- **Aktualizace**: Jak často se má dashboard osvežit
- **Jazyk**: Vyberte preferovaný jazyk
- **Prvky UI**: Přizpůsobte si zobrazení

### Bezpečnost & Soukromí
- **Zabezpečení**: Šifrování dat
- **Zálohování**: Automatické zálohování
- **Oprávnění**: Správa přístupu
- **Cookies**: Správa cookies

### Oznámení
- **Email**: Zapnout/vypnout emailová upozornění
- **Push**: Desktop notifikace
- **Zvuky**: Zvukové upozornění
- **Četnost**: Kdy dostávat notifikace

---

## 🛠️ Řešení Problémů

### Aplikace se Nespustí
```bash
# Vymazat cache
npm run clean

# Přeinstalovat závislosti
npm install

# Spustit znovu
npm run dev
```

### Data se Neukazují
1. Obnov stránku (**Ctrl+R** / **Cmd+R**)
2. Vymaž Local Storage: **F12** → **Application** → **Local Storage** → **Smaž**
3. Přidej investici znovu

### Tržní Data Nefungují
1. Ověř internetové připojení
2. Zkontroluj API klíče v nastavení
3. Ověř limity API (mohou být překročeny)

### Tmavý Režim Nefunguje
1. Klikni **2x** na ikonu režimu
2. Nebo vymaž Local Storage a restartuj

### Bez Notifikací
1. Jdi na **"Nastavení" → "Oznámení"**
2. Zkontroluj, že jsou zapnutá
3. Povolte soubory cookie v prohlížeči

---

## 📊 Porovnání s Konkurencí

| Funkce | **Portfolio Manager Pro** | Konkurent A | Konkurent B |
|--------|--------------------------|------------|------------|
| 📈 Technické Analýzy | ✅ (10+ indikátorů) | ✅ (5) | ✅ (7) |
| 💾 Bezpečné Zálohování | ✅ (Firestore) | ✅ (AWS) | ❌ |
| 🌐 Tržní Data | ✅ (3 zdroje) | ✅ (1) | ✅ (2) |
| 🎨 Tmavý/Světlý Režim | ✅ (Auto) | ❌ | ✅ (Ruční) |
| 📱 Mobilní Aplikace | ✅ (PWA) | ❌ | ✅ (iOS/Android) |
| 🔔 Notifikace | ✅ (Email/Push) | ✅ (Email) | ✅ (In-app) |
| 🌍 Jazyky | ✅ (10 jazyků) | ✅ (3) | ✅ (5) |
| 💰 Cena | **Proprietary** | $9.99/měsíc | $19.99/měsíc |
| 🔒 Soukromí | ✅ (On-premise) | ❌ | ❌ |
| 📊 Offline Režim | ✅ | ❌ | ❌ |

---

## 🎁 Výhody Portfolio Manager Pro

✅ **Bezplatné**: Žádné skryté poplatky  
✅ **Soukromí**: Data zůstávají u vás  
✅ **Offline**: Funguje bez internetu  
✅ **Bezpečné**: Military-grade šifrování  
✅ **Open API**: Integrace s vašimi nástroji  
✅ **Bez Reklam**: Čisté prostředí  
✅ **Vlastní Data**: Export kdykoli  
✅ **Pokročilé**: Pro profesionály i začátečníky  

---

## 📞 Podpora & Pomoc

### Dokumentace
- 📖 **Technické**: Viz `DEVELOPER_GUIDE.md`
- 🔒 **Bezpečnost**: Viz `SECURITY.md`
- 🚀 **Setup**: Viz `SETUP.md`

### FAQ

**P: Jak zálohuju svá data?**
A: Jdi na **"Nastavení" → "Zálohování"** a klikni **"Zálohovat Nyní"**

**P: Mohu exportovat jako CSV?**
A: Ano! Jdi na **"Nastavení" → "Export"** a vyber **CSV**

**P: Je to bezpečné?**
A: Ano! Používáme SSL/TLS, AES-256 šifrování a nejsou žádné reklamy

**P: Funguje offline?**
A: Ano! Všechna data jsou uložena lokálně

---

## 📝 Poznámky

- Data jsou uložena v **Local Storage** (Browser Storage) a volitelně v **Firestore**
- Aplikace je **PWA** - můžete ji nainstalovat jako aplikaci
- Tržní data se aktualizují dle limitu API
- Příkazy pro příkazový řádek jsou nastaveny pro **Linux/Mac** (použij `cmd` na Windows)

---

## 🌟 Tipy & Triky

1. **Využijte Klávesové Zkratky**:
   - `Ctrl+N`: Nová investice
   - `Ctrl+E`: Export
   - `Ctrl+S`: Uložit

2. **Automatické Aktualizace**: Zapni auto-update pro tržní data

3. **Mobilní Verze**: Instaluj jako PWA pro lepší zážitek na mobilu

4. **Tmavý Režim**: Zapni pro lepší pohodlí při čtení v noci

5. **Backup Pravidelně**: Exportuj svá data jednou za měsíc

---

## 🎓 Vzdělávání

Chceš se dozvědět více o investování? Podívej se:
- 📚 [Investopedia](https://www.investopedia.com/)
- 📚 [Khan Academy](https://www.khanacademy.org/)
- 📊 [TradingView](https://www.tradingview.com/)

---

## 📄 Licence

Portfolio Manager Pro je **proprietární software**.
Viz `LICENSE` a `PROPRIETARY_NOTICE.md` pro podrobnosti.

**© 2025 Portfolio Manager Pro. Všechna práva vyhrazena.**

---

**Verze**: 3.3.0  
**Poslední aktualizace**: 7. listopadu 2025  
**Stav**: Production Ready ✅
