/**
 * @module help-system
 * User guide and onboarding system for Investment Portfolio Manager Pro
 * Version: 3.1.0
 */

/**
 * Initialize help system
 * @returns {void}
 */
export function initializeHelpSystem() {
  createHelpButton();
  createHelpModal();
  createWelcomeTour();
  addFeatureTooltips();
  checkFirstVisit();
}

/**
 * Create help button in top-right corner
 * Enhanced: Use existing button from HTML if present
 * @returns {void}
 */
function createHelpButton() {
  // Check if button already exists in HTML
  let helpBtn = document.getElementById('helpButton');

  if (helpBtn) {
    // Button exists - just enhance it with event listener
    helpBtn.addEventListener('click', () => showHelpModal());
    // Enhance opacity on hover
    helpBtn.style.transition = 'all 0.3s ease';
    helpBtn.addEventListener('mouseenter', () => {
      helpBtn.style.opacity = '1';
      helpBtn.style.transform = 'scale(1.05)';
    });
    helpBtn.addEventListener('mouseleave', () => {
      helpBtn.style.opacity = '0.9';
      helpBtn.style.transform = 'scale(1)';
    });
    return;
  }

  // Fallback: Create button if not present (backward compatibility)
  helpBtn = document.createElement('button');
  helpBtn.id = 'helpButton';
  helpBtn.className = 'help-button';
  helpBtn.setAttribute('aria-label', 'Nápověda');
  helpBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <span class="help-text">Nápověda</span>
  `;

  helpBtn.addEventListener('click', () => showHelpModal());
  document.body.appendChild(helpBtn);
}

/**
 * Create help modal with user guide
 * @returns {void}
 */
function createHelpModal() {
  const modal = document.createElement('div');
  modal.id = 'helpModal';
  modal.className = 'help-modal hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'helpModalTitle');
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="help-modal-overlay"></div>
    <div class="help-modal-content">
      <div class="help-modal-header">
        <h2 id="helpModalTitle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          Uživatelská příručka
        </h2>
        <button class="help-modal-close" aria-label="Zavřít nápovědu">&times;</button>
      </div>

      <div class="help-modal-body">
        <nav class="help-tabs" role="tablist">
          <button class="help-tab active" role="tab" data-tab="quick-start" aria-selected="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
            </svg>
            Rychlý start
          </button>
          <button class="help-tab" role="tab" data-tab="features">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.93 4.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
            Funkce
          </button>
          <button class="help-tab" role="tab" data-tab="tips">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            Tipy & triky
          </button>
          <button class="help-tab" role="tab" data-tab="faq">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
            </svg>
            FAQ
          </button>
        </nav>

        <div class="help-content">
          <!-- Quick Start Tab -->
          <div class="help-tab-content active" id="help-quick-start" role="tabpanel">
            <h3>🎯 Jak začít s Investment Portfolio Manager</h3>
            
            <div class="help-step">
              <div class="help-step-number">1</div>
              <div class="help-step-content">
                <h4>Vyplňte informace o klientovi</h4>
                <p>Začněte zadáním jména klienta a vašich kontaktních údajů jako poradce. Tyto informace se zobrazí ve všech reportech.</p>
                <div class="help-example">
                  <strong>Příklad:</strong>
                  <ul>
                    <li>Jméno klienta: Jan Novák</li>
                    <li>Jméno poradce: Petra Svobodová</li>
                    <li>Email: petra@invest.cz</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="help-step">
              <div class="help-step-number">2</div>
              <div class="help-step-content">
                <h4>Přidejte investiční fondy</h4>
                <p>Použijte formulář pro přidání fondů do portfolia. Zadejte název fondu, producenta, investovanou částku a aktuální hodnotu.</p>
                <div class="help-tip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  <strong>Tip:</strong> Data se automaticky ukládají každých 30 sekund
                </div>
              </div>
            </div>

            <div class="help-step">
              <div class="help-step-number">3</div>
              <div class="help-step-content">
                <h4>Sledujte výkonnost portfolia</h4>
                <p>Dashboard zobrazuje klíčové metriky: celkovou investici, aktuální hodnotu, zisk/ztrátu a procentuální výkonnost.</p>
              </div>
            </div>

            <div class="help-step">
              <div class="help-step-number">4</div>
              <div class="help-step-content">
                <h4>Exportujte reporty</h4>
                <p>Vytvořte profesionální PDF report nebo exportujte data do CSV pro další analýzu v Excelu.</p>
              </div>
            </div>
          </div>

          <!-- Features Tab -->
          <div class="help-tab-content" id="help-features" role="tabpanel" hidden>
            <h3>🚀 Přehled funkcí</h3>
            
            <div class="help-feature">
              <h4>📊 Interaktivní dashboard</h4>
              <ul>
                <li>Celková investovaná částka</li>
                <li>Aktuální hodnota portfolia</li>
                <li>Zisk/ztráta v Kč a %</li>
                <li>Barevné indikátory výkonnosti</li>
              </ul>
            </div>

            <div class="help-feature">
              <h4>📈 Pokročilé grafy</h4>
              <ul>
                <li>Koláčový graf alokace aktiv</li>
                <li>Sloupcový graf porovnání fondů</li>
                <li>Časová osa výkonnosti (připravováno)</li>
              </ul>
            </div>

            <div class="help-feature">
              <h4>🔍 Vyhledávání a filtrování</h4>
              <ul>
                <li>Rychlé vyhledávání fondů</li>
                <li>Filtrování podle producenta</li>
                <li>Řazení podle různých kritérií</li>
              </ul>
            </div>

            <div class="help-feature">
              <h4>📄 Export dat</h4>
              <ul>
                <li>PDF report s grafy</li>
                <li>CSV export pro Excel</li>
                <li>Automatické zálohy do cloudu (připravováno)</li>
              </ul>
            </div>

            <div class="help-feature">
              <h4>⚙️ Personalizace</h4>
              <ul>
                <li>Výběr barevných schémat</li>
                <li>Přepínání měn (Kč/€)</li>
                <li>Tmavý/světlý režim</li>
              </ul>
            </div>
          </div>

          <!-- Tips Tab -->
          <div class="help-tab-content" id="help-tips" role="tabpanel" hidden>
            <h3>💡 Tipy & triky</h3>
            
            <div class="help-tip-box">
              <h4>⌨️ Klávesové zkratky</h4>
              <table class="keyboard-shortcuts">
                <tr>
                  <td><kbd>Alt</kbd> + <kbd>H</kbd></td>
                  <td>Přejít na dashboard</td>
                </tr>
                <tr>
                  <td><kbd>Alt</kbd> + <kbd>S</kbd></td>
                  <td>Zaměřit vyhledávání</td>
                </tr>
                <tr>
                  <td><kbd>Alt</kbd> + <kbd>N</kbd></td>
                  <td>Přidat nový fond</td>
                </tr>
                <tr>
                  <td><kbd>Esc</kbd></td>
                  <td>Zavřít dialogy</td>
                </tr>
              </table>
            </div>

            <div class="help-tip-box">
              <h4>🎯 Best practices</h4>
              <ul>
                <li><strong>Pravidelné aktualizace:</strong> Aktualizujte hodnoty fondů alespoň jednou měsíčně</li>
                <li><strong>Zálohy:</strong> Exportujte CSV zálohu před velkými změnami</li>
                <li><strong>Kategorizace:</strong> Používejte konzistentní názvy producentů</li>
                <li><strong>Datum investice:</strong> Vždy vyplňujte pro přesné výpočty</li>
              </ul>
            </div>

            <div class="help-tip-box">
              <h4>⚡ Zrychlení práce</h4>
              <ul>
                <li>Použijte hromadné akce pro úpravy více fondů najednou</li>
                <li>Aktivujte auto-save pro zabránění ztrátě dat</li>
                <li>Vytvořte si vlastní barevné schéma pro lepší orientaci</li>
                <li>Využijte CSV import pro rychlé načtení dat</li>
              </ul>
            </div>
          </div>

          <!-- FAQ Tab -->
          <div class="help-tab-content" id="help-faq" role="tabpanel" hidden>
            <h3>❓ Často kladené otázky</h3>
            
            <div class="faq-item">
              <h4>Kde se ukládají moje data?</h4>
              <p>Všechna data jsou uložena lokálně ve vašem prohlížeči (localStorage). Žádná data neopouštějí váš počítač, pokud je neexportujete.</p>
            </div>

            <div class="faq-item">
              <h4>Mohu používat aplikaci offline?</h4>
              <p>Ano! Aplikace funguje plně offline po prvním načtení. Všechny funkce jsou dostupné bez internetového připojení.</p>
            </div>

            <div class="faq-item">
              <h4>Jak mohu zálohovat svá data?</h4>
              <p>Použijte funkci "Exportovat CSV" pro vytvoření zálohy. CSV soubor můžete kdykoliv naimportovat zpět.</p>
            </div>

            <div class="faq-item">
              <h4>Podporuje aplikace více portfolií?</h4>
              <p>Aktuálně podporuje jedno portfolio na prohlížeč. Pro více portfolií použijte různé profily prohlížeče nebo exportujte/importujte CSV.</p>
            </div>

            <div class="faq-item">
              <h4>Jak vypočítat výkonnost fondu?</h4>
              <p>Výkonnost = ((Aktuální hodnota - Investice) / Investice) × 100%. Aplikace vypočítá automaticky.</p>
            </div>

            <div class="faq-item">
              <h4>Mohu změnit měnu z Kč na €?</h4>
              <p>Ano, použijte přepínač měn v pravém horním rohu. Přepočet je pouze vizuální, data se ukládají v původní měně.</p>
            </div>

            <div class="faq-item">
              <h4>Co dělat při problémech?</h4>
              <p>1) Obnovte stránku (F5)<br>2) Vyčistěte cache prohlížeče<br>3) Zkontrolujte konzoli prohlížeče (F12)<br>4) Kontaktujte podporu s popisem problému</p>
            </div>
          </div>
        </div>
      </div>

      <div class="help-modal-footer">
        <button class="btn btn-secondary" id="helpModalCloseBtn">Zavřít</button>
        <button class="btn btn-primary" id="startWelcomeTourBtn">Zobrazit uvítací tour</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close button handler
  const closeBtn = modal.querySelector('.help-modal-close');
  closeBtn.addEventListener('click', () => hideHelpModal());

  // Footer close button handler
  const footerCloseBtn = modal.querySelector('#helpModalCloseBtn');
  footerCloseBtn.addEventListener('click', () => hideHelpModal());

  // Welcome tour button handler
  const tourBtn = modal.querySelector('#startWelcomeTourBtn');
  tourBtn.addEventListener('click', () => startWelcomeTour());

  // Overlay click handler
  const overlay = modal.querySelector('.help-modal-overlay');
  overlay.addEventListener('click', () => hideHelpModal());

  // Tab switching
  const tabs = modal.querySelectorAll('.help-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchHelpTab(tab.dataset.tab));
  });

  // ESC key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      hideHelpModal();
    }
  });
}

/**
 * Show help modal
 * @returns {void}
 */
function showHelpModal() {
  const modal = document.getElementById('helpModal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide help modal
 * @returns {void}
 */
function hideHelpModal() {
  const modal = document.getElementById('helpModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Switch between help tabs
 * @param {string} tabName - Tab identifier
 * @returns {void}
 */
function switchHelpTab(tabName) {
  // Update tab buttons
  const tabs = document.querySelectorAll('.help-tab');
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  // Update tab content
  const contents = document.querySelectorAll('.help-tab-content');
  contents.forEach((content) => {
    const isActive = content.id === `help-${tabName}`;
    content.classList.toggle('active', isActive);
    content.hidden = !isActive;
  });
}

/**
 * Create welcome tour for first-time users
 * @returns {void}
 */
function createWelcomeTour() {
  // Tour is started by button click event listener
}

/**
 * Start welcome tour
 * @returns {void}
 */
function startWelcomeTour() {
  hideHelpModal();

  const tourSteps = [
    {
      element: '#clientNameCard',
      title: 'Začněte zde',
      content: 'Nejprve vyplňte základní informace o klientovi a poradci.',
      position: 'bottom',
    },
    {
      element: '#portfolioCard',
      title: 'Přidejte fondy',
      content: 'Zde přidáte investiční fondy do portfolia klienta.',
      position: 'bottom',
    },
    {
      element: '#dashboard',
      title: 'Sledujte výkonnost',
      content: 'Dashboard zobrazuje přehled celého portfolia s grafy.',
      position: 'top',
    },
    {
      element: '#helpButton',
      title: 'Potřebujete pomoc?',
      content: 'Kdykoli klikněte na tlačítko nápovědy pro zobrazení průvodce.',
      position: 'left',
    },
  ];

  showTourStep(0, tourSteps);
}

/**
 * Show specific tour step
 * @param {number} stepIndex - Current step index
 * @param {Array} steps - Array of tour steps
 * @returns {void}
 */
function showTourStep(stepIndex, steps) {
  // Remove existing tour overlay
  const existingOverlay = document.querySelector('.tour-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  if (stepIndex >= steps.length) {
    return;
  }

  const step = steps[stepIndex];
  const targetElement = document.querySelector(step.element);

  if (!targetElement) {
    // Skip to next step if element not found
    showTourStep(stepIndex + 1, steps);
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'tour-overlay';

  const tooltip = document.createElement('div');
  tooltip.className = `tour-tooltip tour-${step.position}`;
  tooltip.innerHTML = `
    <div class="tour-tooltip-header">
      <h4>${step.title}</h4>
      <span class="tour-step-counter">${stepIndex + 1}/${steps.length}</span>
    </div>
    <p>${step.content}</p>
    <div class="tour-tooltip-footer">
      ${stepIndex > 0 ? '<button class="btn btn-secondary tour-btn-prev">Zpět</button>' : ''}
      ${stepIndex < steps.length - 1 ? '<button class="btn btn-primary tour-btn-next">Další</button>' : '<button class="btn btn-primary tour-btn-finish">Dokončit</button>'}
      <button class="btn btn-text tour-btn-skip">Přeskočit tour</button>
    </div>
  `;

  overlay.appendChild(tooltip);
  document.body.appendChild(overlay);

  // Position tooltip near target element
  const targetRect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let top = 0;
  let left = 0;

  switch (step.position) {
    case 'bottom':
      top = targetRect.bottom + 20;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'top':
      top = targetRect.top - tooltipRect.height - 20;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - tooltipRect.width - 20;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.right + 20;
      break;
    default:
      break;
  }

  tooltip.style.top = `${Math.max(20, top)}px`;
  tooltip.style.left = `${Math.max(20, Math.min(window.innerWidth - tooltipRect.width - 20, left))}px`;

  // Highlight target element
  targetElement.classList.add('tour-highlight');

  // Button handlers
  const nextBtn = tooltip.querySelector('.tour-btn-next');
  const prevBtn = tooltip.querySelector('.tour-btn-prev');
  const skipBtn = tooltip.querySelector('.tour-btn-skip');
  const finishBtn = tooltip.querySelector('.tour-btn-finish');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      targetElement.classList.remove('tour-highlight');
      showTourStep(stepIndex + 1, steps);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      targetElement.classList.remove('tour-highlight');
      showTourStep(stepIndex - 1, steps);
    });
  }

  if (skipBtn || finishBtn) {
    const endTour = () => {
      targetElement.classList.remove('tour-highlight');
      overlay.remove();
      localStorage.setItem('portfolio-tour-completed', 'true');
    };

    if (skipBtn) {
      skipBtn.addEventListener('click', endTour);
    }
    if (finishBtn) {
      finishBtn.addEventListener('click', endTour);
    }
  }
}

/**
 * Check if first visit and show welcome tour
 * @returns {void}
 */
function checkFirstVisit() {
  const hasSeenTour = localStorage.getItem('portfolio-tour-completed');
  const hasData = localStorage.getItem('portfolioData');

  if (!hasSeenTour && !hasData) {
    // Show welcome modal after 2 seconds
    setTimeout(() => {
      showHelpModal();
      switchHelpTab('quick-start');
    }, 2000);
  }
}

/**
 * Add tooltips to key features
 * @returns {void}
 */
function addFeatureTooltips() {
  const tooltips = [
    {
      selector: '#generateReport',
      text: 'Vytvořit profesionální PDF report s grafy',
    },
    {
      selector: '#exportCSV',
      text: 'Exportovat data do CSV souboru pro Excel',
    },
    {
      selector: '#currencySwitch',
      text: 'Přepnout zobrazení mezi Kč a €',
    },
    {
      selector: '#darkModeToggle',
      text: 'Přepnout mezi světlým a tmavým režimem',
    },
    {
      selector: '.scheme-button',
      text: 'Změnit barevné schéma grafů',
    },
  ];

  tooltips.forEach(({ selector, text }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element && !element.hasAttribute('title')) {
        element.setAttribute('title', text);
        element.setAttribute('data-tooltip', text);
      }
    });
  });
}
