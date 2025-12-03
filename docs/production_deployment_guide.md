# Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the AI Task Manager application to production.

## Prerequisites
- Docker and Docker Compose installed
- Domain name configured and pointing to your server
- SSL certificate (Let's Encrypt or purchased)
- Server with at least 2GB RAM and 2 CPU cores
- PostgreSQL database (version 12+)

## 1. Server Preparation

### 1.1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2. Install Docker and Docker Compose
```bash
# Install Docker
sudo apt install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
```

### 1.3. Configure Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001
sudo ufw enable
```

## 2. Repository Setup

### 2.1. Clone the Repository
```bash
git clone https://github.com/your-org/ai-task-manager.git
cd ai-task-manager
```

### 2.2. Checkout Production Branch
```bash
git checkout main  # or your production branch
```

## 3. Environment Configuration

### 3.1. Create Production Environment File
```bash
cp .env.production .env
```

### 3.2. Edit Environment Variables
```bash
nano .env
```

Required environment variables:
```bash
# Database password - generate a strong one
DB_PASSWORD=your-very-secure-password-here-32+chars

# JWT secret - generate a 256-bit key
JWT_SECRET=your-super-long-and-secure-jwt-secret-key-here

# API URL for frontend (update to your domain)
VITE_API_URL=https://yourdomain.com/api/v1
API_URL=https://yourdomain.com/api/v1

# Database URL (will be auto-generated for Docker)
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/aitaskmanager?schema=public
```

### 3.3. Generate Strong Secrets
```bash
# Generate DB password (at least 16 characters)
openssl rand -base64 24

# Generate JWT secret (at least 32 characters)
openssl rand -hex 32
```

## 4. SSL Certificate Setup

### 4.1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

### 4.2. Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

## 5. Nginx Configuration

### 5.1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/ai-task-manager
```

Configuration file:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (serves static React app)
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API requests
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect www to non-www (optional)
server {
    if ($host = www.yourdomain.com) {
        return 301 https://yourdomain.com$request_uri;
    }
    listen 80;
    server_name www.yourdomain.com;
    return 404;
}
```

### 5.2. Enable Nginx Configuration
```bash
sudo ln -s /etc/nginx/sites-available/ai-task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Database Migration

### 6.1. Build and Start Services
```bash
docker-compose -f docker-compose.prod.yml up --build -d db
```

### 6.2. Wait for Database to be Ready
```bash
# Wait for database to be ready (should show healthy)
docker-compose -f docker-compose.prod.yml ps
```

### 6.3. Run Initial Migration
```bash
# Enter the backend container
docker-compose -f docker-compose.prod.yml exec backend sh

# Inside the container, run the migration
npx prisma migrate deploy
npx prisma db seed # if you have seed data

# Exit container
exit
```

## 7. Production Deployment

### 7.1. Build and Deploy
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### 7.2. Verify Services are Running
```bash
docker-compose -f docker-compose.prod.yml ps
```

All services should show "Up" status.

### 7.3. Check Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## 8. Post-Deployment Verification

### 8.1. Test Health Endpoints
```bash
curl https://yourdomain.com/health
curl https://yourdomain.com/api/v1/health
```

### 8.2. Verify Database Connection
Check backend logs for any database connection errors:
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### 8.3. Test Application
1. Navigate to `https://yourdomain.com`
2. Verify signup/login works
3. Test creating and managing tasks
4. Check analytics dashboard loads
5. Verify timeline shows events

## 9. Security Hardening

### 9.1. Configure Firewall Rules
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 'Nginx Full'
```

### 9.2. Monitor for Security Updates
```bash
# Regularly update the system
sudo apt update && sudo apt upgrade -y
```

## 10. Monitoring and Maintenance

### 10.1. Docker Container Monitoring
```bash
# View container stats
docker stats

# View logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

### 10.2. Backup Strategy
```bash
# Create backup script
sudo nano /root/backup-db.sh
```

Backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Create database dump
docker-compose -f /path/to/your/app/docker-compose.prod.yml exec db pg_dump -U postgres aitaskmanager > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Optional: Upload to cloud storage, remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Make it executable and add to cron:
```bash
chmod +x /root/backup-db.sh

# Add to crontab (for daily backup at 2 AM)
sudo crontab -e
# Add line: 0 2 * * * /root/backup-db.sh
```

## 11. Rollback Plan

If there are issues with the deployment:

### 11.1. Stop Current Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### 11.2. Check Out Previous Version
```bash
git checkout <previous-stable-commit-hash>
```

### 11.3. Redeploy
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## 12. Troubleshooting

### 12.1. Common Issues

**Issue**: Database connection errors
**Solution**: Verify DATABASE_URL is correct and DB is running
```bash
docker-compose -f docker-compose.prod.yml logs db
```

**Issue**: Frontend not loading
**Solution**: Check Nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
```

**Issue**: SSL certificate errors
**Solution**: Renew certificate if expired
```bash
sudo certbot renew --dry-run
```

## 13. Performance Optimization

### 13.1. Database Indexes
Ensure proper indexes exist for frequently queried fields:
- `userId` in tasks table
- `status` in tasks table
- `timestamp` in events table

### 13.2. Docker Resources
Optimize resource limits in docker-compose.prod.yml:
```yaml
backend:
  # ... other config
  deploy:
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

## 14. Scaling Recommendations

- For increased traffic, consider horizontal scaling with load balancer
- Database read replicas for read-heavy workloads
- CDN for frontend assets
- Separate database server as user base grows