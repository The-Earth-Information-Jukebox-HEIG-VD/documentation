# Docker Deployment

Deploy Earth Information Jukebox using Docker Compose.

---

## Prerequisites

- Docker 24.x or later
- Docker Compose 2.x or later
- 2GB RAM minimum
- 5GB disk space

---

## Quick Start

```bash
# Clone deployment repository
git clone https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Docker Compose Configuration

### Development Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ../webapp
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000
    volumes:
      - ../webapp/src:/app/src
    depends_on:
      - backend

  backend:
    build:
      context: ../sonification
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - JUKEBOX_DATA_DIR=/data
      - JUKEBOX_CACHE_DIR=/cache
      - JUKEBOX_CORS=*
    volumes:
      - data:/data
      - cache:/cache

volumes:
  data:
  cache:
```

### Production Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ../webapp
      dockerfile: Dockerfile.prod
    restart: unless-stopped

  backend:
    build:
      context: ../sonification
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - JUKEBOX_CORS=https://your-domain.com
    volumes:
      - data:/data
      - cache:/cache
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  data:
  cache:
```

---

## Building Images

### Build All Services

```bash
docker compose build
```

### Build Specific Service

```bash
docker compose build backend
docker compose build frontend
```

### Build with No Cache

```bash
docker compose build --no-cache
```

---

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `JUKEBOX_DATA_DIR` | `/data` | Climate data directory |
| `JUKEBOX_CACHE_DIR` | `/cache` | Cache directory |
| `JUKEBOX_CORS` | `*` | Allowed CORS origins |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

---

## Volume Management

### Data Volume

Contains pre-processed climate data (~500MB).

```bash
# Create and populate data volume
docker volume create earth-jukebox-data

# Copy data into volume
docker run --rm -v earth-jukebox-data:/data -v $(pwd)/data:/source alpine \
  cp -r /source/* /data/
```

### Cache Volume

Stores generated compositions. Can be safely cleared.

```bash
# Clear cache
docker volume rm earth-jukebox-cache
```

---

## Orchestral Samples

For high-quality audio, download VSCO samples:

```bash
# Run once to download samples
docker compose run --rm backend python music/sampler.py --download
```

This downloads ~440MB of orchestral samples.

---

## Logs and Monitoring

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Container Status

```bash
docker compose ps
```

### Resource Usage

```bash
docker stats
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs backend

# Rebuild
docker compose build --no-cache backend
docker compose up -d backend
```

### Port Already in Use

```bash
# Find process using port
lsof -i :8000

# Use different ports
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

### Out of Memory

Increase Docker memory limit in Docker Desktop settings, or use:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Permission Issues

```bash
# Fix volume permissions
docker compose run --rm backend chown -R 1000:1000 /data /cache
```

---

## Updating

### Pull Latest Images

```bash
docker compose pull
docker compose up -d
```

### Rebuild from Source

```bash
git pull
docker compose build
docker compose up -d
```

---

## Cleanup

### Remove Containers

```bash
docker compose down
```

### Remove Containers and Volumes

```bash
docker compose down -v
```

### Remove All (including images)

```bash
docker compose down -v --rmi all
```

---

## Next Steps

- [Production Deployment](production.md)
- [CI/CD Setup](ci-cd.md)
