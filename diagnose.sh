#!/bin/bash

# 🔍 KOMPLETNÍ DIAGNOSTIKA APLIKACE

echo "=================================================="
echo "🔍 PORTFOLIO MANAGER - DIAGNOSTIKA PROBLÉMŮ"
echo "=================================================="
echo ""

# 1. SERVER STATUS
echo "📡 1. SERVER STATUS"
echo "-------------------"
if lsof -ti:8080 > /dev/null 2>&1; then
    PID=$(lsof -ti:8080)
    echo "✅ Server běží (PID: $PID)"
else
    echo "❌ Server NEBĚŽÍ"
    echo "   Spusť: ./START.sh"
fi
echo ""

# 2. SOUBORY
echo "📁 2. KRITICKÉ SOUBORY"
echo "----------------------"
FILES=(
    "index-working-v2.html"
    "app.js"
    "error-handler.js"
    "accessibility.js"
    "notification-system.js"
    "command-stack.js"
    "data-validation.js"
    "calculations-engine.js"
)

MISSING=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo "✅ $file ($SIZE)"
    else
        echo "❌ $file - CHYBÍ!"
        MISSING=$((MISSING + 1))
    fi
done
echo ""

if [ $MISSING -gt 0 ]; then
    echo "⚠️  CHYBÍ $MISSING SOUBORŮ!"
    echo ""
fi

# 3. JAVASCRIPT SYNTAX CHECK
echo "🔍 3. JAVASCRIPT SYNTAX CHECK"
echo "-----------------------------"
for jsfile in app.js error-handler.js accessibility.js notification-system.js command-stack.js data-validation.js calculations-engine.js; do
    if [ -f "$jsfile" ]; then
        # Zkus základní syntax check
        if node -c "$jsfile" 2>/dev/null; then
            echo "✅ $jsfile - syntax OK"
        else
            ERROR=$(node -c "$jsfile" 2>&1 | head -3)
            echo "❌ $jsfile - SYNTAX ERROR!"
            echo "   $ERROR"
        fi
    fi
done
echo ""

# 4. HTML STRUCTURE
echo "🏗️  4. HTML STRUCTURE (index-working-v2.html)"
echo "----------------------------------------------"
if [ -f "index-working-v2.html" ]; then
    SCRIPTS=$(grep -c "<script src=" index-working-v2.html)
    echo "📦 Script tags: $SCRIPTS"
    
    echo ""
    echo "Loaded modules:"
    grep "<script src=" index-working-v2.html | sed 's/.*src="//;s/".*//' | while read -r src; do
        if [ -f "$src" ]; then
            echo "  ✅ $src"
        else
            echo "  ❌ $src - FILE MISSING!"
        fi
    done
else
    echo "❌ index-working-v2.html CHYBÍ!"
fi
echo ""

# 5. HTTP TEST
echo "🌐 5. HTTP SERVER TEST"
echo "----------------------"
if lsof -ti:8080 > /dev/null 2>&1; then
    # Test HTML
    HTML_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/index-working-v2.html)
    if [ "$HTML_STATUS" = "200" ] || [ "$HTML_STATUS" = "304" ]; then
        echo "✅ HTML načítání: $HTML_STATUS"
    else
        echo "❌ HTML načítání: $HTML_STATUS (mělo by být 200 nebo 304)"
    fi
    
    # Test JS modules
    for jsfile in error-handler.js accessibility.js notification-system.js command-stack.js data-validation.js calculations-engine.js app.js; do
        JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/$jsfile")
        if [ "$JS_STATUS" = "200" ] || [ "$JS_STATUS" = "304" ]; then
            echo "✅ $jsfile: $JS_STATUS"
        else
            echo "❌ $jsfile: $JS_STATUS"
        fi
    done
else
    echo "⚠️  Server neběží - skip HTTP test"
fi
echo ""

# 6. RECENT SERVER LOGS
echo "📋 6. POSLEDNÍ SERVER LOGY"
echo "--------------------------"
if [ -f "server.log" ]; then
    if [ -s "server.log" ]; then
        echo "Posledních 10 requestů:"
        tail -10 server.log | grep -E "GET|POST|ERROR" || echo "(žádné requesty)"
    else
        echo "⚠️  server.log je prázdný"
    fi
else
    echo "⚠️  server.log neexistuje"
fi
echo ""

# 7. JAVASCRIPT ERRORS CHECK
echo "🐛 7. ZNÁMÉ PROBLÉMY V KÓDU"
echo "---------------------------"

echo "Hledám běžné chyby..."

# Check for undefined variables
UNDEFINED=$(grep -n "undefined" app.js 2>/dev/null | wc -l)
if [ "$UNDEFINED" -gt 0 ]; then
    echo "⚠️  app.js: $UNDEFINED výskytů 'undefined'"
fi

# Check for console.error
ERRORS=$(grep -n "console.error" *.js 2>/dev/null | wc -l)
if [ "$ERRORS" -gt 0 ]; then
    echo "📝 Nalezeno $ERRORS console.error() volání"
fi

# Check for TODO/FIXME
TODOS=$(grep -n "TODO\|FIXME\|BUG" *.js 2>/dev/null | wc -l)
if [ "$TODOS" -gt 0 ]; then
    echo "📝 Nalezeno $TODOS TODO/FIXME/BUG komentářů"
fi

echo ""

# 8. PACKAGE.JSON
echo "📦 8. NPM/NODE STATUS"
echo "---------------------"
if [ -f "package.json" ]; then
    if [ -s "package.json" ]; then
        echo "✅ package.json existuje"
    else
        echo "⚠️  package.json je PRÁZDNÝ (to je OK - aplikace nepoužívá npm)"
    fi
else
    echo "⚠️  package.json neexistuje (to je OK - aplikace nepoužívá npm)"
fi
echo ""

# 9. SUMMARY
echo "=================================================="
echo "📊 SOUHRN"
echo "=================================================="
echo ""

if lsof -ti:8080 > /dev/null 2>&1 && [ $MISSING -eq 0 ]; then
    echo "✅ Základní infrastruktura: OK"
    echo ""
    echo "🔍 JAK ZJISTIT KONKRÉTNÍ PROBLÉMY:"
    echo ""
    echo "1. Otevři Safari Web Inspector (⌥⌘C)"
    echo "2. Klikni na Console tab"
    echo "3. Zkopíruj VŠECHNY červené chybové hlášky"
    echo "4. Pošli mi je"
    echo ""
    echo "Nebo mi řekni:"
    echo "  - Co se přesně stane, když otevřeš aplikaci?"
    echo "  - Vidíš formulář?"
    echo "  - Fungují tlačítka?"
    echo "  - Co nefunguje konkrétně?"
else
    echo "❌ KRITICKÉ PROBLÉMY NALEZENY!"
    echo ""
    if ! lsof -ti:8080 > /dev/null 2>&1; then
        echo "1. Server neběží - spusť: ./START.sh"
    fi
    if [ $MISSING -gt 0 ]; then
        echo "2. Chybí $MISSING kritických souborů"
    fi
fi

echo ""
echo "=================================================="
echo "🚀 QUICK COMMANDS:"
echo "=================================================="
echo ""
echo "./START.sh          - Spustit aplikaci"
echo "./server.sh status  - Zkontrolovat server"
echo "./server.sh logs    - Zobrazit logy"
echo "./server.sh restart - Restartovat server"
echo ""
