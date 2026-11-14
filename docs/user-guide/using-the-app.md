# Using the App

A guide for end users of Earth Information Jukebox.

---

## Getting Started

### Open the Application

Visit the live demo at [earth-jukebox.vercel.app](https://earth-jukebox.vercel.app) or run locally.

### Enable Audio

!!! warning "Browser Audio Policy"
    Modern browsers require a user interaction (click/tap) before audio can play.
    Click anywhere on the page or the Play button to enable audio.

---

## Main Interface

The application has several key areas:

```
┌──────────────────────────────────────────────────────────────┐
│  Earth Information Jukebox                     [?] [Settings] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │                     Map / Data View                      │ │
│  │                                                          │ │
│  │                (Select a region to sonify)               │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Dataset: [Temperature ▼]    Time: [2024 ▼]             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  [▶]  ────────────●────────────────  2:34 / 5:00        │ │
│  │       🔊━━━━━━━●━━━━━                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Current: 2023  |  Temperature: +1.17°C  |  ▲ Warming   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Selecting Data

### Choose a Region

1. **Preset Zones**: Use the dropdown to select a predefined region (Global, Switzerland, France, India, etc.)
2. **Custom Area**: Click and drag on the map to select a custom rectangular area
3. **Point Selection**: Click specific points on the map to add them to your selection

### Choose a Dataset

Select which climate variable to sonify:

| Dataset | What it shows |
|---------|---------------|
| Temperature | Global surface temperature anomalies |
| CO2 | Carbon dioxide concentration |
| Precipitation | Rainfall amounts |
| Snowfall | Snow accumulation |
| Dust | Atmospheric dust |
| Smoke | Wildfire smoke |

### Choose a Time Period

- **Start Date**: When the sonification begins
- **Duration**: How long to play (e.g., 30 seconds)
- **End Date**: Or select an end date manually

---

## Playback Controls

### Basic Controls

| Control | Action |
|---------|--------|
| ▶ Play | Start playing the sonification |
| ⏸ Pause | Pause playback |
| ⏹ Stop | Stop and reset to beginning |
| 🔊 Volume | Adjust volume slider |
| Progress Bar | Click or drag to seek |

### Keyboard Shortcuts

Press `?` to see all keyboard shortcuts:

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` Arrow | Seek backward 5% |
| `→` Arrow | Seek forward 5% |
| `Home` | Jump to beginning |
| `End` | Jump to end |
| `↑` Arrow | Increase volume |
| `↓` Arrow | Decrease volume |
| `M` | Mute / Unmute |
| `?` | Show keyboard shortcuts |
| `Escape` | Close any open modal |

---

## Understanding the Sound

### What You Hear

The music represents climate data:

- **Higher pitch** = Higher temperature (or value)
- **Lower pitch** = Lower temperature (or value)
- **Louder sounds** = Stronger presence of the phenomenon
- **Different instruments** = Different climate variables

### The Orchestra

| Instrument | Represents |
|------------|------------|
| Piano (chords) | Temperature - the harmonic foundation |
| Contrabass | CO2 - the deep bass line |
| Violins | Precipitation - flowing melodies when it rains |
| Flute | Dust - light melodies during dust events |
| French Horns | Smoke - present during wildfire events |
| Xylophone | Lightning - sharp accents for strikes |
| Glockenspiel | Snowfall - crystalline sounds when snowing |

### Anomaly Markers

In "data" style, you may hear:

- **Triangle** (high ping): Unusually warm period
- **Woodblock** (low click): Unusually cool period

---

## The Info Panel

The info panel shows current data:

```
┌────────────────────────────────────────────────────┐
│  Current: March 2024                                │
│  Temperature: +1.54°C                              │
│  Trend: ▲ +0.15°C from last year                  │
│  Status: Playing (2:34 / 5:00)                     │
└────────────────────────────────────────────────────┘
```

- **Current**: The time period currently playing
- **Value**: The actual data value for the main variable
- **Trend**: Whether the value is increasing or decreasing
- **Status**: Playback state and position

---

## Audio Transcript

For accessibility, click **"Show Audio Transcript"** to see:

1. **Explanation**: How the sonification works
2. **Data Table**: All values in text form
3. **Frequency Mapping**: What pitch corresponds to what value

This provides equivalent information for users who cannot hear the audio.

---

## Downloading Audio

After playback, you can download the generated audio:

1. Click the **Download** button
2. Choose format:
   - **MP3**: Smaller file, good for sharing
   - **WAV**: Higher quality, larger file
   - **MIDI**: Musical score for use in DAW software

---

## Settings

Access settings via the gear icon:

### Playback Settings

- **Tempo (BPM)**: Speed of playback (default: 76)
- **Key**: Musical key (C, D, Eb, etc.)
- **Scale**: Major, minor, or pentatonic
- **Style**: "Data" (faithful) or "Musical" (orchestrated)

### Audio Settings

- **Volume**: Master volume level
- **Audio Engine**: SoundFont (fast) or VSCO (quality)

### Accessibility Settings

- **Reduce Motion**: Minimize animations
- **High Contrast**: Increase visual contrast
- **Screen Reader Mode**: Optimize for screen readers

---

## Tips for Best Experience

### Audio Quality

- Use headphones for best audio quality
- Ensure volume is at comfortable level
- Try different regions and time periods

### Exploration

- Compare different regions to hear geographic differences
- Play the same region at different time periods
- Listen to how different variables interact

### Accessibility

- Use keyboard shortcuts for efficient navigation
- Open the audio transcript for text representation
- Adjust settings for your preferences

---

## Troubleshooting

### No Sound

1. Click somewhere on the page first (browser requirement)
2. Check system volume
3. Ensure headphones/speakers are connected
4. Try a different browser (Chrome/Firefox recommended)

### Slow Loading

1. Wait for data to load (first time may take longer)
2. Select a smaller time range
3. Check internet connection

### Playback Issues

1. Pause and resume
2. Try stopping and restarting
3. Refresh the page if needed

---

## Next Steps

- [Accessibility Features](accessibility.md) - Detailed accessibility guide
- [API Reference](../api/reference.md) - For developers
