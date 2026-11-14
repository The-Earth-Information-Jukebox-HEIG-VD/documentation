# Backend Development

The backend is a FastAPI application that composes the whole orchestra server-side from pre-processed NASA climate datasets and returns rendered audio. The webapp only plays the chunks it receives.

---

## Setup

Run everything from the `sonification/` folder (the app is `backend.app:app`):

```bash
cd sonification
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install --no-deps tinysoundfont          # audio rendering (--no-deps: it would pull in pyaudio)
python music/render_audio.py --download      # fetch the SoundFont once (~32 MB)
uvicorn backend.app:app --reload --port 8000
```

API docs at http://localhost:8000/docs

!!! warning "Audio needs more than pip"
    MP3 output needs `ffmpeg` on the PATH. Without `tinysoundfont` (or `ffmpeg`) `GET /api/health` reports `audio_rendering` / `mp3_encoding` as `false` and `POST /api/sonify` answers `503`. Optional orchestral samples: `python music/sampler.py --download` (~440 MB).

The server needs data to play. Either point `JUKEBOX_DATA_DIR` at converted datasets, or convert the team's raw folders from the `datasets` repository:

```bash
python backend/prepare_data.py --raw ../datasets/data --out simulation/output
```

---

## Project Structure

```
sonification/
├── backend/
│   ├── app.py              # FastAPI application (all routes)
│   ├── serve.py            # Docker entry point: prepare_data in the background + uvicorn
│   ├── prepare_data.py     # raw .npy folders -> <prefix>_<variable>.npz + .json datasets
│   ├── API.md              # engine API (development)
│   ├── FRONTEND_API.md     # the calls the webapp uses
│   ├── test_api.py         # end-to-end API tests
│   ├── test_prepare_data.py
│   └── cache/              # generated compositions (default JUKEBOX_CACHE_DIR)
├── music/
│   ├── orchestra.py        # instrument definitions (ORCHESTRA) + score composition
│   ├── zone_to_midi.py     # zones, scales, one variable -> MIDI
│   ├── composition.py      # tempo map, harmony helpers
│   ├── midi_writer.py
│   ├── sampler.py          # SFZ sampler (VSCO 2 CE orchestral samples)
│   └── render_audio.py     # MIDI -> WAV/MP3 (samples or SoundFont) + reverb
├── simulation/
│   ├── build_monthly_dataset.py   # raw monthly maps -> dataset (used by prepare_data.py)
│   ├── simulate_variables.py      # simulated demo data
│   └── INTENSITY_MAP_SPEC.md      # the data contract
├── soundfonts/             # GeneralUser GS, VSCO samples (downloaded)
├── Dockerfile
└── requirements.txt
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JUKEBOX_DATA_DIR` | `simulation/output` (`/app/data` in Docker) | Folder with the datasets (`<prefix>_<variable>.npz` + `.json`), or, with `prepare_data.py`, the team's raw folders |
| `JUKEBOX_CACHE_DIR` | `backend/cache` (`/app/cache` in Docker) | Generated compositions (safe to delete); must be writable |
| `JUKEBOX_BUILT_DIR` | `<cache>/_datasets` | Datasets converted from the raw folders by `prepare_data.py`; scanned in addition to `JUKEBOX_DATA_DIR` |
| `JUKEBOX_CORS` | `*` | Allowed CORS origins, comma-separated |
| `JUKEBOX_FULL_API` | `1` (`0` in Docker) | `0` serves only `/api/health`, `/api/instruments`, `/api/sonify` and `/api/zones/zone-data` |
| `JUKEBOX_MERGE_DATASETS` | `0` (`1` in Docker) | `1`: each requested variable is read from its own dataset and lined up by date |
| `JUKEBOX_CHUNK_SECONDS` | `30` | Length of one piece returned by `/api/sonify` |
| `JUKEBOX_PREPARE` | `1` | `serve.py` only: `0` skips the raw-data conversion at start-up |
| `PORT` | `8000` | `serve.py` only (Docker entry point) |

---

## Datasets

One dataset per variable, one bar per month. In the Docker image the `datasets` repository is mounted read-only at `/app/data` with one folder per dataset, one `.npy` per month (720 x 1440 grid of 0.25° pixels, NaN = no data; night lights are one file per year):

```
precipitation_rain_2000_2026/rain_<YYYY>_<MM>.npy          (mm/h)
precipitation_snow_2000_2026/snow_<YYYY>_<MM>.npy          (mm/h of melted water)
nightlights_2012_2023/nightlights_<YYYY>.npy               (brightness 0-1, one file per year)
temperature_anomaly_1880_2025/temperature_anomaly_<YYYY>_<MM>.npy
lightning_2017_2023/lightning_<YYYY>_<MM>.npy              (share of each pixel with lightning, 0-1)
co2_2002_2022/co2_<YYYY>_<MM>.npy                          (ppm)
```

At start-up `serve.py` runs `prepare_data.py` in the background. It converts those folders into the datasets below in `<cache>/_datasets`:

| dataset | content |
|---|---|
| `real_temperature_1880_2025` | temperature anomaly, every month since 1880, 2° |
| `real_precipitation_2000_2026` | rain, 1° |
| `real_snow_2000_2026` | snow (melted water), 1° |
| `real_nightlights_2012_2023` | night lights, 1°; one map per year, repeated for its 12 months |
| `real_lightning_2017_2023` | lightning activity, 1°, 55°S to 55°N |
| `real_co2_2002_2022` | CO₂, 1°, map-outline pixels removed |

- The API answers at once; `GET /api/health` has `"preparing_data": true` until the conversion is over, and each dataset appears in `GET /api/datasets` when ready. The first start takes a few minutes; with the cache on a volume, later starts only rebuild what changed.
- The recipes are the `RECIPES` list at the top of `backend/prepare_data.py`. A folder it does not know is ignored (for instance `fires_2002_2026` in the `datasets` repository has no recipe yet).
- Ready-made `<prefix>_<variable>.npz` + `.json` files placed directly in `JUKEBOX_DATA_DIR` are served as before.
- The CO₂ maps still carry the outline of the source picture; the converter sets those pixels to NaN, so very small areas can have little or no CO₂ in some months.

---

## API Endpoints

See the [API reference](../api/reference.md) for schemas.

| Method | Path | Served when `JUKEBOX_FULL_API=0` | Description |
|--------|------|:---:|-------------|
| GET | `/api/health` | yes | Status, `preparing_data`, `audio_rendering` |
| GET | `/api/instruments` | yes | Dataset-to-instrument mapping (webapp call) |
| POST | `/api/sonify` | yes | One 30 s audio chunk |
| POST | `/api/zones/zone-data` | yes | Same as `/api/sonify` with the webapp's field names (`dataset_ids`); the webapp's call |
| GET | `/api/options` | no | UI menu options (zones, palettes, scales...) |
| GET | `/api/datasets` | no | Available datasets |
| POST | `/api/sonify/debug` | no | `/api/sonify` with the engine's knobs and a detailed answer |
| POST | `/api/compose` | no | Full composition with every option and the score |
| GET | `/api/compositions/{id}` | no | Fetch an earlier composition |
| GET | `/api/files/{id}/{file}` | no | Download a generated file |

The deployed image serves only the first four rows. Use `-e JUKEBOX_FULL_API=1` to also serve the engine's endpoints.

---

## Creating an Endpoint

Routes are defined directly in `backend/app.py` on the single `app` object (there is no `routes/` package):

```python
from fastapi import HTTPException
from pydantic import BaseModel

class MyRequest(BaseModel):
    value: int
    name: str | None = None

@app.post("/api/my-endpoint")
def my_endpoint(request: MyRequest):
    if request.value < 0:
        raise HTTPException(status_code=422, detail="Value must be positive")
    return {"result": f"Processed {request.value}"}
```

!!! note
    With `JUKEBOX_FULL_API=0` the app removes every `/api/` route that is not in `FRONTEND_PATHS` (end of `app.py`). Add the path there if the new endpoint must be served by the Docker image.

---

## Music Composition

### Orchestra Definition

```python
# music/orchestra.py
ORCHESTRA = {
    "surface_temperature": dict(name="Temperature - Piano (chords)", role="harmony", program=0, channel=0,
                                low=48, high=72, gain=1.0, gate=0.0, levels=[0.45, 0.75], level=0.65, pan=64,
                                always_on=True),
    "precipitation":       dict(name="Rain - Violins (melody)", role="melody", program=48, channel=1,
                                low=67, high=91, gain=2.5, gate=0.10, levels=[0.35, 0.65], level=0.90, pan=36,
                                tremolo=4),
    # ... co2, snowfall, lightning, nightlights, aerosol_dust, aerosol_smoke
}
```

The full instrument table is in [Sonification Development](sonification.md#the-orchestra).

### Adding a New Instrument

1. Add the variable to `ORCHESTRA` in `music/orchestra.py` (role, GM program, register).
2. Provide its data (a recipe in `backend/prepare_data.py` / `SOURCES` in `simulation/build_monthly_dataset.py`).
3. Add its `dataset_id` to `SHORT_IDS` (and `VARIABLE_ALIASES`) in `backend/app.py`.
4. The composer and the sampler pick it up from `ORCHESTRA`.

---

## Testing

```bash
cd sonification
python -m pytest backend/test_api.py -q       # end-to-end API tests (needs datasets in JUKEBOX_DATA_DIR)
python -m pytest backend/test_prepare_data.py -q
python -m pytest simulation/test_build_monthly_dataset.py -q
python backend/test_api.py                    # same API tests without pytest
```

The API tests use a temporary cache directory (`JUKEBOX_CACHE_DIR`). Generate data first (`python simulation/simulate_variables.py ...`) or point `JUKEBOX_DATA_DIR` at converted datasets.

### Example Test

```python
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

---

## Error Handling

```python
# 400: Nothing to process
raise HTTPException(status_code=400, detail="No data available")

# 404: Resource not found
raise HTTPException(status_code=404, detail="Dataset not found")

# 422: Validation error (also produced automatically by pydantic)
raise HTTPException(status_code=422, detail="Invalid zone")

# 503: audio cannot be rendered on this server (see GET /api/health)
```

---

## Caching

Compositions are cached on disk in `JUKEBOX_CACHE_DIR/<id>/`, where `id` is a 16-character hash of the request and of the data files (name and modification time):

```python
payload = req.model_dump(exclude={"include_notes"})
payload["_data"] = data_stamp       # dataset files and mtimes
payload["_v"] = API_VERSION
key = hashlib.sha1(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()[:16]
```

- The same request again is served from cache in milliseconds instead of 2 to 5 seconds
- Concurrent identical requests wait on one lock instead of composing twice
- The cache can be deleted without data loss (the converted datasets live in `<cache>/_datasets`: deleting those only forces a reconversion)

---

## Docker

```bash
cd sonification
docker build -t earth-jukebox-sonification .        # ~1 GB; --build-arg WITH_VSCO=1 adds the orchestral samples (+440 MB)
docker run -p 8000:8000 \
  -v /path/to/datasets/data:/app/data:ro \
  -v jukebox-cache:/app/cache \
  earth-jukebox-sonification
```

The image is self-contained for audio (`tinysoundfont`, `ffmpeg`, the GeneralUser GS SoundFont) and its health check calls `GET /api/health`. It runs `python backend/serve.py`. See the deployment documentation for the compose setup.
