/**
 * @jest-environment jsdom
 */
/**
 * Integration Tests - Portfolio Workflow
 * Tests module interactions, event handlers, and data flow
 */

import { jest } from '@jest/globals';
import { PortfolioStorage, validateFundData, parseSafeNumber } from '../../modules/data-manager.js';
import { calculatePortfolioMetrics, calculateFundYield } from '../../modules/portfolio-calculator.js';
import { formatCurrency, formatPercentage, generateCSV } from '../../modules/utilities.js';

describe('Portfolio Workflow Integration', () => {
  let storage;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new PortfolioStorage();
    
    // Mock window.URL.createObjectURL for jsdom
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Complete User Flow: Client Setup -> Add Funds -> Calculate Metrics', () => {
    test('should handle full workflow from client creation to portfolio calculation', () => {
      // Step 1: Save client information
      const clientInfo = {
        clientName: 'Jan Novák',
        advisorName: 'Petr Svoboda',
        advisorEmail: 'petr.svoboda@example.com'
      };
      
      const clientSaved = storage.saveClient(clientInfo);
      expect(clientSaved).toBe(true);
      
      const loadedClient = storage.loadClient();
      expect(loadedClient).toEqual(clientInfo);

      // Step 2: Add multiple funds to portfolio
      const funds = [
        {
          name: 'Fond A',
          producer: 'Správce 1',
          investment: 100000,
          value: 110000,
          investmentDate: '2024-01-01'
        },
        {
          name: 'Fond B',
          producer: 'Správce 2',
          investment: 200000,
          value: 190000,
          investmentDate: '2024-02-01'
        },
        {
          name: 'Fond C',
          producer: 'Správce 1',
          investment: 150000,
          value: 165000,
          investmentDate: '2024-03-01'
        }
      ];

      // Validate and save each fund
      funds.forEach(fund => {
        const errors = validateFundData(fund);
        expect(errors).toHaveLength(0);
      });

      const saved = storage.saveData(funds);
      expect(saved).toBe(true);

      // Step 3: Load and verify portfolio data
      const loadedFunds = storage.loadData();
      expect(loadedFunds).toHaveLength(3);
      expect(loadedFunds).toEqual(funds);

      // Step 4: Calculate portfolio metrics
      const metrics = calculatePortfolioMetrics(loadedFunds);
      
      expect(metrics.totalInvestment).toBe(450000);
      expect(metrics.totalValue).toBe(465000);
      expect(metrics.totalProfit).toBe(15000);
      expect(metrics.totalYield).toBeCloseTo(3.33, 1);
      expect(metrics.bestFund.name).toBe('Fond A');
      expect(metrics.worstFund.name).toBe('Fond B');

      // Step 5: Calculate individual fund yields
      const yieldA = calculateFundYield(funds[0]);
      const yieldB = calculateFundYield(funds[1]);
      const yieldC = calculateFundYield(funds[2]);
      
      expect(yieldA).toBe(10); // 10% gain
      expect(yieldB).toBe(-5); // 5% loss
      expect(yieldC).toBe(10); // 10% gain

      // Step 6: Format values for display
      const formattedValue = formatCurrency(metrics.totalValue);
      const formattedYield = formatPercentage(metrics.totalYield);
      
      expect(formattedValue).toContain('465');
      expect(formattedYield).toContain('%');
    });
  });

  describe('Data Persistence and Recovery', () => {
    test('should persist data across storage instances', () => {
      const initialStorage = new PortfolioStorage();
      const testData = [
        {
          name: 'Test Fund',
          producer: 'Test Producer',
          investment: 50000,
          value: 55000,
          investmentDate: '2024-01-01'
        }
      ];

      initialStorage.saveData(testData);

      // Create new storage instance (simulates page reload)
      const newStorage = new PortfolioStorage();
      const loadedData = newStorage.loadData();

      expect(loadedData).toEqual(testData);
    });

    test('should handle corrupted data gracefully', () => {
      // Manually corrupt localStorage
      localStorage.setItem('portfolioData', 'invalid json {');
      
      const loadedData = storage.loadData();
      expect(loadedData).toEqual([]); // Should return empty array on error
    });
  });

  describe('CRUD Operations', () => {
    test('should handle Create, Read, Update, Delete operations', () => {
      const initialFunds = [
        {
          name: 'Fond 1',
          producer: 'Správce A',
          investment: 100000,
          value: 105000,
          investmentDate: '2024-01-01'
        },
        {
          name: 'Fond 2',
          producer: 'Správce B',
          investment: 200000,
          value: 210000,
          investmentDate: '2024-02-01'
        }
      ];

      // CREATE
      storage.saveData(initialFunds);
      let loaded = storage.loadData();
      expect(loaded).toHaveLength(2);

      // UPDATE
      loaded[0].value = 108000;
      storage.saveData(loaded);
      loaded = storage.loadData();
      expect(loaded[0].value).toBe(108000);

      // DELETE
      loaded.splice(1, 1);
      storage.saveData(loaded);
      loaded = storage.loadData();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('Fond 1');

      // CLEAR ALL
      const cleared = storage.clearAll();
      expect(cleared).toBe(true);
      loaded = storage.loadData();
      expect(loaded).toEqual([]);
    });
  });

  describe('Validation Integration', () => {
    test('should validate fund data before saving', () => {
      const invalidFund = {
        name: '', // Missing name
        producer: 'Správce',
        investment: -1000, // Negative investment
        value: 'invalid', // Invalid value
        investmentDate: '2024-01-01'
      };

      const errors = validateFundData(invalidFund);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Název fondu je povinný');
      expect(errors).toContain('Investice musí být kladné číslo');
    });

    test('should parse numbers safely', () => {
      expect(parseSafeNumber('1000')).toBe(1000);
      expect(parseSafeNumber('1 000')).toBe(1000);
      expect(parseSafeNumber('invalid', 0)).toBe(0);
      expect(parseSafeNumber(null, 100)).toBe(100);
      expect(parseSafeNumber(undefined, 50)).toBe(50);
    });
  });

  describe('CSV Export Integration', () => {
    test('should generate CSV from portfolio data', () => {
      const funds = [
        {
          name: 'Fond A',
          producer: 'Správce 1',
          investment: 100000,
          value: 110000,
          investmentDate: '2024-01-01'
        }
      ];

      // Note: generateCSV triggers download, we test it doesn't throw
      expect(() => {
        generateCSV(funds, 'TestClient');
      }).not.toThrow();
    });
  });

  describe('Autosave Integration', () => {
    test('should setup and teardown autosave interval', (done) => {
      let callCount = 0;
      const callback = () => {
        callCount++;
        if (callCount === 1) {
          storage.stopAutosave();
          expect(callCount).toBe(1);
          done();
        }
      };

      storage.startAutosave(callback);
      
      // Wait for autosave to trigger (30 seconds in production, but we'll test the setup)
      setTimeout(() => {
        storage.stopAutosave();
        done();
      }, 100);
    }, 1000);
  });

  describe('Metrics Calculation Edge Cases', () => {
    test('should handle empty portfolio', () => {
      const metrics = calculatePortfolioMetrics([]);
      expect(metrics.totalInvestment).toBe(0);
      expect(metrics.totalValue).toBe(0);
      expect(metrics.totalProfit).toBe(0);
      expect(metrics.totalYield).toBe(0);
      expect(metrics.bestFund).toBeNull();
      expect(metrics.worstFund).toBeNull();
    });

    test('should handle portfolio with zero investment', () => {
      const funds = [
        {
          name: 'Zero Fund',
          producer: 'Správce',
          investment: 0,
          value: 1000,
          investmentDate: '2024-01-01'
        }
      ];

      const yield1 = calculateFundYield(funds[0]);
      expect(yield1).toBe(0); // Division by zero handled
    });

    test('should calculate negative yields correctly', () => {
      const funds = [
        {
          name: 'Loss Fund',
          producer: 'Správce',
          investment: 100000,
          value: 80000,
          investmentDate: '2024-01-01'
        }
      ];

      const metrics = calculatePortfolioMetrics(funds);
      expect(metrics.totalYield).toBe(-20);
      
      const yield1 = calculateFundYield(funds[0]);
      expect(yield1).toBe(-20);
    });
  });

  describe('Last Save Timestamp', () => {
    test('should track last save time', () => {
      const testData = [{
        name: 'Fond',
        producer: 'Správce',
        investment: 100000,
        value: 105000,
        investmentDate: '2024-01-01'
      }];

      const beforeSave = new Date();
      storage.saveData(testData);
      const afterSave = new Date();

      const lastSaveTime = storage.getLastSaveTime();
      expect(lastSaveTime).toBeInstanceOf(Date);
      expect(lastSaveTime.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(lastSaveTime.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });
  });
});
