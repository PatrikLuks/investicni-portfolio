/**
 * src/ui/charts.js
 * 
 * Grafy: Alokace (pie) a Časová řada (line) – čisté SVG (zero deps)
 */

/**
 * Renderuj grafy (alokace + časová řada)
 * @param {{alloc, series}} data - { alloc: {byKey: {...}}, series: [{date, value}] }
 * @param {{allocEl, tsEl}} elements - DOM containers (canvas or divs)
 */
export function renderCharts({ alloc, series }, { allocEl, tsEl }) {
  if (alloc && allocEl) {
    renderAllocationPie(alloc, allocEl);
  }
  if (series && tsEl) {
    renderTimeSeriesLine(series, tsEl);
  }
}

/**
 * Vyrendering pie chart (alokace)
 */
function renderAllocationPie(alloc, el) {
  const entries = Object.entries(alloc.byKey);
  const total = entries.reduce((sum, [_, v]) => sum + v.value, 0);

  if (!entries.length || total === 0) {
    el.innerHTML = "<p style='text-align:center; color:#999;'>Žádná data k alokaci</p>";
    return;
  }

  // Spočítej úhly
  let startAngle = -Math.PI / 2;
  const slices = entries.map(([label, { weight }]) => {
    const sliceAngle = weight * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const midAngle = (startAngle + endAngle) / 2;

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const x1 = 100 + 80 * Math.cos(startAngle);
    const y1 = 100 + 80 * Math.sin(startAngle);
    const x2 = 100 + 80 * Math.cos(endAngle);
    const y2 = 100 + 80 * Math.sin(endAngle);

    const labelX = 100 + 55 * Math.cos(midAngle);
    const labelY = 100 + 55 * Math.sin(midAngle);

    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = colorForIndex(entries.indexOf([label, { weight }]));

    startAngle = endAngle;

    return { label, weight, path, color, labelX, labelY };
  });

  const svg = `
    <svg viewBox="0 0 200 220" style="width:100%; height:250px;">
      ${slices.map((s) => `<path d="${s.path}" fill="${s.color}" opacity="0.8" stroke="white" stroke-width="2"/>`).join("")}
      ${slices
        .filter((s) => s.weight > 0.1) // Skip labels < 10%
        .map((s) => `<text x="${s.labelX}" y="${s.labelY}" text-anchor="middle" font-size="12" fill="white" font-weight="bold">${(s.weight * 100).toFixed(0)}%</text>`)
        .join("")}
      <!-- Legend -->
      ${slices
        .map(
          (s, i) =>
            `<text x="10" y="${210 + i * 14}" font-size="11" fill="#333"><tspan fill="${s.color}">●</tspan> ${s.label}</text>`
        )
        .join("")}
    </svg>
  `;

  el.innerHTML = svg;
}

/**
 * Vyrendering line chart (časová řada)
 */
function renderTimeSeriesLine(series, el) {
  if (!series.length) {
    el.innerHTML = "<p style='text-align:center; color:#999;'>Žádná historická data</p>";
    return;
  }

  const minVal = Math.min(...series.map((s) => s.value));
  const maxVal = Math.max(...series.map((s) => s.value));
  const valRange = maxVal - minVal || 1;

  const width = 600;
  const height = 200;
  const padding = 40;

  const xs = series.map((_, i) => padding + (i / (series.length - 1 || 1)) * (width - 2 * padding));
  const ys = series.map((s) => height - padding - ((s.value - minVal) / valRange) * (height - 2 * padding));

  const points = xs.map((x, i) => `${x},${ys[i]}`).join(" ");

  // Grid lines + labels
  const gridLines = series
    .map((_, i) => `<line x1="${xs[i]}" y1="${padding}" x2="${xs[i]}" y2="${height - padding}" stroke="#eee" stroke-width="1"/>`)
    .join("");

  const dateLabels = series
    .filter((_, i) => i % Math.ceil(series.length / 5) === 0 || i === series.length - 1)
    .map((s, i) => {
      const idx = series.indexOf(s);
      const x = xs[idx];
      return `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="10" fill="#666">${s.date}</text>`;
    })
    .join("");

  const valLabels = [minVal, (minVal + maxVal) / 2, maxVal]
    .map((v) => {
      const y = height - padding - ((v - minVal) / valRange) * (height - 2 * padding);
      return `<text x="30" y="${y + 4}" text-anchor="end" font-size="10" fill="#999">${v.toFixed(0)}</text>`;
    })
    .join("");

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:250px;">
      <!-- Grid -->
      ${gridLines}
      <!-- Axis -->
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>
      <!-- Line -->
      <polyline points="${points}" fill="none" stroke="#667eea" stroke-width="2" stroke-linejoin="round"/>
      <!-- Dots -->
      ${xs.map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="3" fill="#667eea"/>`).join("")}
      <!-- Labels -->
      ${dateLabels}
      ${valLabels}
    </svg>
  `;

  el.innerHTML = svg;
}

/**
 * Barvy pro slices
 */
function colorForIndex(i) {
  const colors = [
    "#667eea", // purple
    "#764ba2", // dark purple
    "#f093fb", // pink
    "#4facfe", // blue
    "#00f2fe", // cyan
    "#43e97b", // green
    "#fa709a", // red-pink
    "#fee140", // yellow
  ];
  return colors[i % colors.length];
}
