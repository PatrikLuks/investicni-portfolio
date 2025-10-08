#!/bin/bash
# 🚀 PORTFOLIO MANAGER PRO v3.0 - ONE-CLICK DEPLOY
# Production deployment script for enterprise environments

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🏆 PORTFOLIO MANAGER PRO V3.0 - DEPLOYMENT  ║"
echo "║  Enterprise-Grade Investment Portfolio Management  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Portfolio Manager Pro"
APP_VERSION="3.0.0"
PORT=8080

echo -e "${BLUE}📦 Initializing deployment...${NC}"
echo ""

# Check if in correct directory
if [ ! -f "investPortfolio.html" ]; then
    echo -e "${RED}❌ Error: investPortfolio.html not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo -e "${GREEN}✅ Project files found${NC}"
echo ""

# Step 1: Validate required files
echo -e "${BLUE}📋 Step 1/5: Validating required files...${NC}"
required_files=(
    "investPortfolio.html"
    "app.js"
    "manifest.json"
    "service-worker-v3.js"
    "error-handler.js"
)

all_files_present=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓${NC} $file"
    else
        echo -e "${RED}  ✗${NC} $file (missing)"
        all_files_present=false
    fi
done

if [ "$all_files_present" = false ]; then
    echo -e "${RED}❌ Some required files are missing. Deployment aborted.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All required files present${NC}"
echo ""

# Step 2: Check dependencies
echo -e "${BLUE}📋 Step 2/5: Checking dependencies...${NC}"
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}  ✓${NC} Python 3 available"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    echo -e "${GREEN}  ✓${NC} Python available"
    PYTHON_CMD="python"
else
    echo -e "${YELLOW}  ⚠${NC} Python not found. Trying node..."
    if command -v npx &> /dev/null; then
        echo -e "${GREEN}  ✓${NC} Node.js/npx available"
        NODE_AVAILABLE=true
    else
        echo -e "${RED}  ✗${NC} No suitable server found (Python or Node required)"
        echo ""
        echo "Please install either:"
        echo "  • Python 3: https://www.python.org/downloads/"
        echo "  • Node.js: https://nodejs.org/"
        exit 1
    fi
fi
echo ""

# Step 3: Check port availability
echo -e "${BLUE}📋 Step 3/5: Checking port availability...${NC}"
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  ⚠${NC} Port $PORT is already in use"
    echo "  Trying alternative port..."
    PORT=8081
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PORT=8082
    fi
    echo -e "${GREEN}  ✓${NC} Using port $PORT instead"
else
    echo -e "${GREEN}  ✓${NC} Port $PORT is available"
fi
echo ""

# Step 4: Display deployment options
echo -e "${BLUE}📋 Step 4/5: Deployment options${NC}"
echo ""
echo "Choose deployment method:"
echo "  1) Local development server (recommended for testing)"
echo "  2) Production deployment instructions"
echo "  3) Quick start (opens in browser immediately)"
echo "  4) Run enterprise tests"
echo ""
read -p "Enter choice [1-4]: " choice
echo ""

case $choice in
    1)
        echo -e "${BLUE}🚀 Starting local development server...${NC}"
        echo ""
        echo -e "${GREEN}✅ Server configuration:${NC}"
        echo "  • URL: http://localhost:$PORT"
        echo "  • File: investPortfolio.html"
        echo "  • Mode: Development"
        echo ""
        echo -e "${YELLOW}📝 Press Ctrl+C to stop the server${NC}"
        echo ""
        sleep 2
        
        if [ -n "$PYTHON_CMD" ]; then
            $PYTHON_CMD -m http.server $PORT
        elif [ "$NODE_AVAILABLE" = true ]; then
            npx serve -p $PORT
        fi
        ;;
        
    2)
        echo -e "${BLUE}📦 Production Deployment Instructions${NC}"
        echo ""
        echo "╔════════════════════════════════════════════════════════╗"
        echo "║           PRODUCTION DEPLOYMENT GUIDE              ║"
        echo "╚════════════════════════════════════════════════════════╝"
        echo ""
        echo -e "${GREEN}Option A: Netlify (Recommended)${NC}"
        echo "  1. Install Netlify CLI: npm install -g netlify-cli"
        echo "  2. Login: netlify login"
        echo "  3. Deploy: netlify deploy --prod"
        echo ""
        echo -e "${GREEN}Option B: Vercel${NC}"
        echo "  1. Install Vercel CLI: npm install -g vercel"
        echo "  2. Login: vercel login"
        echo "  3. Deploy: vercel --prod"
        echo ""
        echo -e "${GREEN}Option C: GitHub Pages${NC}"
        echo "  1. Push to GitHub: git push origin main"
        echo "  2. Enable Pages in repository Settings"
        echo "  3. Select main branch as source"
        echo ""
        echo -e "${GREEN}Option D: Your Own Server${NC}"
        echo "  1. Upload all files via FTP/SSH"
        echo "  2. Configure web server (Apache/Nginx)"
        echo "  3. Enable HTTPS (Let's Encrypt)"
        echo ""
        echo -e "${BLUE}📖 For detailed instructions, see PRODUCTION_PACKAGE_COMPLETE.md${NC}"
        ;;
        
    3)
        echo -e "${BLUE}⚡ Quick Start Mode${NC}"
        echo ""
        echo -e "${GREEN}✅ Starting server and opening browser...${NC}"
        
        # Start server in background
        if [ -n "$PYTHON_CMD" ]; then
            $PYTHON_CMD -m http.server $PORT > /dev/null 2>&1 &
        elif [ "$NODE_AVAILABLE" = true ]; then
            npx serve -p $PORT > /dev/null 2>&1 &
        fi
        
        SERVER_PID=$!
        sleep 2
        
        # Open browser
        URL="http://localhost:$PORT/investPortfolio.html"
        echo "  • Opening: $URL"
        
        if command -v xdg-open &> /dev/null; then
            xdg-open "$URL" &> /dev/null
        elif command -v open &> /dev/null; then
            open "$URL" &> /dev/null
        elif command -v start &> /dev/null; then
            start "$URL" &> /dev/null
        else
            echo ""
            echo -e "${YELLOW}  ⚠ Could not auto-open browser${NC}"
            echo "  Please manually open: $URL"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Application is running!${NC}"
        echo ""
        echo "  Server PID: $SERVER_PID"
        echo "  To stop: kill $SERVER_PID"
        echo ""
        echo -e "${YELLOW}📝 Server will keep running in background${NC}"
        echo "  View logs: tail -f /tmp/portfolio-server.log"
        ;;
        
    4)
        echo -e "${BLUE}🧪 Running Enterprise Test Suite...${NC}"
        echo ""
        
        if [ -f "enterprise-benchmark.sh" ]; then
            chmod +x enterprise-benchmark.sh
            ./enterprise-benchmark.sh
        else
            echo -e "${RED}❌ Test suite not found${NC}"
            echo "Please ensure enterprise-benchmark.sh is present"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 🎉 DEPLOYMENT COMPLETE!               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📖 Documentation:${NC}"
echo "  • User Guide: USER_GUIDE.md"
echo "  • Features: FEATURE_LIST.md"
echo "  • Production: PRODUCTION_PACKAGE_COMPLETE.md"
echo ""
echo -e "${GREEN}🔗 Useful Links:${NC}"
echo "  • Main App: http://localhost:$PORT/investPortfolio.html"
echo "  • QA Dashboard: http://localhost:$PORT/qa-dashboard.html"
echo "  • Functional Tests: http://localhost:$PORT/functional-test.html"
echo ""
echo -e "${BLUE}💬 Need help? Check the documentation or visit:${NC}"
echo "   https://github.com/PatrikLuks/investicni-portfolio"
echo ""
echo -e "${GREEN}✨ Thank you for using Portfolio Manager Pro v3.0!${NC}"
echo ""