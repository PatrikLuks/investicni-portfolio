// Získání reference na formuláře a elementy
const clientForm = document.getElementById('clientForm');
const portfolioForm = document.getElementById('portfolioForm');
const generateReportBtn = document.getElementById('generateReport');
const fondList = document.getElementById('fondList');
const clientNameCard = document.getElementById('clientNameCard');
const portfolioCard = document.getElementById('portfolioCard');
const fondListCard = document.getElementById('fondListCard');
const clientNameDisplay = document.getElementById('clientNameDisplay');

// Add these variables at the top with other declarations
let advisorName = '';
let advisorEmail = '';
let viewMode = 'funds'; // 'funds' nebo 'producers'

// Funkce pro aktualizaci seznamu fondů
function updateFondList() {
  fondList.innerHTML = `
        <table class="fond-table">
            <thead>
                <tr>
                    <th>Název fondu</th>
                    <th>Producent</th>
                    <th>Investice (Kč)</th>
                    <th>Hodnota (Kč)</th>
                    <th>Akce</th>
                </tr>
            </thead>
            <tbody>
                ${portfolioData
                  .map(
                    (item, index) => `
                    <tr>
                        <td><input type="text" class="inline-edit" value="${item.name}" onchange="updateFondData(${index}, 'name', this.value)"></td>
                        <td><input type="text" class="inline-edit" value="${item.producer}" onchange="updateFondData(${index}, 'producer', this.value)"></td>
                        <td><input type="number" class="inline-edit" value="${item.investment}" onchange="updateFondData(${index}, 'investment', this.value)"></td>
                        <td><input type="number" class="inline-edit" value="${item.value}" onchange="updateFondData(${index}, 'value', this.value)"></td>
                        <td>
                            <button class="delete-btn" onclick="deleteFond(${index})">Smazat</button>
                        </td>
                    </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    `;
}

// Přidat tyto nové funkce
function updateFondData(index, field, value) {
  if (field === 'investment' || field === 'value') {
    value = parseFloat(value) || 0;
  }
  portfolioData[index][field] = value;
}

// Event listener pro formulář se jménem klienta
clientForm.addEventListener('submit', function (e) {
  e.preventDefault();
  clientName = safeGetValue('clientName', '');
  advisorName = safeGetValue('advisorName', '');
  advisorEmail = safeGetValue('advisorEmail', '');

  // Hide first card, show portfolio card
  safeSetDisplay('clientNameCard', 'none');
  safeSetDisplay('portfolioCard', 'block');
  safeSetDisplay('fondListCard', 'block');
  safeSetText('clientNameDisplay', clientName);

  // Initialize color picker after showing the portfolio card
  initializeColorPicker();
});

function initializeColorPicker() {
  const buttons = safeQuerySelectorAll('.scheme-button');

  buttons.forEach((button) => {
    button.addEventListener('click', function () {
      // Remove active class from all buttons
      buttons.forEach((btn) => btn.classList.remove('active'));

      // Add active class to clicked button
      this.classList.add('active');

      // Set the color scheme based on the clicked button
      if (this.classList.contains('blue-scheme')) window.selectedColorScheme = 'blue';
      if (this.classList.contains('red-scheme')) window.selectedColorScheme = 'red';
      if (this.classList.contains('green-scheme')) window.selectedColorScheme = 'green';
      if (this.classList.contains('yellow-scheme')) window.selectedColorScheme = 'yellow';
    });
  });

  // Set default color scheme
  const blueButton = safeQuerySelector('.blue-scheme');
  if (blueButton) {
    blueButton.classList.add('active');
    window.selectedColorScheme = 'blue';
  }
}

// Event listener pro formulář
portfolioForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const fondData = {
    name: safeGetValue('fondName', ''),
    producer: safeGetValue('producer', ''),
    investment: parseFloat(safeGetValue('investment', '')),
    investmentDate: safeGetValue('investmentDate', ''),
    value: parseFloat(safeGetValue('value', '')),
  };

  // Přidáme nový fond do pole
  portfolioData.push(fondData);

  // Přidáme fond do localStorage, pokud tam ještě není
  addNewFund(fondData.name);

  // Aktualizujeme tabulku
  updateFondTable();

  // Vyčistíme formulář
  safeResetForm('portfolioForm');

  // Zobrazíme kartu se seznamem fondů
  safeSetDisplay('fondListCard', 'block');
});

/**
 * Save fund to localStorage for market data and other features
 * @param {string} fundName - Name of the fund to add
 */
function addNewFund(fundName) {
  try {
    // Get existing portfolio from localStorage
    const existingPortfolio = JSON.parse(localStorage.getItem('investmentPortfolio') || '[]');

    // Check if fund already exists
    const fundExists = existingPortfolio.some((item) => item.name === fundName);
    if (fundExists) {
      return; // Fund already in localStorage
    }

    // Find the fund in portfolioData
    const fundData = portfolioData.find((item) => item.name === fundName);
    if (!fundData) {
      return; // Fund not found
    }

    // Add to localStorage
    existingPortfolio.push(fundData);
    localStorage.setItem('investmentPortfolio', JSON.stringify(existingPortfolio));

    console.log(`✅ Fund added to localStorage: ${fundName}`);
  } catch (e) {
    console.error('Failed to add fund to localStorage:', e);
  }
}

function updateFondTable() {
  const tbody = document.getElementById('fondTableBody');
  const thead = document.getElementById('fondTableHead');
  tbody.innerHTML = '';
  if (viewMode === 'funds') {
    // Hlavička pro fondy
    if (thead) {
      thead.innerHTML = `<tr>
                <th>Název fondu</th>
                <th>Producent</th>
                <th>Datum investice</th>
                <th>Čistá investice</th>
                <th>Aktuální hodnota</th>
                <th>Akce</th>
            </tr>`;
    }
    // Původní tabulka podle fondů
    portfolioData.forEach((fond, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td><input type="text" class="inline-edit" value="${fond.name}" data-index="${index}" data-field="name"></td>
                <td><input type="text" class="inline-edit" value="${fond.producer}" data-index="${index}" data-field="producer"></td>
                <td><input type="date" class="inline-edit" value="${fond.investmentDate && fond.investmentDate !== '1970-01-01' ? fond.investmentDate : ''}" data-index="${index}" data-field="investmentDate"></td>
                <td><input type="number" class="inline-edit" value="${fond.investment}" data-index="${index}" data-field="investment"></td>
                <td><input type="number" class="inline-edit" value="${fond.value}" data-index="${index}" data-field="value"></td>
                <td><button class="delete-btn" onclick="deleteFond(${index})">Smazat</button></td>
            `;
      tbody.appendChild(row);
    });
    // Přidáme event listener pro změny v inputech
    safeQuerySelectorAll('.inline-edit').forEach((input) => {
      input.addEventListener('change', function () {
        const index = parseInt(this.dataset.index);
        const field = this.dataset.field;
        let value;

        if (field === 'name' || field === 'producer') {
          value = this.value;
        } else if (field === 'investmentDate') {
          // Pro datum input - už je ve správném formátu yyyy-mm-dd
          value = this.value;
        } else {
          value = parseFloat(this.value);
        }

        portfolioData[index][field] = value;
      });
    });
  } else if (viewMode === 'producers') {
    // Hlavička pro producenty
    if (thead) {
      thead.innerHTML = `<tr>
                <th>Producent</th>
                <th>Čistá investice</th>
                <th>Aktuální hodnota</th>
                <th>Zisk/Ztráta</th>
                <th>Výnos %</th>
            </tr>`;
    }
    // Agregace podle producenta
    const producerMap = {};
    portfolioData.forEach((item) => {
      if (!producerMap[item.producer]) {
        producerMap[item.producer] = { investment: 0, value: 0 };
      }
      producerMap[item.producer].investment += Number(item.investment);
      producerMap[item.producer].value += Number(item.value);
    });
    const rows = Object.entries(producerMap).map(([producer, data]) => {
      const profit = data.value - data.investment;
      const yieldPercent =
        data.investment !== 0 ? ((profit / data.investment) * 100).toFixed(2) : '0.00';
      return {
        producer,
        investment: data.investment,
        value: data.value,
        profit,
        yieldPercent,
      };
    });
    rows.forEach((rowData) => {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${rowData.producer}</td>
                <td>${rowData.investment.toLocaleString('cs-CZ')} Kč</td>
                <td>${rowData.value.toLocaleString('cs-CZ')} Kč</td>
                <td class="${rowData.profit >= 0 ? 'positive' : 'negative'}">${rowData.profit.toLocaleString('cs-CZ')} Kč</td>
                <td class="${rowData.yieldPercent >= 0 ? 'positive' : 'negative'}">${rowData.yieldPercent}%</td>
            `;
      tbody.appendChild(row);
    });
  }
}

function deleteFond(index) {
  portfolioData.splice(index, 1);
  updateFondTable();

  // Skryjeme tabulku, pokud není žádný fond
  if (portfolioData.length === 0) {
    safeSetDisplay('fondListCard', 'none');
  }
}

// Event listener pro generování reportu
generateReportBtn.addEventListener('click', function () {
  if (portfolioData.length === 0) {
    alert('Nejprve přidejte nějaké fondy do portfolia.');
    return;
  }

  // Generování HTML reportu
  generatePortfolioHTML(portfolioData);

  // Generování CSV
  generateCSV(portfolioData);
});

function generatePortfolioHTML(portfolioData) {
  // Get the currently selected color scheme
  const selectedColor = window.selectedColorScheme || 'blue';

  // Check if currency switch is enabled
  const currencySwitch = document.getElementById('currencySwitch');
  const useEuros = currencySwitch ? currencySwitch.checked : false;
  const currencySymbol = useEuros ? '€' : 'Kč';

  // Define color schemes for different elements
  const colorSchemes = {
    blue: {
      primary: '#0d1b2a',
      colors: [
        '#1e3a8a',
        '#3b82f6',
        '#60a5fa',
        '#93c5fd',
        '#dbeafe',
        '#1e40af',
        '#2563eb',
        '#3b82f6',
        '#60a5fa',
        '#93c5fd',
      ],
      negativeColors: [
        '#c62828',
        '#d32f2f',
        '#e53935',
        '#f44336',
        '#ef5350',
        '#e57373',
        '#ef9a9a',
        '#ffcdd2',
        '#ff8a80',
        '#ff5252',
      ],
    },
    red: {
      primary: '#c0392b',
      colors: [
        '#c0392b',
        '#cd6155',
        '#d98880',
        '#e6b0aa',
        '#f2d7d5',
        '#943126',
        '#8c2d1c',
        '#7b241c',
        '#641e16',
        '#5c1916',
      ],
      negativeColors: [
        '#c0392b',
        '#cd6155',
        '#d98880',
        '#e6b0aa',
        '#f2d7d5',
        '#943126',
        '#8c2d1c',
        '#7b241c',
        '#641e16',
        '#5c1916',
      ],
    },
    green: {
      primary: '#27ae60',
      colors: [
        '#27ae60',
        '#2ecc71',
        '#58d68d',
        '#82e0aa',
        '#abebc6',
        '#196f3d',
        '#145a32',
        '#186a3b',
        '#0b5345',
        '#145a32',
      ],
      negativeColors: [
        '#c0392b',
        '#cd6155',
        '#d98880',
        '#e6b0aa',
        '#f2d7d5',
        '#943126',
        '#8c2d1c',
        '#7b241c',
        '#641e16',
        '#5c1916',
      ],
    },
    yellow: {
      primary: '#f39c12',
      colors: [
        '#f39c12',
        '#f5b041',
        '#f8c471',
        '#fad7a0',
        '#fdebd0',
        '#b9770e',
        '#9c640c',
        '#7e5109',
        '#634205',
        '#493303',
      ],
      negativeColors: [
        '#c0392b',
        '#cd6155',
        '#d98880',
        '#e6b0aa',
        '#f2d7d5',
        '#943126',
        '#8c2d1c',
        '#7b241c',
        '#641e16',
        '#5c1916',
      ],
    },
  };

  const selectedScheme = colorSchemes[selectedColor];

  const currentDate = new Date().toLocaleDateString('cs-CZ');

  // Připravím data podle režimu
  let tableRows = '';
  let tableHeader = '';
  let totalInvestment = 0;
  let totalValue = 0;
  let totalProfit = 0;
  let totalYield = 0;
  if (viewMode === 'producers') {
    // Agregace podle producenta
    const producerMap = {};
    portfolioData.forEach((item) => {
      if (!producerMap[item.producer]) {
        producerMap[item.producer] = { investment: 0, value: 0 };
      }
      producerMap[item.producer].investment += Number(item.investment);
      producerMap[item.producer].value += Number(item.value);
    });
    const rows = Object.entries(producerMap).map(([producer, data]) => {
      const profit = data.value - data.investment;
      const yieldPercent =
        data.investment !== 0 ? ((profit / data.investment) * 100).toFixed(2) : '0.00';
      return {
        producer,
        investment: data.investment,
        value: data.value,
        profit,
        yieldPercent,
      };
    });
    tableHeader = `<tr>
            <th>Producent</th>
            <th>Čistá investice</th>
            <th>Aktuální hodnota</th>
            <th>Zisk/Ztráta</th>
            <th>Výnos %</th>
        </tr>`;
    // Agregace podle producenta
    const producerMapForReport = {};
    portfolioData.forEach((item) => {
      if (!producerMapForReport[item.producer]) {
        producerMapForReport[item.producer] = { investment: 0, value: 0 };
      }
      producerMapForReport[item.producer].investment += Number(item.investment);
      producerMapForReport[item.producer].value += Number(item.value);
    });
    const producerRows = Object.entries(producerMapForReport).map(([producer, data]) => {
      const profit = data.value - data.investment;
      const yieldPercent =
        data.investment !== 0 ? ((profit / data.investment) * 100).toFixed(2) : '0.00';
      return {
        producer,
        investment: data.investment,
        value: data.value,
        profit,
        yieldPercent,
      };
    });
    producerRows.forEach((rowData) => {
      tableRows += `<tr>
                <td>${rowData.producer}</td>
                <td>${rowData.investment.toLocaleString('cs-CZ')} ${currencySymbol}</td>
                <td>${rowData.value.toLocaleString('cs-CZ')} ${currencySymbol}</td>
                <td class="${rowData.profit >= 0 ? 'positive' : 'negative'}">${rowData.profit.toLocaleString('cs-CZ')} ${currencySymbol}</td>
                <td class="${rowData.yieldPercent >= 0 ? 'positive' : 'negative'}">${rowData.yieldPercent}%</td>
            </tr>`;
      totalInvestment += rowData.investment;
      totalValue += rowData.value;
      totalProfit += rowData.profit;
    });
    totalYield =
      totalInvestment !== 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : '0.00';
    tableRows += `<tr class="total-row">
            <td>CELKEM</td>
            <td>${totalInvestment.toLocaleString('cs-CZ')} ${currencySymbol}</td>
            <td>${totalValue.toLocaleString('cs-CZ')} ${currencySymbol}</td>
            <td class="positive">${totalProfit.toLocaleString('cs-CZ')} ${currencySymbol}</td>
            <td class="positive">${totalYield}%</td>
        </tr>`;
  } else {
    // Původní tabulka podle fondů
    tableHeader = `<tr>
            <th>Fond</th>
            <th>Producent</th>
            <th>Datum</th>
            <th>Investice</th>
            <th>Hodnota</th>
            <th>Zisk/Ztráta</th>
            <th>Výnos %</th>
            <th>Výnos % p.a.</th>
        </tr>`;
    portfolioData.forEach((item) => {
      const investment = Number(item.investment);
      const value = Number(item.value);
      const profit = value - investment;
      const yieldPercent = investment !== 0 ? ((profit / investment) * 100).toFixed(2) : '0.00';
      const currentDate = new Date().toLocaleDateString('cs-CZ');

      // Výpočet výnosu p.a. na základě doby držení
      let yieldPA = '0.00';
      if (
        item.investmentDate &&
        item.investmentDate !== '' &&
        item.investmentDate !== '1970-01-01' &&
        investment !== 0
      ) {
        try {
          const investmentDate = new Date(item.investmentDate);
          const currentDateObj = new Date();

          // Kontrola, že datum je platné
          if (investmentDate.getTime() && investmentDate < currentDateObj) {
            const daysHeld = Math.max(
              1,
              Math.floor((currentDateObj - investmentDate) / (1000 * 60 * 60 * 24))
            );
            const yearsHeld = daysHeld / 365;

            if (yearsHeld > 0) {
              const annualizedReturn = Math.pow(value / investment, 1 / yearsHeld) - 1;
              yieldPA = (annualizedReturn * 100).toFixed(2);
            } else {
              yieldPA = yieldPercent; // Pokud je investice mladší než rok, použijeme běžný výnos
            }
          } else {
            yieldPA = yieldPercent; // Neplatné datum
          }
        } catch (e) {
          yieldPA = yieldPercent; // Chyba při parsování data
        }
      } else {
        yieldPA = yieldPercent; // Fallback na běžný výnos
      }
      let displayDate;
      if (
        item.investmentDate &&
        item.investmentDate !== '' &&
        item.investmentDate !== '1970-01-01'
      ) {
        try {
          // Konverze z ISO formátu (yyyy-mm-dd) na český formát
          const dateObj = new Date(item.investmentDate + 'T00:00:00'); // Přidáme čas, aby se předešlo problémům s časovými pásmy
          if (dateObj.getTime() && !isNaN(dateObj.getTime())) {
            displayDate = dateObj.toLocaleDateString('cs-CZ');
          } else {
            displayDate = currentDate;
          }
        } catch (e) {
          displayDate = currentDate;
        }
      } else {
        displayDate = currentDate;
      }
      tableRows += `<tr>
                <td>${item.name}</td>
                <td>${item.producer}</td>
                <td>${displayDate}</td>
                <td data-value="${investment}">${investment.toLocaleString('cs-CZ')} ${currencySymbol}</td>
                <td data-value="${value}">${value.toLocaleString('cs-CZ')} ${currencySymbol}</td>
                <td data-value="${profit}" class="${profit >= 0 ? 'positive' : 'negative'}">${profit.toLocaleString('cs-CZ')} ${currencySymbol}</td>
                <td data-value="${yieldPercent}" class="${yieldPercent >= 0 ? 'positive' : 'negative'}">${yieldPercent}%</td>
                <td data-value="${yieldPA}" class="${yieldPA >= 0 ? 'positive' : 'negative'}">${yieldPA}%</td>
            </tr>`;
      totalInvestment += investment;
      totalValue += value;
      totalProfit += profit;
    });
    totalYield =
      totalInvestment !== 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : '0.00';
    tableRows += `<tr class="total-row">
            <td>CELKEM</td>
            <td>-</td>
            <td>-</td>
            <td>${totalInvestment.toLocaleString('cs-CZ')} ${currencySymbol}</td>
            <td>${totalValue.toLocaleString('cs-CZ')} ${currencySymbol}</td>
            <td class="positive">${totalProfit.toLocaleString('cs-CZ')} ${currencySymbol}</td>
            <td class="positive">${totalYield}%</td>
            <td class="positive">${totalYield}%</td>
        </tr>`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio Report - ${clientName}</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
        <style>
            :root {
                --primary-blue: ${selectedScheme.primary};
                --secondary-blue: ${selectedScheme.colors[2]};
                --background: #ffffff;
                --text-primary: #2c3e50;
                --text-secondary: #7f8c8d;
                --border-color: #e0e0e0;
            }

            @media print {
                /* Odstranit záhlaví a zápatí */
                @page {
                    margin: 0;
                }
                
                body {
                    margin: 0;
                    padding: 20px;
                }
                
                .card {
                    border: none !important;
                    padding: 0 !important;
                    margin-bottom: 20px !important;
                    box-shadow: none !important;
                }

                
                /* Zachovat barvy v tabulce */
                th {
                    background: linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%) !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .total-row {
                    background-color: #1b263b !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Zachovat barvy v grafech */
                canvas {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Zachovat barvy v headeru */
                .intro-section {
                    background: linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%) !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Zachovat barevnou čáru na kartách grafů při tisku */
                .charts-container .card::before {
                    height: 8px !important;
                    background: linear-gradient(90deg, #C8940A 0%, #000000 50%, #3f3f3f 100%) !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .jpl-logo {
                    font-family: "proxima-nova", sans-serif !important;
                    line-height: 1.5 !important;
                    font-weight: 300 !important;
                    font-size: 18px !important;
                    text-align: center !important;
                    box-sizing: border-box !important;
                    color: #C8940A !important;
                    background: url(https://jplinvest.eu/img/jpl-invest-logo.svg) no-repeat center center !important;
                    background-size: contain !important;
                    width: 240px !important;
                    height: 48px !important;
                    display: block !important;
                    text-indent: -9999px !important;
                    margin: 0 auto !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .slogan-line {
                    background-color: #C8940A !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .slogan-text .highlight {
                    color: #C8940A !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Zajistit, že tabulka skončí na první stránce */
                .table-section {
                    page-break-after: always !important;
                }
                
                /* Spacer pro tisk */
                .print-spacer {
                    page-break-before: always !important;
                    padding: 10px !important;
                    height: 0 !important;
                }
                
                /* Grafy začnou na druhé stránce */
                .charts-container {
                    page-break-after: avoid !important;
                }
                
                /* Disclaimer na spodní části druhé stránky */
                .disclaimer-section {
                    margin-top: 40px !important;
                    padding: 20px 40px !important;
                    background-color: #f8f9fa !important;
                    border-top: 2px solid #e0e0e0 !important;
                    page-break-inside: avoid !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Zápatí s informacemi o vypracování */
                .footer-info {
                    position: fixed !important;
                    bottom: 10px !important;
                    left: 20px !important;
                    font-size: 0.75rem !important;
                    color: #666 !important;
                    background-color: rgba(255, 255, 255, 0.9) !important;
                    padding: 8px 12px !important;
                    border-radius: 4px !important;
                    border: 1px solid #e0e0e0 !important;
                    z-index: 1000 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }

            body { 
                font-family: 'Inter', 'Segoe UI', sans-serif; 
                margin: 0; 
                padding: 40px; 
                background-color: var(--background);
                min-height: 100vh;
                color: var(--text-primary);
                line-height: 1.5;
            }
            
            .container {
                max-width: 90vw;
                width: 90vw;
                margin: 0 auto;
                padding: 0;
            }
            
            .card { 
                background-color: var(--background);
                border-radius: 12px;
                padding: 32px;
                margin-bottom: 24px;
                border: 1px solid var(--border-color);
            }

            /* Úvod Section Styles */
            .intro-section {
                background: linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%);
                color: white;
                margin-bottom: 32px;
                border-radius: 12px;
                overflow: hidden;
            }

            .intro-section .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 40px;
                position: relative;
            }

            .intro-section .logo-section {
                display: flex;
                align-items: center;
            }

            .intro-section .slogan-section {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .slogan-text {
                text-align: right;
                color: white;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .slogan-text p {
                margin: 2px 0;
            }

            .slogan-text .highlight {
                color: #C8940A;
                font-weight: 500;
            }

            .slogan-line {
                width: 2px;
                height: 70px;
                background-color: #C8940A;
            }

            /* Table Header Styles */
            .table-header {
                display: flex;
                align-items: flex-start;
                margin-bottom: 24px;
                padding: 0;
                position: relative;
                justify-content: center;
            }

            .table-header .logo-section {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-right: 32px;
            }

            .jpl-logo {
                font-family: "proxima-nova", sans-serif;
                line-height: 1.5;
                font-weight: 300;
                font-size: 18px;
                text-align: center;
                box-sizing: border-box;
                color: #C8940A;
                background: url(https://jplinvest.eu/img/jpl-invest-logo.svg) no-repeat center center;
                background-size: contain;
                width: 300px;
                height: 60px;
                display: block;
                text-indent: -9999px;
                margin: 0 auto;
            }

            .vertical-line {
                width: 2px;
                height: 60px;
                background-color: #f39c12;
                margin-left: 8px;
            }

            .table-header .intro-content {
                flex: 1;
                text-align: center;
            }

            .table-header .intro-content h1 {
                color: #2c3e50;
                margin: 0 0 16px 0;
                font-size: 2.5rem;
                font-weight: 600;
                text-align: center;
            }

            .table-header .client-info {
                margin-top: 16px;
            }

            .title-section {
                text-align: center;
                flex: 1;
                margin-left: 40px;
            }
            
            .title-section h1 {
                color: white;
                margin: 0 0 8px 0;
                font-size: 2rem;
                font-weight: 600;
                margin-left: -100px; /* Posun nadpisu doprava pro lepší centrování */
            }
            
            .title-section .report-date {
                color: white;
                margin: 0;
                font-size: 1.1rem;
                margin-left: -120px; /* Posun data doleva */
            }
            
            .client-name-highlight {
                color: #C8940A;
                font-weight: 600;
            }

            .table-header .report-date {
                font-size: 1rem;
                margin: 8px 0;
                color: #7f8c8d;
            }

            /* Table Section Styles */
            .table-section {
                background: white;
                margin-bottom: 32px;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .table-section table {
                background: white;
                border-radius: 8px;
                overflow: hidden;
                width: 100%;
            }

            /* Charts Section Styles */
            .charts-container {
                display: flex;
                flex-direction: row;
                gap: 32px;
                margin-top: 62px;
                width: 100%;
                justify-content: center;
                align-items: stretch;
            }
            
            .charts-container .card {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                padding: 32px 24px 24px 24px;
                margin: 0;
                flex: 1;
                min-height: 500px;
                display: flex;
                flex-direction: column;
                position: relative;
                overflow: hidden;
            }
            
            .charts-container .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg, #C8940A 0%, #000000 50%, #3f3f3f 100%);
                border-radius: 12px 12px 0 0;
            }

            h1 {
                color: var(--text-primary);
                margin: 40px 0 24px;
                font-size: 2.5rem;
                font-weight: 600;
                text-align: center;
                clear: both;
            }

            table { 
                width: 100%; 
                border-collapse: collapse;
                margin: 24px 0;
                font-size: 0.875rem;
            }

            th { 
                background: linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%);
                color: white;
                padding: 12px 16px;
                text-align: left;
                font-weight: 500;
                border-bottom: 1px solid #e0e0e0;
                cursor: pointer;
                position: relative;
            }

            th {
                font-weight: 600;
            }

            td { 
                padding: 12px 16px;
                border-bottom: 1px solid #e0e0e0;
            }

            /* Text alignment for different columns - default for funds view */
            td:nth-child(1), td:nth-child(2) {
                text-align: left;
            }
            
            td:nth-child(3) {
                text-align: center;
            }
            
            td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7), td:nth-child(8) {
                text-align: right;
                padding-right: 20px;
            }

            /* Ensure headers are also right-aligned for numerical columns */
            th:nth-child(4), th:nth-child(5), th:nth-child(6), th:nth-child(7), th:nth-child(8) {
                text-align: right;
                padding-right: 20px;
            }

            /* Center the date header */
            th:nth-child(3) {
                text-align: center;
            }

            /* Column widths - default for funds view */
            th:nth-child(1), td:nth-child(1) {
                width: 35%;
                min-width: 300px;
            }
            
            th:nth-child(2), td:nth-child(2) {
                width: 12%;
                min-width: 100px;
            }
            
            th:nth-child(3), td:nth-child(3) {
                width: 10%;
                min-width: 80px;
                text-align: center;
            }
            
            th:nth-child(4), td:nth-child(4),
            th:nth-child(5), td:nth-child(5),
            th:nth-child(6), td:nth-child(6),
            th:nth-child(7), td:nth-child(7),
            th:nth-child(8), td:nth-child(8) {
                width: 10%;
                min-width: 80px;
            }

            /* Producers view - 5 columns */
            .producers-view td:nth-child(1) {
                text-align: left;
                width: 25%;
                min-width: 150px;
            }
            
            .producers-view td:nth-child(2), 
            .producers-view td:nth-child(3), 
            .producers-view td:nth-child(4), 
            .producers-view td:nth-child(5) {
                text-align: right;
                padding-right: 20px;
                width: 18.75%;
                min-width: 100px;
            }

            .producers-view th:nth-child(1) {
                text-align: left;
                width: 25%;
                min-width: 150px;
            }
            
            .producers-view th:nth-child(2), 
            .producers-view th:nth-child(3), 
            .producers-view th:nth-child(4), 
            .producers-view th:nth-child(5) {
                text-align: right;
                padding-right: 20px;
                width: 18.75%;
                min-width: 100px;
            }

            /* Odstraněno monospace font pro jednotný vzhled */

            /* Total row styling */
            .total-row {
                background-color: #1b263b;
                border-top: 2px solid #1b263b;
            }
            .total-row td {
                font-weight: 600;
                color: white;
                padding: 12px 16px;
            }
            .total-row td:first-child {
                font-weight: 600;
                text-align: left;
            }
            
            .total-row td:nth-child(4), .total-row td:nth-child(5), .total-row td:nth-child(6), .total-row td:nth-child(7), .total-row td:nth-child(8) {
                text-align: right;
                padding-right: 20px;
            }

            /* Producers view total row */
            .producers-view .total-row td:nth-child(2), 
            .producers-view .total-row td:nth-child(3), 
            .producers-view .total-row td:nth-child(4), 
            .producers-view .total-row td:nth-child(5) {
                text-align: right;
                padding-right: 20px;
            }

            .charts-container {
                display: flex;
                flex-direction: row;
                gap: 32px;
                margin-top: 0;
                width: 100%;
                justify-content: center;
                align-items: stretch;
            }
            .charts-container .card {
                flex: 1 1 0;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                justify-content: center;
                min-width: 0;
                min-height: 500px;
                border-radius: 24px;
                border: 1px solid #e0e0e0;
                box-shadow: 0 2px 16px 0 rgba(44,62,80,0.07);
                margin: 0;
                padding: 32px 16px 24px 16px;
                background: #fff;
            }
            .charts-container canvas {
                width: 100% !important;
                height: 400px !important;
                max-width: 700px;
                max-height: 400px;
                display: block;
                margin: 0 auto;
                background: #fff;
                border-radius: 16px;
                flex: 1;
            }
            @media (max-width: 1024px) {
                .container {
                    max-width: 95vw;
                    width: 95vw;
                }
                .charts-container {
                    flex-direction: column;
                }
                .charts-container .card {
                    max-width: 100vw;
                    min-height: 350px;
                }
                .charts-container canvas {
                    height: 300px !important;
                }
            }

            @media (max-width: 768px) {
                body {
                    padding: 20px;
                }
                
                .card {
                    padding: 20px;
                }

                .header {
                    text-align: center;
                }

                table {
                    font-size: 0.75rem;
                }
            }

            .disclaimer-section {
                margin-top: 70px;
                background-color: #f8f9fa;
                border: 1px solid #e0e0e0;
            }

            .disclaimer-section h3 {
                color: var(--text-primary);
                margin: 0 0 20px 0;
                font-size: 1.25rem;
                font-weight: 600;
            }

            .disclaimer-section p {
                margin-bottom: 16px;
                font-size: 0.875rem;
                color: var(--text-secondary);
                line-height: 1.6;
            }

            .disclaimer-section p:last-child {
                margin-bottom: 0;
            }

            /* Zápatí s informacemi o vypracování - pro normální zobrazení */
            .footer-info {
                position: fixed;
                bottom: 10px;
                left: 20px;
                font-size: 0.75rem;
                color: #666;
                background-color: rgba(255, 255, 255, 0.9);
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #e0e0e0;
                z-index: 1000;
            }

            .inline-edit {
                background: transparent;
                border: 1px solid transparent;
                width: 100%;
                padding: 4px;
                font-size: inherit;
                font-family: inherit;
                color: var(--text-primary);
            }

            .inline-edit:hover {
                border-color: var(--border-color);
            }

            .inline-edit:focus {
                border-color: var(--primary-blue);
                outline: none;
                background: white;
            }

            /* Pro zachování vzhledu čísel */
            .fond-table td:nth-child(4) .inline-edit,
            .fond-table td:nth-child(5) .inline-edit {
                text-align: right;
            }
        </style>
    </head>
    <body>
                    <div class="container">
                <!-- Úvod Section -->
                <div class="card intro-section">
                    <div class="header">
                        <div class="logo-section">
                            <div class="jpl-logo">JPL</div>
                        </div>
                        <div class="title-section">
                            <h1>Investiční portfolio - <span class="client-name-highlight">${clientName}</span></h1>
                            <p class="report-date">${new Date().toLocaleDateString('cs-CZ')}</p>
                        </div>
                        <div class="slogan-section">
                            <div class="slogan-text">
                                <p>Více než 30 let</p>
                                <p>propojujeme svět</p>
                                <p class="highlight">financí a sportu</p>
                            </div>
                            <div class="slogan-line"></div>
                        </div>
                    </div>
                </div>

                <!-- Table Section -->
                <div class="card table-section">
                    <table id="portfolioTable" class="${viewMode === 'producers' ? 'producers-view' : ''}">
                        <thead>
                            ${tableHeader}
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>

                <!-- Spacer pro tisk -->
                <div class="print-spacer"></div>
                
                <!-- Charts Section -->
                <div class="charts-container">
                    <div class="card">
                        <canvas id="pieChart" width="700" height="400"></canvas>
                    </div>
                    <div class="card">
                        <canvas id="barChart" width="700" height="400"></canvas>
                    </div>
                </div>

                <!-- Disclaimer Section -->
                <div class="card disclaimer-section">
                    <h3>Upozornění:</h3>
                    <p>S investičními nástroji je spojeno riziko kolísání aktuální hodnoty investované částky a není zaručena její návratnost. Výsledky dosažené v minulosti v žádném případě nezaručují výsledky v budoucnosti.</p>
                    <p>Uvedené výnosy jsou prezentovány v hrubých hodnotách. Pro získání čistých hodnot výnosů musí zákazník zohlednit související poplatky a případné zdanění, které závisí na osobních poměrech zákazníka a může se měnit.</p>
                    <p>Pokud zákazník investuje v jiné měně než CZK, je nutné mít na paměti, že výnosnost může v důsledku kolísání devizových kurzů stoupat nebo klesat.</p>
                </div>

                <!-- Zápatí s informacemi o vypracování -->
                <div class="footer-info">
                    Vypracoval: ${advisorName}<br>
                    Email: ${advisorEmail}
                </div>
            </div>

        <script>window.reportViewMode = '${viewMode}';</script>
        <script>
            // Zajistit vykreslení grafů před tiskem
            window.addEventListener('beforeprint', function() {
                // Znovu vykreslit všechny grafy
                if (window.myPieChart) window.myPieChart.update();
                if (window.myBarChart) window.myBarChart.update();
            });
            
            document.addEventListener('DOMContentLoaded', async function() {
                // Load Chart.js on-demand before first use
                if (window.libraryLoader && !window.libraryLoader.loaded?.chart) {
                    try {
                        await window.libraryLoader.loadChart();
                    } catch (e) {
                        console.error('❌ Failed to load Chart.js:', e);
                        return;
                    }
                }
                
                Chart.register(window.ChartDataLabels);
                // Data pro grafy
                const portfolioData = ${JSON.stringify(portfolioData)};
                const validData = portfolioData.filter(item => !isNaN(item.value) && !isNaN(item.investment));
                if (!validData.length) {
                    safeRemoveElement('pieChart');
                    safeRemoveElement('barChart');
                    const charts = safeQuerySelector('.charts-container');
                    charts.innerHTML = '<div style="width:100%;text-align:center;color:#aaa;font-size:1.2rem;padding:60px 0;">Žádná data pro zobrazení grafů</div>';
                    return;
                }
                // Barvy podle vzoru - tmavé modro-šedé s jednou oranžovou
                const fondColors = {
                    positive: ['#C8940A', '#000000', '#3f3f3f', '#595959', '#818181', '#343d46', '#4f5b66', '#65737e', '#a7adba', '#c0c5ce'],
                    negative: ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2']
                };
                // Donut Chart
                try {
                    let donutLabels, donutValues;
                    if (window.reportViewMode === 'producers') {
                        // Agregace podle producenta
                        const producerMap = {};
                        validData.forEach(item => {
                            if (!producerMap[item.producer]) {
                                producerMap[item.producer] = 0;
                            }
                            producerMap[item.producer] += Number(item.value);
                        });
                        donutLabels = Object.keys(producerMap);
                        donutValues = Object.values(producerMap);
                    } else {
                        // Seřadit data podle hodnoty sestupně, aby zlatá byla nahoře
                        const sortedData = [...validData].sort((a, b) => b.value - a.value);
                        donutLabels = sortedData.map(item => item.name);
                        donutValues = sortedData.map(item => item.value);
                    }
                    const showLabels = donutLabels.length <= 6;
                    window.myPieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: donutLabels,
                            datasets: [{
                                data: donutValues,
                                backgroundColor: fondColors.positive,
                                borderWidth: 2,
                                borderColor: '#fff',
                                hoverOffset: 10,
                            }]
                        },
                        options: {
                            responsive: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        font: { size: 12, weight: 'normal' },
                                        boxWidth: 14,
                                        padding: 8,
                                        color: '#2c3e50',
                                        usePointStyle: true,
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Rozdělení portfolia',
                                    font: { size: 22, weight: 600 },
                                    color: '#2c3e50',
                                    padding: { top: 0, bottom: 24 }
                                },
                                tooltip: {
                                    enabled: true,
                                    backgroundColor: '#fff',
                                    titleColor: '#2c3e50',
                                    bodyColor: '#2c3e50',
                                    borderColor: '#e0e0e0',
                                    borderWidth: 1,
                                    titleFont: { size: 12 },
                                    bodyFont: { size: 10 }
                                },
                                datalabels: {
                                    display: showLabels,
                                    color: '#fff',
                                    font: { weight: 'bold', size: 12 },
                                    formatter: (value, ctx) => {
                                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                                        return percent + '%';
                                    }
                                }
                            },
                            cutout: '65%',
                            layout: { padding: 8 },
                        },
                        plugins: [window.ChartDataLabels]
                    });
                } catch (e) { safeSetDisplay('pieChart', 'none'); }
                // Bar Chart
                try {
                    let barLabels, barData, barColors, fullLabels;
                    if (window.reportViewMode === 'producers') {
                        // Agregace podle producenta
                        const producerMap = {};
                        validData.forEach(item => {
                            if (!producerMap[item.producer]) {
                                producerMap[item.producer] = { investment: 0, value: 0 };
                            }
                            producerMap[item.producer].investment += Number(item.investment);
                            producerMap[item.producer].value += Number(item.value);
                        });
                        const rows = Object.entries(producerMap).map(([producer, d]) => {
                            const profit = d.value - d.investment;
                            const yieldPercent = d.investment !== 0 ? ((profit / d.investment) * 100) : 0;
                            return {
                                producer,
                                yieldPercent
                            };
                        });
                        // Seřadit podle výnosu sestupně
                        rows.sort((a, b) => b.yieldPercent - a.yieldPercent);
                        fullLabels = rows.map(r => r.producer);
                        barLabels = rows.map(r => r.producer.length > 20 ? r.producer.slice(0, 20) + '...' : r.producer);
                        barData = rows.map(r => r.yieldPercent);
                        barColors = rows.map((r, i) => r.yieldPercent >= 0 ? fondColors.positive[i % fondColors.positive.length] : fondColors.negative[i % fondColors.negative.length]);
                    } else {
                        const sortedData = [...validData].sort((a, b) => {
                            const yieldA = ((a.value - a.investment) / a.investment * 100);
                            const yieldB = ((b.value - b.investment) / b.investment * 100);
                            return yieldB - yieldA;
                        });
                        const maxLabelLength = 20;
                        barLabels = sortedData.map(item => item.name.length > maxLabelLength ? item.name.slice(0, maxLabelLength) + '...' : item.name);
                        fullLabels = sortedData.map(item => item.name);
                        barData = sortedData.map(item => ((item.value - item.investment) / item.investment * 100));
                        barColors = sortedData.map((item, index) => {
                            const yieldPercent = ((item.value - item.investment) / item.investment * 100);
                            return yieldPercent >= 0 ? fondColors.positive[index % fondColors.positive.length] : fondColors.negative[index % fondColors.negative.length];
                        });
                    }
                    window.myBarChart = new Chart(document.getElementById('barChart').getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: barLabels,
                            datasets: [{
                                label: 'Výnos v %',
                                data: barData,
                                backgroundColor: barColors,
                                borderRadius: 6,
                                borderSkipped: false,
                                barPercentage: 0.8,
                                categoryPercentage: 0.9,
                                datalabels: {
                                    anchor: 'end',
                                    align: 'end',
                                    color: '#2c3e50',
                                    font: { weight: 'normal', size: 10 },
                                    formatter: v => v.toFixed(2) + '%'
                                }
                            }]
                        },
                        options: {
                            responsive: false,
                            plugins: {
                                legend: { display: false },
                                title: {
                                    display: true,
                                    text: 'Výnosy jednotlivých fondů',
                                    font: { size: 22, weight: 600 },
                                    color: '#2c3e50',
                                    padding: { top: 0, bottom: 24 }
                                },
                                tooltip: {
                                    enabled: true,
                                    backgroundColor: '#fff',
                                    titleColor: '#2c3e50',
                                    bodyColor: '#2c3e50',
                                    borderColor: '#e0e0e0',
                                    borderWidth: 1,
                                    titleFont: { size: 12 },
                                    bodyFont: { size: 10 },
                                    callbacks: {
                                        title: function(context) {
                                            const idx = context[0].dataIndex;
                                            return fullLabels[idx];
                                        }
                                    }
                                },
                                datalabels: {
                                    display: true,
                                    color: '#2c3e50',
                                    font: { weight: 'normal', size: 10 },
                                    anchor: 'end',
                                    align: 'end',
                                    formatter: v => v.toFixed(2) + '%'
                                }
                            },
                            layout: { padding: 8 },
                            scales: {
                                x: {
                                    ticks: {
                                        font: { size: 10, weight: 'normal' },
                                        color: '#2c3e50',
                                        maxRotation: 45,
                                        minRotation: 45,
                                        autoSkip: false,
                                        align: 'start',
                                    },
                                    grid: { display: false }
                                },
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        font: { size: 10, weight: 'normal' },
                                        color: '#2c3e50',
                                        callback: function(value) { return value + '%'; }
                                    },
                                    grid: { color: '#e0e0e0', borderDash: [4, 4] }
                                }
                            }
                        },
                        plugins: [window.ChartDataLabels]
                    });
                } catch (e) { safeSetDisplay('barChart', 'none'); }
            });
        </script>
    </body>
    </html>`;

  // Vytvoření a stažení HTML souboru
  const blob = new Blob([html], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio-report.html';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Make sure the color picker is initialized with a default selection
document.addEventListener('DOMContentLoaded', function () {
  // Select blue as default (only if element exists)
  const defaultColor = safeQuerySelector('.color-option[data-color="blue"]');
  if (defaultColor) {
    defaultColor.classList.add('selected');
  }
});

// Add this HTML to the portfolioCard div through JavaScript
const csvImportHTML = `
    <div class="form-group csv-import-section">
        <h4>Import dat z CSV</h4>
        <div class="csv-format-info">
            <p><strong>Požadovaný formát CSV:</strong></p>
            <code>Název fondu,Producent,Datum investice,Čistá investice,Aktuální hodnota</code>
            <p><small>Příklad: "Conseq Invest Akcie Nové Evropy,Avant,2023-01-15,100000,105000"</small></p>
        </div>
        <div class="csv-controls">
            <input type="file" id="csvFile" accept=".csv" class="form-control">
            <button id="processCSV" class="btn btn-primary">Zpracovat CSV</button>
        </div>
    </div>
`;

// Insert the CSV import section before the existing form
portfolioForm.insertAdjacentHTML('beforebegin', csvImportHTML);

// Add event listener for the process CSV button
safeAddEventListener('processCSV', 'click', function () {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Prosím, nejdříve vyberte CSV soubor');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.split('\n').filter((row) => row.trim());

    // Skip header row if it exists
    const startIndex = rows[0].toLowerCase().includes('název fondu') ? 1 : 0;

    // Process each row
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];

      // Parse CSV row properly handling quoted fields
      const columns = [];
      let currentColumn = '';
      let insideQuotes = false;

      for (let j = 0; j < row.length; j++) {
        const char = row[j];

        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          columns.push(currentColumn.trim());
          currentColumn = '';
        } else {
          currentColumn += char;
        }
      }
      columns.push(currentColumn.trim()); // Add the last column

      if (columns.length >= 5) {
        const [name, producer, investmentDate, investment, value] = columns.map((col) =>
          col.replace(/^"|"$/g, '')
        );
        const investmentNum = parseFloat(investment.replace(/\s/g, ''));
        const valueNum = parseFloat(value.replace(/\s/g, ''));

        if (!isNaN(investmentNum) && !isNaN(valueNum)) {
          // Konverze data z různých formátů na ISO formát (yyyy-mm-dd)
          let formattedDate = '';
          if (investmentDate && investmentDate.trim() !== '') {
            try {
              // Zkusíme různé formáty data
              let dateObj;

              // Formát mm/dd/yyyy nebo mm-dd-yyyy
              if (investmentDate.includes('/') || investmentDate.includes('-')) {
                dateObj = new Date(investmentDate);
              } else {
                // Jiné formáty
                dateObj = new Date(investmentDate);
              }

              // Kontrola, že datum je platné
              if (dateObj.getTime() && !isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0]; // yyyy-mm-dd
              }
            } catch (e) {}
          }

          portfolioData.push({
            name: name,
            producer: producer,
            investmentDate: formattedDate,
            investment: investmentNum,
            value: valueNum,
          });
        } else {
        }
      } else if (columns.length >= 4) {
        // Fallback pro starý formát bez data investice
        const [name, producer, investment, value] = columns.map((col) => col.replace(/^"|"$/g, ''));
        const investmentNum = parseFloat(investment.replace(/\s/g, ''));
        const valueNum = parseFloat(value.replace(/\s/g, ''));

        if (!isNaN(investmentNum) && !isNaN(valueNum)) {
          portfolioData.push({
            name: name,
            producer: producer,
            investmentDate: '', // Prázdné datum pro starý formát
            investment: investmentNum,
            value: valueNum,
          });
        } else {
        }
      } else {
      }
    }

    // Update the table and show it
    updateFondTable();
    safeSetDisplay('fondListCard', 'block');

    // Clear the file input
    fileInput.value = '';

    // Show success message
    alert('CSV soubor byl úspěšně zpracován');
  };

  reader.onerror = function () {
    alert('Chyba při čtení souboru');
  };

  reader.readAsText(file, 'UTF-8');
});

// Add these styles to your CSS
const styles = `
    .csv-import-section {
        background: var(--bg-secondary);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .csv-format-info {
        margin: 15px 0;
        padding: 12px;
        background: var(--card-background);
        border-left: 4px solid var(--primary-blue);
        color: var(--text-secondary);
        border-radius: 4px;
    }

    .csv-format-info strong {
        font-weight: 700;
    }

    .csv-format-info p {
        margin: 8px 0;
    }

    .csv-format-info code {
        display: block;
        padding: 10px;
        background: var(--background);
        margin: 10px 0;
        font-weight: 600;
        border-radius: 4px;
        border: 1px solid var(--border-color);
    }

    .csv-controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    #processCSV {
        white-space: nowrap;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Ensure portfolioData is initialized if it doesn't exist
if (typeof portfolioData === 'undefined') {
  window.portfolioData = [];
}

// Úprava generateCSV - vždy exportuje ve formátu fondů
function generateCSV(data) {
  // Check if currency switch is enabled
  const currencySwitch = document.getElementById('currencySwitch');
  const useEuros = currencySwitch ? currencySwitch.checked : false;
  const currencySymbol = useEuros ? '€' : 'Kč';

  // Vždy exportujeme ve formátu fondů, bez ohledu na viewMode
  const csvRows = [
    `Název fondu,Producent,Datum investice,Čistá investice (${currencySymbol}),Aktuální hodnota (${currencySymbol})`,
  ];
  data.forEach((item) => {
    const row = [
      '"' + item.name + '"',
      '"' + item.producer + '"',
      item.investmentDate || '',
      item.investment,
      item.value,
    ];
    csvRows.push(row.join(','));
  });
  const csvContent = csvRows.join('\n');
  const BOM = '\uFEFF';
  const csvContentWithBOM = BOM + csvContent;
  const blob = new Blob([csvContentWithBOM], {
    type: 'text/csv;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  const fileName = `portfolio-${clientName}-${date}.csv`;
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Přidám event listenery na přepínače
document.addEventListener('DOMContentLoaded', function () {
  const switchFunds = document.getElementById('switchFunds');
  const switchProducers = document.getElementById('switchProducers');
  if (switchFunds && switchProducers) {
    switchFunds.addEventListener('click', function () {
      viewMode = 'funds';
      switchFunds.classList.add('active');
      switchProducers.classList.remove('active');
      updateFondTable();
    });
    switchProducers.addEventListener('click', function () {
      viewMode = 'producers';
      switchProducers.classList.add('active');
      switchFunds.classList.remove('active');
      updateFondTable();
    });
  }

  // Search functionality
  const tableSearch = document.getElementById('tableSearch');
  const clearSearch = document.getElementById('clearSearch');

  if (tableSearch) {
    tableSearch.addEventListener('input', function (e) {
      const searchTerm = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('.fond-table tbody tr');

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });

      clearSearch.style.display = searchTerm ? 'block' : 'none';
    });
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', function () {
      tableSearch.value = '';
      tableSearch.dispatchEvent(new Event('input'));
    });
  }
});
