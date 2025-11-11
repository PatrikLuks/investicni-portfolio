# Deployment Guide - Investment Portfolio Manager Pro

## Quick Start Deployment

### Prerequisites
- Node.js 18+ (for building)
- Docker & Docker Compose (for containerized deployment)
- HTTPS certificate (for production)
- Environment variables configured

---

## Deployment Methods

### 1. Docker Deployment (Recommended for Production)

#### Build Docker Image
```bash
npm run docker:build
# or
docker build -t portfolio-manager-pro:3.3.1 .
```

#### Push to Registry (Optional)
```bash
# Login to your registry
docker login -u your_username

# Tag image
docker tag portfolio-manager-pro:3.3.1 your-registry/portfolio-manager-pro:3.3.1

# Push
docker push your-registry/portfolio-manager-pro:3.3.1
```

#### Run Container
```bash
npm run docker:run

# or with custom port
docker run -p 8080:80 \
  -e API_BASE_URL=https://api.example.com \
  -e MARKET_DATA_API_KEY=your_key \
  portfolio-manager-pro:3.3.1
```

#### Docker Compose (Full Stack)
```bash
# Start all services
npm run docker:compose

# Stop all services
npm run docker:compose:down

# View logs
docker-compose logs -f
```

### 2. Direct Deployment (Node.js/Static Hosting)

#### Build Production Bundle
```bash
npm run build
# Creates dist/ directory with all optimized assets
```

#### Using Provided Deploy Script
```bash
npm run deploy
# Runs build and executes DEPLOY.sh script
```

#### Manual Static Hosting
```bash
# Copy dist folder to web server
scp -r dist/ user@your-server:/var/www/portfolio-app/

# Configure web server (see nginx.conf for example)
```

#### Node.js Server (if using main.js)
```bash
npm install
npm run build
NODE_ENV=production node main.js
# Application will run on configured port
```

---

## Environment Configuration

### 1. Create .env File
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

### 2. Essential Environment Variables
```bash
# API Configuration
API_BASE_URL=https://api.your-domain.com
API_TIMEOUT=30000

# Market Data (choose your provider)
MARKET_DATA_API_KEY=your_key_here
MARKET_DATA_PROVIDER=finnhub  # or alpha-vantage, iex-cloud, etc.

# Application Settings
NODE_ENV=production
DEFAULT_THEME=elegant-black
DEFAULT_LANGUAGE=cs

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 3. Security Configuration
```bash
# CORS
CORS_ALLOWED_ORIGINS=https://portfolio.example.com

# JWT (if using authentication)
JWT_SECRET=your_very_secure_random_string_here_min_32_chars

# Database
DATABASE_URL=mongodb://user:password@host:port/database
```

---

## Production Web Server Configuration

### Nginx Configuration
The project includes a production-ready nginx configuration at `config/nginx.conf`:

```bash
# Using Docker Compose (includes nginx)
docker-compose up -d

# Manual setup
sudo cp config/nginx.conf /etc/nginx/sites-available/portfolio-app
sudo ln -s /etc/nginx/sites-available/portfolio-app /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Security Headers (already configured in nginx.conf)
- ✅ Strict-Transport-Security (HSTS)
- ✅ Content-Security-Policy (CSP)
- ✅ X-Frame-Options (clickjacking protection)
- ✅ X-Content-Type-Options (MIME sniffing protection)
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### HTTPS/SSL Setup
```bash
# Using Let's Encrypt (Certbot)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d portfolio.example.com

# Update nginx.conf with certificate paths
ssl_certificate /etc/letsencrypt/live/portfolio.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/portfolio.example.com/privkey.pem;

# Reload nginx
sudo systemctl reload nginx
```

---

## Database & Persistence Setup

### Option 1: Browser Local Storage (Default)
No setup required - uses client-side localStorage

### Option 2: Server-Side Storage
```bash
# Set environment variable
STORAGE_TYPE=server

# Implement storage endpoint in your API
# Data structure: POST /api/storage/save, GET /api/storage/load

# MongoDB example setup
docker run -d \
  --name portfolio-db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  -p 27017:27017 \
  mongo:latest
```

---

## Database Backup Strategy

### Daily Backups
```bash
#!/bin/bash
# backup.sh - Run via cron job daily

BACKUP_DIR="/backups/portfolio-db"
DATE=$(date +%Y%m%d_%H%M%S)

# MongoDB backup
mongodump \
  --uri="mongodb://user:password@host:27017/database" \
  --out="$BACKUP_DIR/mongo_$DATE"

# Cloud backup (AWS S3 example)
aws s3 sync "$BACKUP_DIR" s3://your-bucket/backups/

# Keep last 30 days
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} +
```

---

## Monitoring & Error Tracking

### Sentry Setup (Error Tracking)
```bash
# 1. Create account at sentry.io
# 2. Create new project
# 3. Get DSN and set in .env
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

### Application Performance Monitoring
```bash
# Enable in .env
PERFORMANCE_MONITORING=true
ANALYTICS_ENABLED=true
ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
```

### Log Aggregation
```bash
# Using ELK Stack (Elasticsearch, Logstash, Kibana)
# Set in .env
FILE_LOGGING=true
LOG_FILE_PATH=/var/log/portfolio-manager/app.log

# Use logrotate to manage logs
# /etc/logrotate.d/portfolio-manager:
/var/log/portfolio-manager/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## Scaling & Performance

### Horizontal Scaling with Docker
```bash
# Using Docker Swarm or Kubernetes
docker stack deploy -c docker-compose.yml portfolio-app

# Load balancing configuration
# Update docker-compose.yml to include load balancer service
```

### CDN Configuration
```bash
# CloudFlare/AWS CloudFront setup
# Distribute static assets through CDN for better performance

# Update API calls in code:
// Use CDN for static assets
const CDN_URL = process.env.CDN_URL || 'https://cdn.example.com';
```

### Caching Strategy
```bash
# Service Worker caching (already implemented)
SERVICE_WORKER_ENABLED=true
CACHE_STRATEGY=stale-while-revalidate

# HTTP Caching headers (configured in nginx.conf)
# Static assets: 1 year
# HTML: no-cache
# API responses: configurable
```

---

## Health Checks & Monitoring

### Application Health Endpoint
```javascript
// GET /health returns status
{
  "status": "healthy",
  "version": "3.3.1",
  "timestamp": "2025-11-11T10:30:00Z",
  "uptime": 3600
}
```

### Kubernetes Health Probes
```yaml
# deployment.yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build production bundle
        run: npm run build
      
      - name: Build Docker image
        run: npm run docker:build
      
      - name: Push to registry
        run: |
          docker login -u ${{ secrets.DOCKER_USERNAME }} \
            -p ${{ secrets.DOCKER_PASSWORD }}
          docker push portfolio-manager-pro:${{ github.ref_name }}
      
      - name: Deploy to production
        run: |
          ssh user@server "docker pull portfolio-manager-pro:${{ github.ref_name }} && \
            docker-compose -f docker-compose.prod.yml up -d"
```

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://portfolio.example.com/health
# Should return: {"status": "healthy", ...}
```

### 2. Functionality Test
```bash
# Test critical features via API or UI
- Portfolio creation ✅
- Fund entry ✅
- Data persistence ✅
- Theme switching ✅
- API integration ✅
```

### 3. Security Scan
```bash
# Check security headers
curl -I https://portfolio.example.com
# Verify: HSTS, CSP, X-Frame-Options present

# SSL test
openssl s_client -connect portfolio.example.com:443 -tls1_2
```

### 4. Performance Check
```bash
# Lighthouse audit (local)
npm install -g lighthouse
lighthouse https://portfolio.example.com --view

# Monitor real users via Sentry/Analytics
```

---

## Rollback Procedure

### If Issues Occur
```bash
# Docker rollback
docker-compose down
docker pull portfolio-manager-pro:previous-version
docker-compose up -d

# Direct deployment rollback
git checkout previous-release-tag
npm run build
npm run deploy

# Database rollback (if applicable)
mongorestore --uri="mongodb://..." --archive=backup_2025-11-11.archive
```

---

## Maintenance & Updates

### Regular Tasks
- [ ] Check logs daily for errors
- [ ] Review Sentry for exceptions
- [ ] Monitor uptime & performance
- [ ] Update dependencies monthly
- [ ] Review and backup data
- [ ] Test disaster recovery plan quarterly

### Update Process
```bash
# For minor updates
npm install
npm test
npm run build
npm run deploy

# For major updates
- Test thoroughly in staging
- Create database backup
- Plan maintenance window
- Deploy and monitor
- Have rollback plan ready
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs portfolio-app

# Verify environment variables
docker exec portfolio-app printenv | grep API_

# Restart
docker-compose restart portfolio-app
```

#### High Memory Usage
```bash
# Check memory allocation
docker stats portfolio-app

# Increase memory limit in docker-compose.yml
services:
  app:
    mem_limit: 2g
    memswap_limit: 3g
```

#### Database Connection Issues
```bash
# Test connection
docker exec portfolio-app npm run test:db

# Check network
docker network ls
docker network inspect portfolio-app_network
```

---

## Support & Resources

- **Documentation:** https://github.com/PatrikLuks/investicni-portfolio/tree/main/docs
- **Issue Tracker:** https://github.com/PatrikLuks/investicni-portfolio/issues
- **Community Forum:** https://discussions.github.com/...
- **Emergency Support:** support@example.com

---

**Last Updated:** 11. listopadu 2025  
**Version:** 3.3.1  
**Status:** Production Ready ✅
