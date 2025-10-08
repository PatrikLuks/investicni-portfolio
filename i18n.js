/**
 * Internationalization (i18n) Module
 * Multi-language support with dynamic switching
 */

class I18nManager {
  constructor() {
    this.currentLang = 'cs'; // Default language
    this.fallbackLang = 'en';
    this.supportedLanguages = ['cs', 'en', 'de', 'fr', 'es'];
    this.translations = {};
    this.rtlLanguages = ['ar', 'he', 'fa'];

    this.init();
  }

  /**
   * Initialize i18n system
   */
  async init() {
    try {
      // Load translations
      await this.loadTranslations();

      // Detect user language
      this.detectLanguage();

      // Create language switcher UI
      this.createLanguageSwitcher();

      // Apply translations
      this.applyTranslations();

      console.log('✅ I18n Manager initialized with language:', this.currentLang);
    } catch (error) {
      console.error('❌ I18n initialization failed:', error);
    }
  }

  /**
   * Load translations
   */
  async loadTranslations() {
    // Czech (default)
    this.translations.cs = {
      // Navigation
      'nav.home': 'Domů',
      'nav.portfolio': 'Portfolio',
      'nav.dashboard': 'Dashboard',
      'nav.settings': 'Nastavení',

      // Portfolio
      'portfolio.title': 'Investiční Portfolio',
      'portfolio.add': 'Přidat investici',
      'portfolio.search': 'Hledat',
      'portfolio.filter': 'Filtrovat',
      'portfolio.export': 'Exportovat',
      'portfolio.import': 'Importovat',

      // Columns
      'column.name': 'Název',
      'column.type': 'Typ',
      'column.shares': 'Počet',
      'column.buyPrice': 'Nákupní cena',
      'column.currentPrice': 'Aktuální cena',
      'column.value': 'Hodnota',
      'column.return': 'Výnos',

      // Actions
      'action.edit': 'Upravit',
      'action.delete': 'Smazat',
      'action.save': 'Uložit',
      'action.cancel': 'Zrušit',
      'action.confirm': 'Potvrdit',
      'action.close': 'Zavřít',

      // Metrics
      'metrics.total': 'Celkem',
      'metrics.invested': 'Investováno',
      'metrics.current': 'Aktuální hodnota',
      'metrics.gain': 'Zisk',
      'metrics.loss': 'Ztráta',
      'metrics.return': 'Výnos',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.summary': 'Přehled portfolia',
      'dashboard.performance': 'Výkon',
      'dashboard.allocation': 'Alokace',
      'dashboard.topHoldings': 'Top pozice',

      // Notifications
      'notif.welcome': 'Vítejte v Portfolio Manageru',
      'notif.saved': 'Změny uloženy',
      'notif.deleted': 'Smazáno',
      'notif.error': 'Nastala chyba',

      // Time
      'time.now': 'Nyní',
      'time.today': 'Dnes',
      'time.yesterday': 'Včera',
      'time.week': 'Tento týden',
      'time.month': 'Tento měsíc',

      // Messages
      'msg.confirmDelete': 'Opravdu chcete smazat tuto položku?',
      'msg.noData': 'Žádná data k zobrazení',
      'msg.loading': 'Načítání...',
      'msg.saveSuccess': 'Úspěšně uloženo',
      'msg.saveError': 'Chyba při ukládání',
    };

    // English
    this.translations.en = {
      'nav.home': 'Home',
      'nav.portfolio': 'Portfolio',
      'nav.dashboard': 'Dashboard',
      'nav.settings': 'Settings',

      'portfolio.title': 'Investment Portfolio',
      'portfolio.add': 'Add Investment',
      'portfolio.search': 'Search',
      'portfolio.filter': 'Filter',
      'portfolio.export': 'Export',
      'portfolio.import': 'Import',

      'column.name': 'Name',
      'column.type': 'Type',
      'column.shares': 'Shares',
      'column.buyPrice': 'Buy Price',
      'column.currentPrice': 'Current Price',
      'column.value': 'Value',
      'column.return': 'Return',

      'action.edit': 'Edit',
      'action.delete': 'Delete',
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.confirm': 'Confirm',
      'action.close': 'Close',

      'metrics.total': 'Total',
      'metrics.invested': 'Invested',
      'metrics.current': 'Current Value',
      'metrics.gain': 'Gain',
      'metrics.loss': 'Loss',
      'metrics.return': 'Return',

      'dashboard.title': 'Dashboard',
      'dashboard.summary': 'Portfolio Summary',
      'dashboard.performance': 'Performance',
      'dashboard.allocation': 'Allocation',
      'dashboard.topHoldings': 'Top Holdings',

      'notif.welcome': 'Welcome to Portfolio Manager',
      'notif.saved': 'Changes saved',
      'notif.deleted': 'Deleted',
      'notif.error': 'An error occurred',

      'time.now': 'Now',
      'time.today': 'Today',
      'time.yesterday': 'Yesterday',
      'time.week': 'This week',
      'time.month': 'This month',

      'msg.confirmDelete': 'Are you sure you want to delete this item?',
      'msg.noData': 'No data to display',
      'msg.loading': 'Loading...',
      'msg.saveSuccess': 'Successfully saved',
      'msg.saveError': 'Error saving',
    };

    // German
    this.translations.de = {
      'nav.home': 'Startseite',
      'nav.portfolio': 'Portfolio',
      'nav.dashboard': 'Dashboard',
      'nav.settings': 'Einstellungen',

      'portfolio.title': 'Anlageportfolio',
      'portfolio.add': 'Investition hinzufügen',
      'portfolio.search': 'Suchen',
      'portfolio.filter': 'Filtern',
      'portfolio.export': 'Exportieren',
      'portfolio.import': 'Importieren',

      'column.name': 'Name',
      'column.type': 'Typ',
      'column.shares': 'Anteile',
      'column.buyPrice': 'Kaufpreis',
      'column.currentPrice': 'Aktueller Preis',
      'column.value': 'Wert',
      'column.return': 'Rendite',

      'action.edit': 'Bearbeiten',
      'action.delete': 'Löschen',
      'action.save': 'Speichern',
      'action.cancel': 'Abbrechen',
      'action.confirm': 'Bestätigen',
      'action.close': 'Schließen',

      'metrics.total': 'Gesamt',
      'metrics.invested': 'Investiert',
      'metrics.current': 'Aktueller Wert',
      'metrics.gain': 'Gewinn',
      'metrics.loss': 'Verlust',
      'metrics.return': 'Rendite',

      'dashboard.title': 'Dashboard',
      'dashboard.summary': 'Portfolio-Übersicht',
      'dashboard.performance': 'Leistung',
      'dashboard.allocation': 'Allokation',
      'dashboard.topHoldings': 'Top-Positionen',

      'notif.welcome': 'Willkommen bei Portfolio Manager',
      'notif.saved': 'Änderungen gespeichert',
      'notif.deleted': 'Gelöscht',
      'notif.error': 'Ein Fehler ist aufgetreten',

      'time.now': 'Jetzt',
      'time.today': 'Heute',
      'time.yesterday': 'Gestern',
      'time.week': 'Diese Woche',
      'time.month': 'Dieser Monat',

      'msg.confirmDelete': 'Möchten Sie dieses Element wirklich löschen?',
      'msg.noData': 'Keine Daten anzuzeigen',
      'msg.loading': 'Laden...',
      'msg.saveSuccess': 'Erfolgreich gespeichert',
      'msg.saveError': 'Fehler beim Speichern',
    };

    // French
    this.translations.fr = {
      'nav.home': 'Accueil',
      'nav.portfolio': 'Portfolio',
      'nav.dashboard': 'Tableau de bord',
      'nav.settings': 'Paramètres',

      'portfolio.title': "Portfolio d'investissement",
      'portfolio.add': 'Ajouter un investissement',
      'portfolio.search': 'Rechercher',
      'portfolio.filter': 'Filtrer',
      'portfolio.export': 'Exporter',
      'portfolio.import': 'Importer',

      'column.name': 'Nom',
      'column.type': 'Type',
      'column.shares': 'Actions',
      'column.buyPrice': "Prix d'achat",
      'column.currentPrice': 'Prix actuel',
      'column.value': 'Valeur',
      'column.return': 'Rendement',

      'action.edit': 'Modifier',
      'action.delete': 'Supprimer',
      'action.save': 'Enregistrer',
      'action.cancel': 'Annuler',
      'action.confirm': 'Confirmer',
      'action.close': 'Fermer',

      'metrics.total': 'Total',
      'metrics.invested': 'Investi',
      'metrics.current': 'Valeur actuelle',
      'metrics.gain': 'Gain',
      'metrics.loss': 'Perte',
      'metrics.return': 'Rendement',

      'dashboard.title': 'Tableau de bord',
      'dashboard.summary': 'Résumé du portfolio',
      'dashboard.performance': 'Performance',
      'dashboard.allocation': 'Allocation',
      'dashboard.topHoldings': 'Principales positions',

      'notif.welcome': 'Bienvenue dans Portfolio Manager',
      'notif.saved': 'Changements enregistrés',
      'notif.deleted': 'Supprimé',
      'notif.error': "Une erreur s'est produite",

      'time.now': 'Maintenant',
      'time.today': "Aujourd'hui",
      'time.yesterday': 'Hier',
      'time.week': 'Cette semaine',
      'time.month': 'Ce mois',

      'msg.confirmDelete': 'Voulez-vous vraiment supprimer cet élément ?',
      'msg.noData': 'Aucune donnée à afficher',
      'msg.loading': 'Chargement...',
      'msg.saveSuccess': 'Enregistré avec succès',
      'msg.saveError': "Erreur d'enregistrement",
    };

    // Spanish
    this.translations.es = {
      'nav.home': 'Inicio',
      'nav.portfolio': 'Portafolio',
      'nav.dashboard': 'Panel',
      'nav.settings': 'Configuración',

      'portfolio.title': 'Portafolio de Inversión',
      'portfolio.add': 'Agregar inversión',
      'portfolio.search': 'Buscar',
      'portfolio.filter': 'Filtrar',
      'portfolio.export': 'Exportar',
      'portfolio.import': 'Importar',

      'column.name': 'Nombre',
      'column.type': 'Tipo',
      'column.shares': 'Acciones',
      'column.buyPrice': 'Precio de compra',
      'column.currentPrice': 'Precio actual',
      'column.value': 'Valor',
      'column.return': 'Rendimiento',

      'action.edit': 'Editar',
      'action.delete': 'Eliminar',
      'action.save': 'Guardar',
      'action.cancel': 'Cancelar',
      'action.confirm': 'Confirmar',
      'action.close': 'Cerrar',

      'metrics.total': 'Total',
      'metrics.invested': 'Invertido',
      'metrics.current': 'Valor actual',
      'metrics.gain': 'Ganancia',
      'metrics.loss': 'Pérdida',
      'metrics.return': 'Rendimiento',

      'dashboard.title': 'Panel',
      'dashboard.summary': 'Resumen del portafolio',
      'dashboard.performance': 'Rendimiento',
      'dashboard.allocation': 'Asignación',
      'dashboard.topHoldings': 'Principales posiciones',

      'notif.welcome': 'Bienvenido a Portfolio Manager',
      'notif.saved': 'Cambios guardados',
      'notif.deleted': 'Eliminado',
      'notif.error': 'Ocurrió un error',

      'time.now': 'Ahora',
      'time.today': 'Hoy',
      'time.yesterday': 'Ayer',
      'time.week': 'Esta semana',
      'time.month': 'Este mes',

      'msg.confirmDelete': '¿Está seguro de que desea eliminar este elemento?',
      'msg.noData': 'No hay datos para mostrar',
      'msg.loading': 'Cargando...',
      'msg.saveSuccess': 'Guardado exitosamente',
      'msg.saveError': 'Error al guardar',
    };
  }

  /**
   * Detect user language
   */
  detectLanguage() {
    // Check saved preference
    const saved = localStorage.getItem('app-language');
    if (saved && this.supportedLanguages.includes(saved)) {
      this.currentLang = saved;
      return;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.supportedLanguages.includes(browserLang)) {
      this.currentLang = browserLang;
    }
  }

  /**
   * Get translation
   * @param {string} key - Translation key
   * @param {Object} params - Parameters for interpolation
   */
  t(key, params = {}) {
    let translation =
      this.translations[this.currentLang]?.[key] ||
      this.translations[this.fallbackLang]?.[key] ||
      key;

    // Interpolate parameters
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{{${param}}}`, value);
    });

    return translation;
  }

  /**
   * Change language
   * @param {string} lang - Language code
   */
  async changeLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.error('Unsupported language:', lang);
      return;
    }

    this.currentLang = lang;
    localStorage.setItem('app-language', lang);

    // Apply translations
    this.applyTranslations();

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Set text direction for RTL languages
    document.documentElement.dir = this.rtlLanguages.includes(lang) ? 'rtl' : 'ltr';

    // Dispatch event
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));

    console.log('✅ Language changed to:', lang);
  }

  /**
   * Apply translations to DOM
   */
  applyTranslations() {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Translate titles
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
  }

  /**
   * Create language switcher UI
   */
  createLanguageSwitcher() {
    const portfolioCard = document.getElementById('portfolioCard');
    if (!portfolioCard) {return;}

    const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
    if (!headerDiv) {return;}

    const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
    if (!buttonContainer) {return;}

    const langBtn = document.createElement('button');
    langBtn.id = 'languageBtn';
    langBtn.className = 'btn-icon';
    langBtn.title = 'Language';
    langBtn.style.cssText =
      'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
    langBtn.textContent = this.getLanguageFlag(this.currentLang);

    langBtn.addEventListener('click', () => this.toggleLanguageMenu());

    buttonContainer.appendChild(langBtn);

    // Create language menu
    this.createLanguageMenu();
  }

  /**
   * Create language menu
   */
  createLanguageMenu() {
    const menu = document.createElement('div');
    menu.id = 'languageMenu';
    menu.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 8px;
      z-index: 10000;
      display: none;
    `;

    const languages = [
      { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];

    menu.innerHTML = languages
      .map(
        (lang) => `
      <button 
        onclick="window.i18nManager.selectLanguage('${lang.code}')"
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: ${lang.code === this.currentLang ? '#e8f5e9' : 'transparent'};
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          font-weight: ${lang.code === this.currentLang ? '600' : 'normal'};
        "
        onmouseover="if ('${lang.code}' !== '${this.currentLang}') this.style.background='#f5f5f5'"
        onmouseout="if ('${lang.code}' !== '${this.currentLang}') this.style.background='transparent'"
      >
        <span style="font-size: 1.5rem;">${lang.flag}</span>
        <span>${lang.name}</span>
        ${lang.code === this.currentLang ? '<span style="margin-left: auto; color: #4caf50;">✓</span>' : ''}
      </button>
    `
      )
      .join('');

    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target.id !== 'languageBtn') {
        menu.style.display = 'none';
      }
    });
  }

  /**
   * Toggle language menu
   */
  toggleLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }

  /**
   * Select language from menu
   */
  selectLanguage(lang) {
    this.changeLanguage(lang);
    document.getElementById('languageBtn').textContent = this.getLanguageFlag(lang);
    document.getElementById('languageMenu').style.display = 'none';

    // Recreate menu to update checkmarks
    document.getElementById('languageMenu').remove();
    this.createLanguageMenu();
  }

  /**
   * Get language flag emoji
   */
  getLanguageFlag(lang) {
    const flags = {
      cs: '🇨🇿',
      en: '🇬🇧',
      de: '🇩🇪',
      fr: '🇫🇷',
      es: '🇪🇸',
    };
    return flags[lang] || '🌐';
  }

  /**
   * Format number according to locale
   * @param {number} number - Number to format
   * @param {Object} options - Formatting options
   */
  formatNumber(number, options = {}) {
    const locales = {
      cs: 'cs-CZ',
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      es: 'es-ES',
    };

    return new Intl.NumberFormat(locales[this.currentLang] || 'en-US', options).format(number);
  }

  /**
   * Format currency according to locale
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   */
  formatCurrency(amount, currency = 'CZK') {
    const currencies = {
      cs: 'CZK',
      en: 'USD',
      de: 'EUR',
      fr: 'EUR',
      es: 'EUR',
    };

    const locales = {
      cs: 'cs-CZ',
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      es: 'es-ES',
    };

    return new Intl.NumberFormat(locales[this.currentLang] || 'en-US', {
      style: 'currency',
      currency: currencies[this.currentLang] || currency,
    }).format(amount);
  }

  /**
   * Format date according to locale
   * @param {Date} date - Date to format
   * @param {Object} options - Formatting options
   */
  formatDate(date, options = {}) {
    const locales = {
      cs: 'cs-CZ',
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      es: 'es-ES',
    };

    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(locales[this.currentLang] || 'en-US', defaultOptions).format(
      date
    );
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {Date} date - Date to format
   */
  formatRelativeTime(date) {
    const rtf = new Intl.RelativeTimeFormat(this.currentLang, { numeric: 'auto' });
    const diff = date - new Date();
    const diffInSeconds = Math.floor(diff / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (Math.abs(diffInDays) >= 1) {
      return rtf.format(diffInDays, 'day');
    } else if (Math.abs(diffInHours) >= 1) {
      return rtf.format(diffInHours, 'hour');
    } else if (Math.abs(diffInMinutes) >= 1) {
      return rtf.format(diffInMinutes, 'minute');
    } else {
      return this.t('time.now');
    }
  }
}

// Global instance
window.i18nManager = new I18nManager();

// Helper function for global access
window.t = (key, params) => window.i18nManager.t(key, params);

console.log('✅ I18n Manager loaded');
