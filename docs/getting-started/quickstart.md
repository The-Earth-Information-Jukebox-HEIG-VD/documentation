# Quick Start

Get Earth Information Jukebox running locally.

!!! info "Repositories"
    The code lives in the [The-Earth-Information-Jukebox-HEIG-VD](https://github.com/The-Earth-Information-Jukebox-HEIG-VD)
    organization. Apart from `documentation`, the repositories are **private**: you need to be a member and
    clone over SSH (or HTTPS with a token). All of them must sit side by side in one folder.

---

## Option 1: Docker (Recommended)

Builds the images from the sibling repositories and starts the whole stack:

```bash
# Clone the repositories side by side
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/webapp.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/sonification.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/datasets.git    # ~6.3 GB of data
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment

# Build + start (waits until healthy)
./scripts/run-local.sh

# Open the application
open http://localhost
```

The application is now running:

- **Webapp**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

Stop it with `./scripts/run-local.sh down`.

!!! note
    The first start converts the datasets in the background (a few minutes). Music is available once
    `GET /api/health` reports `"preparing_data": false`.

    A plain `docker compose up -d` pulls pre-built images from GHCR, but none has been published yet; see
    [Docker Deployment](../deployment/docker.md).

---

## Option 2: Manual Setup

Clone `webapp`, `sonification` and `datasets` side by side (as above).

### Backend

```bash
cd sonification

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install --no-deps tinysoundfont        # audio rendering
python music/render_audio.py --download    # SoundFont, once (~32 MB)

# Convert the raw datasets once (writes backend/cache/_datasets)
python backend/prepare_data.py --raw ../datasets/data

# Start the server
JUKEBOX_MERGE_DATASETS=1 uvicorn backend.app:app --reload --port 8000
```

`ffmpeg` must be on your `PATH` for MP3 output (see [Prerequisites](prerequisites.md)).

### Frontend

In a new terminal:

```bash
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

The webapp has no offline fallback: without the backend there is no sound and the UI shows a
"backend unavailable" error.

---

## Verify Installation

### 1. Check the Backend

Visit http://localhost:8000/docs to see the interactive API documentation.

Test the health endpoint:

```bash
curl http://localhost:8000/api/health
```

Example response (abridged):

```json
{
  "status": "ok",
  "version": "2.1",
  "datasets": 6,
  "preparing_data": false,
  "merge_datasets": true,
  "audio_rendering": true,
  "mp3_encoding": true,
  "orchestral_samples": false
}
```

`datasets: 0` means the data has not been converted (or `preparing_data` is still `true`).

### 2. Check the Frontend

Visit http://localhost:5173 (manual setup) or http://localhost (Docker). You should see:

- The Earth Information Jukebox interface with the globe
- The list of tracks (one instrument per dataset)
- Audio playback controls

### 3. Test Sonification

1. Select a zone (or use the default)
2. Click the **Play** button (or press `Space`)
3. You should hear the climate data as music!

---

## Troubleshooting

### Port already in use

If port 8000 or 5173 is in use:

```bash
# Backend: use a different port
uvicorn backend.app:app --reload --port 8001
```

Then tell the webapp where the API is, in `webapp/.env.development.local` (gitignored):

```bash
VITE_API_URL=http://localhost:8001/api
```

Vite picks the next free port automatically if 5173 is taken. The docs server (`mkdocs serve`) uses port 8001.

### "Backend unavailable" / CORS errors

In development the browser calls the backend directly (`VITE_API_URL=http://localhost:8000/api` in
`webapp/.env.development`). The backend allows all origins by default (`JUKEBOX_CORS=*`), so a CORS error usually
means the backend is not running or listens on another port.

### No audio

- Click **Play** first: browsers only allow audio after a user interaction
- Check `audio_rendering` and `mp3_encoding` in `/api/health`
- Check your system volume

### Dependencies fail to install

=== "Python"

    ```bash
    # Upgrade pip
    pip install --upgrade pip

    # Install build tools (macOS)
    xcode-select --install

    # Install build tools (Ubuntu)
    sudo apt-get install python3-dev build-essential
    ```

    `tinysoundfont` has no pre-built wheel for every platform (e.g. Linux arm64) and then needs a C compiler.

=== "Node.js"

    ```bash
    # Clear npm cache
    npm cache clean --force

    # Delete node_modules and reinstall
    rm -rf node_modules
    npm ci
    ```

---

## Next Steps

- [Prerequisites](prerequisites.md) - Required tools and versions
- [Development Setup](development.md) - Full development environment
- [Development Overview](../development/overview.md) - Understand the system
