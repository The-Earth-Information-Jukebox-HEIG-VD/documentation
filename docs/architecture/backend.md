# Backend Architecture

The backend is a FastAPI application that fetches NASA climate data, processes it, and generates orchestral audio compositions.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| Python 3.12 | Language |
| httpx | Async HTTP client |
| NumPy | Data processing |
| SciPy | Audio generation |
| soundfile | WAV file I/O |
| tinysoundfont | SoundFont rendering |
| Pydantic | Data validation |

---

## Directory Structure

```
sonification/
├── backend/
│   ├── app.py                  # FastAPI application
│   ├── routes/
│   │   ├── health.py           # Health check endpoint
│   │   ├── compose.py          # Composition endpoints
│   │   └── sonify.py           # Simplified sonification
│   └── cache/                  # Generated files cache
├── music/
│   ├── orchestra.py            # Instrument definitions
│   ├── composer.py             # Score composition
│   └── sampler.py              # Audio rendering
├── simulation/
│   ├── simulate_variables.py   # Demo data generation
│   └── build_realistic_dataset.py
├── src/
│   └── nasa/
│       ├── gistemp.py          # GISTEMP client
│       └── power.py            # POWER API client
└── API.md                      # API documentation
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Status and capabilities |
| GET | `/api/options` | UI menu options (zones, keys, scales) |
| GET | `/api/instruments` | Dataset-to-instrument mapping |
| GET | `/api/datasets` | Available datasets and their variables |
| POST | `/api/sonify` | Simple: points + date → audio chunk |
| POST | `/api/compose` | Full: custom score composition |
| GET | `/api/compositions/{id}` | Fetch earlier composition |
| GET | `/api/files/{id}/{file}` | Download generated files |

---

## Core Modules

### NASA Data Clients

#### GISTEMPClient

Fetches global temperature anomalies from NASA GISS:

```python
class GISTEMPClient:
    """Client for NASA GISTEMP global temperature data."""

    BASE_URL = "https://data.giss.nasa.gov/gistemp"

    async def fetch_global_temperatures(
        self,
        start_year: int = 1880,
        end_year: int | None = None
    ) -> list[TemperatureAnomaly]:
        """
        Fetch global temperature anomalies.

        Values are in 0.01°C (e.g., 154 = +1.54°C anomaly).
        Baseline period: 1951-1980.
        """
        # Fetch and parse CSV data
        # Cache results to disk
        ...
```

#### POWERClient

Fetches location-specific climate data:

```python
class POWERClient:
    """Client for NASA POWER API."""

    BASE_URL = "https://power.larc.nasa.gov/api"
    RATE_LIMIT = 30  # requests per minute

    async def fetch_monthly_data(
        self,
        latitude: float,
        longitude: float,
        start_year: int,
        end_year: int,
        parameters: list[str]
    ) -> dict[str, list[float]]:
        """
        Fetch monthly climate data for a location.

        Available parameters:
        - T2M: Temperature at 2m
        - PRECTOTCORR: Precipitation
        - WS2M: Wind speed
        - RH2M: Relative humidity
        """
        ...
```

### Music Composition

#### Orchestra

Defines instrument-to-variable mappings:

```python
ORCHESTRA = {
    "temperature": {
        "instrument": "Piano (chords)",
        "role": "harmony",
        "midi_program": 0,
        "pitch_range": [48, 72],
        "always_playing": True,
    },
    "co2": {
        "instrument": "Contrabass",
        "role": "bass",
        "midi_program": 43,
        "pitch_range": [28, 48],
        "always_playing": True,
    },
    "precipitation": {
        "instrument": "Violins (melody)",
        "role": "melody",
        "midi_program": 40,
        "pitch_range": [55, 84],
        "always_playing": False,  # Only plays when raining
    },
    # ... more instruments
}
```

#### Composer

Generates musical scores from data:

```python
class Composer:
    """Composes music from climate data."""

    def compose(
        self,
        data: IntensityMap,
        zone: str,
        time_range: tuple[str, str],
        style: str = "data"
    ) -> Score:
        """
        Compose a score from intensity data.

        Args:
            data: Climate data intensity map
            zone: Geographic zone
            time_range: (start, end) dates
            style: "data" (faithful) or "musical" (orchestrated)

        Returns:
            Score with bars, instruments, and notes
        """
        ...
```

### Audio Rendering

#### Sampler

Renders MIDI to audio:

```python
class Sampler:
    """Renders MIDI scores to audio."""

    def __init__(self, soundfont: str = "default"):
        """
        Initialize sampler.

        Args:
            soundfont: "default" for built-in, "vsco" for orchestral samples
        """
        ...

    def render(self, score: Score, format: str = "mp3") -> bytes:
        """
        Render score to audio.

        Args:
            score: Musical score with notes
            format: "mp3" or "wav"

        Returns:
            Audio file bytes
        """
        ...
```

---

## Request/Response Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         POST /api/sonify                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Request:                                                         │
│  {                                                                │
│    "zone_id": "france",                                          │
│    "points": [{"lat": 48.85, "lng": 2.35}],                     │
│    "time_period": "2024-03",                                     │
│    "duration_s": 30                                              │
│  }                                                                │
│                                                                   │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────────┐                                             │
│  │ Validate input  │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────┐     ┌─────────────────┐                     │
│  │ Load intensity  │────▶│ Check cache     │                     │
│  │ map data        │     │ (hash of req)   │                     │
│  └────────┬────────┘     └────────┬────────┘                     │
│           │                       │                               │
│           ▼                       │ (cache hit)                   │
│  ┌─────────────────┐              │                               │
│  │ Extract cells   │              │                               │
│  │ for zone        │              │                               │
│  └────────┬────────┘              │                               │
│           │                       │                               │
│           ▼                       │                               │
│  ┌─────────────────┐              │                               │
│  │ Compose score   │              │                               │
│  │ (30s of bars)   │              │                               │
│  └────────┬────────┘              │                               │
│           │                       │                               │
│           ▼                       │                               │
│  ┌─────────────────┐              │                               │
│  │ Render audio    │◀─────────────┘                               │
│  │ (MP3/WAV)       │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ▼                                                       │
│                                                                   │
│  Response:                                                        │
│  {                                                                │
│    "audio_data": "<base64>",                                     │
│    "time_period": "2024-03",                                     │
│    "next_time_period": "2025-01",                                │
│    "value": 9.42,                                                │
│    "units": "degC"                                               │
│  }                                                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Caching Strategy

Compositions are cached by request hash:

```python
def get_cache_key(request: ComposeRequest) -> str:
    """Generate cache key from request parameters."""
    relevant = {
        "zone": request.zone,
        "cells": tuple(map(tuple, request.cells)) if request.cells else None,
        "start": request.start,
        "end": request.end,
        "palette": request.palette,
        "key": request.key,
        "bpm": request.bpm,
    }
    return hashlib.md5(json.dumps(relevant, sort_keys=True).encode()).hexdigest()
```

Cache benefits:
- Same request returns in ~10ms instead of ~2s
- Generated files (MIDI, MP3, stems) are stored on disk
- Cache can be cleared without data loss

---

## Error Handling

Standard error responses:

| Code | Meaning |
|------|---------|
| 400 | Nothing to play (empty data, unknown variable) |
| 404 | Unknown dataset |
| 422 | Invalid input (bad zone, malformed cells) |
| 500 | Server error |

All errors include a `detail` message:

```json
{
  "detail": "Zone 'atlantis' not found. Available zones: france, switzerland, india, ..."
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JUKEBOX_DATA_DIR` | `simulation/output` | Intensity map data |
| `JUKEBOX_CACHE_DIR` | `backend/cache` | Composition cache |
| `JUKEBOX_CORS` | `*` | CORS allowed origins |

---

## Performance

### Timing

| Operation | Time |
|-----------|------|
| First composition | ~2-3s (with MP3) |
| Cached composition | ~10ms |
| MIDI only (no audio) | ~0.5s |
| With VSCO samples | ~5-10s |

### Optimization Techniques

1. **Request caching**: Identical requests served from cache
2. **Lazy loading**: Data loaded on demand
3. **Parallel rendering**: Multiple instruments rendered concurrently
4. **Streaming**: Large files can be streamed

---

## Next Steps

- [Sonification Pipeline](sonification.md)
- [API Reference](../api/reference.md)
- [Backend Developer Guide](../developer-guide/backend.md)
