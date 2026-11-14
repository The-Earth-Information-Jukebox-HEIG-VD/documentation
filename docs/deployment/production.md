# Production Deployment

Deploy Earth Information Jukebox to a server (VPS) with Docker Compose.

!!! warning "Prerequisite: published images"
    The production setup (`docker-compose.yml` + `docker-compose.prod.yml`) pulls images from GHCR, and **none has
    been published yet**. Cut a release first ([Releasing images](ci-cd.md#releasing-images)), or build on the
    server from the sibling repositories with `docker-compose.local.yml` (see [Docker](docker.md#quick-start-local-build)).

---

## Docker on a VPS

### 1. Prepare the Server

```bash
# Install Docker (includes the compose plugin)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER      # log out and back in

# Clone the deployment repository (private: use an SSH key or token with access to the organization)
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment

# The repositories are private, so their GHCR images are private by default
docker login ghcr.io               # GitHub username + a token with read:packages
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Then edit `.env`:

```bash
TAG=1.0.0                              # pin the release instead of latest
DATA_TAG=1.0.0
WEBAPP_PORT=80
BACKEND_PORT=8000
JUKEBOX_CORS=https://your-domain.com
```

!!! note
    The file must be named `.env`: Compose reads it automatically. If `JUKEBOX_CORS` is not set,
    `docker-compose.prod.yml` falls back to the placeholder `https://earth-jukebox.example.com`.
    The bundled webapp calls the API on the same origin (`/api`, proxied by nginx), so CORS only matters for
    other clients.

### 3. Deploy

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Always pass both files: `docker-compose.prod.yml` only contains overrides (no images). Plain `docker compose up`
would load `docker-compose.override.yml` (development settings) instead.

What the production override adds:

| Service | Limits | Reservations | Logging |
|---------|--------|--------------|---------|
| `backend` | 2 CPUs, 2 GB | 0.5 CPU, 512 MB | `json-file`, 10 MB × 3 |
| `webapp` | 1 CPU, 512 MB | 0.25 CPU, 128 MB | `json-file`, 10 MB × 3 |

### 4. Verify

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl http://localhost:8000/api/health       # backend directly
curl http://localhost/api/health            # through the webapp's nginx
```

On first start the backend converts the datasets in the background; wait until `preparing_data` is `false`.

---

## HTTPS and Exposure

The stack does **not** terminate TLS: the webapp's nginx listens on port 80 only. For a public deployment, put a
reverse proxy with certificates in front of `WEBAPP_PORT` (e.g. a host-level nginx, Caddy or Traefik).

The backend port (`BACKEND_PORT`, default 8000) is also published on the host. The webapp does not need it (it
reaches `backend:8000` on the internal `jukebox-net` network); firewall it if the API should not be public.

---

## Environment Variables

### Compose (`.env`)

| Variable | Description |
|----------|-------------|
| `TAG` | Version of the `webapp` and `sonification` images |
| `DATA_TAG` | Version of the `datasets` image |
| `WEBAPP_PORT` | Host port of the webapp (default 80) |
| `BACKEND_PORT` | Host port of the backend (default 8000) |
| `JUKEBOX_CORS` | Allowed CORS origins, comma-separated |

`JUKEBOX_DATA_DIR` (`/app/data`) and `JUKEBOX_CACHE_DIR` (`/app/cache`) are fixed by the compose file and the
volume mounts; there is no need to set them. The other backend variables are listed in
[Docker → Backend container](docker.md#backend-container).

### Frontend

`VITE_API_URL` is a **build-time** argument of the webapp image (default `/api`), not a runtime variable. Keep the
default so the browser goes through the nginx proxy.

---

## Health Checks

### Backend Health Endpoint

```bash
curl https://your-domain.com/api/health
```

Example response:

```json
{
  "status": "ok",
  "version": "2.1",
  "datasets": 6,
  "data_dir": "/app/data",
  "built_dir": "/app/cache/_datasets",
  "preparing_data": false,
  "merge_datasets": true,
  "full_api": false,
  "audio_rendering": true,
  "mp3_encoding": true,
  "orchestral_samples": false
}
```

### Docker Health Checks

Already defined in `docker-compose.yml`:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
  webapp:
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

The webapp only starts once the backend is healthy.

---

## Updating

```bash
git pull                                   # compose file changes
# bump TAG / DATA_TAG in .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

A new `datasets` image does **not** refresh an existing `jukebox-data` volume (`data-init` skips when
`/data/.initialized` exists). To update the data, remove the volume first or run `./scripts/init-data.sh <tag>`
(see [Docker → Volume Management](docker.md#volume-management)).

---

## Troubleshooting

### Container Won't Start

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps data-init   # must have exited with code 0
```

### Image Pull Denied

Run `docker login ghcr.io` with a token that can read the organization's packages, and check that the tag in `.env`
was actually published.

### Port Already in Use

```bash
lsof -i :80
lsof -i :8000
```

Change `WEBAPP_PORT` / `BACKEND_PORT` in `.env`.

### Out of Memory

The production override caps the backend at 2 GB. Raise `deploy.resources.limits.memory` in
`docker-compose.prod.yml` if audio rendering gets killed.
