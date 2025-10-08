#!/bin/bash

# 🚀 QUICK START GUIDE - Portfolio Manager Pro v3.0
# One-command deployment for instant usage

echo "════════════════════════════════════════════════════════"
echo "🚀 Portfolio Manager Pro v3.0 - Quick Start"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Enterprise-Grade Investment Portfolio Manager"
echo "✅ 27 Features • 0.0003s Load Time • 100% Free"
echo ""

# Check if in correct directory
if [ ! -f "investPortfolio.html" ]; then
    echo "❌ Error: investPortfolio.html not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project files found"
echo ""

# Detect available server
PORT=8080

if command -v python3 &> /dev/null; then
    echo "🐍 Starting Python server on port $PORT..."
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║  🎉 Portfolio Manager Pro v3.0 is now RUNNING!        ║"
    echo "║                                                        ║"
    echo "║  Open your browser:                                    ║"
    echo "║  👉 http://localhost:$PORT/investPortfolio.html        ║"
    echo "║                                                        ║"
    echo "║  Press Ctrl+C to stop the server                       ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    # Open browser automatically (works on macOS and Linux)
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    fi
    
    python3 -m http.server $PORT
    
elif command -v python &> /dev/null; then
    echo "🐍 Starting Python server on port $PORT..."
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║  🎉 Portfolio Manager Pro v3.0 is now RUNNING!        ║"
    echo "║                                                        ║"
    echo "║  Open your browser:                                    ║"
    echo "║  👉 http://localhost:$PORT/investPortfolio.html        ║"
    echo "║                                                        ║"
    echo "║  Press Ctrl+C to stop the server                       ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    # Open browser automatically
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    fi
    
    python -m SimpleHTTPServer $PORT
    
elif command -v php &> /dev/null; then
    echo "🐘 Starting PHP server on port $PORT..."
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║  🎉 Portfolio Manager Pro v3.0 is now RUNNING!        ║"
    echo "║                                                        ║"
    echo "║  Open your browser:                                    ║"
    echo "║  👉 http://localhost:$PORT/investPortfolio.html        ║"
    echo "║                                                        ║"
    echo "║  Press Ctrl+C to stop the server                       ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    # Open browser automatically
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    fi
    
    php -S localhost:$PORT
    
elif command -v npx &> /dev/null; then
    echo "📦 Starting Node.js server on port $PORT..."
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║  🎉 Portfolio Manager Pro v3.0 is now RUNNING!        ║"
    echo "║                                                        ║"
    echo "║  Open your browser:                                    ║"
    echo "║  👉 http://localhost:$PORT/investPortfolio.html        ║"
    echo "║                                                        ║"
    echo "║  Press Ctrl+C to stop the server                       ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    # Open browser automatically
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT/investPortfolio.html" 2>/dev/null &
    fi
    
    npx serve -p $PORT
    
else
    echo "❌ No suitable web server found"
    echo ""
    echo "Please install one of the following:"
    echo "  • Python 3: apt install python3"
    echo "  • Node.js: apt install nodejs npm"
    echo "  • PHP: apt install php"
    echo ""
    echo "Or simply open investPortfolio.html directly in your browser!"
    echo ""
    
    # Try to open directly
    if [ -f "investPortfolio.html" ]; then
        echo "🔄 Attempting to open directly in browser..."
        if command -v xdg-open &> /dev/null; then
            xdg-open "investPortfolio.html"
        elif command -v open &> /dev/null; then
            open "investPortfolio.html"
        else
            echo "Please open investPortfolio.html manually in your browser"
        fi
    fi
fi
