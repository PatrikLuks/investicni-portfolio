#!/bin/bash
# Skript pro odstranění debug console.log (zachová console.error)
# Chief Project Maintainer - Maintenance 2025

echo "🧹 Odstraňuji debug console.log/info/warn..."
echo "✅ Zachovávám: error-handler.js, console.error volání"

# Seznam souborů k čištění (kromě error-handler.js)
FILES=$(find . -type f -name "*.js" \
  ! -path "./node_modules/*" \
  ! -path "./dist/*" \
  ! -name "error-handler.js" \
  ! -name "remove-debug-logs.sh")

COUNT_BEFORE=0
COUNT_AFTER=0

for file in $FILES; do
  # Spočítej console.log/warn/info PŘED
  BEFORE=$(grep -c "console\.\(log\|warn\|info\)" "$file" 2>/dev/null || echo 0)
  COUNT_BEFORE=$((COUNT_BEFORE + BEFORE))
  
  if [ "$BEFORE" -gt 0 ]; then
    echo "  📝 $file: $BEFORE volání"
    
    # Odstraň console.log/warn/info (zachová console.error)
    # Použij sed pro in-place editaci
    sed -i.bak \
      -e '/console\.log(/d' \
      -e '/console\.warn(/d' \
      -e '/console\.info(/d' \
      "$file"
    
    # Odstraň backup
    rm -f "${file}.bak"
    
    # Spočítej PO
    AFTER=$(grep -c "console\.\(log\|warn\|info\)" "$file" 2>/dev/null || echo 0)
    COUNT_AFTER=$((COUNT_AFTER + AFTER))
    
    echo "    ✅ Odstraněno: $((BEFORE - AFTER)) volání"
  fi
done

echo ""
echo "📊 Souhrn:"
echo "  Před: $COUNT_BEFORE console.log/warn/info"
echo "  Po: $COUNT_AFTER console.log/warn/info"
echo "  Odstraněno: $((COUNT_BEFORE - COUNT_AFTER)) debug logů"
echo ""
echo "✅ Hotovo! Zachovány pouze console.error pro error reporting"
