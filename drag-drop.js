/**
 * Drag & Drop Manager for Portfolio Manager
 * Features: HTML5 Drag & Drop API, touch support, visual feedback, row reordering
 */

class DragDropManager {
  constructor() {
    this.draggedElement = null;
    this.draggedIndex = null;
    this.dropIndicator = null;
    this.ghostElement = null;
    this.isDragging = false;
    this.touchStartY = 0;
    this.touchCurrentY = 0;
    this.scrollSpeed = 0;
    this.scrollInterval = null;
    this.onReorderCallback = null;

    this.init();
  }

  /**
   * Initialize drag & drop functionality
   */
  init() {
    this.createDropIndicator();
    this.createGhostElement();
    this.setupAutoScroll();
    console.log('✅ Drag & Drop Manager initialized');
  }

  /**
   * Create drop indicator element
   */
  createDropIndicator() {
    this.dropIndicator = document.createElement('div');
    this.dropIndicator.className = 'drop-indicator';
    this.dropIndicator.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      box-shadow: 0 0 8px rgba(102, 126, 234, 0.6);
      border-radius: 2px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 1000;
    `;
    document.body.appendChild(this.dropIndicator);
  }

  /**
   * Create ghost element for drag preview
   */
  createGhostElement() {
    this.ghostElement = document.createElement('div');
    this.ghostElement.className = 'drag-ghost';
    this.ghostElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      opacity: 0;
      z-index: 10000;
      transform: scale(0.95) rotate(-2deg);
      transition: opacity 0.2s ease;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      background: white;
      padding: 12px;
    `;
    document.body.appendChild(this.ghostElement);
  }

  /**
   * Enable drag & drop on table rows
   * @param {HTMLElement} tableBody - Table body element
   * @param {Function} onReorder - Callback when rows are reordered
   */
  enableOnTable(tableBody, onReorder) {
    if (!tableBody) {
      console.error('Table body element not found');
      return;
    }

    this.onReorderCallback = onReorder;

    // Add drag handles to existing rows
    this.addDragHandlesToRows(tableBody);

    // Observe for new rows
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'TR' && !node.querySelector('.drag-handle')) {
            this.addDragHandle(node);
          }
        });
      });
    });

    observer.observe(tableBody, { childList: true });

    console.log('✅ Drag & Drop enabled on table');
  }

  /**
   * Add drag handles to all rows
   * @param {HTMLElement} tableBody - Table body element
   */
  addDragHandlesToRows(tableBody) {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row) => {
      if (!row.querySelector('.drag-handle')) {
        this.addDragHandle(row);
      }
    });
  }

  /**
   * Add drag handle to a row
   * @param {HTMLElement} row - Table row element
   */
  addDragHandle(row) {
    // Create drag handle cell
    const handleCell = document.createElement('td');
    handleCell.className = 'drag-handle-cell';
    handleCell.style.cssText = `
      width: 40px;
      text-align: center;
      cursor: grab;
      user-select: none;
      padding: 0;
    `;

    const handleIcon = document.createElement('span');
    handleIcon.className = 'drag-handle';
    handleIcon.textContent = '⋮⋮';
    handleIcon.setAttribute('draggable', 'true');
    handleIcon.setAttribute('role', 'button');
    handleIcon.setAttribute('aria-label', 'Přetáhnout řádek');
    handleIcon.setAttribute('tabindex', '0');
    handleIcon.style.cssText = `
      display: inline-block;
      font-size: 1.2rem;
      color: #999;
      padding: 8px;
      transition: color 0.2s ease;
      cursor: grab;
    `;

    handleCell.appendChild(handleIcon);
    row.insertBefore(handleCell, row.firstChild);

    // Add drag event listeners
    this.attachDragListeners(row, handleIcon);

    // Add touch event listeners
    this.attachTouchListeners(row, handleIcon);

    // Keyboard support
    this.attachKeyboardListeners(row, handleIcon);
  }

  /**
   * Attach HTML5 drag event listeners
   * @param {HTMLElement} row - Table row
   * @param {HTMLElement} handle - Drag handle
   */
  attachDragListeners(row, handle) {
    handle.addEventListener('dragstart', (e) => {
      this.handleDragStart(e, row);
    });

    row.addEventListener('dragend', (e) => {
      this.handleDragEnd(e);
    });

    row.addEventListener('dragover', (e) => {
      this.handleDragOver(e, row);
    });

    row.addEventListener('dragenter', (e) => {
      this.handleDragEnter(e, row);
    });

    row.addEventListener('dragleave', (e) => {
      this.handleDragLeave(e);
    });

    row.addEventListener('drop', (e) => {
      this.handleDrop(e, row);
    });
  }

  /**
   * Attach touch event listeners for mobile
   * @param {HTMLElement} row - Table row
   * @param {HTMLElement} handle - Drag handle
   */
  attachTouchListeners(row, handle) {
    handle.addEventListener(
      'touchstart',
      (e) => {
        this.handleTouchStart(e, row);
      },
      { passive: false }
    );

    handle.addEventListener(
      'touchmove',
      (e) => {
        this.handleTouchMove(e, row);
      },
      { passive: false }
    );

    handle.addEventListener(
      'touchend',
      (e) => {
        this.handleTouchEnd(e);
      },
      { passive: false }
    );

    handle.addEventListener('touchcancel', (e) => {
      this.handleTouchEnd(e);
    });
  }

  /**
   * Attach keyboard event listeners for accessibility
   * @param {HTMLElement} row - Table row
   * @param {HTMLElement} handle - Drag handle
   */
  attachKeyboardListeners(row, handle) {
    handle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleKeyboardDrag(row);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.moveRowUp(row);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.moveRowDown(row);
      }
    });
  }

  /**
   * Handle drag start event
   * @param {DragEvent} e - Drag event
   * @param {HTMLElement} row - Table row
   */
  handleDragStart(e, row) {
    this.draggedElement = row;
    this.draggedIndex = this.getRowIndex(row);
    this.isDragging = true;

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', row.innerHTML);

    // Add dragging class
    row.classList.add('dragging');

    // Change cursor
    const handle = row.querySelector('.drag-handle');
    if (handle) {handle.style.cursor = 'grabbing';}

    // Create drag image
    this.createDragImage(e, row);

    console.log(`🎯 Drag started: Row ${this.draggedIndex}`);
  }

  /**
   * Handle drag over event
   * @param {DragEvent} e - Drag event
   * @param {HTMLElement} row - Table row
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle drag enter event
   * @param {DragEvent} e - Drag event
   * @param {HTMLElement} row - Target row
   */
  handleDragEnter(e, row) {
    if (!this.isDragging || row === this.draggedElement) {return;}

    e.preventDefault();

    // Show drop indicator
    this.showDropIndicator(row);
  }

  /**
   * Handle drag leave event
   * @param {DragEvent} e - Drag event
   */
  handleDragLeave(e) {
    // Hide drop indicator when leaving
    if (e.target.tagName === 'TR') {
      this.hideDropIndicator();
    }
  }

  /**
   * Handle drop event
   * @param {DragEvent} e - Drag event
   * @param {HTMLElement} targetRow - Target row
   */
  handleDrop(e, targetRow) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedElement || targetRow === this.draggedElement) {return;}

    const targetIndex = this.getRowIndex(targetRow);

    // Reorder rows
    this.reorderRows(this.draggedIndex, targetIndex);

    // Trigger callback
    if (this.onReorderCallback) {
      this.onReorderCallback(this.draggedIndex, targetIndex);
    }

    console.log(`✅ Dropped: Row ${this.draggedIndex} → ${targetIndex}`);
  }

  /**
   * Handle drag end event
   * @param {DragEvent} e - Drag event
   */
  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');

      const handle = this.draggedElement.querySelector('.drag-handle');
      if (handle) {handle.style.cursor = 'grab';}
    }

    this.hideDropIndicator();
    this.hideGhostElement();
    this.stopAutoScroll();

    this.draggedElement = null;
    this.draggedIndex = null;
    this.isDragging = false;

    console.log('🏁 Drag ended');
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch event
   * @param {HTMLElement} row - Table row
   */
  handleTouchStart(e, row) {
    e.preventDefault();

    this.draggedElement = row;
    this.draggedIndex = this.getRowIndex(row);
    this.isDragging = true;
    this.touchStartY = e.touches[0].clientY;

    row.classList.add('dragging');

    // Show ghost element
    this.showGhostElement(row, e.touches[0].clientX, e.touches[0].clientY);

    console.log(`📱 Touch drag started: Row ${this.draggedIndex}`);
  }

  /**
   * Handle touch move event
   * @param {TouchEvent} e - Touch event
   * @param {HTMLElement} row - Table row
   */
  handleTouchMove(e, row) {
    if (!this.isDragging) {return;}

    e.preventDefault();

    this.touchCurrentY = e.touches[0].clientY;

    // Move ghost element
    this.moveGhostElement(e.touches[0].clientX, e.touches[0].clientY);

    // Find element under touch
    const elementBelow = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);

    const targetRow = elementBelow?.closest('tr');
    if (targetRow && targetRow !== this.draggedElement) {
      this.showDropIndicator(targetRow);
    }

    // Auto-scroll
    this.handleAutoScroll(e.touches[0].clientY);
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(e) {
    if (!this.isDragging) {return;}

    // Find final drop target
    const elementBelow = document.elementFromPoint(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    );

    const targetRow = elementBelow?.closest('tr');
    if (targetRow && targetRow !== this.draggedElement) {
      const targetIndex = this.getRowIndex(targetRow);
      this.reorderRows(this.draggedIndex, targetIndex);

      if (this.onReorderCallback) {
        this.onReorderCallback(this.draggedIndex, targetIndex);
      }

      console.log(`✅ Touch dropped: Row ${this.draggedIndex} → ${targetIndex}`);
    }

    // Clean up
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }

    this.hideDropIndicator();
    this.hideGhostElement();
    this.stopAutoScroll();

    this.draggedElement = null;
    this.draggedIndex = null;
    this.isDragging = false;

    console.log('🏁 Touch drag ended');
  }

  /**
   * Create custom drag image
   * @param {DragEvent} e - Drag event
   * @param {HTMLElement} row - Table row
   */
  createDragImage(e, row) {
    const clone = row.cloneNode(true);
    clone.style.cssText = `
      position: absolute;
      top: -1000px;
      width: ${row.offsetWidth}px;
      opacity: 0.8;
      background: white;
      border: 2px dashed #667eea;
      border-radius: 8px;
    `;
    document.body.appendChild(clone);

    e.dataTransfer.setDragImage(clone, e.offsetX, e.offsetY);

    setTimeout(() => clone.remove(), 0);
  }

  /**
   * Show ghost element for touch drag
   * @param {HTMLElement} row - Table row
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showGhostElement(row, x, y) {
    this.ghostElement.innerHTML = row.innerHTML;
    this.ghostElement.style.width = `${row.offsetWidth}px`;
    this.ghostElement.style.left = `${x - row.offsetWidth / 2}px`;
    this.ghostElement.style.top = `${y - 30}px`;
    this.ghostElement.style.opacity = '0.8';
  }

  /**
   * Move ghost element
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  moveGhostElement(x, y) {
    this.ghostElement.style.left = `${x - this.ghostElement.offsetWidth / 2}px`;
    this.ghostElement.style.top = `${y - 30}px`;
  }

  /**
   * Hide ghost element
   */
  hideGhostElement() {
    this.ghostElement.style.opacity = '0';
  }

  /**
   * Show drop indicator
   * @param {HTMLElement} row - Target row
   */
  showDropIndicator(row) {
    const rect = row.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.dropIndicator.style.top = `${rect.top + scrollTop - 2}px`;
    this.dropIndicator.style.opacity = '1';
  }

  /**
   * Hide drop indicator
   */
  hideDropIndicator() {
    this.dropIndicator.style.opacity = '0';
  }

  /**
   * Get row index in table
   * @param {HTMLElement} row - Table row
   * @returns {number} - Row index
   */
  getRowIndex(row) {
    return Array.from(row.parentNode.children).indexOf(row);
  }

  /**
   * Reorder rows in DOM
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Target index
   */
  reorderRows(fromIndex, toIndex) {
    const tbody = this.draggedElement.parentNode;
    const rows = Array.from(tbody.children);

    if (fromIndex < toIndex) {
      tbody.insertBefore(rows[fromIndex], rows[toIndex].nextSibling);
    } else {
      tbody.insertBefore(rows[fromIndex], rows[toIndex]);
    }

    // Add animation
    rows[fromIndex].style.animation = 'slideIn 0.3s ease';
  }

  /**
   * Move row up (keyboard navigation)
   * @param {HTMLElement} row - Table row
   */
  moveRowUp(row) {
    const prevRow = row.previousElementSibling;
    if (prevRow) {
      const fromIndex = this.getRowIndex(row);
      const toIndex = this.getRowIndex(prevRow);

      row.parentNode.insertBefore(row, prevRow);

      if (this.onReorderCallback) {
        this.onReorderCallback(fromIndex, toIndex);
      }

      // Keep focus on handle
      row.querySelector('.drag-handle')?.focus();

      console.log(`⬆️ Moved row up: ${fromIndex} → ${toIndex}`);
    }
  }

  /**
   * Move row down (keyboard navigation)
   * @param {HTMLElement} row - Table row
   */
  moveRowDown(row) {
    const nextRow = row.nextElementSibling;
    if (nextRow) {
      const fromIndex = this.getRowIndex(row);
      const toIndex = this.getRowIndex(nextRow);

      row.parentNode.insertBefore(nextRow, row);

      if (this.onReorderCallback) {
        this.onReorderCallback(fromIndex, toIndex);
      }

      // Keep focus on handle
      row.querySelector('.drag-handle')?.focus();

      console.log(`⬇️ Moved row down: ${fromIndex} → ${toIndex}`);
    }
  }

  /**
   * Toggle keyboard drag mode
   * @param {HTMLElement} row - Table row
   */
  toggleKeyboardDrag(row) {
    const isSelected = row.classList.contains('keyboard-selected');

    if (isSelected) {
      row.classList.remove('keyboard-selected');
      console.log('❌ Keyboard drag mode disabled');
    } else {
      // Remove selection from other rows
      document.querySelectorAll('.keyboard-selected').forEach((r) => {
        r.classList.remove('keyboard-selected');
      });

      row.classList.add('keyboard-selected');
      console.log('✅ Keyboard drag mode enabled');
    }
  }

  /**
   * Setup auto-scroll functionality
   */
  setupAutoScroll() {
    // Will be used during drag
  }

  /**
   * Handle auto-scroll during drag
   * @param {number} y - Y position
   */
  handleAutoScroll(y) {
    const threshold = 100;
    const maxSpeed = 10;
    const viewportHeight = window.innerHeight;

    if (y < threshold) {
      // Scroll up
      this.scrollSpeed = -Math.min(maxSpeed, (threshold - y) / 10);
      this.startAutoScroll();
    } else if (y > viewportHeight - threshold) {
      // Scroll down
      this.scrollSpeed = Math.min(maxSpeed, (y - (viewportHeight - threshold)) / 10);
      this.startAutoScroll();
    } else {
      this.stopAutoScroll();
    }
  }

  /**
   * Start auto-scrolling
   */
  startAutoScroll() {
    if (this.scrollInterval) {return;}

    this.scrollInterval = setInterval(() => {
      window.scrollBy(0, this.scrollSpeed);
    }, 16); // ~60 FPS
  }

  /**
   * Stop auto-scrolling
   */
  stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
    this.scrollSpeed = 0;
  }

  /**
   * Disable drag & drop
   */
  disable() {
    document.querySelectorAll('.drag-handle').forEach((handle) => {
      handle.setAttribute('draggable', 'false');
      handle.style.cursor = 'not-allowed';
      handle.style.opacity = '0.5';
    });
    console.log('❌ Drag & Drop disabled');
  }

  /**
   * Enable drag & drop
   */
  enable() {
    document.querySelectorAll('.drag-handle').forEach((handle) => {
      handle.setAttribute('draggable', 'true');
      handle.style.cursor = 'grab';
      handle.style.opacity = '1';
    });
    console.log('✅ Drag & Drop enabled');
  }

  /**
   * Clean up
   */
  destroy() {
    this.dropIndicator?.remove();
    this.ghostElement?.remove();
    this.stopAutoScroll();
    console.log('🗑️ Drag & Drop Manager destroyed');
  }
}

// Global instance
window.dragDropManager = new DragDropManager();

// Auto-initialize on table if it exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDragDrop);
} else {
  initDragDrop();
}

function initDragDrop() {
  const tableBody = document.querySelector('#portfolioTable tbody');
  if (tableBody) {
    window.dragDropManager.enableOnTable(tableBody, (fromIndex, toIndex) => {
      console.log(`📊 Portfolio reordered: ${fromIndex} → ${toIndex}`);

      // Update portfolio data order
      if (typeof window.getFondyData === 'function' && typeof window.saveFondy === 'function') {
        const data = window.getFondyData();
        const [movedItem] = data.splice(fromIndex, 1);
        data.splice(toIndex, 0, movedItem);
        window.saveFondy(data);
      }

      // Trigger command stack for undo/redo
      if (window.commandStack) {
        const command = {
          execute: () => {},
          undo: () => {
            // Reverse the reorder
            const data = window.getFondyData();
            const [item] = data.splice(toIndex, 1);
            data.splice(fromIndex, 0, item);
            window.saveFondy(data);
            window.renderTable?.(data);
          },
          description: `Přesun řádku ${fromIndex + 1} na pozici ${toIndex + 1}`,
        };
        window.commandStack.execute(command);
      }
    });

    console.log('✅ Drag & Drop initialized on portfolio table');
  }
}
