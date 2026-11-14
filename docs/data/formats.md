# Data Formats

Specifications for data files used in Earth Information Jukebox.

---

## Intensity Maps

The primary data format for sonification.

### NPZ Format

Compressed NumPy archive containing:

```python
import numpy as np

# Load intensity map
data = np.load("temperature.npz")

print(data.files)  # ['values', 'times']

values = data["values"]  # Shape: (frames, lat, lon)
times = data["times"]    # Shape: (frames,)

print(values.shape)  # e.g., (366, 180, 360)
print(times[0])      # e.g., "2024-01-01"
```

### Structure

| Key | Shape | Type | Description |
|-----|-------|------|-------------|
| `values` | (F, H, W) | float32 | Climate values |
| `times` | (F,) | string | ISO date strings |

Where:
- F = number of frames (time steps)
- H = latitude dimension (typically 180 for 1°)
- W = longitude dimension (typically 360 for 1°)

### Coordinate System

```
┌─────────────────────────────────────┐
│ Row 0   = 90°N  (top)              │
│ Row 89  = 0°    (equator)          │
│ Row 179 = 90°S  (bottom)           │
├─────────────────────────────────────┤
│ Col 0   = 180°W (left)             │
│ Col 179 = 0°    (prime meridian)   │
│ Col 359 = 180°E (right)            │
└─────────────────────────────────────┘
```

### Example

```python
# Get temperature at Paris (48.86°N, 2.35°E) for frame 0
lat = 48.86
lon = 2.35

row = int((90 - lat))  # 41
col = int((lon + 180)) # 182

temperature = values[0, row, col]
```

---

## Metadata JSON

Accompanying JSON file with variable metadata.

### Format

```json
{
  "variable": "surface_temperature",
  "label": "Temperature",
  "units": "degC",
  "min_value": -40.0,
  "max_value": 50.0,
  "grid": [180, 360],
  "resolution": "1deg",
  "time_start": "2024-01-01",
  "time_end": "2024-12-31",
  "frames": 366,
  "source": "NASA POWER API",
  "real_data": true,
  "instrument": "Piano (chords)",
  "role": "harmony"
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `variable` | string | Internal variable ID |
| `label` | string | Display name |
| `units` | string | Value units |
| `min_value` | float | Minimum expected value |
| `max_value` | float | Maximum expected value |
| `grid` | [int, int] | [height, width] in cells |
| `resolution` | string | "1deg", "0.5deg", etc. |
| `time_start` | string | First frame date (ISO) |
| `time_end` | string | Last frame date (ISO) |
| `frames` | int | Number of time frames |
| `source` | string | Data source description |
| `real_data` | bool | True if observed, false if simulated |
| `instrument` | string | Assigned instrument |
| `role` | string | "melody", "harmony", "bass" |

---

## MIDI Format

Generated musical scores.

### Standard MIDI File

```
score.mid
├── Track 0: Tempo and time signature
├── Track 1: Temperature (Piano)
├── Track 2: CO2 (Contrabass)
├── Track 3: Precipitation (Violins)
└── ...
```

### Per-Instrument MIDI

```
score_stems/
├── temperature.mid
├── co2.mid
├── precipitation.mid
└── ...
```

---

## Score JSON

Complete score representation.

### Format

```json
{
  "zone": "switzerland",
  "bbox": [45.8, 47.8, 5.9, 10.5],
  "palette": "orchestra",
  "key": "C",
  "scale": "major",
  "bpm": 76,
  "beats_per_bar": 4,
  "n_bars": 24,
  "total_beats": 96,
  "duration_s": 75.79,
  "time_start": "2024-01-15T00:00:00Z",
  "time_end": "2024-12-15T00:00:00Z",

  "bars": [
    {
      "index": 0,
      "start_beat": 0,
      "start_s": 0.0,
      "time": "2024-01-15T00:00:00Z",
      "chord": "C",
      "tension": 0.2,
      "mode": "major",
      "climax": false
    }
  ],

  "instruments": {
    "surface_temperature": {
      "name": "Temperature - Piano",
      "role": "harmony",
      "program": 0,
      "channel": 0,
      "pitch_range": [48, 84],
      "units": "degC",
      "values_per_beat": [5.2, 5.1, 5.0, 4.9],
      "presence_per_beat": [1.0, 1.0, 1.0, 1.0],
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
      "name": "data",
      "start_bar": 0,
      "bars": 24,
      "start_s": 0.0
    }
  ],

  "stats": {
    "notes_total": 192,
    "polyphony_mean": 3.2,
    "polyphony_max": 6
  }
}
```

---

## Audio Formats

### MP3

- Lossy compression
- ~192 kbps bitrate
- Good for web delivery
- ~1 MB per minute

### WAV

- Uncompressed PCM
- 44.1 kHz, 16-bit stereo
- Highest quality
- ~10 MB per minute

### File Naming

```
{composition_id}/
├── score.mid          # Full MIDI
├── score.mp3          # Compressed audio
├── score.wav          # Uncompressed audio
├── score.json         # Score data
└── score_stems/       # Per-instrument MIDI
    ├── temperature.mid
    └── ...
```

---

## API Response Format

### Composition Response

```json
{
  "id": "abc123def456",
  "cached": false,
  "elapsed_s": 2.34,
  "request": { /* original request */ },
  "files": {
    "midi": "http://api/files/abc123/score.mid",
    "audio": "http://api/files/abc123/score.mp3",
    "score_json": "http://api/files/abc123/score.json",
    "stems": {
      "temperature": "http://api/files/abc123/score_stems/temperature.mid"
    }
  },
  "score": { /* score JSON */ }
}
```

### Sonify Response

```json
{
  "audio_data": "<base64 encoded>",
  "audio_format": "mp3",
  "audio_url": "http://api/files/abc123/score.mp3",
  "time_period": "2024-03",
  "next_time_period": "2024-06",
  "value": 12.5,
  "units": "degC",
  "duration_s": 30.0
}
```

---

## File Size Guidelines

| Format | Typical Size | Use Case |
|--------|--------------|----------|
| NPZ (year, 1°) | ~50 MB | Full dataset |
| JSON metadata | ~1 KB | Configuration |
| MIDI | ~50 KB | Score export |
| MP3 (30s) | ~500 KB | Web playback |
| WAV (30s) | ~5 MB | High quality |
| Score JSON | ~200 KB | Full data |

---

## Next Steps

- [Data Sources](sources.md) - NASA APIs
- [Data Processing](processing.md) - Processing pipeline
