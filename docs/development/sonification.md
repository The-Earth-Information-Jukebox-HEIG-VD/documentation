# Sonification Development

How climate data becomes music, and how to extend the system.

The music engine lives in `sonification/music/` (`orchestra.py` composes the score, `eras.py` holds the genres and eras, `soundscape.py` the realistic mode, `urgency.py` the CO2 record that sets the tempo, `groove.py` the vinyl mode, `render_audio.py` and `sampler.py` render it). It is driven by the backend (see [Backend Development](backend.md)) or from the command line.

---

## Pipeline Overview

```
Data (intensity maps) → Zone average → Normalization → Pitch/Velocity Mapping → Score Composition → Audio Rendering
```

---

## Data Loading

The music side reads **intensity maps**: one `<prefix>_<variable>.npz` plus one `.json` of metadata per variable (the contract is `sonification/simulation/INTENSITY_MAP_SPEC.md`).

```python
import json
import numpy as np

z = np.load("simulation/output/real_daily_2024_surface_temperature.npz")
data      = z["data"]       # [T, H, W] physical values in `units`; NaN = no data
intensity = z["intensity"]  # [T, H, W] (data - vmin) / (vmax - vmin), clipped to 0..1
lat, lon  = z["lat"], z["lon"]   # lat north → south, lon -180 → +180
time      = z["time"]       # [T] ISO-8601 UTC timestamps
meta = json.load(open("simulation/output/real_daily_2024_surface_temperature.json"))
# meta: variable, units, source, vmin, vmax, resolution_deg, real, anomaly, ...
```

The team's raw data (one `.npy` per month, a 720×1440 grid of 0.25° pixels, NaN = no data) is converted into these files by `sonification/backend/prepare_data.py`, which runs `sonification/simulation/build_monthly_dataset.py`. See [Backend Development](backend.md#datasets).

Each frame is reduced to **one number per area**: the area-weighted (cos latitude) mean of the selected cells, ignoring NaN. The area is a preset zone, a lat/lon box or, from the webapp, the selected points.

---

## Normalization

Each variable has a **fixed range** (`vmin`/`vmax` in its metadata, e.g. night lights 0 to 0.1, lightning 0 to 0.4, temperature anomaly -5 to +5 °C), so the same physical value always has the same intensity. A dataset whose metadata has `log_scale` (ocean chlorophyll, 0.03 to 10+ mg/m³) is mapped on a log scale: each tenfold step is the same pitch step.

```python
def normalize(value: float, vmin: float, vmax: float) -> float:
    return min(max((value - vmin) / (vmax - vmin), 0.0), 1.0)
```

Two normalizations are used (`--mapping`, default `hybrid`):

- **relative**: 0 to 1 between the lowest and highest value of the area's series. This drives the **pitch contour**, so every line is melodic.
- **absolute**: 0 to 1 between `vmin` and `vmax`. This drives **presence** (entries, loudness, density): no rain means no violins.

### Same value, same note

`/api/sonify` plays a long series chunk after chunk. With `pitch_range: "series"` (what `/api/sonify` uses) the lowest and highest note correspond to the lowest and highest value of the **whole series of the selected area**, not of the 30 seconds of one chunk. Without it, a yearly value (constant inside a chunk) would always be the same middle note, and consecutive chunks would not connect. The default of `/api/compose` is `"window"` (the piece's own minimum and maximum).

---

## Pitch Mapping

In the default `data` style, a normalized value (0 to 1) picks a note on the **scale grid** of the instrument's register (`low`/`high` in `ORCHESTRA`):

```python
def pitch(norm: float, grid: list[int]) -> int:
    # grid = the notes of the key/scale between the instrument's low and high
    return grid[round(norm * (len(grid) - 1))]
```

Defaults: key `C`, scale `major`, 4 beats per bar, the genre's tempo (76 BPM for the orchestra). One data frame (one month for the deployed datasets) is one bar; with `"step": "year"` one bar is the same month of successive years, and the pitch scale is that month's range over the years.

### Musical Scale Quantization

The `quantize` option sets the pitch grid: `scale` (default), `pentatonic` or `chromatic` (finest resolution). The scales available through `scale` are the seven-note ones:

```python
SCALES = {
    "major":          [0, 2, 4, 5, 7, 9, 11],
    "minor":          [0, 2, 3, 5, 7, 8, 10],
    "dorian":         [0, 2, 3, 5, 7, 9, 10],
    "lydian":         [0, 2, 4, 6, 7, 9, 11],
    "harmonic_minor": [0, 2, 3, 5, 7, 8, 11],
}
# "pentatonic" and "minor_pentatonic" also exist in zone_to_midi.py
```

---

## The Orchestra

Each climate variable has an assigned instrument, defined in the `ORCHESTRA` table of `sonification/music/orchestra.py`. The webapp's `dataset_id` is the short id returned by `GET /api/instruments`.

| `dataset_id` (internal variable) | Instrument | MIDI program | Role | Register (MIDI) | Always on |
|---|---|---|---|---|---|
| `temperature` (`surface_temperature`) | Piano (chords) | 0 | harmony | 48–72 | yes |
| `co2` | Contrabass | 43 | bass | 40–62 | yes |
| `precipitation` (rain) | Violins (melody) | 48 | melody | 67–91 | no |
| `snow` (`snowfall`) | Glockenspiel (melody) | 9 | melody | 67–88 | no |
| `lightning` | Timpani | 47 | `timpani` (reported as `percussion` by the API) | 40–55 | no |
| `fires` | Trombones | 57 | swell | 40–60 | no |
| `night_lights` (`nightlights`) | Synth pad | 89 | swell | 62–81 | no |
| `sea_ice` | Bowed glass (melody) | 92 | melody | 74–93 | no |
| `vegetation` | Clarinet (melody) | 71 | melody | 55–76 | no |
| `carbon_monoxide` | Bassoon | 70 | swell | 46–65 | no |
| `chlorophyll` | Vibraphone | 11 | rhythm (strokes per beat = amount) | 60–84 | no |
| (`aerosol_dust`) | Flute (melody) | 73 | melody | 72–93 | no |
| (`aerosol_smoke`) | French Horns (melody) | 60 | melody | 53–74 | no |

The "always on" instruments (temperature, CO2) are the foundation; the others play when the phenomenon is present, so an instrument entering is itself information. Dust and smoke exist in the orchestra but, in the deployed backend, have no dataset: only variables that have data are listed by `GET /api/instruments`, so eleven instruments sound. The contrabass sits an octave higher than a real contrabass part (E2 to D4) and is re-bowed on every bar line, because laptop and phone speakers play almost nothing below about 100 Hz. The timpani replaced a xylophone that sounded too close to the glockenspiel; their hits per beat follow the flash density.

Notes on the deployed datasets:

- Temperature is an **anomaly** in °C (the piano plays the anomaly itself); `GET /api/instruments` reports its units as `degC anomaly`.
- Lightning is the **share of the area with lightning** (0 to 1), not a flash count, and only exists between 55°S and 55°N.
- Fires are the **number of days of the month with a fire** (2002-07 to 2026-11). The trombones swell and hold, louder with more fires, below the piano's chords rather than as a melody inside them.
- Night lights are **yearly**: one value per year repeated for its 12 months. The synth pad, the only electronic sound, starts at full level each January when the value changes and fades slowly over the year to a soft background (`fade=True`, `fade_floor=0.75`, `smooth=False` so the yearly steps are not blurred).
- Sea ice is the **share of the sea covered by ice** (%); land has no value, so over an area it is the share of its sea that is frozen. The bowed glass enters above about 5 % and is silent over land and warm seas. December 1987 and January 1988 are missing at the source.
- Vegetation is the **NDVI** of the land (-0.2 to 1), silent over deserts (under about 0.12) and the sea.
- Carbon monoxide is the MOPITT **total column** (10^18 molecules/cm²); the scale starts at the clean background (1.4), so only pollution above it plays. 20 months inside its range have no value.
- Ocean chlorophyll (plankton) is in mg/m³, on a log scale, sea only; more vibraphone strokes per beat in a bloom.
- A variable is silent for the months its data does not cover, so one piece can mix series with different start dates.

### Genres and the realistic mode

`genre` (API v2.8) sets one instrument set and groove for the whole piece, defined in `GENRES` in `sonification/music/eras.py` (data style only):

| `genre` | Name | Reference tempo (BPM) |
|---|---|---|
| `orchestra` (default) | Orchestra | 76 |
| `ragtime` | Ragtime & early jazz | 96 |
| `swing` | Swing & big band | 126 |
| `rocknroll` | Rock'n'roll | 150 |
| `funk` | Funk & disco | 112 |
| `synthpop` | Synth-pop | 116 |
| `house` | House & electronic | 124 |
| `trap` | Modern pop & trap | 140 |
| `realistic` | Realistic sounds | 76 |

Aliases are accepted (`jazz`, `rock`, `disco`, `electro`, `pop`, `classical`). In a genre, each dataset takes the genre's melody, comping or swell instrument; the bowed glass (sea ice) and synth pad (night lights) stay the same. `GET /api/instruments?genre=...` gives the instrument names.

`realistic` (`sonification/music/soundscape.py`) has no instruments: each variable is heard as the sound of what it is. The recordings are free (CC0, public domain, CC BY), downloaded with `python music/soundscape.py --download` (done in the Docker image; `GET /api/health` reports `realistic_sounds`).

| Variable | Realistic sound |
|---|---|
| Rain | Rain recording, plus a downpour layer when it pours |
| Snow | Soft, high wind |
| Fires | Campfire, plus a fireplace and a low roar for big fires |
| Lightning | Real thunderclaps, as many as the flashes |
| Temperature | City traffic (recording), louder when warmer (v2.16; with `tempo_source: "temperature"`: a heartbeat) |
| CO2 | A heartbeat at the CO2's tempo, irregular above 400 ppm; it beats only when CO2 is selected, even in years without CO2 maps (v2.15; city traffic with `tempo_source: "temperature"`) |
| Night lights | 50 Hz hum of street lamps (synthesised) |
| Sea ice | "Singing" ice: pings of cracks and creaks of floes (synthesised) |
| Vegetation | Crickets and a cicada (synthesised) |
| Carbon monoxide | Idling engines and machines (synthesised) |
| Ocean plankton | Bubbles rising in the sea (synthesised) |

`eras` (API v2.7, engine only, not used by the webapp) instead plays each bar in the style of its date, from a Romantic orchestra before 1910 to modern pop / trap from 2010; it cannot be combined with `genre`.

### Regional palettes

There are also regional palettes (`palette: "auto"` swaps in local instruments for the zone, e.g. sitar for India); they are defined in `PALETTES` in `orchestra.py` and listed by `GET /api/options` (engine API only).

---

## Adding a New Climate Variable

### 1. Define the Instrument

```python
# sonification/music/orchestra.py
ORCHESTRA = {
    # ...
    "sea_level": dict(name="Sea level - Cello (melody)", role="melody", program=42, channel=14,
                      low=36, high=60, gain=2.0, gate=0.03, levels=[0.35, 0.65],
                      level=0.80, pan=60),
}
```

Pick an unused MIDI `channel` (0 to 8 and 10 to 13 are taken, 9 is the GM drum channel). `always_on=True` makes it a foundation instrument; `gain` and `gate` control when it enters; `levels` are the density thresholds. Copy the closest existing entry and adjust.

### 2. Produce the Intensity Map

Either deliver `<prefix>_<variable>.npz` + `.json` in the format of `INTENSITY_MAP_SPEC.md` (fixed `vmin`/`vmax`, NaN for no data) into `JUKEBOX_DATA_DIR`, or add the variable to the converter:

- add a line to `SOURCES` (and `INPUT_ARGS`) in `sonification/simulation/build_monthly_dataset.py` (file pattern, units, `vmin`, `vmax`),
- add a pattern to `INPUTS` and a recipe to `RECIPES` in `sonification/backend/prepare_data.py`.

### 3. Expose it to the API

The composer picks up variables from `ORCHESTRA` automatically. For the short `dataset_id` the webapp sends, add the id to `SHORT_IDS` (variable → `dataset_id`) and, if the webapp uses another name, to `VARIABLE_ALIASES` in `sonification/backend/app.py`. For a new genre sound, add the variable to the genre tables in `sonification/music/eras.py`, and for the realistic mode a sound in `soundscape.py`. The webapp builds its track list from `GET /api/instruments`; it also needs an entry in `webapp/src/data/datasetRegistry.ts` (globe layer, units) and a colour in `webapp/src/data/trackColors.ts` (see [Frontend Development](frontend.md)).

---

## Score Structure

`orchestra.compose()` returns a score document (the `score` object of `POST /api/compose`, see the [API reference](../api/reference.md)):

```python
score = {
    "zone": "switzerland", "bbox": [...], "palette": "orchestra",
    "key": "C", "scale": "major", "bpm": 76, "beats_per_bar": 4,
    "n_bars": 24, "duration_s": 75.79,
    "time_start": "...", "time_end": "...",
    "bars": [...],         # index, start_s, time (data date), tension, ...
    "instruments": {...},  # per variable: notes, values_per_beat, pitch_range, units, ...
    "sections": [...], "stats": {...},
}
```

Music is organized into bars:

- 4 beats per bar
- Each bar = one data frame (one month for the deployed monthly datasets; one week for daily data, `frames_per_bar` = 7)
- `bpm` defaults to the genre's tempo (76 for the orchestra); with `duration_s` the number of bars is chosen with each bar's own tempo so that the piece lasts exactly that many seconds

### Tempo

By default each bar has its own tempo (`tempo_from_temperature: true`, the name is kept for compatibility), set by `tempo_source`:

- `co2` (default since API v2.13): the **global CO2** of the bar's dates (`sonification/music/urgency.py`: Law Dome ice cores to 1958, Mauna Loa 1959-2024, 2025-2026 estimated). The genre's tempo x (0.8 + 0.45 u), with u = (ppm - 290) / (430 - 290): x0.8 in 1880, about x1.23 today. The same date gives the same tempo for every area, and the music speeds up with the years. A 30 s chunk of `/api/sonify` or `/api/zones/zone-data` therefore covers about 8 months in 1880 and 12 to 13 today; clients must follow `next_time_period` and time the bars with `bar_starts_s`.
- `temperature` (the v2.9 behaviour): the temperature of the bar on the 5th to 95th percentile of the area's series, x0.75 (cold) to x1.25 (hot).

`score.tempo_map`, `score.tempo_range`, `score.tempo_source` and `score.co2` (`co2_ppm_per_bar`, `urgency_per_bar`) describe it. In vinyl mode (`POST /api/zones/groove`) the tempo stays fixed: 3 s per bar.

There are two styles. `data` (default) is faithful to the data: pitch = value, loudness/density = amount, nothing added. `musical` adds harmony, an intro that introduces the instruments, a climax on the most anomalous bar and a ritardando outro. The webapp's chunks use `data`.

---

## Audio Rendering

Rendering is in `sonification/music/render_audio.py` and `sampler.py`. MIDI is turned into audio with real orchestral samples (VSCO 2 CE, CC0) when installed, otherwise with the GeneralUser GS SoundFont, plus a hall reverb. `audio_engine` is `auto` (default), `vsco` or `sf2`. MP3 encoding needs `ffmpeg` on the PATH.

### SoundFont Rendering

```bash
pip install --no-deps tinysoundfont          # --no-deps: it would otherwise pull in pyaudio
python music/render_audio.py --download      # fetch the SoundFont once (~32 MB)
python music/render_audio.py file.mid --engine sf2
```

### VSCO Orchestral Samples

For high-quality audio:

```bash
python music/sampler.py --download  # ~440MB one-time
```

In Docker the SoundFont is always baked in; the samples are included with `--build-arg WITH_VSCO=1`.

The rendered MP3 is longer than `duration_s` because the reverb rings out after the last note; the webapp overlaps that tail with the next chunk.

---

## Anomaly Markers

In `data` style, one percussion hit on the first beat of each bar whose temperature is at least 1.5 standard deviations from its seasonal normal (hot = triangle, cold = wood block):

```python
MARKER_HOT, MARKER_COLD = 81, 77      # GM drums on channel 9: open triangle, low wood block
# marker_threshold = 1.5 (z-score)
```

Datasets whose values are already anomalies (the deployed temperature series) have no `anomaly_markers` track: the piano already plays the anomaly.

---

## Testing Sonification

The API tests are end-to-end and need data in `JUKEBOX_DATA_DIR` (or generate some with `simulation/simulate_variables.py`):

```bash
cd sonification
python -m pytest backend/test_api.py -q
python -m pytest backend/test_groove.py -q         # vinyl mode (POST /api/zones/groove)
python -m pytest backend/test_prepare_data.py -q   # raw-folder conversion
python -m pytest simulation/test_build_monthly_dataset.py -q
```

For the pitch mapping, a quick check is that the data-style melody follows the data (`test_data_style_follows_the_data` in `backend/test_api.py`: correlation between value and pitch).

---

## Example: Temperature Over Time

With the temperature anomaly dataset (1880 → 2025, 1 bar = 1 month), the piano root follows the area's anomaly. With `pitch_range: "series"` the lowest anomaly of the area's whole series is the bottom of the piano's register and the highest the top, so:

- a cold decade of the 1900s plays low,
- the most recent record years play near the top,
- a chunk starting in `1950-01` and the next one (`next_time_period`) use the same scale, so they connect.

Result: an ascending line over the decades, reflecting rising temperatures, played faster and faster as the CO2 rises.
