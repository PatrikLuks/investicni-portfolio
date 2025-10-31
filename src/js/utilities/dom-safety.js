/**
 * @module dom-safety
 * Safe DOM manipulation utilities with null/undefined checks
 * Prevents crashes from missing DOM elements
 * 
 * Investment Portfolio Manager Pro v3.2.1
 */

/**
 * Safely get element by ID with null check
 * @param {string} id - Element ID
 * @param {string} context - Context for error logging
 * @returns {HTMLElement|null} Element or null if not found
 */
function safeGetElement(id, context = '') {
  try {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`DOM Safety: Element '${id}' not found${context ? ` in ${context}` : ''}`);
      return null;
    }
    return element;
  } catch (error) {
    console.error(`DOM Safety: Error getting element '${id}':`, error);
    return null;
  }
}

/**
 * Safely get element value with null check
 * @param {string} id - Element ID
 * @param {*} defaultValue - Default value if element not found
 * @returns {*} Element value or default value
 */
function safeGetValue(id, defaultValue = '') {
  const element = safeGetElement(id);
  if (!element) {
    return defaultValue;
  }
  return element.value || defaultValue;
}

/**
 * Safely set element textContent
 * @param {string} id - Element ID
 * @param {string} text - Text content
 * @returns {boolean} Success or failure
 */
function safeSetText(id, text) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    element.textContent = text;
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error setting text on '${id}':`, error);
    return false;
  }
}

/**
 * Safely set element innerHTML
 * @param {string} id - Element ID
 * @param {string} html - HTML content
 * @returns {boolean} Success or failure
 */
function safeSetHTML(id, html) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    element.innerHTML = html;
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error setting HTML on '${id}':`, error);
    return false;
  }
}

/**
 * Safely set element style property
 * @param {string} id - Element ID
 * @param {string} property - CSS property name (camelCase)
 * @param {string} value - CSS value
 * @returns {boolean} Success or failure
 */
function safeSetStyle(id, property, value) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    element.style[property] = value;
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error setting style on '${id}':`, error);
    return false;
  }
}

/**
 * Safely set element display
 * @param {string} id - Element ID
 * @param {string} display - Display value (block, none, flex, etc.)
 * @returns {boolean} Success or failure
 */
function safeSetDisplay(id, display = 'block') {
  return safeSetStyle(id, 'display', display);
}

/**
 * Safely hide element
 * @param {string} id - Element ID
 * @returns {boolean} Success or failure
 */
function safeHide(id) {
  return safeSetDisplay(id, 'none');
}

/**
 * Safely show element
 * @param {string} id - Element ID
 * @param {string} display - Display value (default: 'block')
 * @returns {boolean} Success or failure
 */
function safeShow(id, display = 'block') {
  return safeSetDisplay(id, display);
}

/**
 * Safely add event listener
 * @param {string} id - Element ID
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @returns {boolean} Success or failure
 */
function safeAddEventListener(id, event, handler) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    element.addEventListener(event, handler);
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error adding event listener to '${id}':`, error);
    return false;
  }
}

/**
 * Safely query selector
 * @param {string} selector - CSS selector
 * @param {string} context - Context for error logging
 * @returns {HTMLElement|null} Element or null if not found
 */
function safeQuerySelector(selector, context = '') {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      // Silently return null - not found is not an error
      return null;
    }
    return element;
  } catch (error) {
    console.error(`DOM Safety: Error querying selector '${selector}':`, error);
    return null;
  }
}

/**
 * Safely query selector all
 * @param {string} selector - CSS selector
 * @param {string} context - Context for error logging
 * @returns {HTMLElement[]} Array of elements (empty array if none found)
 */
function safeQuerySelectorAll(selector, context = '') {
  try {
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) {
      console.warn(`DOM Safety: Selector '${selector}' found 0 elements${context ? ` in ${context}` : ''}`);
      return [];
    }
    return Array.from(elements);
  } catch (error) {
    console.error(`DOM Safety: Error querying selector all '${selector}':`, error);
    return [];
  }
}

/**
 * Safely remove element
 * @param {string} id - Element ID
 * @returns {boolean} Success or failure
 */
function safeRemoveElement(id) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    element.remove();
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error removing element '${id}':`, error);
    return false;
  }
}

/**
 * Safely append child
 * @param {string} parentId - Parent element ID
 * @param {HTMLElement} child - Child element to append
 * @returns {boolean} Success or failure
 */
function safeAppendChild(parentId, child) {
  const parent = safeGetElement(parentId);
  if (!parent || !child) {
    return false;
  }
  try {
    parent.appendChild(child);
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error appending child to '${parentId}':`, error);
    return false;
  }
}

/**
 * Safely add class to element
 * @param {string} id - Element ID
 * @param {string} className - Class name to add
 * @returns {boolean} Success or failure
 */
function safeAddClass(id, className) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    element.classList.add(className);
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error adding class to '${id}':`, error);
    return false;
  }
}

/**
 * Safely remove class from element
 * @param {string} id - Element ID
 * @param {string} className - Class name to remove
 * @returns {boolean} Success or failure
 */
function safeRemoveClass(id, className) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    element.classList.remove(className);
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error removing class from '${id}':`, error);
    return false;
  }
}

/**
 * Safely toggle class on element
 * @param {string} id - Element ID
 * @param {string} className - Class name to toggle
 * @returns {boolean|null} Toggle result or null if failed
 */
function safeToggleClass(id, className) {
  const element = safeGetElement(id);
  if (!element) {
    return null;
  }
  try {
    return element.classList.toggle(className);
  } catch (error) {
    console.error(`DOM Safety: Error toggling class on '${id}':`, error);
    return null;
  }
}

/**
 * Safely set multiple attributes
 * @param {string} id - Element ID
 * @param {Object} attributes - Object with attribute names and values
 * @returns {boolean} Success or failure
 */
function safeSetAttributes(id, attributes = {}) {
  const element = safeGetElement(id);
  if (!element) {
    return false;
  }
  try {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error setting attributes on '${id}':`, error);
    return false;
  }
}

/**
 * Safely get form data
 * @param {string} formId - Form element ID
 * @returns {Object|null} Form data object or null if form not found
 */
function safeGetFormData(formId) {
  const form = safeGetElement(formId);
  if (!form) {
    return null;
  }
  try {
    return new FormData(form);
  } catch (error) {
    console.error(`DOM Safety: Error getting form data from '${formId}':`, error);
    return null;
  }
}

/**
 * Safely reset form
 * @param {string} formId - Form element ID
 * @returns {boolean} Success or failure
 */
function safeResetForm(formId) {
  const form = safeGetElement(formId);
  if (!form || typeof form.reset !== 'function') {
    return false;
  }
  try {
    form.reset();
    return true;
  } catch (error) {
    console.error(`DOM Safety: Error resetting form '${formId}':`, error);
    return false;
  }
}

// Export all functions to window object for defer script compatibility
if (typeof window !== 'undefined') {
  Object.assign(window, {
    safeGetElement,
    safeGetValue,
    safeSetText,
    safeSetHTML,
    safeSetStyle,
    safeSetDisplay,
    safeHide,
    safeShow,
    safeAddEventListener,
    safeQuerySelector,
    safeQuerySelectorAll,
    safeRemoveElement,
    safeAppendChild,
    safeAddClass,
    safeRemoveClass,
    safeToggleClass,
    safeSetAttributes,
    safeGetFormData,
    safeResetForm,
  });
}

// 📦 Global namespace - functions available as window.DOMSafety.*
// Removed ES6 exports for compatibility with non-module scripts

