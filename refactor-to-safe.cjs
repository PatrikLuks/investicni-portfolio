#!/usr/bin/env node

/**
 * Phase 2B Refactoring Script
 * Automatically updates DOM operations to use safe functions
 * 
 * Usage: node refactor-to-safe.js <file>
 */

const fs = require('fs');
const path = require('path');

const file = process.argv[2];

if (!file) {
  console.error('Usage: node refactor-to-safe.js <filepath>');
  process.exit(1);
}

const filePath = path.resolve(file);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf-8');
const originalLength = content.length;

console.log(`📄 Processing: ${filePath}`);
console.log(`📊 Original size: ${content.length} bytes\n`);

// Track replacements
let replacements = 0;

// === Pattern 1: document.getElementById('id').value ===
// BEFORE: document.getElementById('fondName').value
// AFTER:  safeGetValue('fondName', '')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.value/g,
  (_match, id) => {
    replacements++;
    return `safeGetValue('${id}', '')`;
  }
);

// === Pattern 2: document.getElementById('id').textContent = value ===
// BEFORE: document.getElementById('heading').textContent = 'Title'
// AFTER:  safeSetText('heading', 'Title')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.textContent\s*=\s*([^;]+);/g,
  (_match, id, value) => {
    replacements++;
    return `safeSetText('${id}', ${value});`;
  }
);

// === Pattern 3: document.getElementById('id').innerHTML = value ===
// BEFORE: document.getElementById('container').innerHTML = '<div>...'
// AFTER:  safeSetHTML('container', '<div>...')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.innerHTML\s*=\s*`?([^;`]+)`?;/g,
  (_match, id, value) => {
    replacements++;
    return `safeSetHTML('${id}', \`${value}\`);`;
  }
);

// === Pattern 4: document.getElementById('id').style.display = 'value' ===
// BEFORE: document.getElementById('card').style.display = 'none'
// AFTER:  safeSetDisplay('card', 'none')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.style\.display\s*=\s*['"]([^'"]+)['"]/g,
  (_match, id, display) => {
    replacements++;
    return `safeSetDisplay('${id}', '${display}')`;
  }
);

// === Pattern 5: document.getElementById('id').style[property] = value ===
// BEFORE: document.getElementById('nav').style['opacity'] = 0.5
// AFTER:  safeSetStyle('nav', 'opacity', 0.5)
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.style\[['"]([^'"]+)['"]\]\s*=\s*([^;]+)/g,
  (_match, id, property, value) => {
    replacements++;
    return `safeSetStyle('${id}', '${property}', ${value}`;
  }
);

// === Pattern 6: document.getElementById('id').classList.add('class') ===
// BEFORE: document.getElementById('btn').classList.add('active')
// AFTER:  safeAddClass('btn', 'active')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.classList\.add\(['"]([^'"]+)['"]\)/g,
  (_match, id, className) => {
    replacements++;
    return `safeAddClass('${id}', '${className}')`;
  }
);

// === Pattern 7: document.getElementById('id').classList.remove('class') ===
// BEFORE: document.getElementById('btn').classList.remove('active')
// AFTER:  safeRemoveClass('btn', 'active')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.classList\.remove\(['"]([^'"]+)['"]\)/g,
  (_match, id, className) => {
    replacements++;
    return `safeRemoveClass('${id}', '${className}')`;
  }
);

// === Pattern 8: document.getElementById('id').addEventListener(...) ===
// BEFORE: document.getElementById('btn').addEventListener('click', handler)
// AFTER:  safeAddEventListener('btn', 'click', handler)
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.addEventListener\(['"]([^'"]+)['"],\s*([^)]+)\)/g,
  (_match, id, event, handler) => {
    replacements++;
    return `safeAddEventListener('${id}', '${event}', ${handler})`;
  }
);

// === Pattern 9: document.getElementById('id').remove() ===
// BEFORE: document.getElementById('modal').remove()
// AFTER:  safeRemoveElement('modal')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.remove\(\)/g,
  (_match, id) => {
    replacements++;
    return `safeRemoveElement('${id}')`;
  }
);

// === Pattern 10: document.getElementById('id').reset() ===
// BEFORE: document.getElementById('form').reset()
// AFTER:  safeResetForm('form')
content = content.replace(
  /document\.getElementById\(['"]([^'"]+)['"]\)\.reset\(\)/g,
  (_match, id) => {
    replacements++;
    return `safeResetForm('${id}')`;
  }
);

// === Pattern 11: document.querySelectorAll(...).forEach(...) ===
// BEFORE: document.querySelectorAll('.item').forEach(...)
// AFTER:  safeQuerySelectorAll('.item').forEach(...)
content = content.replace(
  /document\.querySelectorAll\(/g,
  'safeQuerySelectorAll('
);

// === Pattern 12: document.querySelector(...) ===
// BEFORE: document.querySelector('.modal')
// AFTER:  safeQuerySelector('.modal')
content = content.replace(
  /document\.querySelector\(/g,
  'safeQuerySelector('
);

console.log(`✅ Replacements made: ${replacements}`);
console.log(`📊 New size: ${content.length} bytes`);
console.log(`📉 Size change: ${content.length - originalLength} bytes\n`);

// Create backup
const backup = filePath + '.backup';
fs.copyFileSync(filePath, backup);
console.log(`💾 Backup created: ${backup}`);

// Write updated file
fs.writeFileSync(filePath, content, 'utf-8');
console.log(`✏️  File updated: ${filePath}\n`);

console.log('Summary of changes:');
console.log('  - getElementById().value → safeGetValue()');
console.log('  - getElementById().textContent = → safeSetText()');
console.log('  - getElementById().innerHTML = → safeSetHTML()');
console.log('  - getElementById().style.display = → safeSetDisplay()');
console.log('  - getElementById().style[prop] = → safeSetStyle()');
console.log('  - getElementById().classList.add() → safeAddClass()');
console.log('  - getElementById().classList.remove() → safeRemoveClass()');
console.log('  - getElementById().addEventListener() → safeAddEventListener()');
console.log('  - getElementById().remove() → safeRemoveElement()');
console.log('  - getElementById().reset() → safeResetForm()');
console.log('  - querySelectorAll() → safeQuerySelectorAll()');
console.log('  - querySelector() → safeQuerySelector()');
console.log('\n⚠️  IMPORTANT: Review the changes manually before committing!\n');
