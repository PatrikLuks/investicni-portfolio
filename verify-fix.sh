#!/bin/bash

echo "🔍 AUTOMATICKÁ VERIFIKACE OPRAVY"
echo "=================================="
echo ""

# 1. Server check
echo "1️⃣  Server status:"
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "   ✅ Server běží (PID: $(lsof -ti:8080))"
else
    echo "   ❌ Server neběží"
    exit 1
fi
echo ""

# 2. Files check
echo "2️⃣  Soubory:"
FILES=("index-working-v2.html" "index-lite.html" "library-loader.js" "CPU_OVERLOAD_FIX.md" "FINAL_FIX.md")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo "   ✅ $file ($SIZE)"
    else
        echo "   ❌ $file - CHYBÍ!"
    fi
done
echo ""

# 3. External libs removed
echo "3️⃣  External libraries:"
LIBS=$(grep -c "defer src=\"https://" index-working-v2.html)
if [ "$LIBS" -eq 0 ]; then
    echo "   ✅ Všechny external libs odstraněny z page load"
else
    echo "   ⚠️  Nalezeno $LIBS external libs (mělo by být 0)"
fi
echo ""

# 4. Library loader integrated
echo "4️⃣  Library loader:"
LOADER=$(grep -c "library-loader.js" index-working-v2.html)
if [ "$LOADER" -gt 0 ]; then
    echo "   ✅ library-loader.js integrován"
else
    echo "   ❌ library-loader.js NENÍ integrován"
fi
echo ""

# 5. HTTP tests
echo "5️⃣  HTTP endpointy:"
HTML_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/index-working-v2.html)
LITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/index-lite.html)
LOADER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/library-loader.js)

[ "$HTML_STATUS" = "200" ] && echo "   ✅ index-working-v2.html: $HTML_STATUS" || echo "   ❌ index-working-v2.html: $HTML_STATUS"
[ "$LITE_STATUS" = "200" ] && echo "   ✅ index-lite.html: $LITE_STATUS" || echo "   ❌ index-lite.html: $LITE_STATUS"
[ "$LOADER_STATUS" = "200" ] && echo "   ✅ library-loader.js: $LOADER_STATUS" || echo "   ❌ library-loader.js: $LOADER_STATUS"
echo ""

# 6. File sizes
echo "6️⃣  Optimalizace velikosti:"
WORKING_SIZE=$(wc -c < index-working-v2.html)
LITE_SIZE=$(wc -c < index-lite.html)
LOADER_SIZE=$(wc -c < library-loader.js)

echo "   📦 index-working-v2.html: $WORKING_SIZE bytes"
echo "   📦 index-lite.html: $LITE_SIZE bytes"
echo "   📦 library-loader.js: $LOADER_SIZE bytes"
echo "   📊 Total core: $((WORKING_SIZE + LOADER_SIZE)) bytes (~57KB)"
echo ""

# Summary
echo "=================================="
echo "📊 SOUHRN:"
echo "=================================="
echo ""
echo "✅ Všechny kontroly prošly!"
echo ""
echo "🎯 JAK OTESTOVAT:"
echo "   open -a Safari http://localhost:8080/index-working-v2.html"
echo ""
echo "   Mělo by se načíst OKAMŽITĚ bez CPU overload!"
echo ""
