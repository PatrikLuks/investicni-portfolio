<!-- Placeholder for PWA Icons -->
<!-- 
  Note: Replace these placeholders with actual icon files
  
  Required icon sizes for PWA:
  - icon-72x72.png
  - icon-96x96.png
  - icon-128x128.png
  - icon-144x144.png
  - icon-152x152.png
  - icon-192x192.png
  - icon-384x384.png
  - icon-512x512.png
  
  You can generate these icons using:
  1. Online tools: https://www.pwabuilder.com/imageGenerator
  2. Or use a design tool (Figma, Photoshop, etc.)
  
  Icon design suggestions:
  - Use JPL Invest branding colors (#1a237e)
  - Include a recognizable symbol (chart, portfolio, money)
  - Ensure good contrast for visibility
  - Test on both light and dark backgrounds
-->

To generate icons automatically, you can:
1. Visit https://favicon.io/favicon-generator/
2. Or use ImageMagick command line:
   
   convert -size 512x512 xc:#1a237e -gravity center \
   -pointsize 200 -fill white -annotate +0+0 "₿" \
   icon-512x512.png
   
3. Then resize for other sizes:
   for size in 72 96 128 144 152 192 384; do
     convert icon-512x512.png -resize ${size}x${size} icon-${size}x${size}.png
   done
