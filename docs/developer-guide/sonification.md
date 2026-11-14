# Sonification Developer Guide

Guide for extending the sonification system.

---

## Overview

The sonification pipeline transforms climate data into music:

```
Data → Normalization → Pitch/Velocity Mapping → Score Composition → Audio Rendering
```

This guide covers how to extend each stage.

---

## Adding a New Climate Variable

### Step 1: Define the Instrument

In `music/orchestra.py`:

```python
ORCHESTRA = {
    # ... existing instruments ...

    "sea_level": {
        "label": "Sea Level Rise",
        "instrument": "Cello",
        "role": "bass",
        "midi_program": 42,  # Cello
        "pitch_range": [36, 60],  # C2 to C4
        "always_playing": True,  # Continuous
        "channel": 8,
        "pan": 64,  # Center
        "units": "mm",
    },
}
```

### Step 2: Add Data Source

Create a client in `src/nasa/`:

```python
# src/nasa/sea_level.py
class SeaLevelClient:
    """Fetch sea level data from NASA."""

    async def fetch_data(self, start_year: int, end_year: int) -> np.ndarray:
        # Fetch from NASA APIs
        # Return numpy array of values
        pass
```

### Step 3: Create Intensity Map

Generate or extract intensity map:

```python
# simulation/extract_sea_level.py
import numpy as np

def extract_sea_level_map():
    data = fetch_sea_level_data()

    # Shape: (frames, lat, lon)
    intensity_map = np.zeros((num_frames, 180, 360))

    # Fill with data
    for frame_idx, frame_data in enumerate(data):
        intensity_map[frame_idx] = process_frame(frame_data)

    # Save
    np.savez_compressed(
        "simulation/output/sea_level.npz",
        values=intensity_map,
        times=time_strings
    )

    # Save metadata
    with open("simulation/output/sea_level.json", "w") as f:
        json.dump({
            "variable": "sea_level",
            "units": "mm",
            "min_value": -50,
            "max_value": 500,
        }, f)
```

### Step 4: Register in Composer

The composer automatically picks up instruments from `ORCHESTRA`, but you may need to adjust the composition logic:

```python
# music/composer.py

def compose_track(self, variable: str, values: np.ndarray) -> InstrumentTrack:
    config = ORCHESTRA[variable]

    # Special handling for sea level (slow-moving, sustained notes)
    if variable == "sea_level":
        return self._compose_sustained_track(values, config)

    # Default handling
    return self._compose_default_track(values, config)
```

---

## Customizing Pitch Mapping

### Linear Mapping (Default)

```python
def linear_map(value: float, min_val: float, max_val: float,
               min_pitch: int, max_pitch: int) -> int:
    """Map value to pitch linearly."""
    normalized = (value - min_val) / (max_val - min_val)
    return int(min_pitch + normalized * (max_pitch - min_pitch))
```

### Logarithmic Mapping

For data with exponential characteristics (CO2, etc.):

```python
import math

def log_map(value: float, min_val: float, max_val: float,
            min_pitch: int, max_pitch: int) -> int:
    """Map value to pitch logarithmically."""
    # Shift to positive range
    log_min = math.log(min_val + 1)
    log_max = math.log(max_val + 1)
    log_val = math.log(value + 1)

    normalized = (log_val - log_min) / (log_max - log_min)
    return int(min_pitch + normalized * (max_pitch - min_pitch))
```

### Musical Scale Quantization

Snap pitches to a musical scale:

```python
SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "pentatonic": [0, 2, 4, 7, 9],
    "chromatic": list(range(12)),
}

def quantize_to_scale(pitch: int, key: int = 0, scale: str = "major") -> int:
    """Snap pitch to nearest note in scale."""
    scale_degrees = SCALES[scale]
    note = pitch % 12
    octave = pitch // 12

    # Find closest scale degree
    key_adjusted = [(key + d) % 12 for d in scale_degrees]
    distances = [min(abs(note - d), 12 - abs(note - d)) for d in key_adjusted]
    closest_idx = distances.index(min(distances))

    return octave * 12 + key_adjusted[closest_idx]
```

---

## Customizing Velocity Mapping

### Presence-Based Velocity

For phenomena that come and go (rain, snow):

```python
def presence_to_velocity(presence: float, min_vel: int = 40, max_vel: int = 110) -> int:
    """Map presence (0-1) to MIDI velocity."""
    return int(min_vel + presence * (max_vel - min_vel))
```

### Value-Based Velocity

For continuous variables where intensity matters:

```python
def value_to_velocity(value: float, min_val: float, max_val: float) -> int:
    """Map value to velocity."""
    normalized = (value - min_val) / (max_val - min_val)
    return int(40 + normalized * 70)  # Range: 40-110
```

### Anomaly-Based Velocity

Louder for more extreme values:

```python
def anomaly_to_velocity(value: float, mean: float, std: float) -> int:
    """Map anomaly (z-score) to velocity."""
    z_score = abs(value - mean) / std
    # Clamp to 0-3 standard deviations
    clamped = min(z_score, 3.0) / 3.0
    return int(50 + clamped * 60)
```

---

## Creating Musical Sections

### Intro Section

"Meet the orchestra" - instruments enter one by one:

```python
def compose_intro(self, variables: list[str]) -> list[Bar]:
    """Create intro where instruments enter sequentially."""
    intro_bars = []

    for i, var in enumerate(variables):
        config = ORCHESTRA[var]
        bar = Bar(
            index=i,
            start_beat=i * 4,
            chord=self.tonic_chord,
        )

        # Single instrument plays a phrase
        notes = self._create_intro_phrase(config)
        intro_bars.append(bar)

    return intro_bars
```

### Climax Section

Highlight the most anomalous moment:

```python
def find_climax(self, data: np.ndarray) -> tuple[int, float]:
    """Find the frame with highest anomaly."""
    anomalies = np.abs(data - np.mean(data)) / np.std(data)
    climax_frame = np.argmax(anomalies)
    tension = anomalies[climax_frame]
    return climax_frame, tension

def compose_climax(self, frame: int, tension: float) -> list[Bar]:
    """Create climax section."""
    # Build tension
    bars = []
    for i in range(4):  # 4 bars building
        bar = Bar(
            tension=tension * (i / 4),
            mode="minor" if tension > 0.5 else "major",
        )
        bars.append(bar)

    # Peak
    bars.append(Bar(
        tension=tension,
        chord=self._dramatic_chord(),
        climax=True,
    ))

    return bars
```

---

## Adding Anomaly Markers

Audible markers for unusual values:

```python
# Using GM drums
ANOMALY_MARKERS = {
    "hot": 81,   # Open triangle - high ping
    "cold": 77,  # Low wood block
}

def add_anomaly_markers(self, values: np.ndarray, mean: float, std: float) -> list[Note]:
    """Add percussion markers for anomalies."""
    markers = []

    for beat, value in enumerate(values):
        z_score = (value - mean) / std

        if z_score > 2:  # Very hot
            markers.append(Note(
                pitch=ANOMALY_MARKERS["hot"],
                velocity=80,
                start=beat,
                duration=0.5,
                channel=9,  # Drums
            ))
        elif z_score < -2:  # Very cold
            markers.append(Note(
                pitch=ANOMALY_MARKERS["cold"],
                velocity=80,
                start=beat,
                duration=0.5,
                channel=9,
            ))

    return markers
```

---

## Custom Audio Rendering

### Using Different Soundfonts

```python
import tinysoundfont

class SoundFontRenderer:
    def __init__(self, soundfont_path: str):
        self.synth = tinysoundfont.Synth()
        self.synth.load(soundfont_path)

    def render(self, score: Score, sample_rate: int = 44100) -> np.ndarray:
        # Set up instruments
        for var, track in score.instruments.items():
            self.synth.program_change(track.channel, track.program)

        # Render all notes
        audio = self.synth.render_float(sample_rate=sample_rate)
        return audio
```

### Adding Effects

```python
from scipy import signal

def add_reverb(audio: np.ndarray, decay: float = 0.5) -> np.ndarray:
    """Add simple reverb effect."""
    # Create impulse response
    ir_length = int(44100 * decay)
    ir = np.exp(-np.linspace(0, 5, ir_length))
    ir = ir / np.sum(ir)

    # Convolve
    return signal.convolve(audio, ir, mode='same')

def normalize_audio(audio: np.ndarray, target_db: float = -3) -> np.ndarray:
    """Normalize audio to target dB."""
    peak = np.max(np.abs(audio))
    target_linear = 10 ** (target_db / 20)
    return audio * (target_linear / peak)
```

---

## Testing Sonification

### Unit Tests

```python
# tests/test_sonification.py
import pytest
import numpy as np
from music.composer import Composer

def test_pitch_mapping():
    composer = Composer()

    # Min value → min pitch
    assert composer.value_to_pitch(0.0, [48, 84]) == 48

    # Max value → max pitch
    assert composer.value_to_pitch(1.0, [48, 84]) == 84

    # Mid value → mid pitch
    assert composer.value_to_pitch(0.5, [48, 84]) == 66

def test_scale_quantization():
    composer = Composer()

    # C in C major stays C
    assert composer.quantize_to_scale(60, key=0, scale="major") == 60

    # C# in C major → C or D
    result = composer.quantize_to_scale(61, key=0, scale="major")
    assert result in [60, 62]
```

### Integration Tests

```python
def test_full_composition():
    composer = Composer()

    # Create test data
    data = np.random.rand(12, 180, 360)  # 12 frames

    # Compose
    score = composer.compose(
        data,
        zone="global",
        start="2024-01",
        end="2024-12"
    )

    assert score.n_bars == 12
    assert len(score.instruments) > 0
    assert all(len(track.notes) > 0 for track in score.instruments.values())
```

### Audio Validation

```python
def test_audio_output():
    composer = Composer()
    renderer = SoundFontRenderer("soundfont.sf2")

    score = composer.compose(test_data)
    audio = renderer.render(score)

    # Check audio properties
    assert len(audio) > 0
    assert np.max(np.abs(audio)) <= 1.0  # Not clipping
    assert np.mean(np.abs(audio)) > 0.01  # Not silent
```

---

## Debugging Tips

### Visualize the Score

```python
import matplotlib.pyplot as plt

def plot_score(score: Score):
    """Visualize score as piano roll."""
    fig, ax = plt.subplots(figsize=(12, 6))

    for var, track in score.instruments.items():
        for note in track.notes:
            ax.barh(
                note.pitch,
                note.duration,
                left=note.start,
                height=0.8,
                label=var
            )

    ax.set_xlabel("Beat")
    ax.set_ylabel("Pitch")
    plt.savefig("score_debug.png")
```

### Listen to Individual Tracks

```python
def render_track(track: InstrumentTrack) -> np.ndarray:
    """Render a single track for debugging."""
    renderer = SoundFontRenderer()

    # Solo this track
    for note in track.notes:
        renderer.play_note(note)

    return renderer.get_audio()
```

---

## Next Steps

- [Architecture: Sonification](../architecture/sonification.md)
- [Backend Guide](backend.md)
- [API Reference](../api/reference.md)
