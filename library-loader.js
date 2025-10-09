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

    this.loading.fuse = this.loadScript('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0')
      .then(() => {
        this.loaded.fuse = true;
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

    this.loading.chart = Promise.all([
      this.loadScript(
        'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
        'sha384-9nhczxUqK87bcKHh20fSQcTGD4qq5GhayNYSY',
      ),
      this.loadScript(
        'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js',
        // Zoom plugin - SRI hash optional for plugin
      ),
    ])
      .then(() => {
        this.loaded.chart = true;
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

    this.loading.jspdf = this.loadScript(
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'sha384-en/ztfPSRkGfME4KIm05joYXynqzUgbsG5nMr',
    )
      .then(() => {
        this.loaded.jspdf = true;
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

    this.loading.xlsx = this.loadScript(
      'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
      'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2',
    )
      .then(() => {
        this.loaded.xlsx = true;
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
