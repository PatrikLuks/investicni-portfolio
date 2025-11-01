/**
 * Babel Configuration for Jest ES6 Module Support
 * Portfolio Manager Pro v3.1.0
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
