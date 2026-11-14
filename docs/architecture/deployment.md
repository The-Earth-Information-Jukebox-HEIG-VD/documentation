# Deployment Architecture

How Earth Information Jukebox is containerized and deployed.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Compose                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │    Frontend     │    │    Backend      │    │    Data     │  │
│  │    (React)      │───▶│    (FastAPI)    │───▶│   Volume    │  │
│  │   Port 5173     │    │   Port 8000     │    │             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│          │                      │                               │
│          └──────────────────────┘                               │
│                    │                                             │
│            ┌───────┴───────┐                                    │
│            │    Nginx      │ (production)                       │
│            │   Port 80     │                                    │
│            └───────────────┘                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Docker Compose Configuration

### Development

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
      - ../webapp/src:/app/src  # Hot reload
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
      - ../sonification/backend:/app/backend  # Hot reload

volumes:
  data:
  cache:
```

### Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ../webapp
      dockerfile: Dockerfile.prod
    environment:
      - VITE_API_URL=/api

  backend:
    build:
      context: ../sonification
      dockerfile: Dockerfile.prod
    environment:
      - JUKEBOX_CORS=https://earth-jukebox.example.com
    volumes:
      - data:/data
      - cache:/cache

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

volumes:
  data:
  cache:
```

---

## Dockerfiles

### Frontend Dockerfile

```dockerfile
# webapp/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Backend Dockerfile

```dockerfile
# sonification/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for audio
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Download orchestral samples (optional, makes image larger)
# RUN python music/sampler.py --download

EXPOSE 8000
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Nginx Configuration

```nginx
# nginx.conf
upstream frontend {
    server frontend:80;
}

upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name earth-jukebox.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name earth-jukebox.example.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Increase timeout for audio generation
        proxy_read_timeout 120s;
    }

    # Static files (generated audio)
    location /api/files/ {
        proxy_pass http://backend/api/files/;
        proxy_cache_valid 200 1h;
    }
}
```

---

## Environment Variables

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `JUKEBOX_DATA_DIR` | Path to intensity map data | `simulation/output` |
| `JUKEBOX_CACHE_DIR` | Path to composition cache | `backend/cache` |
| `JUKEBOX_CORS` | CORS allowed origins | `*` |

---

## Volume Mounts

| Volume | Purpose | Size |
|--------|---------|------|
| `data` | Climate intensity maps | ~500 MB |
| `cache` | Generated compositions | Grows over time |

### Data Volume

Contains pre-processed intensity maps:

```
/data/
├── temperature.npz
├── temperature.json
├── precipitation.npz
├── precipitation.json
├── co2.npz
├── co2.json
└── ...
```

### Cache Volume

Contains generated compositions:

```
/cache/
├── 195820c264227acb/
│   ├── score.mid
│   ├── score.mp3
│   ├── score.json
│   └── score_stems/
│       ├── temperature.mid
│       └── ...
└── ...
```

---

## Deployment Platforms

### Vercel (Frontend Only)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.earth-jukebox.com/api/:path*"
    }
  ]
}
```

### Railway/Render (Backend)

```yaml
# railway.toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "uvicorn backend.app:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/api/health"
restartPolicyType = "on_failure"
```

### Kubernetes

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: earth-jukebox-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: earth-jukebox/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: JUKEBOX_DATA_DIR
          value: /data
        volumeMounts:
        - name: data
          mountPath: /data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: climate-data-pvc
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./sonification
          push: true
          tags: ghcr.io/earth-jukebox/backend:latest

      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1
        with:
          service: backend
          token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Health Checks

### Backend Health Endpoint

```python
@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "datasets": count_datasets(),
        "audio_available": check_audio_rendering(),
        "orchestral_samples": check_vsco_available(),
    }
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1
```

---

## Next Steps

- [Docker Deployment Guide](../deployment/docker.md)
- [Production Checklist](../deployment/production.md)
- [CI/CD Setup](../deployment/ci-cd.md)
