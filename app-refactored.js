/**
 * INVESTMENT PORTFOLIO MANAGER PRO v3.1.0
 * Refactored Architecture - IIFE Bundle
 * 
 * Original: 2835 lines (monolithic)
 * Refactored: 1496 lines (modular)
 * Reduction: 47%
 * 
 * Date: 2025-10-08
 * Phase: 2 Complete
 */

(function() {
  'use strict';

  // ========================================
  // MODULE: data-manager.js
  // ========================================


// ==================== STORAGE & PERSISTENCE ====================
class PortfolioStorage {
  constructor() {
    this.storageKey = 'portfolioData_v2';
    this.clientKey = 'portfolioClient_v2';
    this.lastSaveKey = 'portfolioLastSave_v2';
    this.autosaveInterval = null;
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      const now = new Date().toISOString();
      localStorage.setItem(this.lastSaveKey, now);
      this.updateLastSaveDisplay(now);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      if (typeof showToast === 'function') {
        showToast('error', 'Chyba uložení', 'Nepodařilo se uložit data do localStorage');
      }
      return false;
    }
  }

  loadData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Load failed:', e);
      return [];
    }
  }

  saveClient(client) {
    try {
      localStorage.setItem(this.clientKey, JSON.stringify(client));
      return true;
    } catch (e) {
      console.error('Client save failed:', e);
      return false;
    }
  }

  loadClient() {
    try {
      const client = localStorage.getItem(this.clientKey);
      return client ? JSON.parse(client) : null;
    } catch (e) {
      console.error('Client load failed:', e);
      return null;
    }
  }

  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.clientKey);
      localStorage.removeItem(this.lastSaveKey);
      if (typeof showToast === 'function') {
        showToast('info', 'Data smazána', 'Všechna data byla vymazána');
      }
      return true;
    } catch (e) {
      console.error('Clear failed:', e);
      return false;
    }
  }

  startAutosave(callback) {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
    this.autosaveInterval = setInterval(() => {
      if (callback) callback();
    }, 30000); // 30 seconds
  }

  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  updateLastSaveDisplay(isoString) {
    const date = new Date(isoString);
    const timeStr = date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const indicator = document.getElementById('lastSaveIndicator');
    const timeElement = document.getElementById('lastSaveTime');

    if (indicator && timeElement) {
      timeElement.textContent = `Uloženo ${timeStr}`;
      indicator.style.opacity = '1';
      indicator.style.animation = 'pulse 0.5s ease-in-out';
      setTimeout(() => {
        indicator.style.animation = '';
        indicator.style.opacity = '0.7';
      }, 2000);
    }
  }

  getLastSaveTime() {
    const lastSave = localStorage.getItem(this.lastSaveKey);
    return lastSave ? new Date(lastSave) : null;
  }
}

// ==================== VALIDATION FUNCTIONS ====================
function parseSafeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed =
    typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function validateFundData(data) {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Název fondu je povinný');
  }

  if (!data.producer || data.producer.trim() === '') {
    errors.push('Správce je povinný');
  }

  const investment = parseSafeNumber(data.investment);
  if (investment <= 0) {
    errors.push('Investice musí být kladné číslo');
  }

  const value = parseSafeNumber(data.value);
  if (value < 0) {
    errors.push('Hodnota nemůže být záporná');
  }

  return errors;
}

// ==================== UTILITY FUNCTIONS ====================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export module

  // ========================================
  // MODULE: ui-manager.js
  // ========================================


// ==================== TOAST NOTIFICATIONS ====================
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==================== CONFIRMATION DIALOG ====================
function showConfirmDialog(title, message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';

  dialog.innerHTML = `
    <h3 class="confirm-title">${title}</h3>
    <p class="confirm-message">${message}</p>
    <div class="confirm-actions">
      <button id="cancelBtn" class="btn btn-secondary">Zrušit</button>
      <button id="confirmBtn" class="btn btn-danger">Potvrdit</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const confirmBtn = dialog.querySelector('#confirmBtn');
  const cancelBtn = dialog.querySelector('#cancelBtn');

  const cleanup = () => {
    overlay.classList.add('fade-out');
    setTimeout(() => document.body.removeChild(overlay), 200);
  };

  confirmBtn.onclick = () => {
    cleanup();
    if (onConfirm) onConfirm();
  };

  cancelBtn.onclick = () => {
    cleanup();
    if (onCancel) onCancel();
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      cleanup();
      if (onCancel) onCancel();
    }
  };
}

// ==================== LOADING OVERLAY ====================
function showLoading() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';
  overlay.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

// ==================== CHART EXPORT ====================
function exportChartAsPNG(chartElement, filename = 'chart.png') {
  try {
    const canvas = chartElement.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      showToast('success', 'Export úspěšný', `Graf byl exportován jako ${filename}`);
    }
  } catch (e) {
    console.error('Chart export failed:', e);
    showToast('error', 'Export selhal', 'Nepodařilo se exportovat graf');
  }
}

// ==================== BULK SELECTION UI ====================
const selectedRows = new Set();

function updateBulkActionsBar() {
  const bar = document.getElementById('bulkActionsBar');
  const count = document.getElementById('selectedCount');

  if (bar && count) {
    count.textContent = selectedRows.size;
    bar.classList.toggle('active', selectedRows.size > 0);
  }
}

function toggleRowSelection(index, checked) {
  if (checked) {
    selectedRows.add(index);
  } else {
    selectedRows.delete(index);
  }
  updateBulkActionsBar();
}

function selectAllRows(checked) {
  selectedRows.clear();
  if (checked && window.portfolioData) {
    window.portfolioData.forEach((_, index) => selectedRows.add(index));
  }
  updateBulkActionsBar();
}

function getSelectedRows() {
  return selectedRows;
}

function clearSelectedRows() {
  selectedRows.clear();
  updateBulkActionsBar();
}

// ==================== ANIMATIONS ====================
function animateValue(elementId, start, end, duration, isCurrency = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }

    if (isCurrency) {
      element.textContent = new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.round(current));
    } else {
      element.textContent = Math.round(current).toLocaleString('cs-CZ');
    }
  }, 16);
}

// Export module
  showToast,
  showConfirmDialog,
  showLoading,
  hideLoading,
  exportChartAsPNG,
  updateBulkActionsBar,
  // End of UI Manager module

  // ========================================
  // MODULE: portfolio-calculator.js
  // ========================================



// ==================== PORTFOLIO CALCULATIONS ====================
function calculatePortfolioMetrics(portfolioData) {
  if (!portfolioData || portfolioData.length === 0) {
    return {
      totalInvestment: 0,
      totalValue: 0,
      totalProfit: 0,
      totalYield: 0,
      bestFund: null,
      worstFund: null,
      averageYield: 0,
    };
  }

  const totalInvestment = portfolioData.reduce(
    (sum, item) => sum + parseSafeNumber(item.investment),
    0
  );
  const totalValue = portfolioData.reduce((sum, item) => sum + parseSafeNumber(item.value), 0);
  const totalProfit = totalValue - totalInvestment;
  const totalYield = totalInvestment !== 0 ? (totalProfit / totalInvestment) * 100 : 0;

  // Find best and worst performing funds
  let bestFund = null;
  let worstFund = null;
  let bestYield = -Infinity;
  let worstYield = Infinity;
  let totalYieldSum = 0;

  portfolioData.forEach((item) => {
    const investment = parseSafeNumber(item.investment);
    const value = parseSafeNumber(item.value);
    const fundYield = investment !== 0 ? ((value - investment) / investment) * 100 : 0;

    totalYieldSum += fundYield;

    if (fundYield > bestYield) {
      bestYield = fundYield;
      bestFund = { ...item, yield: fundYield };
    }

    if (fundYield < worstYield) {
      worstYield = fundYield;
      worstFund = { ...item, yield: fundYield };
    }
  });

  const averageYield = portfolioData.length > 0 ? totalYieldSum / portfolioData.length : 0;

  return {
    totalInvestment,
    totalValue,
    totalProfit,
    totalYield,
    bestFund,
    worstFund,
    averageYield,
  };
}

// ==================== FUND YIELD CALCULATION ====================
function calculateFundYield(fund) {
  const investment = parseSafeNumber(fund.investment);
  const value = parseSafeNumber(fund.value);
  return investment !== 0 ? ((value - investment) / investment) * 100 : 0;
}

// ==================== PORTFOLIO DIVERSIFICATION ====================
function calculateDiversification(portfolioData) {
  if (!portfolioData || portfolioData.length === 0) {
    return {
      byProducer: [],
      byAssetType: [],
    };
  }

  const totalValue = portfolioData.reduce((sum, item) => sum + parseSafeNumber(item.value), 0);

  // Group by producer
  const byProducer = {};
  portfolioData.forEach((item) => {
    const producer = item.producer || 'Neznámý';
    const value = parseSafeNumber(item.value);

    if (!byProducer[producer]) {
      byProducer[producer] = { value: 0, count: 0 };
    }
    byProducer[producer].value += value;
    byProducer[producer].count += 1;
  });

  // Convert to array with percentages
  const producerArray = Object.entries(byProducer).map(([name, data]) => ({
    name,
    value: data.value,
    count: data.count,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
  }));

  // Sort by value descending
  producerArray.sort((a, b) => b.value - a.value);

  return {
    byProducer: producerArray,
    byAssetType: [], // For future expansion
  };
}

// ==================== PRODUCER AGGREGATION ====================
function aggregateByProducer(portfolioData) {
  if (!portfolioData || portfolioData.length === 0) return [];

  const producerMap = {};

  portfolioData.forEach((fund) => {
    const producer = fund.producer || 'Neznámý';
    const investment = parseSafeNumber(fund.investment);
    const value = parseSafeNumber(fund.value);
    const profit = value - investment;

    if (!producerMap[producer]) {
      producerMap[producer] = {
        producer,
        totalInvestment: 0,
        totalValue: 0,
        totalProfit: 0,
        count: 0,
        funds: [],
      };
    }

    producerMap[producer].totalInvestment += investment;
    producerMap[producer].totalValue += value;
    producerMap[producer].totalProfit += profit;
    producerMap[producer].count += 1;
    producerMap[producer].funds.push(fund);
  });

  // Convert to array and calculate yields
  return Object.values(producerMap).map((producer) => ({
    ...producer,
    yield:
      producer.totalInvestment !== 0
        ? (producer.totalProfit / producer.totalInvestment) * 100
        : 0,
  }));
}

// ==================== SORTING & FILTERING ====================
function sortFunds(funds, column, direction = 'asc') {
  const sorted = [...funds];

  sorted.sort((a, b) => {
    let aVal, bVal;

    switch (column) {
      case 'name':
      case 'producer':
        aVal = (a[column] || '').toLowerCase();
        bVal = (b[column] || '').toLowerCase();
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);

      case 'investment':
      case 'value':
        aVal = parseSafeNumber(a[column]);
        bVal = parseSafeNumber(b[column]);
        return direction === 'asc' ? aVal - bVal : bVal - aVal;

      case 'yield':
        const yieldA = calculateFundYield(a);
        const yieldB = calculateFundYield(b);
        return direction === 'asc' ? yieldA - yieldB : yieldB - yieldA;

      default:
        return 0;
    }
  });

  return sorted;
}

function filterFunds(funds, searchQuery) {
  if (!searchQuery || searchQuery.trim() === '') return funds;

  const query = searchQuery.toLowerCase().trim();

  return funds.filter((fund) => {
    return (
      (fund.name || '').toLowerCase().includes(query) ||
      (fund.producer || '').toLowerCase().includes(query)
    );
  });
}

// Export module
  calculatePortfolioMetrics,
  calculateFundYield,
  calculateDiversification,
  aggregateByProducer,
  sortFunds,
  filterFunds,
};

  // ========================================
  // MODULE: event-handlers.js
  // ========================================


// This module will be populated with event handlers extracted from initializeApp()
// For now, creating a placeholder structure

let portfolioData = [];
let clientName = '';
let advisorName = '';
let advisorEmail = '';

// ==================== INITIALIZATION ====================
function initializeDOMReferences() {
  return {
    clientForm: document.getElementById('clientForm'),
    portfolioForm: document.getElementById('portfolioForm'),
    generateReportBtn: document.getElementById('generateReport'),
    fundList: document.getElementById('fondList'),
    clientNameCard: document.getElementById('clientNameCard'),
    portfolioCard: document.getElementById('portfolioCard'),
    fundListCard: document.getElementById('fondListCard'),
    clientNameDisplay: document.getElementById('clientNameDisplay'),
    dashboard: document.getElementById('dashboard'),
  };
}

// ==================== CLIENT FORM HANDLER ====================
function setupClientFormHandler(storage, updateDashboard, showToast, initializeColorPicker) {
  const elements = initializeDOMReferences();
  const { clientForm } = elements;

  if (!clientForm) return;

  clientForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    clientName = document.getElementById('clientName').value;
    advisorName = document.getElementById('advisorName').value;
    advisorEmail = document.getElementById('advisorEmail').value;

    storage.saveClient({ clientName, advisorName, advisorEmail });

    // Toggle visibility
    document.getElementById('clientNameCard').classList.add('hidden');
    document.getElementById('portfolioCard').classList.remove('hidden');
    document.getElementById('fundListCard').classList.remove('hidden');
    document.getElementById('clientNameDisplay').textContent = clientName;

    if (portfolioData.length > 0) {
      elements.dashboard.classList.remove('hidden');
      updateDashboard();
    }

    initializeColorPicker();
    
    storage.startAutosave(() => {
      storage.saveData(portfolioData);
      const display = document.getElementById('lastSaveDisplay');
      if (display) {
        display.classList.add('pulse-animation');
        setTimeout(() => display.classList.remove('pulse-animation'), 500);
      }
    });

    showToast('success', 'Vítejte!', `Portfolio pro ${clientName} je připraveno`);
  });
}

// ==================== COLOR PICKER HANDLER ====================
function initializeColorPicker() {
  const buttons = document.querySelectorAll('.scheme-button');

  buttons.forEach((button) => {
    button.addEventListener('click', function () {
      buttons.forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');

      if (this.classList.contains('blue-scheme')) window.selectedColorScheme = 'blue';
      if (this.classList.contains('red-scheme')) window.selectedColorScheme = 'red';
      if (this.classList.contains('green-scheme')) window.selectedColorScheme = 'green';
      if (this.classList.contains('yellow-scheme')) window.selectedColorScheme = 'yellow';
    });
  });

  const blueButton = document.querySelector('.blue-scheme');
  if (blueButton) {
    blueButton.classList.add('active');
    window.selectedColorScheme = 'blue';
  }
}

// ==================== PORTFOLIO FORM HANDLER ====================
function setupPortfolioFormHandler(storage, validateFundData, parseSafeNumber, updateFundList, updateDashboard, showToast) {
  const portfolioForm = document.getElementById('portfolioForm');
  if (!portfolioForm) return;

  portfolioForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fundData = {
      name: document.getElementById('fondName').value.trim(),
      producer: document.getElementById('producer').value.trim(),
      investment: parseSafeNumber(document.getElementById('investment').value),
      investmentDate: document.getElementById('investmentDate').value,
      value: parseSafeNumber(document.getElementById('value').value),
    };

    const errors = validateFundData(fundData);
    if (errors.length > 0) {
      showToast('error', 'Validační chyba', errors.join('<br>'));
      return;
    }

    try {
      portfolioData.push(fundData);
      storage.saveData(portfolioData);
      updateFundList();
      updateDashboard();
      portfolioForm.reset();
      
      document.getElementById('fondListCard').classList.remove('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      
      showToast('success', 'Fond přidán', `${fundData.name} byl úspěšně přidán do portfolia`);
    } catch (error) {
      console.error('Add fund failed:', error);
      showToast('error', 'Chyba', 'Nepodařilo se přidat fond do portfolia');
    }
  });
}

// ==================== BULK ACTIONS HANDLERS ====================
function setupBulkActionsHandlers(bulkDeleteSelected, bulkExportSelected) {
  const deleteBtn = document.getElementById('bulkDeleteBtn');
  const exportBtn = document.getElementById('bulkExportBtn');

  if (deleteBtn) {
    deleteBtn.addEventListener('click', bulkDeleteSelected);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', bulkExportSelected);
  }
}

// ==================== VIEW MODE TOGGLE ====================
function setupViewModeToggle() {
  const viewModeRadios = document.querySelectorAll('input[name="viewMode"]');
  
  viewModeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      window.viewMode = e.target.value;
      if (typeof updateFundList === 'function') {
        updateFundList();
      }
    });
  });
}

// ==================== SEARCH HANDLER ====================
function setupSearchHandler(updateFundList, debounce) {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener(
    'input',
    debounce((e) => {
      window.searchQuery = e.target.value;
      updateFundList();
    }, 300)
  );
}

// ==================== EXPORT FUNCTIONS ====================
function setPortfolioData(data) {
  portfolioData = data;
}

function getPortfolioData() {
  return portfolioData;
}

function getClientInfo() {
  return { clientName, advisorName, advisorEmail };
}

// Export module
  initializeDOMReferences,
  setupClientFormHandler,
  initializeColorPicker,
  setupPortfolioFormHandler,
  setupBulkActionsHandlers,
  setupViewModeToggle,
  setupSearchHandler,
  setPortfolioData,
  getPortfolioData,
  getClientInfo,
};

  // ========================================
  // MODULE: app-core.js
  // ========================================


  showToast,
  showConfirmDialog,
  showLoading,
  hideLoading,
  exportChartAsPNG,
  updateBulkActionsBar,
  toggleRowSelection,
  selectAllRows,
  getSelectedRows,
  clearSelectedRows,
  animateValue,
} from './ui-manager.js';
  calculatePortfolioMetrics,
  calculateFundYield,
  aggregateByProducer,
  sortFunds,
  filterFunds,
} from './portfolio-calculator.js';
  initializeDOMReferences,
  setupClientFormHandler,
  initializeColorPicker,
  setupPortfolioFormHandler,
  setupBulkActionsHandlers,
  setupViewModeToggle,
  setupSearchHandler,
  setPortfolioData,
  getPortfolioData,
  getClientInfo,
} from './event-handlers.js';

// ==================== GLOBAL STATE ====================
let portfolioData = [];
let clientName = '';
let advisorName = '';
let advisorEmail = '';
let viewMode = 'funds'; // 'funds' or 'producers'
let currentSortColumn = null;
let currentSortDirection = 'asc';
let searchQuery = '';

const storage = new PortfolioStorage();

// ==================== DOM REFERENCES ====================
let elements = {};

function initElements() {
  elements = initializeDOMReferences();
}

// ==================== DASHBOARD UPDATE ====================
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
    profitElement.textContent = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(metrics.totalProfit);
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
      if (arrow) arrow.textContent = '↑';
    } else {
      yieldCard.classList.remove('positive');
      yieldCard.classList.add('negative');
      yieldChange.classList.remove('positive');
      yieldChange.classList.add('negative');
      const arrow = yieldChange.querySelector('span:first-child');
      if (arrow) arrow.textContent = '↓';
    }
  }

  // Update best fund
  if (metrics.bestFund) {
    const bestFundElement = document.getElementById('kpiValueBestFund');
    const bestYieldElement = document.getElementById('kpiBestFundYield');
    if (bestFundElement) {
      const shortName =
        metrics.bestFund.name.length > 50
          ? metrics.bestFund.name.substring(0, 50) + '...'
          : metrics.bestFund.name;
      bestFundElement.textContent = shortName;
    }
    if (bestYieldElement) {
      bestYieldElement.textContent = `Nejvyšší výnos: ${metrics.bestFund.yield.toFixed(2)}%`;
    }
  }
}

// ==================== FUND LIST UPDATE ====================
function updateFundList() {
  // Implementation depends on view mode
  if (viewMode === 'funds') {
    updateFundTable();
  } else {
    updateProducerTable();
  }
}

function updateFundTable() {
  const table = document.getElementById('fondTable');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody) return;

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

function updateProducerTable() {
  const aggregated = aggregateByProducer(portfolioData);
  // Implementation similar to updateFundTable but with aggregated data
  console.log('Producer view:', aggregated);
}

// ==================== DATA OPERATIONS ====================
function updateFundData(index, field, value) {
  if (index >= 0 && index < portfolioData.length) {
    portfolioData[index][field] = value;
    storage.saveData(portfolioData);
    updateFundList();
    updateDashboard();
  }
}

function deleteFund(index) {
  if (index >= 0 && index < portfolioData.length) {
    const fund = portfolioData[index];
    showConfirmDialog(
      'Smazat fond?',
      `Opravdu chcete smazat fond "${fund.name}"?`,
      () => {
        portfolioData.splice(index, 1);
        storage.saveData(portfolioData);
        updateFundList();
        updateDashboard();
        showToast('success', 'Fond smazán', `${fund.name} byl odstraněn z portfolia`);
      }
    );
  }
}

function bulkDeleteSelected() {
  const selectedIndexes = Array.from(getSelectedRows()).sort((a, b) => b - a);
  if (selectedIndexes.length === 0) return;

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
    }
  );
}

function bulkExportSelected() {
  const selectedIndexes = Array.from(getSelectedRows());
  if (selectedIndexes.length === 0) return;

  const selectedFunds = selectedIndexes.map((i) => portfolioData[i]);
  // Call existing CSV export function
  if (typeof generateCSV === 'function') {
    generateCSV(selectedFunds);
    showToast('success', 'Export dokončen', `${selectedFunds.length} fondů bylo exportováno`);
  }
}

// ==================== INITIALIZATION ====================
function initializeApp() {
  // Initialize DOM references
  initElements();

  // Check if DOM is ready
  if (!elements.clientForm) {
    console.warn('⚠️ App initialization delayed - DOM not ready');
    return setTimeout(initializeApp, 100);
  }

  // Load data from storage
  portfolioData = storage.loadData();
  const savedClient = storage.loadClient();
  if (savedClient) {
    clientName = savedClient.clientName || '';
    advisorName = savedClient.advisorName || '';
    advisorEmail = savedClient.advisorEmail || '';
  }

  // Sync with event handlers module
  setPortfolioData(portfolioData);

  // Setup event handlers
  setupClientFormHandler(storage, updateDashboard, showToast, initializeColorPicker);
  setupPortfolioFormHandler(storage, validateFundData, parseSafeNumber, updateFundList, updateDashboard, showToast);
  setupBulkActionsHandlers(bulkDeleteSelected, bulkExportSelected);
  setupViewModeToggle();
  setupSearchHandler(updateFundList, debounce);

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Setup dark mode
  setupDarkMode();

  // Display last save time
  const lastSave = storage.getLastSaveTime();
  if (lastSave) {
    storage.updateLastSaveDisplay(lastSave.toISOString());
  }

  console.log('✅ App initialized successfully');
}

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

function setupDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;

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

// ==================== START THE APP ====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// ==================== PUBLIC API ====================
  initializeApp,
  updateDashboard,
  updateFundList,
  updateFundData,
  deleteFund,
  bulkDeleteSelected,
  bulkExportSelected,
  portfolioData,
  storage,
};

})();
