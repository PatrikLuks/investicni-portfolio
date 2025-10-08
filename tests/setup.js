/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
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
  reload: jest.fn(),
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

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
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
global.indexedDB = indexedDB;

// Setup DOM
document.body.innerHTML = `
  <div id="app"></div>
  <div id="dashboard"></div>
  <div id="transactionForm"></div>
`;

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
