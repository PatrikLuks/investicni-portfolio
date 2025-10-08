// ==================== DOM ELEMENT REFERENCES ====================
// Lazy initialization - získání referencí až když jsou potřeba
let clientForm, portfolioForm, generateReportBtn, fondList;
let clientNameCard, portfolioCard, fondListCard, clientNameDisplay, dashboard;

// Initialize DOM references when DOM is ready
function initializeDOMReferences() {
    clientForm = document.getElementById('clientForm');
    portfolioForm = document.getElementById('portfolioForm');
    generateReportBtn = document.getElementById('generateReport');
    fondList = document.getElementById('fondList');
    clientNameCard = document.getElementById('clientNameCard');
    portfolioCard = document.getElementById('portfolioCard');
    fondListCard = document.getElementById('fondListCard');
    clientNameDisplay = document.getElementById('clientNameDisplay');
    dashboard = document.getElementById('dashboard');
}

// Add these variables at the top with other declarations
let advisorName = '';
let advisorEmail = '';
let viewMode = 'funds'; // 'funds' nebo 'producers'
let currentSortColumn = null;
let currentSortDirection = 'asc';
let searchQuery = '';


// ==================== STORAGE & PERSISTENCE ====================
class PortfolioStorage {
    constructor() {
        this.storageKey = 'portfolioData_v2';
        this.clientKey = 'portfolioClient_v2';
        this.lastSaveKey = 'portfolioLastSave_v2';
        this.autosaveInterval = null;
    }
    
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            const now = new Date().toISOString();
            localStorage.setItem(this.lastSaveKey, now);
            this.updateLastSaveDisplay(now);
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            showToast('error', 'Chyba uložení', 'Nepodařilo se uložit data do localStorage');
            return false;
        }
    }
    
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Load failed:', e);
            return [];
        }
    }
    
    saveClient(client) {
        try {
            localStorage.setItem(this.clientKey, JSON.stringify(client));
            return true;
        } catch (e) {
            console.error('Client save failed:', e);
            return false;
        }
    }
    
    loadClient() {
        try {
            const client = localStorage.getItem(this.clientKey);
            return client ? JSON.parse(client) : null;
        } catch (e) {
            console.error('Client load failed:', e);
            return null;
        }
    }
    
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.clientKey);
            localStorage.removeItem(this.lastSaveKey);
            showToast('info', 'Data smazána', 'Všechna data byla vymazána');
            return true;
        } catch (e) {
            console.error('Clear failed:', e);
            return false;
        }
    }
    
    startAutosave(callback) {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }
        this.autosaveInterval = setInterval(() => {
            if (callback) callback();
        }, 30000); // 30 sekund
    }
    
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
    }
    
    updateLastSaveDisplay(isoString) {
        const date = new Date(isoString);
        const timeStr = date.toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const indicator = document.getElementById('lastSaveIndicator');
        const timeElement = document.getElementById('lastSaveTime');
        
        if (indicator && timeElement) {
            timeElement.textContent = `Uloženo ${timeStr}`;
            indicator.style.opacity = '1';
            
            // Pulse animation
            indicator.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                indicator.style.animation = '';
                indicator.style.opacity = '0.7';
            }, 2000);
        }
    }
    
    getLastSaveTime() {
        const lastSave = localStorage.getItem(this.lastSaveKey);
        return lastSave ? new Date(lastSave) : null;
    }
}

const storage = new PortfolioStorage();

// ==================== UTILITY FUNCTIONS ====================
// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Safe number parsing with validation
function parseSafeNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    const parsed = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

// Validate form data
function validateFondData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim() === '') {
        errors.push('Název fondu je povinný');
    }
    
    if (!data.producer || data.producer.trim() === '') {
        errors.push('Správce je povinný');
    }
    
    const investment = parseSafeNumber(data.investment);
    if (investment <= 0) {
        errors.push('Investice musí být kladné číslo');
    }
    
    const value = parseSafeNumber(data.value);
    if (value < 0) {
        errors.push('Hodnota nemůže být záporná');
    }
    
    return errors;
}

// Confirmation dialog with custom styling
function showConfirmDialog(title, message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease-in-out;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        animation: slideInDown 0.3s ease-in-out;
    `;
    
    dialog.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; color: #333;">${title}</h3>
        <p style="margin: 0 0 1.5rem 0; color: #666;">${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button id="cancelBtn" class="btn" style="background: #e0e0e0; color: #333;">Zrušit</button>
            <button id="confirmBtn" class="btn btn-danger" style="background: #dc3545; color: white;">Potvrdit</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const confirmBtn = dialog.querySelector('#confirmBtn');
    const cancelBtn = dialog.querySelector('#cancelBtn');
    
    const cleanup = () => {
        overlay.style.animation = 'fadeOut 0.2s ease-in-out';
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

// Export chart as PNG
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

// Loading overlay
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

// Empty state management
function toggleEmptyState(show) {
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('fondTable');
    
    if (emptyState && table) {
        if (show) {
            emptyState.style.display = 'block';
            table.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            table.style.display = 'table';
        }
    }
}

// Bulk selection state
let selectedRows = new Set();

function updateBulkActionsBar() {
    const bar = document.getElementById('bulkActionsBar');
    const count = document.getElementById('selectedCount');
    
    if (bar && count) {
        count.textContent = selectedRows.size;
        if (selectedRows.size > 0) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
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
    if (checked) {
        portfolioData.forEach((_, index) => selectedRows.add(index));
    } else {
        selectedRows.clear();
    }
    updateBulkActionsBar();
    updateFondTable();
}

function bulkDeleteSelected() {
    if (selectedRows.size === 0) return;
    
    showConfirmDialog(
        'Smazat vybrané fondy?',
        `Opravdu chcete smazat ${selectedRows.size} vybraných fondů? Tato akce je nevratná.`,
        () => {
            // Sort indices in descending order to avoid index shifting
            const indices = Array.from(selectedRows).sort((a, b) => b - a);
            indices.forEach(index => {
                portfolioData.splice(index, 1);
            });
            
            selectedRows.clear();
            updateBulkActionsBar();
            updateFondTable();
            updateDashboard();
            storage.saveData(portfolioData);
            
            showToast('success', 'Fondy smazány', `${indices.length} fondů bylo úspěšně odstraněno`);
            
            // Check if portfolio is empty
            if (portfolioData.length === 0) {
                document.getElementById('fondListCard').style.display = 'none';
                dashboard.style.display = 'none';
            }
        }
    );
}

function bulkExportSelected() {
    if (selectedRows.size === 0) return;
    
    const selected = portfolioData.filter((_, index) => selectedRows.has(index));
    generateCSV(selected);
    showToast('success', 'Export dokončen', `${selected.length} fondů bylo exportováno`);
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
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
    
    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== DASHBOARD KPI FUNCTIONS ====================
function updateDashboard() {
    if (portfolioData.length === 0) {
        dashboard.style.display = 'none';
        return;
    }
    
    dashboard.style.display = 'grid';
    
    // Calculate metrics
    const totalInvestment = portfolioData.reduce((sum, item) => sum + Number(item.investment), 0);
    const totalValue = portfolioData.reduce((sum, item) => sum + Number(item.value), 0);
    const totalProfit = totalValue - totalInvestment;
    const totalYield = totalInvestment !== 0 ? ((totalProfit / totalInvestment) * 100) : 0;
    
    // Find best performing fund
    let bestFund = null;
    let bestYield = -Infinity;
    portfolioData.forEach(item => {
        const fundYield = ((item.value - item.investment) / item.investment) * 100;
        if (fundYield > bestYield) {
            bestYield = fundYield;
            bestFund = item;
        }
    });
    
    // Animate numbers with count-up effect
    animateValue('kpiValueInvestment', 0, totalInvestment, 1000, true);
    animateValue('kpiValueCurrent', 0, totalValue, 1000, true);
    animateValue('kpiValueYield', 0, totalYield, 1000, false);
    
    // Update profit amount
    document.getElementById('kpiProfitAmount').textContent = 
        (totalProfit >= 0 ? '+' : '') + totalProfit.toLocaleString('cs-CZ') + ' Kč';
    
    // Update yield card styling
    const yieldCard = document.getElementById('kpiTotalYield');
    const yieldChange = document.getElementById('kpiChangeYield');
    if (totalYield >= 0) {
        yieldCard.classList.remove('negative');
        yieldCard.classList.add('positive');
        yieldChange.classList.remove('negative');
        yieldChange.classList.add('positive');
        yieldChange.querySelector('span:first-child').textContent = '↑';
    } else {
        yieldCard.classList.remove('positive');
        yieldCard.classList.add('negative');
        yieldChange.classList.remove('positive');
        yieldChange.classList.add('negative');
        yieldChange.querySelector('span:first-child').textContent = '↓';
    }
    
    // Update best fund
    if (bestFund) {
        const shortName = bestFund.name.length > 50 
            ? bestFund.name.substring(0, 50) + '...' 
            : bestFund.name;
        document.getElementById('kpiValueBestFund').textContent = shortName;
        document.getElementById('kpiBestFundYield').textContent = 
            `Nejvyšší výnos: ${bestYield.toFixed(2)}%`;
    }
}

// Animate number count-up effect
function animateValue(elementId, start, end, duration, isCurrency = false) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (isCurrency) {
            element.textContent = Math.round(current).toLocaleString('cs-CZ') + ' Kč';
        } else {
            const prefix = current >= 0 ? '+' : '';
            element.textContent = prefix + current.toFixed(2) + '%';
        }
    }, 16);
}

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
                ${portfolioData.map((item, index) => `
                    <tr>
                        <td><input type="text" class="inline-edit" value="${item.name}" onchange="updateFondData(${index}, 'name', this.value)"></td>
                        <td><input type="text" class="inline-edit" value="${item.producer}" onchange="updateFondData(${index}, 'producer', this.value)"></td>
                        <td><input type="number" class="inline-edit" value="${item.investment}" onchange="updateFondData(${index}, 'investment', this.value)"></td>
                        <td><input type="number" class="inline-edit" value="${item.value}" onchange="updateFondData(${index}, 'value', this.value)"></td>
                        <td>
                            <button class="delete-btn" onclick="deleteFond(${index})">Smazat</button>
                        </td>
                    </tr>
                `).join('')}
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
    
    // Save to localStorage
    storage.saveData(portfolioData);
}

function deleteFond(index) {
    portfolioData.splice(index, 1);
    updateFondList();
}

// Event listener pro formulář se jménem klienta
clientForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clientName = document.getElementById('clientName').value;
    advisorName = document.getElementById('advisorName').value;
    advisorEmail = document.getElementById('advisorEmail').value;

    // Save client info
    storage.saveClient({ clientName, advisorName, advisorEmail });

    // Hide first card, show portfolio card
    document.getElementById('clientNameCard').style.display = 'none';
    document.getElementById('portfolioCard').style.display = 'block';
    document.getElementById('fondListCard').style.display = 'block';
    document.getElementById('clientNameDisplay').textContent = clientName;
    
    // Show dashboard if data exists
    if (portfolioData.length > 0) {
        dashboard.style.display = 'grid';
        updateDashboard();
    }

    // Initialize color picker after showing the portfolio card
    initializeColorPicker();
    
    // Start autosave
    storage.startAutosave(() => {
        storage.saveData(portfolioData);
        const display = document.getElementById('lastSaveDisplay');
        if (display) {
            display.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                if (display) display.style.animation = '';
            }, 500);
        }
    });
    
    showToast('success', 'Vítejte!', `Portfolio pro ${clientName} je připraveno`);
});

function initializeColorPicker() {
    const buttons = document.querySelectorAll('.scheme-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set the color scheme based on the clicked button
            if (this.classList.contains('blue-scheme')) window.selectedColorScheme = 'blue';
            if (this.classList.contains('red-scheme')) window.selectedColorScheme = 'red';
            if (this.classList.contains('green-scheme')) window.selectedColorScheme = 'green';
            if (this.classList.contains('yellow-scheme')) window.selectedColorScheme = 'yellow';
            
            console.log('Selected new color scheme:', window.selectedColorScheme);
        });
    });
    
    // Set default color scheme
    const blueButton = document.querySelector('.blue-scheme');
    if (blueButton) {
        blueButton.classList.add('active');
        window.selectedColorScheme = 'blue';
    }
}

// Event listener pro formulář
portfolioForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fondData = {
        name: document.getElementById('fondName').value.trim(),
        producer: document.getElementById('producer').value.trim(),
        investment: parseSafeNumber(document.getElementById('investment').value),
        investmentDate: document.getElementById('investmentDate').value,
        value: parseSafeNumber(document.getElementById('value').value)
    };

    // Validate data with improved validation
    const errors = validateFondData(fondData);
    if (errors.length > 0) {
        showToast('error', 'Validační chyba', errors.join('<br>'));
        return;
    }

    try {
        // Přidáme nový fond do pole
        portfolioData.push(fondData);
        
        // Přidáme fond do localStorage, pokud tam ještě není
        addNewFund(fondData.name);
        
        // Aktualizujeme tabulku a dashboard
        updateFondTable();
        updateDashboard();
        
        // Save to localStorage
        if (!storage.saveData(portfolioData)) {
            // If save failed, remove the added item
            portfolioData.pop();
            updateFondTable();
            updateDashboard();
            return;
        }
        
        // Vyčistíme formulář
        document.getElementById('portfolioForm').reset();
        
        // Zobrazíme kartu se seznamem fondů
        document.getElementById('fondListCard').style.display = 'block';
        
        // Show success toast
        showToast('success', 'Fond přidán', `${fondData.name} byl úspěšně přidán do portfolia`);
    } catch (error) {
        console.error('Error adding fond:', error);
        showToast('error', 'Chyba', 'Nepodařilo se přidat fond. Zkuste to prosím znovu.');
    }
});

function updateFondTable() {
    const tbody = document.getElementById('fondTableBody');
    const thead = document.getElementById('fondTableHead');
    tbody.innerHTML = '';
    
    if (viewMode === 'funds') {
        // Hlavička pro fondy
        if (thead) {
            thead.innerHTML = `<tr>
                <th class="sortable" data-column="name">Název fondu</th>
                <th class="sortable" data-column="producer">Producent</th>
                <th class="sortable" data-column="investmentDate">Datum investice</th>
                <th class="sortable" data-column="investment">Čistá investice</th>
                <th class="sortable" data-column="value">Aktuální hodnota</th>
                <th>Akce</th>
            </tr>`;
        }
        
        // Apply filters and sorting
        const filteredData = filterAndSortData(portfolioData);
        
        // Show message if no results
        if (filteredData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                ${searchQuery ? '🔍 Žádné výsledky pro "' + searchQuery + '"' : 'Žádné fondy'}
            </td>`;
            tbody.appendChild(row);
            return;
        }
        
        // Render filtered and sorted data
        filteredData.forEach((fond) => {
            // Find original index for operations
            const originalIndex = portfolioData.indexOf(fond);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="inline-edit" value="${fond.name}" data-index="${originalIndex}" data-field="name"></td>
                <td><input type="text" class="inline-edit" value="${fond.producer}" data-index="${originalIndex}" data-field="producer"></td>
                <td><input type="date" class="inline-edit" value="${fond.investmentDate && fond.investmentDate !== '1970-01-01' ? fond.investmentDate : ''}" data-index="${originalIndex}" data-field="investmentDate"></td>
                <td><input type="number" class="inline-edit" value="${fond.investment}" data-index="${originalIndex}" data-field="investment"></td>
                <td><input type="number" class="inline-edit" value="${fond.value}" data-index="${originalIndex}" data-field="value"></td>
                <td><button class="delete-btn" onclick="deleteFond(${originalIndex})">Smazat</button></td>
            `;
            tbody.appendChild(row);
        });
        
        // Přidáme event listener pro změny v inputech
        document.querySelectorAll('.inline-edit').forEach(input => {
            input.addEventListener('change', function() {
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
                updateDashboard(); // Update dashboard when data changes
                showToast('info', 'Změna uložena', 'Data byla aktualizována');
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
        portfolioData.forEach(item => {
            if (!producerMap[item.producer]) {
                producerMap[item.producer] = { investment: 0, value: 0 };
            }
            producerMap[item.producer].investment += Number(item.investment);
            producerMap[item.producer].value += Number(item.value);
        });
        const rows = Object.entries(producerMap).map(([producer, data]) => {
            const profit = data.value - data.investment;
            const yieldPercent = data.investment !== 0 ? ((profit / data.investment) * 100).toFixed(2) : '0.00';
            return {
                producer,
                investment: data.investment,
                value: data.value,
                profit,
                yieldPercent
            };
        });
        rows.forEach(rowData => {
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
    const fondName = portfolioData[index].name;
    
    showConfirmDialog(
        'Odstranit fond?',
        `Opravdu chcete odstranit fond "${fondName}"? Tato akce je nevratná.`,
        () => {
            // Confirmed - delete the fund
            portfolioData.splice(index, 1);
            updateFondTable();
            updateDashboard();
            
            // Save to localStorage
            storage.saveData(portfolioData);
            
            // Skryjeme tabulku a dashboard, pokud není žádný fond
            if (portfolioData.length === 0) {
                document.getElementById('fondListCard').style.display = 'none';
                dashboard.style.display = 'none';
            }
            
            // Show toast
            showToast('info', 'Fond odebrán', `${fondName.substring(0, 40)} byl odstraněn z portfolia`);
        }
    );
}

// Event listener pro generování reportu
generateReportBtn.addEventListener('click', function() {
    if (portfolioData.length === 0) {
        showToast('warning', 'Žádná data', 'Nejprve přidejte nějaké fondy do portfolia.');
        return;
    }
    
    // Generování HTML reportu
    generatePortfolioHTML(portfolioData);
    
    // Generování CSV
    generateCSV(portfolioData);
    
    // Show success toast
    showToast('success', 'Report vygenerován', 'HTML a CSV soubory byly úspěšně vytvořeny');
});

// Excel export button listener
const exportExcelBtn = document.getElementById('exportExcel');
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', function() {
        if (portfolioData.length === 0) {
            showToast('warning', 'Žádná data', 'Nejprve přidejte nějaké fondy do portfolia.');
            return;
        }
        
        // Export as CSV (can be opened in Excel)
        generateCSV(portfolioData);
        showToast('success', 'Export dokončen', 'Data byla exportována do CSV souboru');
    });
}

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
            colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe',
                    '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
            negativeColors: ['#c62828', '#d32f2f', '#e53935', '#f44336', '#ef5350',
                    '#e57373', '#ef9a9a', '#ffcdd2', '#ff8a80', '#ff5252']
        },
        red: {
            primary: '#c0392b',
            colors: ['#c0392b', '#cd6155', '#d98880', '#e6b0aa', '#f2d7d5',
                    '#943126', '#8c2d1c', '#7b241c', '#641e16', '#5c1916'],
            negativeColors: ['#c0392b', '#cd6155', '#d98880', '#e6b0aa', '#f2d7d5',
                    '#943126', '#8c2d1c', '#7b241c', '#641e16', '#5c1916']
        },
        green: {
            primary: '#27ae60',
            colors: ['#27ae60', '#2ecc71', '#58d68d', '#82e0aa', '#abebc6',
                    '#196f3d', '#145a32', '#186a3b', '#0b5345', '#145a32'],
            negativeColors: ['#c0392b', '#cd6155', '#d98880', '#e6b0aa', '#f2d7d5',
                    '#943126', '#8c2d1c', '#7b241c', '#641e16', '#5c1916']
        },
        yellow: {
            primary: '#f39c12',
            colors: ['#f39c12', '#f5b041', '#f8c471', '#fad7a0', '#fdebd0',
                    '#b9770e', '#9c640c', '#7e5109', '#634205', '#493303'],
            negativeColors: ['#c0392b', '#cd6155', '#d98880', '#e6b0aa', '#f2d7d5',
                    '#943126', '#8c2d1c', '#7b241c', '#641e16', '#5c1916']
        }
    };

    const selectedScheme = colorSchemes[selectedColor];
    console.log('Using color scheme:', selectedColor); // Pro debugování

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
        portfolioData.forEach(item => {
            if (!producerMap[item.producer]) {
                producerMap[item.producer] = { investment: 0, value: 0 };
            }
            producerMap[item.producer].investment += Number(item.investment);
            producerMap[item.producer].value += Number(item.value);
        });
        const rows = Object.entries(producerMap).map(([producer, data]) => {
            const profit = data.value - data.investment;
            const yieldPercent = data.investment !== 0 ? ((profit / data.investment) * 100).toFixed(2) : '0.00';
            return {
                producer,
                investment: data.investment,
                value: data.value,
                profit,
                yieldPercent
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
        portfolioData.forEach(item => {
            if (!producerMapForReport[item.producer]) {
                producerMapForReport[item.producer] = { investment: 0, value: 0 };
            }
            producerMapForReport[item.producer].investment += Number(item.investment);
            producerMapForReport[item.producer].value += Number(item.value);
        });
        const producerRows = Object.entries(producerMapForReport).map(([producer, data]) => {
            const profit = data.value - data.investment;
            const yieldPercent = data.investment !== 0 ? ((profit / data.investment) * 100).toFixed(2) : '0.00';
            return {
                producer,
                investment: data.investment,
                value: data.value,
                profit,
                yieldPercent
            };
        });
        producerRows.forEach(rowData => {
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
        totalYield = totalInvestment !== 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : '0.00';
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
        portfolioData.forEach(item => {
            const investment = Number(item.investment);
            const value = Number(item.value);
            const profit = value - investment;
            const yield = investment !== 0 ? ((profit / investment) * 100).toFixed(2) : '0.00';
            const currentDate = new Date().toLocaleDateString('cs-CZ');
            
            // Výpočet výnosu p.a. na základě doby držení
            let yieldPA = '0.00';
            if (item.investmentDate && item.investmentDate !== '' && item.investmentDate !== '1970-01-01' && investment !== 0) {
                try {
                    const investmentDate = new Date(item.investmentDate);
                    const currentDateObj = new Date();
                    
                    // Kontrola, že datum je platné
                    if (investmentDate.getTime() && investmentDate < currentDateObj) {
                        const daysHeld = Math.max(1, Math.floor((currentDateObj - investmentDate) / (1000 * 60 * 60 * 24)));
                        const yearsHeld = daysHeld / 365;
                        
                        if (yearsHeld > 0) {
                            const annualizedReturn = Math.pow(value / investment, 1 / yearsHeld) - 1;
                            yieldPA = (annualizedReturn * 100).toFixed(2);
                        } else {
                            yieldPA = yield; // Pokud je investice mladší než rok, použijeme běžný výnos
                        }
                    } else {
                        yieldPA = yield; // Neplatné datum
                    }
                } catch (e) {
                    yieldPA = yield; // Chyba při parsování data
                }
            } else {
                yieldPA = yield; // Fallback na běžný výnos
            }
            let displayDate;
            if (item.investmentDate && item.investmentDate !== '' && item.investmentDate !== '1970-01-01') {
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
                <td data-value="${yield}" class="${yield >= 0 ? 'positive' : 'negative'}">${yield}%</td>
                <td data-value="${yieldPA}" class="${yieldPA >= 0 ? 'positive' : 'negative'}">${yieldPA}%</td>
            </tr>`;
            totalInvestment += investment;
            totalValue += value;
            totalProfit += profit;
        });
        totalYield = totalInvestment !== 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : '0.00';
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
                        <canvas id="pieChart" width="700" height="700"></canvas>
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
            
            document.addEventListener('DOMContentLoaded', function() {
                Chart.register(window.ChartDataLabels);
                // Data pro grafy
                const portfolioData = ${JSON.stringify(portfolioData)};
                const validData = portfolioData.filter(item => !isNaN(item.value) && !isNaN(item.investment));
                if (!validData.length) {
                    document.getElementById('pieChart').remove();
                    document.getElementById('barChart').remove();
                    const charts = document.querySelector('.charts-container');
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
                    
                    // Create gradient colors for donut chart
                    const ctx = document.getElementById('pieChart').getContext('2d');
                    const gradientColors = fondColors.positive.map((color, index) => {
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        // Lighter shade at top, darker at bottom
                        gradient.addColorStop(0, color);
                        gradient.addColorStop(1, adjustBrightness(color, -20));
                        return gradient;
                    });
                    
                    window.myPieChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: donutLabels,
                            datasets: [{
                                data: donutValues,
                                backgroundColor: gradientColors,
                                borderWidth: 4,
                                borderColor: '#ffffff',
                                hoverOffset: 20,
                                hoverBorderWidth: 5,
                                hoverBorderColor: '#C8940A',
                                borderRadius: 8,
                                spacing: 2,
                                shadowOffsetX: 0,
                                shadowOffsetY: 8,
                                shadowBlur: 20,
                                shadowColor: 'rgba(200, 148, 10, 0.2)'
                            }]
                        },
                        options: {
                            responsive: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        font: { size: 13, weight: '600', family: 'Inter, system-ui' },
                                        boxWidth: 18,
                                        boxHeight: 18,
                                        padding: 15,
                                        color: '#1a1a1a',
                                        usePointStyle: true,
                                        pointStyle: 'rectRounded',
                                        generateLabels: function(chart) {
                                            const data = chart.data;
                                            if (data.labels.length && data.datasets.length) {
                                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                                return data.labels.map((label, i) => {
                                                    const value = data.datasets[0].data[i];
                                                    const percent = ((value / total) * 100).toFixed(1);
                                                    return {
                                                        text: label + ' (' + percent + '%)',
                                                        fillStyle: data.datasets[0].backgroundColor[i],
                                                        hidden: false,
                                                        index: i
                                                    };
                                                });
                                            }
                                            return [];
                                        }
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Rozdělení portfolia',
                                    font: { size: 26, weight: '800', family: 'Inter, system-ui' },
                                    color: '#0a0a0a',
                                    padding: { top: 10, bottom: 35 }
                                },
                                tooltip: {
                                    enabled: true,
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    titleColor: '#0a0a0a',
                                    bodyColor: '#333333',
                                    borderColor: '#C8940A',
                                    borderWidth: 3,
                                    titleFont: { size: 16, weight: '700', family: 'Inter, system-ui' },
                                    bodyFont: { size: 14, weight: '500', family: 'Inter, system-ui', lineHeight: 1.8 },
                                    padding: 20,
                                    boxPadding: 10,
                                    usePointStyle: true,
                                    displayColors: true,
                                    cornerRadius: 10,
                                    caretSize: 10,
                                    yAlign: 'center',
                                    xAlign: 'center',
                                    bodySpacing: 8,
                                    titleSpacing: 12,
                                    callbacks: {
                                        title: function(context) {
                                            const label = context[0].label;
                                            // Zkrátit dlouhý text a rozdělit na více řádků pokud je potřeba
                                            if (label.length > 40) {
                                                return label.substring(0, 40) + '...';
                                            }
                                            return label;
                                        },
                                        label: function(context) {
                                            const value = context.parsed;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percent = ((value / total) * 100).toFixed(1);
                                            return [
                                                'Hodnota: ' + value.toLocaleString('cs-CZ') + ' Kč',
                                                'Podíl: ' + percent + '%'
                                            ];
                                        }
                                    }
                                },
                                datalabels: {
                                    display: showLabels,
                                    color: '#ffffff',
                                    font: { weight: '700', size: 14, family: 'Inter, system-ui' },
                                    formatter: (value, ctx) => {
                                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                                        return percent + '%';
                                    },
                                    textStrokeColor: 'rgba(0, 0, 0, 0.3)',
                                    textStrokeWidth: 3,
                                    textShadowBlur: 6,
                                    textShadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },
                            cutout: '68%',
                            layout: { padding: 20 },
                            animation: {
                                animateRotate: true,
                                animateScale: true,
                                duration: 2000,
                                easing: 'easeInOutCubic',
                                onProgress: function(animation) {
                                    const chart = animation.chart;
                                    const ctx = chart.ctx;
                                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                                    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const progress = animation.currentStep / animation.numSteps;
                                    
                                    ctx.save();
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.font = '700 32px Inter, system-ui';
                                    ctx.fillStyle = '#0a0a0a';
                                    ctx.fillText((total * progress).toLocaleString('cs-CZ', {maximumFractionDigits: 0}) + ' Kč', centerX, centerY - 10);
                                    ctx.font = '500 14px Inter, system-ui';
                                    ctx.fillStyle = '#666666';
                                    ctx.fillText('Celková hodnota', centerX, centerY + 20);
                                    ctx.restore();
                                },
                                onComplete: function(animation) {
                                    const chart = animation.chart;
                                    const ctx = chart.ctx;
                                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                                    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    
                                    ctx.save();
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.font = '700 32px Inter, system-ui';
                                    ctx.fillStyle = '#0a0a0a';
                                    ctx.fillText(total.toLocaleString('cs-CZ') + ' Kč', centerX, centerY - 10);
                                    ctx.font = '500 14px Inter, system-ui';
                                    ctx.fillStyle = '#666666';
                                    ctx.fillText('Celková hodnota', centerX, centerY + 20);
                                    ctx.restore();
                                }
                            },
                            interaction: {
                                mode: 'nearest',
                                intersect: true
                            }
                        },
                        plugins: [window.ChartDataLabels, {
                            id: 'centerText',
                            afterDraw: function(chart) {
                                if (chart.options.animation.onComplete) return; // Už je vykresleno animací
                                const ctx = chart.ctx;
                                const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                                const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                                const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                
                                ctx.save();
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.font = '700 32px Inter, system-ui';
                                ctx.fillStyle = '#0a0a0a';
                                ctx.fillText(total.toLocaleString('cs-CZ') + ' Kč', centerX, centerY - 10);
                                ctx.font = '500 14px Inter, system-ui';
                                ctx.fillStyle = '#666666';
                                ctx.fillText('Celková hodnota', centerX, centerY + 20);
                                ctx.restore();
                            }
                        }]
                    });
                } catch (e) { 
                    console.error('Pie chart error:', e);
                    document.getElementById('pieChart').style.display = 'none'; 
                }
                
                // Helper function to adjust color brightness
                function adjustBrightness(color, percent) {
                    const num = parseInt(color.replace('#', ''), 16);
                    const amt = Math.round(2.55 * percent);
                    const R = (num >> 16) + amt;
                    const G = (num >> 8 & 0x00FF) + amt;
                    const B = (num & 0x0000FF) + amt;
                    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                        (B < 255 ? B < 1 ? 0 : B : 255))
                        .toString(16).slice(1);
                }
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
                            const yieldVal = ((item.value - item.investment) / item.investment * 100);
                            return yieldVal >= 0 ? fondColors.positive[index % fondColors.positive.length] : fondColors.negative[index % fondColors.negative.length];
                        });
                    }
                    
                    const barCtx = document.getElementById('barChart').getContext('2d');
                    
                    // Create gradient backgrounds for bars
                    const gradientBars = barColors.map((color) => {
                        const gradient = barCtx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, color);
                        gradient.addColorStop(1, adjustBrightness(color, -15));
                        return gradient;
                    });
                    
                    window.myBarChart = new Chart(barCtx, {
                        type: 'bar',
                        data: {
                            labels: barLabels,
                            datasets: [{
                                label: 'Výnos v %',
                                data: barData,
                                backgroundColor: gradientBars,
                                borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 0, bottomRight: 0 },
                                borderSkipped: false,
                                barPercentage: 0.8,
                                categoryPercentage: 0.88,
                                borderWidth: 0,
                                hoverBackgroundColor: barColors.map(c => adjustBrightness(c, 20)),
                                shadowOffsetX: 0,
                                shadowOffsetY: 4,
                                shadowBlur: 12,
                                shadowColor: 'rgba(0, 0, 0, 0.15)',
                                datalabels: {
                                    anchor: function(context) {
                                        return context.dataset.data[context.dataIndex] >= 0 ? 'end' : 'start';
                                    },
                                    align: function(context) {
                                        return context.dataset.data[context.dataIndex] >= 0 ? 'end' : 'start';
                                    },
                                    color: '#0a0a0a',
                                    font: { weight: '700', size: 12, family: 'Inter, system-ui' },
                                    formatter: v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%',
                                    padding: 6,
                                    backgroundColor: function(context) {
                                        const value = context.dataset.data[context.dataIndex];
                                        return value >= 0 ? 'rgba(200, 148, 10, 0.1)' : 'rgba(220, 38, 38, 0.1)';
                                    },
                                    borderRadius: 6,
                                    borderWidth: 2,
                                    borderColor: function(context) {
                                        const value = context.dataset.data[context.dataIndex];
                                        return value >= 0 ? 'rgba(200, 148, 10, 0.3)' : 'rgba(220, 38, 38, 0.3)';
                                    }
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
                                    font: { size: 26, weight: '800', family: 'Inter, system-ui' },
                                    color: '#0a0a0a',
                                    padding: { top: 10, bottom: 35 }
                                },
                                tooltip: {
                                    enabled: true,
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    titleColor: '#0a0a0a',
                                    bodyColor: '#333333',
                                    borderColor: function(context) {
                                        const value = context.tooltip.dataPoints[0].raw;
                                        return value >= 0 ? '#C8940A' : '#dc2626';
                                    },
                                    borderWidth: 3,
                                    titleFont: { size: 15, weight: '700', family: 'Inter, system-ui' },
                                    bodyFont: { size: 13, weight: '500', family: 'Inter, system-ui' },
                                    padding: 16,
                                    boxPadding: 8,
                                    usePointStyle: true,
                                    displayColors: true,
                                    cornerRadius: 8,
                                    caretSize: 8,
                                    callbacks: {
                                        title: function(context) {
                                            const idx = context[0].dataIndex;
                                            return fullLabels[idx];
                                        },
                                        label: function(context) {
                                            const value = context.parsed.y;
                                            const prefix = value >= 0 ? '📈 ' : '📉 ';
                                            return prefix + ' Výnos: ' + (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
                                        },
                                        afterLabel: function(context) {
                                            const value = context.parsed.y;
                                            if (value >= 0) {
                                                return '✨ Pozitivní výnos';
                                            } else {
                                                return '⚠️ Negativní výnos';
                                            }
                                        }
                                    }
                                },
                                datalabels: {
                                    display: true
                                }
                            },
                            layout: { padding: 20 },
                            scales: {
                                x: {
                                    ticks: {
                                        font: { size: 12, weight: '600', family: 'Inter, system-ui' },
                                        color: '#333333',
                                        maxRotation: 45,
                                        minRotation: 45,
                                        autoSkip: false,
                                        align: 'start',
                                        padding: 8
                                    },
                                    grid: { 
                                        display: false,
                                        drawBorder: false
                                    },
                                    border: {
                                        display: false
                                    }
                                },
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        font: { size: 12, weight: '600', family: 'Inter, system-ui' },
                                        color: '#333333',
                                        callback: function(value) { 
                                            return (value >= 0 ? '+' : '') + value + '%'; 
                                        },
                                        padding: 10,
                                        stepSize: 5
                                    },
                                    grid: { 
                                        color: function(context) {
                                            if (context.tick.value === 0) {
                                                return 'rgba(0, 0, 0, 0.3)';
                                            }
                                            return 'rgba(224, 224, 224, 0.4)';
                                        },
                                        lineWidth: function(context) {
                                            if (context.tick.value === 0) {
                                                return 2;
                                            }
                                            return 1;
                                        },
                                        borderDash: [4, 4],
                                        drawBorder: false
                                    },
                                    border: {
                                        display: false
                                    }
                                }
                            },
                            animation: {
                                duration: 2000,
                                easing: 'easeInOutElastic',
                                delay: (context) => {
                                    return context.dataIndex * 60;
                                },
                                onComplete: function(animation) {
                                    const chart = animation.chart;
                                    chart.options.animation.duration = 400; // Rychlejší animace po prvním zobrazení
                                }
                            },
                            interaction: {
                                mode: 'index',
                                intersect: false
                            },
                            onHover: function(event, activeElements) {
                                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                            }
                        },
                        plugins: [window.ChartDataLabels]
                    });
                } catch (e) { 
                    console.error('Bar chart error:', e);
                    document.getElementById('barChart').style.display = 'none'; 
                }
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
document.addEventListener('DOMContentLoaded', function() {
    // Select blue as default
    const defaultColor = document.querySelector('.color-option[data-color="blue"]');
    defaultColor.classList.add('selected');
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
document.getElementById('processCSV').addEventListener('click', function() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('warning', 'Žádný soubor', 'Prosím, nejdříve vyberte CSV soubor');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        
        // Skip header row if it exists
        const startIndex = rows[0].toLowerCase().includes('název fondu') ? 1 : 0;
        
        let importedCount = 0;
        let errorCount = 0;
        
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
                const [name, producer, investmentDate, investment, value] = columns.map(col => col.replace(/^"|"$/g, ''));
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
                        } catch (e) {
                            console.warn(`Invalid date format: ${investmentDate}`);
                        }
                    }
                    
                    portfolioData.push({
                        name: name,
                        producer: producer,
                        investmentDate: formattedDate,
                        investment: investmentNum,
                        value: valueNum
                    });
                    importedCount++;
                } else {
                    console.warn(`Skipping row ${i + 1}: Invalid numbers in investment or value`);
                    errorCount++;
                }
            } else if (columns.length >= 4) {
                // Fallback pro starý formát bez data investice
                const [name, producer, investment, value] = columns.map(col => col.replace(/^"|"$/g, ''));
                const investmentNum = parseFloat(investment.replace(/\s/g, ''));
                const valueNum = parseFloat(value.replace(/\s/g, ''));
                
                if (!isNaN(investmentNum) && !isNaN(valueNum)) {
                    portfolioData.push({
                        name: name,
                        producer: producer,
                        investmentDate: '', // Prázdné datum pro starý formát
                        investment: investmentNum,
                        value: valueNum
                    });
                    importedCount++;
                } else {
                    console.warn(`Skipping row ${i + 1}: Invalid numbers in investment or value`);
                    errorCount++;
                }
            } else {
                console.warn(`Skipping row ${i + 1}: Invalid number of columns`);
                errorCount++;
            }
        }
        
        // Update the table, dashboard and show it
        updateFondTable();
        updateDashboard();
        document.getElementById('fondListCard').style.display = 'block';
        
        // Save imported data to localStorage
        storage.saveData(portfolioData);
        
        // Clear the file input
        fileInput.value = '';
        
        // Show success or warning message
        if (importedCount > 0) {
            showToast('success', 'Import dokončen', 
                `Importováno ${importedCount} fondů${errorCount > 0 ? `, ${errorCount} řádků přeskočeno` : ''}`);
        } else {
            showToast('error', 'Import selhal', 'Nepodařilo se importovat žádná data');
        }
    };
    
    reader.onerror = function() {
        showToast('error', 'Chyba čtení', 'Chyba při čtení souboru');
    };
    
    reader.readAsText(file, 'UTF-8');
});

// Add these styles to your CSS
const styles = `
    .csv-import-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .csv-format-info {
        margin: 15px 0;
        padding: 10px;
        background: #fff;
        border-left: 4px solid #1a237e;
    }

    .csv-format-info code {
        display: block;
        padding: 10px;
        background: #f1f1f1;
        margin: 10px 0;
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
const styleSheet = document.createElement("style");
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
    const csvRows = [`Název fondu,Producent,Datum investice,Čistá investice (${currencySymbol}),Aktuální hodnota (${currencySymbol})`];
    data.forEach(item => {
        const row = [
            '"' + item.name + '"',
            '"' + item.producer + '"',
            item.investmentDate || '',
            item.investment,
            item.value
        ];
        csvRows.push(row.join(','));
    });
    const csvContent = csvRows.join('\n');
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;
    const blob = new Blob([csvContentWithBOM], { 
        type: 'text/csv;charset=utf-8'
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
document.addEventListener('DOMContentLoaded', function() {
    // ⚡ CRITICAL: Initialize DOM references first!
    initializeDOMReferences();
    
    // Load saved data from localStorage
    const savedData = storage.loadData();
    if (savedData && savedData.length > 0) {
        portfolioData = savedData;
        updateFondTable();
        updateDashboard();
        document.getElementById('fondListCard').style.display = 'block';
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            dashboard.style.display = 'grid';
        }
        showToast('info', 'Data načtena', `Obnoveno ${savedData.length} fondů z předchozí session`);
    }
    
    // Load saved client info
    const savedClient = storage.loadClient();
    if (savedClient) {
        document.getElementById('clientName').value = savedClient.name || '';
        document.getElementById('clientICO').value = savedClient.ico || '';
    }
    
    const switchFunds = document.getElementById('switchFunds');
    const switchProducers = document.getElementById('switchProducers');
    if (switchFunds && switchProducers) {
        switchFunds.addEventListener('click', function() {
            viewMode = 'funds';
            switchFunds.classList.add('active');
            switchProducers.classList.remove('active');
            updateFondTable();
        });
        switchProducers.addEventListener('click', function() {
            viewMode = 'producers';
            switchProducers.classList.add('active');
            switchFunds.classList.remove('active');
            updateFondTable();
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('tableSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value;
            clearSearchBtn.style.display = query ? 'block' : 'none';
            debouncedSearch(query);
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            updateFondTable();
        });
    }
    
    // Bulk actions event listeners
    const bulkDelete = document.getElementById('bulkDelete');
    const bulkExport = document.getElementById('bulkExport');
    const bulkDeselect = document.getElementById('bulkDeselect');
    
    if (bulkDelete) {
        bulkDelete.addEventListener('click', bulkDeleteSelected);
    }
    
    if (bulkExport) {
        bulkExport.addEventListener('click', bulkExportSelected);
    }
    
    if (bulkDeselect) {
        bulkDeselect.addEventListener('click', function() {
            selectedRows.clear();
            updateBulkActionsBar();
            updateFondTable();
        });
    }
    
    // Sorting functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sortable')) {
            const column = e.target.dataset.column;
            
            // Toggle sort direction
            if (currentSortColumn === column) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortDirection = 'asc';
            }
            
            // Update header styles
            document.querySelectorAll('.sortable').forEach(th => {
                th.classList.remove('sort-asc', 'sort-desc');
            });
            e.target.classList.add(`sort-${currentSortDirection}`);
            
            updateFondTable();
        }
    });
});

// ==================== FILTER AND SORT FUNCTIONS ====================
function filterAndSortData(data) {
    let filtered = [...data];
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchQuery) ||
            item.producer.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply sorting
    if (currentSortColumn) {
        filtered.sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];
            
            // Handle numeric columns
            if (currentSortColumn === 'investment' || currentSortColumn === 'value') {
                valA = Number(valA);
                valB = Number(valB);
            }
            
            // Handle date column
            if (currentSortColumn === 'investmentDate') {
                valA = new Date(valA || '1970-01-01');
                valB = new Date(valB || '1970-01-01');
            }
            
            // Handle string columns
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            
            if (currentSortDirection === 'asc') {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            } else {
                return valA < valB ? 1 : valA > valB ? -1 : 0;
            }
        });
    }
    
    return filtered;
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S: Manual save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (portfolioData.length > 0) {
            storage.saveData(portfolioData);
            showToast('success', 'Manuální uložení', 'Data byla úspěšně uložena');
        }
    }
    
    // Escape: Close toasts or dialogs
    if (e.key === 'Escape') {
        // Close all toasts
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(toast => {
            toast.style.animation = 'slideOutRight 0.3s ease-in-out';
            setTimeout(() => toast.remove(), 300);
        });
        
        // Close confirmation dialogs
        const overlays = document.querySelectorAll('.confirm-overlay');
        overlays.forEach(overlay => overlay.remove());
    }
    
    // Ctrl/Cmd + E: Export current view
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const generateBtn = document.getElementById('generateReport');
        if (generateBtn && portfolioData.length > 0) {
            generateBtn.click();
        }
    }
});

// ==================== DEBOUNCED SEARCH ====================
// Replace the search input listener with debounced version
const debouncedSearch = debounce(function(query) {
    searchQuery = query.toLowerCase();
    updateFondTable();
}, 300);

// ==================== DARK MODE ====================
const darkModeToggle = document.getElementById('darkModeToggle');
const savedDarkMode = localStorage.getItem('darkMode') === 'true';

if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    showToast('info', 'Vzhled změněn', `Přepnuto na ${isDark ? 'tmavý' : 'světlý'} režim`);
});

