/**
 * Market Data UI Components
 * Version: 3.1.0
 * User interface for API configuration and market data updates
 */

// API Settings Modal
function createApiSettingsModal() {
  const modal = document.createElement('div');
  modal.id = 'apiSettingsModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>🔑 Market Data API Settings</h2>
        <button class="modal-close" class="modal-close-btn" data-action="close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="api-providers-status">
          <h3>Provider Status</h3>
          <div id="providersStatus"></div>
        </div>

        <div class="api-settings-form">
          <div class="form-group">
            <label>
              <strong>Yahoo Finance</strong> (Free, No API Key Required)
            </label>
            <p class="help-text">
              ✅ Enabled by default • Limited to 2,000 requests/hour
            </p>
          </div>

          <div class="form-group">
            <label for="alphaVantageKey">
              <strong>Alpha Vantage API Key</strong> (Optional)
            </label>
            <input
              type="password"
              id="alphaVantageKey"
              placeholder="Enter your Alpha Vantage API key"
              autocomplete="off"
            />
            <p class="help-text">
              Get free API key at <a href="https://www.alphavantage.co/support/#api-key" target="_blank">alphavantage.co</a> • 500 requests/day
            </p>
          </div>

          <div class="form-group">
            <label for="finnhubKey">
              <strong>Finnhub API Key</strong> (Optional)
            </label>
            <input
              type="password"
              id="finnhubKey"
              placeholder="Enter your Finnhub API key"
              autocomplete="off"
            />
            <p class="help-text">
              Get free API key at <a href="https://finnhub.io/register" target="_blank">finnhub.io</a> • 60 calls/minute
            </p>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="autoUpdate" />
              Enable auto-update every 15 minutes
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" class="modal-close-btn" data-action="close">Cancel</button>
        <button class="btn btn-primary" class="save-settings-btn" data-action="save">Save Settings</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function openApiSettingsModal() {
  let modal = document.getElementById('apiSettingsModal');
  if (!modal) {
    createApiSettingsModal();
    modal = document.getElementById('apiSettingsModal');
  }

  // Load current settings
  const saved = localStorage.getItem('marketDataApiKeys');
  if (saved) {
    try {
      const keys = JSON.parse(saved);
      if (keys.alphavantage) {
        document.getElementById('alphaVantageKey').value = keys.alphavantage;
      }
      if (keys.finnhub) {
        document.getElementById('finnhubKey').value = keys.finnhub;
      }
    } catch (e) {
      console.error('Failed to load API keys:', e);
    }
  }

  // Load auto-update setting
  const autoUpdate = localStorage.getItem('marketDataAutoUpdate') === 'true';
  document.getElementById('autoUpdate').checked = autoUpdate;

  // Update provider status
  updateProviderStatus();

  modal.style.display = 'flex';
}

function closeApiSettingsModal() {
  const modal = document.getElementById('apiSettingsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveApiSettings() {
  const alphaVantageKey = document.getElementById('alphaVantageKey').value.trim();
  const finnhubKey = document.getElementById('finnhubKey').value.trim();
  const autoUpdate = document.getElementById('autoUpdate').checked;

  // Save API keys
  const keys = {};
  if (alphaVantageKey) {
    keys.alphavantage = alphaVantageKey;
  }
  if (finnhubKey) {
    keys.finnhub = finnhubKey;
  }

  window.marketDataService.saveApiKeys(keys);

  // Save auto-update preference
  localStorage.setItem('marketDataAutoUpdate', autoUpdate);

  if (autoUpdate) {
    startAutoUpdate();
  } else {
    if (window.autoUpdateService) {
      window.autoUpdateService.stop();
    }
  }

  if (window.notificationSystem) {
    window.notificationSystem.showNotification('API Settings Saved', {
      body: 'API settings saved successfully',
      category: 'success',
    });
  }
  closeApiSettingsModal();
}

function updateProviderStatus() {
  const statusDiv = document.getElementById('providersStatus');
  if (!statusDiv) {
    return;
  }

  const providers = window.marketDataService.getProviderStatus();

  statusDiv.innerHTML = providers
    .map(
      (provider) => `
    <div class="provider-status ${provider.enabled ? 'enabled' : 'disabled'}">
      <span class="provider-name">${provider.name}</span>
      <span class="provider-badge">
        ${provider.enabled ? '✅ Active' : '⚠️ Inactive'}
        ${provider.hasApiKey ? ' • API Key Configured' : ''}
      </span>
    </div>
  `
    )
    .join('');
}

// Market Data Update Widget
function createMarketDataWidget() {
  const widget = document.createElement('div');
  widget.id = 'marketDataWidget';
  widget.className = 'market-data-widget';
  widget.innerHTML = `
    <div class="widget-header">
      <span class="widget-title">📈 Market Data</span>
      <div class="widget-controls">
        <button class="btn-icon" class="refresh-btn" data-action="refresh" title="Refresh now">
          🔄
        </button>
        <button class="btn-icon" class="open-settings-btn" data-action="open" title="API Settings">
          ⚙️
        </button>
      </div>
    </div>
    <div class="widget-status" id="marketDataStatus">
      <span class="status-text">Not configured</span>
    </div>
  `;

  return widget;
}

function addMarketDataWidget() {
  const container = document.querySelector('.controls') || document.body;
  const widget = createMarketDataWidget();
  container.appendChild(widget);

  // Initialize status display with provider info
  const statusDiv = widget.querySelector('#marketDataStatus');
  const providers = window.marketDataService?.getProviderStatus?.() || [];

  if (providers.length > 0) {
    statusDiv.innerHTML = providers
      .map(
        (provider) => `
      <div class="provider-status ${provider.enabled ? 'enabled' : 'disabled'}">
        <span class="provider-name">${provider.name}</span>
        <span class="provider-badge">
          ${provider.enabled ? '✅ Active' : '⚠️ Inactive'}
          ${provider.hasApiKey ? ' • API Key Configured' : ' (No key needed)'}
        </span>
      </div>
    `
      )
      .join('');
  } else {
    // Default: show Yahoo Finance is available
    statusDiv.innerHTML = `
      <div class="provider-status enabled">
        <span class="provider-name">Yahoo Finance</span>
        <span class="provider-badge">✅ Active (No API Key Needed)</span>
      </div>
    `;
  }

  // Initialize auto-update if enabled
  const autoUpdate = localStorage.getItem('marketDataAutoUpdate') === 'true';
  if (autoUpdate) {
    startAutoUpdate();
  }

  // Listen for market data updates
  window.addEventListener('marketDataUpdate', (event) => {
    updateMarketDataStatus(event.detail.quotes);
  });
}

function startAutoUpdate() {
  // Get unique symbols from current portfolio
  const symbols = getPortfolioSymbols();

  if (symbols.length === 0) {
    if (window.notificationSystem) {
      window.notificationSystem.showNotification('No Symbols', {
        body: 'No symbols to update',
        category: 'warning',
      });
    }
    return;
  }

  window.autoUpdateService.start(symbols);
  updateMarketDataStatus(null, 'Auto-update enabled');
}

function getPortfolioSymbols() {
  try {
    const portfolio = JSON.parse(localStorage.getItem('investmentPortfolio') || '[]');
    const symbols = portfolio.map((item) => item.symbol).filter(Boolean);
    return [...new Set(symbols)]; // Remove duplicates
  } catch (e) {
    console.error('Failed to get portfolio symbols:', e);
    return [];
  }
}

async function refreshMarketData() {
  const symbols = getPortfolioSymbols();

  if (symbols.length === 0) {
    if (window.notificationSystem) {
      window.notificationSystem.showNotification('No Investments', {
        body: 'No investments to update',
        category: 'warning',
      });
    }
    return;
  }

  updateMarketDataStatus(null, 'Updating...');

  try {
    const quotes = await window.marketDataService.getBatchQuotes(symbols);

    // Update portfolio with new prices
    updatePortfolioWithQuotes(quotes);

    updateMarketDataStatus(quotes, 'Updated');
    if (window.notificationSystem) {
      window.notificationSystem.showNotification('Market Data Updated', {
        body: `Updated ${quotes.length} symbols`,
        category: 'success',
      });
    }
  } catch (error) {
    updateMarketDataStatus(null, 'Error');
    if (window.notificationSystem) {
      window.notificationSystem.showNotification('Update Failed', {
        body: `Update failed: ${error.message}`,
        category: 'error',
      });
    }
  }
}

function updatePortfolioWithQuotes(quotes) {
  try {
    const portfolio = JSON.parse(localStorage.getItem('investmentPortfolio') || '[]');
    let updated = false;

    quotes.forEach((quote) => {
      if (quote.error) {
        return;
      }

      const item = portfolio.find((p) => p.symbol === quote.symbol);
      if (item) {
        item.currentPrice = quote.price;
        item.lastUpdate = new Date().toISOString();
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('investmentPortfolio', JSON.stringify(portfolio));

      // Trigger portfolio update event
      window.dispatchEvent(new Event('portfolioUpdated'));
    }
  } catch (e) {
    console.error('Failed to update portfolio:', e);
  }
}

function updateMarketDataStatus(quotes, message) {
  const statusEl = document.getElementById('marketDataStatus');
  if (!statusEl) {
    return;
  }

  if (message) {
    statusEl.innerHTML = `<span class="status-text">${message}</span>`;
    return;
  }

  if (!quotes) {
    return;
  }

  const successful = quotes.filter((q) => !q.error).length;
  const failed = quotes.filter((q) => q.error).length;
  const cached = quotes.filter((q) => q.cached).length;

  statusEl.innerHTML = `
    <span class="status-text">
      ✅ ${successful} updated
      ${failed > 0 ? `• ❌ ${failed} failed` : ''}
      ${cached > 0 ? `• 💾 ${cached} cached` : ''}
    </span>
  `;
}

// Symbol Search
async function searchSymbol(query) {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const results = await window.marketDataService.searchSymbol(query);
    return results.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Symbol search failed:', error);
    return [];
  }
}

function createSymbolSearchInput(inputElement) {
  const wrapper = document.createElement('div');
  wrapper.className = 'symbol-search-wrapper';

  const resultsDiv = document.createElement('div');
  resultsDiv.className = 'symbol-search-results';
  resultsDiv.style.display = 'none';

  wrapper.appendChild(inputElement.cloneNode(true));
  wrapper.appendChild(resultsDiv);

  inputElement.parentNode.replaceChild(wrapper, inputElement);

  const newInput = wrapper.querySelector('input');

  let searchTimeout;
  newInput.addEventListener('input', async (e) => {
    clearTimeout(searchTimeout);

    const query = e.target.value;

    if (query.length < 2) {
      resultsDiv.style.display = 'none';
      return;
    }

    searchTimeout = setTimeout(async () => {
      const results = await searchSymbol(query);

      if (results.length === 0) {
        resultsDiv.style.display = 'none';
        return;
      }

      resultsDiv.innerHTML = results
        .map(
          (result) => `
        <div class="search-result-item" data-symbol="${result.symbol}">
          <strong>${result.symbol}</strong>
          <span class="result-name">${result.name}</span>
          <span class="result-type">${result.type}</span>
        </div>
      `
        )
        .join('');

      resultsDiv.style.display = 'block';

      // Add click handlers
      resultsDiv.querySelectorAll('.search-result-item').forEach((item) => {
        item.addEventListener('click', () => {
          newInput.value = item.dataset.symbol;
          resultsDiv.style.display = 'none';
        });
      });
    }, 300);
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add market data widget
  addMarketDataWidget();

  // Enhance symbol input with search
  const symbolInput = document.querySelector('input[placeholder*="symbol"]');
  if (symbolInput) {
    createSymbolSearchInput(symbolInput);
  }

  // Add event delegation for all UI buttons
  document.addEventListener('click', (e) => {
    const { target } = e;

    // Modal close buttons
    if (target.classList.contains('modal-close-btn') || target.dataset.action === 'close') {
      closeApiSettingsModal();
    }

    // Save settings button
    if (target.classList.contains('save-settings-btn') || target.dataset.action === 'save') {
      saveApiSettings();
    }

    // Refresh button
    if (target.classList.contains('refresh-btn') || target.dataset.action === 'refresh') {
      refreshMarketData();
    }

    // Open settings button
    if (target.classList.contains('open-settings-btn') || target.dataset.action === 'open') {
      openApiSettingsModal();
    }
  });
});

// Export functions
window.openApiSettingsModal = openApiSettingsModal;
window.closeApiSettingsModal = closeApiSettingsModal;
window.saveApiSettings = saveApiSettings;
window.refreshMarketData = refreshMarketData;
window.searchSymbol = searchSymbol;
