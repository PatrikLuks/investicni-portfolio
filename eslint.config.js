/**
 * ESLINT CONFIGURATION
 * Investment Portfolio Manager Pro v3.1.0 - 2025 Edition
 * Strict code quality rules for enterprise-grade application
 * ESLint 9+ Flat Config with ES2024 support
 */

import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';

export default [
  // Apply recommended rules
  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        Intl: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        Promise: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',

        // PWA / Service Worker globals
        caches: 'readonly',
        CacheStorage: 'readonly',
        Cache: 'readonly',
        ServiceWorker: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
        clients: 'readonly',
        registration: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        self: 'readonly',

        // App-specific globals
        showToast: 'readonly',
        Chart: 'readonly',
        XLSX: 'readonly',
        jsPDF: 'readonly',
        Fuse: 'readonly',

        // Node.js globals (for build scripts)
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },

    plugins: {
      prettier,
    },

    rules: {
      // ===== ERROR PREVENTION =====
      'no-console': 'off', // Allow console in development
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error', // Use const/let instead
      'prefer-const': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'no-redeclare': 'error',
      'no-shadow': 'warn',

      // ===== BEST PRACTICES =====
      eqeqeq: ['error', 'always'], // Use === instead of ==
      curly: ['error', 'all'], // Require curly braces
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unused-expressions': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'warn',

      // ===== CODE STYLE =====
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-spacing': 'error',
      'block-spacing': 'error',
      'brace-style': ['error', '1tbs'],
      'comma-spacing': 'error',
      'func-call-spacing': 'error',
      'key-spacing': 'error',
      'keyword-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-trailing-spaces': 'error',
      'space-before-blocks': 'error',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'space-in-parens': 'error',
      'space-infix-ops': 'error',

      // ===== ES6+ =====
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'always'],
      'no-duplicate-imports': 'error',
      'no-useless-constructor': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true,
        },
      ],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'warn',
      'template-curly-spacing': 'error',

      // ===== PRETTIER INTEGRATION =====
      // Note: Prettier/ESLint integration disabled to avoid circular fixes
      // Use 'npm run format' to run Prettier separately
      // 'prettier/prettier': 'error',
    },
  },

  // Test files configuration
  {
    files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-expressions': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      '*.bundle.js',
      'ORIGINAL/**',
      'app-monolithic-backup.js',
      'app-refactored.js',
      'investPortfolio-monolithic-backup.html',
    ],
  },
];
