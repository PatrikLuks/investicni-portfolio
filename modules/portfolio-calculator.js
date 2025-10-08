/**
 * PORTFOLIO CALCULATOR MODULE
 * Business logic for portfolio calculations and metrics
 */

import { parseSafeNumber } from './data-manager.js';

// ==================== PORTFOLIO CALCULATIONS ====================
function calculatePortfolioMetrics(portfolioData) {
  if (!portfolioData || portfolioData.length === 0) {
    return {
      totalInvestment: 0,
      totalValue: 0,
      totalProfit: 0,
      totalYield: 0,
      bestFund: null,
      worstFund: null,
      averageYield: 0,
    };
  }

  const totalInvestment = portfolioData.reduce(
    (sum, item) => sum + parseSafeNumber(item.investment),
    0
  );
  const totalValue = portfolioData.reduce((sum, item) => sum + parseSafeNumber(item.value), 0);
  const totalProfit = totalValue - totalInvestment;
  const totalYield = totalInvestment !== 0 ? (totalProfit / totalInvestment) * 100 : 0;

  // Find best and worst performing funds
  let bestFund = null;
  let worstFund = null;
  let bestYield = -Infinity;
  let worstYield = Infinity;
  let totalYieldSum = 0;

  portfolioData.forEach((item) => {
    const investment = parseSafeNumber(item.investment);
    const value = parseSafeNumber(item.value);
    const fundYield = investment !== 0 ? ((value - investment) / investment) * 100 : 0;

    totalYieldSum += fundYield;

    if (fundYield > bestYield) {
      bestYield = fundYield;
      bestFund = { ...item, yield: fundYield };
    }

    if (fundYield < worstYield) {
      worstYield = fundYield;
      worstFund = { ...item, yield: fundYield };
    }
  });

  const averageYield = portfolioData.length > 0 ? totalYieldSum / portfolioData.length : 0;

  return {
    totalInvestment,
    totalValue,
    totalProfit,
    totalYield,
    bestFund,
    worstFund,
    averageYield,
  };
}

// ==================== FUND YIELD CALCULATION ====================
function calculateFundYield(fund) {
  const investment = parseSafeNumber(fund.investment);
  const value = parseSafeNumber(fund.value);
  return investment !== 0 ? ((value - investment) / investment) * 100 : 0;
}

// ==================== PORTFOLIO DIVERSIFICATION ====================
function calculateDiversification(portfolioData) {
  if (!portfolioData || portfolioData.length === 0) {
    return {
      byProducer: [],
      byAssetType: [],
    };
  }

  const totalValue = portfolioData.reduce((sum, item) => sum + parseSafeNumber(item.value), 0);

  // Group by producer
  const byProducer = {};
  portfolioData.forEach((item) => {
    const producer = item.producer || 'Neznámý';
    const value = parseSafeNumber(item.value);

    if (!byProducer[producer]) {
      byProducer[producer] = { value: 0, count: 0 };
    }
    byProducer[producer].value += value;
    byProducer[producer].count += 1;
  });

  // Convert to array with percentages
  const producerArray = Object.entries(byProducer).map(([name, data]) => ({
    name,
    value: data.value,
    count: data.count,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
  }));

  // Sort by value descending
  producerArray.sort((a, b) => b.value - a.value);

  return {
    byProducer: producerArray,
    byAssetType: [], // For future expansion
  };
}

// ==================== PRODUCER AGGREGATION ====================
function aggregateByProducer(portfolioData) {
  if (!portfolioData || portfolioData.length === 0) return [];

  const producerMap = {};

  portfolioData.forEach((fund) => {
    const producer = fund.producer || 'Neznámý';
    const investment = parseSafeNumber(fund.investment);
    const value = parseSafeNumber(fund.value);
    const profit = value - investment;

    if (!producerMap[producer]) {
      producerMap[producer] = {
        producer,
        totalInvestment: 0,
        totalValue: 0,
        totalProfit: 0,
        count: 0,
        funds: [],
      };
    }

    producerMap[producer].totalInvestment += investment;
    producerMap[producer].totalValue += value;
    producerMap[producer].totalProfit += profit;
    producerMap[producer].count += 1;
    producerMap[producer].funds.push(fund);
  });

  // Convert to array and calculate yields
  return Object.values(producerMap).map((producer) => ({
    ...producer,
    yield:
      producer.totalInvestment !== 0
        ? (producer.totalProfit / producer.totalInvestment) * 100
        : 0,
  }));
}

// ==================== SORTING & FILTERING ====================
function sortFunds(funds, column, direction = 'asc') {
  const sorted = [...funds];

  sorted.sort((a, b) => {
    let aVal, bVal;

    switch (column) {
      case 'name':
      case 'producer':
        aVal = (a[column] || '').toLowerCase();
        bVal = (b[column] || '').toLowerCase();
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);

      case 'investment':
      case 'value':
        aVal = parseSafeNumber(a[column]);
        bVal = parseSafeNumber(b[column]);
        return direction === 'asc' ? aVal - bVal : bVal - aVal;

      case 'yield':
        const yieldA = calculateFundYield(a);
        const yieldB = calculateFundYield(b);
        return direction === 'asc' ? yieldA - yieldB : yieldB - yieldA;

      default:
        return 0;
    }
  });

  return sorted;
}

function filterFunds(funds, searchQuery) {
  if (!searchQuery || searchQuery.trim() === '') return funds;

  const query = searchQuery.toLowerCase().trim();

  return funds.filter((fund) => {
    return (
      (fund.name || '').toLowerCase().includes(query) ||
      (fund.producer || '').toLowerCase().includes(query)
    );
  });
}

// Export module
export {
  calculatePortfolioMetrics,
  calculateFundYield,
  calculateDiversification,
  aggregateByProducer,
  sortFunds,
  filterFunds,
};
