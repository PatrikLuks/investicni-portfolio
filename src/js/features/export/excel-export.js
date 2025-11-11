/**
 * Excel Export Manager
 * SheetJS integration for Excel export with formulas and formatting
 */

import { logWarn, logError } from '../../utilities/logger.js';

class ExcelExportManager {
  constructor() {
    this.workbook = null;
    this.sheetJSLoaded = false;

    this.init();
  }

  /**
   * Initialize Excel export manager
   */
  init() {
    this.checkDependencies();
  }

  /**
   * Check if SheetJS is loaded - ES2024 modernized
   */
  checkDependencies() {
    // ES2024: optional chaining for global check
    if (!window.XLSX) {
    } else {
      this.sheetJSLoaded = true;
    }
  }

  /**
   * Ensure SheetJS library is loaded - uses LibraryLoader for on-demand loading
   */
  async ensureSheetJSLoaded() {
    if (this.sheetJSLoaded && typeof XLSX !== 'undefined') {
      return;
    }

    // Use LibraryLoader for on-demand loading with caching
    if (window.libraryLoader?.loaded?.xlsx) {
      this.sheetJSLoaded = true;
      return;
    }

    if (!window.libraryLoader) {
      logWarn('LibraryLoader not available, falling back to direct load');
      return this.loadSheetJSManually();
    }

    // Load via libraryLoader (caches, handles SRI, etc.)
    try {
      await window.libraryLoader.loadXLSX();
      this.sheetJSLoaded = true;
    } catch (error) {
      logError('Failed to load SheetJS via LibraryLoader:', error);
      throw error;
    }
  }

  /**
   * Fallback: Load SheetJS manually (old method, used if LibraryLoader unavailable)
   */
  loadSheetJSManually() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.crossOrigin = 'anonymous';
      script.integrity = 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2';
      script.onload = () => {
        this.sheetJSLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load SheetJS'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Export portfolio to Excel
   * @param {Array} data - Portfolio data
   * @param {Object} options - Export options
   */
  async exportToExcel(data, options = {}) {
    try {
      await this.ensureSheetJSLoaded();

      // Create new workbook
      const wb = XLSX.utils.book_new();

      // Add sheets
      this.addPortfolioSheet(wb, data);
      this.addSummarySheet(wb, data);
      this.addMetricsSheet(wb, data);
      this.addCategoryBreakdownSheet(wb, data);

      if (options.includeHistory) {
        this.addHistorySheet(wb, data);
      }

      // Generate filename
      const filename =
        options.filename || `portfolio-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);

      return filename;
    } catch (error) {
      logError('Excel export failed:', error);
      throw error;
    }
  }

  /**
   * Add portfolio holdings sheet
   * @param {Object} wb - Workbook
   * @param {Array} data - Portfolio data
   */
  addPortfolioSheet(wb, data) {
    const wsData = [
      // Header row
      [
        'ISIN',
        'Fond',
        'Kategorie',
        'Počet',
        'Nákupní cena',
        'Celková investice',
        'Aktuální hodnota',
        'Zisk/Ztráta',
        'ROI (%)',
        'Podíl (%)',
        'Datum nákupu',
      ],
    ];

    // Calculate total value for percentage
    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);

    // Data rows
    data.forEach((item, index) => {
      const count = parseFloat(item.počet);
      const price = parseFloat(item.nákupníCena);
      const cost = count * price;
      const current = parseFloat(item.aktuálníHodnota || 0);
      const gainLoss = current - cost;
      const roi = cost > 0 ? (gainLoss / cost) * 100 : 0;
      const percentage = totalValue > 0 ? (current / totalValue) * 100 : 0;

      wsData.push([
        item.ISIN || '',
        item.fond || '',
        item.kategorie || '',
        count,
        price,
        { f: `D${index + 2}*E${index + 2}` }, // Formula: Počet * Nákupní cena
        current,
        { f: `G${index + 2}-F${index + 2}` }, // Formula: Aktuální - Investice
        { f: `H${index + 2}/F${index + 2}*100` }, // Formula: (Zisk/Ztráta) / Investice * 100
        { f: `G${index + 2}/${totalValue}*100` }, // Formula: Aktuální / Total * 100
        item.datumNákupu || '',
      ]);
    });

    // Add totals row
    const lastRow = data.length + 2;
    wsData.push([
      'CELKEM',
      '',
      '',
      { f: `SUM(D2:D${lastRow - 1})` },
      '',
      { f: `SUM(F2:F${lastRow - 1})` },
      { f: `SUM(G2:G${lastRow - 1})` },
      { f: `SUM(H2:H${lastRow - 1})` },
      { f: `G${lastRow}/F${lastRow}*100` },
      100,
      '',
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
      { wch: 12 }, // ISIN
      { wch: 30 }, // Fond
      { wch: 15 }, // Kategorie
      { wch: 10 }, // Počet
      { wch: 12 }, // Nákupní cena
      { wch: 15 }, // Celková investice
      { wch: 15 }, // Aktuální hodnota
      { wch: 12 }, // Zisk/Ztráta
      { wch: 10 }, // ROI
      { wch: 10 }, // Podíl
      { wch: 12 }, // Datum
    ];

    // Apply formatting
    this.applyPortfolioFormatting(ws, data.length);

    XLSX.utils.book_append_sheet(wb, ws, 'Portfolio');
  }

  /**
   * Add summary sheet
   * @param {Object} wb - Workbook
   * @param {Array} data - Portfolio data
   */
  addSummarySheet(wb, data) {
    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const totalCost = data.reduce(
      (sum, item) => sum + parseFloat(item.nákupníCena) * parseFloat(item.počet),
      0
    );
    const gainLoss = totalValue - totalCost;
    const roi = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

    const wsData = [
      ['📊 PORTFOLIO SUMMARY', ''],
      [''],
      ['Metrika', 'Hodnota'],
      ['Celková hodnota portfolia', totalValue],
      ['Celková investice', totalCost],
      ['Celkový zisk/ztráta', gainLoss],
      ['ROI (%)', roi],
      [''],
      ['Počet pozic', data.length],
      ['Nejvyšší pozice', Math.max(...data.map((d) => parseFloat(d.aktuálníHodnota || 0)))],
      ['Průměrná pozice', totalValue / data.length],
      [''],
      ['Datum exportu', new Date().toLocaleDateString('cs-CZ')],
      ['Čas exportu', new Date().toLocaleTimeString('cs-CZ')],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }];

    // Merge title cell
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    this.applySummaryFormatting(ws);

    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  }

  /**
   * Add metrics sheet
   * @param {Array} data - Portfolio data
   */
  addMetricsSheet(wb, data) {
    if (!window.calculationsEngine) {
      return;
    }

    const metrics = window.calculationsEngine.calculatePortfolioMetrics(data);

    const wsData = [
      ['📈 ADVANCED METRICS', ''],
      [''],
      ['Metrika', 'Hodnota', 'Popis'],
      ['ROI', metrics.roi, 'Return on Investment'],
      ['CAGR', metrics.cagr, 'Compound Annual Growth Rate'],
      ['Sharpe Ratio', metrics.sharpeRatio, 'Risk-adjusted Return'],
      ['Volatilita', metrics.volatility, 'Annualized Standard Deviation'],
      ['Beta', metrics.beta, 'Market Sensitivity'],
      ['Max Drawdown', metrics.maxDrawdown, 'Maximum Loss from Peak'],
      ['Current Drawdown', metrics.currentDrawdown, 'Current Loss from Peak'],
      [''],
      ['🏆 TOP PERFORMERS', '', ''],
      ['Pozice', 'Fond', 'ROI (%)'],
    ];

    // Add top performers
    metrics.topPerformers.slice(0, 5).forEach((p, i) => {
      wsData.push([i + 1, p.fond, p.roi]);
    });

    wsData.push(['']);
    wsData.push(['⚠️ WORST PERFORMERS', '', '']);
    wsData.push(['Pozice', 'Fond', 'ROI (%)']);

    // Add worst performers
    metrics.worstPerformers.slice(0, 5).forEach((p, i) => {
      wsData.push([i + 1, p.fond, p.roi]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 35 }];

    // Merge title cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 11, c: 0 }, e: { r: 11, c: 2 } },
      { s: { r: 18, c: 0 }, e: { r: 18, c: 2 } },
    ];

    this.applyMetricsFormatting(ws);

    XLSX.utils.book_append_sheet(wb, ws, 'Metrics');
  }

  /**
   * Add category breakdown sheet
   * @param {Object} wb - Workbook
   * @param {Array} data - Portfolio data
   */
  addCategoryBreakdownSheet(wb, data) {
    const categoryData = {};

    data.forEach((item) => {
      const category = item.kategorie || 'Ostatní';
      if (!categoryData[category]) {
        categoryData[category] = {
          count: 0,
          totalValue: 0,
          totalCost: 0,
        };
      }

      categoryData[category].count++;
      categoryData[category].totalValue += parseFloat(item.aktuálníHodnota || 0);
      categoryData[category].totalCost += parseFloat(item.nákupníCena) * parseFloat(item.počet);
    });

    const wsData = [
      ['📂 CATEGORY BREAKDOWN', '', '', '', ''],
      [''],
      ['Kategorie', 'Počet pozic', 'Celková hodnota', 'Investice', 'Zisk/Ztráta', 'ROI (%)'],
    ];

    const totalValue = Object.values(categoryData).reduce((sum, cat) => sum + cat.totalValue, 0);

    Object.entries(categoryData).forEach(([category, stats]) => {
      const gainLoss = stats.totalValue - stats.totalCost;
      const roi = stats.totalCost > 0 ? (gainLoss / stats.totalCost) * 100 : 0;

      wsData.push([category, stats.count, stats.totalValue, stats.totalCost, gainLoss, roi]);
    });

    // Add totals
    const lastRow = wsData.length + 1;
    wsData.push([
      'CELKEM',
      { f: `SUM(B4:B${lastRow - 1})` },
      { f: `SUM(C4:C${lastRow - 1})` },
      { f: `SUM(D4:D${lastRow - 1})` },
      { f: `SUM(E4:E${lastRow - 1})` },
      { f: `E${lastRow}/D${lastRow}*100` },
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];

    // Merge title
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    this.applyCategoryFormatting(ws, Object.keys(categoryData).length);

    XLSX.utils.book_append_sheet(wb, ws, 'Categories');
  }

  /**
   * Add history sheet (placeholder for future implementation)
   * @param {Object} wb - Workbook
   * @param {Array} data - Portfolio data
   */
  addHistorySheet(wb, data) {
    const wsData = [
      ['📅 TRANSACTION HISTORY', '', '', ''],
      [''],
      ['Datum', 'Fond', 'Typ', 'Počet', 'Cena', 'Hodnota'],
      ['Coming soon...', '', '', '', '', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 15 }];

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    XLSX.utils.book_append_sheet(wb, ws, 'History');
  }

  /**
   * Apply portfolio sheet formatting
   * @param {Object} ws - Worksheet
   * @param {number} dataRows - Number of data rows
   */
  applyPortfolioFormatting(ws, dataRows) {
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Header row
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (!cell) {
        continue;
      }

      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1A237E' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    // Number formatting for currency columns
    const currencyCols = [4, 5, 6, 7]; // E, F, G, H (0-indexed)
    for (let R = 1; R <= dataRows + 1; R++) {
      currencyCols.forEach((C) => {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && typeof cell.v === 'number') {
          cell.z = '#,##0 "Kč"';
        }
      });
    }

    // Percentage formatting
    const percentCols = [8, 9]; // I, J
    for (let R = 1; R <= dataRows + 1; R++) {
      percentCols.forEach((C) => {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell) {
          cell.z = '0.00"%"';
        }
      });
    }

    // Totals row bold
    const totalsRow = dataRows + 1;
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: totalsRow, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E8EAF6' } },
        };
      }
    }
  }

  /**
   * Apply summary sheet formatting
   * @param {Object} ws - Worksheet
   */
  applySummaryFormatting(ws) {
    // Title cell
    const titleCell = ws['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 16, color: { rgb: '1A237E' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    // Header row
    ['A3', 'B3'].forEach((addr) => {
      const cell = ws[addr];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E8EAF6' } },
        };
      }
    });

    // Number formatting
    ['B4', 'B5', 'B6', 'B10'].forEach((addr) => {
      const cell = ws[addr];
      if (cell && typeof cell.v === 'number') {
        cell.z = '#,##0 "Kč"';
      }
    });

    ['B7'].forEach((addr) => {
      const cell = ws[addr];
      if (cell && typeof cell.v === 'number') {
        cell.z = '0.00"%"';
      }
    });
  }

  /**
   * Apply metrics sheet formatting
   * @param {Object} ws - Worksheet
   */
  applyMetricsFormatting(ws) {
    // Title cells
    ['A1', 'A12', 'A19'].forEach((addr) => {
      const cell = ws[addr];
      if (cell) {
        cell.s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: 'center' },
        };
      }
    });

    // Header rows
    ['A3', 'B3', 'C3', 'A13', 'B13', 'C13', 'A20', 'B20', 'C20'].forEach((addr) => {
      const cell = ws[addr];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E8EAF6' } },
        };
      }
    });
  }

  /**
   * Apply category sheet formatting
   * @param {Object} ws - Worksheet
   * @param {number} categoryCount - Number of categories
   */
  applyCategoryFormatting(ws, categoryCount) {
    // Title
    const titleCell = ws['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center' },
      };
    }

    // Header row
    for (let C = 0; C < 6; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 2, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E8EAF6' } },
        };
      }
    }

    // Totals row
    const totalsRow = 3 + categoryCount;
    for (let C = 0; C < 6; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: totalsRow, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'C5CAE9' } },
        };
      }
    }
  }
}

// Global instance
window.excelExportManager = new ExcelExportManager();

// Add Excel export button
window.addEventListener('DOMContentLoaded', () => {
  const portfolioCard = document.getElementById('portfolioCard');
  if (!portfolioCard) {
    return;
  }

  const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
  if (!headerDiv) {
    return;
  }

  const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
  if (!buttonContainer) {
    return;
  }

  const excelBtn = document.createElement('button');
  excelBtn.id = 'exportExcel';
  excelBtn.className = 'btn-icon';
  excelBtn.title = 'Exportovat do Excel';
  excelBtn.style.cssText =
    'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
  excelBtn.textContent = '📊 Excel';

  excelBtn.addEventListener('click', async () => {
    const data = window.getFondyData ? window.getFondyData() : [];
    if (!data || data.length === 0) {
      alert('Žádná data k exportu');
      return;
    }

    excelBtn.disabled = true;
    excelBtn.textContent = '⏳ Exportuji...';

    try {
      await window.excelExportManager.exportToExcel(data, {
        includeHistory: false,
      });

      if (typeof showToast === 'function') {
        showToast('success', 'Export dokončen', 'Excel soubor byl úspěšně vygenerován');
      }
    } catch (error) {
      logError('Excel export failed:', error);
      alert(`Chyba při exportu do Excelu: ${error.message}`);
    } finally {
      excelBtn.disabled = false;
      excelBtn.textContent = '📊 Excel';
    }
  });

  buttonContainer.insertBefore(excelBtn, buttonContainer.children[3]);
});
