# Sonification Development

How climate data becomes music, and how to extend the system.

---

## Pipeline Overview

```
Data → Normalization → Pitch/Velocity Mapping → Score Composition → Audio Rendering
```

---

## Data Loading

Climate data is stored as intensity maps:

```python
import numpy as np

data = np.load("temperature.npz")
intensity_map = data["values"]  # Shape: (frames, lat, lon)
times = data["times"]           # Array of datetime strings
```

---

## Normalization

Values are normalized to 0-1 range:

```python
def normalize(value: float, min_val: float, max_val: float) -> float:
    return (value - min_val) / (max_val - min_val)

# Example: Temperature
# -40°C → 0.0
#   5°C → 0.5
#  50°C → 1.0
```

---

## Pitch Mapping

Normalized values map to MIDI note numbers:

```python
def value_to_pitch(normalized: float, pitch_range: tuple[int, int] = (48, 84)) -> int:
    low, high = pitch_range
    return int(low + normalized * (high - low))

# 0.0 → 48 (C3)
# 0.5 → 66 (F#4)
# 1.0 → 84 (C6)
```

### Musical Scale Quantization

Optionally snap to a scale:

```python
SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "pentatonic": [0, 2, 4, 7, 9],
}
```

---

## The Orchestra

Each climate variable has an assigned instrument:

| Variable | Instrument | MIDI Program | Role |
|----------|------------|--------------|------|
| Temperature | Piano | 0 | Chords |
| CO2 | Contrabass | 43 | Bass |
| Precipitation | Violins | 40 | Melody |
| Dust | Flute | 73 | Melody |
| Smoke | French Horns | 60 | Melody |
| Lightning | Xylophone | 13 | Accents |
| Snowfall | Glockenspiel | 9 | Melody |

---

## Adding a New Climate Variable

### 1. Define the Instrument

```python
# music/orchestra.py
ORCHESTRA = {
    "sea_level": {
        "label": "Sea Level Rise",
        "instrument": "Cello",
        "role": "bass",
        "midi_program": 42,
        "pitch_range": [36, 60],
        "always_playing": True,
        "units": "mm",
    },
}
```

### 2. Create Intensity Map

```python
# Save as NPZ with metadata JSON
np.savez_compressed(
    "simulation/output/sea_level.npz",
    values=intensity_map,
    times=time_strings
)
```

### 3. Register in Composer

The composer automatically picks up instruments from `ORCHESTRA`.

---

## Score Structure

```python
@dataclass
class Score:
    zone: str
    key: str       # "C", "D", "Eb", etc.
    scale: str     # "major", "minor"
    bpm: float
    bars: list[Bar]
    instruments: dict[str, InstrumentTrack]
```

Music is organized into bars:
- Default: 4 beats per bar
- Each bar = one data frame (month/week/day)
- Tempo controls playback speed (default: 76 BPM)

---

## Audio Rendering

### SoundFont Rendering

```python
import tinysoundfont

synth = tinysoundfont.Synth()
synth.load("soundfont.sf2")
audio = synth.render_float(sample_rate=44100)
```

### VSCO Orchestral Samples

For high-quality audio:

```bash
python music/sampler.py --download  # ~440MB one-time
```

---

## Anomaly Markers

Add percussion for unusual values:

```python
ANOMALY_MARKERS = {
    "hot": 81,   # Open triangle
    "cold": 77,  # Wood block
}

if z_score > 2:  # Very hot
    markers.append(Note(pitch=81, channel=9))  # Drums
```

---

## Testing Sonification

```python
def test_pitch_mapping():
    assert value_to_pitch(0.0, (48, 84)) == 48
    assert value_to_pitch(1.0, (48, 84)) == 84
    assert value_to_pitch(0.5, (48, 84)) == 66
```

---

## Example: Temperature Over Time

| Year | Anomaly | Normalized | Pitch | Note |
|------|---------|------------|-------|------|
| 2020 | +1.02°C | 0.76 | 73 | C#5 |
| 2021 | +0.85°C | 0.68 | 70 | Bb4 |
| 2022 | +0.89°C | 0.70 | 71 | B4 |
| 2023 | +1.17°C | 0.83 | 75 | D#5 |
| 2024 | +1.54°C | 1.00 | 84 | C6 |

Result: An ascending melodic line reflecting rising temperatures.
