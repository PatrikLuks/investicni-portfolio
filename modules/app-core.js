/**
 * @module app-core
 * Main application initialization and bootstrap
 * Investment Portfolio Manager Pro v3.1.0
 *
 * @typedef {import('./data-manager.js').FundData} FundData
 * @typedef {import('./data-manager.js').ClientInfo} ClientInfo
 */

import { PortfolioStorage, parseSafeNumber, validateFundData, debounce } from './data-manager.js';
import {
  showToast,
  showConfirmDialog,
  animateValue,
  getSelectedRows,
  clearSelectedRows,
} from './ui-manager.js';
import {
  calculatePortfolioMetrics,
  calculateFundYield,
  aggregateByProducer,
  sortFunds,
  filterFunds,
} from './portfolio-calculator.js';
import {
  initializeDOMReferences,
  setupClientFormHandler,
  initializeColorPicker,
  setupPortfolioFormHandler,
  setupBulkActionsHandlers,
  setupViewModeToggle,
  setupSearchHandler,
  setPortfolioData,
  getClientInfo,
} from './event-handlers.js';
import { generateCSV, formatCurrency, formatPercentage, truncateText } from './utilities.js';

// ==================== MODULE STATE ====================
/** @type {FundData[]} */
let portfolioData = [];
/** @type {'funds'|'producers'} */
let viewMode = 'funds';
const currentSortColumn = null;
const currentSortDirection = 'asc';
/** @type {string} */
let searchQuery = '';

const storage = new PortfolioStorage();

// ==================== DOM REFERENCES ====================
/** @type {Object<string, HTMLElement>} */
let elements = {};

/**
 * Initialize DOM element references
 * @returns {void}
 */
function initElements() {
  elements = initializeDOMReferences();
}

// ==================== DASHBOARD UPDATE ====================

/**
 * Update dashboard with portfolio metrics and charts
 * @returns {void}
 */
function updateDashboard() {
  if (portfolioData.length === 0) {
    if (elements.dashboard) {
      elements.dashboard.classList.add('hidden');
    }
    return;
  }

  if (elements.dashboard) {
    elements.dashboard.classList.remove('hidden');
  }

  const metrics = calculatePortfolioMetrics(portfolioData);

  // Animate KPI values
  animateValue('kpiValueInvestment', 0, metrics.totalInvestment, 1000, true);
  animateValue('kpiValueCurrent', 0, metrics.totalValue, 1000, true);
  animateValue('kpiValueYield', 0, metrics.totalYield, 1000, false);

  // Update profit amount
  const profitElement = document.getElementById('kpiProfitAmount');
  if (profitElement) {
    profitElement.textContent = formatCurrency(metrics.totalProfit);
  }

  // Update yield card styling
  const yieldCard = document.getElementById('kpiTotalYield');
  const yieldChange = document.getElementById('kpiChangeYield');
  if (yieldCard && yieldChange) {
    if (metrics.totalYield >= 0) {
      yieldCard.classList.remove('negative');
      yieldCard.classList.add('positive');
      yieldChange.classList.remove('negative');
      yieldChange.classList.add('positive');
      const arrow = yieldChange.querySelector('span:first-child');
      if (arrow) {
        arrow.textContent = '↑';
      }
    } else {
      yieldCard.classList.remove('positive');
      yieldCard.classList.add('negative');
      yieldChange.classList.remove('positive');
      yieldChange.classList.add('negative');
      const arrow = yieldChange.querySelector('span:first-child');
      if (arrow) {
        arrow.textContent = '↓';
      }
    }
  }

  // Update best fund
  if (metrics.bestFund) {
    const bestFundElement = document.getElementById('kpiValueBestFund');
    const bestYieldElement = document.getElementById('kpiBestFundYield');
    if (bestFundElement) {
      bestFundElement.textContent = truncateText(metrics.bestFund.name, 50);
    }
    if (bestYieldElement) {
      bestYieldElement.textContent = `Nejvyšší výnos: ${formatPercentage(metrics.bestFund.yield)}`;
    }
  }
}

// ==================== FUND LIST UPDATE ====================

/**
 * Update fund list view (table or producer view)
 * @returns {void}
 */
function updateFundList() {
  // Implementation depends on view mode
  if (viewMode === 'funds') {
    updateFundTable();
  } else {
    updateProducerTable();
  }
}

/**
 * Update fund table with filtered and sorted data
 * @returns {void}
 */
function updateFundTable() {
  const table = document.getElementById('fondTable');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody) {
    return;
  }

  // Filter and sort
  let displayData = filterFunds(portfolioData, searchQuery);
  if (currentSortColumn) {
    displayData = sortFunds(displayData, currentSortColumn, currentSortDirection);
  }

  // Clear table
  tbody.innerHTML = '';

  // Populate table
  displayData.forEach((fund, index) => {
    const row = createFundRow(fund, index);
    tbody.appendChild(row);
  });

  // Update select all checkbox
  const selectAllCheckbox = document.getElementById('selectAll');
  if (selectAllCheckbox) {
    const selectedCount = getSelectedRows().size;
    selectAllCheckbox.checked = selectedCount > 0 && selectedCount === portfolioData.length;
  }
}

/**
 * Create table row element for fund
 * @param {FundData} fund - Fund data object
 * @param {number} index - Index in portfolio array
 * @returns {HTMLTableRowElement} Table row element
 */
function createFundRow(fund, index) {
  const row = document.createElement('tr');
  const fundYield = calculateFundYield(fund);
  const yieldClass = fundYield >= 0 ? 'positive' : 'negative';

  row.innerHTML = `
    <td><input type="checkbox" class="row-select" data-index="${index}"></td>
    <td>${fund.name || ''}</td>
    <td>${fund.producer || ''}</td>
    <td class="text-right">${parseSafeNumber(fund.investment).toLocaleString('cs-CZ')} Kč</td>
    <td class="text-right">${parseSafeNumber(fund.value).toLocaleString('cs-CZ')} Kč</td>
    <td class="text-right ${yieldClass}">${fundYield.toFixed(2)}%</td>
    <td class="text-center">${fund.investmentDate || ''}</td>
    <td class="text-center">
      <button class="btn btn-sm btn-edit" data-index="${index}">Upravit</button>
      <button class="btn btn-sm btn-danger" data-index="${index}">Smazat</button>
    </td>
  `;

  return row;
}

/**
 * Update producer aggregated view
 * @returns {void}
 */
function updateProducerTable() {
  const aggregated = aggregateByProducer(portfolioData);
  // Implementation similar to updateFundTable but with aggregated data
}

// ==================== DATA OPERATIONS ====================

/**
 * Update specific fund field
 * @param {number} index - Fund index in array
 * @param {string} field - Field name to update
 * @param {*} value - New value
 * @returns {void}
 */
function updateFundData(index, field, value) {
  if (index >= 0 && index < portfolioData.length) {
    portfolioData[index][field] = value;
    storage.saveData(portfolioData);
    updateFundList();
    updateDashboard();
  }
}

/**
 * Delete fund with confirmation dialog
 * @param {number} index - Fund index to delete
 * @returns {void}
 */
function deleteFund(index) {
  if (index >= 0 && index < portfolioData.length) {
    const fund = portfolioData[index];
    showConfirmDialog('Smazat fond?', `Opravdu chcete smazat fond "${fund.name}"?`, () => {
      portfolioData.splice(index, 1);
      storage.saveData(portfolioData);
      updateFundList();
      updateDashboard();
      showToast('success', 'Fond smazán', `${fund.name} byl odstraněn z portfolia`);
    });
  }
}

/**
 * Delete multiple selected funds with confirmation
 * @returns {void}
 */
function bulkDeleteSelected() {
  const selectedIndexes = Array.from(getSelectedRows()).sort((a, b) => b - a);
  if (selectedIndexes.length === 0) {
    return;
  }

  showConfirmDialog(
    'Smazat vybrané fondy?',
    `Opravdu chcete smazat ${selectedIndexes.length} vybraných fondů?`,
    () => {
      selectedIndexes.forEach((index) => portfolioData.splice(index, 1));
      clearSelectedRows();
      storage.saveData(portfolioData);
      updateFundList();
      updateDashboard();
      showToast('success', 'Fondy smazány', `${selectedIndexes.length} fondů bylo odstraněno`);
    },
  );
}

/**
 * Export selected funds to CSV
 * @returns {void}
 */
function bulkExportSelected() {
  const selectedIndexes = Array.from(getSelectedRows());
  if (selectedIndexes.length === 0) {
    return;
  }

  const selectedFunds = selectedIndexes.map((i) => portfolioData[i]);
  const { clientName: client } = getClientInfo();

  generateCSV(selectedFunds, client || 'client');
  showToast('success', 'Export dokončen', `${selectedFunds.length} fondů bylo exportováno`);
}

// ==================== INITIALIZATION ====================

/**
 * Initialize application - main entry point
 * @returns {void}
 */
function initializeApp() {
  // Initialize DOM references
  initElements();

  // Check if DOM is ready
  if (!elements.clientForm) {
    return setTimeout(initializeApp, 100);
  }

  // Load data from storage
  portfolioData = storage.loadData();
  // Load saved client info (handled by event-handlers module)
  storage.loadClient();

  // Sync with event handlers module
  setPortfolioData(portfolioData);

  // Setup event handlers
  setupClientFormHandler(storage, updateDashboard, showToast, initializeColorPicker);
  setupPortfolioFormHandler(
    storage,
    validateFundData,
    parseSafeNumber,
    updateFundList,
    updateDashboard,
    showToast,
  );
  setupBulkActionsHandlers(bulkDeleteSelected, bulkExportSelected);
  setupViewModeToggle((newMode) => {
    viewMode = newMode;
    updateFundList();
  });
  setupSearchHandler((query) => {
    searchQuery = query.toLowerCase();
    updateFundList();
  }, debounce);

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Setup dark mode
  setupDarkMode();

  // Display last save time
  const lastSave = storage.getLastSaveTime();
  if (lastSave) {
    storage.updateLastSaveDisplay(lastSave.toISOString());
  }
}

/**
 * Setup keyboard shortcuts for app actions
 * @returns {void}
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      storage.saveData(portfolioData);
      showToast('success', 'Uloženo', 'Portfolio bylo uloženo');
    }

    // ESC: Close dialogs
    if (e.key === 'Escape') {
      const overlays = document.querySelectorAll('.confirm-overlay');
      overlays.forEach((overlay) => overlay.remove());
    }

    // Ctrl/Cmd + E: Export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      const generateBtn = document.getElementById('generateReport');
      if (generateBtn && portfolioData.length > 0) {
        generateBtn.click();
      }
    }
  });
}

/**
 * Setup dark mode toggle functionality
 * @returns {void}
 */
function setupDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) {
    return;
  }

  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
  }

  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    showToast('info', 'Vzhled změněn', `Přepnuto na ${isDark ? 'tmavý' : 'světlý'} režim`);
  });
}

// ==================== PUBLIC API ====================
export {
  initializeApp,
  updateDashboard,
  updateFundList,
  updateFundData,
  deleteFund,
  bulkDeleteSelected,
  bulkExportSelected,
};
