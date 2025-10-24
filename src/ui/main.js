/**
 * src/ui/main.js
 * 
 * Orchestrace aplikace: state management, rendering, I/O
 */

import {
  computeMarketValue,
  computeAllocation,
  computePnL,
  computeDailyChange,
  computeTimeSeriesValue,
  computeAnnualizedReturn,
} from "../domain/portfolioMath.js";
import { loadLocal, saveLocal, importFileToPositions, exportJson, exportCsv } from "../data/io.js";
import { renderSummary } from "./summaryCards.js";
import { renderTable } from "./portfolioTable.js";
import { renderCharts } from "./charts.js";

/**
 * App state
 */
const state = {
  positions: [],
  pricesToday: {},
  pricesYesterday: {},
  pricesByDate: {},
};

/**
 * Bootstrap aplikace
 */
async function bootstrap() {
  // 1. Načti z localStorage
  const persisted = loadLocal();
  Object.assign(state, persisted);

  // 2. Fallback demo data (pokud není nic uloženo)
  if (!state.positions?.length) {
    state.positions = [
      { ticker: "AAPL", quantity: 10, avgCost: 150, assetClass: "Equity" },
      { ticker: "SPY", quantity: 5, avgCost: 500, assetClass: "ETF" },
      { ticker: "CASH", quantity: 1000, avgCost: 1, assetClass: "Cash" },
    ];
    state.pricesToday = { AAPL: 210, SPY: 600, CASH: 1 };
    state.pricesYesterday = { AAPL: 200, SPY: 590, CASH: 1 };
    state.pricesByDate = {
      "2025-10-20": { AAPL: 200, SPY: 590, CASH: 1 },
      "2025-10-21": { AAPL: 205, SPY: 595, CASH: 1 },
      "2025-10-22": { AAPL: 210, SPY: 600, CASH: 1 },
    };
  }

  // 3. Renderuj UI
  renderAll();

  // 4. Wire I/O
  wireIO();

  console.log("✅ Bootstrap complete. State:", state);
}

/**
 * Vyrendering všeho UI
 */
function renderAll() {
  try {
    // Spočítej metriky
    const mv = computeMarketValue(state.positions, state.pricesToday);
    const alloc = computeAllocation(state.positions, state.pricesToday);
    const pnl = computePnL(state.positions, state.pricesToday);
    const daily = computeDailyChange(
      state.positions,
      state.pricesToday,
      state.pricesYesterday
    );
    const series = computeTimeSeriesValue(state.positions, state.pricesByDate);
    const cagr = computeAnnualizedReturn(series);

    // Renderuj komponenty
    renderSummary(
      { mv, pnl, daily, cagr },
      document.getElementById("summary")
    );

    renderTable(
      {
        positions: state.positions,
        prices: state.pricesToday,
        onChange: (nextPositions) => {
          state.positions = nextPositions;
          persist();
          renderAll();
        },
      },
      document.getElementById("table")
    );

    renderCharts(
      { alloc, series },
      {
        allocEl: document.getElementById("allocChart"),
        tsEl: document.getElementById("tsChart"),
      }
    );
  } catch (err) {
    console.error("❌ Render error:", err);
    alert("Chyba při renderování: " + err.message);
  }
}

/**
 * Wire I/O tlačítka
 */
function wireIO() {
  // Import
  document.getElementById("importFile").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importFileToPositions(file);
      if (imported.positions) {
        state.positions = imported.positions;
      }
      if (imported.pricesToday) {
        state.pricesToday = imported.pricesToday;
      }
      if (imported.pricesYesterday) {
        state.pricesYesterday = imported.pricesYesterday;
      }
      if (imported.pricesByDate) {
        state.pricesByDate = imported.pricesByDate;
      }

      persist();
      renderAll();
      alert(`✅ Importováno: ${imported.positions?.length ?? 0} pozic`);
    } catch (err) {
      console.error("Import error:", err);
      alert("Chyba při importu: " + err.message);
    }

    // Reset input
    e.target.value = "";
  });

  // Export JSON
  document.getElementById("exportJson").addEventListener("click", () => {
    try {
      exportJson(state);
      alert("✅ Exportováno do portfolio.json");
    } catch (err) {
      console.error("Export error:", err);
      alert("Chyba při exportu: " + err.message);
    }
  });

  // Export CSV
  document.getElementById("exportCsv").addEventListener("click", () => {
    try {
      exportCsv(state.positions, state.pricesToday);
      alert("✅ Exportováno do portfolio.csv");
    } catch (err) {
      console.error("Export error:", err);
      alert("Chyba při exportu: " + err.message);
    }
  });

  // Reset demo
  document.getElementById("resetDemo").addEventListener("click", () => {
    if (confirm("Opravdu chceš smazat všechna data a vrátit se na demo?")) {
      localStorage.removeItem("portfolio_state");
      location.reload();
    }
  });
}

/**
 * Ulož stav do localStorage
 */
function persist() {
  saveLocal(state);
}

// Start aplikace
bootstrap();
