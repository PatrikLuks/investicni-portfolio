/**
 * src/ui/portfolioTable.js
 * 
 * Tabulka pozic s editací + market value + P&L
 */

import { computeMarketValue, computePnL } from "../domain/portfolioMath.js";

/**
 * Renderuj tabulku pozic
 * @param {{positions, prices, onChange}} config
 * @param {HTMLElement} el
 */
export function renderTable({ positions, prices, onChange }, el) {
  const mv = computeMarketValue(positions, prices);
  const pnl = computePnL(positions, prices);

  const rows = positions
    .map((p, i) => {
      const mvItem = mv.items.find((x) => x.ticker === p.ticker);
      const pnlItem = pnl.items.find((x) => x.ticker === p.ticker);

      return `
        <tr>
          <td contenteditable data-i="${i}" data-k="ticker">${p.ticker}</td>
          <td contenteditable data-i="${i}" data-k="quantity">${p.quantity}</td>
          <td contenteditable data-i="${i}" data-k="avgCost">${p.avgCost ?? ""}</td>
          <td contenteditable data-i="${i}" data-k="assetClass">${p.assetClass ?? ""}</td>
          <td>${prices[p.ticker]?.toFixed(2) ?? "-"}</td>
          <td>${mvItem ? mvItem.marketValue.toFixed(2) : "-"}</td>
          <td class="${pnlItem && pnlItem.pnl >= 0 ? "pos" : "neg"}">
            ${pnlItem ? pnlItem.pnl.toFixed(2) : "-"}
            ${pnlItem && pnlItem.pnlPct != null ? ` (${(pnlItem.pnlPct * 100).toFixed(2)}%)` : ""}
          </td>
          <td><button class="btn-del" data-i="${i}">✕</button></td>
        </tr>
      `;
    })
    .join("");

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Kusy</th>
          <th>AvgCost</th>
          <th>Třída</th>
          <th>Cena</th>
          <th>Hodnota</th>
          <th>P/L</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <button id="addRow" style="margin-top: 1rem;">➕ Přidat pozici</button>
  `;

  // Wire: inline edits
  el.querySelectorAll("[contenteditable]").forEach((cell) => {
    cell.addEventListener("blur", () => {
      const i = Number(cell.dataset.i);
      const k = cell.dataset.k;
      const val = cell.textContent.trim();
      const next = positions.slice();

      if (k === "quantity" || k === "avgCost") {
        const numVal = val === "" ? 0 : parseFloat(val);
        next[i] = { ...next[i], [k]: numVal };
      } else {
        next[i] = { ...next[i], [k]: val };
      }

      onChange(next);
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        cell.blur();
      }
    });
  });

  // Wire: delete buttons
  el.querySelectorAll(".btn-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.i);
      const next = positions.filter((_, idx) => idx !== i);
      onChange(next);
    });
  });

  // Wire: add row
  el.querySelector("#addRow").addEventListener("click", () => {
    onChange([...positions, { ticker: "", quantity: 1, avgCost: 0, assetClass: "" }]);
  });
}
