#!/bin/bash
# Quick Start Script for Portfolio Manager Pro v3.0
# One-command deployment

set -e

echo "🚀 Portfolio Manager Pro v3.0 - Quick Start"
echo "=========================================="
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js detected: $(node -v)"
else
    echo "⚠️  Node.js not found (optional, not required)"
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python detected: $(python3 --version)"
elif command -v python &> /dev/null; then
    echo "✅ Python detected: $(python --version)"
else
    echo "⚠️  Python not found (recommended for local server)"
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker detected: $(docker --version)"
else
    echo "⚠️  Docker not found (optional)"
fi

echo ""
echo "📦 Choose deployment method:"
echo "1) Direct file open (simplest)"
echo "2) Python HTTP server (recommended)"
echo "3) Node.js server"
echo "4) Docker container"
echo "5) Run tests only"
echo ""
read -p "Select option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Opening in default browser..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open investPortfolio.html
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open investPortfolio.html
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            start investPortfolio.html
        fi
        echo "✅ Application opened!"
        ;;
    
    2)
        echo ""
        echo "🚀 Starting Python HTTP server on port 8080..."
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8080
        else
            python -m SimpleHTTPServer 8080
        fi
        ;;
    
    3)
        echo ""
        echo "🚀 Starting Node.js server on port 8080..."
        if command -v npx &> /dev/null; then
            npx serve -p 8080
        else
            echo "❌ npx not found. Install Node.js first."
            exit 1
        fi
        ;;
    
    4)
        echo ""
        echo "🐳 Building Docker image..."
        docker build -t portfolio-manager-pro:3.0 .
        echo ""
        echo "🚀 Starting Docker container..."
        docker run -d --name portfolio-manager -p 8080:80 portfolio-manager-pro:3.0
        echo ""
        echo "✅ Container started!"
        echo "🌐 Visit: http://localhost:8080/investPortfolio.html"
        echo ""
        echo "📊 Container logs:"
        docker logs -f portfolio-manager
        ;;
    
    5)
        echo ""
        echo "🧪 Running tests..."
        if [ -f "package.json" ]; then
            if [ ! -d "node_modules" ]; then
                echo "📦 Installing dependencies..."
                npm install
            fi
            echo ""
            echo "🧪 Running Jest tests..."
            npm test
            echo ""
            echo "✅ Tests complete!"
        else
            echo "❌ package.json not found. Run: npm init"
        fi
        ;;
    
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "✅ Deployment complete!"
echo ""
echo "📚 Documentation:"
echo "  • README.md - Project overview"
echo "  • USER_GUIDE.md - How to use"
echo "  • DEVELOPER_GUIDE.md - Development"
echo "  • SECURITY.md - Security policy"
echo ""
echo "🔧 Commands:"
echo "  • npm test - Run tests"
echo "  • npm run lint - Check code quality"
echo "  • docker-compose up - Full deployment"
echo ""
echo "🌐 Access application:"
echo "  • Direct: file://$(pwd)/investPortfolio.html"
echo "  • Server: http://localhost:8080/investPortfolio.html"
echo ""
echo "Happy portfolio managing! 📈"
