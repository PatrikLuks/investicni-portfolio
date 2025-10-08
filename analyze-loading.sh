#!/bin/bash

echo "========================================"
echo "📊 ANALÝZA NAČÍTÁNÍ APLIKACE"
echo "========================================"
echo ""

# Aktuální requesty
echo "🔍 POSLEDNÍ REQUESTY (21:46):"
grep "21:46" server.log | tail -20
echo ""

# Počet souborů
echo "📦 CELKOVÝ POČET REQUESTŮ:"
grep "GET" server.log | wc -l
echo ""

# Typy souborů
echo "📁 TYPY NAČTENÝCH SOUBORŮ:"
echo "HTML:" 
grep "\.html" server.log | wc -l
echo "JavaScript:"
grep "\.js" server.log | wc -l
echo "CSS:"
grep "\.css" server.log | wc -l
echo ""

# HTTP Status codes
echo "📊 HTTP STATUS KÓDY:"
echo "200 (OK):"
grep " 200 " server.log | wc -l
echo "304 (Not Modified/Cache):"
grep " 304 " server.log | wc -l
echo "404 (Not Found):"
grep " 404 " server.log | wc -l
echo ""

# Které moduly se načetly
echo "🚀 NAČTENÉ JAVASCRIPT MODULY:"
grep "\.js HTTP" server.log | grep "21:46" | awk '{print $7}' | sort -u
echo ""

# Kontrola které moduly CHYBÍ
echo "⚠️  KONTROLA CHYBĚJÍCÍCH MODULŮ:"
for module in error-handler.js accessibility.js notification-system.js command-stack.js data-validation.js calculations-engine.js app.js; do
    if grep -q "$module.*21:46" server.log; then
        echo "✅ $module"
    else
        echo "❌ $module - NENAČTEN"
    fi
done
echo ""

echo "========================================"
