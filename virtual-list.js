/**
 * Virtual List Implementation for Large Datasets
 * Version: 1.0.0
 * Efficiently renders only visible items in a long list
 */

class VirtualList {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            itemHeight: options.itemHeight || 60,
            buffer: options.buffer || 5,
            renderItem: options.renderItem || null,
            data: options.data || [],
            threshold: options.threshold || 100 // Only use virtual scrolling if more than 100 items
        };
        
        this.scrollTop = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        
        if (this.shouldUseVirtualScrolling()) {
            this.init();
        }
    }

    shouldUseVirtualScrolling() {
        return this.options.data.length > this.options.threshold;
    }

    init() {
        // Create virtual scroll container
        this.viewport = document.createElement('div');
        this.viewport.style.cssText = `
            height: 100%;
            overflow-y: auto;
            position: relative;
        `;
        
        this.content = document.createElement('div');
        this.content.style.cssText = `
            height: ${this.options.data.length * this.options.itemHeight}px;
            position: relative;
        `;
        
        this.viewport.appendChild(this.content);
        
        // Replace container content
        this.container.innerHTML = '';
        this.container.appendChild(this.viewport);
        
        // Add scroll listener
        this.viewport.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 16)); // ~60fps
        
        // Initial render
        this.render();
        
        console.log('✅ Virtual List initialized for', this.options.data.length, 'items');
    }

    handleScroll() {
        this.scrollTop = this.viewport.scrollTop;
        this.render();
    }

    calculateVisibleRange() {
        const viewportHeight = this.viewport.clientHeight;
        
        this.visibleStart = Math.floor(this.scrollTop / this.options.itemHeight);
        this.visibleEnd = Math.ceil((this.scrollTop + viewportHeight) / this.options.itemHeight);
        
        // Add buffer
        this.visibleStart = Math.max(0, this.visibleStart - this.options.buffer);
        this.visibleEnd = Math.min(this.options.data.length, this.visibleEnd + this.options.buffer);
    }

    render() {
        this.calculateVisibleRange();
        
        // Clear previous items
        this.content.innerHTML = '';
        
        // Render visible items
        for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            const item = this.options.data[i];
            const itemElement = this.createItem(item, i);
            
            // Position item
            itemElement.style.position = 'absolute';
            itemElement.style.top = `${i * this.options.itemHeight}px`;
            itemElement.style.width = '100%';
            itemElement.style.height = `${this.options.itemHeight}px`;
            
            this.content.appendChild(itemElement);
        }
    }

    createItem(data, index) {
        if (this.options.renderItem) {
            return this.options.renderItem(data, index);
        }
        
        // Default renderer
        const div = document.createElement('div');
        div.textContent = JSON.stringify(data);
        return div;
    }

    updateData(newData) {
        this.options.data = newData;
        this.content.style.height = `${newData.length * this.options.itemHeight}px`;
        this.render();
    }

    scrollToIndex(index) {
        const scrollTop = index * this.options.itemHeight;
        this.viewport.scrollTop = scrollTop;
    }

    destroy() {
        this.viewport.removeEventListener('scroll', this.handleScroll);
        this.container.innerHTML = '';
    }
}

// Helper function to apply virtual scrolling to table
function makeTableVirtual(tableId, data, renderRow) {
    const table = document.getElementById(tableId);
    if (!table || data.length < 100) return; // Only for large datasets
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    // Estimate row height
    const sampleRow = tbody.querySelector('tr');
    const rowHeight = sampleRow ? sampleRow.offsetHeight : 50;
    
    const virtualList = new VirtualList(tbody, {
        itemHeight: rowHeight,
        data: data,
        renderItem: (item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = renderRow(item, index);
            return tr;
        }
    });
    
    return virtualList;
}

console.log('✅ Virtual List module loaded');
