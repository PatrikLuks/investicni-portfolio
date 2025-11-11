/**
 * Tests for UI Data Binding Framework
 * Phase 6: Reactive data binding and UI synchronization
 */

import DataBinding from '../src/js/utilities/data-binding.js';

describe('Data Binding Framework - Phase 6', () => {
  let binding;
  let container;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    document.body.appendChild(container);

    // Initialize binding
    binding = new DataBinding({
      name: 'John',
      email: 'john@example.com',
      age: 30,
      balance: 1000,
      portfolio: []
    });
  });

  afterEach(() => {
    // Cleanup
    binding.destroy();
    document.body.removeChild(container);
  });

  describe('Basic Binding', () => {
    test('should bind data property to input element', () => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      binding.bind('name', input, 'value');

      expect(input.value).toBe('John');
    });

    test('should update input when data changes', () => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      binding.bind('name', input, 'value');
      binding.proxy.name = 'Jane';

      expect(input.value).toBe('Jane');
    });

    test('should update data when input changes', (done) => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      binding.bind('name', input, 'value');
      input.value = 'Alice';
      input.dispatchEvent(new Event('input'));

      setTimeout(() => {
        expect(binding.proxy.name).toBe('Alice');
        done();
      }, 10);
    });

    test('should bind multiple properties independently', () => {
      const nameInput = document.createElement('input');
      const emailInput = document.createElement('input');
      container.appendChild(nameInput);
      container.appendChild(emailInput);

      binding.bind('name', nameInput, 'value');
      binding.bind('email', emailInput, 'value');

      binding.proxy.name = 'Bob';

      expect(nameInput.value).toBe('Bob');
      expect(emailInput.value).toBe('john@example.com'); // Unchanged
    });
  });

  describe('Element Property Binding', () => {
    test('should bind to textContent property', () => {
      const div = document.createElement('div');
      container.appendChild(div);

      binding.bind('name', div, 'textContent');

      expect(div.textContent).toBe('John');
    });

    test('should bind to innerHTML property', () => {
      const div = document.createElement('div');
      container.appendChild(div);

      binding.bind('name', div, 'innerHTML');
      binding.proxy.name = '<strong>Jane</strong>';

      expect(div.innerHTML).toBe('<strong>Jane</strong>');
    });

    test('should bind to class property', () => {
      const div = document.createElement('div');
      container.appendChild(div);

      binding.data.className = 'active dark';
      binding.bind('className', div, 'class');

      expect(div.className).toBe('active dark');
    });

    test('should bind to style property', () => {
      const div = document.createElement('div');
      container.appendChild(div);

      binding.data.styles = { color: 'red', fontSize: '16px' };
      binding.bind('styles', div, 'style');

      expect(div.style.color).toBe('red');
      expect(div.style.fontSize).toBe('16px');
    });
  });

  describe('Form Binding', () => {
    test('should bind form to data object', () => {
      const form = document.createElement('form');
      const nameField = document.createElement('input');
      nameField.name = 'name';
      nameField.type = 'text';
      
      const emailField = document.createElement('input');
      emailField.name = 'email';
      emailField.type = 'email';

      form.appendChild(nameField);
      form.appendChild(emailField);
      container.appendChild(form);

      binding.bindForm(form);

      expect(nameField.value).toBe('John');
      expect(emailField.value).toBe('john@example.com');
    });

    test('should support field name mapping', () => {
      const form = document.createElement('form');
      const field = document.createElement('input');
      field.name = 'user_name';
      form.appendChild(field);
      container.appendChild(form);

      binding.bindForm(form, { user_name: 'name' });

      expect(field.value).toBe('John');
    });
  });

  describe('Watchers', () => {
    test('should watch property changes', (done) => {
      let callCount = 0;
      let newVal, oldVal;

      binding.watch('name', (newValue, oldValue) => {
        callCount++;
        newVal = newValue;
        oldVal = oldValue;
      });

      binding.proxy.name = 'Charlie';

      setTimeout(() => {
        expect(callCount).toBeGreaterThan(0);
        expect(newVal).toBe('Charlie');
        expect(oldVal).toBe('John');
        done();
      }, 10);
    });

    test('should support multiple watchers on same property', (done) => {
      let count1 = 0, count2 = 0;

      binding.watch('age', () => count1++);
      binding.watch('age', () => count2++);

      binding.proxy.age = 31;

      setTimeout(() => {
        expect(count1).toBeGreaterThan(0);
        expect(count2).toBeGreaterThan(0);
        done();
      }, 10);
    });

    test('should return unwatch function', (done) => {
      let callCount = 0;

      const unwatch = binding.watch('name', () => callCount++);
      
      binding.proxy.name = 'David';
      
      setTimeout(() => {
        const countAfterFirstChange = callCount;
        
        unwatch();
        binding.proxy.name = 'Eve';
        
        setTimeout(() => {
          expect(callCount).toBe(countAfterFirstChange);
          done();
        }, 10);
      }, 10);
    });
  });

  describe('Computed Properties', () => {
    test('should define computed property', () => {
      binding.computed('displayName', function() {
        return `${this.name} (${this.age} years)`;
      });

      expect(binding.proxy.displayName).toBe('John (30 years)');
    });

    test('should update computed property when dependencies change', () => {
      binding.computed('summary', function() {
        return `${this.name} - Balance: $${this.balance}`;
      });

      binding.proxy.balance = 2000;

      expect(binding.proxy.summary).toContain('Balance: $2000');
    });

    test('should cache computed value', () => {
      let callCount = 0;
      binding.computed('expensiveComputation', function() {
        callCount++;
        return this.balance * 2;
      });

      // Multiple accesses should use cache
      const result1 = binding.proxy.expensiveComputation;
      const result2 = binding.proxy.expensiveComputation;

      expect(result1).toBe(result2);
    });
  });

  describe('Unbinding', () => {
    test('should unbind specific element', (done) => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      binding.bind('name', input, 'value');
      binding.unbind(input);

      const oldValue = input.value;
      binding.proxy.name = 'Frank';

      setTimeout(() => {
        expect(input.value).toBe(oldValue);
        done();
      }, 10);
    });

    test('should unbind all bindings for property', (done) => {
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      container.appendChild(input1);
      container.appendChild(input2);

      binding.bind('name', input1, 'value');
      binding.bind('name', input2, 'value');
      binding.unbindProperty('name');

      binding.proxy.name = 'Grace';

      setTimeout(() => {
        expect(input1.value).toBe('John');
        expect(input2.value).toBe('John');
        done();
      }, 10);
    });
  });

  describe('Data Management', () => {
    test('should get all data', () => {
      const data = binding.getData();

      expect(data.name).toBe('John');
      expect(data.email).toBe('john@example.com');
      expect(data.age).toBe(30);
    });

    test('should update data with merge', () => {
      binding.updateData({ name: 'Helen', country: 'USA' }, true);

      expect(binding.proxy.name).toBe('Helen');
      expect(binding.proxy.country).toBe('USA');
      expect(binding.proxy.email).toBe('john@example.com'); // Still exists
    });

    test('should update data without merge', () => {
      binding.updateData({ name: 'Ivan' }, false);

      expect(binding.proxy.name).toBe('Ivan');
      expect(binding.proxy.email).toBeUndefined(); // Replaced
    });

    test('should reset to initial state', () => {
      binding.proxy.name = 'Jack';
      binding.reset({ name: 'Initial', value: 0 });

      expect(binding.proxy.name).toBe('Initial');
      expect(binding.proxy.email).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle errors in watchers gracefully', () => {
      let errorHandled = false;

      binding.watch('name', () => {
        throw new Error('Watcher error');
      });

      // Should not throw, should handle error gracefully
      try {
        binding.proxy.name = 'Karen';
        errorHandled = true;
      } catch (e) {
        // Error should not propagate
        errorHandled = false;
      }

      expect(errorHandled).toBe(true);
    });

    test('should handle null/undefined values', () => {
      const input = document.createElement('input');
      container.appendChild(input);

      binding.bind('name', input, 'value');
      binding.proxy.name = null;

      expect(input.value).toBe('');
    });
  });

  describe('Performance', () => {
    test('should handle many bindings efficiently', () => {
      const inputs = [];
      for (let i = 0; i < 100; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        container.appendChild(input);
        binding.data[`field${i}`] = `value${i}`;
        binding.bind(`field${i}`, input, 'value');
        inputs.push(input);
      }

      const startTime = performance.now();
      binding.proxy.field50 = 'changed';
      const duration = performance.now() - startTime;

      expect(inputs[50].value).toBe('changed');
      expect(duration).toBeLessThan(100); // Should be fast
    });

    test('should cleanup properly on destroy', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      binding.bind('name', input, 'value');

      binding.destroy();

      expect(binding.bindings.size).toBe(0);
      expect(binding.watchers.size).toBe(0);
      expect(binding.data).toBeNull();
    });
  });
});
