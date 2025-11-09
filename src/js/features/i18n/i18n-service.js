/**
 * PHASE 7: Internationalization (i18n) Service
 * Multi-language support for 10+ languages
 *
 * Supported languages:
 * - English (en)
 * - Czech (cs)
 * - German (de)
 * - French (fr)
 * - Spanish (es)
 * - Italian (it)
 * - Polish (pl)
 * - Japanese (ja)
 * - Portuguese Brazil (pt-BR)
 * - Russian (ru)
 */

class I18nService {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.languages = {
      en: 'English',
      cs: 'Čeština',
      de: 'Deutsch',
      fr: 'Français',
      es: 'Español',
      it: 'Italiano',
      pl: 'Polski',
      ja: '日本語',
      'pt-BR': 'Português (Brasil)',
      ru: 'Русский',
    };
    this.translations = {};
    this.listeners = [];
  }

  /**
   * Initialize i18n
   */
  async initialize() {
    try {
      await this.loadLanguage(this.currentLanguage);
      console.log('[i18n] Initialized with language:', this.currentLanguage);
    } catch (error) {
      console.error('[i18n] Initialization failed:', error);
      // Fallback to English
      this.translations = this.getDefaultTranslations();
    }
  }

  /**
   * Load language translation file
   */
  async loadLanguage(lang) {
    try {
      const response = await fetch(`/src/i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Language file not found: ${lang}`);
      }

      this.translations = await response.json();
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);

      // Update HTML lang attribute
      document.documentElement.lang = lang;

      // Notify listeners
      this.notifyListeners();

      console.log('[i18n] Language loaded:', lang);
    } catch (error) {
      console.warn('[i18n] Failed to load language:', error);
      this.translations = this.getDefaultTranslations();
    }
  }

  /**
   * Translate key
   */
  t(key, params = {}) {
    let value = this.translations[key] || key;

    // Replace parameters
    Object.keys(params).forEach((param) => {
      value = value.replace(`{${param}}`, params[param]);
    });

    return value;
  }

  /**
   * Translate all elements with data-i18n attribute
   */
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const text = this.t(key);

      // Check for attributes (e.g., placeholder, title)
      const attr = element.getAttribute('data-i18n-attr');
      if (attr) {
        element.setAttribute(attr, text);
      } else {
        element.textContent = text;
      }
    });

    console.log('[i18n] Translations applied to DOM');
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get all available languages
   */
  getLanguages() {
    return this.languages;
  }

  /**
   * Set language
   */
  async setLanguage(lang) {
    if (!this.languages[lang]) {
      console.warn('[i18n] Unknown language:', lang);
      return;
    }

    await this.loadLanguage(lang);
    this.applyTranslations();
  }

  /**
   * Listen for language changes
   */
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentLanguage));
  }

  /**
   * Export translations for frontend
   */
  getTranslations() {
    return this.translations;
  }

  /**
   * DEFAULT TRANSLATIONS (English fallback)
   */
  getDefaultTranslations() {
    return {
      // App
      'app.title': 'Portfolio Manager Pro',
      'app.subtitle': 'Professional Investment Portfolio Management',
      'app.version': 'v3.3.0',

      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.portfolio': 'Portfolio',
      'nav.analytics': 'Analytics',
      'nav.settings': 'Settings',
      'nav.help': 'Help',

      // Buttons
      'button.add': 'Add',
      'button.edit': 'Edit',
      'button.delete': 'Delete',
      'button.save': 'Save',
      'button.cancel': 'Cancel',
      'button.export': 'Export',
      'button.import': 'Import',
      'button.submit': 'Submit',
      'button.close': 'Close',

      // Forms
      'form.fundName': 'Fund Name',
      'form.ticker': 'Ticker Symbol',
      'form.quantity': 'Quantity',
      'form.purchasePrice': 'Purchase Price',
      'form.currentPrice': 'Current Price',
      'form.currency': 'Currency',
      'form.category': 'Category',
      'form.notes': 'Notes',

      // Messages
      'message.success': 'Operation successful!',
      'message.error': 'An error occurred',
      'message.confirm': 'Are you sure?',
      'message.noData': 'No data available',
      'message.loading': 'Loading...',

      // Analytics
      'analytics.totalValue': 'Total Value',
      'analytics.totalGain': 'Total Gain',
      'analytics.gainPercent': 'Gain %',
      'analytics.distribution': 'Distribution',
      'analytics.performance': 'Performance',

      // Auth
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot password?',
      'auth.createAccount': 'Create account',
      'auth.alreadyAccount': 'Already have an account?',

      // Errors
      'error.invalidEmail': 'Invalid email address',
      'error.weakPassword': 'Password is too weak',
      'error.userNotFound': 'User not found',
      'error.wrongPassword': 'Wrong password',
      'error.emailInUse': 'Email already in use',
    };
  }
}

// Export singleton instance
window.i18nService = new I18nService();

export default I18nService;
