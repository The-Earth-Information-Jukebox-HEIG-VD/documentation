# Development Setup

Complete guide for setting up a development environment.

---

## Clone Repositories

Clone all repositories for full development:

```bash
# Create project directory
mkdir earth-jukebox && cd earth-jukebox

# Clone all repositories
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/webapp.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/sonification.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/datasets.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/deployment.git
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/documentation.git
```

---

## Frontend Setup (webapp)

### Install Dependencies

```bash
cd webapp
npm install
```

### Environment Configuration

Create a `.env.local` file:

```bash
# API endpoint (default for local development)
VITE_API_URL=http://localhost:8000
```

### Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:5173 with hot module replacement.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (runs TypeScript first) |
| `npm run lint` | ESLint check |
| `npm run test` | Run all tests with Vitest |
| `npm run test:audio` | Run audio-related tests only |
| `npm run test:a11y` | Run accessibility tests |

---

## Backend Setup (sonification)

### Create Virtual Environment

```bash
cd sonification/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
pip install --no-deps tinysoundfont
```

### Download Orchestral Samples (Optional)

For high-quality audio rendering:

```bash
python music/sampler.py --download
```

This downloads VSCO 2 CE orchestral samples (~440 MB, one-time download).

### Generate Sample Data

```bash
# Real NASA/NOAA data extraction
pip install netCDF4
python simulation/build_realistic_dataset.py

# Or simulated demo data
python simulation/simulate_variables.py --scenario both --warming 0.5 --years 2 --frames 24
```

### Start the Server

```bash
uvicorn backend.app:app --reload --port 8000
```

The API will be available at:
- http://localhost:8000 - API
- http://localhost:8000/docs - Interactive documentation

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JUKEBOX_DATA_DIR` | `simulation/output` | Folder with intensity maps |
| `JUKEBOX_CACHE_DIR` | `backend/cache` | Generated compositions cache |
| `JUKEBOX_CORS` | `*` | Allowed CORS origins |

### Available Commands

| Command | Description |
|---------|-------------|
| `uvicorn backend.app:app --reload` | Start dev server |
| `pytest` | Run all tests |
| `pytest -k "gistemp"` | Run specific test pattern |

---

## Running Both Services

### Terminal 1: Backend

```bash
cd sonification/backend
source venv/bin/activate
uvicorn backend.app:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd webapp
npm run dev
```

### Using Docker Compose

Alternatively, use Docker to run everything:

```bash
cd deployment
docker compose up
```

---

## IDE Configuration

### VS Code Settings

Create `.vscode/settings.json` in each repository:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["backend.app:app", "--reload", "--port", "8000"],
      "cwd": "${workspaceFolder}/sonification/backend"
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

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add volume control to audio player
fix: resolve CORS issue with API requests
docs: update installation instructions
refactor: simplify sonification engine
```

### Pull Request Process

1. Create a feature branch
2. Make changes and commit
3. Push to your fork
4. Open a pull request
5. Address review comments
6. Merge after approval

---

## Testing

### Frontend Tests

```bash
cd webapp

# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- src/audio/SonificationEngine.test.ts

# Watch mode
npm run test -- --watch
```

### Backend Tests

```bash
cd sonification/backend
source venv/bin/activate

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test
pytest tests/test_gistemp.py

# Run with coverage
pytest --cov=backend
```

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
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Node modules issues

```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port conflicts

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### Audio not playing

- Browser requires user interaction before playing audio
- Check that AudioContext is in "running" state
- Verify Web Audio API is supported

---

## Next Steps

- [Architecture Overview](../architecture/overview.md) - Understand the system
- [Frontend Guide](../developer-guide/frontend.md) - Frontend development
- [Backend Guide](../developer-guide/backend.md) - Backend development
- [Contributing](../developer-guide/contributing.md) - Contribution guidelines
