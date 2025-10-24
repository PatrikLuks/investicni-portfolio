/**
 * @typedef {Object} Position
 * @property {string} ticker                    // jednoznačný identifikátor (AAPL, SPY, …)
 * @property {number} quantity                  // počet kusů (může být i desetinný u ETF)
 * @property {number} [avgCost]                 // průměrná nákupní cena za KUS (CZK/EUR…)
 * @property {string} [assetClass]              // kategorie: "Equity", "ETF", "Bond", "Cash", "Crypto"
 */

/**
 * Ověří a normalizuje vstupní pozice – vyhodí chybu na špatná data.
 * 
 * @param {Position[]} positions
 * @returns {Position[]}
 * @throws {Error} pokud ticker chybí nebo quantity není konečné číslo
 */
export function normalizePositions(positions) {
  if (!Array.isArray(positions)) {
    throw new Error("positions must be array");
  }
  
  return positions.map((p, i) => {
    if (!p || typeof p.ticker !== "string" || !p.ticker.trim()) {
      throw new Error(`positions[${i}].ticker is required string`);
    }
    
    if (typeof p.quantity !== "number" || !Number.isFinite(p.quantity)) {
      throw new Error(`positions[${i}].quantity must be finite number, got ${p.quantity}`);
    }
    
    if (p.quantity < 0) {
      throw new Error(`positions[${i}].quantity must not be negative`);
    }
    
    const out = { ...p };
    
    if (out.avgCost != null) {
      if (!Number.isFinite(out.avgCost) || out.avgCost < 0) {
        throw new Error(`positions[${i}].avgCost must be non-negative finite number`);
      }
    }
    
    return out;
  });
}

/**
 * Vypočítá tržní hodnotu (Market Value) pozic k daným cenám.
 * 
 * Vstup:
 *   - positions: pole s ticker, quantity, …
 *   - priceMap: slovník { ticker -> aktuální cena/kus }
 * 
 * Výstup:
 *   - items: detaily každé pozice (ticker, quantity, price, marketValue)
 *   - total: celková MV portfolia
 * 
 * Side-effects: ŽÁDNÉ (čistá funkce)
 * 
 * @param {Position[]} positions
 * @param {Record<string, number>} priceMap    // např. { AAPL: 210.35, SPY: 600.1 }
 * @returns {{items: Array<{ticker:string, quantity:number, price:number, marketValue:number}>, total:number}}
 * @throws {Error} pokud chybí cena pro nějaký ticker
 */
export function computeMarketValue(positions, priceMap) {
  const norm = normalizePositions(positions);
  
  const items = norm.map(p => {
    const price = priceMap[p.ticker];
    
    if (!Number.isFinite(price)) {
      throw new Error(`Missing or invalid price for ticker "${p.ticker}"`);
    }
    
    return {
      ticker: p.ticker,
      quantity: p.quantity,
      price,
      marketValue: p.quantity * price,
    };
  });
  
  const total = items.reduce((sum, x) => sum + x.marketValue, 0);
  
  return { items, total };
}

/**
 * Alokace portfolia dle assetClass (nebo fallback na ticker).
 * 
 * Vstup:
 *   - positions: pole s assetClass
 *   - priceMap: slovník cen
 * 
 * Výstup:
 *   - byKey: { assetClass/ticker -> { value, weight } }
 *   - total: celková MV
 * 
 * Vzorec:
 *   weight[k] = value[k] / total  (nebo 0 pokud total=0)
 * 
 * @param {Position[]} positions
 * @param {Record<string, number>} priceMap
 * @returns {{byKey: Record<string, {value:number, weight:number}>, total:number}}
 */
export function computeAllocation(positions, priceMap) {
  const { items, total } = computeMarketValue(positions, priceMap);
  
  const byKey = {};
  items.forEach((it, idx) => {
    const key = positions[idx].assetClass || it.ticker;
    
    if (!byKey[key]) {
      byKey[key] = { value: 0, weight: 0 };
    }
    
    byKey[key].value += it.marketValue;
  });
  
  // Normalizace vah
  Object.keys(byKey).forEach(k => {
    byKey[k].weight = total > 0 ? byKey[k].value / total : 0;
  });
  
  return { byKey, total };
}

/**
 * Zisk/Ztráta (P&L) proti nákladové bázi (avgCost).
 * 
 * Vstup:
 *   - positions: s avgCost a quantity
 *   - priceMap: aktuální ceny
 * 
 * Výstup:
 *   - items: P&L na pozici { ticker, pnl, pnlPct }
 *   - totalPnl: celkový zisk
 *   - totalCost: suma (avgCost * quantity)
 *   - totalMV: aktuální tržní hodnota
 * 
 * Vzorce:
 *   cost_i = avgCost_i * quantity_i
 *   pnl_i = (price_i * quantity_i) - cost_i
 *   pnl_pct_i = pnl_i / cost_i  (nebo null pokud cost_i = 0)
 *   
 * Pozn: Pokud avgCost chybí, bereme jej jako 0 (hedging, airdrops, …).
 * 
 * @param {Position[]} positions
 * @param {Record<string, number>} priceMap
 * @returns {{items: Array<{ticker:string, pnl:number, pnlPct:number|null}>, totalPnl:number, totalCost:number, totalMV:number}}
 */
export function computePnL(positions, priceMap) {
  const norm = normalizePositions(positions);
  const mv = computeMarketValue(norm, priceMap);
  
  const items = norm.map((p, i) => {
    const price = priceMap[p.ticker];
    const cost = (p.avgCost ?? 0) * p.quantity;
    const marketVal = mv.items[i].marketValue;
    const pnl = marketVal - cost;
    const pnlPct = cost > 0 ? pnl / cost : null;
    
    return {
      ticker: p.ticker,
      pnl,
      pnlPct,
    };
  });
  
  const totalCost = norm.reduce((sum, p) => sum + (p.avgCost ?? 0) * p.quantity, 0);
  const totalPnl = mv.total - totalCost;
  
  return {
    items,
    totalPnl,
    totalCost,
    totalMV: mv.total,
  };
}

/**
 * Denní změna tržní hodnoty portfolia (Δ MV, Δ %).
 * 
 * Vstup:
 *   - positions: stejné pozice v obou dnech (bez obchodování mezi dny)
 *   - priceToday, priceYesterday: ceny na oba dny
 * 
 * Výstup:
 *   - delta: absolutní změna (MV_today - MV_yesterday)
 *   - deltaPct: procentuální změna (delta / MV_yesterday), nebo null pokud MV_yesterday=0
 *   - mvToday, mvYesterday: podrobnosti pro audit
 * 
 * Vzorec:
 *   delta = MV_today - MV_yesterday
 *   deltaPct = delta / MV_yesterday
 * 
 * Pozn: Funkce předpokládá, že se pozice mezi dny neměnily (quantity).
 * 
 * @param {Position[]} positions
 * @param {Record<string, number>} priceToday
 * @param {Record<string, number>} priceYesterday
 * @returns {{delta:number, deltaPct:number|null, mvToday:number, mvYesterday:number}}
 */
export function computeDailyChange(positions, priceToday, priceYesterday) {
  const mvToday = computeMarketValue(positions, priceToday).total;
  const mvYesterday = computeMarketValue(positions, priceYesterday).total;
  
  const delta = mvToday - mvYesterday;
  const deltaPct = mvYesterday > 0 ? delta / mvYesterday : null;
  
  return {
    delta,
    deltaPct,
    mvToday,
    mvYesterday,
  };
}

/**
 * Časová řada hodnoty portfolia ze slovníku denních cen.
 * 
 * Vstup:
 *   - positions: konstantní seznam pozic
 *   - pricesByDate: { YYYY-MM-DD -> { ticker -> price } }
 * 
 * Výstup:
 *   - pole { date, value } seřazené vzestupně podle data
 * 
 * @param {Position[]} positions
 * @param {Record<string, Record<string, number>>} pricesByDate
 * @returns {Array<{date:string, value:number}>}
 */
export function computeTimeSeriesValue(positions, pricesByDate) {
  const dates = Object.keys(pricesByDate).sort();
  
  return dates.map(d => ({
    date: d,
    value: computeMarketValue(positions, pricesByDate[d]).total,
  }));
}

/**
 * Annualizovaný (geometrický) výnos z časové řady MV.
 * 
 * Vstup:
 *   - series: min. 2 pozorování s date (ISO) a value
 * 
 * Výstup:
 *   - číslo: annualizovaná míra (0.081 = 8.1% p.a.)
 *   - null: pokud není možné (< 2 body, nulové hodnoty, …)
 * 
 * Vzorec (CAGR):
 *   r = (V_final / V_initial) ^ (1 / years) - 1
 * 
 * Kde:
 *   years = (date_final - date_initial) / 365.25 let
 *   (používáme ISO data, konverze na ms)
 * 
 * @param {Array<{date:string, value:number}>} series
 * @returns {number|null}
 */
export function computeAnnualizedReturn(series) {
  if (!Array.isArray(series) || series.length < 2) {
    return null;
  }
  
  const v0 = series[0].value;
  const vN = series[series.length - 1].value;
  
  if (!(v0 > 0) || !(vN > 0)) {
    return null; // Nelze vrátit na počáteční zápornou/nulovou hodnotu
  }
  
  // Výpočet času v rocích
  const msPerYear = 365.25 * 24 * 3600 * 1000;
  const t0 = new Date(series[0].date).getTime();
  const tN = new Date(series[series.length - 1].date).getTime();
  const years = (tN - t0) / msPerYear;
  
  if (!(years > 0)) {
    return null; // Stejný den nebo zpětně v čase
  }
  
  // CAGR = (final/initial)^(1/years) - 1
  return Math.pow(vN / v0, 1 / years) - 1;
}

/**
 * Vážený průměr výnosu (TVWR – Time Weighted Return) zjednodušeně.
 * 
 * Vstup:
 *   - series: časová řada MV s aspoň 2 body
 * 
 * Výstup:
 *   - vážený průměr denních výnosů
 *   - null pokud není možné
 * 
 * Vzorec:
 *   r_i = (V_i - V_{i-1}) / V_{i-1}  (denní výnos)
 *   w_i = (days_i / total_days)      (váha podle trvání)
 *   TVWR = Σ (w_i * r_i)
 * 
 * @param {Array<{date:string, value:number}>} series
 * @returns {number|null}
 */
export function computeWeightedAverageReturn(series) {
  if (!Array.isArray(series) || series.length < 2) {
    return null;
  }
  
  // Spočítej denní výnosy a doby trvání
  const returns = [];
  const durations = []; // počet dní v období
  
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1];
    const curr = series[i];
    
    if (prev.value <= 0) continue; // Přeskoč nulové/záporné hodnoty
    
    const ret = (curr.value - prev.value) / prev.value;
    const days =
      (new Date(curr.date).getTime() - new Date(prev.date).getTime()) /
      (24 * 3600 * 1000);
    
    returns.push(ret);
    durations.push(days);
  }
  
  if (returns.length === 0) return null;
  
  const totalDays = durations.reduce((s, d) => s + d, 0);
  if (totalDays <= 0) return null;
  
  // Váhovaný průměr
  const weighted = returns.reduce((sum, ret, idx) => {
    const weight = durations[idx] / totalDays;
    return sum + weight * ret;
  }, 0);
  
  return weighted;
}
