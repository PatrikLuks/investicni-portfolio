/**
 * src/ui/summaryCards.js
 * 
 * Vyrendering 4 summary karty (Celková hodnota, P/L, Denní změna, CAGR)
 */

/**
 * Renderuj summary karty
 * @param {{mv, pnl, daily, cagr}} metrics
 * @param {HTMLElement} el
 */
export function renderSummary({ mv, pnl, daily, cagr }, el) {
  const totalValue = fmt(mv.total);
  const totalGain = fmt(pnl.totalPnl);
  const gainPercent = pnl.totalCost > 0 ? ((pnl.totalPnl / pnl.totalCost) * 100).toFixed(2) : "-";
  const dailyDelta = fmt(daily.delta);
  const dailyPercent = daily.mvYesterday > 0 ? ((daily.delta / daily.mvYesterday) * 100).toFixed(2) : "-";
  const cagrPercent = cagr != null ? (cagr * 100).toFixed(2) : "-";

  const html = `
    <div class="cards">
      <div class="card">
        <div>Celková hodnota</div>
        <strong>${totalValue} CZK</strong>
      </div>
      <div class="card">
        <div>Zisk/Ztráta</div>
        <strong>${totalGain} CZK</strong>
        <div style="font-size: 0.875rem; margin-top: 0.25rem;">(${gainPercent}%)</div>
      </div>
      <div class="card ${daily.delta >= 0 ? "pos" : "neg"}">
        <div>Denní změna</div>
        <strong>${dailyDelta} CZK</strong>
        <div style="font-size: 0.875rem; margin-top: 0.25rem;">${daily.delta >= 0 ? "📈" : "📉"} ${dailyPercent}%</div>
      </div>
      <div class="card">
        <div>CAGR (p.a.)</div>
        <strong>${cagrPercent}%</strong>
      </div>
    </div>
  `;

  el.innerHTML = html;
}

/**
 * Formátuj číslo na CZK
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
}
