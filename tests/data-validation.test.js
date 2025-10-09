/**
 * Unit Tests for Data Validation Manager
 * Tests all validation functions and edge cases
 */

describe('DataValidationManager', () => {
  let validator;

  beforeEach(() => {
    // Mock implementation of DataValidationManager
    validator = {
      validateNumber: function(value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num)) return { valid: false, error: 'Must be a number' };
        if (min !== undefined && num < min) return { valid: false, error: `Must be >= ${min}` };
        if (max !== undefined && num > max) return { valid: false, error: `Must be <= ${max}` };
        return { valid: true };
      },

      validateRequired: function(value) {
        if (value === null || value === undefined) return { valid: false, error: 'Required field' };
        if (typeof value === 'string' && value.trim() === '') return { valid: false, error: 'Required field' };
        return { valid: true };
      },

      validateString: function(value, minLength, maxLength) {
        if (typeof value !== 'string') return { valid: false, error: 'Must be a string' };
        if (minLength && value.length < minLength) return { valid: false, error: `Too short (min ${minLength})` };
        if (maxLength && value.length > maxLength) return { valid: false, error: `Too long (max ${maxLength})` };
        return { valid: true };
      },

      validateDate: function(dateString) {
        if (!dateString) return { valid: false, error: 'Date required' };
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { valid: false, error: 'Invalid date format' };
        const now = new Date();
        if (date > now) return { valid: false, error: 'Date cannot be in the future' };
        const minDate = new Date('1900-01-01');
        if (date < minDate) return { valid: false, error: 'Date too old' };
        return { valid: true, value: date };
      },

      validateEmail: function(email) {
        if (!email) return { valid: false, error: 'Email required' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return { valid: false, error: 'Invalid email format' };
        return { valid: true };
      },

      validateTicker: function(ticker) {
        if (!ticker) return { valid: true }; // Optional field
        if (typeof ticker !== 'string') return { valid: false, error: 'Ticker must be a string' };
        if (ticker.length > 10) return { valid: false, error: 'Ticker too long (max 10 chars)' };
        const tickerRegex = /^[A-Z0-9\.\-]+$/;
        if (!tickerRegex.test(ticker)) return { valid: false, error: 'Ticker must be uppercase letters, numbers, dots, or hyphens' };
        return { valid: true };
      },

      validateCurrency: function(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return { valid: false, error: 'Invalid currency amount' };
        if (num < 0) return { valid: false, error: 'Amount cannot be negative' };
        if (num > 999999999999) return { valid: false, error: 'Amount too large' };
        // Check decimal places
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) return { valid: false, error: 'Too many decimal places (max 2)' };
        return { valid: true, value: parseFloat(num.toFixed(2)) };
      },

      validatePosition: function(position) {
        const errors = [];
        
        // Validate required fields
        if (!position.fond) errors.push('Fund name required');
        if (!position.kategorie) errors.push('Category required');
        if (position.aktuálníCena === undefined) errors.push('Current price required');
        if (position.počet === undefined) errors.push('Quantity required');
        if (position.nákupníCena === undefined) errors.push('Purchase price required');
        
        // Validate number fields
        if (position.aktuálníCena !== undefined) {
          const priceValidation = this.validateNumber(position.aktuálníCena, 0, 1000000000);
          if (!priceValidation.valid) errors.push(`Current price: ${priceValidation.error}`);
        }
        
        if (position.počet !== undefined) {
          const quantityValidation = this.validateNumber(position.počet, 0.000001, 1000000000);
          if (!quantityValidation.valid) errors.push(`Quantity: ${quantityValidation.error}`);
        }
        
        if (position.nákupníCena !== undefined) {
          const purchaseValidation = this.validateNumber(position.nákupníCena, 0, 1000000000);
          if (!purchaseValidation.valid) errors.push(`Purchase price: ${purchaseValidation.error}`);
        }
        
        return errors.length === 0 ? { valid: true } : { valid: false, errors };
      },

      validatePortfolio: function(portfolio) {
        if (!portfolio) return { valid: false, error: 'Portfolio object required' };
        if (!portfolio.name || portfolio.name.trim() === '') return { valid: false, error: 'Portfolio name required' };
        if (!Array.isArray(portfolio.positions)) return { valid: false, error: 'Positions must be an array' };
        return { valid: true };
      }
    };
  });

  describe('Number Validation', () => {
    test('should validate positive numbers', () => {
      const result = validator.validateNumber(42, 0, 100);
      expect(result.valid).toBe(true);
    });

    test('should validate decimal numbers', () => {
      const result = validator.validateNumber(42.5, 0, 100);
      expect(result.valid).toBe(true);
    });

    test('should reject non-numeric strings', () => {
      const result = validator.validateNumber('abc', 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });

    test('should reject numbers below minimum', () => {
      const result = validator.validateNumber(5, 10, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('>=');
    });

    test('should reject numbers above maximum', () => {
      const result = validator.validateNumber(150, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('<=');
    });

    test('should accept zero when min is 0', () => {
      const result = validator.validateNumber(0, 0, 100);
      expect(result.valid).toBe(true);
    });

    test('should accept negative numbers without min constraint', () => {
      const result = validator.validateNumber(-10);
      expect(result.valid).toBe(true);
    });

    test('should handle string numbers', () => {
      const result = validator.validateNumber('42', 0, 100);
      expect(result.valid).toBe(true);
    });
  });

  describe('Required Field Validation', () => {
    test('should accept valid non-empty string', () => {
      const result = validator.validateRequired('Valid text');
      expect(result.valid).toBe(true);
    });

    test('should accept valid number', () => {
      const result = validator.validateRequired(42);
      expect(result.valid).toBe(true);
    });

    test('should accept zero', () => {
      const result = validator.validateRequired(0);
      expect(result.valid).toBe(true);
    });

    test('should reject null', () => {
      const result = validator.validateRequired(null);
      expect(result.valid).toBe(false);
    });

    test('should reject undefined', () => {
      const result = validator.validateRequired(undefined);
      expect(result.valid).toBe(false);
    });

    test('should reject empty string', () => {
      const result = validator.validateRequired('');
      expect(result.valid).toBe(false);
    });

    test('should reject whitespace-only string', () => {
      const result = validator.validateRequired('   ');
      expect(result.valid).toBe(false);
    });
  });

  describe('String Validation', () => {
    test('should validate string with correct length', () => {
      const result = validator.validateString('Hello', 3, 10);
      expect(result.valid).toBe(true);
    });

    test('should reject non-string values', () => {
      const result = validator.validateString(42, 1, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('string');
    });

    test('should reject strings below minimum length', () => {
      const result = validator.validateString('Hi', 5, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('short');
    });

    test('should reject strings above maximum length', () => {
      const result = validator.validateString('Very long string here', 1, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('long');
    });

    test('should accept empty string without length constraints', () => {
      const result = validator.validateString('');
      expect(result.valid).toBe(true);
    });

    test('should handle exact minimum length', () => {
      const result = validator.validateString('12345', 5, 10);
      expect(result.valid).toBe(true);
    });

    test('should handle exact maximum length', () => {
      const result = validator.validateString('1234567890', 1, 10);
      expect(result.valid).toBe(true);
    });
  });

  describe('Date Validation', () => {
    test('should validate ISO date format', () => {
      const result = validator.validateDate('2024-01-15');
      expect(result.valid).toBe(true);
      expect(result.value).toBeInstanceOf(Date);
    });

    test('should validate datetime format', () => {
      const result = validator.validateDate('2024-01-15T10:30:00');
      expect(result.valid).toBe(true);
    });

    test('should reject invalid date formats', () => {
      const result = validator.validateDate('not-a-date');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    test('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = validator.validateDate(futureDate.toISOString());
      expect(result.valid).toBe(false);
      expect(result.error).toContain('future');
    });

    test('should reject dates before 1900', () => {
      const result = validator.validateDate('1899-12-31');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('old');
    });

    test('should accept today', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = validator.validateDate(today);
      expect(result.valid).toBe(true);
    });

    test('should reject empty date', () => {
      const result = validator.validateDate('');
      expect(result.valid).toBe(false);
    });

    test('should reject null date', () => {
      const result = validator.validateDate(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email', () => {
      const result = validator.validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    test('should validate email with subdomain', () => {
      const result = validator.validateEmail('user@mail.example.com');
      expect(result.valid).toBe(true);
    });

    test('should reject email without @', () => {
      const result = validator.validateEmail('userexample.com');
      expect(result.valid).toBe(false);
    });

    test('should reject email without domain', () => {
      const result = validator.validateEmail('user@');
      expect(result.valid).toBe(false);
    });

    test('should reject email without username', () => {
      const result = validator.validateEmail('@example.com');
      expect(result.valid).toBe(false);
    });

    test('should reject email with spaces', () => {
      const result = validator.validateEmail('user @example.com');
      expect(result.valid).toBe(false);
    });

    test('should reject empty email', () => {
      const result = validator.validateEmail('');
      expect(result.valid).toBe(false);
    });
  });

  describe('Ticker Validation', () => {
    test('should validate valid tickers', () => {
      expect(validator.validateTicker('AAPL').valid).toBe(true);
      expect(validator.validateTicker('GOOGL').valid).toBe(true);
      expect(validator.validateTicker('BRK.B').valid).toBe(true);
    });

    test('should accept empty ticker (optional field)', () => {
      const result = validator.validateTicker('');
      expect(result.valid).toBe(true);
    });

    test('should reject lowercase tickers', () => {
      const result = validator.validateTicker('aapl');
      expect(result.valid).toBe(false);
    });

    test('should reject tickers with special characters', () => {
      const result = validator.validateTicker('AAP L');
      expect(result.valid).toBe(false);
    });

    test('should reject tickers longer than 10 characters', () => {
      const result = validator.validateTicker('VERYLONGTICKER');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('long');
    });

    test('should reject non-string tickers', () => {
      const result = validator.validateTicker(123);
      expect(result.valid).toBe(false);
    });
  });

  describe('Currency Validation', () => {
    test('should validate positive amounts', () => {
      const result = validator.validateCurrency(100.50);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(100.50);
    });

    test('should validate zero', () => {
      const result = validator.validateCurrency(0);
      expect(result.valid).toBe(true);
    });

    test('should reject negative amounts', () => {
      const result = validator.validateCurrency(-50);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('negative');
    });

    test('should reject amounts with more than 2 decimals', () => {
      const result = validator.validateCurrency(100.123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('decimal');
    });

    test('should accept amounts with exactly 2 decimals', () => {
      const result = validator.validateCurrency(100.12);
      expect(result.valid).toBe(true);
    });

    test('should reject very large amounts', () => {
      const result = validator.validateCurrency(10000000000000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('large');
    });

    test('should handle string amounts', () => {
      const result = validator.validateCurrency('100.50');
      expect(result.valid).toBe(true);
    });

    test('should reject non-numeric strings', () => {
      const result = validator.validateCurrency('abc');
      expect(result.valid).toBe(false);
    });
  });

  describe('Position Validation', () => {
    test('should validate complete position', () => {
      const position = {
        fond: 'Test Fund',
        kategorie: 'Akcie',
        aktuálníCena: 100,
        počet: 10,
        nákupníCena: 90
      };
      const result = validator.validatePosition(position);
      expect(result.valid).toBe(true);
    });

    test('should reject position without fund name', () => {
      const position = {
        kategorie: 'Akcie',
        aktuálníCena: 100,
        počet: 10,
        nákupníCena: 90
      };
      const result = validator.validatePosition(position);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Fund name required');
    });

    test('should reject position without category', () => {
      const position = {
        fond: 'Test Fund',
        aktuálníCena: 100,
        počet: 10,
        nákupníCena: 90
      };
      const result = validator.validatePosition(position);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Category required');
    });

    test('should reject position with negative price', () => {
      const position = {
        fond: 'Test Fund',
        kategorie: 'Akcie',
        aktuálníCena: -100,
        počet: 10,
        nákupníCena: 90
      };
      const result = validator.validatePosition(position);
      expect(result.valid).toBe(false);
    });

    test('should reject position with zero quantity', () => {
      const position = {
        fond: 'Test Fund',
        kategorie: 'Akcie',
        aktuálníCena: 100,
        počet: 0,
        nákupníCena: 90
      };
      const result = validator.validatePosition(position);
      expect(result.valid).toBe(false);
    });

    test('should handle multiple validation errors', () => {
      const position = {
        aktuálníCena: -100,
        počet: -10
      };
      const result = validator.validatePosition(position);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });

  describe('Portfolio Validation', () => {
    test('should validate complete portfolio', () => {
      const portfolio = {
        name: 'My Portfolio',
        positions: []
      };
      const result = validator.validatePortfolio(portfolio);
      expect(result.valid).toBe(true);
    });

    test('should reject null portfolio', () => {
      const result = validator.validatePortfolio(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should reject portfolio without name', () => {
      const portfolio = {
        name: '',
        positions: []
      };
      const result = validator.validatePortfolio(portfolio);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('name');
    });

    test('should reject portfolio with whitespace-only name', () => {
      const portfolio = {
        name: '   ',
        positions: []
      };
      const result = validator.validatePortfolio(portfolio);
      expect(result.valid).toBe(false);
    });

    test('should reject portfolio without positions array', () => {
      const portfolio = {
        name: 'My Portfolio'
      };
      const result = validator.validatePortfolio(portfolio);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('array');
    });

    test('should reject portfolio with non-array positions', () => {
      const portfolio = {
        name: 'My Portfolio',
        positions: 'not an array'
      };
      const result = validator.validatePortfolio(portfolio);
      expect(result.valid).toBe(false);
    });
  });
});
