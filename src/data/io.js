/**
 * src/data/io.js
 * 
 * Lokální úložiště, import/export JSON a CSV
 */

/**
 * Načti stav z localStorage
 * @returns {object}
 */
export function loadLocal() {
  try {
    const stored = localStorage.getItem("portfolio_state");
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return {};
  }
}

/**
 * Ulož stav do localStorage
 * @param {object} state
 */
export function saveLocal(state) {
  try {
    localStorage.setItem("portfolio_state", JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

/**
 * Importuj soubor (JSON nebo CSV) na pozice
 * @param {File} file
 * @returns {Promise<{positions, pricesToday, pricesYesterday, pricesByDate}>}
 */
export async function importFileToPositions(file) {
  const text = await file.text();

  if (file.name.endsWith(".json")) {
    // Očekávaný formát JSON:
    // { positions: [...], pricesToday: {...}, pricesYesterday: {...}, pricesByDate: {...} }
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON:", e);
      return {};
    }
  }

  if (file.name.endsWith(".csv")) {
    // CSV format: ticker,quantity,avgCost,assetClass,priceToday
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return {};

    const headerLine = lines[0];
    const headers = headerLine.split(",").map((h) => h.trim());
    const idx = Object.fromEntries(headers.map((h, i) => [h, i]));

    const positions = [];
    const pricesToday = {};

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map((c) => c.trim());
      if (!cells[idx.ticker]) continue; // skip empty rows

      const ticker = cells[idx.ticker];
      const quantity = parseFloat(cells[idx.quantity] || 0);
      const avgCost = cells[idx.avgCost] ? parseFloat(cells[idx.avgCost]) : undefined;
      const assetClass = cells[idx.assetClass] || undefined;
      const priceToday = parseFloat(cells[idx.priceToday] || 0);

      positions.push({ ticker, quantity, avgCost, assetClass });
      pricesToday[ticker] = priceToday;
    }

    return { positions, pricesToday };
  }

  return {};
}

/**
 * Exportuj stav jako JSON
 * @param {object} state
 */
export function exportJson(state) {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadFile(blob, "portfolio.json");
}

/**
 * Exportuj pozice + ceny jako CSV
 * @param {Position[]} positions
 * @param {Record<string, number>} pricesToday
 */
export function exportCsv(positions, pricesToday) {
  const header = "ticker,quantity,avgCost,assetClass,priceToday";
  const rows = positions.map((p) => [
    p.ticker,
    p.quantity,
    p.avgCost ?? "",
    p.assetClass ?? "",
    pricesToday[p.ticker] ?? "",
  ].join(","));

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, "portfolio.csv");
}

/**
 * Helper: Stáhni blob jako soubor
 * @param {Blob} blob
 * @param {string} filename
 */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
