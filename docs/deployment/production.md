# Production Deployment

Deploy EarthChestra (the Earth Information Jukebox project's app) to a server (VPS) with Docker Compose.

!!! info "Published images"
    The production setup (`docker-compose.yml` + `docker-compose.prod.yml`) pulls images from GHCR. Releases are
    published: the latest tags are `v1.3.0` in `webapp` and `datasets` and `v1.3.2` in `sonification`, so the images
    exist as `1.3.0` / `1.3.2` (Git tag without the `v`). To publish a new version see [Releasing images](ci-cd.md#releasing-images); to build
    on the server from the sibling repositories instead, use `docker-compose.local.yml`
    (see [Docker](docker.md#quick-start-local-build)).

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
WEBAPP_VERSION=1.3.0                   # pin each release instead of latest (no "v")
SONIFICATION_VERSION=1.3.2
DATASETS_VERSION=1.3.0
DOMAIN=example.com                     # webapp on DOMAIN, API on api.DOMAIN
ACME_EMAIL=admin@example.com           # Let's Encrypt account
```

!!! note
    The file must be named `.env`: Compose reads it automatically. `WEBAPP_PORT` / `BACKEND_PORT` are not used in
    production: Traefik owns ports 80/443 and the webapp and the backend publish no host ports. The backend's CORS
    origins are `JUKEBOX_CORS_PROD`, by default built from the domain (`https://DOMAIN,https://www.DOMAIN`).
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
curl https://api.$DOMAIN/api/health        # backend through Traefik
curl https://$DOMAIN/api/health            # through the webapp's nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  curl -f http://localhost:8000/api/health  # inside the container (no host port in prod)
```

On first start the backend converts the datasets in the background; wait until `preparing_data` is `false`.

---

## HTTPS and Exposure

`docker-compose.prod.yml` puts **Traefik** in front of the stack, with automatic Let's Encrypt certificates:

| URL | Service |
|-----|---------|
| `https://DOMAIN` | webapp |
| `https://www.DOMAIN` | permanent redirect to `https://DOMAIN` |
| `https://api.DOMAIN` | backend API (e.g. `https://api.DOMAIN/api/health`) |

- Traefik owns ports 80 and 443; the webapp and the backend publish no host ports. HTTP redirects to HTTPS.
- Set `DOMAIN` and `ACME_EMAIL` in `.env`. Certificates are stored in `deployment/data/letsencrypt/`.
- The webapp keeps calling `/api` on its own origin (nginx proxies it to the backend), so the same image works on any
  domain.

!!! warning "DNS and ports before the first start"
    Traefik requests the certificates as soon as it starts. `DOMAIN`, `www.DOMAIN` and `api.DOMAIN` must already
    resolve to the server (A and/or AAAA records; check with `dig +short DOMAIN @1.1.1.1`) and ports 80/443 must be
    reachable **from the internet**. Let's Encrypt allows only 5 failed validations per name and hour; after that it
    refuses every request for an hour (`429 rateLimited` in `docker compose logs traefik`). A server behind a
    network firewall or NAT (e.g. a school VM with a private IPv4) cannot get certificates until the ports are opened.

---

## Small Server (data from a host folder)

The datasets image is a single ~9.1 GB layer: pulling it needs about twice that, and `data-init` then copies another
~9.1 GB into the `jukebox-data` volume (~27-32 GB in total). On a small server (1 vCPU, 2 GB RAM, 20 GB disk) add
`docker-compose.hostdata.yml`: the data is stored once as plain files and mounted read-only into the backend and the
webapp (~14 GB in total).

| Measured at 1 CPU / 1.5 GB RAM, on an earlier version | Result |
|---|---|
| First-start data preparation (6 datasets, measured before fires was added) | 53 s, peak 911 MiB |
| Backend memory afterwards | ~350 MiB |
| One 30 s chunk, six instruments (there are now eleven) | ~1.7 s (expect 2-4 s on a cloud vCPU) |

With eleven datasets the first-start preparation and a chunk with every track on take longer; these figures have not been measured again.

```bash
# Optional on 2 GB RAM: 2 GB swap as a safety margin
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Data: clone once and keep only data/ (11 of the 12 folders are used; rain_belt is not)
git clone --depth 1 git@github.com:The-Earth-Information-Jukebox-HEIG-VD/datasets.git
mv datasets/data ~/jukebox-data && rm -rf datasets
```

`.env`:

```bash
COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml:docker-compose.hostdata.yml
JUKEBOX_DATA_PATH=/home/ubuntu/jukebox-data   # absolute path
WEBAPP_VERSION=1.3.0
SONIFICATION_VERSION=1.3.2
DOMAIN=example.com
ACME_EMAIL=admin@example.com
```

Then `docker compose pull` (the datasets image is not pulled: `data-init` is disabled) and, once DNS points at the
server, `docker compose up -d --wait`. `DATASETS_VERSION` is not used in this mode: update the data by replacing the
folder's contents and running `docker compose restart backend`.

---

## Behind an Existing Traefik (shared server)

When the server already runs a Traefik for other sites (ports 80/443 taken), use `docker-compose.shared-traefik.yml`
**instead of** `docker-compose.prod.yml`. It starts no Traefik and publishes no ports; it attaches the webapp and the
backend to the existing Traefik's network and routes `DOMAIN`, `www.DOMAIN` (redirect to the apex) and `api.DOMAIN`
through it, with http to https redirects. The Compose project is named `jukebox`, so it never mixes with another
project, even one in a folder also called `deployment`.

The existing Traefik needs entrypoints `http` and `https`, a certificate resolver `letsencrypt` and the Docker
provider. Find its network with:

```bash
docker inspect -f '{{json .NetworkSettings.Networks}}' <traefik-container> | grep -oE '"[A-Za-z0-9_.-]+":\{' | tr -d '"{:'
```

`.env` (drop `:docker-compose.hostdata.yml` to use the datasets image instead of a host folder):

```bash
COMPOSE_FILE=docker-compose.yml:docker-compose.shared-traefik.yml:docker-compose.hostdata.yml
TRAEFIK_NETWORK=traefik
JUKEBOX_DATA_PATH=/home/debian/hackathon/jukebox-data
DOMAIN=example.com
```

Memory limits are lower than with `docker-compose.prod.yml` (backend 1.5 GB, webapp 256 MB), so the stack cannot
starve the other services. `ACME_EMAIL` is not used: certificates come from the existing Traefik's resolver.

---

## Environment Variables

### Compose (`.env`)

| Variable | Description |
|----------|-------------|
| `WEBAPP_VERSION` | Version of the `webapp` image |
| `SONIFICATION_VERSION` | Version of the `sonification` (backend) image |
| `DATASETS_VERSION` | Version of the `datasets` image |
| `TAG` / `DATA_TAG` | Legacy fallbacks (webapp + sonification / datasets), used only when the variables above are unset |
| `WEBAPP_PORT` | Host port of the webapp (default 80; not published in prod / shared Traefik) |
| `BACKEND_PORT` | Host port of the backend (default 8000; not published in prod / shared Traefik) |
| `JUKEBOX_CORS` | Allowed CORS origins, comma-separated (development) |
| `DOMAIN`, `ACME_EMAIL` | Domain served by Traefik; Let's Encrypt account email (prod) |
| `JUKEBOX_CORS_PROD` | Backend CORS origins in prod / shared Traefik (default `https://DOMAIN,https://www.DOMAIN`) |
| `TRAEFIK_VERSION` | Traefik image tag (default `v3.6`) |
| `TRAEFIK_NETWORK` | Network of the existing Traefik (`docker-compose.shared-traefik.yml`) |
| `JUKEBOX_DATA_PATH` | Absolute host folder with the datasets (`docker-compose.hostdata.yml`) |
| `COMPOSE_FILE` | Compose files to load, `:`-separated; replaces the `-f` flags |

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
curl https://api.$DOMAIN/api/health
```

Example response:

```json
{
  "status": "ok",
  "version": "2.14",
  "datasets": 11,
  "data_dir": "/app/data",
  "built_dir": "/app/cache/_datasets",
  "preparing_data": false,
  "merge_datasets": true,
  "full_api": false,
  "audio_rendering": true,
  "mp3_encoding": true,
  "orchestral_samples": false,
  "realistic_sounds": true
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
# bump WEBAPP_VERSION / SONIFICATION_VERSION / DATASETS_VERSION in .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

A new `datasets` image **does** refresh the `jukebox-data` volume: `data-init` stores a fingerprint of the image's
data (`ls -lR /datasets | md5sum`) in `/data/.initialized` and, when it differs, empties the volume and copies the new
data. The backend then rebuilds only the datasets that changed in its cache. To force a full re-copy, remove the
volume, or run `./scripts/init-data.sh <version>` (see [Docker → Volume Management](docker.md#volume-management)).
With `docker-compose.hostdata.yml`, replace the folder's contents and run `docker compose restart backend` instead.

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
lsof -i :443
```

In production Traefik needs ports 80 and 443. If another Traefik already holds them, use
[Behind an Existing Traefik](#behind-an-existing-traefik-shared-server). `WEBAPP_PORT` / `BACKEND_PORT` only apply
without the production override.

### Out of Memory

The production override caps the backend at 2 GB. Raise `deploy.resources.limits.memory` in
`docker-compose.prod.yml` if audio rendering gets killed.
