# Backend Development

The backend is a FastAPI application that fetches NASA climate data and generates orchestral audio.

---

## Setup

```bash
cd sonification/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.app:app --reload --port 8000
```

API docs at http://localhost:8000/docs

---

## Project Structure

```
sonification/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── routes/
│   │   ├── health.py       # Health endpoint
│   │   ├── compose.py      # /api/compose
│   │   └── sonify.py       # /api/sonify
│   └── cache/              # Generated files
├── music/
│   ├── orchestra.py        # Instrument definitions
│   ├── composer.py         # Score composition
│   └── sampler.py          # Audio rendering
├── src/nasa/
│   ├── gistemp.py          # GISTEMP client
│   └── power.py            # POWER API client
└── simulation/
    └── simulate_variables.py
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JUKEBOX_DATA_DIR` | `simulation/output` | Climate data directory |
| `JUKEBOX_CACHE_DIR` | `backend/cache` | Cache directory |
| `JUKEBOX_CORS` | `*` | Allowed CORS origins |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/options` | UI menu options |
| GET | `/api/instruments` | Dataset-to-instrument mapping |
| GET | `/api/datasets` | Available datasets |
| POST | `/api/sonify` | Generate audio chunk |
| POST | `/api/compose` | Full composition |

---

## Creating an Endpoint

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["my-feature"])

class MyRequest(BaseModel):
    value: int
    name: str | None = None

@router.post("/my-endpoint")
async def my_endpoint(request: MyRequest):
    if request.value < 0:
        raise HTTPException(status_code=422, detail="Value must be positive")
    return {"result": f"Processed {request.value}"}
```

---

## NASA Data Clients

### GISTEMPClient

```python
from src.nasa.gistemp import GISTEMPClient

client = GISTEMPClient()
data = await client.fetch_global_temperatures(
    start_year=2020,
    end_year=2024
)
```

### POWERClient

```python
from src.nasa.power import POWERClient

client = POWERClient()
data = await client.fetch_monthly_data(
    latitude=46.5,
    longitude=6.5,
    start_year=2020,
    end_year=2024,
    parameters=["T2M", "PRECTOTCORR"]
)
```

---

## Music Composition

### Orchestra Definition

```python
# music/orchestra.py
ORCHESTRA = {
    "temperature": {
        "instrument": "Piano (chords)",
        "role": "harmony",
        "midi_program": 0,
        "pitch_range": [48, 72],
        "always_playing": True,
    },
    "precipitation": {
        "instrument": "Violins (melody)",
        "role": "melody",
        "midi_program": 40,
        "always_playing": False,
    },
}
```

### Adding a New Instrument

1. Define in `music/orchestra.py`
2. Map data to notes in `music/composer.py`
3. The sampler automatically picks it up

---

## Testing

```bash
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest -k "gistemp"       # Filter by name
pytest --cov=backend      # With coverage
```

### Example Test

```python
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

---

## Error Handling

```python
# 400: Nothing to process
raise HTTPException(status_code=400, detail="No data available")

# 404: Resource not found
raise HTTPException(status_code=404, detail="Dataset not found")

# 422: Validation error
raise HTTPException(status_code=422, detail="Invalid zone")
```

---

## Caching

Compositions are cached by request hash:

```python
def get_cache_key(request: dict) -> str:
    content = json.dumps(request, sort_keys=True)
    return hashlib.md5(content.encode()).hexdigest()
```

- Same request returns in ~10ms instead of ~2s
- Cache can be cleared without data loss
