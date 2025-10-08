/**
 * Interactive Help System & User Guide
 * Professional onboarding and context-sensitive help
 */

class HelpSystem {
  constructor() {
    this.currentStep = 0;
    this.tourActive = false;
    this.helpArticles = new Map();
    this.shortcuts = new Map();
    this.tooltips = new Map();
    this.hasCompletedTour = false;

    this.init();
  }

  /**
   * Initialize help system
   */
  init() {
    try {
      this.loadProgress();
      this.createHelpArticles();
      this.createKeyboardShortcuts();
      this.createHelpUI();
      this.setupTooltips();
      this.checkFirstTimeUser();

      console.log('✅ Help System initialized');
    } catch (error) {
      console.error('❌ Help System initialization failed:', error);
    }
  }

  /**
   * Create comprehensive help articles
   */
  createHelpArticles() {
    // Quick Start Guide
    this.helpArticles.set('quickstart', {
      title: '🚀 Rychlý Start',
      icon: '🚀',
      category: 'basics',
      content: `
        <h3>Vítejte v Portfolio Manager Pro!</h3>
        
        <h4>1. Přidání Prvního Aktiva</h4>
        <p>Klikněte na tlačítko <strong>"➕ Přidat Fond"</strong> v levé horní části aplikace.</p>
        <p>Vyplňte formulář s následujícími údaji:</p>
        <ul>
          <li><strong>Název:</strong> Jméno aktiva (např. "Apple Inc.")</li>
          <li><strong>Počet:</strong> Množství kusů</li>
          <li><strong>Nákupní cena:</strong> Cena za kus při nákupu</li>
          <li><strong>Aktuální cena:</strong> Současná tržní cena</li>
        </ul>
        
        <h4>2. Základní Operace</h4>
        <ul>
          <li><strong>Upravit:</strong> Klikněte na řádek v tabulce</li>
          <li><strong>Smazat:</strong> Klikněte na červené "✕" tlačítko</li>
          <li><strong>Vrátit zpět:</strong> <kbd>Ctrl+Z</kbd></li>
          <li><strong>Znovu:</strong> <kbd>Ctrl+Y</kbd></li>
        </ul>
        
        <h4>3. Prozkoumat Funkce</h4>
        <p>V horní liště najdete 16 tlačítek s pokročilými funkcemi:</p>
        <ul>
          <li>📊 <strong>Grafy</strong> - Vizualizace dat</li>
          <li>💾 <strong>PDF</strong> - Export reportů</li>
          <li>🎯 <strong>Optimalizace</strong> - Portfolio optimization</li>
          <li>🤖 <strong>AI</strong> - Inteligentní doporučení</li>
        </ul>
        
        <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 16px;">
          <strong>💡 Tip:</strong> Zkuste kliknout na <strong>"🎓 Nápověda"</strong> tlačítko pro detailní průvodce!
        </div>
      `,
    });

    // Features Overview
    this.helpArticles.set('features', {
      title: '✨ Přehled Funkcí',
      icon: '✨',
      category: 'features',
      content: `
        <h3>27 Pokročilých Funkcí</h3>
        
        <div style="display: grid; gap: 16px;">
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
            <h4>📊 Analytika & Grafy</h4>
            <ul>
              <li><strong>Interaktivní grafy</strong> - 4 typy (donut/bar/line/radar)</li>
              <li><strong>Finanční výpočty</strong> - ROI, CAGR, Sharpe ratio</li>
              <li><strong>Dashboard</strong> - 8 customizovatelných widgetů</li>
              <li><strong>Pokročilá analytika</strong> - VaR, volatilita, benchmarking</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
            <h4>💾 Export & Sdílení</h4>
            <ul>
              <li><strong>PDF export</strong> - 6-stránkové reporty</li>
              <li><strong>Excel export</strong> - 4-sheet workbooks s formulemi</li>
              <li><strong>Cloud backup</strong> - Google Drive + Dropbox</li>
              <li><strong>Sdílení portfolií</strong> - Sociální funkce</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
            <h4>🤖 AI & Optimalizace</h4>
            <ul>
              <li><strong>AI doporučení</strong> - ML-powered insights</li>
              <li><strong>Portfolio optimalizace</strong> - Modern Portfolio Theory</li>
              <li><strong>Živá tržní data</strong> - Real-time ceny</li>
              <li><strong>Predikce</strong> - Cenové predikce s confidence</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
            <h4>🔧 Produktivita</h4>
            <ul>
              <li><strong>Undo/Redo</strong> - 50-step historie</li>
              <li><strong>Fuzzy search</strong> - Rychlé vyhledávání</li>
              <li><strong>Auto-save</strong> - Automatické ukládání</li>
              <li><strong>Version control</strong> - Git-like verzování</li>
            </ul>
          </div>
        </div>
      `,
    });

    // Keyboard Shortcuts
    this.helpArticles.set('shortcuts', {
      title: '⌨️ Klávesové Zkratky',
      icon: '⌨️',
      category: 'advanced',
      content: `
        <h3>Klávesové Zkratky</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Zkratka</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Akce</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>Ctrl + Z</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Vrátit zpět poslední akci</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>Ctrl + Y</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Znovu provést akci</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>Ctrl + S</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Manuální uložení (auto-save aktivní)</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>Ctrl + F</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Otevřít vyhledávání</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>Escape</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Zavřít aktivní panel</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>Tab</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Navigace mezi poli formuláře</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>Enter</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Potvrdit formulář</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6;"><kbd>F1</kbd></td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Otevřít nápovědu</td>
            </tr>
          </tbody>
        </table>
        
        <div style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-top: 16px;">
          <strong>⚡ Pro tip:</strong> Klávesové zkratky výrazně zvyšují produktivitu!
        </div>
      `,
    });

    // Optimization Guide
    this.helpArticles.set('optimization', {
      title: '🎯 Průvodce Optimalizací',
      icon: '🎯',
      category: 'advanced',
      content: `
        <h3>Portfolio Optimalizace</h3>
        
        <h4>Co je Portfolio Optimalizace?</h4>
        <p>Používáme <strong>Modern Portfolio Theory (MPT)</strong> k nalezení ideálního rozložení vašich investic pro maximalizaci výnosu při minimalizaci rizika.</p>
        
        <h4>3 Optimalizační Strategie:</h4>
        
        <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin: 12px 0;">
          <h5>📈 Maximalizace Sharpe Ratio</h5>
          <p><strong>Nejlepší pro:</strong> Vyvážený přístup k výnosu a riziku</p>
          <p><strong>Výsledek:</strong> Optimální risk-adjusted returns</p>
        </div>
        
        <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin: 12px 0;">
          <h5>🛡️ Minimalizace Volatility</h5>
          <p><strong>Nejlepší pro:</strong> Konzervativní investory</p>
          <p><strong>Výsledek:</strong> Nejnižší možné riziko portfolia</p>
        </div>
        
        <div style="background: #ffebee; padding: 12px; border-radius: 8px; margin: 12px 0;">
          <h5>🚀 Maximalizace Výnosu</h5>
          <p><strong>Nejlepší pro:</strong> Agresivní investory</p>
          <p><strong>Výsledek:</strong> Nejvyšší očekávaný výnos (vysoké riziko)</p>
        </div>
        
        <h4>Jak Použít:</h4>
        <ol>
          <li>Klikněte na <strong>🎯 Optimize</strong> tlačítko</li>
          <li>Vyberte optimalizační cíl</li>
          <li>Prohlédněte si doporučenou alokaci</li>
          <li>Implementujte změny manuálně</li>
        </ol>
        
        <div style="background: #f3e5f5; padding: 12px; border-radius: 8px; margin-top: 16px;">
          <strong>📚 Technické detaily:</strong> Používáme gradient ascent algoritmus pro optimalizaci váh portfolia na základě kovariační matice a očekávaných výnosů.
        </div>
      `,
    });

    // Analytics Guide
    this.helpArticles.set('analytics', {
      title: '📊 Pokročilá Analytika',
      icon: '📊',
      category: 'advanced',
      content: `
        <h3>Pokročilá Analytika</h3>
        
        <h4>Klíčové Metriky:</h4>
        
        <div style="display: grid; gap: 12px;">
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <strong>💰 ROI (Return on Investment)</strong>
            <p>Celkový výnos investice v procentech.</p>
            <p><code>ROI = ((Aktuální Hodnota - Investováno) / Investováno) × 100%</code></p>
          </div>
          
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <strong>📈 CAGR (Compound Annual Growth Rate)</strong>
            <p>Průměrný roční růst zohledňující složené úročení.</p>
            <p><code>CAGR = ((Konečná Hodnota / Počáteční Hodnota)^(1/Roky)) - 1</code></p>
          </div>
          
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <strong>📊 Sharpe Ratio</strong>
            <p>Výnos přizpůsobený riziku (vyšší = lepší).</p>
            <p><code>Sharpe = (Výnos - Bezriziková Sazba) / Volatilita</code></p>
          </div>
          
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <strong>⚠️ Value at Risk (VaR)</strong>
            <p>Maximální očekávaná ztráta s 95% pravděpodobností.</p>
            <p>Ukazuje, kolik můžete ztratit v nejhorším scénáři.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <strong>📉 Volatilita</strong>
            <p>Míra kolísání cen (směrodatná odchylka výnosů).</p>
            <p>Nižší volatilita = stabilnější investice.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <strong>🎯 Concentration Risk</strong>
            <p>Procentuální podíl největšího aktiva v portfoliu.</p>
            <p>&lt;20% = Nízké | 20-30% = Střední | &gt;30% = Vysoké</p>
          </div>
        </div>
        
        <h4>Benchmark Porovnání:</h4>
        <p>Vaše portfolio je porovnáváno s těmito indexy:</p>
        <ul>
          <li><strong>SPY</strong> - S&P 500 (500 největších US firem)</li>
          <li><strong>QQQ</strong> - Nasdaq 100 (tech firmy)</li>
          <li><strong>DIA</strong> - Dow Jones (30 blue-chip firem)</li>
          <li><strong>IWM</strong> - Russell 2000 (malé firmy)</li>
        </ul>
      `,
    });

    // Mobile Guide
    this.helpArticles.set('mobile', {
      title: '📱 Mobilní Použití',
      icon: '📱',
      category: 'basics',
      content: `
        <h3>Mobilní Funkce</h3>
        
        <h4>Touch Gesta:</h4>
        <ul>
          <li><strong>Swipe Right:</strong> Otevřít mobilní menu</li>
          <li><strong>Swipe Left:</strong> Zavřít mobilní menu</li>
          <li><strong>Pull Down:</strong> Refresh data (na začátku stránky)</li>
          <li><strong>Pinch:</strong> Zoom na grafech</li>
          <li><strong>Long Press:</strong> Kontextové menu (připraveno)</li>
        </ul>
        
        <h4>Bottom Navigation:</h4>
        <p>Na mobilních zařízeních najdete 5 hlavních tlačítek na spodní liště:</p>
        <ul>
          <li>💼 <strong>Portfolio</strong> - Hlavní přehled</li>
          <li>📊 <strong>Dashboard</strong> - Analytický dashboard</li>
          <li>➕ <strong>Add</strong> - Přidat nové aktivum</li>
          <li>🔔 <strong>Alerts</strong> - Notifikace</li>
          <li>⚙️ <strong>More</strong> - Další možnosti</li>
        </ul>
        
        <h4>Instalace PWA:</h4>
        <ol>
          <li>Otevřete aplikaci v mobilním prohlížeči</li>
          <li>Klikněte na "Install" prompt nebo menu prohlížeče</li>
          <li>Vyberte "Add to Home Screen"</li>
          <li>Aplikace se nainstaluje jako nativní app</li>
        </ol>
        
        <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 16px;">
          <strong>✨ Výhody PWA:</strong>
          <ul>
            <li>Funguje offline</li>
            <li>Rychlejší načítání</li>
            <li>Native-like experience</li>
            <li>Push notifikace</li>
          </ul>
        </div>
      `,
    });

    // Troubleshooting
    this.helpArticles.set('troubleshooting', {
      title: '🔧 Řešení Problémů',
      icon: '🔧',
      category: 'support',
      content: `
        <h3>Časté Problémy a Řešení</h3>
        
        <div style="border-left: 4px solid #f39c12; padding: 12px; background: #fff3cd; margin: 12px 0;">
          <strong>❓ Proč se mi nezobrazují grafy?</strong>
          <p><strong>Řešení:</strong></p>
          <ul>
            <li>Zkontrolujte, zda máte přidaná nějaká aktiva</li>
            <li>Obnovte stránku (F5)</li>
            <li>Zkuste jiný typ grafu</li>
            <li>Vyčistěte cache prohlížeče</li>
          </ul>
        </div>
        
        <div style="border-left: 4px solid #f39c12; padding: 12px; background: #fff3cd; margin: 12px 0;">
          <strong>❓ Ztratil jsem svá data!</strong>
          <p><strong>Řešení:</strong></p>
          <ul>
            <li>Zkontrolujte <strong>🔀 Version Control</strong> - můžete vrátit předchozí verzi</li>
            <li>Pokud máte aktivní cloud backup, obnovte z <strong>☁️ Cloud</strong></li>
            <li>Data jsou uložena v LocalStorage - zkuste jiný prohlížeč</li>
          </ul>
        </div>
        
        <div style="border-left: 4px solid #f39c12; padding: 12px; background: #fff3cd; margin: 12px 0;">
          <strong>❓ PDF export nefunguje</strong>
          <p><strong>Řešení:</strong></p>
          <ul>
            <li>Zkontrolujte, zda nemáte blokovaná popup okna</li>
            <li>Zkuste "Quick Export" místo "Full Report"</li>
            <li>Ujistěte se, že máte povolený JavaScript</li>
          </ul>
        </div>
        
        <div style="border-left: 4px solid #f39c12; padding: 12px; background: #fff3cd; margin: 12px 0;">
          <strong>❓ Aplikace je pomalá</strong>
          <p><strong>Řešení:</strong></p>
          <ul>
            <li>Máte více než 1000 položek? Použijte filtrování</li>
            <li>Zavřete nepoužívané panely</li>
            <li>Vyčistěte cache prohlížeče</li>
            <li>Restartujte prohlížeč</li>
          </ul>
        </div>
        
        <div style="border-left: 4px solid #2ecc71; padding: 12px; background: #e8f5e9; margin: 12px 0;">
          <strong>💡 Obecné Tipy:</strong>
          <ul>
            <li>Pravidelně zálohujte do cloudu</li>
            <li>Používejte version control před velkými změnami</li>
            <li>Ukládejte důležitá portfolia jako PDF</li>
            <li>Aktualizujte prohlížeč na nejnovější verzi</li>
          </ul>
        </div>
      `,
    });

    // FAQ
    this.helpArticles.set('faq', {
      title: '❓ Často Kladené Otázky',
      icon: '❓',
      category: 'support',
      content: `
        <h3>FAQ - Často Kladené Otázky</h3>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Je aplikace zdarma?</summary>
          <p style="margin-top: 8px;">Ano, Portfolio Manager Pro je 100% zdarma a open-source. Žádné skryté poplatky.</p>
        </details>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Jsou moje data v bezpečí?</summary>
          <p style="margin-top: 8px;">Ano! Všechna data jsou uložena lokálně ve vašem prohlížeči (LocalStorage). Nic se neodesílá na server. Můžete si data zálohovat do Google Drive nebo Dropbox.</p>
        </details>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Funguje aplikace offline?</summary>
          <p style="margin-top: 8px;">Ano! Díky Progressive Web App technologii funguje aplikace plně offline po první návštěvě. Všechny funkce kromě živých tržních dat jsou k dispozici bez internetu.</p>
        </details>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Mohu sdílet portfolio s ostatními?</summary>
          <p style="margin-top: 8px;">Ano! Použijte <strong>👥 Social</strong> funkci pro sdílení portfolií. Můžete nastavit viditelnost na Public, Followers Only, nebo Private.</p>
        </details>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Jsou tržní data realtime?</summary>
          <p style="margin-top: 8px;">V současné verzi jsou tržní data simulovaná (demo). Pro produkční použití můžete připojit real API jako Alpha Vantage nebo IEX Cloud.</p>
        </details>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Jak funguje AI doporučení?</summary>
          <p style="margin-top: 8px;">AI modul analyzuje vaše portfolio a poskytuje predikce cen, doporučení pro rebalancing, identifikaci rizik a hledání příležitostí. Používá ML algoritmy (v demo režimu simulované).</p>
        </details>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Podporuje aplikace kryptoměny?</summary>
          <p style="margin-top: 8px;">Ano! Můžete přidat jakékoliv aktivum včetně kryptoměn. Stačí vyplnit název, množství a ceny.</p>
        </details>
        
        <details style="margin: 12px 0; background: #f8f9fa; padding: 12px; border-radius: 8px;">
          <summary style="cursor: pointer; font-weight: 600;">Mohu importovat data z jiné aplikace?</summary>
          <p style="margin-top: 8px;">Můžete importovat Excel (.xlsx) soubory. Ujistěte se, že obsahují sloupce: název, počet, nákupní cena, aktuální cena.</p>
        </details>
      `,
    });
  }

  /**
   * Create keyboard shortcuts reference
   */
  createKeyboardShortcuts() {
    this.shortcuts.set('ctrl+z', 'Vrátit zpět poslední akci');
    this.shortcuts.set('ctrl+y', 'Znovu provést akci');
    this.shortcuts.set('ctrl+s', 'Manuální uložení');
    this.shortcuts.set('ctrl+f', 'Otevřít vyhledávání');
    this.shortcuts.set('escape', 'Zavřít aktivní panel');
    this.shortcuts.set('f1', 'Otevřít nápovědu');
    this.shortcuts.set('tab', 'Navigace formulářem');
    this.shortcuts.set('enter', 'Potvrdit formulář');

    // Register global keyboard listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.showHelp();
      }
    });
  }

  /**
   * Create help UI
   */
  createHelpUI() {
    // Add help button to header
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) {return;}

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) {return;}

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) {return;}

    const helpBtn = document.createElement('button');
    helpBtn.id = 'helpBtn';
    helpBtn.className = 'btn-icon';
    helpBtn.title = 'Nápověda & Průvodce (F1)';
    helpBtn.setAttribute('aria-label', 'Nápověda');
    helpBtn.style.cssText =
      'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 8px; cursor: pointer; animation: pulse 2s infinite;';
    helpBtn.textContent = '🎓';

    helpBtn.addEventListener('click', () => this.showHelp());

    buttonContainer.appendChild(helpBtn);

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup tooltips for all buttons
   */
  setupTooltips() {
    this.tooltips.set('pridatFond', 'Přidat nové aktivum do portfolia');
    this.tooltips.set('searchBtn', 'Vyhledat aktiva (fuzzy search)');
    this.tooltips.set('chartsBtn', 'Zobrazit interaktivní grafy');
    this.tooltips.set('pdfBtn', 'Exportovat PDF report');
    this.tooltips.set('excelBtn', 'Exportovat Excel soubor');
    this.tooltips.set('dashboardBtn', 'Otevřít customizovatelný dashboard');
    this.tooltips.set('collaborationBtn', 'Real-time spolupráce');
    this.tooltips.set('notificationBtn', 'Notifikace a upozornění');
    this.tooltips.set('activityBtn', 'Historie aktivit (audit log)');
    this.tooltips.set('languageBtn', 'Změnit jazyk (5 jazyků)');
    this.tooltips.set('aiBtn', 'AI-powered doporučení');
    this.tooltips.set('marketDataBtn', 'Živá tržní data');
    this.tooltips.set('versionControlBtn', 'Version control (Git-like)');
    this.tooltips.set('optimizeBtn', 'Portfolio optimalizace (MPT)');
    this.tooltips.set('socialBtn', 'Sociální funkce a sdílení');
    this.tooltips.set('advancedAnalyticsBtn', 'Pokročilá analytika');

    // Add tooltips to buttons
    this.tooltips.forEach((text, btnId) => {
      const btn = document.getElementById(btnId);
      if (btn && !btn.title) {
        btn.title = text;
      }
    });
  }

  /**
   * Check if first-time user
   */
  checkFirstTimeUser() {
    if (!this.hasCompletedTour) {
      // Show welcome message after short delay
      setTimeout(() => {
        this.showWelcomeMessage();
      }, 1000);
    }
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.id = 'welcomeMessage';
    welcome.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      max-width: 90%;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10002;
      animation: slideIn 0.3s ease;
    `;

    welcome.innerHTML = `
      <div style="padding: 32px; text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 16px;">🎉</div>
        <h2 style="margin: 0 0 12px 0; color: #333;">Vítejte v Portfolio Manager Pro!</h2>
        <p style="color: #666; margin-bottom: 24px;">
          Enterprise-grade aplikace pro správu investičního portfolia
        </p>
        
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left;">
          <strong style="color: #333;">✨ Co vás čeká:</strong>
          <ul style="margin: 8px 0; padding-left: 20px; color: #666;">
            <li>27 pokročilých funkcí</li>
            <li>AI-powered doporučení</li>
            <li>Real-time collaboration</li>
            <li>Portfolio optimization</li>
            <li>Živá tržní data</li>
          </ul>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button 
            onclick="window.helpSystem.startInteractiveTour(); document.getElementById('welcomeMessage').remove();"
            style="flex: 1; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;"
          >
            🚀 Začít Prohlídku
          </button>
          <button 
            onclick="document.getElementById('welcomeMessage').remove(); window.helpSystem.markTourCompleted();"
            style="flex: 1; padding: 14px; background: #e9ecef; color: #495057; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;"
          >
            Přeskočit
          </button>
        </div>
      </div>
    `;

    // Add slideIn animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translate(-50%, -50%) scale(0.9);
          opacity: 0;
        }
        to {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(welcome);
  }

  /**
   * Start interactive tour
   */
  startInteractiveTour() {
    this.tourActive = true;
    this.currentStep = 0;
    this.showTourStep(0);
  }

  /**
   * Show tour step
   */
  showTourStep(stepIndex) {
    const steps = [
      {
        target: '#pridatFond',
        title: '1. Přidání Aktiva',
        content:
          'Klikněte zde pro přidání nového aktiva do portfolia. Vyplňte název, počet kusů a ceny.',
        position: 'bottom',
      },
      {
        target: '#portfolioTable',
        title: '2. Portfolio Tabulka',
        content:
          'Zde vidíte všechna vaše aktiva. Klikněte na řádek pro editaci, nebo na ✕ pro smazání.',
        position: 'top',
      },
      {
        target: '#chartsBtn',
        title: '3. Grafy & Analytika',
        content:
          'Vizualizujte vaše portfolio pomocí 4 typů interaktivních grafů (donut, bar, line, radar).',
        position: 'bottom',
      },
      {
        target: '#pdfBtn',
        title: '4. PDF Export',
        content: 'Exportujte profesionální 6-stránkové reporty s grafy a metrikami.',
        position: 'bottom',
      },
      {
        target: '#optimizeBtn',
        title: '5. Portfolio Optimalizace',
        content:
          'Použijte Modern Portfolio Theory k optimalizaci vašeho portfolia pro maximální výnos.',
        position: 'bottom',
      },
      {
        target: '#aiBtn',
        title: '6. AI Doporučení',
        content: 'Získejte AI-powered predikce cen, doporučení a identifikaci rizik.',
        position: 'bottom',
      },
      {
        target: '#helpBtn',
        title: '7. Nápověda (F1)',
        content: 'Kdykoliv klikněte sem nebo zmáčkněte F1 pro detailní nápovědu a dokumentaci.',
        position: 'bottom',
      },
    ];

    if (stepIndex >= steps.length) {
      this.completeTour();
      return;
    }

    const step = steps[stepIndex];
    this.showTooltipOverlay(step, stepIndex, steps.length);
  }

  /**
   * Show tooltip overlay
   */
  showTooltipOverlay(step, stepIndex, totalSteps) {
    // Remove existing overlay
    document.getElementById('tourOverlay')?.remove();
    document.getElementById('tourTooltip')?.remove();

    // Create dark overlay
    const overlay = document.createElement('div');
    overlay.id = 'tourOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 10000;
    `;
    document.body.appendChild(overlay);

    // Highlight target element
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();

      // Create spotlight
      const spotlight = document.createElement('div');
      spotlight.style.cssText = `
        position: fixed;
        top: ${rect.top - 8}px;
        left: ${rect.left - 8}px;
        width: ${rect.width + 16}px;
        height: ${rect.height + 16}px;
        border: 3px solid #667eea;
        border-radius: 8px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.7), 0 0 20px rgba(102, 126, 234, 0.8);
        z-index: 10001;
        pointer-events: none;
      `;
      document.body.appendChild(spotlight);

      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.id = 'tourTooltip';

      const tooltipY = step.position === 'top' ? rect.top - 200 : rect.bottom + 20;

      tooltip.style.cssText = `
        position: fixed;
        top: ${tooltipY}px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        max-width: 90%;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10002;
        animation: fadeIn 0.3s ease;
      `;

      tooltip.innerHTML = `
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #333;">${step.title}</h3>
            <span style="color: #999; font-size: 0.9rem;">${stepIndex + 1}/${totalSteps}</span>
          </div>
          <p style="color: #666; margin-bottom: 20px;">${step.content}</p>
          
          <div style="display: flex; gap: 12px;">
            ${
  stepIndex > 0
    ? `
              <button 
                onclick="window.helpSystem.showTourStep(${stepIndex - 1})"
                style="padding: 10px 20px; background: #e9ecef; color: #495057; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
              >
                ← Zpět
              </button>
            `
    : ''
}
            <button 
              onclick="window.helpSystem.skipTour()"
              style="padding: 10px 20px; background: #e9ecef; color: #495057; border: none; border-radius: 6px; cursor: pointer;"
            >
              Přeskočit
            </button>
            <button 
              onclick="window.helpSystem.showTourStep(${stepIndex + 1})"
              style="flex: 1; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
            >
              ${stepIndex === totalSteps - 1 ? 'Dokončit ✓' : 'Další →'}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(tooltip);

      // Add fadeIn animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Skip tour
   */
  skipTour() {
    document.getElementById('tourOverlay')?.remove();
    document.getElementById('tourTooltip')?.remove();
    document.querySelectorAll('[style*="box-shadow: 0 0 0 9999px"]').forEach((el) => el.remove());

    this.tourActive = false;
    this.markTourCompleted();
  }

  /**
   * Complete tour
   */
  completeTour() {
    this.skipTour();

    // Show completion message
    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification(
        '🎉 Prohlídka dokončena! Nyní můžete začít používat aplikaci.',
        'success'
      );
    }
  }

  /**
   * Mark tour as completed
   */
  markTourCompleted() {
    this.hasCompletedTour = true;
    this.saveProgress();
  }

  /**
   * Show help panel
   */
  showHelp() {
    // Remove existing panel
    document.getElementById('helpPanel')?.remove();

    const panel = document.createElement('div');
    panel.id = 'helpPanel';
    panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 600px;
      max-width: 90%;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
      z-index: 10003;
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.3s ease;
    `;

    panel.innerHTML = `
      <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; display: flex; align-items: center; gap: 12px;">
            <span>🎓</span>
            <span>Nápověda & Průvodce</span>
          </h2>
          <button id="closeHelpPanel" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: white;">✕</button>
        </div>
      </div>
      
      <div style="padding: 20px; border-bottom: 1px solid #eee; flex-shrink: 0;">
        <input 
          type="text" 
          id="helpSearch" 
          placeholder="Hledat v nápovědě..."
          style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem;"
        >
      </div>
      
      <div style="display: flex; border-bottom: 1px solid #eee; flex-shrink: 0;">
        <button class="help-tab active" data-category="all" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 3px solid #667eea; cursor: pointer; font-weight: 600;">
          Vše
        </button>
        <button class="help-tab" data-category="basics" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 3px solid transparent; cursor: pointer;">
          Základy
        </button>
        <button class="help-tab" data-category="features" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 3px solid transparent; cursor: pointer;">
          Funkce
        </button>
        <button class="help-tab" data-category="advanced" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 3px solid transparent; cursor: pointer;">
          Pokročilé
        </button>
      </div>
      
      <div id="helpContent" style="flex: 1; overflow-y: auto; padding: 20px;">
        ${this.renderHelpArticles('all')}
      </div>
      
      <div style="padding: 16px; border-top: 1px solid #eee; background: #f8f9fa; flex-shrink: 0;">
        <button 
          onclick="window.helpSystem.startInteractiveTour(); document.getElementById('helpPanel').remove();"
          style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
        >
          🚀 Spustit Interaktivní Prohlídku
        </button>
      </div>
    `;

    // Add slideInRight animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(panel);
    this.setupHelpPanelListeners();
  }

  /**
   * Render help articles
   */
  renderHelpArticles(category) {
    const articles = Array.from(this.helpArticles.values()).filter(
      (article) => category === 'all' || article.category === category
    );

    if (articles.length === 0) {
      return '<div style="text-align: center; padding: 40px; color: #999;">Žádné články nenalezeny</div>';
    }

    return articles
      .map(
        (article) => `
      <div class="help-article" style="margin-bottom: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onclick="window.helpSystem.showArticle('${Array.from(this.helpArticles.entries()).find(([, v]) => v === article)[0]}')">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 2rem;">${article.icon}</span>
          <div>
            <h4 style="margin: 0; color: #333;">${article.title}</h4>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  /**
   * Show article
   */
  showArticle(articleId) {
    const article = this.helpArticles.get(articleId);
    if (!article) {return;}

    const content = document.getElementById('helpContent');
    if (!content) {return;}

    content.innerHTML = `
      <button 
        onclick="window.helpSystem.showHelp()"
        style="padding: 8px 16px; background: #e9ecef; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 16px;"
      >
        ← Zpět
      </button>
      
      <div style="font-size: 3rem; text-align: center; margin-bottom: 16px;">${article.icon}</div>
      <h2 style="text-align: center; margin-bottom: 24px; color: #333;">${article.title}</h2>
      
      <div style="line-height: 1.6; color: #333;">
        ${article.content}
      </div>
    `;

    content.scrollTop = 0;
  }

  /**
   * Setup help panel listeners
   */
  setupHelpPanelListeners() {
    document.getElementById('closeHelpPanel')?.addEventListener('click', () => {
      document.getElementById('helpPanel')?.remove();
    });

    // Tab switching
    document.querySelectorAll('.help-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.help-tab').forEach((t) => {
          t.style.borderBottom = '3px solid transparent';
          t.style.fontWeight = 'normal';
          t.classList.remove('active');
        });

        tab.style.borderBottom = '3px solid #667eea';
        tab.style.fontWeight = '600';
        tab.classList.add('active');

        const category = tab.dataset.category;
        const content = document.getElementById('helpContent');
        if (content) {
          content.innerHTML = this.renderHelpArticles(category);
        }
      });
    });

    // Search
    const searchInput = document.getElementById('helpSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.searchHelp(query);
      });
    }

    // Hover effect on articles
    document.querySelectorAll('.help-article').forEach((article) => {
      article.addEventListener('mouseenter', function () {
        this.style.background = '#e9ecef';
        this.style.transform = 'translateX(4px)';
      });
      article.addEventListener('mouseleave', function () {
        this.style.background = '#f8f9fa';
        this.style.transform = 'translateX(0)';
      });
    });
  }

  /**
   * Search help articles
   */
  searchHelp(query) {
    if (!query) {
      const activeTab = document.querySelector('.help-tab.active');
      const category = activeTab ? activeTab.dataset.category : 'all';
      const content = document.getElementById('helpContent');
      if (content) {
        content.innerHTML = this.renderHelpArticles(category);
      }
      return;
    }

    const results = Array.from(this.helpArticles.entries()).filter(([, article]) => {
      return (
        article.title.toLowerCase().includes(query) || article.content.toLowerCase().includes(query)
      );
    });

    const content = document.getElementById('helpContent');
    if (!content) {return;}

    if (results.length === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
          <div style="color: #999;">Žádné výsledky pro "${query}"</div>
        </div>
      `;
      return;
    }

    content.innerHTML = results
      .map(
        ([id, article]) => `
      <div class="help-article" style="margin-bottom: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; cursor: pointer;" onclick="window.helpSystem.showArticle('${id}')">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 2rem;">${article.icon}</span>
          <div>
            <h4 style="margin: 0; color: #333;">${article.title}</h4>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  /**
   * Save progress
   */
  saveProgress() {
    try {
      localStorage.setItem(
        'helpSystemProgress',
        JSON.stringify({
          hasCompletedTour: this.hasCompletedTour,
          currentStep: this.currentStep,
        })
      );
    } catch (error) {
      console.error('Failed to save help progress:', error);
    }
  }

  /**
   * Load progress
   */
  loadProgress() {
    try {
      const data = localStorage.getItem('helpSystemProgress');
      if (data) {
        const progress = JSON.parse(data);
        this.hasCompletedTour = progress.hasCompletedTour || false;
        this.currentStep = progress.currentStep || 0;
      }
    } catch (error) {
      console.error('Failed to load help progress:', error);
    }
  }
}

// Global instance
window.helpSystem = new HelpSystem();

console.log('✅ Help System loaded');
