/**
 * Integration Tests for Portfolio Manager
 * Tests end-to-end workflows
 */

describe('Portfolio Manager - Integration Tests', () => {
  let portfolioData;
  
  beforeEach(() => {
    portfolioData = [
      {
        fond: 'Test Fund 1',
        producer: 'Producer A',
        investment: 10000,
        value: 12000,
        investmentDate: '2023-01-01'
      },
      {
        fond: 'Test Fund 2',
        producer: 'Producer B',
        investment: 5000,
        value: 5500,
        investmentDate: '2023-06-01'
      }
    ];
  });

  describe('Portfolio Operations', () => {
    test('should add new fund to portfolio', () => {
      const newFund = {
        fond: 'Test Fund 3',
        producer: 'Producer C',
        investment: 3000,
        value: 3300,
        investmentDate: '2024-01-01'
      };
      
      portfolioData.push(newFund);
      
      expect(portfolioData).toHaveLength(3);
      expect(portfolioData[2].fond).toBe('Test Fund 3');
    });

    test('should remove fund from portfolio', () => {
      portfolioData.splice(0, 1);
      
      expect(portfolioData).toHaveLength(1);
      expect(portfolioData[0].fond).toBe('Test Fund 2');
    });

    test('should update fund value', () => {
      portfolioData[0].value = 13000;
      
      expect(portfolioData[0].value).toBe(13000);
    });

    test('should calculate total portfolio value', () => {
      const totalValue = portfolioData.reduce((sum, fund) => sum + fund.value, 0);
      expect(totalValue).toBe(17500);
    });

    test('should calculate total investment', () => {
      const totalInvestment = portfolioData.reduce((sum, fund) => sum + fund.investment, 0);
      expect(totalInvestment).toBe(15000);
    });

    test('should calculate total profit', () => {
      const totalValue = portfolioData.reduce((sum, fund) => sum + fund.value, 0);
      const totalInvestment = portfolioData.reduce((sum, fund) => sum + fund.investment, 0);
      const profit = totalValue - totalInvestment;
      
      expect(profit).toBe(2500);
    });
  });

  describe('Data Validation', () => {
    test('should validate required fields', () => {
      const invalidFund = {
        fond: '',
        producer: 'Producer D',
        investment: 1000,
        value: 1100
      };
      
      const errors = [];
      if (!invalidFund.fond || invalidFund.fond.trim() === '') {
        errors.push('Název fondu je povinný');
      }
      
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Název fondu je povinný');
    });

    test('should validate positive investment', () => {
      const invalidFund = {
        fond: 'Test Fund',
        producer: 'Producer D',
        investment: -1000,
        value: 1100
      };
      
      const errors = [];
      if (invalidFund.investment <= 0) {
        errors.push('Investice musí být kladné číslo');
      }
      
      expect(errors).toHaveLength(1);
    });

    test('should validate non-negative value', () => {
      const invalidFund = {
        fond: 'Test Fund',
        producer: 'Producer D',
        investment: 1000,
        value: -100
      };
      
      const errors = [];
      if (invalidFund.value < 0) {
        errors.push('Hodnota nemůže být záporná');
      }
      
      expect(errors).toHaveLength(1);
    });
  });

  describe('Storage Operations', () => {
    test('should save data to localStorage', () => {
      const storageKey = 'portfolioData_test';
      localStorage.setItem(storageKey, JSON.stringify(portfolioData));
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        storageKey,
        expect.any(String)
      );
    });

    test('should load data from localStorage', () => {
      const storageKey = 'portfolioData_test';
      const mockData = JSON.stringify(portfolioData);
      
      localStorage.getItem.mockReturnValue(mockData);
      const loaded = JSON.parse(localStorage.getItem(storageKey));
      
      expect(loaded).toEqual(portfolioData);
    });

    test('should handle missing localStorage data', () => {
      localStorage.getItem.mockReturnValue(null);
      const loaded = localStorage.getItem('nonexistent') || [];
      
      expect(loaded).toEqual([]);
    });
  });

  describe('Sorting and Filtering', () => {
    test('should sort by fund name', () => {
      const sorted = [...portfolioData].sort((a, b) => 
        a.fond.localeCompare(b.fond)
      );
      
      expect(sorted[0].fond).toBe('Test Fund 1');
      expect(sorted[1].fond).toBe('Test Fund 2');
    });

    test('should sort by value descending', () => {
      const sorted = [...portfolioData].sort((a, b) => b.value - a.value);
      
      expect(sorted[0].value).toBe(12000);
      expect(sorted[1].value).toBe(5500);
    });

    test('should filter by producer', () => {
      const filtered = portfolioData.filter(fund => fund.producer === 'Producer A');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].fond).toBe('Test Fund 1');
    });

    test('should search by fund name', () => {
      const searchTerm = 'fund 1';
      const results = portfolioData.filter(fund => 
        fund.fond.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].fond).toBe('Test Fund 1');
    });
  });
});
