# Development Setup

Complete guide for setting up a development environment.

---

## Clone Repositories

Clone all repositories side by side (the webapp, the backend and the Docker setup all reference their siblings
with relative paths such as `../datasets/data`):

```bash
# Create project directory
mkdir earth-jukebox && cd earth-jukebox

# Clone all repositories (all private except documentation)
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/webapp.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/sonification.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/datasets.git          # ~6.3 GB of monthly maps
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/data_processing.git   # extraction scripts (optional)
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/deployment.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/documentation.git
```

| Repository | Content |
|------------|---------|
| `webapp` | React 19 + Vite + TypeScript frontend (globe, player, tracks) |
| `sonification` | FastAPI backend + music engine (`backend/`, `music/`, `simulation/`) |
| `datasets` | Pre-processed monthly maps in `data/` (one folder per dataset, `.npy` per month) |
| `data_processing` | Scripts that produced the datasets from NASA sources |
| `deployment` | Docker Compose orchestration |
| `documentation` | This MkDocs site |

---

## Frontend Setup (webapp)

### Install Dependencies

```bash
cd webapp
npm install
```

### Environment Configuration

`webapp/.env.development` (committed) points the browser straight at the local backend:

```bash
VITE_API_URL=http://localhost:8000/api
```

If your backend listens elsewhere (e.g. the Docker backend on another `BACKEND_PORT`), override it in
`webapp/.env.development.local` (gitignored):

```bash
VITE_API_URL=http://localhost:8001/api
```

Other variables read by `vite.config.ts` when starting `npm run dev`:

| Variable | Default | Description |
|----------|---------|-------------|
| `JUKEBOX_DATA_DIR` | `../datasets/data` | Folder served at `/data/` for the globe (JSON listings + HTTP Range, like nginx in production) |
| `JUKEBOX_API_URL` | `http://localhost:8000` | Target of the Vite `/api` proxy (used when `VITE_API_URL` is empty, i.e. `API_BASE = '/api'`) |

### Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:5173 with hot module replacement. It needs the backend: there
is no fallback, without it the UI shows a "backend unavailable" error. In development, `@axe-core/react` logs
accessibility violations to the browser console.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (runs `tsc` first) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint check (includes `jsx-a11y`, max 0 warnings) |
| `npm run test` | Run all tests with Vitest (watch mode; add `-- --run` for a single run) |
| `npm run test:audio` | Run tests whose name matches "audio" |
| `npm run test:a11y` | Run tests whose name matches "accessibility" |

---

## Backend Setup (sonification)

All commands run from the **repository root** (`sonification/`), not from `sonification/backend/`:
`requirements.txt` is at the root and `backend.app:app` is imported as a package.

### Create Virtual Environment

```bash
cd sonification
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
pip install --no-deps tinysoundfont        # audio rendering (--no-deps: skips pyaudio)
python music/render_audio.py --download    # GeneralUser GS SoundFont, once (~32 MB)
```

MP3 output also needs `ffmpeg` on the `PATH` (otherwise WAV).

### Download Orchestral Samples (Optional)

For high-quality audio rendering:

```bash
python music/sampler.py --download
```

This downloads VSCO 2 CE orchestral samples (~440 MB, CC0, one-time download).

### Prepare the Data

The API reads `<prefix>_<variable>.npz` + `.json` datasets. Convert the team's raw maps from the `datasets`
repository once (only what changed is rebuilt on later runs):

```bash
python backend/prepare_data.py --raw ../datasets/data     # writes backend/cache/_datasets
```

Alternatives, for experiments (written to `simulation/output/`, the default `JUKEBOX_DATA_DIR`):

```bash
# Real NASA GISTEMP + NOAA CO2 monthly, 2015 -> today (downloads the sources)
python simulation/build_realistic_dataset.py

# Simulated demo data
python simulation/simulate_variables.py --scenario both --warming 0.5 --years 2 --frames 24
```

See `sonification/README.md` and `simulation/README.md` for the details.

### Start the Server

```bash
JUKEBOX_MERGE_DATASETS=1 uvicorn backend.app:app --reload --port 8000
```

`JUKEBOX_MERGE_DATASETS=1` makes the server behave like the Docker image: each instrument reads its own dataset and
they are lined up by date. Alternatively, `JUKEBOX_DATA_DIR=../datasets/data python backend/serve.py` runs the
conversion in the background and starts the server, exactly as the container does.

The API will be available at:

- http://localhost:8000 - API
- http://localhost:8000/docs - Interactive documentation (all endpoints, since `JUKEBOX_FULL_API` defaults to `1` outside Docker)
- http://localhost:8000/api/health - Health check

### Environment Variables

| Variable | Default (outside Docker) | Description |
|----------|--------------------------|-------------|
| `JUKEBOX_DATA_DIR` | `simulation/output` | Folder with datasets (`*.npz` + `*.json`) or raw folders |
| `JUKEBOX_CACHE_DIR` | `backend/cache` | Generated compositions cache (safe to delete) |
| `JUKEBOX_BUILT_DIR` | `<cache>/_datasets` | Datasets converted by `backend/prepare_data.py`, scanned in addition to `JUKEBOX_DATA_DIR` |
| `JUKEBOX_MERGE_DATASETS` | `0` | `1`: each variable from its own dataset, lined up by date (Docker: `1`) |
| `JUKEBOX_FULL_API` | `1` | `0`: only the frontend's calls + `/api/health` (Docker: `0`) |
| `JUKEBOX_CHUNK_SECONDS` | `30` | Length of one `/api/sonify` chunk |
| `JUKEBOX_CORS` | `*` | Allowed CORS origins, comma-separated |

### Available Commands

| Command | Description |
|---------|-------------|
| `uvicorn backend.app:app --reload --port 8000` | Start dev server |
| `python backend/serve.py` | Prepare data in the background + serve (Docker entry point) |
| `python backend/prepare_data.py --raw ../datasets/data` | Convert the raw datasets |
| `python -m pytest backend simulation -q` | Run the tests (`pytest` and `httpx` are in `requirements.txt`) |
| `python backend/test_api.py` | End-to-end API tests without pytest |

---

## Data Processing (optional)

`data_processing/` holds the scripts that turned NASA sources into the maps of the `datasets` repository
(e.g. `temperature_anomaly/netcdf_to_numpy.py` for GISTEMP, `nightlights/nightlights_extractor.py`,
`precipitation/` (daily 2024 and monthly 2000-2026 precipitation exports), `common_grid/` to put any map on the shared 0.25° grid). Each folder has its own `README.md` and, where needed,
its own `requirements.txt`. You only need it to regenerate or add a dataset.

---

## Running Both Services

### Terminal 1: Backend

```bash
cd sonification
source .venv/bin/activate
JUKEBOX_MERGE_DATASETS=1 uvicorn backend.app:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd webapp
npm run dev
```

### Using Docker Compose

Alternatively, build and run everything in containers (webapp on http://localhost):

```bash
cd deployment
./scripts/run-local.sh
```

See [Docker Deployment](../deployment/docker.md).

### Documentation

```bash
cd documentation
pip install mkdocs-material
mkdocs serve        # http://127.0.0.1:8001 (dev_addr in mkdocs.yml; 8000 is the API)
```

---

## IDE Configuration

### VS Code Settings

Example `.vscode/settings.json` (not committed; `.vscode/` is gitignored):

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Launch Configuration

Example `.vscode/launch.json` in the parent folder that contains all repositories:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["backend.app:app", "--reload", "--port", "8000"],
      "cwd": "${workspaceFolder}/sonification",
      "env": { "JUKEBOX_MERGE_DATASETS": "1" }
    },
    {
      "name": "Chrome: Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/webapp/src"
    }
  ]
}
```

---

## Git Workflow

See [Contributing](../development/contributing.md) for the full guidelines. In short, as practised in the
repositories so far:

- Work is committed directly to `main` (no long-lived branches, no pull requests yet). Use a short branch and a
  pull request for larger or risky changes.
- Commit subjects are short imperative sentences describing the change, e.g.
  `Add Docker support for containerized deployment`,
  `Split precipitation into rain and snow (monthly, 2000-2026)`.
  The documentation repository uses a `docs:` prefix.
- Version tags `v*` publish the Docker images (see [CI/CD](../deployment/ci-cd.md#releasing-images)).

---

## Testing

### Frontend Tests

```bash
cd webapp

# Run all tests once
npm run test -- --run

# Watch mode (default)
npm run test

# Run a specific test file
npm run test -- --run src/audio/ChunkPlayer.test.ts

# Type check
npx tsc --noEmit
```

!!! note
    Coverage (`npm run test -- --coverage`) needs `@vitest/coverage-v8`, which is not in the devDependencies.

### Backend Tests

```bash
cd sonification
source .venv/bin/activate

# Run all tests
python -m pytest backend simulation -q

# Verbose
python -m pytest -v backend/test_api.py

# A single test
python -m pytest backend/test_prepare_data.py -k merge
```

`backend/test_api.py` uses the datasets the server can see (in `simulation/output/` or `backend/cache/_datasets`);
tests whose dataset is missing return early (they print `skip: ...`) instead of failing.

### Accessibility Tests

```bash
cd webapp
npm run test:a11y
```

---

## Troubleshooting

### Common Issues

#### Python virtual environment issues

```bash
# Remove and recreate
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install --no-deps tinysoundfont
```

#### Node modules issues

```bash
# Remove and reinstall
rm -rf node_modules
npm ci
```

#### Port conflicts

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

Port 8000 is the API, 5173 the Vite dev server, 8001 `mkdocs serve`, 80 the Docker webapp.

#### No datasets / no sound

- `curl http://localhost:8000/api/health`: `datasets` must be > 0 and `audio_rendering` `true`.
- `datasets: 0`: run `python backend/prepare_data.py --raw ../datasets/data`.
- `audio_rendering: false`: `pip install --no-deps tinysoundfont`.

#### Audio not playing

- Browser requires user interaction before playing audio (the `AudioContext` is created on the first Play)
- Check that AudioContext is in "running" state
- Verify Web Audio API is supported

---

## Next Steps

- [Development Overview](../development/overview.md) - Understand the system
- [Frontend Guide](../development/frontend.md) - Frontend development
- [Backend Guide](../development/backend.md) - Backend development
- [Contributing](../development/contributing.md) - Contribution guidelines
