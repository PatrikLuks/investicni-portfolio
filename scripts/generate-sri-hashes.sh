#!/bin/bash
# Generate SRI hashes for external dependencies
# Run this script to generate integrity hashes for production deployment

echo "🔐 Generating SRI (Subresource Integrity) hashes for external libraries..."
echo ""

# Function to generate SRI hash
generate_sri() {
  local url=$1
  local name=$2
  
  echo "📦 $name"
  echo "   URL: $url"
  
  # Download and generate hash
  curl -s "$url" | openssl dgst -sha384 -binary | openssl base64 -A | xargs -I {} echo "   SRI: sha384-{}"
  echo ""
}

# Chart.js v4.4.1
generate_sri "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" "Chart.js"

# Chart.js Zoom Plugin v2.0.1
generate_sri "https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js" "Chart.js Zoom Plugin"

# jsPDF v2.5.2
generate_sri "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js" "jsPDF"

# SheetJS (xlsx) v0.18.5
generate_sri "https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js" "SheetJS (xlsx)"

# Fuse.js v7.0.0
generate_sri "https://cdn.jsdelivr.net/npm/fuse.js@7.0.0" "Fuse.js"

echo "✅ SRI hash generation complete!"
echo ""
echo "📝 Update these hashes in src/js/loaders/library-loader.js"
echo "   in the loadScript() calls with the integrity parameter"
