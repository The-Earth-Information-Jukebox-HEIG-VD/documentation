# Production Deployment

Checklist and guide for deploying to production.

---

## Pre-Deployment Checklist

### Security

- [ ] CORS configured for specific domains only
- [ ] HTTPS enabled with valid certificates
- [ ] Environment variables not hardcoded
- [ ] No debug mode in production
- [ ] Rate limiting configured

### Performance

- [ ] Production builds (minified, optimized)
- [ ] Caching headers configured
- [ ] CDN configured for static assets
- [ ] Database/cache warm-up complete

### Monitoring

- [ ] Health checks configured
- [ ] Logging enabled
- [ ] Error tracking (Sentry, etc.)
- [ ] Uptime monitoring

### Backup

- [ ] Data volume backup configured
- [ ] Disaster recovery plan documented

---

## Deployment Options

### Option 1: Docker on VPS

Recommended for full control.

```bash
# On server
git clone https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment
docker compose -f docker-compose.prod.yml up -d
```

### Option 2: Platform as a Service

#### Frontend: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd webapp
vercel --prod
```

#### Backend: Railway/Render

Configure via web dashboard or CLI.

### Option 3: Kubernetes

For high availability and scaling.

```bash
kubectl apply -f k8s/
```

---

## Nginx Configuration

### Basic Configuration

```nginx
server {
    listen 80;
    server_name earth-jukebox.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name earth-jukebox.example.com;

    ssl_certificate /etc/letsencrypt/live/earth-jukebox.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/earth-jukebox.example.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }

    # Static files caching
    location /api/files/ {
        proxy_pass http://backend:8000/api/files/;
        proxy_cache_valid 200 1h;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d earth-jukebox.example.com

# Auto-renewal
certbot renew --dry-run
```

---

## Environment Configuration

### Production Variables

```bash
# .env.production
JUKEBOX_CORS=https://earth-jukebox.example.com
JUKEBOX_DATA_DIR=/data
JUKEBOX_CACHE_DIR=/cache
```

### Frontend Build

```bash
# Build with production API URL
VITE_API_URL=https://earth-jukebox.example.com npm run build
```

---

## Health Checks

### Backend Health Endpoint

```bash
curl https://earth-jukebox.example.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "datasets": 3,
  "audio_available": true
}
```

### Docker Health Check

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

---

## Logging

### Structured Logging

```python
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
        })

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.getLogger().addHandler(handler)
```

### Log Aggregation

Send logs to centralized service:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Monitoring

### Prometheus Metrics

Add metrics endpoint:

```python
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter('requests_total', 'Total requests', ['endpoint', 'method'])
REQUEST_LATENCY = Histogram('request_latency_seconds', 'Request latency', ['endpoint'])

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- Better Uptime

Configure to check `/api/health` endpoint.

---

## Scaling

### Horizontal Scaling

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing

Nginx upstream configuration:

```nginx
upstream backend {
    least_conn;
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}
```

---

## Backup Strategy

### Data Volume Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
docker run --rm \
  -v earth-jukebox-data:/data \
  -v /backups:/backups \
  alpine tar czf /backups/data-$DATE.tar.gz /data
```

### Restore

```bash
docker run --rm \
  -v earth-jukebox-data:/data \
  -v /backups:/backups \
  alpine tar xzf /backups/data-20240315.tar.gz -C /
```

---

## Rollback Plan

### Quick Rollback

```bash
# Tag current version before deploying
docker tag earth-jukebox/backend:latest earth-jukebox/backend:prev

# Deploy new version
docker compose up -d

# If issues, rollback
docker tag earth-jukebox/backend:prev earth-jukebox/backend:latest
docker compose up -d
```

### Version Tags

Use semantic versioning:

```bash
docker tag earth-jukebox/backend:latest earth-jukebox/backend:v1.2.3
```

---

## Performance Optimization

### Frontend

- Enable gzip compression
- Use CDN for static assets
- Implement service worker for caching

### Backend

- Enable response compression
- Use Redis for session caching
- Pre-generate common compositions

### Caching Headers

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Security Hardening

### HTTP Security Headers

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://backend:8000/api/;
}
```

---

## Next Steps

- [CI/CD Setup](ci-cd.md)
- [Docker Guide](docker.md)
