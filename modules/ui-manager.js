/**
 * UI MANAGER MODULE
 * Handles UI interactions, dialogs, notifications, and visual feedback
 */

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
