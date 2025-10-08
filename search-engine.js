/**
 * Advanced Search Engine for Portfolio Manager
 * Features: Fuzzy search, multi-column filtering, saved searches, search history
 */

class SearchEngine {
  constructor() {
    this.searchHistory = this.loadSearchHistory();
    this.savedSearches = this.loadSavedSearches();
    this.currentFilters = {};
    this.searchResults = [];
    this.fuseInstance = null;
    this.maxHistoryItems = 20;
    this.maxSavedSearches = 50;
  }

  /**
   * Initialize Fuse.js for fuzzy search
   * @param {Array} data - Portfolio data to search
   */
  initFuzzySearch(data) {
    const options = {
      keys: [
        { name: 'fond', weight: 0.3 },
        { name: 'kategorie', weight: 0.2 },
        { name: 'poznámka', weight: 0.2 },
        { name: 'ticker', weight: 0.15 },
        { name: 'správce', weight: 0.15 },
      ],
      threshold: 0.4, // 0 = perfect match, 1 = match anything
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
      ignoreLocation: true,
    };

    // Check if Fuse.js is available
    if (typeof Fuse !== 'undefined') {
      this.fuseInstance = new Fuse(data, options);
    } else {
      console.warn('Fuse.js not loaded - falling back to basic search');
    }
  }

  /**
   * Perform fuzzy search
   * @param {string} query - Search query
   * @param {Array} data - Portfolio data
   * @returns {Array} - Search results with scores
   */
  fuzzySearch(query, data) {
    if (!query || query.trim().length < 2) {
      return data.map((item, index) => ({
        item,
        score: 1,
        matches: [],
        refIndex: index,
      }));
    }

    // Add to search history
    this.addToHistory(query);

    // Use Fuse.js if available
    if (this.fuseInstance) {
      this.fuseInstance.setCollection(data);
      return this.fuseInstance.search(query);
    }

    // Fallback: Basic case-insensitive search
    return this.basicSearch(query, data);
  }

  /**
   * Basic search fallback (when Fuse.js not available)
   * @param {string} query - Search query
   * @param {Array} data - Portfolio data
   * @returns {Array} - Filtered results
   */
  basicSearch(query, data) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    data.forEach((item, index) => {
      const searchFields = [
        item.fond || '',
        item.kategorie || '',
        item.poznámka || '',
        item.ticker || '',
        item.správce || '',
      ];

      const matches = searchFields.some((field) => field.toLowerCase().includes(lowerQuery));

      if (matches) {
        results.push({
          item,
          score: 0.5,
          matches: [],
          refIndex: index,
        });
      }
    });

    return results;
  }

  /**
   * Apply multi-column filters
   * @param {Array} data - Portfolio data
   * @param {Object} filters - Filter criteria
   * @returns {Array} - Filtered results
   */
  applyFilters(data, filters = this.currentFilters) {
    this.currentFilters = filters;
    let results = [...data];

    // Text search filter
    if (filters.searchQuery) {
      const searchResults = this.fuzzySearch(filters.searchQuery, results);
      results = searchResults.map((r) => r.item);
    }

    // Category filter
    if (filters.kategorie && filters.kategorie.length > 0) {
      results = results.filter((item) => filters.kategorie.includes(item.kategorie));
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      results = results.filter((item) => {
        const price = parseFloat(item.aktuálníCena) || 0;
        const min = filters.minPrice !== undefined ? parseFloat(filters.minPrice) : -Infinity;
        const max = filters.maxPrice !== undefined ? parseFloat(filters.maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Percentage change filter
    if (filters.minChange !== undefined || filters.maxChange !== undefined) {
      results = results.filter((item) => {
        const change = parseFloat(item.změnaProcenta) || 0;
        const min = filters.minChange !== undefined ? parseFloat(filters.minChange) : -Infinity;
        const max = filters.maxChange !== undefined ? parseFloat(filters.maxChange) : Infinity;
        return change >= min && change <= max;
      });
    }

    // Value range filter (position size)
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      results = results.filter((item) => {
        const value = parseFloat(item.aktuálníHodnota) || 0;
        const min = filters.minValue !== undefined ? parseFloat(filters.minValue) : -Infinity;
        const max = filters.maxValue !== undefined ? parseFloat(filters.maxValue) : Infinity;
        return value >= min && value <= max;
      });
    }

    // Manager filter
    if (filters.správce && filters.správce.length > 0) {
      results = results.filter((item) => filters.správce.includes(item.správce));
    }

    // Custom date range filter
    if (filters.startDate || filters.endDate) {
      results = results.filter((item) => {
        if (!item.datumNákupu) {return false;}
        const itemDate = new Date(item.datumNákupu);
        const start = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
        const end = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
        return itemDate >= start && itemDate <= end;
      });
    }

    // Has notes filter
    if (filters.hasNotes === true) {
      results = results.filter((item) => item.poznámka && item.poznámka.trim().length > 0);
    }

    this.searchResults = results;
    return results;
  }

  /**
   * Save current search/filter configuration
   * @param {string} name - Name for saved search
   * @param {Object} filters - Filter configuration
   * @returns {boolean} - Success status
   */
  saveSearch(name, filters = this.currentFilters) {
    if (!name || name.trim().length === 0) {
      console.error('Search name is required');
      return false;
    }

    // Check if already exists
    const existingIndex = this.savedSearches.findIndex((s) => s.name === name);

    const savedSearch = {
      name: name.trim(),
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      usageCount: existingIndex >= 0 ? this.savedSearches[existingIndex].usageCount + 1 : 1,
    };

    if (existingIndex >= 0) {
      this.savedSearches[existingIndex] = savedSearch;
    } else {
      this.savedSearches.unshift(savedSearch);

      // Limit saved searches
      if (this.savedSearches.length > this.maxSavedSearches) {
        this.savedSearches.pop();
      }
    }

    this.persistSavedSearches();
    return true;
  }

  /**
   * Load a saved search
   * @param {string} name - Name of saved search
   * @returns {Object|null} - Filter configuration
   */
  loadSearch(name) {
    const search = this.savedSearches.find((s) => s.name === name);
    if (search) {
      search.usageCount++;
      search.lastUsed = new Date().toISOString();
      this.persistSavedSearches();
      this.currentFilters = { ...search.filters };
      return search.filters;
    }
    return null;
  }

  /**
   * Delete a saved search
   * @param {string} name - Name of saved search
   * @returns {boolean} - Success status
   */
  deleteSearch(name) {
    const index = this.savedSearches.findIndex((s) => s.name === name);
    if (index >= 0) {
      this.savedSearches.splice(index, 1);
      this.persistSavedSearches();
      return true;
    }
    return false;
  }

  /**
   * Get all saved searches
   * @returns {Array} - List of saved searches
   */
  getSavedSearches() {
    return [...this.savedSearches];
  }

  /**
   * Add query to search history
   * @param {string} query - Search query
   */
  addToHistory(query) {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {return;}

    // Remove duplicates
    this.searchHistory = this.searchHistory.filter((h) => h.query !== trimmed);

    // Add to beginning
    this.searchHistory.unshift({
      query: trimmed,
      timestamp: new Date().toISOString(),
    });

    // Limit history
    if (this.searchHistory.length > this.maxHistoryItems) {
      this.searchHistory.pop();
    }

    this.persistSearchHistory();
  }

  /**
   * Get search history
   * @returns {Array} - Search history
   */
  getSearchHistory() {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  clearHistory() {
    this.searchHistory = [];
    this.persistSearchHistory();
  }

  /**
   * Get popular searches from history
   * @param {number} limit - Number of results
   * @returns {Array} - Popular search queries
   */
  getPopularSearches(limit = 5) {
    const frequency = {};
    this.searchHistory.forEach((h) => {
      frequency[h.query] = (frequency[h.query] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.currentFilters = {};
    this.searchResults = [];
  }

  /**
   * Get active filter count
   * @returns {number} - Number of active filters
   */
  getActiveFilterCount() {
    return Object.keys(this.currentFilters).filter((key) => {
      const value = this.currentFilters[key];
      if (Array.isArray(value)) {return value.length > 0;}
      if (typeof value === 'string') {return value.trim().length > 0;}
      return value !== undefined && value !== null;
    }).length;
  }

  /**
   * Export search results to CSV
   * @param {Array} results - Search results
   * @returns {string} - CSV content
   */
  exportToCSV(results = this.searchResults) {
    if (!results || results.length === 0) {return '';}

    const headers = [
      'Fond',
      'Kategorie',
      'Aktuální cena',
      'Změna %',
      'Aktuální hodnota',
      'Poznámka',
    ];
    const rows = results.map((item) => [
      item.fond || '',
      item.kategorie || '',
      item.aktuálníCena || '',
      item.změnaProcenta || '',
      item.aktuálníHodnota || '',
      (item.poznámka || '').replace(/"/g, '""'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Load search history from localStorage
   * @returns {Array} - Search history
   */
  loadSearchHistory() {
    try {
      const stored = localStorage.getItem('portfolio_search_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  }

  /**
   * Persist search history to localStorage
   */
  persistSearchHistory() {
    try {
      localStorage.setItem('portfolio_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  /**
   * Load saved searches from localStorage
   * @returns {Array} - Saved searches
   */
  loadSavedSearches() {
    try {
      const stored = localStorage.getItem('portfolio_saved_searches');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      return [];
    }
  }

  /**
   * Persist saved searches to localStorage
   */
  persistSavedSearches() {
    try {
      localStorage.setItem('portfolio_saved_searches', JSON.stringify(this.savedSearches));
    } catch (error) {
      console.error('Failed to save searches:', error);
    }
  }

  /**
   * Get search suggestions based on input
   * @param {string} input - Partial search query
   * @param {Array} data - Portfolio data for suggestions
   * @returns {Array} - Suggested search terms
   */
  getSuggestions(input, data) {
    if (!input || input.length < 2) {return [];}

    const lowerInput = input.toLowerCase();
    const suggestions = new Set();

    // Add from search history
    this.searchHistory.forEach((h) => {
      if (h.query.toLowerCase().includes(lowerInput)) {
        suggestions.add(h.query);
      }
    });

    // Add from data
    data.forEach((item) => {
      const fields = [item.fond, item.kategorie, item.ticker, item.správce];
      fields.forEach((field) => {
        if (field && field.toLowerCase().includes(lowerInput)) {
          suggestions.add(field);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }
}

// Global search engine instance
window.searchEngine = new SearchEngine();

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearchUI);
} else {
  initSearchUI();
}

function initSearchUI() {
  // Create search UI elements
  createAdvancedSearchPanel();
  createSavedSearchesPanel();
  attachSearchEventListeners();
}

/**
 * Create advanced search panel
 */
function createAdvancedSearchPanel() {
  const existingPanel = document.getElementById('advanced-search-panel');
  if (existingPanel) {return;}

  const panel = document.createElement('div');
  panel.id = 'advanced-search-panel';
  panel.className = 'search-panel hidden';
  panel.innerHTML = `
    <div class="search-panel-header">
      <h3>🔍 Pokročilé vyhledávání</h3>
      <button id="close-search-panel" class="btn-icon" aria-label="Zavřít">✕</button>
    </div>
    
    <div class="search-panel-content">
      <!-- Main search -->
      <div class="search-group">
        <label for="main-search-input">Hledat v portfoliu:</label>
        <div class="search-input-wrapper">
          <input type="text" id="main-search-input" placeholder="Název fondu, kategorie, ticker..." />
          <button id="clear-search" class="btn-icon" title="Vymazat">✕</button>
        </div>
        <div id="search-suggestions" class="suggestions-list hidden"></div>
      </div>

      <!-- Category filter -->
      <div class="filter-group">
        <label>Kategorie:</label>
        <div id="category-filters" class="checkbox-group"></div>
      </div>

      <!-- Price range -->
      <div class="filter-group">
        <label>Rozsah ceny:</label>
        <div class="range-inputs">
          <input type="number" id="min-price" placeholder="Min" step="0.01" />
          <span>—</span>
          <input type="number" id="max-price" placeholder="Max" step="0.01" />
        </div>
      </div>

      <!-- Change % range -->
      <div class="filter-group">
        <label>Změna (%):</label>
        <div class="range-inputs">
          <input type="number" id="min-change" placeholder="Min" step="0.1" />
          <span>—</span>
          <input type="number" id="max-change" placeholder="Max" step="0.1" />
        </div>
      </div>

      <!-- Date range -->
      <div class="filter-group">
        <label>Datum nákupu:</label>
        <div class="range-inputs">
          <input type="date" id="start-date" />
          <span>—</span>
          <input type="date" id="end-date" />
        </div>
      </div>

      <!-- Has notes filter -->
      <div class="filter-group">
        <label>
          <input type="checkbox" id="has-notes-filter" />
          Pouze s poznámkami
        </label>
      </div>

      <!-- Action buttons -->
      <div class="search-actions">
        <button id="apply-filters" class="btn-primary">Použít filtry</button>
        <button id="clear-filters" class="btn-secondary">Vymazat vše</button>
        <button id="save-current-search" class="btn-secondary">💾 Uložit hledání</button>
        <button id="export-results" class="btn-secondary">📤 Export CSV</button>
      </div>

      <!-- Results summary -->
      <div id="search-results-summary" class="results-summary hidden">
        <span id="results-count">0</span> výsledků
        <span id="active-filters-count" class="badge hidden">0 filtrů</span>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
}

/**
 * Create saved searches panel
 */
function createSavedSearchesPanel() {
  const existingPanel = document.getElementById('saved-searches-panel');
  if (existingPanel) {return;}

  const panel = document.createElement('div');
  panel.id = 'saved-searches-panel';
  panel.className = 'saved-searches-panel hidden';
  panel.innerHTML = `
    <div class="panel-header">
      <h3>💾 Uložená hledání</h3>
      <button id="close-saved-searches" class="btn-icon" aria-label="Zavřít">✕</button>
    </div>
    <div id="saved-searches-list" class="saved-searches-list">
      <p class="empty-message">Žádná uložená hledání</p>
    </div>
  `;

  document.body.appendChild(panel);
}

/**
 * Attach event listeners to search UI
 */
function attachSearchEventListeners() {
  // Main search input with debounce
  let searchTimeout;
  const mainSearchInput = document.getElementById('main-search-input');
  if (mainSearchInput) {
    mainSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch();
        updateSuggestions(e.target.value);
      }, 300);
    });

    // Keyboard navigation for suggestions
    mainSearchInput.addEventListener('keydown', handleSuggestionNavigation);
  }

  // Apply filters button
  const applyBtn = document.getElementById('apply-filters');
  if (applyBtn) {
    applyBtn.addEventListener('click', performSearch);
  }

  // Clear filters button
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllFilters);
  }

  // Save search button
  const saveBtn = document.getElementById('save-current-search');
  if (saveBtn) {
    saveBtn.addEventListener('click', promptSaveSearch);
  }

  // Export button
  const exportBtn = document.getElementById('export-results');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportSearchResults);
  }

  // Close panels
  const closeSearchBtn = document.getElementById('close-search-panel');
  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      document.getElementById('advanced-search-panel').classList.add('hidden');
    });
  }

  // Keyboard shortcut: Ctrl+F or Cmd+F
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      toggleSearchPanel();
    }
  });
}

/**
 * Toggle search panel visibility
 */
function toggleSearchPanel() {
  const panel = document.getElementById('advanced-search-panel');
  if (panel) {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      document.getElementById('main-search-input')?.focus();
      updateCategoryFilters();
    }
  }
}

/**
 * Perform search with current filters
 */
function performSearch() {
  const filters = collectFilters();
  const portfolioData = window.getFondyData ? window.getFondyData() : [];

  const results = window.searchEngine.applyFilters(portfolioData, filters);

  // Update UI with results
  if (typeof window.renderTable === 'function') {
    window.renderTable(results);
  }

  updateResultsSummary(results.length);
}

/**
 * Collect filter values from UI
 * @returns {Object} - Filter configuration
 */
function collectFilters() {
  return {
    searchQuery: document.getElementById('main-search-input')?.value || '',
    kategorie: Array.from(document.querySelectorAll('#category-filters input:checked')).map(
      (cb) => cb.value
    ),
    minPrice: document.getElementById('min-price')?.value || undefined,
    maxPrice: document.getElementById('max-price')?.value || undefined,
    minChange: document.getElementById('min-change')?.value || undefined,
    maxChange: document.getElementById('max-change')?.value || undefined,
    startDate: document.getElementById('start-date')?.value || undefined,
    endDate: document.getElementById('end-date')?.value || undefined,
    hasNotes: document.getElementById('has-notes-filter')?.checked || false,
  };
}

/**
 * Clear all filters and reset UI
 */
function clearAllFilters() {
  window.searchEngine.clearFilters();

  // Reset UI elements
  document.getElementById('main-search-input').value = '';
  document.querySelectorAll('#category-filters input').forEach((cb) => (cb.checked = false));
  document.getElementById('min-price').value = '';
  document.getElementById('max-price').value = '';
  document.getElementById('min-change').value = '';
  document.getElementById('max-change').value = '';
  document.getElementById('start-date').value = '';
  document.getElementById('end-date').value = '';
  document.getElementById('has-notes-filter').checked = false;

  // Rerender full table
  if (typeof window.renderTable === 'function') {
    const portfolioData = window.getFondyData ? window.getFondyData() : [];
    window.renderTable(portfolioData);
  }

  updateResultsSummary(0);
}

/**
 * Update category filter checkboxes
 */
function updateCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) {return;}

  const portfolioData = window.getFondyData ? window.getFondyData() : [];
  const categories = [...new Set(portfolioData.map((item) => item.kategorie).filter(Boolean))];

  container.innerHTML = categories
    .map(
      (cat) => `
    <label>
      <input type="checkbox" value="${cat}" />
      ${cat}
    </label>
  `
    )
    .join('');
}

/**
 * Update results summary display
 * @param {number} count - Number of results
 */
function updateResultsSummary(count) {
  const summary = document.getElementById('search-results-summary');
  const countEl = document.getElementById('results-count');
  const filtersEl = document.getElementById('active-filters-count');

  if (summary && countEl) {
    countEl.textContent = count;
    summary.classList.remove('hidden');

    const activeCount = window.searchEngine.getActiveFilterCount();
    if (filtersEl) {
      filtersEl.textContent = `${activeCount} filtrů`;
      filtersEl.classList.toggle('hidden', activeCount === 0);
    }
  }
}

/**
 * Prompt user to save current search
 */
function promptSaveSearch() {
  const name = prompt('Zadejte název pro toto hledání:');
  if (name) {
    const success = window.searchEngine.saveSearch(name);
    if (success) {
      alert(`✅ Hledání "${name}" bylo uloženo`);
      updateSavedSearchesList();
    }
  }
}

/**
 * Update saved searches list UI
 */
function updateSavedSearchesList() {
  const listEl = document.getElementById('saved-searches-list');
  if (!listEl) {return;}

  const searches = window.searchEngine.getSavedSearches();

  if (searches.length === 0) {
    listEl.innerHTML = '<p class="empty-message">Žádná uložená hledání</p>';
    return;
  }

  listEl.innerHTML = searches
    .map(
      (search) => `
    <div class="saved-search-item">
      <div class="search-info">
        <strong>${search.name}</strong>
        <small>Použito ${search.usageCount}× | ${new Date(search.createdAt).toLocaleDateString()}</small>
      </div>
      <div class="search-actions">
        <button onclick="loadSavedSearch('${search.name}')" class="btn-small">Načíst</button>
        <button onclick="deleteSavedSearch('${search.name}')" class="btn-small btn-danger">Smazat</button>
      </div>
    </div>
  `
    )
    .join('');
}

/**
 * Load saved search by name
 * @param {string} name - Search name
 */
window.loadSavedSearch = function (name) {
  const filters = window.searchEngine.loadSearch(name);
  if (filters) {
    applyFiltersToUI(filters);
    performSearch();
  }
};

/**
 * Delete saved search
 * @param {string} name - Search name
 */
window.deleteSavedSearch = function (name) {
  if (confirm(`Opravdu smazat hledání "${name}"?`)) {
    window.searchEngine.deleteSearch(name);
    updateSavedSearchesList();
  }
};

/**
 * Apply filters to UI elements
 * @param {Object} filters - Filter configuration
 */
function applyFiltersToUI(filters) {
  document.getElementById('main-search-input').value = filters.searchQuery || '';

  if (filters.kategorie) {
    document.querySelectorAll('#category-filters input').forEach((cb) => {
      cb.checked = filters.kategorie.includes(cb.value);
    });
  }

  document.getElementById('min-price').value = filters.minPrice || '';
  document.getElementById('max-price').value = filters.maxPrice || '';
  document.getElementById('min-change').value = filters.minChange || '';
  document.getElementById('max-change').value = filters.maxChange || '';
  document.getElementById('start-date').value = filters.startDate || '';
  document.getElementById('end-date').value = filters.endDate || '';
  document.getElementById('has-notes-filter').checked = filters.hasNotes || false;
}

/**
 * Export search results to CSV
 */
function exportSearchResults() {
  const csv = window.searchEngine.exportToCSV();
  if (!csv) {
    alert('Žádné výsledky k exportu');
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `portfolio-search-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

/**
 * Update search suggestions
 * @param {string} input - Search input value
 */
function updateSuggestions(input) {
  const suggestionsEl = document.getElementById('search-suggestions');
  if (!suggestionsEl) {return;}

  if (!input || input.length < 2) {
    suggestionsEl.classList.add('hidden');
    return;
  }

  const portfolioData = window.getFondyData ? window.getFondyData() : [];
  const suggestions = window.searchEngine.getSuggestions(input, portfolioData);

  if (suggestions.length === 0) {
    suggestionsEl.classList.add('hidden');
    return;
  }

  suggestionsEl.innerHTML = suggestions
    .map((s) => `<div class="suggestion-item" data-value="${s}">${s}</div>`)
    .join('');

  suggestionsEl.classList.remove('hidden');

  // Click handler for suggestions
  suggestionsEl.querySelectorAll('.suggestion-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.getElementById('main-search-input').value = item.dataset.value;
      suggestionsEl.classList.add('hidden');
      performSearch();
    });
  });
}

/**
 * Handle keyboard navigation in suggestions
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleSuggestionNavigation(e) {
  const suggestionsEl = document.getElementById('search-suggestions');
  if (!suggestionsEl || suggestionsEl.classList.contains('hidden')) {return;}

  const items = suggestionsEl.querySelectorAll('.suggestion-item');
  const activeItem = suggestionsEl.querySelector('.suggestion-item.active');
  let activeIndex = Array.from(items).indexOf(activeItem);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % items.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
  } else if (e.key === 'Enter' && activeItem) {
    e.preventDefault();
    activeItem.click();
    return;
  } else if (e.key === 'Escape') {
    suggestionsEl.classList.add('hidden');
    return;
  } else {
    return;
  }

  items.forEach((item) => item.classList.remove('active'));
  items[activeIndex]?.classList.add('active');
}
