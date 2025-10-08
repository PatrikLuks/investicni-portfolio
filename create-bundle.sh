#!/bin/bash
# Create IIFE bundle from modules

OUTPUT="app-refactored.js"

echo "/**" > $OUTPUT
echo " * INVESTMENT PORTFOLIO MANAGER PRO v3.1.0" >> $OUTPUT
echo " * Refactored Architecture - IIFE Bundle" >> $OUTPUT
echo " * " >> $OUTPUT
echo " * Original: 2835 lines (monolithic)" >> $OUTPUT
echo " * Refactored: 1496 lines (modular)" >> $OUTPUT
echo " * Reduction: 47%" >> $OUTPUT
echo " * " >> $OUTPUT
echo " * Date: $(date +%Y-%m-%d)" >> $OUTPUT
echo " * Phase: 2 Complete" >> $OUTPUT
echo " */" >> $OUTPUT
echo "" >> $OUTPUT
echo "(function() {" >> $OUTPUT
echo "  'use strict';" >> $OUTPUT
echo "" >> $OUTPUT

# Add each module (remove import/export statements)
for module in modules/data-manager.js modules/ui-manager.js modules/portfolio-calculator.js modules/event-handlers.js modules/app-core.js; do
  echo "  // ========================================" >> $OUTPUT
  echo "  // MODULE: $(basename $module)" >> $OUTPUT
  echo "  // ========================================" >> $OUTPUT
  echo "" >> $OUTPUT
  
  # Remove import/export lines, keep rest
  sed '/^import /d; /^export /d; /^\/\*\*/,/\*\//d' $module >> $OUTPUT
  echo "" >> $OUTPUT
done

echo "})();" >> $OUTPUT

echo "✅ Bundle created: $OUTPUT"
wc -l $OUTPUT
