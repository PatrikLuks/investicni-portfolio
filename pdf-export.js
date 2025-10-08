/**
 * PDF Export Manager
 * Professional portfolio reports with jsPDF, auto-tables, and charts
 */

class PDFExportManager {
  constructor() {
    this.doc = null;
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.currentY = this.margin;

    this.init();
  }

  /**
   * Initialize PDF export manager
   */
  init() {
    this.checkDependencies();
    console.log('✅ PDF Export Manager initialized');
  }

  /**
   * Check if jsPDF is loaded
   */
  checkDependencies() {
    if (typeof window.jspdf === 'undefined') {
      console.warn('⚠️ jsPDF not loaded yet, will load dynamically');
    }
  }

  /**
   * Generate complete portfolio PDF report
   * @param {Array} data - Portfolio data
   * @param {Object} options - Export options
   */
  async generatePortfolioReport(data, options = {}) {
    try {
      // Ensure jsPDF is loaded
      await this.ensureJsPDFLoaded();

      const { jsPDF } = window.jspdf;
      this.doc = new jsPDF('p', 'mm', 'a4');
      this.currentY = this.margin;

      // Generate report sections
      this.addHeader(options.clientName || 'Portfolio Report');
      this.addSummarySection(data);
      this.addMetricsSection(data);
      this.addHoldingsTable(data);

      if (options.includeCharts) {
        await this.addChartsSection(data);
      }

      this.addPerformanceAnalysis(data);
      this.addFooter();

      // Save PDF
      const filename = `portfolio-report-${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(filename);

      console.log('✅ PDF report generated:', filename);
      return filename;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Ensure jsPDF library is loaded
   */
  async ensureJsPDFLoaded() {
    if (typeof window.jspdf !== 'undefined') {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        console.log('✅ jsPDF loaded');

        // Load jsPDF-AutoTable plugin
        const autoTableScript = document.createElement('script');
        autoTableScript.src =
          'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
        autoTableScript.onload = () => {
          console.log('✅ jsPDF-AutoTable loaded');
          resolve();
        };
        autoTableScript.onerror = reject;
        document.head.appendChild(autoTableScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Add PDF header
   * @param {string} title - Report title
   */
  addHeader(title) {
    // Logo area (placeholder)
    this.doc.setFillColor(26, 35, 126); // Primary blue
    this.doc.rect(this.margin, this.margin, 50, 15, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PORTFOLIO', this.margin + 5, this.margin + 10);

    // Title
    this.doc.setTextColor(26, 35, 126);
    this.doc.setFontSize(24);
    this.doc.text(title, this.pageWidth / 2, this.margin + 10, { align: 'center' });

    // Date
    this.doc.setFontSize(10);
    this.doc.setTextColor(127, 140, 141);
    this.doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.doc.text(`Vygenerováno: ${date}`, this.pageWidth - this.margin, this.margin + 10, {
      align: 'right',
    });

    // Separator line
    this.doc.setDrawColor(26, 35, 126);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.margin + 20, this.pageWidth - this.margin, this.margin + 20);

    this.currentY = this.margin + 30;
  }

  /**
   * Add summary section
   * @param {Array} data - Portfolio data
   */
  addSummarySection(data) {
    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.aktuálníHodnota || 0), 0);
    const totalCost = data.reduce(
      (sum, item) => sum + parseFloat(item.nákupníCena) * parseFloat(item.počet),
      0
    );
    const gainLoss = totalValue - totalCost;
    const roi = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

    // Summary box
    this.doc.setFillColor(240, 248, 255);
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.pageWidth - 2 * this.margin,
      40,
      3,
      3,
      'F'
    );

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(26, 35, 126);
    this.doc.text('📊 SHRNUTÍ PORTFOLIA', this.margin + 5, this.currentY + 8);

    // Summary values in 2x2 grid
    const boxWidth = (this.pageWidth - 2 * this.margin - 10) / 2;
    const boxHeight = 12;

    // Total Value
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Celková hodnota:', this.margin + 5, this.currentY + 18);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(26, 35, 126);
    this.doc.text(this.formatCurrency(totalValue), this.margin + 5, this.currentY + 25);

    // ROI
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('ROI:', this.margin + boxWidth + 10, this.currentY + 18);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(roi >= 0 ? 34 : 220, roi >= 0 ? 197 : 53, roi >= 0 ? 94 : 69);
    this.doc.text(`${roi.toFixed(2)}%`, this.margin + boxWidth + 10, this.currentY + 25);

    // Total Cost
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Celková investice:', this.margin + 5, this.currentY + 32);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(26, 35, 126);
    this.doc.text(this.formatCurrency(totalCost), this.margin + 5, this.currentY + 37);

    // Gain/Loss
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Zisk/Ztráta:', this.margin + boxWidth + 10, this.currentY + 32);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(
      gainLoss >= 0 ? 34 : 220,
      gainLoss >= 0 ? 197 : 53,
      gainLoss >= 0 ? 94 : 69
    );
    this.doc.text(this.formatCurrency(gainLoss), this.margin + boxWidth + 10, this.currentY + 37);

    this.currentY += 50;
  }

  /**
   * Add metrics section
   * @param {Array} data - Portfolio data
   */
  addMetricsSection(data) {
    if (!window.calculationsEngine) {
      return;
    }

    const metrics = window.calculationsEngine.calculatePortfolioMetrics(data);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(26, 35, 126);
    this.doc.text('📈 POKROČILÉ METRIKY', this.margin, this.currentY);

    this.currentY += 10;

    // Metrics in 3-column layout
    const colWidth = (this.pageWidth - 2 * this.margin) / 3;

    const metricsData = [
      { label: 'CAGR', value: `${metrics.cagr.toFixed(2)}%` },
      { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2) },
      { label: 'Volatilita', value: `${metrics.volatility.toFixed(2)}%` },
      { label: 'Beta', value: metrics.beta.toFixed(2) },
      { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(2)}%` },
      { label: 'Počet pozic', value: data.length.toString() },
    ];

    let col = 0;
    let row = 0;
    metricsData.forEach((metric, index) => {
      const x = this.margin + col * colWidth;
      const y = this.currentY + row * 15;

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`${metric.label }:`, x, y);

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(26, 35, 126);
      this.doc.text(metric.value, x, y + 5);

      col++;
      if (col >= 3) {
        col = 0;
        row++;
      }
    });

    this.currentY += Math.ceil(metricsData.length / 3) * 15 + 10;
  }

  /**
   * Add holdings table
   * @param {Array} data - Portfolio data
   */
  addHoldingsTable(data) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(26, 35, 126);
    this.doc.text('📋 PORTFOLIO HOLDINGS', this.margin, this.currentY);

    this.currentY += 8;

    const tableData = data.map((item) => {
      const cost = parseFloat(item.nákupníCena) * parseFloat(item.počet);
      const current = parseFloat(item.aktuálníHodnota || 0);
      const roi = cost > 0 ? ((current - cost) / cost) * 100 : 0;

      return [
        item.fond || '-',
        item.ISIN || '-',
        parseFloat(item.počet).toFixed(2),
        this.formatCurrency(parseFloat(item.nákupníCena)),
        this.formatCurrency(current),
        `${roi.toFixed(2)}%`,
      ];
    });

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Fond', 'ISIN', 'Počet', 'Nákup. cena', 'Aktuální', 'ROI']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [26, 35, 126],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [44, 62, 80],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  /**
   * Add charts section
   * @param {Array} data - Portfolio data
   */
  async addChartsSection(data) {
    this.checkPageBreak(100);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(26, 35, 126);
    this.doc.text('📊 GRAFY', this.margin, this.currentY);

    this.currentY += 10;

    // Create temporary canvas for charts
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Category breakdown chart
    const categoryData = this.aggregateByCategory(data);
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(categoryData),
        datasets: [
          {
            label: 'Hodnota podle kategorie',
            data: Object.values(categoryData),
            backgroundColor: [
              'rgba(102, 126, 234, 0.8)',
              'rgba(118, 75, 162, 0.8)',
              'rgba(237, 100, 166, 0.8)',
              'rgba(255, 154, 158, 0.8)',
            ],
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
        },
      },
    });

    // Wait for chart to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add chart to PDF
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = this.pageWidth - 2 * this.margin;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;

    this.checkPageBreak(imgHeight + 10);
    this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);

    this.currentY += imgHeight + 15;

    // Cleanup
    chart.destroy();
    canvas.remove();
  }

  /**
   * Add performance analysis
   * @param {Array} data - Portfolio data
   */
  addPerformanceAnalysis(data) {
    this.checkPageBreak(60);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(26, 35, 126);
    this.doc.text('⭐ ANALÝZA VÝKONU', this.margin, this.currentY);

    this.currentY += 10;

    if (!window.calculationsEngine) {
      return;
    }

    const metrics = window.calculationsEngine.calculatePortfolioMetrics(data);

    // Top performers
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(34, 197, 94);
    this.doc.text('🏆 Top 3 výkonné pozice:', this.margin, this.currentY);

    this.currentY += 6;

    metrics.topPerformers.slice(0, 3).forEach((performer, index) => {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(44, 62, 80);
      this.doc.text(
        `${index + 1}. ${performer.fond}: ${performer.roi.toFixed(2)}%`,
        this.margin + 5,
        this.currentY
      );
      this.currentY += 5;
    });

    this.currentY += 5;

    // Worst performers
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(220, 53, 69);
    this.doc.text('⚠️ Nejslabší pozice:', this.margin, this.currentY);

    this.currentY += 6;

    metrics.worstPerformers.slice(0, 3).forEach((performer, index) => {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(44, 62, 80);
      this.doc.text(
        `${index + 1}. ${performer.fond}: ${performer.roi.toFixed(2)}%`,
        this.margin + 5,
        this.currentY
      );
      this.currentY += 5;
    });
  }

  /**
   * Add footer to all pages
   */
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setLineWidth(0.3);
      this.doc.line(
        this.margin,
        this.pageHeight - 15,
        this.pageWidth - this.margin,
        this.pageHeight - 15
      );

      // Page number
      this.doc.setFontSize(8);
      this.doc.setTextColor(127, 140, 141);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Strana ${i} z ${pageCount}`, this.pageWidth / 2, this.pageHeight - 10, {
        align: 'center',
      });

      // Copyright
      this.doc.text('© 2024 Portfolio Manager', this.margin, this.pageHeight - 10);

      // Disclaimer
      this.doc.text('Důvěrné', this.pageWidth - this.margin, this.pageHeight - 10, {
        align: 'right',
      });
    }
  }

  /**
   * Check if page break needed
   * @param {number} requiredSpace - Required space in mm
   */
  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Aggregate data by category
   * @param {Array} data - Portfolio data
   * @returns {Object} - Category totals
   */
  aggregateByCategory(data) {
    const categoryTotals = {};

    data.forEach((item) => {
      const category = item.kategorie || 'Ostatní';
      const value = parseFloat(item.aktuálníHodnota || 0);

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += value;
    });

    return categoryTotals;
  }

  /**
   * Format currency
   * @param {number} value - Value to format
   * @returns {string} - Formatted currency
   */
  formatCurrency(value) {
    return (
      `${new Intl.NumberFormat('cs-CZ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value) } Kč`
    );
  }
}

// Global instance
window.pdfExportManager = new PDFExportManager();

// Add PDF export button
window.addEventListener('DOMContentLoaded', () => {
  const portfolioCard = document.getElementById('portfolioCard');
  if (!portfolioCard) {return;}

  const headerDiv = portfolioCard.querySelector('div[style*="justify-content: space-between"]');
  if (!headerDiv) {return;}

  const buttonContainer = headerDiv.querySelector('div[style*="gap"]');
  if (!buttonContainer) {return;}

  const pdfBtn = document.createElement('button');
  pdfBtn.id = 'exportPDFReport';
  pdfBtn.className = 'btn-icon';
  pdfBtn.title = 'Exportovat do PDF';
  pdfBtn.style.cssText =
    'font-size: 1.5rem; padding: 8px 16px; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; border: none; border-radius: 8px; cursor: pointer;';
  pdfBtn.textContent = '📄 PDF';

  pdfBtn.addEventListener('click', async () => {
    const data = window.getFondyData ? window.getFondyData() : [];
    if (!data || data.length === 0) {
      alert('Žádná data k exportu');
      return;
    }

    pdfBtn.disabled = true;
    pdfBtn.textContent = '⏳ Generuji...';

    try {
      await window.pdfExportManager.generatePortfolioReport(data, {
        clientName: 'Portfolio Report',
        includeCharts: true,
      });

      if (typeof showToast === 'function') {
        showToast('success', 'Export dokončen', 'PDF report byl úspěšně vygenerován');
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(`Chyba při generování PDF: ${ error.message}`);
    } finally {
      pdfBtn.disabled = false;
      pdfBtn.textContent = '📄 PDF';
    }
  });

  buttonContainer.insertBefore(pdfBtn, buttonContainer.children[2]);
});

console.log('✅ PDF Export Manager ready');
