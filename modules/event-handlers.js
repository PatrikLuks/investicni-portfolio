/**
 * EVENT HANDLERS MODULE
 * Manages all DOM event listeners and user interactions
 */

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
export {
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
