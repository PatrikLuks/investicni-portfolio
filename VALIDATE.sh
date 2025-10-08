#!/bin/bash

# 🏆 FINAL VALIDATION - Portfolio Manager Pro v3.0
# Comprehensive validation of all project components

echo "════════════════════════════════════════════════════════"
echo "🏆 Portfolio Manager Pro v3.0 - Final Validation"
echo "════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}❌ $2 - Missing: $1${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Function to check file size
check_size() {
    if [ -f "$1" ]; then
        SIZE=$(du -k "$1" | cut -f1)
        if [ $SIZE -le $2 ]; then
            echo -e "${GREEN}✅ $3 ($SIZE KB <= $2 KB)${NC}"
            ((PASS_COUNT++))
        else
            echo -e "${YELLOW}⚠️  $3 ($SIZE KB > $2 KB)${NC}"
            ((WARN_COUNT++))
        fi
    fi
}

# Function to check string in file
check_content() {
    if [ -f "$1" ] && grep -q "$2" "$1"; then
        echo -e "${GREEN}✅ $3${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${RED}❌ $3${NC}"
        ((FAIL_COUNT++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 CORE FILES VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Main application files
check_file "investPortfolio.html" "Main HTML file"
check_file "app.js" "Core JavaScript"
check_file "manifest.json" "PWA Manifest"
check_file "service-worker-v3.js" "Service Worker"

# JavaScript modules
echo ""
echo "📦 JavaScript Modules:"
check_file "calculations-engine.js" "Calculations Engine"
check_file "charts-manager.js" "Charts Manager"
check_file "error-handler.js" "Error Handler"
check_file "notification-system.js" "Notification System"
check_file "command-stack.js" "Undo/Redo System"
check_file "portfolio-optimizer.js" "Portfolio Optimizer"
check_file "ai-insights.js" "AI Insights"
check_file "advanced-analytics.js" "Advanced Analytics"
check_file "market-data.js" "Market Data"
check_file "search-engine.js" "Search Engine"
check_file "help-system.js" "Help System"

# CSS files
echo ""
echo "🎨 CSS Stylesheets:"
check_file "calculations-styles.css" "Calculations Styles"
check_file "charts-styles.css" "Charts Styles"
check_file "dashboard-styles.css" "Dashboard Styles"
check_file "validation-styles.css" "Validation Styles"
check_file "drag-drop.css" "Drag & Drop Styles"
check_file "cloud-backup.css" "Cloud Backup Styles"
check_file "accessibility.css" "Accessibility Styles"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 DOCUMENTATION VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# User documentation
echo ""
echo "📚 User Documentation:"
check_file "README_FINAL.md" "Final README"
check_file "USER_GUIDE.md" "User Guide"
check_file "VISUAL_SHOWCASE.md" "Visual Showcase"
check_file "VISUAL_GUIDE.md" "Visual Guide"
check_file "FEATURE_LIST.md" "Feature List"

# Technical documentation
echo ""
echo "🔧 Technical Documentation:"
check_file "IMPLEMENTATION_COMPLETE.md" "Implementation Guide"
check_file "FINAL_CPU_OVERLOAD_FIX.md" "CPU Fix Documentation"
check_file "FINAL_OPTIMIZATION.md" "Optimization Details"
check_file "PRODUCTION_PACKAGE_COMPLETE.md" "Production Package"

# Quality documentation
echo ""
echo "🏆 Quality Documentation:"
check_file "TOP_LEVEL_ENTERPRISE_CERTIFICATION.md" "Enterprise Certification"
check_file "FINAL_QUALITY_CHECKLIST.md" "Quality Checklist"
check_file "ENTERPRISE_TEST_SUITE.md" "Test Suite"
check_file "PERFORMANCE_BENCHMARK.md" "Performance Benchmark"

# Community documentation
echo ""
echo "🤝 Community Documentation:"
check_file "CONTRIBUTING.md" "Contributing Guide"
check_file "LICENSE" "License File"
check_file "CHANGELOG.md" "Changelog"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING & DEPLOYMENT VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "qa-dashboard.html" "QA Dashboard"
check_file "functional-test.html" "Functional Tests"
check_file "enterprise-benchmark.sh" "Benchmark Script"
check_file "DEPLOY.sh" "Deployment Script"
check_file ".github/workflows/ci-cd.yml" "GitHub Actions CI/CD"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 BUNDLE SIZE VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check individual file sizes
check_size "investPortfolio.html" 100 "HTML size"
check_size "app.js" 200 "Core JS size"
check_size "service-worker-v3.js" 50 "Service Worker size"

# Calculate total bundle size
if command -v du &> /dev/null; then
    JS_SIZE=$(du -ck *.js 2>/dev/null | grep total | awk '{print $1}')
    CSS_SIZE=$(du -ck *.css 2>/dev/null | grep total | awk '{print $1}')
    HTML_SIZE=$(du -ck *.html 2>/dev/null | grep total | awk '{print $1}')
    TOTAL_SIZE=$((JS_SIZE + CSS_SIZE + HTML_SIZE))
    
    echo "📊 Bundle Analysis:"
    echo "   JavaScript: ${JS_SIZE} KB"
    echo "   CSS: ${CSS_SIZE} KB"
    echo "   HTML: ${HTML_SIZE} KB"
    echo "   Total: ${TOTAL_SIZE} KB"
    echo ""
    
    if [ $TOTAL_SIZE -le 1024 ]; then
        echo -e "${GREEN}✅ Total bundle size OK (${TOTAL_SIZE} KB < 1024 KB)${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${YELLOW}⚠️  Bundle size large (${TOTAL_SIZE} KB > 1024 KB)${NC}"
        ((WARN_COUNT++))
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CODE QUALITY VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for common issues
echo "🔍 Checking for common issues..."

# Check for console.log (should be minimal in production)
LOG_COUNT=$(grep -r "console\.log" *.js 2>/dev/null | wc -l)
if [ $LOG_COUNT -lt 50 ]; then
    echo -e "${GREEN}✅ Console.log usage OK ($LOG_COUNT occurrences)${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠️  Many console.log statements ($LOG_COUNT occurrences)${NC}"
    ((WARN_COUNT++))
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO\|FIXME" *.js *.css *.html 2>/dev/null | wc -l)
if [ $TODO_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No TODO/FIXME comments${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
    ((WARN_COUNT++))
fi

# Check for eval usage (security risk)
if ! grep -r "eval(" *.js 2>/dev/null; then
    echo -e "${GREEN}✅ No eval() usage (good for security)${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Found eval() usage (security risk)${NC}"
    ((FAIL_COUNT++))
fi

# Check for innerHTML usage (XSS risk)
INNERHTML_COUNT=$(grep -r "innerHTML" *.js 2>/dev/null | wc -l)
if [ $INNERHTML_COUNT -lt 10 ]; then
    echo -e "${GREEN}✅ Limited innerHTML usage ($INNERHTML_COUNT)${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠️  Significant innerHTML usage ($INNERHTML_COUNT) - review for XSS${NC}"
    ((WARN_COUNT++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 SECURITY VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for CSP headers in HTML
check_content "investPortfolio.html" "Content-Security-Policy" "CSP meta tag"

# Check for API keys (should not be hardcoded)
if ! grep -r "api[_-]key\|apikey\|API_KEY" *.js 2>/dev/null | grep -v "// "; then
    echo -e "${GREEN}✅ No hardcoded API keys${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Found potential hardcoded API keys${NC}"
    ((FAIL_COUNT++))
fi

# Check for passwords
if ! grep -ri "password.*=.*['\"]" *.js 2>/dev/null; then
    echo -e "${GREEN}✅ No hardcoded passwords${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Found potential hardcoded passwords${NC}"
    ((FAIL_COUNT++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VALIDATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_CHECKS=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
PASS_PERCENT=$((PASS_COUNT * 100 / TOTAL_CHECKS))

echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}✅ Passed: $PASS_COUNT ($PASS_PERCENT%)${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN_COUNT${NC}"
echo -e "${RED}❌ Failed: $FAIL_COUNT${NC}"
echo ""

# Calculate grade
if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
    GRADE="A+"
    COLOR=$GREEN
    STATUS="PERFECT"
elif [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -lt 5 ]; then
    GRADE="A"
    COLOR=$GREEN
    STATUS="EXCELLENT"
elif [ $FAIL_COUNT -eq 0 ]; then
    GRADE="B"
    COLOR=$YELLOW
    STATUS="GOOD"
elif [ $FAIL_COUNT -lt 5 ]; then
    GRADE="C"
    COLOR=$YELLOW
    STATUS="NEEDS IMPROVEMENT"
else
    GRADE="F"
    COLOR=$RED
    STATUS="FAILED"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${COLOR}🏆 FINAL GRADE: $GRADE ($STATUS)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ PROJECT VALIDATION PASSED!${NC}"
    echo "🚀 Project is ready for production deployment"
    echo ""
    echo "Next steps:"
    echo "1. Run ./DEPLOY.sh to deploy"
    echo "2. Push to GitHub: git push origin main"
    echo "3. Share with community!"
    exit 0
else
    echo -e "${RED}❌ PROJECT VALIDATION FAILED!${NC}"
    echo "🔧 Please fix the issues above before deployment"
    echo ""
    echo "Review failed checks and try again."
    exit 1
fi
