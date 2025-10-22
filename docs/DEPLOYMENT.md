# 🚀 Deployment Guide

This guide covers deploying the Slack + Jira Clone application to various platforms.

## 📋 Prerequisites

### Required Services
- **PostgreSQL Database** (production-ready)
- **Domain/Subdomain** for your application
- **SSL Certificate** (for HTTPS)
- **Environment Variables** configured

### Production Checklist
- [ ] Database connection string configured
- [ ] NextAuth secrets set
- [ ] Environment variables secured
- [ ] SSL certificate installed
- [ ] Domain DNS configured

## 🐳 Docker Deployment

### 1. Dockerfile Configuration
The project includes a production-ready Dockerfile:

```dockerfile
FROM node:18-alpine AS base
# ... (see Dockerfile for full configuration)
```

### 2. Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/slack_jira_clone
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=slack_jira_clone
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Vercel Deployment

### 1. Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 2. Environment Variables
Set these in Vercel dashboard:
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

### 3. Database Setup
- Use **Vercel Postgres** or external PostgreSQL
- Run migrations: `npx prisma db push`
- Seed data: `npx prisma db seed`

## 🌐 Netlify Deployment

### 1. Build Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

### 2. Environment Variables
Set in Netlify dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### 3. Deploy
```bash
# Build locally
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## 🐧 VPS Deployment

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Application Setup
```bash
# Clone repository
git clone <repository-url>
cd slack-jira-clone

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "slack-jira-clone" -- start
pm2 save
pm2 startup
```

### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/slack-jira-clone
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗄️ Database Setup

### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE slack_jira_clone;

-- Create user
CREATE USER app_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE slack_jira_clone TO app_user;
```

### Prisma Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with initial data
npx prisma db seed
```

## 🔐 Security Configuration

### Environment Variables
```bash
# Production environment
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-very-secure-secret-key"
NODE_ENV="production"
```

### Security Headers
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

## 📊 Monitoring and Logging

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs slack-jira-clone

# Restart application
pm2 restart slack-jira-clone
```

### Database Monitoring
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

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
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/app
            git pull origin main
            npm ci
            npm run build
            pm2 restart slack-jira-clone
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### 2. Database Connection
```bash
# Test database connection
npx prisma db push
npx prisma studio
```

#### 3. Authentication Issues
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and localStorage

#### 4. Performance Issues
```bash
# Monitor application
pm2 monit

# Check memory usage
pm2 list

# Restart if needed
pm2 restart slack-jira-clone
```

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
npx prisma db push --accept-data-loss
```

## 📈 Performance Optimization

### Production Optimizations
- **CDN**: Use CloudFlare or AWS CloudFront
- **Caching**: Implement Redis for session storage
- **Database**: Use connection pooling
- **Images**: Optimize with Next.js Image component

### Monitoring Tools
- **Uptime**: UptimeRobot or Pingdom
- **Performance**: Google PageSpeed Insights
- **Errors**: Sentry for error tracking
- **Analytics**: Google Analytics

## 🔄 Backup Strategy

### Database Backups
```bash
# Create backup
pg_dump slack_jira_clone > backup_$(date +%Y%m%d).sql

# Restore backup
psql slack_jira_clone < backup_20240101.sql
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * pg_dump slack_jira_clone > /backups/backup_$(date +\%Y\%m\%d).sql
```

---

**Your application is now ready for production! 🚀**