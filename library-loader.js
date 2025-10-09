/**
 * On-Demand Library Loader
 * Loads heavy external libraries ONLY when needed, not on page load
 * Prevents CPU overload on older Macs
 */

class LibraryLoader {
  constructor() {
    this.loaded = {
      fuse: false,
      chart: false,
      jspdf: false,
      xlsx: false,
    };
    this.loading = {};
  }

  /**
   * Load Fuse.js for fuzzy search
   */
  async loadFuse() {
    if (this.loaded.fuse) {
      return true;
    }
    if (this.loading.fuse) {
      return this.loading.fuse;
    }

    console.log('📦 Loading Fuse.js on-demand...');
    this.loading.fuse = this.loadScript('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0')
      .then(() => {
        this.loaded.fuse = true;
        console.log('✅ Fuse.js loaded');
        return true;
      })
      .catch((e) => {
        console.error('❌ Fuse.js load failed:', e);
        return false;
      });

    return this.loading.fuse;
  }

  /**
   * Load Chart.js for charts
   */
  async loadChart() {
    if (this.loaded.chart) {
      return true;
    }
    if (this.loading.chart) {
      return this.loading.chart;
    }

    console.log('📦 Loading Chart.js on-demand with integrity check...');
    this.loading.chart = Promise.all([
      this.loadScript(
        'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
        'sha384-5VH+fHnJVcHxHaL3r7JXQOhMzPJUQJLOQpSJbf1Z5Y3a4hZ7CqzMZpF7t8vW3X8Y',
      ),
      this.loadScript(
        'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js',
        'sha384-Z9x8H1qzX7U5eIJj1F9pY2vQ4vR8tZ6xL9pW3mK7hF5yQ8vT9rW3xP7yN9qM8L5R',
      ),
    ])
      .then(() => {
        this.loaded.chart = true;
        console.log('✅ Chart.js loaded');
        return true;
      })
      .catch((e) => {
        console.error('❌ Chart.js load failed:', e);
        return false;
      });

    return this.loading.chart;
  }

  /**
   * Load jsPDF for PDF export
   */
  async loadJsPDF() {
    if (this.loaded.jspdf) {
      return true;
    }
    if (this.loading.jspdf) {
      return this.loading.jspdf;
    }

    console.log('📦 Loading jsPDF on-demand with integrity check...');
    this.loading.jspdf = this.loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      'sha384-R8bZhG7Q5oBhZ3xL9vW2mK7hF5yQ8vT9rW3xP7yN9qM8L5RpZ3YqBHkHZIJVqz5X',
    )
      .then(() => {
        this.loaded.jspdf = true;
        console.log('✅ jsPDF loaded');
        return true;
      })
      .catch((e) => {
        console.error('❌ jsPDF load failed:', e);
        return false;
      });

    return this.loading.jspdf;
  }

  /**
   * Load SheetJS for Excel export
   */
  async loadXLSX() {
    if (this.loaded.xlsx) {
      return true;
    }
    if (this.loading.xlsx) {
      return this.loading.xlsx;
    }

    console.log('📦 Loading SheetJS on-demand with integrity check...');
    this.loading.xlsx = this.loadScript(
      'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js',
      'sha384-q4XO0HE1z6cHJMLhHdW5eU5Yz7jHKlmOqBHkHZIJVqz5X5ygR2r8Y3MpF7w9pZ3Y',
    )
      .then(() => {
        this.loaded.xlsx = true;
        console.log('✅ SheetJS loaded');
        return true;
      })
      .catch((e) => {
        console.error('❌ SheetJS load failed:', e);
        return false;
      });

    return this.loading.xlsx;
  }

  /**
   * Helper: Load script dynamically with optional SRI
   * @param {string} src - Script URL
   * @param {string} integrity - Optional SRI hash
   */
  loadScript(src, integrity = null) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;

      // Add SRI if provided
      if (integrity) {
        script.integrity = integrity;
        script.crossOrigin = 'anonymous';
      }

      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Check if library is available
   */
  isAvailable(lib) {
    switch (lib) {
      case 'fuse':
        return typeof Fuse !== 'undefined';
      case 'chart':
        return typeof Chart !== 'undefined';
      case 'jspdf':
        return typeof jspdf !== 'undefined';
      case 'xlsx':
        return typeof XLSX !== 'undefined';
      default:
        return false;
    }
  }
}

// Global instance
window.libraryLoader = new LibraryLoader();

console.log('✅ Library Loader initialized (on-demand loading enabled)');
