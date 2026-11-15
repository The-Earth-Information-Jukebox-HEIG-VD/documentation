# API Reference

Complete REST API documentation for the Earth Information Jukebox backend (FastAPI, API version 2.15). The webapp built on it is **EarthChestra**, the Earth Information Jukebox project's app.

---

## Base URL

- **Development**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs`
- **Behind the webapp's nginx**: the same origin, `/api/...`

CORS is open by default (`JUKEBOX_CORS=*`, comma-separated list of origins). Every request and response is JSON, and errors have a `detail` message.

!!! info "Two sets of endpoints"
    The **deployed backend** (Docker image, `JUKEBOX_FULL_API=0`) serves only the webapp's calls: `GET /api/health`, `GET /api/instruments`, `GET /api/genres`, `POST /api/sonify`, `POST /api/zones/zone-data`, `POST /api/zones/series` and `POST /api/zones/groove` (`FRONTEND_PATHS` in `backend/app.py`). The contract of these seven is `sonification/backend/FRONTEND_API.md`. The **engine endpoints** (`/api/options`, `/api/datasets`, `/api/sonify/debug`, `/api/compose`, `/api/compositions/{id}`, `/api/files/...`) are served when `JUKEBOX_FULL_API=1`, the default outside Docker.

---

## Endpoints Overview

| Method | Path | Deployed | Description |
|--------|------|:---:|-------------|
| GET | `/api/health` | yes | Status, `preparing_data`, audio capabilities |
| GET | `/api/instruments` | yes | Which instrument plays which dataset (`?genre=` for another music style) |
| GET | `/api/genres` | yes | The music styles, for a menu (v2.8) |
| POST | `/api/sonify` | yes | Selected points + one time period in, 30 s of MP3 (base64) out |
| POST | `/api/zones/zone-data` | yes | Same as `/api/sonify` with the webapp's field names; **the call the webapp uses** |
| POST | `/api/zones/series` | yes | The whole monthly series of the selected area, no audio (the webapp's data graph) |
| POST | `/api/zones/groove` | yes | Vinyl mode (v2.6): a path in space at one fixed date in, its music (MP3, base64) out |

### Version history

| Version | Change |
|---|---|
| 2.4 | `POST /api/zones/series` (chart data) |
| 2.5 | `mask` instead of `points` |
| 2.6 | `POST /api/zones/groove` (vinyl mode) |
| 2.7 | `eras`: music through the ages (engine option) |
| 2.8 | `genre` (8 genres + `realistic`), `GET /api/genres`, `GET /api/instruments?genre=` |
| 2.9 | The temperature sets the tempo of each bar |
| 2.10 | `duration_s` and `bar_starts_s` in zone-data; `genre` in groove |
| 2.11 | Sea ice (`sea_ice`, bowed glass) |
| 2.12 | `"step": "year"`: the same month, year after year |
| 2.13 | The global CO2 sets the tempo by default (`tempo_source`); a 30 s chunk is about 8 to 13 months |
| 2.14 | Vegetation (`vegetation`), carbon monoxide (`carbon_monoxide`), ocean plankton (`chlorophyll`) |
| 2.15 | `realistic`: the heartbeat is the sound of the CO2 track (only when `co2` is selected), in place of city traffic |

The full changelog is in `sonification/backend/API.md`.
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
  "version": "2.15",
  "datasets": 11,
  "data_dir": "/app/data",
  "built_dir": "/app/cache/_datasets",
  "preparing_data": false,
  "merge_datasets": true,
  "full_api": false,
  "audio_rendering": true,
  "mp3_encoding": true,
  "orchestral_samples": false,
  "realistic_sounds": true
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
| `realistic_sounds` | bool | The recordings of the `realistic` genre are installed (`python music/soundscape.py --download`, done in the Docker image) |

---

## GET `/api/instruments`

Which instrument plays which dataset. One entry per dataset the server has data for.

| Query parameter | Description |
|---|---|
| `genre` | Optional. A genre of `GET /api/genres` (aliases accepted, `400` if unknown): `instrument` and `by_dataset` then name the instrument (or sound) of each dataset in that genre, and the answer has `"genre"`. Without it the answer is unchanged (the orchestra) |

### Response

```json
{
  "palette": "orchestra",
  "by_dataset": {
    "temperature": "Piano (chords)",
    "co2": "Contrabass",
    "precipitation": "Violins (melody)",
    "snow": "Glockenspiel (melody)",
    "fires": "Trombones",
    "lightning": "Timpani",
    "night_lights": "Synth pad",
    "sea_ice": "Bowed glass (melody)",
    "vegetation": "Clarinet (melody)",
    "carbon_monoxide": "Bassoon",
    "chlorophyll": "Vibraphone"
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
| `fires` | Trombones | days of the month with a fire | 2002-07 to 2026-11 |
| `lightning` | Timpani | share of the area with lightning (0 to 1) | 2017-03 to 2023-07 |
| `night_lights` | Synth pad | brightness (0 to 1) | 2012-01 to 2023-12, one value per year |
| `sea_ice` | Bowed glass (melody) | % of the sea covered by ice | 1979-01 to 2026-10, no value in 1987-12 and 1988-01 |
| `vegetation` | Clarinet (melody) | vegetation index (NDVI) | 2000-03 to 2026-10, land only |
| `carbon_monoxide` | Bassoon | 10^18 molecules/cm² | 2000-04 to 2024-10, 20 months without value |
| `chlorophyll` | Vibraphone | mg/m³ (played on a log scale) | 2002-07 to 2026-10, sea only |

(The periods are those of the datasets in the Docker image; the response reports whatever the server has.) `dust` and `smoke` also exist as instruments (flute, French horns) but only appear when a dataset for them is present. `first_time_period` / `last_time_period` are `YYYY-MM`, or `YYYY-MM-DD` for daily data. `role` is the instrument's role: `harmony` (piano), `bass` (contrabass), `melody` (violins, glockenspiel, bowed glass, clarinet), `swell` (trombones, synth pad, bassoon), `rhythm` (vibraphone); the lightning timpani report `percussion` (internally `timpani`, mapped by `ROLE_LABELS`).

`dataset_id` is what you send to `/api/sonify`. Aliases are also accepted: `co2_atmosphere` for `co2`, `fire` and `wildfires` for `fires`, `rain` for `precipitation`, `snowfall` for `snow`, `nightlights` for `night_lights`, `ice` and `seaice` for `sea_ice`, `ndvi` for `vegetation`, `co` for `carbon_monoxide`, `plankton` for `chlorophyll` (`VARIABLE_ALIASES` in `backend/app.py`). The webapp builds its tracks from this list, so it shows exactly these eleven.

`sea_ice` has no value on land: over an area it is the share of the sea that is frozen, and over land only it is `null` or 0 (the bowed glass stays silent). `vegetation` has no value over the sea and `chlorophyll` none over land.

---

## GET `/api/genres`

The music styles, for a menu (API v2.8). No parameters.

```json
{
  "default": "orchestra",
  "genres": [
    {"id": "orchestra", "name": "Orchestra", "bpm": 76,
     "description": "The orchestra: piano chords, contrabass, violins, glockenspiel, timpani, trombones"},
    {"id": "rocknroll", "name": "Rock'n'roll", "bpm": 150,
     "description": "Electric guitar, electric bass, tenor sax, backbeat drums"}
  ]
}
```

| `id` | `name` | `bpm` |
|---|---|---|
| `orchestra` | Orchestra | 76 |
| `ragtime` | Ragtime & early jazz | 96 |
| `swing` | Swing & big band | 126 |
| `rocknroll` | Rock'n'roll | 150 |
| `funk` | Funk & disco | 112 |
| `synthpop` | Synth-pop | 116 |
| `house` | House & electronic | 124 |
| `trap` | Modern pop & trap | 140 |
| `realistic` | Realistic sounds | 76 |

`bpm` is the genre's reference tempo; the tempo of each bar then follows the global CO2 (see [What to expect](#what-to-expect)). `realistic` has no instruments: each dataset is heard as the sound of what it is (rain, campfire, thunder, city traffic, street-lamp hum, singing ice, crickets, idling engines, bubbles), with a heartbeat at the CO2's tempo. Aliases are accepted wherever `genre` is: `jazz`, `rock`, `disco`, `electro`, `pop`, `classical`.

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
| `mask` | string | No | The same area as a compressed bitmap, **instead of** `points` (v2.5, recommended for big zones; see [below](#mask-big-zones-in-a-few-kb)). If both are sent, `mask` is used |
| `time_period` | string | No | Where the music starts: `"YYYY-MM"` (a year alone, `"1950"`, also works; `"YYYY-MM-DD"` for daily data) |
| `aggregation` | string | No | `"mean"` (the only value, an area-weighted mean; anything else is a `422`) |
| `genre` | string | No | A music style of `GET /api/genres` (v2.8; default `orchestra`, `400` if unknown). The answer then has `genre` |
| `step` | string | No | `"month"` (default) or `"year"` (v2.12): one bar per year, always the month of `time_period` (`"2020-11"` plays November 2020, November 2021, ...). Monthly data only. The answer then has `"step": "year"` |
| `eras` | bool | No | `true`: each bar takes the musical style of its date (v2.7; not with `genre`). The answer then has `era` and `eras` |

*Without `points` or `mask`, `zone_id` must be a preset zone, otherwise `422`.

Unknown extra fields are ignored.

### Response

```json
{
  "zone_id": "france",
  "dataset_id": "temperature",
  "time_period": "2024-03",
  "next_time_period": "2025-03",
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

- **The CO2 sets the tempo** (v2.13, every genre): each bar (one month) is played at the tempo of the global CO2 of its date, the genre's tempo x0.8 in 1880 (290 ppm) to about x1.23 today. A chunk is still 30 seconds, so **30 seconds is about 8 months in 1880 and 12 to 13 months today**: use `next_time_period`, do not add months yourself. `/api/zones/zone-data` also gives `bar_starts_s`, the start second of each month. (With daily data, periods are days.)
- **Several datasets**: each instrument plays where its own data exists and is silent elsewhere (for example, temperature and precipitation from 1999: the violins come in in June 2000). A variable with no data at all in the period is left out of the piece.
- **Yearly data** (`night_lights`): the value is the year's. The synth pad starts clearly each January, when the value changes, then fades slowly over the year to a softer background note.
- **The same value is the same note** in every chunk of the same area (the pitch scale is that of the whole series), so consecutive chunks connect.
- A first request takes 2 to 5 seconds; the same request again is immediate (cached).
- **Errors**: `400` unknown `dataset_id` (the message lists the available ones), unknown `genre`, `step: "year"` on data that is not monthly, `eras` with `genre`, or no data for these points and this period; `422` malformed request (no points, no mask and no preset zone, latitude out of range, another `aggregation`, an invalid `mask`); `503` audio rendering is unavailable on the server (see `GET /api/health`).

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
  "point_count": 2,
  "duration_s": 30.0,
  "bar_starts_s": [0.0, 2.774, 6.006, 8.918, 11.885, 14.966, 17.964, 20.6, 23.237, 26.658]
}
```

The request takes the same optional `mask`, `genre`, `step` and `eras` as `/api/sonify`. `duration_s` is the exact length of the audio (v2.10); `bar_starts_s[i]` is the second month `i` starts (the first is `0`, the bars are not all the same length since the tempo follows the CO2), and its length is the number of months up to `next_time_period`. Time what the listener hears with it instead of assuming 3 s per month. With `step: "year"` bar `i` is year `time_period + i`.

A dataset the server has no data for is left out of the piece, not an error, as long as at least one remains (`400` otherwise); `dataset_ids` in the answer says which ones were combined. `values` has an entry for each dataset that has data at `time_period`. With `mask`, `point_count` is the number of 0.1° cells it selects.

### `mask`: big zones in a few kB

As points, an ocean is about 57 000 entries, about 3 MB of JSON sent again with every chunk (the whole globe: 14 MB). `mask` (API v2.5) describes the same cells in 2 to 4 kB:

1. a grid of 1800 × 3600 booleans (0.1°), row 0 = 90°N, column 0 = 180°W, the same grid the points are placed on: point → `row = Math.min(Math.floor((90 - lat) * 1800 / 180), 1799)`, `col = Math.min(Math.floor(((lng + 180) % 360) * 3600 / 360), 3599)` (exactly these operations, in this order, so the floating-point rounding is the server's);
2. packed 8 cells per byte, row-major, first cell = highest bit (numpy `packbits`): 810 000 bytes;
3. compressed with zlib (the browser's `new CompressionStream("deflate")`), then base64.

The server finds exactly the cells the points would give, so the music and the values are identical. `mask` is accepted by `/api/sonify`, `/api/zones/zone-data` and `/api/zones/series`; the webapp sends it whenever the browser can build one (`utils/zoneMask.ts`). It is a `422` when it is not base64 of zlib data, does not inflate to exactly 810 000 bytes, or selects no cell.

---

## POST `/api/zones/series`

The whole monthly series of the selected area, for a chart (API v2.4; `mask` since v2.5). No audio: one value per month for each requested dataset, the same area-weighted mean (cos latitude, cells of 0.1°) as the `values` of `/api/zones/zone-data`, so the value played for a month is the value the chart shows for it. The webapp calls it as `fetchZoneSeries` (hook `useZoneSeries`) for its data graph.

### Request

```json
{
  "zone_id": "france",
  "zone_name": "France",
  "dataset_ids": ["temperature", "night_lights"],
  "points": [{"lat": 48.8566, "lng": 2.3522}, {"lat": 43.2965, "lng": 5.3698}],
  "aggregation": "mean"
}
```

`dataset_ids`: at least one id of `/api/instruments` (aliases accepted). `points`: 1 to 20 000 `{lat, lng}` (`x`, `y` accepted, not used), or instead `mask` (no size limit, the same format as above). `zone_id`, `zone_name` optional. `aggregation`: only `"mean"`.

### Response

```json
{
  "zone_id": "france",
  "step": "month",
  "point_count": 2,
  "series": {
    "temperature":  {"units": "degC anomaly", "anomaly": true, "start": "1880-01", "yearly": false,
                     "values": [-0.4215, -0.1022, null]},
    "night_lights": {"units": "brightness (0-1)", "anomaly": false, "start": "2012-01", "yearly": true,
                     "values": [0.1532, 0.1532]}
  },
  "missing": []
}
```

- `values[i]` is the month `start + i`; the axis has no gap (one value per month up to the dataset's last month), a month without data is `null`. Values are rounded to 4 decimals.
- `start` is **per dataset**: the first month of that dataset's own data, the same as its `first_time_period` in `/api/instruments`.
- `units` is the same text as in `/api/instruments`; `anomaly: true` = degrees away from a normal.
- `yearly: true` (`night_lights`): one map per year, so the 12 months of a year have the same value. Draw it as steps.
- Daily data is averaged per month.
- `missing`: the requested ids the server has no data for. They are left out of `series`, not an error, as long as one id is known.
- **Errors**: `400` when none of the ids is known; `422` malformed request (no points and no mask, more than 20 000 points, an invalid `mask`, no `dataset_ids`, another `aggregation`).
- The first request for an area takes up to about a second (the 1880 to today temperature); the same area again is immediate (cached in memory).

---

## POST `/api/zones/groove`

Vinyl mode (API v2.6): the date stays fixed, what moves is the place. The frontend sends the stretch of path the needle crosses next, the backend answers with its music. Bars are a fixed 3 s in every genre (unlike `/api/zones/zone-data`, whose bars follow the CO2 tempo); with `points_per_bar: 4` every point is one beat (0.75 s), so **a 30 s chunk is 40 points**. The music comes from `music/groove.py` in the sonification repository.

### Request

```json
{
  "zone_id": "record-1",
  "dataset_ids": ["temperature", "precipitation", "lightning", "fires"],
  "time_period": "2018-07",
  "points_per_bar": 4,
  "radius_deg": 2,
  "path": [{"lat": -0.5, "lng": 0.0}, {"lat": -0.5, "lng": 9.0}, {"lat": -0.5, "lng": 18.0}]
}
```

```js
// 30 s of an outer groove: a circle of latitude, 9 degrees per point (longitudes past 180 are wrapped)
const path = Array.from({ length: 40 }, (_, i) => ({ lat: -0.5, lng: i * 9 }));
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `time_period` | string | Yes | The fixed date: a month `"2018-07"` or a whole year `"2018"` (the mean of its months: calmer, and covers more datasets) |
| `path` | array | Yes | The points `{lat, lng}` the needle crosses, in order. Whole bars: a multiple of `points_per_bar`, at most 20 bars (60 s) and 80 points. Points closer than about 2° add nothing (the maps are 1°, temperature 2°) |
| `points_per_bar` | int | No | `1`, `2` or `4` (default `1`): how many points share one 3 s bar. `4` = one point per beat (0.75 s) |
| `radius_deg` | float | No | How wide the needle reads, from 0.1 to 10 (default 1.5): each point is the mean over a disc of that radius. Wide = smooth music, narrow = detailed and jumpy |
| `dataset_ids` | array | No | As for zone-data; omitted = every dataset |
| `zone_id` | string | No | The frontend's id of this stretch or record, echoed back |
| `genre` | string | No | A music style of `GET /api/genres` (v2.10, `400` if unknown), echoed back. The tempo stays the fixed 3 s bar in every genre |

### Response

```json
{
  "zone_id": "record-1",
  "time_period": "2018-07",
  "dataset_ids": ["temperature", "precipitation", "lightning", "fires"],
  "audio_data": "<base64 mp3>",
  "duration_s": 30.0,
  "bar_seconds": 3.0,
  "points_per_bar": 4,
  "stop_seconds": 0.75,
  "radius_deg": 2.0,
  "stops": [
    {"lat": -0.5, "lng": 0.0, "values": {"temperature": 1.23, "precipitation": 0.03, "lightning": 0.0, "fires": 0.0}},
    {"lat": -0.5, "lng": 9.0, "values": {"temperature": 1.32, "precipitation": 0.28, "lightning": 0.0, "fires": 0.78}}
  ]
}
```

- `stops[i]` plays from `i × stop_seconds` to `(i + 1) × stop_seconds`: move the needle and show its values on that clock. `null` = no data under the needle there (lightning beyond 55°), that instrument is silent there; `0` = data that says "none" (no fire over the ocean), silent too but known.
- Places are **snapped to a 0.5° grid** (`stops` gives the snapped positions). Two listeners crossing the same places get the same piece from the cache, in about 0.1 s.
- **One scale for the whole planet**: a value is the same note wherever the needle is (the dataset's global range), so hot and cold places really sound different. In `/api/zones/zone-data` the scale is the zone's own history.
- Every piece has the same tempo and key, so consecutive stretches of a groove join without a jump. Send the next stretch **about 5 s before** the current piece ends: a new stretch takes a few seconds to compose the first time.
- `dataset_ids` in the answer: the datasets that have data along the path at that date. A dataset whose dates do not cover `time_period` (lightning before 2017) is left out.
- **Speed** is the frontend's choice: at 9° per point (4 per bar) the needle circles the equator in 30 s. A slower needle = points closer together, not more points per chunk.
- **Errors**: `400` unknown `dataset_ids`, or no data at that date along the whole path; `422` malformed request (`time_period` not `YYYY-MM` / `YYYY`, no `path`, a `path` that is not whole bars, more than 20 bars or 80 points, `points_per_bar` other than 1, 2, 4, `radius_deg` out of range).
- The first request at a new date reads each map once (a few seconds); the next requests at that date only read the needle.

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
| `bpm` | number | genre's | Tempo, 30 to 200. Default: the genre's reference tempo (76 for the orchestra and `realistic`) |
| `genre` | string | `"orchestra"` | A genre of `GET /api/genres` (data style only; not with `eras`) |
| `eras` | bool | false | Each bar in the style of its date (data style only) |
| `tempo_from_temperature` | bool | true | Each bar has its own tempo, set by `tempo_source` (the name is kept for compatibility); `false` = one fixed tempo |
| `tempo_source` | string | `"co2"` | `"co2"`: the global CO2 of the bar's dates (v2.13). `"temperature"`: the bar's temperature on the area's 5th..95th percentile, x0.75 to x1.25 (v2.9) |
| `temperature_sound` | string | `"heartbeat"` | `realistic` with `tempo_source: "temperature"`: `"heartbeat"` or `"clock"` |
| `step` | string | `"month"` | `"year"`: the same month of successive years, one bar each |
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
    "tempo_source": "co2",
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
- `score.genre` names the genre; `score.tempo_map` has one entry per tempo change, `score.tempo_range` the slowest and fastest, `score.tempo_source` (`co2`, `temperature` or null) what set them, and `score.co2` gives `co2_ppm_per_bar` and `urgency_per_bar` (0..1). With `eras`, `score.eras` lists the eras and `bars[i].era` names each bar's.

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

Invalid input (bad zone, malformed `cells` or `bbox`, `aggregation` other than `mean`, latitude out of range, no points, an invalid `mask`, more than 20 000 points on `/api/zones/series`; on `/api/zones/groove`: a `time_period` that is not `YYYY-MM` / `YYYY`, a `path` that is not whole bars or longer than 20 bars / 80 points, `points_per_bar` other than 1, 2, 4, `radius_deg` outside 0.1 to 10). For validation errors `detail` can be a list of `{loc, msg}` objects.

```json
{
  "detail": "points is empty: send the selected points [{lat, lng}, ...] or a mask"
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

# Instruments and their data, and the music styles
curl http://localhost:8000/api/instruments
curl 'http://localhost:8000/api/instruments?genre=realistic'
curl http://localhost:8000/api/genres

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
