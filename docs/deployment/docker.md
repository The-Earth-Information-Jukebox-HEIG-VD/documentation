# Docker Deployment

Deploy EarthChestra (the Earth Information Jukebox project's app) using Docker Compose. Everything lives in the
[`deployment`](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment) repository.

---

## Prerequisites

- Docker with the Compose v2 plugin (`docker compose`, not `docker-compose`)
- The sibling repositories checked out next to `deployment/` (for the local build, see below)
- About 2 GB RAM for the backend (the production override caps it at 2 GB)
- Disk space: the raw datasets are ~9.1 GB (`datasets/data`, `du -sh`), the backend image ~1 GB, plus the converted datasets in the cache volume

!!! info "Published images"
    `docker-compose.yml` pulls `ghcr.io/the-earth-information-jukebox-heig-vd/{datasets,sonification,webapp}`, each at its own version (`DATASETS_VERSION`, `SONIFICATION_VERSION`, `WEBAPP_VERSION`; default `latest`).
    Images are published by the `v*` tag workflows (see [CI/CD](ci-cd.md#releasing-images)); the latest release is
    `v1.4.0` in `webapp`, `sonification` and `datasets`, pulled as `1.4.0` (the version
    variables take the Git tag **without** the `v`).
    The repositories are private, so run `docker login ghcr.io` first. To run from the sibling checkouts instead,
    use the **local build** below.

---

## Quick Start (local build)

Build the images from the sibling repositories and mount the datasets checkout directly (no registry access needed). With the published images, `cp .env.example .env && docker login ghcr.io && docker compose up -d` is enough.

```bash
# All repositories side by side
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/webapp.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/sonification.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/datasets.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment

# Build + start, waits until the services are healthy
./scripts/run-local.sh            # same as: ./scripts/run-local.sh up

./scripts/run-local.sh logs       # follow the logs
./scripts/run-local.sh rebuild    # rebuild without cache, then restart
./scripts/run-local.sh down       # stop
```

`run-local.sh` checks that `../webapp`, `../sonification` and `../datasets/data` exist, copies `.env.example`
to `.env` if needed (it must set `VITE_API_URL`, `/api` in the example), and runs:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build --wait
```

Services:

- Webapp: http://localhost (`WEBAPP_PORT`, default 80)
- Backend API: http://localhost:8000 (`BACKEND_PORT`, default 8000)
- API health: http://localhost:8000/api/health
- API docs: http://localhost:8000/docs (lists only the frontend's calls, see [`JUKEBOX_FULL_API`](#backend-container))

!!! info "First start"
    On the first start the backend converts the raw datasets into its cache volume, in the background. The API
    answers at once, but `GET /api/health` reports `"preparing_data": true` until the conversion is done (a few
    minutes). Later starts only rebuild what changed.

---

## Docker Compose Files

| File | Loaded | Purpose |
|------|--------|---------|
| `docker-compose.yml` | always | Base stack: `data-init` → `backend` → `webapp`, images from GHCR, volumes `jukebox-data` and `jukebox-cache`, network `jukebox-net` |
| `docker-compose.override.yml` | automatically with plain `docker compose` | Development tweaks (`JUKEBOX_CORS=*`, commented-out local data mount and debug port) |
| `docker-compose.local.yml` | `-f docker-compose.yml -f docker-compose.local.yml` | Build images from `../webapp` and `../sonification`, bind-mount `../datasets/data`, disable `data-init` |
| `docker-compose.prod.yml` | `-f docker-compose.yml -f docker-compose.prod.yml` | Traefik with Let's Encrypt on `DOMAIN` / `api.DOMAIN`, no host ports for webapp/backend, restricted CORS, CPU/memory limits, JSON log rotation |
| `docker-compose.shared-traefik.yml` | **instead of** `prod` (see [Behind an Existing Traefik](production.md#behind-an-existing-traefik-shared-server)) | No own Traefik, no host ports: joins the existing Traefik's network (`TRAEFIK_NETWORK`) with routes for `DOMAIN`, `www.DOMAIN`, `api.DOMAIN`; project name `jukebox`; backend 1.5 GB / webapp 256 MB limits |
| `docker-compose.hostdata.yml` | added after `prod` or `shared-traefik` (see [Small Server](production.md#small-server-data-from-a-host-folder)) | Mount the datasets from the host folder `JUKEBOX_DATA_PATH` (read-only, into backend and webapp) instead of the datasets image; disable `data-init` |

Instead of `-f` flags, the files can be listed in `.env` as `COMPOSE_FILE`, `:`-separated (for example
`COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml:docker-compose.hostdata.yml`); `docker-compose.override.yml`
is then not loaded. The compose files have no top-level `version:` key.

### Base stack (`docker-compose.yml`)

```yaml
services:
  data-init:     # ghcr.io/.../datasets:${DATASETS_VERSION}
    # copies /datasets/. into the jukebox-data volume when its fingerprint (/data/.initialized) differs, then exits
  backend:       # ghcr.io/.../sonification:${SONIFICATION_VERSION}
    ports: ["${BACKEND_PORT:-8000}:8000"]
    environment:
      - JUKEBOX_DATA_DIR=/app/data
      - JUKEBOX_CACHE_DIR=/app/cache
      - JUKEBOX_CORS=${JUKEBOX_CORS:-*}
    volumes:
      - jukebox-data:/app/data:ro
      - jukebox-cache:/app/cache
    depends_on: data-init (completed successfully)
    healthcheck: curl -f http://localhost:8000/api/health
  webapp:        # ghcr.io/.../webapp:${WEBAPP_VERSION}
    ports: ["${WEBAPP_PORT:-80}:80"]
    volumes:
      - jukebox-data:/usr/share/nginx/data:ro   # served at /data/ for the globe
    depends_on: data-init (completed), backend (healthy)
    healthcheck: wget --spider http://localhost/health
```

(Abridged; see the file for the full definition.)

### Local build (`docker-compose.local.yml`)

- `data-init` is moved to the `registry` profile, so it does not run (the data comes from the bind mount).
- `backend` is built from `../sonification` as `earth-jukebox/sonification:local`; `webapp` from `../webapp`
  as `earth-jukebox/webapp:local` with `VITE_API_URL=/api`.
- Both mount `../datasets/data` read-only (`/app/data` and `/usr/share/nginx/data`) instead of copying ~9 GB into a volume.
- The backend health check gets a 60 s `start_period` for the first data conversion.

To also bundle the VSCO orchestral samples (~440 MB, slower build), uncomment the `WITH_VSCO: "1"` build arg in
`docker-compose.local.yml`.

### Production overrides (`docker-compose.prod.yml`)

See [Production Deployment](production.md).

---

## How the Containers Work

```
browser ──:80──▶ webapp (nginx)
                  ├── /          React SPA (SPA fallback to index.html)
                  ├── /api/*  ──▶ backend:8000/api/*   (proxy, 120 s read timeout)
                  ├── /data/*     jukebox-data, read-only (JSON listings + HTTP Range on .npy)
                  └── /health     "healthy" (container health check)

backend (FastAPI, python backend/serve.py)
  ├── reads the raw datasets from /app/data (read-only)
  ├── converts them in the background into /app/cache/_datasets
  └── serves /api/health, /api/instruments, /api/genres, /api/sonify, /api/zones/zone-data,
      /api/zones/series, /api/zones/groove
```

- **webapp image** (`webapp/Dockerfile`): `node:22-alpine` build stage (`npm ci && npm run build`, build arg
  `VITE_API_URL`, default `/api`), served by `nginx:alpine` with `webapp/nginx.conf`.
- **sonification image** (`sonification/Dockerfile`): `python:3.12-slim`, multi-stage. Includes `ffmpeg` (MP3),
  `tinysoundfont` and the GeneralUser GS SoundFont (downloaded at build time); VSCO samples only with
  `--build-arg WITH_VSCO=1`.
- **datasets image** (`datasets/Dockerfile`): `alpine` with the contents of `data/` in `/datasets`, used only as
  an init container.

---

## Building Images

### Through Compose (local build)

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml build
docker compose -f docker-compose.yml -f docker-compose.local.yml build backend
docker compose -f docker-compose.yml -f docker-compose.local.yml build --no-cache
```

### Individually

```bash
docker build -t earth-jukebox-webapp ../webapp                    # --build-arg VITE_API_URL=/api
docker build -t earth-jukebox-sonification ../sonification        # --build-arg WITH_VSCO=1 for orchestral samples
docker build -t earth-jukebox-datasets ../datasets                # copies datasets/data into the image
```

Run the backend alone:

```bash
docker run -p 8000:8000 \
  -v "$PWD/../datasets/data:/app/data:ro" \
  -v jukebox-cache:/app/cache \
  earth-jukebox-sonification
```

---

## Environment Variables

### Compose (`.env`, from `.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `WEBAPP_VERSION` | `latest` | Version of the `webapp` image (registry flow) |
| `SONIFICATION_VERSION` | `latest` | Version of the `sonification` image (registry flow) |
| `DATASETS_VERSION` | `latest` | Version of the `datasets` image (registry flow) |
| `TAG` / `DATA_TAG` | - | Legacy fallbacks, used only when the variables above are unset |
| `WEBAPP_PORT` | `80` | Host port of the webapp |
| `BACKEND_PORT` | `8000` | Host port of the backend API |
| `JUKEBOX_CORS` | `*` | Allowed CORS origins, comma-separated |
| `JUKEBOX_DATA_PATH` | - | Host folder with the datasets (`docker-compose.hostdata.yml`) |
| `VITE_API_URL` | `/api` in `.env.example` | Required by `docker-compose.local.yml` (webapp build arg) |

Production variables (`DOMAIN`, `ACME_EMAIL`, `JUKEBOX_CORS_PROD`, `TRAEFIK_VERSION`, `TRAEFIK_NETWORK`, `COMPOSE_FILE`) are listed in [Production → Environment Variables](production.md#environment-variables).

### Backend container

Set in `sonification/Dockerfile` (and partly by compose):

| Variable | Image default | Description |
|----------|---------------|-------------|
| `JUKEBOX_DATA_DIR` | `/app/data` | Raw datasets (may be read-only) |
| `JUKEBOX_CACHE_DIR` | `/app/cache` | Compositions + converted datasets (`_datasets/`); must be writable |
| `JUKEBOX_CORS` | `*` | Allowed CORS origins |
| `JUKEBOX_PREPARE` | `1` | `0` skips the raw-data conversion at start-up |
| `JUKEBOX_MERGE_DATASETS` | `1` | Each variable is read from its own dataset, lined up by date |
| `JUKEBOX_FULL_API` | `0` | `0`: only `/api/health`, `/api/instruments`, `/api/genres`, `/api/sonify`, `/api/zones/zone-data`, `/api/zones/series`, `/api/zones/groove`; `1`: also the engine endpoints (`/api/compose`, `/api/datasets`, `/api/options`, …) |
| `JUKEBOX_CHUNK_SECONDS` | `30` | Length of one `/api/sonify` chunk |
| `PORT` | `8000` | Port uvicorn listens on inside the container |

### Webapp image

| Build arg | Default | Description |
|-----------|---------|-------------|
| `VITE_API_URL` | `/api` | API base baked into the bundle at build time. Keep `/api` so nginx proxies to the backend |

---

## Volume Management

| Volume | Mounted at | Content |
|--------|------------|---------|
| `jukebox-data` | backend `/app/data` (ro), webapp `/usr/share/nginx/data` (ro) | Raw monthly `.npy` maps, copied by `data-init` (registry flow only; the local build and `docker-compose.hostdata.yml` use a bind mount) |
| `jukebox-cache` | backend `/app/cache` | Generated compositions and the converted datasets (`_datasets/`) |

### Data volume (registry flow)

`data-init` runs at each `up`. It computes a fingerprint of the image's data (`ls -lR /datasets | md5sum`: file list,
sizes, dates) and compares it with the one stored in `/data/.initialized`. Equal: it skips. Different (or missing): it
empties the volume, so files removed or renamed upstream disappear, copies the new data and stores the new
fingerprint. So changing `DATASETS_VERSION` (or pulling a rebuilt `latest`) refreshes the volume by itself, and the
backend then rebuilds only the datasets that changed in its cache. To force a full re-copy anyway:

```bash
docker compose down
docker volume rm jukebox-data
docker compose up -d          # data-init copies again

# or pre-populate / refresh it by hand (pulls the datasets image, writes the same fingerprint)
./scripts/init-data.sh        # optional version: ./scripts/init-data.sh 1.4.0 (Git tag without the "v")
```

### Data from a host folder

With `docker-compose.hostdata.yml`, `JUKEBOX_DATA_PATH` (an absolute path holding one folder per dataset, as in the
`datasets` repository's `data/`) is mounted read-only at `/app/data` (backend) and `/usr/share/nginx/data` (webapp),
and `data-init` is disabled (moved to the `registry` profile). The datasets image is never pulled. Update the data by
replacing the folder's contents and running `docker compose restart backend`.

Inspect it:

```bash
docker run --rm -v jukebox-data:/data alpine ls -la /data
```

### Cache volume

Can be safely cleared. The backend then re-converts the datasets on the next start (`preparing_data` until done).

```bash
docker compose down
docker volume rm jukebox-cache
```

---

## Orchestral Samples

By default the backend renders with the GeneralUser GS SoundFont (bundled in the image). For the VSCO 2 CE orchestral
samples (~440 MB, CC0), build the backend image with:

```bash
docker build --build-arg WITH_VSCO=1 -t earth-jukebox-sonification ../sonification
```

or uncomment `WITH_VSCO: "1"` in `docker-compose.local.yml`. `GET /api/health` reports `"orchestral_samples": true`
when they are present.

---

## Logs and Monitoring

```bash
# With the local build, prefix with: docker compose -f docker-compose.yml -f docker-compose.local.yml
docker compose logs -f
docker compose logs -f backend
docker compose logs --tail=100 backend
docker compose ps
docker stats
```

---

## Troubleshooting

### `docker compose up` fails pulling images

`denied` from `ghcr.io`: the repositories are private, so run `docker login ghcr.io` with a token that has
`read:packages`. `manifest unknown`: the version in `.env` was never published; use a released one (for example
`1.4.0`, without `v`) or `./scripts/run-local.sh`.

### Container won't start

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml logs backend
./scripts/run-local.sh rebuild
```

### No sound / "backend unavailable" in the webapp

```bash
curl http://localhost:8000/api/health     # "status": "ok"; check preparing_data, audio_rendering, mp3_encoding
curl -v http://localhost/api/health       # same answer through the nginx proxy
```

### Globe shows no data

The webapp reads `/data/`; check that the datasets are mounted:

```bash
curl http://localhost/data/               # JSON list of dataset folders
```

### Port already in use

Port 80 or 8000 taken (e.g. by `uvicorn` or another web server): change `WEBAPP_PORT` / `BACKEND_PORT` in `.env`.

```bash
lsof -i :8000
```

---

## Updating

### Local build

```bash
git -C ../webapp pull && git -C ../sonification pull && git -C ../datasets pull
./scripts/run-local.sh            # rebuilds what changed
```

### Registry images

```bash
# bump WEBAPP_VERSION / SONIFICATION_VERSION / DATASETS_VERSION in .env (e.g. 1.4.0)
docker compose pull
docker compose up -d          # data-init refreshes jukebox-data if the datasets changed
```

---

## Cleanup

```bash
docker compose down                     # containers
docker compose down -v                  # + volumes (jukebox-data, jukebox-cache)
docker compose down -v --rmi all        # + images
```

With the local build, use `./scripts/run-local.sh down` or add `-f docker-compose.yml -f docker-compose.local.yml`.

---

## Next Steps

- [Production Deployment](production.md)
- [CI/CD Setup](ci-cd.md)
