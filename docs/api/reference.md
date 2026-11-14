# API Reference

Complete REST API documentation for the Earth Information Jukebox backend (FastAPI, API version 2.1).

---

## Base URL

- **Development**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs`
- **Behind the webapp's nginx**: the same origin, `/api/...`

CORS is open by default (`JUKEBOX_CORS=*`, comma-separated list of origins). Every request and response is JSON, and errors have a `detail` message.

!!! info "Two sets of endpoints"
    The **deployed backend** (Docker image, `JUKEBOX_FULL_API=0`) serves only the webapp's calls: `GET /api/health`, `GET /api/instruments`, `POST /api/sonify` and `POST /api/zones/zone-data`. The **engine endpoints** (`/api/options`, `/api/datasets`, `/api/sonify/debug`, `/api/compose`, `/api/compositions/{id}`, `/api/files/...`) are served when `JUKEBOX_FULL_API=1`, the default outside Docker.

---

## Endpoints Overview

| Method | Path | Deployed | Description |
|--------|------|:---:|-------------|
| GET | `/api/health` | yes | Status, `preparing_data`, audio capabilities |
| GET | `/api/instruments` | yes | Which instrument plays which dataset |
| POST | `/api/sonify` | yes | Selected points + one time period in, 30 s of MP3 (base64) out |
| POST | `/api/zones/zone-data` | yes | Same as `/api/sonify` with the webapp's field names; **the call the webapp uses** |
| GET | `/api/options` | no | UI menu options |
| GET | `/api/datasets` | no | Available datasets |
| POST | `/api/sonify/debug` | no | `/api/sonify` with engine options and a detailed answer |
| POST | `/api/compose` | no | Full composition with every option and the score |
| GET | `/api/compositions/{id}` | no | Fetch an earlier composition |
| GET | `/api/files/{id}/{file}` | no | Download a generated file |

---

## GET `/api/health`

Check server status and capabilities.

### Response

```json
{
  "status": "ok",
  "version": "2.1",
  "datasets": 6,
  "data_dir": "/app/data",
  "built_dir": "/app/cache/_datasets",
  "preparing_data": false,
  "merge_datasets": true,
  "full_api": false,
  "audio_rendering": true,
  "mp3_encoding": true,
  "orchestral_samples": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"ok"` when the server is up |
| `version` | string | API version |
| `datasets` | int | Number of datasets currently available |
| `data_dir`, `built_dir` | string | Folders scanned for datasets |
| `preparing_data` | bool | `true` while the server is still converting raw data after a start (a few minutes, once): datasets can still be missing |
| `merge_datasets` | bool | `JUKEBOX_MERGE_DATASETS` |
| `full_api` | bool | `JUKEBOX_FULL_API` |
| `audio_rendering` | bool | `tinysoundfont` is installed |
| `mp3_encoding` | bool | `ffmpeg` is on the PATH |
| `orchestral_samples` | bool | VSCO 2 CE samples are installed |

---

## GET `/api/instruments`

Which instrument plays which dataset. No parameters. One entry per dataset the server has data for.

### Response

```json
{
  "palette": "orchestra",
  "by_dataset": {
    "temperature": "Piano (chords)",
    "co2": "Contrabass",
    "precipitation": "Violins (melody)",
    "snow": "Glockenspiel (melody)",
    "lightning": "Xylophone",
    "night_lights": "Harp (melody)"
  },
  "instruments": [
    {
      "dataset_id": "temperature",
      "name": "Temperature",
      "instrument": "Piano (chords)",
      "units": "degC anomaly",
      "first_time_period": "1880-01",
      "last_time_period": "2025-12",
      "midi_program": 0,
      "pitch_range": [48, 72],
      "role": "harmony",
      "always_playing": true
    }
  ]
}
```

| `dataset_id` | Instrument | Units | Data |
|---|---|---|---|
| `temperature` | Piano (chords) | °C anomaly | 1880-01 to 2025-12 |
| `co2` | Contrabass | ppm | 2002-09 to 2022-03 |
| `precipitation` | Violins (melody) | mm/day of rain | 2000-06 to 2026-11 |
| `snow` | Glockenspiel (melody) | mm/day of melted water | 2000-06 to 2026-11 |
| `lightning` | Xylophone | share of the area with lightning (0 to 1) | 2017-03 to 2023-07 |
| `night_lights` | Harp (melody) | brightness (0 to 1) | 2012-01 to 2023-12, one value per year |

(The periods are those of the datasets in the Docker image; the response reports whatever the server has.) `dust` and `smoke` also exist as instruments (flute, French horns) but only appear when a dataset for them is present. `first_time_period` / `last_time_period` are `YYYY-MM`, or `YYYY-MM-DD` for daily data. `role` is the instrument's role (`harmony`, `bass`, `melody`; the lightning xylophone is `percussion`).

`dataset_id` is what you send to `/api/sonify`. `co2_atmosphere` is also accepted for `co2`. The webapp's other tracks (`co2_emissions`, `wildfires`, `antarctica_melt`, `ecosystem`, `deforestation`) have no data yet.

---

## POST `/api/sonify`

The webapp's call: selected points and one time period in, 30 seconds of music out.

### Request

```json
{
  "zone_id": "france",
  "zone_name": "France",
  "dataset_id": "temperature",
  "points": [
    {"lat": 48.8566, "lng": 2.3522, "x": 512, "y": 234},
    {"lat": 48.1173, "lng": -1.6778, "x": 508, "y": 236}
  ],
  "time_period": "2024-03",
  "aggregation": "mean"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `zone_id` | string | No | Your own label, echoed back. Without `points`, it must be a preset zone (see `/api/options`) |
| `zone_name` | string | No | Your own label |
| `dataset_id` | string or string[] | No | A `dataset_id` of `/api/instruments`, or a list to hear several instruments together. Omitted (or `"all"` / `"orchestra"`) = every variable the server has data for in that period |
| `points` | array | Yes* | Selected points. `lat` (-90..90) and `lng` (-180..360) are used; `lon`, `latitude`, `longitude` are accepted as aliases; `x`, `y` are accepted and ignored |
| `time_period` | string | No | Where the music starts: `"YYYY-MM"` (a year alone, `"1950"`, also works; `"YYYY-MM-DD"` for daily data) |
| `aggregation` | string | No | `"mean"` (the only value, an area-weighted mean; anything else is a `422`) |

*Without `points`, `zone_id` must be a preset zone, otherwise `422`.

Unknown extra fields are ignored.

### Response

```json
{
  "zone_id": "france",
  "dataset_id": "temperature",
  "time_period": "2024-03",
  "next_time_period": "2025-01",
  "audio_data": "<base64 of an MP3 file>",
  "value": 1.42,
  "point_count": 2
}
```

| Field | Description |
|-------|-------------|
| `zone_id` | Echoed from the request |
| `dataset_id` | Echoed from the request |
| `time_period` | Where the music really starts. Differs from the request only when you ask for a date before the first data |
| `next_time_period` | Send it as the next `time_period` to continue. `null` when the data ends |
| `audio_data` | 30 seconds of music as a base64 MP3 |
| `value` | Mean of the main variable over the points at `time_period`, in the units of `/api/instruments` |
| `point_count` | Number of points received |

### What to expect

- **30 seconds is 10 months**: one bar of music per month. The next period after `2015-01` is `2015-11`, not `2015-02`: use `next_time_period`, do not add one month yourself. (With daily data, periods are days.)
- **Several datasets**: each instrument plays where its own data exists and is silent elsewhere (for example, temperature and precipitation from 1999: the violins come in in June 2000). A variable with no data at all in the period is left out of the piece.
- **Yearly data** (`night_lights`): the value is the year's, so the harp holds its note for 12 bars and changes in January.
- **The same value is the same note** in every chunk of the same area (the pitch scale is that of the whole series), so consecutive chunks connect.
- A first request takes 2 to 5 seconds; the same request again is immediate (cached).
- **Errors**: `400` unknown `dataset_id` (the message lists the available ones) or no data for these points and this period; `422` malformed request (no points and no preset zone, latitude out of range, another `aggregation`); `503` audio rendering is unavailable on the server (see `GET /api/health`).

### Playing the Audio

```javascript
// What the webapp does: decode the MP3 and schedule it on the Web Audio clock
const bytes = Uint8Array.from(atob(response.audio_data), c => c.charCodeAt(0));
const buffer = await audioContext.decodeAudioData(bytes.buffer);
const source = audioContext.createBufferSource();
source.buffer = buffer;
source.connect(audioContext.destination);
source.start();
```

---

## POST `/api/zones/zone-data`

**The call the webapp makes** (`fetchZoneData` in `webapp/src/services/sonificationApi.ts`). The same music as `/api/sonify`, with the webapp's field names: a list `dataset_ids` in, `dataset_ids` and `values` out.

### Request

```json
{
  "zone_id": "france",
  "zone_name": "France",
  "dataset_ids": ["temperature", "night_lights"],
  "points": [{"lat": 48.8566, "lng": 2.3522}, {"lat": 43.2965, "lng": 5.3698}],
  "time_period": "2015-01",
  "aggregation": "mean"
}
```

### Response

```json
{
  "zone_id": "france",
  "dataset_ids": ["temperature", "night_lights"],
  "time_period": "2015-01",
  "next_time_period": "2015-11",
  "audio_data": "<base64 of an MP3 file>",
  "values": {"temperature": 1.42, "night_lights": 0.031},
  "point_count": 2
}
```

A dataset the server has no data for is left out of the piece, not an error, as long as at least one remains (`400` otherwise); `dataset_ids` in the answer says which ones were combined. `values` has an entry for each dataset that has data at `time_period`.

---

## GET `/api/options`

*Engine endpoint.* Everything the UI needs to build menus.

### Response

```json
{
  "zones": [
    {"id": "global", "bbox": [-90, 90, -180, 180], "regional_palette": "orchestra"},
    {"id": "switzerland", "bbox": [45.8, 47.8, 5.9, 10.5], "regional_palette": "alps"}
  ],
  "palettes": [
    {"id": "orchestra", "default_scale": "major", "zones": ["europe"], "instruments": {"surface_temperature": "Piano (chords)"}},
    {"id": "alps", "default_scale": "major", "zones": ["switzerland", "alps"], "instruments": {"surface_temperature": "Clarinet"}}
  ],
  "orchestra": {
    "surface_temperature": {"name": "Temperature - Piano (chords)", "role": "harmony", "program": 0, "register": [48, 72]}
  },
  "scales": ["major", "minor", "dorian", "lydian", "harmonic_minor"],
  "keys": ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
  "surfaces": ["all", "land", "ocean"],
  "mappings": ["hybrid", "relative", "absolute"],
  "defaults": {"zone": "global", "bpm": 76.0, "key": "C", "style": "data"}
}
```

(Lists are shortened. `defaults` is the full default `/api/compose` request.) Preset zones: `global`, `northern_hemi`, `southern_hemi`, `tropics`, `arctic`, `antarctica`, `europe`, `switzerland`, `sahara`, `siberia`, `india`, `usa`, `amazon`, `australia`, `north_atlantic`, `nino34`, `pacific_center`, `alps`, `japan`, `china`, `andes`, `west_africa`, `caribbean`, `scotland_ireland`. `bbox` is `[lat_min, lat_max, lon_min, lon_max]`.

---

## GET `/api/datasets`

*Engine endpoint.* List available datasets.

### Response

```json
{
  "default": "real_temperature_1880_2025",
  "datasets": [
    {
      "id": "real_temperature_1880_2025",
      "variables": {
        "surface_temperature": {
          "units": "degC",
          "vmin": -5.0,
          "vmax": 5.0,
          "frames": 1752,
          "grid": [90, 180],
          "source": "Monthly surface temperature anomaly ...",
          "instrument": "Temperature - Piano (chords)",
          "real": true,
          "anomaly": true
        }
      },
      "times": ["1880-01-15T00:00:00Z", "..."],
      "resolution_deg": 2.0,
      "real_variables": ["surface_temperature"],
      "simulated": false,
      "frames": 1752,
      "time_start": "1880-01-15T00:00:00Z",
      "time_end": "2025-12-15T00:00:00Z"
    }
  ]
}
```

`default` is the dataset with the most real variables. `anomaly: true` means the values are degrees warmer or colder than normal: show "+1.2 °C vs normal", not "1.2 °C". Values shown above are illustrative.

---

## POST `/api/sonify/debug`

*Engine endpoint, development only.* The same request as `/api/sonify` plus the engine's knobs, answered with every detail.

| Extra field | Type | Default | Description |
|-------------|------|---------|-------------|
| `duration_s` | number | 30 (`JUKEBOX_CHUNK_SECONDS`) | Length of the piece, up to 600 |
| `audio_format` | string | `"mp3"` | `"mp3"` or `"wav"` |
| `embed_audio` | bool | `true` | Include `audio_data` (otherwise `null`; use `audio_url`) |
| `options` | object | none | Any field of `/api/compose` (`style`, `bpm`, `key`, `dataset`...) |

The response has the seven `/api/sonify` fields plus: `zone_name`, `audio_format`, `audio_url`, `units`, `values` (value of each instrument, by internal variable name), `cell_count`, `aggregation`, `time_end`, `duration_s`, `composition_id`, `cached`, `source_dataset`, `source_datasets` (`{variable: dataset}` when several were merged), `real_data`, `anomaly`.

---

## POST `/api/compose`

*Engine endpoint.* Full composition with all options. Every field is optional; the smallest request is `{}` (global zone, default dataset).

### Request

```json
{
  "dataset": null,
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
| `dataset` | string | auto | Dataset ID from `/api/datasets`. Left out = chosen by the server (has the requested `variables`, covers `start`, most real variables). With `JUKEBOX_MERGE_DATASETS=1` each variable comes from its own dataset |
| `zone` | string | `"global"` | Preset zone ID (unknown = `422`) |
| `cells` | array | null | Custom area of any shape as `[[row, col], ...]` on the data array (row 0 = north, column 0 = 180°W). Overrides `zone` and `bbox` |
| `cells_grid` | array | null | `[rows, cols]` of the array the positions refer to, when not the dataset's own grid (e.g. `[720, 1440]`); the selection is rescaled |
| `bbox` | array | null | `[lat_min, lat_max, lon_min, lon_max]`; `lon_min > lon_max` crosses the dateline. Overrides `zone` |
| `surface` | string | `"all"` | `"all"`, `"land"` or `"ocean"` |
| `start` | string or int | first | Start: date as text (`"2024-06"`, `"2024"`) or frame index (a number) |
| `end` | string or int | last | End, same forms; both ends included |
| `year` | int | null | Start year (instead of `start`) |
| `month` | int | null | Start month, 1 to 12 (needs `year`) |
| `duration_s` | number | null | Seconds of music from the start date, instead of `end` (0 to 600). The tempo is nudged so the bars last exactly this long |
| `variables` | array | null | Subset of variables, by internal name (e.g. `["surface_temperature", "co2"]`) |
| `palette` | string | `"orchestra"` | `"orchestra"`, `"auto"` (regional instruments for the zone) or a palette id |
| `key` | string | `"C"` | Tonic: `C`, `C#`, `D`, `Eb`, ... |
| `scale` | string | null | `major`, `minor`, `dorian`, `lydian` or `harmonic_minor`. Null = major (or the palette's mode) |
| `bpm` | number | 76 | Tempo, 30 to 200 |
| `frames_per_bar` | number | auto | Data frames per bar (default: daily data 7, monthly 1; 12 makes one bar a year) |
| `mapping` | string | `"hybrid"` | `"hybrid"`, `"relative"` or `"absolute"` |
| `pitch_range` | string | `"window"` | `"window"`: lowest/highest note = lowest/highest value of this piece. `"series"`: of the whole series of the area (`/api/sonify` uses this) |
| `loop` | bool | false | Loop cyclic data |
| `audio` | bool | true | Render audio |
| `audio_format` | string | `"mp3"` | `"mp3"` or `"wav"` |
| `audio_engine` | string | `"auto"` | `"auto"` (VSCO samples if installed, else SoundFont), `"vsco"`, `"sf2"` |
| `reverb` | number | 0.28 | 0 to 0.8 |
| `style` | string | `"data"` | `"data"`: every note follows the data. `"musical"`: orchestral arrangement with harmony, intro, climax |
| `quantize` | string | `"scale"` | Data style pitch grid: `"scale"`, `"pentatonic"`, `"chromatic"` |
| `markers` | bool | true | Data style: triangle on unusually hot months, woodblock on cold ones |
| `intro` | bool | true | Musical style only |
| `tension` | bool | true | Musical style only |
| `climax` | bool | true | Musical style only |
| `humanize` | number | 0.5 | Musical style only, 0 to 1 |
| `include_notes` | bool | true | `false` drops the note lists (about half the size) |
| `score_image` | bool | false | Also make a PNG of the score |

### Response

```json
{
  "id": "8f104320be01425f",
  "cached": false,
  "elapsed_s": 3.996,
  "request": {
    "dataset": "real_temperature_1880_2025",
    "datasets": null,
    "zone": "switzerland",
    "n_cells": null,
    "palette": "orchestra",
    "key": "C",
    "bpm": 76
  },
  "files": {
    "midi": "http://localhost:8000/api/files/8f104320be01425f/score.mid",
    "score_json": "http://localhost:8000/api/files/8f104320be01425f/score.json",
    "stems": {
      "surface_temperature": "http://localhost:8000/api/files/8f104320be01425f/score_stems/surface_temperature.mid"
    },
    "audio": "http://localhost:8000/api/files/8f104320be01425f/score.mp3",
    "score_image": null
  },
  "score": {
    "style": "data",
    "quantize": "scale",
    "zone": "switzerland",
    "bbox": [45.8, 47.8, 5.9, 10.5],
    "cells": null,
    "surface": "all",
    "palette": "orchestra",
    "key": "C",
    "scale": "major",
    "bpm": 76,
    "beats_per_bar": 4,
    "frames_per_bar": 1.0,
    "n_bars": 10,
    "intro_bars": 0,
    "total_beats": 40,
    "duration_s": 31.58,
    "tempo_map": [{"beat": 0.0, "bpm": 76}],
    "time_start": "2024-06-15T00:00:00Z",
    "time_end": "2025-03-15T00:00:00Z",
    "time_last_frame": "2025-03-15T00:00:00Z",
    "harmony_source": "co2",
    "sections": [{"name": "data", "start_bar": 0, "bars": 10, "start_s": 0.0}],
    "bars": [
      {
        "index": 0,
        "start_beat": 0,
        "start_s": 0.0,
        "time": "2024-06-15T00:00:00Z",
        "chord": null,
        "tension": 0.249,
        "mode": null,
        "climax": false
      }
    ],
    "instruments": {
      "surface_temperature": {
        "name": "Temperature - Piano (chords)",
        "role": "harmony",
        "program": 0,
        "channel": 0,
        "pan": 64,
        "register": [48, 72],
        "units": "degC",
        "source": "REAL",
        "anomaly": false,
        "values_per_beat": [-0.0226, -0.0547],
        "presence_per_beat": [0.5, 0.499],
        "pitch_range": [48, 79],
        "anomaly_z_per_bar": [-1.0, -0.8],
        "levels_per_bar": [2, 2],
        "bars_playing": 10,
        "notes": [
          {"pitch": 48, "start": 0.0, "duration": 0.9, "velocity": 50, "time_s": 0.0, "duration_s": 0.7105}
        ]
      }
    },
    "stats": {
      "notes_total": 547,
      "polyphony_mean": 4.4,
      "polyphony_max": 7,
      "tense_bars": 2,
      "max_tension": 0.675
    }
  }
}
```

(Values are illustrative and lists are shortened.) Notes on the score:

- In `data` style `bars[i].chord` and `mode` are `null`, `sections` is just `[data]` and `intro_bars` is 0. `bars[i].tension` is still reported (from the anomalies). In `musical` style the sections are `intro`, `data`, `climax`, `outro`.
- In `data` style an extra instrument `anomaly_markers` is present (GM drums: 81 triangle = hot, 77 woodblock = cold), except when the temperature is already an anomaly.
- Every note has `time_s` and `duration_s` in **real seconds**; use them rather than `start * 60 / bpm`.
- `score.time_last_frame` is the date of the last frame played; `score.time_end` is the start of the last bar.
- `request.datasets` is `{variable: dataset}` when several datasets were merged.
- The rendered audio is about 1.7 s longer than `duration_s` (the hall reverb rings out).

**Timing:** first request about 2 to 3 s with MP3 (5 to 10 s with orchestral samples), about 0.5 s without audio. The same request again is served from cache in about 10 ms.

---

## GET `/api/compositions/{id}`

*Engine endpoint.* Retrieve an earlier composition.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Composition ID (16 hex characters) |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_notes` | bool | true | Include note arrays |

### Response

Same as the POST `/api/compose` response (with `cached: true`). `404` if the composition does not exist.

---

## GET `/api/files/{id}/{file}`

*Engine endpoint.* Download a generated file (MIDI, MP3/WAV, JSON, PNG).

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Composition ID |
| `file` | string | Path inside the composition (e.g., "score.mp3", "score_stems/surface_temperature.mid") |

### Examples

```
GET /api/files/8f104320be01425f/score.mp3
GET /api/files/8f104320be01425f/score.mid
GET /api/files/8f104320be01425f/score.json
GET /api/files/8f104320be01425f/score_stems/surface_temperature.mid
```

`404` for an unknown composition or file.

---

## Error Responses

All errors have a `detail`.

### 400 Bad Request

Nothing to play (unknown `dataset_id` or variable, a time window or area with no data, positions outside the array).

```json
{
  "detail": "unknown dataset_id 'unicorns'; available: ['co2', 'lightning', ...] (see GET /api/instruments)"
}
```

### 404 Not Found

Unknown dataset, composition or file, or no dataset on the server.

```json
{
  "detail": "composition not found"
}
```

### 422 Unprocessable Entity

Invalid input (bad zone, malformed `cells` or `bbox`, `aggregation` other than `mean`, latitude out of range, no points). For validation errors `detail` can be a list of `{loc, msg}` objects.

```json
{
  "detail": "points is empty: send the selected points [{lat, lng}, ...]"
}
```

### 503 Service Unavailable

`/api/sonify`: audio rendering is not available on the server (see `GET /api/health`).

---

## Examples

### cURL

```bash
# Health check
curl http://localhost:8000/api/health

# Instruments and their data
curl http://localhost:8000/api/instruments

# Sonification of a point, starting in March 2024
curl -X POST http://localhost:8000/api/sonify \
  -H 'Content-Type: application/json' \
  -d '{"zone_id": "france", "dataset_id": "temperature", "points": [{"lat": 48.85, "lng": 2.35}], "time_period": "2024-03"}'

# Engine endpoints (JUKEBOX_FULL_API=1)
curl http://localhost:8000/api/options

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
// Fetch and play a full composition (engine endpoint)
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
  const currentBar = [...score.bars].reverse().find(
    bar => audio.currentTime >= bar.start_s
  );
  updateVisualization(currentBar);
};
```

### Python

```python
import httpx

async def sonify_points(points: list[dict], time_period: str):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            'http://localhost:8000/api/sonify',
            json={
                'zone_id': 'custom',
                'dataset_id': 'temperature',
                'points': points,
                'time_period': time_period,
            }
        )
        response.raise_for_status()
        data = response.json()
        return data['audio_data'], data['next_time_period']
```

---

## Timing

| Operation | Approximate Time |
|-----------|------------------|
| First `/api/sonify` or composition (with MP3) | ~2-5 seconds |
| Cached request | ~10 milliseconds |
| MIDI only (`audio: false`) | ~0.5 seconds |
| With VSCO samples | ~5-10 seconds |

---

## Rate Limits

No rate limits on the local development server. In production, consider implementing:

- Request throttling
- Audio generation queue
- Cache expiration
