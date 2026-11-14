# Production Deployment

Deploy Earth Information Jukebox to a VPS using Docker.

---

## Docker on VPS

### 1. Prepare the Server

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone deployment repository
git clone https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment
```

### 2. Configure Environment

```bash
# Create production environment file
cat > .env.production << EOF
JUKEBOX_CORS=https://your-domain.com
JUKEBOX_DATA_DIR=/data
JUKEBOX_CACHE_DIR=/cache
EOF
```

### 3. Deploy

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4. Verify

```bash
# Check services are running
docker compose ps

# Test health endpoint
curl http://localhost:8000/api/health
```

---

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `JUKEBOX_CORS` | Allowed CORS origins (your domain) |
| `JUKEBOX_DATA_DIR` | Climate data directory |
| `JUKEBOX_CACHE_DIR` | Cache directory |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

---

## Health Checks

### Backend Health Endpoint

```bash
curl https://your-domain.com/api/health
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
```

---

## Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Container Won't Start

```bash
docker compose logs backend
```

### Port Already in Use

```bash
lsof -i :8000
```

### Out of Memory

Increase Docker memory limit or add resource constraints:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```
