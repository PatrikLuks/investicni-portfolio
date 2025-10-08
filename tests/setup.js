/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

// Mock localStorage (simple implementation without jest.fn())
const storage = {};
const localStorageMock = {
  getItem: (key) => storage[key] || null,
  setItem: (key, value) => { storage[key] = value; },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost',
  pathname: '/',
  search: '',
  hash: '',
  reload: () => {},
};

// Mock console methods to reduce noise in tests (simple implementation)
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: originalConsole.error, // Keep error for debugging
};

// Mock fetch API
global.fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });

// Mock Chart.js
global.Chart = class Chart {
  constructor() {
    this.data = {};
    this.options = {};
  }
  destroy() {}
  update() {}
  reset() {}
};

// Mock IndexedDB
const indexedDB = {
  open: () => {},
  deleteDatabase: () => {},
};
global.indexedDB = indexedDB;

// Setup DOM
if (typeof document !== 'undefined') {
  document.body.innerHTML = `
    <div id="app"></div>
    <div id="dashboard"></div>
    <div id="transactionForm"></div>
  `;
}

// Reset after each test
afterEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
});
