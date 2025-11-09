/**
 * Theme Manager - Dark/Light Mode System
 * Version: 3.1.0
 * Professional theme switching with persistence and system detection
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'portfolio-theme';
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto',
    };

    this.currentTheme = this.loadTheme();
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.init();
  }

  init() {
    // Apply saved theme
    this.applyTheme(this.currentTheme);

    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === this.THEMES.AUTO) {
        this.applyTheme(this.THEMES.AUTO);
      }
    });

    // Add theme toggle to UI
    this.createThemeToggle();
  }

  loadTheme() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    // Default to LIGHT if no saved theme
    return saved || this.THEMES.LIGHT;
  }

  saveTheme(theme) {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.currentTheme = theme;
  }

  getEffectiveTheme() {
    if (this.currentTheme === this.THEMES.AUTO) {
      return this.mediaQuery.matches ? this.THEMES.DARK : this.THEMES.LIGHT;
    }
    return this.currentTheme;
  }

  applyTheme(theme) {
    const effectiveTheme =
      theme === this.THEMES.AUTO
        ? this.mediaQuery.matches
          ? this.THEMES.DARK
          : this.THEMES.LIGHT
        : theme;

    document.documentElement.setAttribute('data-theme', effectiveTheme);
    document.body.classList.remove('theme-light', 'theme-dark', 'dark-mode', 'light-mode');
    document.body.classList.add(`theme-${effectiveTheme}`);
    
    // Add dark-mode class for CSS compatibility
    if (effectiveTheme === this.THEMES.DARK) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-mode');
    }

    // Update meta theme-color for mobile browsers
    const themeColor = effectiveTheme === this.THEMES.DARK ? '#1a1a1a' : '#ffffff';
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = themeColor;

    // Trigger custom event for other components
    window.dispatchEvent(
      new CustomEvent('themechange', {
        detail: { theme: effectiveTheme },
      }),
    );
  }

  toggleTheme() {
    // Toggle between LIGHT and DARK only (no AUTO mode)
    const nextTheme = this.currentTheme === this.THEMES.LIGHT ? this.THEMES.DARK : this.THEMES.LIGHT;

    this.saveTheme(nextTheme);
    this.applyTheme(nextTheme);

    return nextTheme;
  }

  createThemeToggle() {
    // Use existing toggle button from HTML
    const toggle = document.getElementById('darkModeToggle');
    
    if (!toggle) {
      console.warn('Theme toggle button #darkModeToggle not found in HTML');
      return;
    }

    let isToggling = false;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Prevent double-click toggling
      if (isToggling) return;
      isToggling = true;

      const newTheme = this.toggleTheme();
      
      // Update icon immediately
      this.updateToggleIcon(toggle, newTheme);

      // Show toast notification
      this.showThemeNotification(newTheme);

      // Re-enable after transition
      setTimeout(() => {
        isToggling = false;
      }, 300);
    });

    // Initial icon
    this.updateToggleIcon(toggle, this.currentTheme);
  }

  updateToggleIcon(button, theme) {
    // Show sun for light mode, moon for dark mode only
    const icons = {
      light: '☀️',
      dark: '🌙',
    };
    const icon = icons[theme] || (theme === this.THEMES.LIGHT ? '☀️' : '�');
    button.textContent = icon;
    button.title = `Current theme: ${theme} - Click to toggle`;
  }

  showThemeNotification(theme) {
    const messages = {
      light: '☀️ Light mode activated',
      dark: '🌙 Dark mode activated',
    };

    if (typeof showToast === 'function') {
      showToast('success', 'Theme', messages[theme] || `Theme: ${theme}`);
    }
  }

  // Public API
  setTheme(theme) {
    if (Object.values(this.THEMES).includes(theme)) {
      this.saveTheme(theme);
      this.applyTheme(theme);
    }
  }

  getTheme() {
    return this.currentTheme;
  }

  getEffectiveThemeValue() {
    return this.getEffectiveTheme();
  }
}

// CSS Variables for theming
const themeStyles = document.createElement('style');
themeStyles.textContent = `
  /* Theme Variables */
  :root {
    /* Light theme (default) */
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-secondary: #64748b;
    --color-success: #10b981;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    --color-info: #3b82f6;

    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --bg-elevated: #ffffff;

    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --text-inverse: #ffffff;

    --border-color: #e2e8f0;
    --border-color-strong: #cbd5e1;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    /* Additional color variants */
    --bg-danger: #fee2e2;
    --bg-warning: #fef3c7;
    --bg-success: #dcfce7;
    --text-danger: #991b1b;
    --text-warning: #92400e;
    --text-success: #166534;
    --card-background: #f0f4f8;

    --transition-fast: 150ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
  }

  /* Dark theme */
  [data-theme="dark"] {
    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
    --color-secondary: #94a3b8;
    --color-success: #22c55e;
    --color-danger: #f87171;
    --color-warning: #fbbf24;
    --color-info: #60a5fa;

    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --bg-elevated: #1e293b;

    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-tertiary: #64748b;
    --text-inverse: #0f172a;

    --border-color: #334155;
    --border-color-strong: #475569;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);

    /* Additional color variants */
    --bg-danger: #7f1d1d;
    --bg-warning: #78350f;
    --bg-success: #14532d;
    --text-danger: #fca5a5;
    --text-warning: #fde047;
    --text-success: #4ade80;
    --card-background: #1e293b;
  }

  /* Smooth theme transition */
  * {
    transition: background-color var(--transition-base),
                color var(--transition-base),
                border-color var(--transition-base),
                box-shadow var(--transition-base);
  }

  /* Theme Toggle Button */
  .theme-toggle {
    position: relative;
    width: 48px;
    height: 48px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    background: var(--bg-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: all var(--transition-base);
  }

  .theme-toggle:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-color-strong);
    transform: scale(1.05);
  }

  .theme-toggle:active {
    transform: scale(0.95);
  }

  .theme-icon {
    display: block;
    user-select: none;
  }

  /* Prevent flash of unstyled content */
  html:not([data-theme]) {
    visibility: hidden;
  }

  html[data-theme] {
    visibility: visible;
  }

  /* Apply theme colors to existing elements */
  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .card,
  .panel,
  .modal {
    background-color: var(--bg-elevated);
    border-color: var(--border-color);
    box-shadow: var(--shadow-md);
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: var(--text-inverse);
  }

  .btn-primary:hover {
    background-color: var(--color-primary-hover);
  }

  input,
  select,
  textarea {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--border-color);
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  table {
    background-color: var(--bg-elevated);
  }

  th {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  tr:hover {
    background-color: var(--bg-tertiary);
  }

  /* Glassmorphism effect for dark mode */
  [data-theme="dark"] .card,
  [data-theme="dark"] .modal {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  /* Chart colors for dark mode */
  [data-theme="dark"] canvas {
    filter: brightness(0.9);
  }

  /* Loading spinner color */
  .spinner {
    border-color: var(--color-primary);
    border-top-color: transparent;
  }

  /* Toast notifications */
  .toast {
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    border-color: var(--border-color);
    box-shadow: var(--shadow-lg);
  }

  .toast.success {
    border-left: 4px solid var(--color-success);
  }

  .toast.error {
    border-left: 4px solid var(--color-danger);
  }

  .toast.warning {
    border-left: 4px solid var(--color-warning);
  }

  .toast.info {
    border-left: 4px solid var(--color-info);
  }
`;

document.head.appendChild(themeStyles);

// Initialize theme manager on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
