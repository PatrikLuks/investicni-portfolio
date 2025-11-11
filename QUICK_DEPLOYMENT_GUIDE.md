# 📋 Investment Portfolio Manager Pro - Production Deployment Checklist

**Project:** Investment Portfolio Manager Pro v3.3.1  
**Status:** ✅ PRODUCTION READY  
**Last Updated:** 11. listopadu 2025

---

## 📋 Quick Deployment Summary

### What You're Deploying
A fully tested, production-verified enterprise portfolio management application with:
- 298 passing tests ✅
- Zero security issues ✅
- WCAG AA accessibility ✅
- Complete documentation ✅
- 40+ optimized bundle chunks ✅

### How Long It Takes
- **Build:** ~15 seconds
- **Setup:** ~30 minutes (first time, includes config)
- **Deployment:** ~10-15 minutes
- **Verification:** ~5 minutes
- **Total:** 60 minutes for complete setup

---

## 🚀 Three Deployment Options

### Option 1: Docker (Recommended - 10 minutes)
```bash
# Build
npm run docker:build

# Run
docker run -p 80:80 \
  -e API_BASE_URL=https://api.example.com \
  -e NODE_ENV=production \
  portfolio-manager-pro:latest

# With Docker Compose (full stack)
npm run docker:compose
```
**Best for:** Cloud deployments, scalability, CI/CD

### Option 2: Static Hosting (5 minutes)
```bash
# Build production bundle
npm run build

# Deploy dist/ folder to your host
# AWS S3, GitHub Pages, Netlify, Vercel, etc.

scp -r dist/* user@server:/var/www/portfolio/
```
**Best for:** Cost-effective, simple hosting, CDN

### Option 3: Node.js Server (10 minutes)
```bash
# Build
npm run build

# Run deploy script
npm run deploy

# Or manually
NODE_ENV=production node main.js
```
**Best for:** Custom setups, existing Node.js infrastructure

---

## ⚙️ Pre-Deployment Checklist

### [ ] 1. Environment Configuration
```bash
# Copy template
cp .env.example .env

# Required settings (minimum)
API_BASE_URL=https://api.your-domain.com
NODE_ENV=production
DEFAULT_THEME=elegant-black
DEFAULT_LANGUAGE=cs

# Optional but recommended
MARKET_DATA_ENABLED=true
MARKET_DATA_PROVIDER=finnhub
MARKET_DATA_API_KEY=your_key_here
```

### [ ] 2. Security Setup
```bash
# HTTPS/SSL Certificates
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d portfolio.example.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://portfolio.example.com

# Security Headers (already in nginx.conf)
# - Strict-Transport-Security
# - Content-Security-Policy
# - X-Frame-Options
```

### [ ] 3. Database Setup (if using server storage)
```bash
# MongoDB example
docker run -d \
  --name portfolio-db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secure_password \
  -p 27017:27017 \
  mongo:latest

# Configure in .env
DATABASE_URL=mongodb://admin:password@localhost:27017/portfolio
STORAGE_TYPE=server
```

### [ ] 4. Build Verification
```bash
# Run all tests
npm test
# Expected: 298/298 passing ✅

# Build production
npm run build
# Expected: ~14 seconds, 0 errors ✅

# Check bundle size
ls -lh dist/assets/js/index*.js
# Expected: ~192 KB ✅
```

### [ ] 5. Monitoring & Logging Setup
```bash
# Sentry error tracking (optional)
SENTRY_DSN=https://key@sentry.io/project
SENTRY_ENVIRONMENT=production

# Application logging
LOG_LEVEL=info
CONSOLE_LOGGING=false
FILE_LOGGING=true
LOG_FILE_PATH=/var/log/portfolio/app.log
```

### [ ] 6. Backup Strategy
```bash
# Create backup directory
mkdir -p /backups/portfolio-db

# Setup daily cron job for backups
# 0 2 * * * /home/user/backup-portfolio.sh

# Test restore procedure
# (before going live)
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Server (First Time Only)
```bash
# SSH to server
ssh user@your-server.com

# Install dependencies
sudo apt-get update
sudo apt-get install -y \
  curl \
  docker.io \
  docker-compose \
  nginx \
  certbot \
  python3-certbot-nginx

# Create application directory
mkdir -p /opt/portfolio-app
cd /opt/portfolio-app
```

### Step 2: Clone & Build
```bash
# Clone repository
git clone https://github.com/PatrikLuks/investicni-portfolio.git .
git checkout v3.3.1

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env  # Edit with your configuration
```

### Step 3: Build Application
```bash
# Production build
npm run build

# Verify build
ls -lh dist/
# Check index.html exists and dist/ has files
```

### Step 4: Deploy (Choose One Method)

#### Docker Deployment
```bash
# Build Docker image
npm run docker:build

# Tag for your registry
docker tag portfolio-manager-pro:latest \
  your-registry/portfolio-manager-pro:3.3.1

# Push to registry
docker push your-registry/portfolio-manager-pro:3.3.1

# Run container
docker run -d \
  --name portfolio \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -e API_BASE_URL=https://api.example.com \
  -e NODE_ENV=production \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  your-registry/portfolio-manager-pro:3.3.1

# Check status
docker ps | grep portfolio
docker logs portfolio
```

#### Static Hosting Deployment
```bash
# Copy to web server
sudo cp -r dist/* /var/www/portfolio/

# Set permissions
sudo chown -R www-data:www-data /var/www/portfolio

# Configure nginx
sudo cp config/nginx.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio \
  /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### Direct Node.js Deployment
```bash
# Build
npm run build

# Create systemd service
sudo nano /etc/systemd/system/portfolio.service
```
```ini
[Unit]
Description=Portfolio Manager Pro
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/portfolio-app
EnvironmentFile=/opt/portfolio-app/.env
ExecStart=/usr/bin/node main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```
```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable portfolio
sudo systemctl start portfolio
sudo systemctl status portfolio
```

### Step 5: Verify Deployment
```bash
# Check health endpoint
curl https://portfolio.example.com/health
# Should return: {"status":"healthy",...}

# Check application loads
curl -I https://portfolio.example.com
# Should return: HTTP/2 200 OK

# Check security headers
curl -I https://portfolio.example.com | grep -E 'Strict-Transport|Content-Security|X-Frame'
# Should show HSTS, CSP, X-Frame-Options headers

# Check logs for errors
docker logs portfolio  # Docker
sudo journalctl -u portfolio -n 50  # Systemd
tail -f /var/log/portfolio/app.log  # File logging
```

### Step 6: Run Smoke Tests
```bash
# Test critical features manually or via script

# 1. Homepage loads
curl https://portfolio.example.com | grep -q "Portfolio Manager"

# 2. Portfolio creation works (via API if applicable)
curl -X POST https://api.example.com/portfolios \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# 3. Static assets load
curl -I https://portfolio.example.com/assets/css/index*.css | grep -q "200"

# 4. Service worker registered
curl -I https://portfolio.example.com/sw.js | grep -q "200"
```

---

## 📊 Post-Deployment Verification

### [ ] Health Checks
- [ ] Application responds to requests
- [ ] No 500 errors in logs
- [ ] Database connected (if applicable)
- [ ] API endpoints responding
- [ ] Static assets loading (CSS, JS)

### [ ] Functionality Tests
- [ ] Homepage loads correctly
- [ ] Theme switching works (4 themes)
- [ ] Portfolio creation possible
- [ ] Calculations working
- [ ] Data persists (localStorage or DB)
- [ ] Responsive design works on mobile

### [ ] Security Verification
- [ ] HTTPS/SSL working
- [ ] Security headers present
- [ ] No sensitive data in logs
- [ ] CORS whitelist correct
- [ ] Rate limiting active (if configured)

### [ ] Performance Checks
- [ ] Page load < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No console errors
- [ ] Bundle loading efficiently
- [ ] Service worker caching

### [ ] Monitoring Setup
- [ ] Error tracking active (Sentry)
- [ ] Logs being collected
- [ ] Alerts configured
- [ ] Metrics being tracked
- [ ] Backups running

---

## 🔄 If Issues Occur

### Application Won't Start
```bash
# Check logs
docker logs portfolio  # Docker
sudo journalctl -u portfolio  # Systemd
tail /var/log/portfolio/app.log  # Files

# Verify environment variables
env | grep -E 'API_BASE|NODE_ENV|DATABASE'

# Check port availability
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Restart
docker restart portfolio  # Docker
sudo systemctl restart portfolio  # Systemd
```

### High Error Rate
```bash
# Check recent logs
docker logs --tail 100 portfolio

# Check error tracking
# Login to Sentry dashboard
# https://sentry.io/

# Rollback to previous version
git checkout previous-version-tag
npm run build
# Redeploy
```

### Database Connection Issues
```bash
# Test connection
docker exec portfolio-db mongosh --authenticationDatabase admin

# Verify connection string in .env
cat .env | grep DATABASE_URL

# Check network
docker network ls
docker network inspect portfolio_network
```

### Performance Issues
```bash
# Check resource usage
docker stats portfolio

# Increase memory limit in docker-compose.yml
services:
  app:
    mem_limit: 2g

# Check for memory leaks in logs
docker logs portfolio | grep -i "memory\|leak\|gc"

# Profile application
# Add NODE_OPTIONS=--inspect in .env
```

---

## 🔐 Post-Deployment Security

### [ ] Change Default Credentials
- [ ] Database password changed
- [ ] API keys rotated
- [ ] JWT secrets set securely
- [ ] Admin accounts configured

### [ ] Security Headers Verified
```bash
# Check headers
curl -I https://portfolio.example.com

# Should include:
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
```

### [ ] Monitoring Active
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring active
- [ ] Log aggregation working
- [ ] Alerts configured

### [ ] Backup Verification
- [ ] Daily backups running
- [ ] Restore procedure tested
- [ ] Off-site backup configured
- [ ] Backup retention policy set

---

## 📈 Scaling Considerations

### If Traffic Increases

#### Docker Swarm / Kubernetes
```bash
# Scale containers
docker service scale portfolio=3

# Or use Kubernetes
kubectl scale deployment portfolio --replicas=3
```

#### Load Balancing
```bash
# Using nginx reverse proxy
# Update docker-compose.yml to include load balancer service
```

#### Database Scaling
```bash
# Separate database from application
# Use managed database service (AWS RDS, MongoDB Atlas)
# Configure read replicas for scaling
```

#### CDN Configuration
```bash
# CloudFront / Cloudflare
# Serve static assets from CDN
# Configure caching headers
```

---

## 🗓️ Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review Sentry alerts

### Weekly
- [ ] Review performance metrics
- [ ] Check backup completion
- [ ] Scan for security updates

### Monthly
- [ ] Review user feedback
- [ ] Update dependencies
- [ ] Run security scan
- [ ] Test disaster recovery

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Disaster recovery drill

---

## 📚 Important Resources

| Document | Purpose |
|----------|---------|
| PRODUCTION_READINESS_CHECKLIST.md | Pre-deployment verification |
| DEPLOYMENT_GUIDE.md | Detailed deployment procedures |
| RELEASE_NOTES_v3.3.1.md | Version information |
| EXECUTIVE_SUMMARY.md | Management overview |
| docs/DEVELOPER_GUIDE.md | Development setup |
| docs/PROJECT_STRUCTURE.md | Architecture overview |

---

## 🎯 Success Criteria

Your deployment is successful when:
✅ Application accessible at https://your-domain.com  
✅ All 4 themes working  
✅ Portfolio creation/management functioning  
✅ No critical errors in logs  
✅ SSL certificate valid  
✅ Security headers present  
✅ < 3 second page load time  
✅ Monitoring active  

---

## 💬 Support

**Need help?**
- Read: DEPLOYMENT_GUIDE.md (troubleshooting section)
- Check: docs/FAQ.md (if available)
- Review: logs and error tracking

**Found issues?**
- Create issue: https://github.com/PatrikLuks/investicni-portfolio/issues
- Security issue: security@example.com

---

**Investment Portfolio Manager Pro v3.3.1**  
**Status:** ✅ Ready to Deploy  
**Date:** 11. listopadu 2025

**Good luck with your deployment! 🚀**
