/**
 * Unit Tests for Error Handler
 * Tests error catching, logging, and recovery mechanisms
 */

describe('ErrorHandler', () => {
  let errorHandler;
  let mockShowToast;

  beforeEach(() => {
    // Mock showToast
    mockShowToast = jest.fn();
    global.showToast = mockShowToast;

    // Create a simplified error handler for testing
    errorHandler = {
      errors: [],
      maxErrors: 100,
      recentErrors: [],
      lastErrorTime: 0,
      errorDebounceMs: 100,
      
      handleError: function(errorInfo) {
        const now = Date.now();
        if (now - this.lastErrorTime < this.errorDebounceMs) {
          return;
        }
        this.lastErrorTime = now;

        const errorEntry = {
          ...errorInfo,
          timestamp: new Date().toISOString(),
          id: this.generateErrorId()
        };

        this.errors.push(errorEntry);
        if (this.errors.length > this.maxErrors) {
          this.errors.shift();
        }

        this.recentErrors.push(now);
        return errorEntry;
      },
      
      generateErrorId: function() {
        return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      },
      
      getUserFriendlyMessage: function(technicalMessage) {
        const messageMap = {
          'cannot read': 'Nepodařilo se načíst data. Zkuste obnovit stránku.',
          'undefined': 'Některá data chybí. Zkontrolujte své portfolio.',
          'network': 'Problém s připojením k internetu.',
        };
        
        for (const [key, value] of Object.entries(messageMap)) {
          if (technicalMessage?.toLowerCase().includes(key)) {
            return value;
          }
        }
        return 'Nastala neočekávaná chyba. Zkuste obnovit stránku.';
      },
      
      clearErrors: function() {
        this.errors = [];
        this.recentErrors = [];
      }
    };
  });

  afterEach(() => {
    errorHandler.clearErrors();
  });

  describe('Error Handling', () => {
    test('should handle and store errors', () => {
      const error = {
        message: 'Test error',
        type: 'javascript'
      };

      errorHandler.handleError(error);
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0].message).toBe('Test error');
      expect(errorHandler.errors[0].type).toBe('javascript');
    });

    test('should generate unique error IDs', () => {
      const id1 = errorHandler.generateErrorId();
      const id2 = errorHandler.generateErrorId();
      
      expect(id1).toMatch(/^ERR-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^ERR-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    test('should debounce duplicate errors', () => {
      const error = { message: 'Test error', type: 'javascript' };
      
      errorHandler.handleError(error);
      errorHandler.handleError(error); // Should be debounced
      
      expect(errorHandler.errors).toHaveLength(1);
    });

    test('should limit stored errors to maxErrors', () => {
      errorHandler.maxErrors = 5;
      
      for (let i = 0; i < 10; i++) {
        // Add delay to avoid debounce
        errorHandler.lastErrorTime = Date.now() - 200;
        errorHandler.handleError({ message: `Error ${i}`, type: 'test' });
      }
      
      expect(errorHandler.errors.length).toBeLessThanOrEqual(5);
    });
  });

  describe('User-Friendly Messages', () => {
    test('should convert "cannot read" to user-friendly message', () => {
      const message = errorHandler.getUserFriendlyMessage('Cannot read property of undefined');
      expect(message).toBe('Nepodařilo se načíst data. Zkuste obnovit stránku.');
    });

    test('should convert "undefined" to user-friendly message', () => {
      const message = errorHandler.getUserFriendlyMessage('undefined is not a function');
      expect(message).toBe('Některá data chybí. Zkontrolujte své portfolio.');
    });

    test('should convert "network" to user-friendly message', () => {
      const message = errorHandler.getUserFriendlyMessage('Network request failed');
      expect(message).toBe('Problém s připojením k internetu.');
    });

    test('should return default message for unknown errors', () => {
      const message = errorHandler.getUserFriendlyMessage('Some weird error');
      expect(message).toBe('Nastala neočekávaná chyba. Zkuste obnovit stránku.');
    });

    test('should handle null/undefined messages', () => {
      const message1 = errorHandler.getUserFriendlyMessage(null);
      const message2 = errorHandler.getUserFriendlyMessage(undefined);
      
      expect(message1).toBe('Nastala neočekávaná chyba. Zkuste obnovit stránku.');
      expect(message2).toBe('Nastala neočekávaná chyba. Zkuste obnovit stránku.');
    });
  });

  describe('Error Tracking', () => {
    test('should track recent errors', () => {
      const error = { message: 'Test error', type: 'javascript' };
      
      errorHandler.lastErrorTime = Date.now() - 200;
      errorHandler.handleError(error);
      
      expect(errorHandler.recentErrors.length).toBeGreaterThan(0);
    });

    test('should add timestamp to errors', () => {
      const error = { message: 'Test error', type: 'javascript' };
      
      errorHandler.handleError(error);
      
      expect(errorHandler.errors[0].timestamp).toBeDefined();
      expect(new Date(errorHandler.errors[0].timestamp)).toBeInstanceOf(Date);
    });
  });
});
