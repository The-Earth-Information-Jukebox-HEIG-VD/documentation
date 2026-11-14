# Backend Developer Guide

Guide for developing the FastAPI backend.

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
│   ├── models/
│   │   ├── requests.py     # Pydantic request models
│   │   └── responses.py    # Pydantic response models
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

## FastAPI Basics

### Creating an Endpoint

```python
# backend/routes/my_endpoint.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["my-feature"])

class MyRequest(BaseModel):
    value: int
    name: str | None = None

class MyResponse(BaseModel):
    result: str
    processed: bool

@router.post("/my-endpoint", response_model=MyResponse)
async def my_endpoint(request: MyRequest):
    if request.value < 0:
        raise HTTPException(status_code=422, detail="Value must be positive")

    return MyResponse(
        result=f"Processed {request.value}",
        processed=True
    )
```

### Registering the Router

```python
# backend/app.py
from fastapi import FastAPI
from backend.routes.my_endpoint import router as my_router

app = FastAPI(title="Earth Jukebox API")
app.include_router(my_router)
```

---

## Working with NASA Data

### Adding a New Data Client

1. Create the client:

```python
# src/nasa/my_source.py
import httpx
from dataclasses import dataclass

@dataclass
class MyDataPoint:
    date: str
    value: float
    unit: str

class MySourceClient:
    """Client for My NASA Data Source."""

    BASE_URL = "https://api.nasa.gov/my-source"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("NASA_API_KEY", "DEMO_KEY")

    async def fetch_data(
        self,
        start_date: str,
        end_date: str
    ) -> list[MyDataPoint]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/data",
                params={
                    "start": start_date,
                    "end": end_date,
                    "api_key": self.api_key
                }
            )
            response.raise_for_status()
            return self._parse_response(response.json())

    def _parse_response(self, data: dict) -> list[MyDataPoint]:
        # Parse the API response
        return [
            MyDataPoint(
                date=item["date"],
                value=item["value"],
                unit="units"
            )
            for item in data["results"]
        ]
```

2. Add caching:

```python
import json
from pathlib import Path

CACHE_DIR = Path("data/raw")

async def fetch_data_cached(self, start_date: str, end_date: str):
    cache_key = f"my_source_{start_date}_{end_date}.json"
    cache_file = CACHE_DIR / cache_key

    if cache_file.exists():
        with open(cache_file) as f:
            data = json.load(f)
            return [MyDataPoint(**d) for d in data]

    data = await self.fetch_data(start_date, end_date)

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with open(cache_file, "w") as f:
        json.dump([asdict(d) for d in data], f)

    return data
```

---

## Music Composition

### Adding a New Instrument

1. Define in `music/orchestra.py`:

```python
ORCHESTRA = {
    # ... existing instruments ...

    "my_variable": {
        "instrument": "Marimba",
        "role": "melody",
        "midi_program": 12,  # MIDI program number
        "pitch_range": [48, 84],  # C3 to C6
        "always_playing": False,  # Only when data present
        "channel": 7,  # MIDI channel
    },
}
```

2. Map data to the instrument in `music/composer.py`:

```python
def compose_track(
    self,
    variable: str,
    values: np.ndarray,
    presence: np.ndarray
) -> InstrumentTrack:
    config = ORCHESTRA[variable]

    notes = []
    for beat, (value, pres) in enumerate(zip(values, presence)):
        if config["always_playing"] or pres > 0.1:
            pitch = self.value_to_pitch(value, config["pitch_range"])
            velocity = self.presence_to_velocity(pres)
            notes.append(Note(pitch, velocity, beat, duration=0.9))

    return InstrumentTrack(
        name=f"{variable} - {config['instrument']}",
        program=config["midi_program"],
        channel=config["channel"],
        notes=notes
    )
```

### Modifying the Musical Style

In `music/composer.py`:

```python
def compose(self, data: IntensityMap, style: str = "data") -> Score:
    if style == "data":
        return self._compose_data_style(data)
    elif style == "musical":
        return self._compose_musical_style(data)
    else:
        raise ValueError(f"Unknown style: {style}")

def _compose_data_style(self, data):
    """Faithful data representation."""
    # Every note directly represents a data point
    ...

def _compose_musical_style(self, data):
    """Orchestrated arrangement."""
    # Add intro, climax, chord progressions
    ...
```

---

## Audio Rendering

### SoundFont Rendering

```python
import tinysoundfont

synth = tinysoundfont.Synth()
synth.load("path/to/soundfont.sf2")

# Set instrument for each channel
for var, config in ORCHESTRA.items():
    synth.program_change(config["channel"], config["midi_program"])

# Render notes
for note in score.all_notes():
    synth.noteon(note.channel, note.pitch, note.velocity)
    # ... timing logic ...
    synth.noteoff(note.channel, note.pitch)

# Get audio data
audio = synth.render_float(sample_rate=44100)
```

### VSCO Orchestral Samples

```python
from music.sampler import VSCOSampler

sampler = VSCOSampler()
if not sampler.available():
    # Fall back to SoundFont
    audio = render_soundfont(score)
else:
    audio = sampler.render(score)
```

---

## Testing

### Unit Tests

```bash
pytest
pytest -v  # verbose
pytest -k "gistemp"  # filter by name
pytest --cov=backend  # coverage
```

### Writing Tests

```python
# tests/test_compose.py
import pytest
from backend.routes.compose import compose_music

@pytest.fixture
def sample_request():
    return {
        "zone": "switzerland",
        "start": "2024-01",
        "end": "2024-06",
    }

def test_compose_returns_score(sample_request):
    result = compose_music(sample_request)
    assert "score" in result
    assert result["score"]["n_bars"] > 0

def test_compose_invalid_zone():
    with pytest.raises(ValueError, match="Zone.*not found"):
        compose_music({"zone": "atlantis"})
```

### Integration Tests

```python
# tests/test_api.py
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_compose_endpoint():
    response = client.post("/api/compose", json={
        "zone": "global",
        "audio": False  # Skip audio rendering for speed
    })
    assert response.status_code == 200
    assert "id" in response.json()
```

---

## Error Handling

### Consistent Error Responses

```python
from fastapi import HTTPException

# 400: Client error, nothing to process
raise HTTPException(
    status_code=400,
    detail="No data available for the selected time range"
)

# 404: Resource not found
raise HTTPException(
    status_code=404,
    detail=f"Dataset '{dataset_id}' not found"
)

# 422: Validation error
raise HTTPException(
    status_code=422,
    detail=f"Invalid zone '{zone}'. Available: {', '.join(zones)}"
)
```

### Custom Exception Handler

```python
# backend/app.py
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )
```

---

## Caching

### Request Caching

```python
import hashlib
import json
from pathlib import Path

CACHE_DIR = Path(os.getenv("JUKEBOX_CACHE_DIR", "backend/cache"))

def get_cache_key(request: dict) -> str:
    # Create deterministic hash of request
    relevant = {k: v for k, v in request.items() if k not in ["audio"]}
    content = json.dumps(relevant, sort_keys=True)
    return hashlib.md5(content.encode()).hexdigest()

def get_cached(key: str) -> dict | None:
    cache_file = CACHE_DIR / key / "result.json"
    if cache_file.exists():
        with open(cache_file) as f:
            return json.load(f)
    return None

def set_cached(key: str, result: dict):
    cache_dir = CACHE_DIR / key
    cache_dir.mkdir(parents=True, exist_ok=True)
    with open(cache_dir / "result.json", "w") as f:
        json.dump(result, f)
```

---

## Performance

### Async I/O

Use async for I/O-bound operations:

```python
import httpx

async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

### Parallel Processing

Use `asyncio.gather` for concurrent operations:

```python
import asyncio

async def compose_all_instruments(data):
    tasks = [
        compose_instrument(var, data[var])
        for var in data.variables
    ]
    results = await asyncio.gather(*tasks)
    return dict(zip(data.variables, results))
```

### NumPy for Data Processing

Use vectorized operations:

```python
import numpy as np

# ❌ Slow: Python loop
frequencies = []
for value in values:
    frequencies.append(min_freq + value * (max_freq - min_freq))

# ✅ Fast: NumPy vectorized
frequencies = min_freq + values * (max_freq - min_freq)
```

---

## Debugging

### Logging

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/api/compose")
async def compose(request: ComposeRequest):
    logger.info(f"Composing for zone={request.zone}")
    logger.debug(f"Full request: {request.dict()}")

    try:
        result = do_composition(request)
        logger.info(f"Composed {result.n_bars} bars")
        return result
    except Exception as e:
        logger.exception(f"Composition failed: {e}")
        raise
```

### Interactive Docs

Use http://localhost:8000/docs to:
- Test endpoints interactively
- See request/response schemas
- Debug API behavior

---

## Next Steps

- [Architecture: Backend](../architecture/backend.md)
- [API Reference](../api/reference.md)
- [Sonification Guide](sonification.md)
