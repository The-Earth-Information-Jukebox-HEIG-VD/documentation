# Sonification Pipeline

How climate data becomes music.

---

## Overview

```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│   NASA    │───▶│   Load    │───▶│   Map to  │───▶│  Compose  │───▶│  Render   │
│   Data    │    │   & Norm  │    │   Notes   │    │   Score   │    │   Audio   │
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘
  GISTEMP          0-1 range        Pitch            Bars             MP3/WAV
  POWER            per variable     Velocity         Chords           MIDI
  NetCDF                            Duration         Sections
```

---

## Step 1: Data Loading

### Intensity Maps

Climate data is stored as intensity maps - 2D arrays representing geographic regions:

```python
# Shape: (frames, lat, lon)
# e.g., (366, 180, 360) for daily data at 1° resolution

data = np.load("temperature.npz")
intensity_map = data["values"]  # Shape: (366, 180, 360)
times = data["times"]           # Array of datetime strings
```

### Metadata

Each variable has associated metadata:

```json
{
  "variable": "surface_temperature",
  "units": "degC",
  "min_value": -40.0,
  "max_value": 50.0,
  "grid": [180, 360],
  "time_start": "2024-01-01",
  "time_end": "2024-12-31"
}
```

---

## Step 2: Normalization

Values are normalized to 0-1 range for consistent mapping:

```python
def normalize(value: float, min_val: float, max_val: float) -> float:
    """Normalize value to 0-1 range."""
    return (value - min_val) / (max_val - min_val)

# Example: Temperature
# -40°C → 0.0
#   5°C → 0.5
#  50°C → 1.0
```

### Per-Variable Normalization

Each climate variable uses its own range:

| Variable | Min | Max | Units |
|----------|-----|-----|-------|
| Temperature | -40 | 50 | °C |
| CO2 | 350 | 500 | ppm |
| Precipitation | 0 | 50 | mm/day |
| Wind | 0 | 30 | m/s |

---

## Step 3: Data-to-Note Mapping

### Pitch Mapping

Normalized values map to MIDI note numbers:

```python
def value_to_pitch(
    normalized: float,
    pitch_range: tuple[int, int] = (48, 84)
) -> int:
    """Map normalized value to MIDI pitch."""
    low, high = pitch_range
    return int(low + normalized * (high - low))

# Examples:
# 0.0 → 48 (C3)
# 0.5 → 66 (F#4)
# 1.0 → 84 (C6)
```

### Musical Scale Quantization

Optionally, pitches can be quantized to a musical scale:

```python
SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "pentatonic": [0, 2, 4, 7, 9],
}

def quantize_to_scale(pitch: int, key: int, scale: list[int]) -> int:
    """Snap pitch to nearest note in scale."""
    note = pitch % 12
    octave = pitch // 12

    # Find closest scale degree
    distances = [(abs(note - (key + degree) % 12), degree)
                 for degree in scale]
    _, closest = min(distances)

    return octave * 12 + (key + closest) % 12
```

### Velocity (Loudness)

Velocity is derived from data intensity or presence:

```python
def value_to_velocity(presence: float) -> int:
    """Map presence (0-1) to MIDI velocity (0-127)."""
    # Ensure audible range (40-110)
    return int(40 + presence * 70)
```

---

## Step 4: The Orchestra

Each climate variable is assigned an instrument with specific characteristics:

### Instrument Assignments

| Variable | Instrument | MIDI Program | Pitch Range | Role |
|----------|------------|--------------|-------------|------|
| Temperature | Piano | 0 | C3-C5 | Chords |
| CO2 | Contrabass | 43 | E1-E3 | Bass |
| Precipitation | Violins | 40 | G3-C6 | Melody |
| Dust | Flute | 73 | C4-C7 | Melody |
| Smoke | French Horns | 60 | F2-F5 | Melody |
| Lightning | Xylophone | 13 | C4-C7 | Accents |
| Snowfall | Glockenspiel | 9 | C5-C7 | Melody |

### Roles

- **Harmony**: Plays continuously, forms the harmonic foundation
- **Bass**: Low notes, provides rhythmic foundation
- **Melody**: Expressive lines when the phenomenon is present
- **Accents**: Punctuation for discrete events

### Always Playing vs. Conditional

Some instruments play continuously (temperature, CO2), while others only sound when their phenomenon is present (rain, snow, lightning).

```python
if instrument.always_playing or presence > 0.1:
    notes.append(Note(pitch, velocity, start, duration))
```

---

## Step 5: Score Composition

### Bars and Beats

Music is organized into bars:

```
Bar 0          Bar 1          Bar 2          Bar 3
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ ♩  ♩  ♩  ♩  │ ♩  ♩  ♩  ♩  │ ♩  ♩  ♩  ♩  │ ♩  ♩  ♩  ♩  │
│ Beat 0-3     │ Beat 4-7     │ Beat 8-11    │ Beat 12-15   │
│ 2024-01      │ 2024-02      │ 2024-03      │ 2024-04      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

- Default: 4 beats per bar
- Each bar corresponds to one data frame (month/week/day)
- Tempo controls playback speed (default: 76 BPM)

### Score Structure

```python
@dataclass
class Score:
    zone: str
    bbox: tuple[float, float, float, float]
    key: str  # "C", "D", "Eb", etc.
    scale: str  # "major", "minor", "pentatonic"
    bpm: float
    bars: list[Bar]
    instruments: dict[str, InstrumentTrack]
    sections: list[Section]  # intro, data, climax, outro
```

### Sections (Musical Style)

In "musical" style, the composition has sections:

1. **Intro**: "Meet the orchestra" - instruments enter one by one
2. **Data**: Main body following the climate data
3. **Climax**: Highlights the most anomalous moment
4. **Outro**: Fade out with final chord

---

## Step 6: Audio Rendering

### MIDI Generation

Notes are converted to MIDI:

```python
from midiutil import MIDIFile

midi = MIDIFile(numTracks=len(instruments))

for var, track in instruments.items():
    for note in track.notes:
        midi.addNote(
            track=track.channel,
            channel=track.channel,
            pitch=note.pitch,
            time=note.start,
            duration=note.duration,
            volume=note.velocity
        )
```

### Audio Synthesis

MIDI is rendered to audio using either:

1. **SoundFont** (fast, ~2s): General MIDI sounds
2. **VSCO 2 CE** (quality, ~5-10s): Real orchestral samples

```python
# SoundFont rendering
import tinysoundfont
synth = tinysoundfont.Synth()
synth.load("soundfont.sf2")
audio = synth.render_midi(midi_bytes)

# VSCO rendering
from music.sampler import VSCOSampler
sampler = VSCOSampler()
audio = sampler.render(score)
```

### Output Formats

- **MP3**: Compressed, small file size
- **WAV**: Uncompressed, highest quality
- **MIDI**: Symbolic representation, smallest

---

## Mapping Strategies

### Linear Mapping

Direct proportional mapping (default):

```
Value → Normalized → Pitch
-0.5°C → 0.0 → 220 Hz
 0.0°C → 0.5 → 550 Hz
+1.5°C → 1.0 → 880 Hz
```

### Logarithmic Mapping

For data with exponential characteristics:

```python
def log_normalize(value, min_val, max_val):
    log_min = math.log(min_val + 1)
    log_max = math.log(max_val + 1)
    log_val = math.log(value + 1)
    return (log_val - log_min) / (log_max - log_min)
```

### Musical Mapping

Quantizes to scale degrees for more musical results:

```
Value → Normalized → Scale Degree → Pitch
0.0 → 0.0 → C → 60
0.1 → 0.1 → D → 62
0.2 → 0.2 → E → 64
...
```

---

## Example: Temperature Over Time

Input: GISTEMP annual anomalies 2015-2024

| Year | Anomaly (°C) | Normalized | Pitch | Note |
|------|--------------|------------|-------|------|
| 2015 | +0.87 | 0.68 | 70 | Bb4 |
| 2016 | +1.01 | 0.76 | 73 | C#5 |
| 2017 | +0.92 | 0.71 | 71 | B4 |
| 2018 | +0.83 | 0.67 | 70 | Bb4 |
| 2019 | +0.98 | 0.74 | 72 | C5 |
| 2020 | +1.02 | 0.76 | 73 | C#5 |
| 2021 | +0.85 | 0.68 | 70 | Bb4 |
| 2022 | +0.89 | 0.70 | 71 | B4 |
| 2023 | +1.17 | 0.83 | 75 | D#5 |
| 2024 | +1.54 | 1.00 | 84 | C6 |

Result: An ascending melodic line reflecting rising temperatures.

---

## Next Steps

- [Backend Architecture](backend.md) - Implementation details
- [API Reference](../api/reference.md) - Compose endpoint
- [Sonification Developer Guide](../developer-guide/sonification.md) - Adding instruments
