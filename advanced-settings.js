/**
 * Advanced Settings Panel
 * Comprehensive customization for WORLD-CLASS UX
 */

class AdvancedSettings {
  constructor() {
    this.settings = {
      theme: 'light', // light, dark, auto
      language: 'cs',
      autoSave: true,
      autoSaveInterval: 30000, // 30s
      notifications: true,
      notificationSound: false,
      performanceMode: false,
      animations: true,
      compactMode: false,
      fontSize: 'medium', // small, medium, large
      currency: 'CZK',
      dateFormat: 'DD.MM.YYYY',
      numberFormat: 'cs-CZ',
      chartAnimations: true,
      showTooltips: true,
      keyboardShortcuts: true,
      confirmDelete: true,
      confirmBeforeExit: false,
      devMode: false,
      telemetry: false,
    };

    this.init();
  }

  /**
   * Initialize settings system
   */
  init() {
    try {
      this.loadSettings();
      this.applySettings();
      this.setupKeyboardShortcut();

      console.log('✅ Advanced Settings initialized');
    } catch (error) {
      console.error('❌ Settings initialization failed:', error);
    }
  }

  /**
   * Setup keyboard shortcut (Ctrl+,)
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        this.show();
      }
    });
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('advancedSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('advancedSettings', JSON.stringify(this.settings));

      if (window.notificationSystem) {
        window.notificationSystem.showInAppNotification('✅ Nastavení uloženo', 'success');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Apply all settings
   */
  applySettings() {
    // Apply theme
    this.applyTheme();

    // Apply font size
    this.applyFontSize();

    // Apply compact mode
    if (this.settings.compactMode) {
      document.body.classList.add('compact-mode');
    }

    // Apply performance mode
    if (this.settings.performanceMode) {
      this.enablePerformanceMode();
    }

    // Apply animations
    if (!this.settings.animations) {
      this.disableAnimations();
    }
  }

  /**
   * Show settings panel
   */
  show() {
    // Remove existing panel
    document.getElementById('settingsPanel')?.remove();

    const panel = document.createElement('div');
    panel.id = 'settingsPanel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      max-width: 95%;
      max-height: 90vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10010;
      overflow: hidden;
      animation: scaleIn 0.3s ease;
    `;

    panel.innerHTML = `
      <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; display: flex; align-items: center; gap: 12px;">
            <span>⚙️</span>
            <span>Pokročilá Nastavení</span>
          </h2>
          <button id="closeSettings" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: white;">✕</button>
        </div>
        <div style="margin-top: 8px; opacity: 0.9; font-size: 0.9rem;">
          Přizpůsobte si aplikaci podle svých potřeb
        </div>
      </div>
      
      <div style="padding: 24px; max-height: calc(90vh - 150px); overflow-y: auto;">
        ${this.renderSettingSections()}
      </div>
      
      <div style="padding: 16px 24px; background: #f8f9fa; border-top: 1px solid #dee2e6; display: flex; gap: 12px; justify-content: flex-end;">
        <button id="resetSettings" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          🔄 Reset na Výchozí
        </button>
        <button id="exportSettings" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          💾 Export Nastavení
        </button>
        <button id="saveSettings" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          ✅ Uložit Změny
        </button>
      </div>
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'settingsBackdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 10009;
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    this.setupListeners();
  }

  /**
   * Render setting sections
   */
  renderSettingSections() {
    return `
      <!-- Appearance -->
      <div class="setting-section">
        <h3 style="margin: 0 0 16px 0; color: #333; display: flex; align-items: center; gap: 8px;">
          <span>🎨</span>
          <span>Vzhled</span>
        </h3>
        
        ${this.renderSelect('theme', 'Téma', [
    { value: 'light', label: '☀️ Světlé' },
    { value: 'dark', label: '🌙 Tmavé' },
    { value: 'auto', label: '🔄 Automatické' },
  ])}
        
        ${this.renderSelect('fontSize', 'Velikost písma', [
    { value: 'small', label: 'Malé' },
    { value: 'medium', label: 'Střední' },
    { value: 'large', label: 'Velké' },
  ])}
        
        ${this.renderToggle('compactMode', 'Kompaktní režim', 'Menší mezery, více obsahu')}
        ${this.renderToggle('animations', 'Animace', 'Animované přechody a efekty')}
      </div>
      
      <!-- Localization -->
      <div class="setting-section" style="margin-top: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333; display: flex; align-items: center; gap: 8px;">
          <span>🌍</span>
          <span>Lokalizace</span>
        </h3>
        
        ${this.renderSelect('language', 'Jazyk', [
    { value: 'cs', label: '🇨🇿 Čeština' },
    { value: 'en', label: '🇬🇧 English' },
    { value: 'de', label: '🇩🇪 Deutsch' },
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'es', label: '🇪🇸 Español' },
  ])}
        
        ${this.renderSelect('currency', 'Měna', [
    { value: 'CZK', label: 'CZK (Kč)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'GBP', label: 'GBP (£)' },
  ])}
        
        ${this.renderSelect('dateFormat', 'Formát data', [
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ])}
      </div>
      
      <!-- Behavior -->
      <div class="setting-section" style="margin-top: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333; display: flex; align-items: center; gap: 8px;">
          <span>⚡</span>
          <span>Chování</span>
        </h3>
        
        ${this.renderToggle('autoSave', 'Automatické ukládání', 'Ukládat změny každých 30 sekund')}
        ${this.renderToggle('keyboardShortcuts', 'Klávesové zkratky', 'Povolit Ctrl+Z, Ctrl+Y, atd.')}
        ${this.renderToggle('confirmDelete', 'Potvrzení smazání', 'Ptát se před smazáním položek')}
        ${this.renderToggle('confirmBeforeExit', 'Potvrzení odchodu', 'Varovat před zavřením s neuloženými změnami')}
      </div>
      
      <!-- Notifications -->
      <div class="setting-section" style="margin-top: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333; display: flex; align-items: center; gap: 8px;">
          <span>🔔</span>
          <span>Notifikace</span>
        </h3>
        
        ${this.renderToggle('notifications', 'Zobrazovat notifikace', 'Toast zprávy pro akce')}
        ${this.renderToggle('notificationSound', 'Zvuky notifikací', 'Zvukové efekty (připraveno)')}
        ${this.renderToggle('showTooltips', 'Tooltips', 'Nápovědy při najetí myší')}
      </div>
      
      <!-- Performance -->
      <div class="setting-section" style="margin-top: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333; display: flex; align-items: center; gap: 8px;">
          <span>🚀</span>
          <span>Výkon</span>
        </h3>
        
        ${this.renderToggle('performanceMode', 'Performance režim', 'Optimalizovat pro výkon (méně animací)')}
        ${this.renderToggle('chartAnimations', 'Animace grafů', 'Animované vykreslování grafů')}
      </div>
      
      <!-- Advanced -->
      <div class="setting-section" style="margin-top: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333; display: flex; align-items: center; gap: 8px;">
          <span>🔬</span>
          <span>Pokročilé</span>
        </h3>
        
        ${this.renderToggle('devMode', 'Developer režim', 'Zobrazit debug informace')}
        ${this.renderToggle('telemetry', 'Anonymní telemetrie', 'Pomoci zlepšit aplikaci (není implementováno)')}
      </div>
    `;
  }

  /**
   * Render select input
   */
  renderSelect(key, label, options) {
    return `
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #495057;">
          ${label}
        </label>
        <select 
          id="setting-${key}" 
          style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 6px; font-size: 0.95rem;"
        >
          ${options
    .map(
      (opt) => `
            <option value="${opt.value}" ${this.settings[key] === opt.value ? 'selected' : ''}>
              ${opt.label}
            </option>
          `
    )
    .join('')}
        </select>
      </div>
    `;
  }

  /**
   * Render toggle switch
   */
  renderToggle(key, label, description) {
    const checked = this.settings[key];

    return `
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 600; color: #495057; margin-bottom: 2px;">${label}</div>
          <div style="font-size: 0.85rem; color: #6c757d;">${description}</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="setting-${key}" ${checked ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Close button
    document.getElementById('closeSettings')?.addEventListener('click', () => {
      this.hide();
    });

    // Backdrop click
    document.getElementById('settingsBackdrop')?.addEventListener('click', () => {
      this.hide();
    });

    // Save button
    document.getElementById('saveSettings')?.addEventListener('click', () => {
      this.collectSettings();
      this.saveSettings();
      this.applySettings();
      this.hide();
    });

    // Reset button
    document.getElementById('resetSettings')?.addEventListener('click', () => {
      if (confirm('Opravdu chcete resetovat všechna nastavení na výchozí hodnoty?')) {
        this.resetToDefaults();
      }
    });

    // Export button
    document.getElementById('exportSettings')?.addEventListener('click', () => {
      this.exportSettings();
    });

    // Add toggle switch styles
    if (!document.getElementById('toggleStyles')) {
      const style = document.createElement('style');
      style.id = 'toggleStyles';
      style.textContent = `
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .3s;
          border-radius: 26px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #667eea;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
        
        .setting-section {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Collect settings from form
   */
  collectSettings() {
    Object.keys(this.settings).forEach((key) => {
      const el = document.getElementById(`setting-${key}`);
      if (el) {
        if (el.type === 'checkbox') {
          this.settings[key] = el.checked;
        } else {
          this.settings[key] = el.value;
        }
      }
    });
  }

  /**
   * Hide settings panel
   */
  hide() {
    document.getElementById('settingsPanel')?.remove();
    document.getElementById('settingsBackdrop')?.remove();
  }

  /**
   * Reset to default settings
   */
  resetToDefaults() {
    this.settings = {
      theme: 'light',
      language: 'cs',
      autoSave: true,
      autoSaveInterval: 30000,
      notifications: true,
      notificationSound: false,
      performanceMode: false,
      animations: true,
      compactMode: false,
      fontSize: 'medium',
      currency: 'CZK',
      dateFormat: 'DD.MM.YYYY',
      numberFormat: 'cs-CZ',
      chartAnimations: true,
      showTooltips: true,
      keyboardShortcuts: true,
      confirmDelete: true,
      confirmBeforeExit: false,
      devMode: false,
      telemetry: false,
    };

    this.saveSettings();
    this.applySettings();
    this.hide();

    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification('🔄 Nastavení resetováno na výchozí', 'info');
    }
  }

  /**
   * Export settings
   */
  exportSettings() {
    const data = {
      version: '3.0',
      exported: new Date().toISOString(),
      settings: this.settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-settings-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    if (window.notificationSystem) {
      window.notificationSystem.showInAppNotification('💾 Nastavení exportováno', 'success');
    }
  }

  /**
   * Import settings
   */
  importSettings(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
          this.saveSettings();
          this.applySettings();

          if (window.notificationSystem) {
            window.notificationSystem.showInAppNotification('✅ Nastavení importováno', 'success');
          }
        }
      } catch (error) {
        console.error('Import failed:', error);

        if (window.notificationSystem) {
          window.notificationSystem.showInAppNotification('❌ Import selhal', 'error');
        }
      }
    };

    reader.readAsText(file);
  }

  /**
   * Apply theme
   */
  applyTheme() {
    if (this.settings.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (this.settings.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add('dark-theme');
      }
    }
  }

  /**
   * Apply font size
   */
  applyFontSize() {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };

    document.documentElement.style.fontSize = sizes[this.settings.fontSize] || '16px';
  }

  /**
   * Enable performance mode
   */
  enablePerformanceMode() {
    document.body.classList.add('performance-mode');

    // Disable heavy animations
    const style = document.createElement('style');
    style.id = 'performanceModeStyles';
    style.textContent = `
      .performance-mode * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Disable animations
   */
  disableAnimations() {
    const style = document.createElement('style');
    style.id = 'noAnimationsStyles';
    style.textContent = `
      * {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get setting value
   */
  get(key) {
    return this.settings[key];
  }

  /**
   * Set setting value
   */
  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }
}

// Global instance
window.advancedSettings = new AdvancedSettings();

console.log('✅ Advanced Settings loaded (Ctrl+, to open)');
