/**
 * @module ui-manager
 * Handles UI interactions, dialogs, notifications, and visual feedback
 */

// ==================== TOAST NOTIFICATIONS ====================

/**
 * Show toast notification
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {number} [duration=4000] - Duration in milliseconds
 * @returns {void}
 */
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    return;
  }

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

/**
 * Show confirmation dialog with callbacks
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Callback on confirm
 * @param {Function} [onCancel] - Callback on cancel
 * @returns {void}
 */
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
    if (onConfirm) {
      onConfirm();
    }
  };

  cancelBtn.onclick = () => {
    cleanup();
    if (onCancel) {
      onCancel();
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      cleanup();
      if (onCancel) {
        onCancel();
      }
    }
  };
}

// ==================== LOADING OVERLAY ====================

/**
 * Show loading overlay
 * @returns {void}
 */
function showLoading() {
  // Prevent duplicate overlays
  if (document.getElementById('loadingOverlay')) {
    return;
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';
  overlay.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(overlay);
}

/**
 * Hide loading overlay
 * @returns {void}
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

// ==================== CHART EXPORT ====================

/**
 * Export chart canvas to PNG file
 * @param {HTMLElement} chartElement - Chart container element
 * @param {string} [filename='chart.png'] - Output filename
 * @returns {void}
 */
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
/** @type {Set<number>} */
const selectedRows = new Set();

/**
 * Update bulk actions bar visibility and count
 * @returns {void}
 */
function updateBulkActionsBar() {
  const bar = document.getElementById('bulkActionsBar');
  const count = document.getElementById('selectedCount');

  if (bar && count) {
    count.textContent = selectedRows.size;
    bar.classList.toggle('active', selectedRows.size > 0);
  }
}

/**
 * Toggle row selection state
 * @param {number} index - Row index
 * @param {boolean} checked - Checked state
 * @returns {void}
 */
function toggleRowSelection(index, checked) {
  if (checked) {
    selectedRows.add(index);
  } else {
    selectedRows.delete(index);
  }
  updateBulkActionsBar();
}

/**
 * Select or deselect all rows
 * @param {boolean} checked - Select all if true
 * @param {Array} portfolioData - Portfolio data array
 * @returns {void}
 */
function selectAllRows(checked, portfolioData = []) {
  selectedRows.clear();
  if (checked && portfolioData) {
    portfolioData.forEach((_, index) => selectedRows.add(index));
  }
  updateBulkActionsBar();
}

/**
 * Get set of selected row indexes
 * @returns {Set<number>} Selected row indexes
 */
function getSelectedRows() {
  return selectedRows;
}

/**
 * Clear all row selections
 * @returns {void}
 */
function clearSelectedRows() {
  selectedRows.clear();
  updateBulkActionsBar();
}

// ==================== ANIMATIONS ====================

/**
 * Animate numeric value with easing
 * @param {string} elementId - Target element ID
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Duration in milliseconds
 * @param {boolean} [isCurrency=false] - Format as currency
 * @returns {void}
 */
function animateValue(elementId, start, end, duration, isCurrency = false) {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

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
export {
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
};
