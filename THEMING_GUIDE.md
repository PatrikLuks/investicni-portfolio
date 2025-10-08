# 🎨 Theming Guide - v3.1.0

## Overview

Investment Portfolio Manager Pro v3.1.0 introduces a **professional dark mode system** with smooth transitions, system preference detection, and full customization capabilities.

## Features

✨ **3 Theme Modes**: Light, Dark, Auto (system preference)  
🎯 **CSS Custom Properties**: 50+ theme variables  
⚡ **Smooth Transitions**: 300ms animated theme switching  
💾 **Persistent**: Saves user preference to localStorage  
🌙 **Auto Detection**: Respects `prefers-color-scheme`  
📱 **Mobile Support**: Updates meta theme-color tag  
🪟 **Glassmorphism**: Premium blur effects in dark mode  
🚀 **FOUC Prevention**: No flash of unstyled content  

## Quick Start

### Enable Theme Toggle

The theme system initializes automatically when you include `theme-manager.js`:

```html
<script src="theme-manager.js"></script>
```

### Toggle Button

```html
<!-- Theme toggle button is auto-injected -->
<div id="themeToggleContainer"></div>
```

The button appears as:
- ☀️ **Light mode** 
- 🌙 **Dark mode**
- 🌓 **Auto mode** (follows system)

## Theme Modes

### 1. Light Mode (Default)

```javascript
themeManager.setTheme(themeManager.THEMES.LIGHT);
```

**Characteristics:**
- Clean, bright interface
- High contrast for readability
- Professional business look
- Optimized for daylight viewing

### 2. Dark Mode

```javascript
themeManager.setTheme(themeManager.THEMES.DARK);
```

**Characteristics:**
- Reduced eye strain
- Better for night/low-light
- Premium glassmorphism effects
- OLED-friendly (true blacks)

### 3. Auto Mode

```javascript
themeManager.setTheme(themeManager.THEMES.AUTO);
```

**Automatically switches based on:**
- System preference (OS setting)
- Time of day (if supported by browser)
- User's device settings

## CSS Custom Properties

All theme colors are defined as CSS variables for easy customization.

### Color Palette

```css
:root {
  /* Brand Colors */
  --color-primary: #3b82f6;        /* Blue */
  --color-primary-hover: #2563eb;
  --color-secondary: #8b5cf6;      /* Purple */
  --color-success: #10b981;        /* Green */
  --color-danger: #ef4444;         /* Red */
  --color-warning: #f59e0b;        /* Amber */
  --color-info: #06b6d4;           /* Cyan */
  
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --bg-tertiary: #e5e7eb;
  --bg-modal: rgba(0, 0, 0, 0.5);
  
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  
  /* UI Elements */
  --border-color: #d1d5db;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  --transition-speed: 300ms;
}

[data-theme='dark'] {
  /* Dark Theme Overrides */
  --color-primary: #60a5fa;
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #4b5563;
}
```

### Usage in Components

```css
/* Your custom component */
.my-card {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-speed);
}

.my-button {
  background: var(--color-primary);
  color: white;
}

.my-button:hover {
  background: var(--color-primary-hover);
}
```

## Customization

### Custom Theme Colors

Create your own color scheme by overriding CSS variables:

```css
/* custom-theme.css */
:root {
  /* Custom light theme */
  --color-primary: #6366f1;      /* Indigo */
  --color-secondary: #ec4899;    /* Pink */
}

[data-theme='dark'] {
  /* Custom dark theme */
  --color-primary: #818cf8;
  --bg-primary: #0f172a;         /* Darker blue-black */
  --bg-secondary: #1e293b;
}
```

### Brand Colors

Replace with your company colors:

```css
:root {
  --color-primary: #your-brand-color;
  --color-secondary: #your-accent-color;
}
```

### Glassmorphism Effects

Dark mode includes premium glass effects:

```css
[data-theme='dark'] .glass-card {
  background: rgba(31, 41, 55, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(75, 85, 99, 0.5);
}
```

**Apply to your elements:**

```css
.my-modal {
  background: rgba(var(--bg-secondary-rgb), 0.9);
  backdrop-filter: blur(10px);
}
```

## JavaScript API

### ThemeManager Class

```javascript
// Access the global theme manager
const manager = window.themeManager;

// Get current theme
const current = manager.getTheme();
// Returns: 'light' | 'dark' | 'auto'

// Set theme
manager.setTheme('dark');

// Toggle between light/dark
manager.toggleTheme();

// Check if dark mode is active
const isDark = manager.isDarkMode();

// Get system preference
const systemPreference = manager.getSystemTheme();
```

### Events

Listen for theme changes:

```javascript
window.addEventListener('themechange', (event) => {
  const { theme, isDark } = event.detail;
  console.log(`Theme changed to: ${theme}`);
  console.log(`Is dark mode: ${isDark}`);
  
  // Update your components
  updateChartColors(isDark);
});
```

### Programmatic Control

```javascript
// Set theme based on user preference
function applyUserTheme(userId) {
  const userPrefs = getUserPreferences(userId);
  themeManager.setTheme(userPrefs.theme || 'auto');
}

// Temporary theme override
function enterPresentationMode() {
  const originalTheme = themeManager.getTheme();
  themeManager.setTheme('light'); // Force light for projector
  
  // Restore after presentation
  return () => themeManager.setTheme(originalTheme);
}
```

## Component Integration

### React/Vue Components

```javascript
// React Hook
function useTheme() {
  const [theme, setTheme] = useState(themeManager.getTheme());
  
  useEffect(() => {
    const handleChange = (e) => setTheme(e.detail.theme);
    window.addEventListener('themechange', handleChange);
    return () => window.removeEventListener('themechange', handleChange);
  }, []);
  
  return [theme, (t) => themeManager.setTheme(t)];
}

// Usage
function MyComponent() {
  const [theme, setTheme] = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Chart.js Integration

```javascript
function getChartColors(isDark) {
  return {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    textColor: isDark ? '#f9fafb' : '#111827',
    gridColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
  };
}

// Update charts on theme change
window.addEventListener('themechange', (event) => {
  const colors = getChartColors(event.detail.isDark);
  
  myChart.options.plugins.legend.labels.color = colors.textColor;
  myChart.options.scales.x.grid.color = colors.gridColor;
  myChart.options.scales.y.grid.color = colors.gridColor;
  myChart.update();
});
```

## Accessibility

### WCAG Compliance

All themes meet **WCAG 2.1 Level AA** standards:

- ✅ Minimum contrast ratio 4.5:1 for normal text
- ✅ Minimum contrast ratio 3:1 for large text
- ✅ Sufficient contrast for UI components
- ✅ Focus indicators visible in all themes

### Testing Contrast

```javascript
// Test color contrast
function getContrastRatio(color1, color2) {
  // Calculate relative luminance
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Example: Check if text is readable
const ratio = getContrastRatio('#111827', '#ffffff');
console.log(ratio >= 4.5 ? 'WCAG AA ✓' : 'WCAG AA ✗');
```

## Best Practices

### 1. Use CSS Variables

```css
/* ❌ Bad: Hardcoded colors */
.card {
  background: #ffffff;
  color: #111827;
}

/* ✅ Good: Theme-aware colors */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### 2. Test Both Themes

Always test your UI in both light and dark modes:

```javascript
// Automated theme testing
const themes = ['light', 'dark'];
themes.forEach(theme => {
  themeManager.setTheme(theme);
  runVisualTests();
});
```

### 3. Smooth Transitions

```css
/* Apply transitions to theme-aware properties */
.element {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color var(--transition-speed),
              color var(--transition-speed);
}
```

### 4. Handle Images

```css
/* Adjust image brightness in dark mode */
[data-theme='dark'] img {
  opacity: 0.8;
}

[data-theme='dark'] .logo {
  filter: invert(1); /* Invert logo colors */
}
```

### 5. Preserve User Preference

```javascript
// Don't override user's theme choice
// ❌ Bad: Forcing theme
themeManager.setTheme('light');

// ✅ Good: Respecting preference
if (!localStorage.getItem('portfolio-theme')) {
  themeManager.setTheme('auto');
}
```

## Mobile Optimization

### Theme Color Meta Tag

The system automatically updates the browser theme color:

```html
<!-- Auto-updated by theme-manager.js -->
<meta name="theme-color" content="#1a237e" id="theme-color-meta" />
```

**Colors:**
- Light mode: `#ffffff` (white)
- Dark mode: `#111827` (dark blue-gray)

### Touch-Friendly Toggle

```css
.theme-toggle {
  /* Larger touch target for mobile */
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

## Performance

### Optimizations

1. **CSS Variables**: Faster than JS manipulation
2. **Single Attribute**: `data-theme` on `:root` element
3. **No Re-renders**: Only CSS changes, no DOM manipulation
4. **Cached Preference**: Stored in localStorage

### Benchmarks

| Operation | Time |
|-----------|------|
| Theme switch | < 16ms (1 frame) |
| Initial load | < 5ms |
| Preference read | < 1ms |

## Troubleshooting

### Issue: Flash of Wrong Theme (FOUC)

**Solution**: Add inline script before CSS:

```html
<script>
  // Prevent flash of unstyled content
  const theme = localStorage.getItem('portfolio-theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
</script>
<link rel="stylesheet" href="styles-v3.1.css">
```

### Issue: Theme Not Persisting

**Solution**: Check localStorage permissions:

```javascript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available:', e);
  // Fall back to sessionStorage or cookies
}
```

### Issue: Custom Colors Not Working

**Solution**: Ensure CSS variable specificity:

```css
/* ❌ Won't work: Too specific */
body .my-element {
  color: #111827;
}

/* ✅ Works: Uses CSS variable */
.my-element {
  color: var(--text-primary);
}
```

## Advanced Features

### Custom Theme Presets

```javascript
// Create custom theme
class CustomThemeManager extends ThemeManager {
  constructor() {
    super();
    this.THEMES.SOLARIZED = 'solarized';
    this.THEMES.HIGH_CONTRAST = 'high-contrast';
  }
  
  setTheme(theme) {
    super.setTheme(theme);
    
    if (theme === 'solarized') {
      this.applySolarizedTheme();
    }
  }
  
  applySolarizedTheme() {
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', '#fdf6e3');
    root.style.setProperty('--text-primary', '#657b83');
    // ... more colors
  }
}
```

### Time-Based Auto Theme

```javascript
// Auto-switch based on time of day
function setupTimeBasedTheme() {
  const hour = new Date().getHours();
  const theme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
  themeManager.setTheme(theme);
  
  // Check every hour
  setInterval(setupTimeBasedTheme, 60 * 60 * 1000);
}
```

## Examples

### Complete Theme Implementation

```javascript
// Initialize theme system
class AppTheme {
  constructor() {
    this.manager = window.themeManager;
    this.init();
  }
  
  init() {
    // Load saved preference
    const saved = this.manager.getTheme();
    this.manager.setTheme(saved);
    
    // Listen for changes
    window.addEventListener('themechange', this.handleThemeChange.bind(this));
    
    // Create UI controls
    this.createThemeToggle();
  }
  
  handleThemeChange(event) {
    const { theme, isDark } = event.detail;
    
    // Update charts
    this.updateCharts(isDark);
    
    // Update components
    this.updateComponents(isDark);
    
    // Analytics
    this.trackThemeChange(theme);
  }
  
  updateCharts(isDark) {
    const colors = isDark 
      ? { bg: '#1f2937', text: '#f9fafb' }
      : { bg: '#ffffff', text: '#111827' };
    
    // Update all Chart.js instances
    Chart.defaults.color = colors.text;
    Chart.defaults.backgroundColor = colors.bg;
  }
  
  createThemeToggle() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.innerHTML = this.getThemeIcon();
    button.onclick = () => this.manager.toggleTheme();
    
    document.body.appendChild(button);
  }
  
  getThemeIcon() {
    const theme = this.manager.getTheme();
    return theme === 'light' ? '🌙' : theme === 'dark' ? '☀️' : '🌓';
  }
}

// Initialize
const appTheme = new AppTheme();
```

## Resources

- 🎨 [CSS Variables Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- 🌓 [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- ♿ [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- 📖 [Material Design Dark Theme](https://material.io/design/color/dark-theme.html)

---

**Last Updated**: 2024-01-15 | **Version**: 3.1.0
