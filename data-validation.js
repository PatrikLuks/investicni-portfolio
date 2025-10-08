/**
 * Data Validation Layer
 * Features: Schema validation, real-time field validation, custom rules, error messages
 */

class DataValidationManager {
  constructor() {
    this.schema = this.defineSchema();
    this.customRules = new Map();
    this.validationErrors = new Map();
    this.realTimeValidation = true;
    this.strictMode = false;

    this.init();
  }

  /**
   * Initialize validation manager
   */
  init() {
    this.setupRealTimeValidation();
    console.log('✅ Data Validation Manager initialized');
  }

  /**
   * Define portfolio data schema
   * @returns {Object} - Schema definition
   */
  defineSchema() {
    return {
      fond: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 200,
        pattern: /^[a-zA-Z0-9\s\-\_\(\)\.]+$/,
        messages: {
          required: 'Název fondu je povinný',
          minLength: 'Název fondu nesmí být prázdný',
          maxLength: 'Název fondu je příliš dlouhý (max 200 znaků)',
          pattern: 'Název fondu obsahuje nepovolené znaky',
        },
      },
      kategorie: {
        type: 'string',
        required: true,
        enum: ['Akcie', 'Dluhopisy', 'Komodity', 'Nemovitosti', 'Hotovost', 'Jiné'],
        messages: {
          required: 'Kategorie je povinná',
          enum: 'Neplatná kategorie',
        },
      },
      ticker: {
        type: 'string',
        required: false,
        minLength: 1,
        maxLength: 20,
        pattern: /^[A-Z0-9\.\-]+$/,
        messages: {
          maxLength: 'Ticker je příliš dlouhý (max 20 znaků)',
          pattern: 'Ticker musí obsahovat pouze velká písmena, čísla, tečky a pomlčky',
        },
      },
      aktuálníCena: {
        type: 'number',
        required: true,
        min: 0,
        max: 1000000000,
        precision: 2,
        messages: {
          required: 'Aktuální cena je povinná',
          type: 'Cena musí být číslo',
          min: 'Cena nesmí být záporná',
          max: 'Cena je příliš vysoká',
        },
      },
      počet: {
        type: 'number',
        required: true,
        min: 0.000001,
        max: 1000000000,
        messages: {
          required: 'Počet je povinný',
          type: 'Počet musí být číslo',
          min: 'Počet musí být kladný',
          max: 'Počet je příliš vysoký',
        },
      },
      nákupníCena: {
        type: 'number',
        required: true,
        min: 0,
        max: 1000000000,
        precision: 2,
        messages: {
          required: 'Nákupní cena je povinná',
          type: 'Cena musí být číslo',
          min: 'Cena nesmí být záporná',
          max: 'Cena je příliš vysoká',
        },
      },
      aktuálníHodnota: {
        type: 'number',
        required: true,
        min: 0,
        computed: true,
        messages: {
          required: 'Aktuální hodnota je povinná',
          type: 'Hodnota musí být číslo',
          min: 'Hodnota nesmí být záporná',
        },
      },
      změnaProcenta: {
        type: 'number',
        required: true,
        min: -100,
        max: 100000,
        precision: 2,
        computed: true,
        messages: {
          type: 'Změna musí být číslo',
          min: 'Změna je příliš nízká',
          max: 'Změna je příliš vysoká',
        },
      },
      měna: {
        type: 'string',
        required: true,
        enum: ['CZK', 'EUR', 'USD', 'GBP'],
        default: 'CZK',
        messages: {
          required: 'Měna je povinná',
          enum: 'Neplatná měna',
        },
      },
      datumNákupu: {
        type: 'date',
        required: false,
        maxDate: 'today',
        messages: {
          type: 'Neplatné datum',
          maxDate: 'Datum nákupu nemůže být v budoucnosti',
        },
      },
      poznámka: {
        type: 'string',
        required: false,
        maxLength: 500,
        messages: {
          maxLength: 'Poznámka je příliš dlouhá (max 500 znaků)',
        },
      },
      správce: {
        type: 'string',
        required: false,
        maxLength: 100,
        messages: {
          maxLength: 'Název správce je příliš dlouhý (max 100 znaků)',
        },
      },
    };
  }

  /**
   * Validate single field
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   * @param {Object} context - Full record for cross-field validation
   * @returns {Object} - Validation result
   */
  validateField(fieldName, value, context = {}) {
    const fieldSchema = this.schema[fieldName];
    if (!fieldSchema) {
      return { valid: true, errors: [] };
    }

    const errors = [];

    // Required validation
    if (fieldSchema.required && (value === null || value === undefined || value === '')) {
      errors.push(fieldSchema.messages.required || `${fieldName} je povinné pole`);
      return { valid: false, errors };
    }

    // Skip further validation if not required and empty
    if (!fieldSchema.required && (value === null || value === undefined || value === '')) {
      return { valid: true, errors: [] };
    }

    // Type validation
    const actualType = this.getType(value);
    if (fieldSchema.type !== actualType) {
      errors.push(fieldSchema.messages.type || `${fieldName} musí být typu ${fieldSchema.type}`);
      return { valid: false, errors };
    }

    // String validations
    if (fieldSchema.type === 'string') {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        errors.push(
          fieldSchema.messages.minLength || `Minimální délka je ${fieldSchema.minLength}`,
        );
      }
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        errors.push(
          fieldSchema.messages.maxLength || `Maximální délka je ${fieldSchema.maxLength}`,
        );
      }
      if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
        errors.push(fieldSchema.messages.pattern || 'Neplatný formát');
      }
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        errors.push(
          fieldSchema.messages.enum || `Povolené hodnoty: ${fieldSchema.enum.join(', ')}`,
        );
      }
    }

    // Number validations
    if (fieldSchema.type === 'number') {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        errors.push(fieldSchema.messages.type || 'Musí být číslo');
        return { valid: false, errors };
      }

      if (fieldSchema.min !== undefined && numValue < fieldSchema.min) {
        errors.push(fieldSchema.messages.min || `Minimální hodnota je ${fieldSchema.min}`);
      }
      if (fieldSchema.max !== undefined && numValue > fieldSchema.max) {
        errors.push(fieldSchema.messages.max || `Maximální hodnota je ${fieldSchema.max}`);
      }
      if (fieldSchema.precision !== undefined) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        if (decimalPlaces > fieldSchema.precision) {
          errors.push(`Maximální počet desetinných míst je ${fieldSchema.precision}`);
        }
      }
    }

    // Date validations
    if (fieldSchema.type === 'date') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(fieldSchema.messages.type || 'Neplatné datum');
        return { valid: false, errors };
      }

      if (fieldSchema.maxDate === 'today' && date > new Date()) {
        errors.push(fieldSchema.messages.maxDate || 'Datum nemůže být v budoucnosti');
      }
    }

    // Custom rules
    if (this.customRules.has(fieldName)) {
      const customRule = this.customRules.get(fieldName);
      const customResult = customRule(value, context);
      if (!customResult.valid) {
        errors.push(...customResult.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate entire record
   * @param {Object} record - Record to validate
   * @returns {Object} - Validation result
   */
  validateRecord(record) {
    const errors = {};
    let isValid = true;

    // Validate each field
    for (const [fieldName, fieldSchema] of Object.entries(this.schema)) {
      const value = record[fieldName];
      const result = this.validateField(fieldName, value, record);

      if (!result.valid) {
        errors[fieldName] = result.errors;
        isValid = false;
      }
    }

    // Cross-field validations
    const crossFieldErrors = this.validateCrossFields(record);
    if (crossFieldErrors.length > 0) {
      errors._crossField = crossFieldErrors;
      isValid = false;
    }

    return {
      valid: isValid,
      errors,
      record,
    };
  }

  /**
   * Cross-field validations
   * @param {Object} record - Record to validate
   * @returns {Array} - Validation errors
   */
  validateCrossFields(record) {
    const errors = [];

    // Aktuální hodnota = cena * počet
    if (record.aktuálníCena && record.počet && record.aktuálníHodnota) {
      const computed = record.aktuálníCena * record.počet;
      const actual = parseFloat(record.aktuálníHodnota);

      // Allow 1% tolerance for rounding
      if (Math.abs(computed - actual) > computed * 0.01) {
        errors.push('Aktuální hodnota neodpovídá výpočtu (cena × počet)');
      }
    }

    // Změna procenta calculation
    if (record.nákupníCena && record.aktuálníCena && record.změnaProcenta !== undefined) {
      const computed = ((record.aktuálníCena - record.nákupníCena) / record.nákupníCena) * 100;
      const actual = parseFloat(record.změnaProcenta);

      // Allow 0.1% tolerance
      if (Math.abs(computed - actual) > 0.1) {
        errors.push('Změna procent neodpovídá výpočtu');
      }
    }

    return errors;
  }

  /**
   * Validate array of records
   * @param {Array} records - Records to validate
   * @returns {Object} - Validation result
   */
  validateAll(records) {
    const results = records.map((record, index) => ({
      index,
      ...this.validateRecord(record),
    }));

    const allValid = results.every((r) => r.valid);
    const errorCount = results.filter((r) => !r.valid).length;

    return {
      valid: allValid,
      errorCount,
      results,
    };
  }

  /**
   * Add custom validation rule
   * @param {string} fieldName - Field name
   * @param {Function} rule - Validation function
   */
  addCustomRule(fieldName, rule) {
    this.customRules.set(fieldName, rule);
    console.log(`✅ Custom rule added for field: ${fieldName}`);
  }

  /**
   * Remove custom validation rule
   * @param {string} fieldName - Field name
   */
  removeCustomRule(fieldName) {
    this.customRules.delete(fieldName);
  }

  /**
   * Get type of value
   * @param {any} value - Value to check
   * @returns {string} - Type name
   */
  getType(value) {
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }
    if (typeof value === 'number' && !isNaN(value)) {
      return 'number';
    }
    if (typeof value === 'string') {
      // Check if it's a date string
      const date = new Date(value);
      if (!isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return 'date';
      }
      return 'string';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    if (typeof value === 'object') {
      return 'object';
    }
    return typeof value;
  }

  /**
   * Setup real-time validation on form inputs
   */
  setupRealTimeValidation() {
    if (!this.realTimeValidation) {
      return;
    }

    document.addEventListener('input', (e) => {
      const input = e.target;
      if (!input.dataset.fieldName) {
        return;
      }

      const { fieldName } = input.dataset;
      let { value } = input;

      // Convert value based on field type
      const fieldSchema = this.schema[fieldName];
      if (fieldSchema) {
        if (fieldSchema.type === 'number') {
          value = value === '' ? null : parseFloat(value);
        }
      }

      const result = this.validateField(fieldName, value);
      this.displayFieldValidation(input, result);
    });

    console.log('✅ Real-time validation enabled');
  }

  /**
   * Display validation result on field
   * @param {HTMLElement} input - Input element
   * @param {Object} result - Validation result
   */
  displayFieldValidation(input, result) {
    // Remove existing validation messages
    const existingError = input.parentElement.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }

    input.classList.remove('valid', 'invalid');

    if (!result.valid) {
      input.classList.add('invalid');

      // Create error message
      const errorEl = document.createElement('div');
      errorEl.className = 'validation-error';
      errorEl.textContent = result.errors[0]; // Show first error
      input.parentElement.appendChild(errorEl);
    } else {
      input.classList.add('valid');
    }
  }

  /**
   * Sanitize input value
   * @param {string} fieldName - Field name
   * @param {any} value - Value to sanitize
   * @returns {any} - Sanitized value
   */
  sanitize(fieldName, value) {
    const fieldSchema = this.schema[fieldName];
    if (!fieldSchema) {
      return value;
    }

    // String sanitization
    if (fieldSchema.type === 'string' && typeof value === 'string') {
      // Trim whitespace
      value = value.trim();

      // Remove control characters
      value = value.replace(/[\x00-\x1F\x7F]/g, '');

      // XSS protection - escape HTML
      value = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Number sanitization
    if (fieldSchema.type === 'number') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        // Apply precision
        if (fieldSchema.precision !== undefined) {
          value = parseFloat(num.toFixed(fieldSchema.precision));
        }
        // Clamp to min/max
        if (fieldSchema.min !== undefined) {
          value = Math.max(value, fieldSchema.min);
        }
        if (fieldSchema.max !== undefined) {
          value = Math.min(value, fieldSchema.max);
        }
      }
    }

    return value;
  }

  /**
   * Sanitize entire record
   * @param {Object} record - Record to sanitize
   * @returns {Object} - Sanitized record
   */
  sanitizeRecord(record) {
    const sanitized = {};

    for (const [fieldName, value] of Object.entries(record)) {
      sanitized[fieldName] = this.sanitize(fieldName, value);
    }

    return sanitized;
  }

  /**
   * Get validation summary
   * @param {Array} records - Records to validate
   * @returns {Object} - Summary
   */
  getValidationSummary(records) {
    const result = this.validateAll(records);

    return {
      totalRecords: records.length,
      validRecords: records.length - result.errorCount,
      invalidRecords: result.errorCount,
      isValid: result.valid,
      errors: result.results.filter((r) => !r.valid),
    };
  }

  /**
   * Enable strict mode (fail on warnings)
   */
  enableStrictMode() {
    this.strictMode = true;
    console.log('✅ Strict validation mode enabled');
  }

  /**
   * Disable strict mode
   */
  disableStrictMode() {
    this.strictMode = false;
    console.log('❌ Strict validation mode disabled');
  }
}

// Global instance
window.dataValidationManager = new DataValidationManager();

// Example custom rule
window.dataValidationManager.addCustomRule('ticker', (value, context) => {
  // Example: Check if ticker is unique
  const errors = [];

  // This would need access to all records to check uniqueness
  // For now, just validate format

  return {
    valid: errors.length === 0,
    errors,
  };
});

console.log('✅ Data Validation Manager ready');
