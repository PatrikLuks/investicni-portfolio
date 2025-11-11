/**
 * @module event-handlers
 * Manages all DOM event listeners and user interactions
 *
 * @typedef {import('../src/js/utilities/data-manager.js').FundData} FundData
 * @typedef {import('../src/js/utilities/data-manager.js').ClientInfo} ClientInfo
 */

// This module will be populated with event handlers extracted from initializeApp()
// For now, creating a placeholder structure

/** @type {FundData[]} */
let portfolioData = [];
/** @type {string} */
let clientName = '';
/** @type {string} */
let advisorName = '';
/** @type {string} */
let advisorEmail = '';

// ==================== INITIALIZATION ====================

/** @type {string} Selected color scheme for charts */
let selectedColorScheme = 'blue';

/**
 * Initialize and return DOM element references
 * @returns {Object<string, HTMLElement>} Object with DOM references
 */
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

/**
 * Setup client form submit handler
 * @param {Object} storage - PortfolioStorage instance
 * @param {Function} updateDashboard - Dashboard update callback
 * @param {Function} showToast - Toast notification function
 * @param {Function} initColorPicker - Color picker initialization
 * @returns {void}
 */
function setupClientFormHandler(storage, updateDashboard, showToast, initColorPicker) {
  const elements = initializeDOMReferences();
  const { clientForm } = elements;

  if (!clientForm) {
    return;
  }

  clientForm.addEventListener('submit', (e) => {
    e.preventDefault();

    clientName = document.getElementById('clientName').value;
    advisorName = document.getElementById('advisorName').value;
    advisorEmail = document.getElementById('advisorEmail').value;

    storage.saveClient({ clientName, advisorName, advisorEmail });

    // Toggle visibility
    document.getElementById('clientNameCard').classList.add('hidden');
    document.getElementById('portfolioCard').classList.remove('hidden');
    document.getElementById('fondListCard').classList.remove('hidden');
    document.getElementById('clientNameDisplay').textContent = clientName;

    if (portfolioData.length > 0) {
      elements.dashboard.classList.remove('hidden');
      updateDashboard();
    }

    initColorPicker();

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

/**
 * Initialize color scheme picker
 * @returns {void}
 */
function initializeColorPicker() {
  const buttons = document.querySelectorAll('.scheme-button');

  buttons.forEach((button) => {
    button.addEventListener('click', function () {
      buttons.forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');

      if (this.classList.contains('blue-scheme')) {
        selectedColorScheme = 'blue';
      }
      if (this.classList.contains('red-scheme')) {
        selectedColorScheme = 'red';
      }
      if (this.classList.contains('green-scheme')) {
        selectedColorScheme = 'green';
      }
      if (this.classList.contains('yellow-scheme')) {
        selectedColorScheme = 'yellow';
      }
    });
  });

  const blueButton = document.querySelector('.blue-scheme');
  if (blueButton) {
    blueButton.classList.add('active');
    selectedColorScheme = 'blue';
  }
}

/**
 * Get current color scheme
 * @returns {string} Current color scheme
 */
function getColorScheme() {
  return selectedColorScheme;
}

// ==================== PORTFOLIO FORM HANDLER ====================

/**
 * Setup portfolio form submit handler
 * @param {Object} storage - PortfolioStorage instance
 * @param {Function} validateFundData - Validation function
 * @param {Function} parseSafeNumber - Number parsing function
 * @param {Function} updateFundList - Fund list update callback
 * @param {Function} updateDashboard - Dashboard update callback
 * @param {Function} showToast - Toast notification function
 * @returns {void}
 */
function setupPortfolioFormHandler(
  storage,
  validateFundData,
  parseSafeNumber,
  updateFundList,
  updateDashboard,
  showToast,
) {
  const portfolioForm = document.getElementById('portfolioForm');
  if (!portfolioForm) {
    return;
  }

  portfolioForm.addEventListener('submit', (e) => {
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

/**
 * Setup bulk action button handlers
 * @param {Function} bulkDeleteSelected - Delete handler
 * @param {Function} bulkExportSelected - Export handler
 * @returns {void}
 */
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

/**
 * Setup view mode radio button handlers
 * @param {Function} onViewModeChange - Callback with new view mode
 * @returns {void}
 */
function setupViewModeToggle(onViewModeChange) {
  const viewModeRadios = document.querySelectorAll('input[name="viewMode"]');

  viewModeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (onViewModeChange) {
        onViewModeChange(e.target.value);
      }
    });
  });
}

// ==================== SEARCH HANDLER ====================

/**
 * Setup search input handler with debounce
 * @param {Function} onSearch - Search callback function
 * @param {Function} debounce - Debounce utility function
 * @returns {void}
 */
function setupSearchHandler(onSearch, debounce) {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) {
    return;
  }

  searchInput.addEventListener(
    'input',
    debounce((e) => {
      if (onSearch) {
        onSearch(e.target.value);
      }
    }, 300),
  );
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Set portfolio data reference
 * @param {FundData[]} data - Portfolio data array
 * @returns {void}
 */
function setPortfolioData(data) {
  portfolioData = data;
}

/**
 * Get current portfolio data
 * @returns {FundData[]} Portfolio data array
 */
function getPortfolioData() {
  return portfolioData;
}

/**
 * Get current client information
 * @returns {ClientInfo} Client info object
 */
function getClientInfo() {
  return { clientName, advisorName, advisorEmail };
}

// Export module
export {
  initializeDOMReferences,
  setupClientFormHandler,
  initializeColorPicker,
  getColorScheme,
  setupPortfolioFormHandler,
  setupBulkActionsHandlers,
  setupViewModeToggle,
  setupSearchHandler,
  setPortfolioData,
  getPortfolioData,
  getClientInfo,
};
