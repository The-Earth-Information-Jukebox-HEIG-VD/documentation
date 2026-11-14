# API Reference

Complete REST API documentation for the Earth Information Jukebox backend.

---

## Base URL

- **Development**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs`

CORS is open by default (`JUKEBOX_CORS=*`).

---

## Endpoints Overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check and capabilities |
| GET | `/api/options` | UI menu options |
| GET | `/api/instruments` | Dataset-to-instrument mapping |
| GET | `/api/datasets` | Available datasets |
| POST | `/api/sonify` | Generate audio chunk |
| POST | `/api/compose` | Full composition |
| GET | `/api/compositions/{id}` | Fetch composition |
| GET | `/api/files/{id}/{file}` | Download file |

---

## GET `/api/health`

Check server status and capabilities.

### Response

```json
{
  "status": "healthy",
  "datasets": 3,
  "audio_available": true,
  "orchestral_samples": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Server status |
| `datasets` | int | Number of available datasets |
| `audio_available` | bool | Whether audio rendering is available |
| `orchestral_samples` | bool | Whether VSCO samples are installed |

---

## GET `/api/options`

Get UI configuration options.

### Response

```json
{
  "zones": [
    {
      "id": "global",
      "name": "Global",
      "bbox": [-90, 90, -180, 180]
    },
    {
      "id": "switzerland",
      "name": "Switzerland",
      "bbox": [45.8, 47.8, 5.9, 10.5]
    }
  ],
  "palettes": ["orchestra", "auto"],
  "keys": ["C", "D", "Eb", "E", "F", "G", "A", "Bb", "B"],
  "scales": ["major", "minor", "pentatonic"],
  "default_request": {
    "zone": "global",
    "bpm": 76,
    "key": "C"
  }
}
```

---

## GET `/api/instruments`

Get dataset-to-instrument mapping.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `palette` | string | Palette name (default: "orchestra") |
| `zone` | string | Zone ID for regional instruments |

### Response

```json
{
  "palette": "orchestra",
  "by_dataset": {
    "temperature": "Piano (chords)",
    "co2": "Contrabass",
    "precipitation": "Violins (melody)",
    "dust": "Flute (melody)",
    "smoke": "French Horns (melody)",
    "lightning": "Xylophone"
  },
  "instruments": [
    {
      "dataset_id": "temperature",
      "variable": "surface_temperature",
      "label": "Temperature",
      "instrument": "Piano (chords)",
      "role": "harmony",
      "always_playing": true,
      "units": "degC",
      "available": true,
      "real_data": false,
      "midi_program": 0,
      "pitch_range": [48, 72]
    }
  ]
}
```

---

## GET `/api/datasets`

List available datasets.

### Response

```json
{
  "datasets": [
    {
      "id": "real_daily_2024",
      "name": "Real Daily Data 2024",
      "variables": {
        "surface_temperature": {
          "units": "degC",
          "range": [-40, 50],
          "instrument": "Piano"
        },
        "precipitation": {
          "units": "mm/day",
          "range": [0, 100],
          "instrument": "Violins"
        }
      },
      "frames": 366,
      "time_start": "2024-01-01",
      "time_end": "2024-12-31",
      "grid": [180, 360]
    }
  ]
}
```

---

## POST `/api/sonify`

Generate a chunk of audio for selected points and time period.

### Request

```json
{
  "zone_id": "france",
  "zone_name": "France",
  "points": [
    {"lat": 48.8566, "lng": 2.3522},
    {"lat": 48.1173, "lng": -1.6778}
  ],
  "time_period": "2024-03",
  "aggregation": "mean",
  "duration_s": 30,
  "audio_format": "mp3",
  "embed_audio": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `zone_id` | string | No | Zone identifier (echoed back) |
| `zone_name` | string | No | Zone display name (echoed back) |
| `points` | array | Yes* | Selected points with lat/lng |
| `dataset_id` | string | No | Variable to sonify (default: all) |
| `time_period` | string | No | Start period (e.g., "2024-03") |
| `aggregation` | string | No | Only "mean" supported |
| `duration_s` | number | No | Duration in seconds (default: 30) |
| `audio_format` | string | No | "mp3" or "wav" (default: mp3) |
| `embed_audio` | bool | No | Include base64 audio (default: true) |
| `options` | object | No | Additional compose options |

*Without `points`, `zone_id` must be a preset zone.

### Response

```json
{
  "zone_id": "france",
  "zone_name": "France",
  "dataset_id": "temperature",
  "time_period": "2024-03",
  "next_time_period": "2025-01",
  "audio_data": "<base64 encoded audio>",
  "audio_format": "mp3",
  "audio_url": "http://localhost:8000/api/files/abc123/score.mp3",
  "value": 9.42,
  "units": "degC",
  "values": {
    "surface_temperature": 9.42
  },
  "point_count": 2,
  "cell_count": 2,
  "aggregation": "mean",
  "time_end": "2024-12",
  "duration_s": 30.0,
  "composition_id": "abc123",
  "cached": false
}
```

### Playing the Audio

```javascript
// Using base64 data
const audio = new Audio(`data:audio/mpeg;base64,${response.audio_data}`);
audio.play();

// Using URL
const audio = new Audio(response.audio_url);
audio.play();
```

---

## POST `/api/compose`

Full composition with all options.

### Request

```json
{
  "dataset": "real_daily_2024",
  "zone": "switzerland",
  "cells": null,
  "bbox": null,
  "surface": "all",
  "start": "2024-06",
  "end": "2025-03",
  "variables": null,
  "palette": "orchestra",
  "key": "C",
  "scale": null,
  "bpm": 76,
  "audio": true,
  "audio_format": "mp3",
  "style": "data",
  "include_notes": true,
  "score_image": false
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `dataset` | string | auto | Dataset ID |
| `zone` | string | "global" | Preset zone ID |
| `cells` | array | null | Custom area as `[[row, col], ...]` |
| `cells_grid` | array | null | Grid shape for cells `[rows, cols]` |
| `bbox` | array | null | Bounding box `[lat_min, lat_max, lon_min, lon_max]` |
| `surface` | string | "all" | "all", "land", or "ocean" |
| `start` | string | first | Start date or frame |
| `end` | string | last | End date or frame |
| `year` | int | null | Start year (alternative to start) |
| `month` | int | null | Start month (1-12) |
| `duration_s` | number | null | Duration instead of end |
| `variables` | array | null | Subset of variables |
| `palette` | string | "orchestra" | Instrument palette |
| `key` | string | "C" | Musical key |
| `scale` | string | "major" | Scale type |
| `bpm` | number | 76 | Tempo |
| `frames_per_bar` | int | auto | Data frames per bar |
| `audio` | bool | true | Render audio |
| `audio_format` | string | "mp3" | "mp3" or "wav" |
| `audio_engine` | string | "auto" | "auto", "vsco", or "sf2" |
| `style` | string | "data" | "data" or "musical" |
| `quantize` | string | "scale" | Pitch quantization |
| `markers` | bool | true | Anomaly markers (data style) |
| `intro` | bool | true | Include intro (musical style) |
| `tension` | bool | true | Tension features (musical style) |
| `climax` | bool | true | Highlight climax (musical style) |
| `humanize` | float | 0.5 | Human timing (0-1) |
| `include_notes` | bool | true | Include note arrays |
| `score_image` | bool | false | Generate score PNG |

### Response

```json
{
  "id": "195820c264227acb",
  "cached": false,
  "elapsed_s": 2.64,
  "request": {
    "dataset": "real_daily_2024",
    "zone": "switzerland",
    "palette": "orchestra",
    "key": "C",
    "bpm": 76
  },
  "files": {
    "midi": "http://localhost:8000/api/files/195820c264227acb/score.mid",
    "score_json": "http://localhost:8000/api/files/195820c264227acb/score.json",
    "audio": "http://localhost:8000/api/files/195820c264227acb/score.mp3",
    "stems": {
      "temperature": "http://localhost:8000/api/files/195820c264227acb/score_stems/temperature.mid"
    },
    "score_image": null
  },
  "score": {
    "zone": "switzerland",
    "bbox": [45.8, 47.8, 5.9, 10.5],
    "surface": "all",
    "palette": "orchestra",
    "key": "C",
    "scale": "major",
    "bpm": 76,
    "beats_per_bar": 4,
    "n_bars": 24,
    "total_beats": 104,
    "duration_s": 82.11,
    "time_start": "2024-01-15T00:00:00Z",
    "time_end": "2025-12-15T00:00:00Z",
    "harmony_source": "co2",
    "bars": [
      {
        "index": 0,
        "start_beat": 0,
        "start_s": 0.0,
        "time": "2024-01-15T00:00:00Z",
        "chord": "Am",
        "tension": 0.3,
        "mode": "minor",
        "climax": false
      }
    ],
    "instruments": {
      "surface_temperature": {
        "name": "Temperature - Piano (chords)",
        "role": "melody",
        "program": 0,
        "channel": 0,
        "pan": 40,
        "register": [48, 84],
        "units": "degC",
        "bars_playing": 24,
        "pitch_range": [52, 76],
        "values_per_beat": [5.2, 5.1, 5.0, 4.9],
        "presence_per_beat": [1.0, 1.0, 1.0, 1.0],
        "levels_per_bar": [1, 1, 1, 1],
        "anomaly_z_per_bar": [0.5, 0.3, 0.2, 0.1],
        "source": "REAL",
        "notes": [
          {
            "pitch": 60,
            "start": 0.0,
            "duration": 0.97,
            "velocity": 66,
            "time_s": 0.0,
            "duration_s": 0.76
          }
        ]
      }
    },
    "sections": [
      {
        "name": "intro",
        "start_bar": 0,
        "bars": 4,
        "start_s": 0.0
      },
      {
        "name": "data",
        "start_bar": 4,
        "bars": 18,
        "start_s": 12.6
      },
      {
        "name": "climax",
        "start_bar": 18,
        "bars": 2,
        "start_s": 68.4,
        "time": "2024-09-15T00:00:00Z",
        "tension": 0.95
      }
    ],
    "stats": {
      "notes_total": 192,
      "polyphony_mean": 3.45,
      "polyphony_max": 7,
      "tense_bars": 8,
      "max_tension": 0.95
    }
  }
}
```

---

## GET `/api/compositions/{id}`

Retrieve an earlier composition.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Composition ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_notes` | bool | true | Include note arrays |

### Response

Same as POST `/api/compose` response.

---

## GET `/api/files/{id}/{file}`

Download a generated file.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Composition ID |
| `file` | string | Filename (e.g., "score.mp3", "score.mid") |

### Examples

```
GET /api/files/abc123/score.mp3
GET /api/files/abc123/score.mid
GET /api/files/abc123/score.json
GET /api/files/abc123/score_stems/temperature.mid
```

---

## Error Responses

### 400 Bad Request

Nothing to play (empty data, unknown variable).

```json
{
  "detail": "No data available for the selected time range"
}
```

### 404 Not Found

Unknown dataset or composition.

```json
{
  "detail": "Dataset 'unknown' not found"
}
```

### 422 Unprocessable Entity

Invalid input (bad zone, malformed cells).

```json
{
  "detail": "Zone 'atlantis' not found. Available zones: global, switzerland, france, ..."
}
```

---

## Examples

### cURL

```bash
# Health check
curl http://localhost:8000/api/health

# Get options
curl http://localhost:8000/api/options

# Simple sonification
curl -X POST http://localhost:8000/api/sonify \
  -H 'Content-Type: application/json' \
  -d '{"zone_id": "france", "time_period": "2024-03"}'

# Full composition
curl -X POST http://localhost:8000/api/compose \
  -H 'Content-Type: application/json' \
  -d '{"zone": "switzerland", "start": "2024-01", "end": "2024-12"}'

# Custom area with cells
curl -X POST http://localhost:8000/api/compose \
  -H 'Content-Type: application/json' \
  -d '{"cells": [[42,186],[42,187],[43,186]], "duration_s": 30, "audio": false}'
```

### JavaScript

```javascript
// Fetch and play
const response = await fetch('http://localhost:8000/api/compose', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    zone: 'switzerland',
    start: '2024-01',
    end: '2024-12'
  })
});

const { files, score } = await response.json();

// Play audio
const audio = new Audio(files.audio);
audio.play();

// Sync visuals with bars
audio.ontimeupdate = () => {
  const currentBar = score.bars.find(
    bar => audio.currentTime >= bar.start_s
  );
  updateVisualization(currentBar);
};
```

### Python

```python
import httpx

async def sonify_zone(zone: str, time_period: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'http://localhost:8000/api/sonify',
            json={
                'zone_id': zone,
                'time_period': time_period,
                'duration_s': 30
            }
        )
        data = response.json()
        return data['audio_data'], data['next_time_period']
```

---

## Timing

| Operation | Approximate Time |
|-----------|------------------|
| First composition (with MP3) | ~2-3 seconds |
| Cached composition | ~10 milliseconds |
| MIDI only (no audio) | ~0.5 seconds |
| With VSCO samples | ~5-10 seconds |

---

## Rate Limits

No rate limits on the local development server. In production, consider implementing:

- Request throttling
- Audio generation queue
- Cache expiration
