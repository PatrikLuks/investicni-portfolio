# 🚀 DEPLOYMENT GUIDE - Portfolio Manager Pro v3.3.0

**Last Updated:** 1. listopadu 2025  
**Version:** 3.3.0  
**Status:** Production Ready ✅

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Prerequisites
- [x] Node.js v20.19.5+
- [x] npm 11.6.2+
- [x] Git configured
- [x] GitHub account (for releases)
- [x] Deployment platform account (Netlify/Vercel/Cloudflare)
- [x] Environment variables configured
- [x] SSL certificate ready
- [x] CDN configured (optional but recommended)

### Verification Steps
```bash
# 1. Clone repository
git clone https://github.com/PatrikLuks/investicni-portfolio.git
cd investicni-portfolio

# 2. Install dependencies
npm install

# 3. Run all tests
npm run test
npm run test:e2e

# 4. Build production
npm run build

# 5. Verify build
npm run preview
```

---

## 🌐 DEPLOYMENT OPTIONS

### Option 1: Netlify (RECOMMENDED) ⭐

**Advantages:**
- Free tier with generous limits
- Automatic HTTPS/SSL
- CDN included
- Git integration
- Serverless functions support
- Analytics included

**Setup:**

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build production
npm run build

# 3. Connect to Netlify
netlify init

# 4. Deploy
netlify deploy --prod

# 5. View live site
netlify open site
```

**netlify.toml Configuration:**
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20.19.5"
  NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Option 2: Vercel

**Advantages:**
- Excellent performance
- Automatic previews
- API Routes support
- Edge Functions
- Analytics

**Setup:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build production
npm run build

# 3. Deploy
vercel --prod

# 4. View live site
vercel open
```

**vercel.json Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production",
    "NODE_VERSION": "20.19.5"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/:path((?!_next).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Option 3: Cloudflare Pages

**Advantages:**
- Ultra-fast global CDN
- Free tier
- Workers support
- DDoS protection
- Edge caching

**Setup:**

```bash
# 1. Install Wrangler CLI
npm install -g @cloudflare/wrangler

# 2. Build production
npm run build

# 3. Deploy
wrangler pages deploy dist/

# 4. View deployment status
wrangler deployments list
```

**wrangler.toml Configuration:**
```toml
name = "portfolio-manager"
type = "javascript"
main = "dist/index.html"
compatibility_date = "2024-01-01"

[env.production]
account_id = "YOUR_ACCOUNT_ID"
project_name = "portfolio-manager-prod"

[[routes]]
pattern = "/*"
zone_name = "example.com"

[build]
command = "npm run build"
cwd = "./"
watch_paths = ["src/**/*.{js,css,html}"]
```

---

### Option 4: GitHub Pages

**Advantages:**
- Free tier
- Integrated with GitHub
- Static site only
- Automatic HTTPS

**Setup:**

```bash
# 1. Update package.json
# Add: "homepage": "https://yourusername.github.io/investicni-portfolio"

# 2. Build production
npm run build

# 3. Deploy to gh-pages branch
npm run build && git add dist/ && git commit -m "Deploy v3.3.0" && git push origin $(git rev-parse --abbrev-ref HEAD):gh-pages

# Alternative: Use actions
# GitHub Actions workflow in .github/workflows/deploy.yml
```

**GitHub Actions Workflow:**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

### Option 5: Docker (Self-Hosted) 🐳

**Advantages:**
- Full control
- Can self-host
- Container orchestration support
- Scalable

**Setup:**

```bash
# 1. Build Docker image
docker build -t portfolio-manager-pro:3.3.0 .

# 2. Run container
docker run -d -p 80:80 --name portfolio-manager portfolio-manager-pro:3.3.0

# 3. View logs
docker logs -f portfolio-manager

# 4. Stop container
docker stop portfolio-manager
```

**Dockerfile (already exists):**
```dockerfile
FROM node:20.19.5-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  portfolio-manager:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    environment:
      NODE_ENV: production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped
```

---

### Option 6: AWS (Advanced)

**Services:**
- S3 for storage
- CloudFront for CDN
- Route 53 for DNS
- Certificate Manager for SSL

**Setup:**

```bash
# 1. Install AWS CLI
pip install awscli

# 2. Build
npm run build

# 3. Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# 4. Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## 🔧 ENVIRONMENT VARIABLES

### Required Variables
```bash
# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Market Data APIs
VITE_ALPHA_VANTAGE_API_KEY=your-api-key
VITE_FINNHUB_API_KEY=your-api-key
VITE_CORS_PROXY=https://cors-proxy.example.com

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Environment
VITE_API_BASE_URL=https://api.example.com
VITE_ENVIRONMENT=production
```

### Setting Variables

**Netlify:**
```bash
netlify env:set VITE_FIREBASE_API_KEY "your-api-key"
netlify env:set VITE_ALPHA_VANTAGE_API_KEY "your-api-key"
```

**Vercel:**
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_ALPHA_VANTAGE_API_KEY
```

**Cloudflare Pages:**
```bash
wrangler secret put VITE_FIREBASE_API_KEY
wrangler secret put VITE_ALPHA_VANTAGE_API_KEY
```

**.env.production (Local):**
```bash
cp .env.example .env.production
# Edit .env.production with your values
npm run build
```

---

## 📊 PERFORMANCE OPTIMIZATION

### CDN Configuration

**Caching Strategy:**
```
/index.html → 1 hour (max-age=3600)
/assets/* → 1 year (max-age=31536000)
/api/* → 5 minutes (max-age=300)
```

**Compression:**
- Enable Gzip (default)
- Enable Brotli (if supported)
- Minify CSS/JS/HTML

**Headers for Performance:**
```
Cache-Control: public, max-age=31536000, immutable
Vary: Accept-Encoding
ETag: (auto-generated)
```

### Service Worker Caching

Automatically enabled in production. Caches:
- Static assets (CSS, JS, fonts)
- API responses
- Images
- Fonts

Offline pages will load from cache if network unavailable.

---

## 🔐 SECURITY CONFIGURATION

### SSL/TLS Certificate
- All deployments use HTTPS by default
- Certificate auto-renewal enabled
- TLS 1.2+ required

### Security Headers (Auto-Applied)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Content-Security-Policy: (see config)
```

### CORS Configuration
```javascript
// Only these origins allowed
'https://investicni-portfolio.cz',
'https://www.investicni-portfolio.cz',
'https://api.investicni-portfolio.cz'
```

### Rate Limiting
- 100 requests per minute per IP
- API key authentication required
- Automatic throttling

---

## 📈 MONITORING & MAINTENANCE

### Health Checks
```bash
# Check status
curl https://investicni-portfolio.cz/health

# Check API
curl https://api.investicni-portfolio.cz/status
```

### Logs
- Netlify: Logs in dashboard
- Vercel: Logs in dashboard
- CloudFlare: Logs in dash
- Docker: `docker logs container-name`

### Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Rebuild and redeploy
npm run build
# Then redeploy using your platform
```

### Monitoring Tools
- **Sentry** - Error tracking
- **Datadog** - Performance monitoring
- **Google Analytics** - User analytics
- **Lighthouse** - Performance audits

---

## 🆘 TROUBLESHOOTING

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### CORS Errors
- Check CORS proxy configuration
- Verify API endpoints
- Check browser console for details

### Performance Issues
- Check CDN caching
- Verify compression enabled
- Review Service Worker cache
- Check API response times

### Authentication Issues
- Verify Firebase config
- Check environment variables
- Verify security rules
- Check browser storage

---

## 📞 POST-DEPLOYMENT

### Verification
- [ ] Site loads in browser
- [ ] All features working
- [ ] Performance acceptable
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] Logs show no errors
- [ ] Analytics tracking
- [ ] CDN caching working

### Communication
- [ ] Update website
- [ ] Notify users
- [ ] Update documentation
- [ ] Social media announcement
- [ ] Email newsletter
- [ ] GitHub release

### Monitoring (24h Post-Deploy)
- Monitor error rates
- Monitor performance metrics
- Monitor user feedback
- Monitor analytics
- Prepare rollback plan

---

## 🔄 ROLLBACK PROCEDURE

If critical issue discovered:

```bash
# Netlify
netlify deployments list
netlify rollback

# Vercel
vercel rollback

# GitHub Actions
# Re-run previous successful deployment

# Docker
docker stop portfolio-manager
docker run -d -p 80:80 portfolio-manager-pro:3.2.1
```

---

## ✅ SUCCESS CRITERIA

Deployment successful if:
- ✅ Site accessible from all regions
- ✅ HTTPS working
- ✅ All features functional
- ✅ Performance score > 85
- ✅ Zero critical errors
- ✅ Security headers present
- ✅ Analytics tracking
- ✅ CDN caching active

---

## 📋 SIGN-OFF

**Release Version:** v3.3.0  
**Deployment Date:** 1. listopadu 2025  
**Deployed By:** GitHub Copilot  
**Status:** ✅ READY FOR PRODUCTION  

**Contact:** support@investicni-portfolio.cz
