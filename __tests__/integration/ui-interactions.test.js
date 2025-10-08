/**
 * @jest-environment jsdom
 */
/**
 * Integration Tests - UI Interactions
 * Tests UI manager, event handlers, and DOM interactions
 */

import { showToast, showConfirmDialog, toggleRowSelection, getSelectedRows, clearSelectedRows } from '../../modules/ui-manager.js';

describe('UI Interactions Integration', () => {
  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <div id="toastContainer"></div>
      <div id="bulkActionsBar">
        <span id="selectedCount">0</span>
      </div>
      <table id="fondTable">
        <tbody></tbody>
      </table>
    `;
    // Clear any selections from previous tests
    clearSelectedRows();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    // Clear any overlays
    document.querySelectorAll('.confirm-overlay').forEach(el => el.remove());
    // Ensure selections are cleared
    clearSelectedRows();
  });

  describe('Toast Notifications', () => {
    test('should display success toast', () => {
      showToast('success', 'Test Title', 'Test Message');
      
      const toastContainer = document.getElementById('toastContainer');
      const toast = toastContainer.querySelector('.toast.success');
      
      expect(toast).not.toBeNull();
      expect(toast.textContent).toContain('Test Title');
      expect(toast.textContent).toContain('Test Message');
    });

    test('should display different toast types', () => {
      const types = ['success', 'error', 'warning', 'info'];
      
      types.forEach(type => {
        showToast(type, `${type} Title`, `${type} Message`);
      });

      const toastContainer = document.getElementById('toastContainer');
      types.forEach(type => {
        const toast = toastContainer.querySelector(`.toast.${type}`);
        expect(toast).not.toBeNull();
      });
    });

    test('should auto-remove toast after duration', (done) => {
      showToast('info', 'Auto Remove', 'This should disappear', 100);
      
      const toastContainer = document.getElementById('toastContainer');
      let toast = toastContainer.querySelector('.toast.info');
      expect(toast).not.toBeNull();

      setTimeout(() => {
        toast = toastContainer.querySelector('.toast.info');
        // Toast might be removed or have 'removing' class
        const isRemoving = toast?.classList.contains('removing') || toast === null;
        expect(isRemoving).toBe(true);
        done();
      }, 150);
    }, 1000);

    test('should allow manual toast removal', () => {
      showToast('success', 'Manual Remove', 'Click to close');
      
      const toastContainer = document.getElementById('toastContainer');
      const toast = toastContainer.querySelector('.toast.success');
      const closeBtn = toast.querySelector('.toast-close');
      
      expect(closeBtn).not.toBeNull();
      closeBtn.click();
      
      // Toast should be removed after click
      expect(toastContainer.querySelector('.toast.success')).toBeNull();
    });
  });

  describe('Confirmation Dialogs', () => {
    test('should display confirmation dialog', () => {
      const onConfirmMock = () => {};
      const onCancelMock = () => {};
      showConfirmDialog('Test Title', 'Test Message', onConfirmMock, onCancelMock);
      
      const overlay = document.querySelector('.confirm-overlay');
      expect(overlay).not.toBeNull();
      
      const dialog = overlay.querySelector('.confirm-dialog');
      expect(dialog.textContent).toContain('Test Title');
      expect(dialog.textContent).toContain('Test Message');
    });

    test('should call onConfirm when confirmed', (done) => {
      let onConfirmCalled = false;
      const onConfirm = () => { onConfirmCalled = true; };
      showConfirmDialog('Confirm', 'Are you sure?', onConfirm);
      
      const confirmBtn = document.querySelector('#confirmBtn');
      expect(confirmBtn).not.toBeNull();
      
      confirmBtn.click();
      
      setTimeout(() => {
        expect(onConfirmCalled).toBe(true);
        done();
      }, 300);
    }, 1000);

    test('should call onCancel when cancelled', (done) => {
      let onCancelCalled = false;
      const onCancel = () => { onCancelCalled = true; };
      showConfirmDialog('Cancel', 'Are you sure?', () => {}, onCancel);
      
      const cancelBtn = document.querySelector('#cancelBtn');
      expect(cancelBtn).not.toBeNull();
      
      cancelBtn.click();
      
      setTimeout(() => {
        expect(onCancelCalled).toBe(true);
        done();
      }, 300);
    }, 1000);

    test('should close dialog on overlay click', (done) => {
      showConfirmDialog('Overlay Close', 'Click outside', () => {}, () => {});
      
      const overlay = document.querySelector('.confirm-overlay');
      expect(overlay).not.toBeNull();
      
      // Simulate clicking the overlay itself (not the dialog)
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: overlay, enumerable: true });
      overlay.dispatchEvent(clickEvent);
      
      setTimeout(() => {
        const stillExists = document.querySelector('.confirm-overlay');
        expect(stillExists).toBeNull();
        done();
      }, 300);
    }, 1000);
  });

  describe('Bulk Selection', () => {
    test('should toggle row selection', () => {
      toggleRowSelection(0, true);
      expect(getSelectedRows().has(0)).toBe(true);
      
      toggleRowSelection(1, true);
      toggleRowSelection(2, true);
      expect(getSelectedRows().size).toBe(3);
      
      toggleRowSelection(1, false);
      expect(getSelectedRows().size).toBe(2);
      expect(getSelectedRows().has(1)).toBe(false);
    });

    test('should update bulk actions bar', () => {
      toggleRowSelection(0, true);
      toggleRowSelection(1, true);
      
      const selectedCount = document.getElementById('selectedCount');
      const bulkActionsBar = document.getElementById('bulkActionsBar');
      
      expect(selectedCount.textContent).toBe('2');
      expect(bulkActionsBar.classList.contains('active')).toBe(true);
    });

    test('should clear all selections', () => {
      toggleRowSelection(0, true);
      toggleRowSelection(1, true);
      toggleRowSelection(2, true);
      
      expect(getSelectedRows().size).toBe(3);
      
      clearSelectedRows();
      
      expect(getSelectedRows().size).toBe(0);
      
      const selectedCount = document.getElementById('selectedCount');
      expect(selectedCount.textContent).toBe('0');
    });

    test('should handle duplicate selections gracefully', () => {
      toggleRowSelection(0, true);
      toggleRowSelection(0, true); // Select same row again
      
      expect(getSelectedRows().size).toBe(1);
    });
  });

  describe('Loading Overlay', () => {
    test('should show and hide loading overlay', async () => {
      const { showLoading, hideLoading } = await import('../../modules/ui-manager.js');
      
      showLoading();
      let overlay = document.getElementById('loadingOverlay');
      expect(overlay).not.toBeNull();
      expect(overlay.classList.contains('loading-overlay')).toBe(true);
      
      hideLoading();
      overlay = document.getElementById('loadingOverlay');
      expect(overlay).toBeNull();
    });

    test('should handle multiple show/hide calls', async () => {
      const { showLoading, hideLoading } = await import('../../modules/ui-manager.js');
      
      // Show loading overlay
      showLoading();
      
      // Calling showLoading again should be safe (idempotent)
      // It won't create duplicate overlay due to ID check
      const firstOverlay = document.getElementById('loadingOverlay');
      expect(firstOverlay).not.toBeNull();
      
      showLoading(); // Call twice - should not break
      
      // Hide loading overlay
      hideLoading();
      
      const overlay = document.getElementById('loadingOverlay');
      expect(overlay).toBeNull();
    });
  });

  describe('Animation Value', () => {
    test('should animate numeric value', (done) => {
      document.body.innerHTML += '<div id="testValue">0</div>';
      
      import('../../modules/ui-manager.js').then(({ animateValue }) => {
        animateValue('testValue', 0, 100, 100, false);
        
        setTimeout(() => {
          const element = document.getElementById('testValue');
          const value = parseInt(element.textContent.replace(/\s/g, ''));
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThanOrEqual(100);
          done();
        }, 150);
      });
    }, 1000);

    test('should handle missing element gracefully', async () => {
      const { animateValue } = await import('../../modules/ui-manager.js');
      
      expect(() => {
        animateValue('nonExistentElement', 0, 100, 100);
      }).not.toThrow();
    });
  });

  describe('Chart Export', () => {
    test('should handle chart export', async () => {
      const { exportChartAsPNG } = await import('../../modules/ui-manager.js');
      
      // Create mock chart element with canvas
      const chartElement = document.createElement('div');
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      chartElement.appendChild(canvas);
      document.body.appendChild(chartElement);
      
      // Mock canvas toDataURL
      let toDataURLCalled = false;
      canvas.toDataURL = () => {
        toDataURLCalled = true;
        return 'data:image/png;base64,mock';
      };
      
      // Mock link click
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = (tagName) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = () => {};
        }
        return element;
      };
      
      exportChartAsPNG(chartElement, 'test-chart.png');
      
      expect(toDataURLCalled).toBe(true);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });

    test('should handle export failure gracefully', async () => {
      const { exportChartAsPNG } = await import('../../modules/ui-manager.js');
      
      const chartElement = document.createElement('div');
      // No canvas - should handle gracefully
      
      expect(() => {
        exportChartAsPNG(chartElement, 'test.png');
      }).not.toThrow();
    });
  });

  describe('DOM Manipulation Safety', () => {
    test('should handle missing DOM elements gracefully', async () => {
      document.body.innerHTML = ''; // Remove all elements
      
      const { showToast } = await import('../../modules/ui-manager.js');
      
      expect(() => {
        showToast('info', 'No Container', 'Should not throw');
      }).not.toThrow();
    });

    test('should handle rapid successive operations', () => {
      for (let i = 0; i < 10; i++) {
        toggleRowSelection(i, true);
      }
      
      expect(getSelectedRows().size).toBe(10);
      
      clearSelectedRows();
      expect(getSelectedRows().size).toBe(0);
    });
  });
});
