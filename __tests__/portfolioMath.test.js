/**
 * __tests__/portfolioMath.test.js
 * 
 * Komplexní test suite pro doménové funkce portfolia.
 * Pokrývá: validace, výpočty, edge cases, výnosy.
 */

import {
  normalizePositions,
  computeMarketValue,
  computeAllocation,
  computePnL,
  computeDailyChange,
  computeTimeSeriesValue,
  computeAnnualizedReturn,
  computeWeightedAverageReturn,
} from "../src/domain/portfolioMath";

describe("portfolioMath – normalizace & validace", () => {
  test("normalizePositions přijímá platné pozice", () => {
    const positions = [
      { ticker: "AAPL", quantity: 10, avgCost: 150 },
      { ticker: "SPY", quantity: 5 },
    ];
    const normalized = normalizePositions(positions);
    expect(normalized).toHaveLength(2);
    expect(normalized[0].ticker).toBe("AAPL");
  });

  test("normalizePositions vyhodí chybu na chybějící ticker", () => {
    expect(() => normalizePositions([{ quantity: 1 }])).toThrow(/ticker/i);
    expect(() => normalizePositions([{ ticker: "", quantity: 1 }])).toThrow(
      /ticker/i
    );
  });

  test("normalizePositions vyhodí chybu na neplatnou quantity", () => {
    expect(() =>
      normalizePositions([{ ticker: "AAPL", quantity: "x" }])
    ).toThrow(/quantity/i);

    expect(() =>
      normalizePositions([{ ticker: "AAPL", quantity: Infinity }])
    ).toThrow(/quantity/i);

    expect(() =>
      normalizePositions([{ ticker: "AAPL", quantity: -5 }])
    ).toThrow(/negative/i);
  });

  test("normalizePositions vyhodí chybu na neplatné avgCost", () => {
    expect(() =>
      normalizePositions([{ ticker: "AAPL", quantity: 10, avgCost: -50 }])
    ).toThrow(/avgCost/i);

    expect(() =>
      normalizePositions([{ ticker: "AAPL", quantity: 10, avgCost: "xyz" }])
    ).toThrow(/avgCost/i);
  });

  test("normalizePositions akceptuje chybějící avgCost", () => {
    const positions = [{ ticker: "BTC", quantity: 0.5 }];
    const normalized = normalizePositions(positions);
    expect(normalized[0].avgCost).toBeUndefined();
  });
});

describe("portfolioMath – tržní hodnota (Market Value)", () => {
  const positions = [
    { ticker: "AAPL", quantity: 10, avgCost: 150, assetClass: "Equity" },
    { ticker: "SPY", quantity: 5, avgCost: 500, assetClass: "ETF" },
    { ticker: "CASH", quantity: 1000, assetClass: "Cash" }, // bez avgCost
  ];

  test("computeMarketValue – základní výpočet", () => {
    const prices = { AAPL: 210, SPY: 600, CASH: 1 };
    const { items, total } = computeMarketValue(positions, prices);

    expect(items).toHaveLength(3);
    expect(items[0].marketValue).toBeCloseTo(2100); // 10 * 210
    expect(items[1].marketValue).toBeCloseTo(3000); // 5 * 600
    expect(items[2].marketValue).toBeCloseTo(1000); // 1000 * 1
    expect(total).toBeCloseTo(6100);
  });

  test("computeMarketValue – chyba na chybějící cenu", () => {
    const prices = { AAPL: 210, SPY: 600 }; // chybí CASH
    expect(() => computeMarketValue(positions, prices)).toThrow(/CASH/i);
  });

  test("computeMarketValue – chyba na Infinity cenu", () => {
    const prices = { AAPL: Infinity, SPY: 600, CASH: 1 };
    expect(() => computeMarketValue(positions, prices)).toThrow(/AAPL/i);
  });

  test("computeMarketValue – prázdné portfolio", () => {
    const { items, total } = computeMarketValue([], {});
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
  });

  test("computeMarketValue – nulové ceny (korektně)", () => {
    const prices = { AAPL: 0, SPY: 0, CASH: 0 };
    const { items, total } = computeMarketValue(positions, prices);
    expect(total).toBe(0);
    expect(items[0].marketValue).toBe(0);
  });
});

describe("portfolioMath – alokace (Allocation %)", () => {
  const positions = [
    { ticker: "AAPL", quantity: 10, assetClass: "Equity" },
    { ticker: "MSFT", quantity: 20, assetClass: "Equity" },
    { ticker: "SPY", quantity: 5, assetClass: "ETF" },
    { ticker: "BND", quantity: 100, assetClass: "Bond" },
  ];

  test("computeAllocation – váhy sečteny na 1.0", () => {
    const prices = { AAPL: 100, MSFT: 100, SPY: 600, BND: 10 };
    const { byKey, total } = computeAllocation(positions, prices);

    // Equity: (10*100 + 20*100) = 3000
    // ETF: 5*600 = 3000
    // Bond: 100*10 = 1000
    // Total: 7000

    expect(total).toBeCloseTo(7000);
    expect(byKey.Equity.value).toBeCloseTo(3000);
    expect(byKey.Equity.weight).toBeCloseTo(3000 / 7000);
    expect(byKey.ETF.weight).toBeCloseTo(3000 / 7000);
    expect(byKey.Bond.weight).toBeCloseTo(1000 / 7000);

    const sumWeights =
      byKey.Equity.weight + byKey.ETF.weight + byKey.Bond.weight;
    expect(sumWeights).toBeCloseTo(1.0, 5);
  });

  test("computeAllocation – fallback na ticker (bez assetClass)", () => {
    const posNoAsset = [
      { ticker: "AAPL", quantity: 10 },
      { ticker: "MSFT", quantity: 20 },
    ];
    const prices = { AAPL: 100, MSFT: 100 };
    const { byKey } = computeAllocation(posNoAsset, prices);

    expect(byKey.AAPL).toBeDefined();
    expect(byKey.MSFT).toBeDefined();
    expect(byKey.AAPL.value).toBeCloseTo(1000);
    expect(byKey.MSFT.value).toBeCloseTo(2000);
  });

  test("computeAllocation – nulová portfolio (total=0)", () => {
    const prices = { AAPL: 0, MSFT: 0, SPY: 0, BND: 0 };
    const { byKey, total } = computeAllocation(positions, prices);
    expect(total).toBe(0);
    expect(byKey.Equity.weight).toBe(0);
    expect(byKey.Bond.weight).toBe(0);
  });

  test("computeAllocation – frakční podíly (např. ETF)", () => {
    const posFloat = [
      { ticker: "VANGUARD", quantity: 2.5, assetClass: "ETF" },
    ];
    const prices = { VANGUARD: 400 };
    const { byKey, total } = computeAllocation(posFloat, prices);
    expect(total).toBeCloseTo(1000);
    expect(byKey.ETF.value).toBeCloseTo(1000);
    expect(byKey.ETF.weight).toBeCloseTo(1.0);
  });
});

describe("portfolioMath – P&L (zisk/ztráta)", () => {
  const positions = [
    { ticker: "AAPL", quantity: 10, avgCost: 150 },
    { ticker: "SPY", quantity: 5, avgCost: 500 },
    { ticker: "NEW", quantity: 2, avgCost: 0 }, // IPO za 0
  ];

  test("computePnL – pozitivní P&L", () => {
    const prices = { AAPL: 210, SPY: 600, NEW: 100 };
    const { items, totalPnl, totalCost, totalMV } = computePnL(
      positions,
      prices
    );

    // AAPL: cost=1500, mv=2100, pnl=600, pct=0.4
    // SPY: cost=2500, mv=3000, pnl=500, pct=0.2
    // NEW: cost=0, mv=200, pnl=200, pct=null

    expect(items[0].pnl).toBeCloseTo(600);
    expect(items[0].pnlPct).toBeCloseTo(0.4);
    expect(items[1].pnl).toBeCloseTo(500);
    expect(items[2].pnl).toBeCloseTo(200);
    expect(items[2].pnlPct).toBeNull();

    expect(totalCost).toBeCloseTo(4000);
    expect(totalMV).toBeCloseTo(5300);
    expect(totalPnl).toBeCloseTo(1300);
  });

  test("computePnL – negativní P&L", () => {
    const prices = { AAPL: 120, SPY: 450, NEW: 50 };
    const { items, totalPnl } = computePnL(positions, prices);

    expect(items[0].pnl).toBeCloseTo(-300); // 10*120 - 1500 = 1200 - 1500
    expect(items[0].pnlPct).toBeCloseTo(-0.2); // -300/1500
    expect(totalPnl).toBeCloseTo(-450); // (1200+2250+100) - 4000 = 3550 - 4000
  });

  test("computePnL – bez avgCost (chybějící)", () => {
    const posNoAvg = [{ ticker: "AIRDROP", quantity: 100 }];
    const prices = { AIRDROP: 10 };
    const { items, totalCost, totalPnl } = computePnL(posNoAvg, prices);

    expect(items[0].pnl).toBeCloseTo(1000);
    expect(items[0].pnlPct).toBeNull();
    expect(totalCost).toBe(0);
    expect(totalPnl).toBeCloseTo(1000);
  });
});

describe("portfolioMath – denní změna (Daily Change)", () => {
  const positions = [
    { ticker: "AAPL", quantity: 10 },
    { ticker: "SPY", quantity: 5 },
  ];

  test("computeDailyChange – vzestup", () => {
    const priceYesterday = { AAPL: 200, SPY: 590 };
    const priceToday = { AAPL: 210, SPY: 600 };

    const { delta, deltaPct, mvYesterday, mvToday } = computeDailyChange(
      positions,
      priceToday,
      priceYesterday
    );

    expect(mvYesterday).toBeCloseTo(2000 + 2950); // 4950
    expect(mvToday).toBeCloseTo(2100 + 3000); // 5100
    expect(delta).toBeCloseTo(150);
    expect(deltaPct).toBeCloseTo(150 / 4950);
  });

  test("computeDailyChange – pokles", () => {
    const priceYesterday = { AAPL: 220, SPY: 610 };
    const priceToday = { AAPL: 210, SPY: 600 };

    const { delta, deltaPct } = computeDailyChange(
      positions,
      priceToday,
      priceYesterday
    );

    expect(delta).toBeCloseTo(-150); // (10*210 + 5*600) - (10*220 + 5*610)
    expect(deltaPct).toBeLessThan(0);
  });

  test("computeDailyChange – nulová zmìna", () => {
    const prices = { AAPL: 210, SPY: 600 };
    const { delta, deltaPct } = computeDailyChange(positions, prices, prices);

    expect(delta).toBeCloseTo(0);
    expect(deltaPct).toBeCloseTo(0);
  });

  test("computeDailyChange – včerejší MV = 0", () => {
    const priceYesterday = { AAPL: 0, SPY: 0 };
    const priceToday = { AAPL: 210, SPY: 600 };

    const { delta, deltaPct } = computeDailyChange(
      positions,
      priceToday,
      priceYesterday
    );

    expect(delta).toBeCloseTo(5100);
    expect(deltaPct).toBeNull();
  });
});

describe("portfolioMath – časová řada (Time Series)", () => {
  const positions = [
    { ticker: "AAPL", quantity: 10 },
    { ticker: "SPY", quantity: 5 },
  ];

  test("computeTimeSeriesValue – seřazení dle data", () => {
    const pricesByDate = {
      "2025-10-22": { AAPL: 210, SPY: 600 }, // 5100
      "2025-10-21": { AAPL: 200, SPY: 590 }, // 4950
      "2025-10-23": { AAPL: 220, SPY: 610 }, // 5250
    };

    const series = computeTimeSeriesValue(positions, pricesByDate);

    expect(series).toHaveLength(3);
    expect(series[0].date).toBe("2025-10-21");
    expect(series[1].date).toBe("2025-10-22");
    expect(series[2].date).toBe("2025-10-23");
    expect(series[0].value).toBeCloseTo(4950);
    expect(series[2].value).toBeCloseTo(5250);
  });

  test("computeTimeSeriesValue – prázdný pricesByDate", () => {
    const series = computeTimeSeriesValue(positions, {});
    expect(series).toHaveLength(0);
  });
});

describe("portfolioMath – annualizovaný výnos (CAGR)", () => {
  test("computeAnnualizedReturn – 1 rok, +10%", () => {
    const series = [
      { date: "2024-10-22", value: 10000 },
      { date: "2025-10-22", value: 11000 },
    ];

    const ann = computeAnnualizedReturn(series);
    // Skoro přesně 10%, ale kvůli přestupným rokům je malá odchylka
    expect(ann).toBeCloseTo(0.1, 2);
  });

  test("computeAnnualizedReturn – půl roku, +10%", () => {
    // 10% za 6 měsíců = ~21.05% p.a. (geometricky)
    const series = [
      { date: "2025-01-01", value: 10000 },
      { date: "2025-07-02", value: 11000 }, // 181 dní
    ];

    const ann = computeAnnualizedReturn(series);
    // (11000/10000)^(365.25/181) - 1 ≈ 0.22
    expect(ann).toBeGreaterThan(0.2);
    expect(ann).toBeLessThan(0.23);
  });

  test("computeAnnualizedReturn – 10 let, 3x hodnota", () => {
    const series = [
      { date: "2015-10-22", value: 10000 },
      { date: "2025-10-22", value: 30000 },
    ];

    const ann = computeAnnualizedReturn(series);
    // 3^(1/10) - 1 ≈ 0.1161 (11.61%)
    expect(ann).toBeCloseTo(0.1161, 3);
  });

  test("computeAnnualizedReturn – zisk 0% (stejná hodnota)", () => {
    const series = [
      { date: "2024-10-22", value: 10000 },
      { date: "2025-10-22", value: 10000 },
    ];

    const ann = computeAnnualizedReturn(series);
    expect(ann).toBeCloseTo(0, 5);
  });

  test("computeAnnualizedReturn – ztráta (vrátí záporné %)", () => {
    const series = [
      { date: "2024-10-22", value: 10000 },
      { date: "2025-10-22", value: 9000 },
    ];

    const ann = computeAnnualizedReturn(series);
    // (9000/10000)^1 - 1 = -0.1, ale s malou odchylkou kvůli přestupným rokům
    expect(ann).toBeCloseTo(-0.1, 2);
  });

  test("computeAnnualizedReturn – nedostatek dat", () => {
    expect(computeAnnualizedReturn([])).toBeNull();
    expect(computeAnnualizedReturn([{ date: "2025-10-22", value: 10000 }])).toBeNull();
  });

  test("computeAnnualizedReturn – nulová/záporná hodnota", () => {
    expect(
      computeAnnualizedReturn([
        { date: "2025-10-22", value: 0 },
        { date: "2025-10-23", value: 100 },
      ])
    ).toBeNull();

    expect(
      computeAnnualizedReturn([
        { date: "2025-10-22", value: 10000 },
        { date: "2025-10-23", value: -100 },
      ])
    ).toBeNull();
  });

  test("computeAnnualizedReturn – stejný den", () => {
    const series = [
      { date: "2025-10-22", value: 10000 },
      { date: "2025-10-22", value: 15000 },
    ];

    const ann = computeAnnualizedReturn(series);
    expect(ann).toBeNull(); // years=0
  });
});

describe("portfolioMath – vážený průměr výnosu (TVWR zjednodušeno)", () => {
  test("computeWeightedAverageReturn – konzistentní denní výnosy", () => {
    const series = [
      { date: "2025-10-20", value: 10000 },
      { date: "2025-10-21", value: 10100 }, // +1%
      { date: "2025-10-22", value: 10201 }, // +1%
      { date: "2025-10-23", value: 10303 }, // +1%
    ];

    const tvwr = computeWeightedAverageReturn(series);
    // Průměr denních +1% = +1%
    expect(tvwr).toBeCloseTo(0.01, 2);
  });

  test("computeWeightedAverageReturn – nestejné doby", () => {
    // 3 dny: +10%, pak 1 den: -5%
    const series = [
      { date: "2025-10-20", value: 10000 },
      { date: "2025-10-23", value: 11000 }, // +10% za 3 dny
      { date: "2025-10-24", value: 10450 }, // -5% za 1 den
    ];

    const tvwr = computeWeightedAverageReturn(series);
    // w1 = 3/4, w2 = 1/4
    // TVWR = (3/4)*0.1 + (1/4)*(-0.05) = 0.075 - 0.0125 = 0.0625
    expect(tvwr).toBeCloseTo(0.0625, 2);
  });

  test("computeWeightedAverageReturn – nedostatek dat", () => {
    expect(computeWeightedAverageReturn([])).toBeNull();
    expect(
      computeWeightedAverageReturn([{ date: "2025-10-22", value: 10000 }])
    ).toBeNull();
  });

  test("computeWeightedAverageReturn – nulová počáteční hodnota", () => {
    const series = [
      { date: "2025-10-20", value: 0 },
      { date: "2025-10-21", value: 1000 },
    ];

    const tvwr = computeWeightedAverageReturn(series);
    expect(tvwr).toBeNull();
  });
});

describe("portfolioMath – integrace (end-to-end)", () => {
  test("Komplexní portfolio: normalizace → MV → alokace → P&L → denní změna", () => {
    const positions = [
      { ticker: "AAPL", quantity: 10, avgCost: 150, assetClass: "Equity" },
      { ticker: "BND", quantity: 50, avgCost: 100, assetClass: "Bond" },
      { ticker: "CASH", quantity: 1000, assetClass: "Cash" },
    ];

    const priceYesterday = { AAPL: 200, BND: 105, CASH: 1 };
    const priceToday = { AAPL: 210, BND: 104, CASH: 1 };

    // 1. Normalizace
    const norm = normalizePositions(positions);
    expect(norm).toHaveLength(3);

    // 2. MV
    const mv = computeMarketValue(norm, priceToday);
    expect(mv.total).toBeCloseTo(2100 + 5200 + 1000); // 8300

    // 3. Alokace
    const alloc = computeAllocation(norm, priceToday);
    expect(alloc.byKey.Equity.weight + alloc.byKey.Bond.weight + alloc.byKey.Cash.weight).toBeCloseTo(1.0, 5);

    // 4. P&L
    const pnl = computePnL(norm, priceToday);
    expect(pnl.totalCost).toBeCloseTo(10 * 150 + 50 * 100); // 6500
    expect(pnl.totalMV).toBeCloseTo(8300);

    // 5. Denní změna
    const daily = computeDailyChange(norm, priceToday, priceYesterday);
    // Yesterday: 2000 + 5250 + 1000 = 8250; Today: 2100 + 5200 + 1000 = 8300
    // Delta = +50 (AAPL grew more than BND fell)
    expect(daily.delta).toBeCloseTo(50);
  });
});
