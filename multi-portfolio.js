/**
 * Multi-Portfolio Management System
 * Version: 3.1.0
 * Manage multiple portfolios with hierarchy and aggregation
 */

class PortfolioManager {
  constructor() {
    this.portfolios = new Map();
    this.currentPortfolioId = null;
    this.loadPortfolios();
  }

  loadPortfolios() {
    const saved = localStorage.getItem('portfolios');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        data.forEach((portfolio) => {
          this.portfolios.set(portfolio.id, portfolio);
        });

        // Set current portfolio
        const currentId = localStorage.getItem('currentPortfolioId');
        if (currentId && this.portfolios.has(currentId)) {
          this.currentPortfolioId = currentId;
        } else if (this.portfolios.size > 0) {
          this.currentPortfolioId = this.portfolios.keys().next().value;
        }
      } catch (e) {
        console.error('Failed to load portfolios:', e);
        this.createDefaultPortfolio();
      }
    } else {
      this.createDefaultPortfolio();
    }
  }

  savePortfolios() {
    const data = Array.from(this.portfolios.values());
    localStorage.setItem('portfolios', JSON.stringify(data));

    if (this.currentPortfolioId) {
      localStorage.setItem('currentPortfolioId', this.currentPortfolioId);
    }
  }

  createDefaultPortfolio() {
    const defaultPortfolio = {
      id: this.generateId(),
      name: 'Main Portfolio',
      description: 'My primary investment portfolio',
      currency: 'CZK',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      investments: [],
      tags: [],
      color: '#3b82f6',
    };

    this.portfolios.set(defaultPortfolio.id, defaultPortfolio);
    this.currentPortfolioId = defaultPortfolio.id;
    this.savePortfolios();
  }

  generateId() {
    return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createPortfolio(name, options = {}) {
    const portfolio = {
      id: this.generateId(),
      name: name,
      description: options.description || '',
      currency: options.currency || 'CZK',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      investments: [],
      tags: options.tags || [],
      color: options.color || this.getRandomColor(),
    };

    this.portfolios.set(portfolio.id, portfolio);
    this.savePortfolios();

    return portfolio;
  }

  deletePortfolio(portfolioId) {
    if (this.portfolios.size <= 1) {
      throw new Error('Cannot delete the last portfolio');
    }

    if (!this.portfolios.has(portfolioId)) {
      throw new Error('Portfolio not found');
    }

    this.portfolios.delete(portfolioId);

    // Switch to another portfolio if current was deleted
    if (this.currentPortfolioId === portfolioId) {
      this.currentPortfolioId = this.portfolios.keys().next().value;
    }

    this.savePortfolios();
  }

  updatePortfolio(portfolioId, updates) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    Object.assign(portfolio, updates, {
      modified: new Date().toISOString(),
    });

    this.savePortfolios();
    return portfolio;
  }

  getPortfolio(portfolioId) {
    return this.portfolios.get(portfolioId);
  }

  getCurrentPortfolio() {
    return this.portfolios.get(this.currentPortfolioId);
  }

  getAllPortfolios() {
    return Array.from(this.portfolios.values());
  }

  switchPortfolio(portfolioId) {
    if (!this.portfolios.has(portfolioId)) {
      throw new Error('Portfolio not found');
    }

    this.currentPortfolioId = portfolioId;
    this.savePortfolios();

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent('portfolioSwitched', {
        detail: { portfolioId },
      })
    );
  }

  // Investment operations
  addInvestment(portfolioId, investment) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    investment.id = this.generateId();
    investment.addedDate = new Date().toISOString();
    portfolio.investments.push(investment);
    portfolio.modified = new Date().toISOString();

    this.savePortfolios();
    return investment;
  }

  updateInvestment(portfolioId, investmentId, updates) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const investment = portfolio.investments.find((inv) => inv.id === investmentId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    Object.assign(investment, updates);
    portfolio.modified = new Date().toISOString();

    this.savePortfolios();
    return investment;
  }

  deleteInvestment(portfolioId, investmentId) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const index = portfolio.investments.findIndex((inv) => inv.id === investmentId);
    if (index === -1) {
      throw new Error('Investment not found');
    }

    portfolio.investments.splice(index, 1);
    portfolio.modified = new Date().toISOString();

    this.savePortfolios();
  }

  // Aggregate analytics
  getAggregateStats() {
    let totalValue = 0;
    let totalInvestment = 0;
    let totalInvestments = 0;

    this.portfolios.forEach((portfolio) => {
      portfolio.investments.forEach((inv) => {
        const invested = inv.shares * inv.purchasePrice;
        const current = inv.shares * (inv.currentPrice || inv.purchasePrice);

        totalInvestment += invested;
        totalValue += current;
        totalInvestments++;
      });
    });

    const totalProfit = totalValue - totalInvestment;
    const totalProfitPercent = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    return {
      portfolioCount: this.portfolios.size,
      totalInvestments,
      totalValue,
      totalInvestment,
      totalProfit,
      totalProfitPercent,
    };
  }

  getPortfolioStats(portfolioId) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    let totalValue = 0;
    let totalInvestment = 0;

    portfolio.investments.forEach((inv) => {
      const invested = inv.shares * inv.purchasePrice;
      const current = inv.shares * (inv.currentPrice || inv.purchasePrice);

      totalInvestment += invested;
      totalValue += current;
    });

    const totalProfit = totalValue - totalInvestment;
    const totalProfitPercent = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    return {
      name: portfolio.name,
      investmentCount: portfolio.investments.length,
      totalValue,
      totalInvestment,
      totalProfit,
      totalProfitPercent,
    };
  }

  // Import/Export
  exportPortfolio(portfolioId) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    return JSON.stringify(portfolio, null, 2);
  }

  importPortfolio(jsonData) {
    try {
      const portfolio = JSON.parse(jsonData);

      // Generate new ID to avoid conflicts
      portfolio.id = this.generateId();
      portfolio.imported = new Date().toISOString();

      this.portfolios.set(portfolio.id, portfolio);
      this.savePortfolios();

      return portfolio;
    } catch (e) {
      throw new Error('Invalid portfolio data: ' + e.message);
    }
  }

  // Duplicate portfolio
  duplicatePortfolio(portfolioId) {
    const original = this.portfolios.get(portfolioId);
    if (!original) {
      throw new Error('Portfolio not found');
    }

    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = this.generateId();
    duplicate.name = `${original.name} (Copy)`;
    duplicate.created = new Date().toISOString();
    duplicate.modified = new Date().toISOString();

    // Generate new IDs for investments
    duplicate.investments.forEach((inv) => {
      inv.id = this.generateId();
    });

    this.portfolios.set(duplicate.id, duplicate);
    this.savePortfolios();

    return duplicate;
  }

  getRandomColor() {
    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#06b6d4',
      '#f97316',
      '#14b8a6',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Search across all portfolios
  searchInvestments(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    this.portfolios.forEach((portfolio) => {
      portfolio.investments.forEach((investment) => {
        const matches =
          investment.name?.toLowerCase().includes(lowerQuery) ||
          investment.symbol?.toLowerCase().includes(lowerQuery) ||
          investment.sector?.toLowerCase().includes(lowerQuery);

        if (matches) {
          results.push({
            portfolioId: portfolio.id,
            portfolioName: portfolio.name,
            investment: investment,
          });
        }
      });
    });

    return results;
  }
}

// Portfolio Selector UI Component
class PortfolioSelector {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.manager = window.portfolioManager;
    this.render();

    // Listen for portfolio changes
    window.addEventListener('portfolioSwitched', () => {
      this.render();
    });
  }

  render() {
    const currentPortfolio = this.manager.getCurrentPortfolio();
    const allPortfolios = this.manager.getAllPortfolios();

    this.container.innerHTML = `
      <div class="portfolio-selector">
        <div class="current-portfolio" onclick="togglePortfolioDropdown()">
          <span class="portfolio-color" style="background-color: ${currentPortfolio.color}"></span>
          <span class="portfolio-name">${currentPortfolio.name}</span>
          <span class="dropdown-arrow">▼</span>
        </div>
        
        <div class="portfolio-dropdown" id="portfolioDropdown" style="display: none;">
          <div class="dropdown-header">
            <h3>Portfolios</h3>
            <button class="btn-icon" onclick="openNewPortfolioModal()" title="New Portfolio">
              ➕
            </button>
          </div>
          
          <div class="portfolio-list">
            ${allPortfolios
              .map(
                (portfolio) => `
              <div class="portfolio-item ${portfolio.id === currentPortfolio.id ? 'active' : ''}" 
                   onclick="switchToPortfolio('${portfolio.id}')">
                <span class="portfolio-color" style="background-color: ${portfolio.color}"></span>
                <div class="portfolio-info">
                  <div class="portfolio-name">${portfolio.name}</div>
                  <div class="portfolio-meta">
                    ${portfolio.investments.length} investments
                  </div>
                </div>
                <div class="portfolio-actions">
                  <button class="btn-icon-small" onclick="editPortfolio('${portfolio.id}'); event.stopPropagation();" title="Edit">
                    ✏️
                  </button>
                  ${
                    allPortfolios.length > 1
                      ? `
                    <button class="btn-icon-small" onclick="deletePortfolioConfirm('${portfolio.id}'); event.stopPropagation();" title="Delete">
                      🗑️
                    </button>
                  `
                      : ''
                  }
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          
          <div class="dropdown-footer">
            <button class="btn btn-secondary btn-small" onclick="openAggregateView()">
              📊 View All Portfolios
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Global functions for UI
window.togglePortfolioDropdown = function () {
  const dropdown = document.getElementById('portfolioDropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
};

window.switchToPortfolio = function (portfolioId) {
  window.portfolioManager.switchPortfolio(portfolioId);
  window.togglePortfolioDropdown();

  // Reload portfolio data
  if (typeof loadPortfolio === 'function') {
    loadPortfolio();
  }

  showToast('Portfolio switched', 'success');
};

window.openNewPortfolioModal = function () {
  const name = prompt('Enter portfolio name:');
  if (!name) return;

  const portfolio = window.portfolioManager.createPortfolio(name);
  showToast(`Portfolio "${portfolio.name}" created`, 'success');

  // Refresh selector
  if (window.portfolioSelector) {
    window.portfolioSelector.render();
  }
};

window.editPortfolio = function (portfolioId) {
  const portfolio = window.portfolioManager.getPortfolio(portfolioId);
  if (!portfolio) return;

  const newName = prompt('Enter new name:', portfolio.name);
  if (!newName) return;

  window.portfolioManager.updatePortfolio(portfolioId, { name: newName });
  showToast('Portfolio updated', 'success');

  if (window.portfolioSelector) {
    window.portfolioSelector.render();
  }
};

window.deletePortfolioConfirm = function (portfolioId) {
  const portfolio = window.portfolioManager.getPortfolio(portfolioId);
  if (!portfolio) return;

  if (!confirm(`Delete portfolio "${portfolio.name}"? This cannot be undone.`)) {
    return;
  }

  try {
    window.portfolioManager.deletePortfolio(portfolioId);
    showToast('Portfolio deleted', 'success');

    if (window.portfolioSelector) {
      window.portfolioSelector.render();
    }

    // Reload if current portfolio was deleted
    if (typeof loadPortfolio === 'function') {
      loadPortfolio();
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
};

window.openAggregateView = function () {
  const stats = window.portfolioManager.getAggregateStats();
  const allPortfolios = window.portfolioManager.getAllPortfolios();

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content aggregate-view">
      <div class="modal-header">
        <h2>📊 All Portfolios Overview</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="aggregate-summary">
          <div class="stat-card">
            <div class="stat-label">Total Portfolios</div>
            <div class="stat-value">${stats.portfolioCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Investments</div>
            <div class="stat-value">${stats.totalInvestments}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Value</div>
            <div class="stat-value">${formatCurrency(stats.totalValue)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Profit</div>
            <div class="stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(stats.totalProfit)} (${stats.totalProfitPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
        
        <h3>Portfolio Breakdown</h3>
        <div class="portfolio-breakdown">
          ${allPortfolios
            .map((portfolio) => {
              const pStats = window.portfolioManager.getPortfolioStats(portfolio.id);
              return `
                <div class="portfolio-card">
                  <div class="portfolio-header">
                    <span class="portfolio-color" style="background-color: ${portfolio.color}"></span>
                    <h4>${portfolio.name}</h4>
                  </div>
                  <div class="portfolio-stats">
                    <div class="stat-row">
                      <span>Investments:</span>
                      <span>${pStats.investmentCount}</span>
                    </div>
                    <div class="stat-row">
                      <span>Value:</span>
                      <span>${formatCurrency(pStats.totalValue)}</span>
                    </div>
                    <div class="stat-row">
                      <span>Profit:</span>
                      <span class="${pStats.totalProfit >= 0 ? 'positive' : 'negative'}">
                        ${formatCurrency(pStats.totalProfit)} (${pStats.totalProfitPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = 'flex';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioManager = new PortfolioManager();

  // Create selector if container exists
  const selectorContainer = document.getElementById('portfolioSelectorContainer');
  if (selectorContainer) {
    window.portfolioSelector = new PortfolioSelector('portfolioSelectorContainer');
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PortfolioManager, PortfolioSelector };
}
