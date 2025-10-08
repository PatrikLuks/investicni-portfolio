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
            xlsx: false
        };
        this.loading = {};
    }

    /**
     * Load Fuse.js for fuzzy search
     */
    async loadFuse() {
        if (this.loaded.fuse) return true;
        if (this.loading.fuse) return this.loading.fuse;

        console.log('📦 Loading Fuse.js on-demand...');
        this.loading.fuse = this.loadScript('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0')
            .then(() => {
                this.loaded.fuse = true;
                console.log('✅ Fuse.js loaded');
                return true;
            })
            .catch(e => {
                console.error('❌ Fuse.js load failed:', e);
                return false;
            });

        return this.loading.fuse;
    }

    /**
     * Load Chart.js for charts
     */
    async loadChart() {
        if (this.loaded.chart) return true;
        if (this.loading.chart) return this.loading.chart;

        console.log('📦 Loading Chart.js on-demand...');
        this.loading.chart = Promise.all([
            this.loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'),
            this.loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js')
        ])
            .then(() => {
                this.loaded.chart = true;
                console.log('✅ Chart.js loaded');
                return true;
            })
            .catch(e => {
                console.error('❌ Chart.js load failed:', e);
                return false;
            });

        return this.loading.chart;
    }

    /**
     * Load jsPDF for PDF export
     */
    async loadJsPDF() {
        if (this.loaded.jspdf) return true;
        if (this.loading.jspdf) return this.loading.jspdf;

        console.log('📦 Loading jsPDF on-demand...');
        this.loading.jspdf = this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
            .then(() => {
                this.loaded.jspdf = true;
                console.log('✅ jsPDF loaded');
                return true;
            })
            .catch(e => {
                console.error('❌ jsPDF load failed:', e);
                return false;
            });

        return this.loading.jspdf;
    }

    /**
     * Load SheetJS for Excel export
     */
    async loadXLSX() {
        if (this.loaded.xlsx) return true;
        if (this.loading.xlsx) return this.loading.xlsx;

        console.log('📦 Loading SheetJS on-demand...');
        this.loading.xlsx = this.loadScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js')
            .then(() => {
                this.loaded.xlsx = true;
                console.log('✅ SheetJS loaded');
                return true;
            })
            .catch(e => {
                console.error('❌ SheetJS load failed:', e);
                return false;
            });

        return this.loading.xlsx;
    }

    /**
     * Helper: Load script dynamically
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Check if library is available
     */
    isAvailable(lib) {
        switch(lib) {
            case 'fuse': return typeof Fuse !== 'undefined';
            case 'chart': return typeof Chart !== 'undefined';
            case 'jspdf': return typeof jspdf !== 'undefined';
            case 'xlsx': return typeof XLSX !== 'undefined';
            default: return false;
        }
    }
}

// Global instance
window.libraryLoader = new LibraryLoader();

console.log('✅ Library Loader initialized (on-demand loading enabled)');
