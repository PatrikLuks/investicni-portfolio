/**
 * Compliance Panel - Phase 6 UI Integration
 * Displays regulatory compliance status
 * @module compliance-panel
 */

import RegulatoryComplianceModule from '../../utilities/regulatory-compliance.js';
import { logError, logInfo } from '../../utilities/logger.js';

class CompliancePanel {
  constructor(elementId = 'compliance-panel') {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      logError('CompliancePanel: Element not found', { elementId });
      return;
    }
    this.compliance = new RegulatoryComplianceModule();
    this.currentStatus = null;
    this.init();
  }

  /**
   * Initialize panel structure
   */
  init() {
    this.createPanelHTML();
    this.attachEventListeners();
  }

  /**
   * Create panel HTML structure
   */
  createPanelHTML() {
    this.element.innerHTML = `
      <div class="compliance-panel-container">
        <div class="compliance-panel-header">
          <h2>🔐 Regulační soulad</h2>
          <button class="compliance-panel-refresh" title="Obnovit ověření">↻</button>
        </div>
        
        <div class="compliance-frameworks">
          <!-- UCITS -->
          <div class="compliance-framework">
            <div class="framework-header">
              <div class="framework-icon">📋</div>
              <div class="framework-info">
                <h3>UCITS Direktiva</h3>
                <p>Harmonizované předpisy investičních fondů</p>
              </div>
            </div>
            <div class="framework-status" id="ucitsStatus">
              <div class="status-badge unknown">Nevyhodnoceno</div>
            </div>
            <div class="framework-details" id="ucitsDetails"></div>
          </div>
          
          <!-- ESMA -->
          <div class="compliance-framework">
            <div class="framework-header">
              <div class="framework-icon">🛡️</div>
              <div class="framework-info">
                <h3>ESMA Směrnice</h3>
                <p>Jednotlivá pravidla pro asset management</p>
              </div>
            </div>
            <div class="framework-status" id="esmaStatus">
              <div class="status-badge unknown">Nevyhodnoceno</div>
            </div>
            <div class="framework-details" id="esmaDetails"></div>
          </div>
          
          <!-- MiFID II -->
          <div class="compliance-framework">
            <div class="framework-header">
              <div class="framework-icon">📜</div>
              <div class="framework-info">
                <h3>MiFID II Nařízení</h3>
                <p>Regulace trhů s finančními nástroji</p>
              </div>
            </div>
            <div class="framework-status" id="mifidStatus">
              <div class="status-badge unknown">Nevyhodnoceno</div>
            </div>
            <div class="framework-details" id="mifidDetails"></div>
          </div>
        </div>
        
        <!-- Overall Compliance -->
        <div class="compliance-summary">
          <h3>📊 Celkový status</h3>
          <div class="compliance-overview">
            <div class="compliance-score" id="complianceScore">-</div>
            <div class="compliance-message" id="complianceMessage">Analýza nebyla spuštěna</div>
          </div>
        </div>
        
        <div class="compliance-actions">
          <button class="compliance-export-btn" id="complianceExport">
            📄 Exportovat report
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const refreshBtn = this.element.querySelector('.compliance-panel-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    const exportBtn = this.element.querySelector('#complianceExport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }
  }

  /**
   * Update panel with portfolio data
   * @param {Array} portfolio - Portfolio items
   */
  updatePortfolio(portfolio) {
    try {
      if (!portfolio || portfolio.length === 0) {
        this.renderEmpty();
        return;
      }

      // Validate compliance
      const status = this.compliance.validateCompliance(portfolio);
      this.currentStatus = status;

      // Render status
      this.render(status);

      logInfo('CompliancePanel: Portfolio evaluated', {
        itemCount: portfolio.length,
        compliant: status.isFullyCompliant,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Render compliance status to DOM
   * @param {Object} status - Compliance status object
   */
  render(status) {
    try {
      // UCITS Status
      this.renderFrameworkStatus('ucits', status.ucits);

      // ESMA Status
      this.renderFrameworkStatus('esma', status.esma);

      // MiFID II Status
      this.renderFrameworkStatus('mifid', status.mifid2);

      // Overall status
      this.renderOverallStatus(status);
    } catch (error) {
      logError('CompliancePanel: Render error', error);
    }
  }

  /**
   * Render individual framework status
   * @param {string} framework - Framework name
   * @param {Object} data - Framework status data
   */
  renderFrameworkStatus(framework, data) {
    const statusEl = this.element.querySelector(`#${framework}Status`);
    if (!statusEl) {
      return;
    }

    const badge = statusEl.querySelector('.status-badge');
    if (badge) {
      badge.className = `status-badge ${data.compliant ? 'compliant' : 'violation'}`;
      badge.textContent = data.compliant ? '✓ Vyhovuje' : '✗ Porušení';
    }

    const detailsEl = this.element.querySelector(`#${framework}Details`);
    if (detailsEl && data.violations && data.violations.length > 0) {
      detailsEl.innerHTML = `
        <div class="violations-list">
          ${data.violations
            .map(
              (violation) => `
            <div class="violation-item">
              <span class="violation-icon">⚠️</span>
              <span class="violation-text">${violation}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else if (detailsEl) {
      detailsEl.innerHTML = '<div class="compliance-check">Všechny kontroly prošly ✓</div>';
    }
  }

  /**
   * Render overall compliance status
   * @param {Object} status - Compliance status object
   */
  renderOverallStatus(status) {
    const scoreEl = this.element.querySelector('#complianceScore');
    if (scoreEl) {
      const totalChecks = 3;
      const passedChecks = [
        status.ucits?.compliant,
        status.esma?.compliant,
        status.mifid2?.compliant,
      ].filter((v) => v).length;
      const percentage = Math.round((passedChecks / totalChecks) * 100);

      scoreEl.textContent = `${percentage}%`;
      scoreEl.className = this.getComplianceClass(percentage);
    }

    const messageEl = this.element.querySelector('#complianceMessage');
    if (messageEl) {
      if (status.isFullyCompliant) {
        messageEl.textContent = '✅ Portfolio plně vyhovuje všem regulacím';
      } else {
        const violations = [
          status.ucits?.violations?.length || 0,
          status.esma?.violations?.length || 0,
          status.mifid2?.violations?.length || 0,
        ].reduce((a, b) => a + b, 0);

        messageEl.textContent = `⚠️ Zjištěna ${violations} porušení regulací`;
      }
    }
  }

  /**
   * Get CSS class based on compliance score
   * @param {number} percentage - Compliance percentage
   * @returns {string} CSS class name
   */
  getComplianceClass(percentage) {
    if (percentage === 100) {
      return 'score-perfect';
    }
    if (percentage >= 66) {
      return 'score-good';
    }
    if (percentage >= 33) {
      return 'score-warning';
    }
    return 'score-critical';
  }

  /**
   * Render empty state
   */
  renderEmpty() {
    const scoreEl = this.element.querySelector('#complianceScore');
    if (scoreEl) {
      scoreEl.textContent = '-';
      scoreEl.className = 'score-unknown';
    }

    const messageEl = this.element.querySelector('#complianceMessage');
    if (messageEl) {
      messageEl.textContent = 'Žádné portfolio k analýze';
    }

    // Clear framework details
    ['ucits', 'esma', 'mifid'].forEach((framework) => {
      const badge = this.element.querySelector(`#${framework}Status .status-badge`);
      if (badge) {
        badge.className = 'status-badge unknown';
        badge.textContent = 'Nevyhodnoceno';
      }

      const detailsEl = this.element.querySelector(`#${framework}Details`);
      if (detailsEl) {
        detailsEl.innerHTML = '';
      }
    });
  }

  /**
   * Refresh compliance check
   */
  refresh() {
    const refreshBtn = this.element.querySelector('.compliance-panel-refresh');
    if (refreshBtn) {
      refreshBtn.classList.add('rotating');
      setTimeout(() => refreshBtn.classList.remove('rotating'), 600);
    }
  }

  /**
   * Export compliance report
   */
  exportReport() {
    if (!this.currentStatus) {
      logError('CompliancePanel: No data to export');
      return;
    }

    try {
      const report = {
        generated: new Date().toISOString(),
        compliance: this.currentStatus,
      };

      const json = JSON.stringify(report, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${Date.now()}.json`;
      a.click();

      logInfo('CompliancePanel: Report exported');
    } catch (error) {
      logError('CompliancePanel: Export failed', error);
    }
  }

  /**
   * Handle errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    logError('CompliancePanel: Error', error);
    const messageEl = this.element.querySelector('#complianceMessage');
    if (messageEl) {
      messageEl.textContent = '❌ Chyba při ověřování souladu';
    }
  }

  /**
   * Get current status
   * @returns {Object} Current compliance status
   */
  getStatus() {
    return this.currentStatus;
  }
}

export { CompliancePanel };
