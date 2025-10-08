#!/bin/bash
# Extract head and body from investPortfolio.html, create working version

# Get everything until </head>
sed -n '1,/<\/head>/p' investPortfolio.html > /tmp/head.html

# Get body content (skip last </body></html>)
sed -n '/<body>/,/<\/body>/{ /<\/body>/d; p }' investPortfolio.html > /tmp/body.html

# Create new file
cat > index-working.html << 'EOF'
<!DOCTYPE html>
<html lang="cs">
EOF

# Add modified head (remove module-loader references, add inline loader)
sed '/<link rel="manifest"/d; /X-Frame-Options/d' /tmp/head.html | sed 's|</head>|<style>/* Loading screen */|' >> index-working.html

cat >> index-working.html << 'EOF'
#app-loader{position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;z-index:999999;transition:opacity 0.5s}.app-loaded #app-loader{opacity:0;pointer-events:none}.loader-content{text-align:center;color:#fff}.loader-logo{font-size:4em;margin-bottom:20px;animation:pulse 2s infinite}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}.loader-bar{width:300px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;overflow:hidden;margin:20px auto}.loader-progress{height:100%;background:#fff;width:0%;transition:width 0.3s}
</style>
</head>
<body>
<!-- WORLD-CLASS Loader -->
<div id="app-loader"><div class="loader-content"><div class="loader-logo">📊</div><h2>Portfolio Manager Pro</h2><p id="loader-status">Načítání...</p><div class="loader-bar"><div class="loader-progress" id="loader-progress"></div></div></div></div>
EOF

# Add body content
cat /tmp/body.html >> index-working.html

# Add smart loader script before </body>
cat >> index-working.html << 'EOFJS'

<!-- 🚀 WORLD-CLASS Smart Loader -->
<script>
(function(){const m=['error-handler.js','accessibility.js','notification-system.js','command-stack.js','data-validation.js','calculations-engine.js','app.js'];let i=0;function u(t,p){document.getElementById('loader-status').textContent=t;document.getElementById('loader-progress').style.width=p+'%'}function l(s){return new Promise((r,e)=>{const sc=document.createElement('script');sc.src=s;sc.async=false;sc.onload=r;sc.onerror=()=>e(new Error('Failed: '+s));document.head.appendChild(sc)})}async function load(){try{for(const s of m){u('Načítání '+s+'...',(i/m.length)*100);await l(s);i++;console.log('✅ '+s)}u('Hotovo!',100);setTimeout(()=>{document.body.classList.add('app-loaded')},500)}catch(e){console.error('❌',e);u('Chyba!',0)}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',load)}else{load()}})();
</script>
</body>
</html>
EOFJS

echo "✅ index-working.html created"
