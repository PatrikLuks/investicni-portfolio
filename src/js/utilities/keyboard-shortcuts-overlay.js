/**
 * Keyboard Shortcuts Overlay
 * Press ? to display all available shortcuts
 * WORLD-CLASS feature for power users
 */

class KeyboardShortcutsOverlay {
  constructor() {
    this.shortcuts = [
      {
        category: 'Základní',
        items: [
          { keys: ['Ctrl', 'Z'], description: 'Vrátit zpět poslední akci' },
          { keys: ['Ctrl', 'Y'], description: 'Znovu provést akci' },
          { keys: ['Ctrl', 'S'], description: 'Manuální uložení' },
          { keys: ['Ctrl', 'F'], description: 'Otevřít vyhledávání' },
          { keys: ['Escape'], description: 'Zavřít aktivní panel' },
          { keys: ['Enter'], description: 'Potvrdit formulář' },
          { keys: ['Tab'], description: 'Navigace formulářem' },
        ],
      },
      {
        category: 'Nápověda',
        items: [
          { keys: ['F1'], description: 'Otevřít nápovědu' },
          { keys: ['?'], description: 'Zobrazit klávesové zkratky' },
          { keys: ['Ctrl', ','], description: 'Otevřít nastavení' },
        ],
      },
      {
        category: 'Výkon & Debug',
        items: [
          { keys: ['Ctrl', 'Shift', 'P'], description: 'Performance monitor' },
          { keys: ['Ctrl', 'Shift', 'D'], description: 'Developer console (připraveno)' },
        ],
      },
      {
        category: 'Export',
        items: [
          { keys: ['Ctrl', 'P'], description: 'PDF export (připraveno)' },
          { keys: ['Ctrl', 'E'], description: 'Excel export (připraveno)' },
        ],
      },
    ];

    this.visible = false;
    this.init();
  }

  /**
   * Initialize shortcuts overlay
   */
  init() {
    try {
      // Listen for ? key
      document.addEventListener('keydown', (e) => {
        // ? key (Shift + /)
        if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
          // Don't trigger if user is typing in input
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
          }

          e.preventDefault();
          this.toggle();
        }

        // Escape to close
        if (e.key === 'Escape' && this.visible) {
          this.hide();
        }
      });
    } catch (error) {
      console.error('❌ Shortcuts overlay initialization failed:', error);
    }
  }

  /**
   * Toggle overlay visibility
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show overlay
   */
  show() {
    if (this.visible) {
      return;
    }

    this.visible = true;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'shortcutsBackdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 10020;
      animation: fadeIn 0.2s ease;
    `;

    backdrop.addEventListener('click', () => this.hide());

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'shortcutsOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      max-width: 90%;
      max-height: 80vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10021;
      overflow: hidden;
      animation: scaleIn 0.3s ease;
    `;

    overlay.innerHTML = `
      <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; display: flex; align-items: center; gap: 12px;">
            <span>⌨️</span>
            <span>Klávesové Zkratky</span>
          </h2>
          <button id="closeShortcuts" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: white;">✕</button>
        </div>
        <div style="margin-top: 8px; opacity: 0.9; font-size: 0.9rem;">
          Zvyšte svou produktivitu pomocí klávesových zkratek
        </div>
      </div>
      
      <div style="padding: 24px; max-height: calc(80vh - 120px); overflow-y: auto;">
        ${this.renderShortcuts()}
      </div>
      
      <div style="padding: 16px 24px; background: #f8f9fa; border-top: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
        <div style="color: #6c757d; font-size: 0.9rem;">
          Stiskněte <kbd style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">?</kbd> nebo <kbd style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Escape</kbd> pro zavření
        </div>
        <button id="printShortcuts" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
          🖨️ Tisk
        </button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);

    this.setupListeners();
  }

  /**
   * Render shortcuts by category
   */
  renderShortcuts() {
    return this.shortcuts
      .map(
        (category) => `
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #495057; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <span style="width: 4px; height: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 2px;"></span>
          <span>${category.category}</span>
        </h3>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
          ${category.items
            .map(
              (item) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                <div style="display: flex; gap: 6px;">
                  ${item.keys
                    .map(
                      (key) => `
                      <kbd style="
                        display: inline-block;
                        padding: 6px 10px;
                        background: white;
                        border: 1px solid #ced4da;
                        border-radius: 6px;
                        font-family: 'Courier New', monospace;
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: #495057;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      ">${key}</kbd>
                      `,
                    )
                    .join('<span style="margin: 0 4px; color: #adb5bd;">+</span>')}
                </div>
                <div style="color: #6c757d; font-size: 0.9rem; text-align: right; max-width: 60%;">
                  ${item.description}
                </div>
              </div>
            `,
            )
            .join('')}
        </div>
      </div>
    `,
    )
    .join('');
  }

  /**
   * Setup event listeners
   */
  setupListeners() {
    document.getElementById('closeShortcuts')?.addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('printShortcuts')?.addEventListener('click', () => {
      this.print();
    });
  }

  /**
   * Hide overlay
   */
  hide() {
    this.visible = false;
    document.getElementById('shortcutsOverlay')?.remove();
    document.getElementById('shortcutsBackdrop')?.remove();
  }

  /**
   * Print shortcuts
   */
  print() {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Klávesové Zkratky - Portfolio Manager Pro</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
          }
          h2 {
            color: #495057;
            margin-top: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
          }
          th {
            background: #f8f9fa;
            font-weight: 600;
          }
          kbd {
            display: inline-block;
            padding: 4px 8px;
            background: #e9ecef;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <h1>⌨️ Klávesové Zkratky</h1>
        <p><strong>Portfolio Manager Pro v3.0</strong> - Kompletní přehled</p>

        ${this.shortcuts
          .map(
            (category) => `
            <h2>${category.category}</h2>
            <table>
              <thead>
                <tr>
                  <th>Zkratka</th>
                  <th>Popis</th>
                </tr>
              </thead>
              <tbody>
                ${category.items
                  .map(
                    (item) => `
                    <tr>
                      <td>
                        ${item.keys.map((key) => `<kbd>${key}</kbd>`).join(' + ')}
                      </td>
                      <td>${item.description}</td>
                    </tr>
                  `,
                  )
                  .join('')}
              </tbody>
            </table>
          `,
          )
          .join('')}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6; color: #6c757d;">
          <p><small>Generováno: ${new Date().toLocaleString('cs-CZ')}</small></p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }

  /**
   * Add custom shortcut
   */
  addShortcut(category, keys, description) {
    const cat = this.shortcuts.find((c) => c.category === category);

    if (cat) {
      cat.items.push({ keys, description });
    } else {
      this.shortcuts.push({
        category,
        items: [{ keys, description }],
      });
    }
  }
}

// Global instance
window.keyboardShortcuts = new KeyboardShortcutsOverlay();

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
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
