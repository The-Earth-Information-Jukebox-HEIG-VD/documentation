# About the Project

## NASA Space Apps Challenge 2026

Earth Information Jukebox was created for the [NASA Space Apps Challenge](https://www.spaceappschallenge.org/), the world's largest annual global hackathon. The challenge invites innovators, scientists, designers, storytellers, makers, technologists, and others to use open NASA data to create solutions to challenges we face on Earth and in space.

### The Challenge

Our team tackled the challenge of making NASA's Earth Information Center data more accessible. The Earth Information Center provides crucial visualizations about climate change, but these visual representations are inaccessible to millions of people worldwide.

### Our Solution

We transform climate visualizations into **audio** through a process called **sonification**. By mapping data values to musical properties (pitch, volume, instrument), we create an orchestral experience that conveys the same information as visual charts - but through sound.

---

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  NASA Climate   │────▶│    Backend      │────▶│   Orchestral    │
│     Data        │     │   Processing    │     │     Audio       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
      GISTEMP              Normalization          Web Audio API
      POWER API            Frequency mapping      Real instruments
      SVS                  Score composition      MIDI synthesis
```

1. **Data Ingestion**: We fetch climate data from NASA APIs (GISTEMP for global temperatures, POWER for regional climate data)

2. **Processing**: Raw values are normalized and mapped to musical parameters:
   - Temperature → Pitch (higher temp = higher pitch)
   - Precipitation → Violin melody intensity
   - CO2 → Bass line depth
   - And more...

3. **Composition**: An 8-instrument orchestra plays the data, with each instrument representing a different climate variable

4. **Playback**: Users can play, pause, seek, and explore the audio representation of climate data

---

## Key Features

### Sonification Engine
- Real-time audio synthesis using Web Audio API
- Multiple instrument voices for different data channels
- Configurable mapping between data and sound

### Accessibility First
- WCAG 2.1 AA compliant
- Full keyboard navigation
- Screen reader support
- Audio transcripts for data explanations

### Interactive Exploration
- Select regions on a map
- Choose time periods
- Adjust playback speed
- Download generated audio

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Web Audio API |
| Backend | FastAPI, Python, NumPy |
| Audio | MIDI, SoundFont, VSCO orchestral samples |
| Data | NASA GISTEMP, POWER API, SVS |
| Deployment | Docker, GitHub Actions |

---

## Open Source

All code is open source and available on GitHub under the [The-Earth-Information-Jukebox-HEIG-VD](https://github.com/The-Earth-Information-Jukebox-HEIG-VD) organization.
