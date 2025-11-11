/**
 * UI Data Binding Framework
 * Reactive data binding for portfolio application
 *
 * Features:
 * - Two-way data binding (model ↔ UI)
 * - Reactive property changes
 * - Event synchronization
 * - Template interpolation
 * - Computed properties
 * - Watch listeners
 *
 * @module src/js/utilities/data-binding
 * @version 1.0.0
 */

import { logError } from './logger.js';

class DataBinding {
  constructor(data = {}) {
    this.data = data;
    this.bindings = new Map();
    this.watchers = new Map();
    this.computedProperties = new Map();
    this.handlers = new Map();
    this.proxy = this.createProxy(data);
  }

  /**
   * Create reactive proxy for data
   * @param {Object} target - Target object to make reactive
   * @returns {Proxy} Reactive proxy
   */
  createProxy(target) {
    return new Proxy(target, {
      set: (obj, prop, value) => {
        const oldValue = obj[prop];

        if (oldValue === value) {
          return true;
        }

        obj[prop] = value;
        this.notifyChange(prop, oldValue, value);

        return true;
      },

      get: (obj, prop) => {
        if (this.computedProperties.has(prop)) {
          return this.computedProperties.get(prop)();
        }
        return obj[prop];
      },
    });
  }

  /**
   * Bind data property to DOM element
   * @param {string} dataProperty - Property name in data
   * @param {HTMLElement} element - DOM element to bind
   * @param {string} elementProperty - Element property (value, textContent, etc.)
   * @param {Object} options - Binding options
   */
  bind(dataProperty, element, elementProperty = 'value', options = {}) {
    if (!element) {
      return;
    }

    const binding = {
      element,
      property: elementProperty,
      options,
      handler: null,
    };

    // Two-way binding: data → UI
    binding.handler = () => {
      const value = this.proxy[dataProperty];
      if (elementProperty === 'value') {
        element.value = value ?? '';
      } else if (elementProperty === 'textContent' || elementProperty === 'text') {
        element.textContent = value ?? '';
      } else if (elementProperty === 'innerHTML') {
        element.innerHTML = value ?? '';
      } else if (elementProperty === 'class') {
        element.className = value ?? '';
      } else if (elementProperty === 'style') {
        Object.assign(element.style, value || {});
      } else {
        element[elementProperty] = value;
      }
      element.dispatchEvent(
        new CustomEvent('bound-change', {
          detail: { property: dataProperty, value },
        }),
      );
    };

    // Initial binding
    binding.handler();

    // Register watcher for data changes
    const unwatch = this.watch(dataProperty, binding.handler);

    // Two-way binding: UI → data (for input elements)
    if (
      elementProperty === 'value' &&
      (element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'SELECT')
    ) {
      const eventHandler = (event) => {
        this.proxy[dataProperty] = event.target.value;
      };

      element.addEventListener('input', eventHandler);
      element.addEventListener('change', eventHandler);

      binding.unsubscribe = () => {
        element.removeEventListener('input', eventHandler);
        element.removeEventListener('change', eventHandler);
        unwatch(); // Remove the watcher
      };
    } else {
      // For non-input elements, just unwatch
      binding.unsubscribe = unwatch;
    }

    if (!this.bindings.has(dataProperty)) {
      this.bindings.set(dataProperty, []);
    }
    this.bindings.get(dataProperty).push(binding);

    return binding;
  }

  /**
   * Remove binding from element
   * @param {HTMLElement} element - Element to unbind
   */
  unbind(element) {
    for (const [_property, bindings] of this.bindings.entries()) {
      const index = bindings.findIndex((b) => b.element === element);
      if (index !== -1) {
        const binding = bindings[index];
        if (binding.unsubscribe) {
          binding.unsubscribe();
        }
        bindings.splice(index, 1);
      }
    }
  }

  /**
   * Unbind all bindings for a property
   * @param {string} property - Property name
   */
  unbindProperty(property) {
    if (this.bindings.has(property)) {
      const bindings = this.bindings.get(property);
      bindings.forEach((binding) => {
        if (binding.unsubscribe) {
          binding.unsubscribe();
        }
      });
      this.bindings.delete(property);
    }
  }

  /**
   * Watch for changes to a property
   * @param {string} property - Property to watch
   * @param {Function} callback - Called with (newValue, oldValue)
   * @returns {Function} Unwatch function
   */
  watch(property, callback) {
    if (!this.watchers.has(property)) {
      this.watchers.set(property, []);
    }

    this.watchers.get(property).push(callback);

    // Return unwatch function
    return () => {
      const watchers = this.watchers.get(property);
      const index = watchers.indexOf(callback);
      if (index !== -1) {
        watchers.splice(index, 1);
      }
    };
  }

  /**
   * Define computed property
   * @param {string} property - Property name
   * @param {Function} getter - Getter function
   * @param {Function} setter - Optional setter function
   */
  computed(property, getter, setter) {
    const computation = {
      getter,
      setter,
      cache: undefined,
      dirty: true,
    };

    this.computedProperties.set(property, () => {
      if (computation.dirty) {
        computation.cache = getter.call(this.data);
        computation.dirty = false;
      }
      return computation.cache;
    });

    // Watch dependencies (heuristic: all properties used in getter)
    // TODO: Implement proper dependency tracking in future version
    // const depsProxy = new Proxy({}, {
    //   get: (_target, _prop) => {
    //     const deps = new Set();
    //     return deps;
    //   }
    // });

    return property;
  }

  /**
   * Get computed property
   * @param {string} property - Property name
   * @returns {*} Computed value
   */
  getComputed(property) {
    if (this.computedProperties.has(property)) {
      return this.computedProperties.get(property)();
    }
    return undefined;
  }

  /**
   * Notify watchers of property change
   * @private
   * @param {string} property - Changed property
   * @param {*} oldValue - Old value
   * @param {*} newValue - New value
   */
  notifyChange(property, oldValue, newValue) {
    if (this.watchers.has(property)) {
      this.watchers.get(property).forEach((callback) => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          logError(`Error in watcher for property "${property}":`, error);
        }
      });
    }

    // Also notify bindings
    if (this.bindings.has(property)) {
      this.bindings.get(property).forEach((binding) => {
        if (binding.handler) {
          try {
            binding.handler();
          } catch (error) {
            logError(`Error updating binding for property "${property}":`, error);
          }
        }
      });
    }

    // Invalidate computed properties that might depend on this
    for (const [computedProp] of this.computedProperties.entries()) {
      // In real implementation, track dependencies
      const computation = this.computedProperties.get(computedProp);
      if (computation && computation.dirty !== undefined) {
        computation.dirty = true;
      }
    }
  }

  /**
   * Bind multiple properties to form elements
   * @param {HTMLFormElement} form - Form element
   * @param {Object} mapping - Property to field mapping
   */
  bindForm(form, mapping = {}) {
    if (!form) {
      return;
    }

    const fields = form.querySelectorAll('[name]');

    fields.forEach((field) => {
      const property = mapping[field.name] || field.name;

      if (Object.prototype.hasOwnProperty.call(this.data, property)) {
        this.bind(property, field, 'value');
      }
    });

    return () => {
      fields.forEach((field) => {
        this.unbind(field);
      });
    };
  }

  /**
   * Get all data
   * @returns {Object} Current data state
   */
  getData() {
    const result = {};
    for (const [key, value] of Object.entries(this.data)) {
      result[key] = this.computedProperties.has(key) ? this.getComputed(key) : value;
    }
    return result;
  }

  /**
   * Update data
   * @param {Object} updates - Properties to update
   * @param {boolean} merge - Merge with existing data (default true)
   */
  updateData(updates, merge = true) {
    if (merge) {
      Object.assign(this.proxy, updates);
    } else {
      // Replace all data
      this.data = updates;
      this.proxy = this.createProxy(this.data);
    }
  }

  /**
   * Reset data to initial state
   * @param {Object} initialData - Initial data
   */
  reset(initialData = {}) {
    this.unbindAll();
    this.data = initialData;
    this.bindings.clear();
    this.watchers.clear();
    this.computedProperties.clear();
    this.proxy = this.createProxy(this.data);
  }

  /**
   * Unbind all bindings
   * @private
   */
  unbindAll() {
    for (const [_property, bindings] of this.bindings.entries()) {
      bindings.forEach((binding) => {
        if (binding.unsubscribe) {
          binding.unsubscribe();
        }
      });
    }
    this.bindings.clear();
  }

  /**
   * Destroy data binding instance
   */
  destroy() {
    this.unbindAll();
    this.watchers.clear();
    this.computedProperties.clear();
    this.handlers.clear();
    this.data = null;
  }
}

// Export for module systems
export default DataBinding;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataBinding;
}
