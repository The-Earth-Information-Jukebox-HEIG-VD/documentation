# Frequently Asked Questions

Common questions about Earth Information Jukebox.

---

## General

### What is Earth Information Jukebox?

Earth Information Jukebox is a project that transforms NASA climate data into music through a process called sonification. Temperature anomalies become musical tones: warmer years sound higher, cooler years lower.

### Who is this for?

- **Visually impaired users**: The primary audience - people who cannot access visual climate charts
- **Educators**: A new way to teach about climate change
- **General public**: An engaging way to experience climate data
- **Researchers**: An alternative data exploration method

### Is this a real NASA project?

This project was created for the NASA Space Apps Challenge 2026 hackathon. It uses real NASA data (GISTEMP, POWER API) but is developed by an independent team from HEIG-VD.

---

## Using the App

### Why can't I hear anything?

1. **Browser autoplay policy**: Click somewhere on the page first, then try playing
2. **System volume**: Check your volume settings
3. **Browser support**: Use Chrome or Firefox for best results
4. **Headphones**: Ensure headphones are connected if you're using them

### How do I select a region?

1. Use the dropdown to select a preset zone (Global, Switzerland, France, etc.)
2. Or click/drag on the map to select a custom area
3. Or enter latitude/longitude coordinates manually

### What do the different instruments mean?

| Instrument | Represents |
|------------|------------|
| Piano | Temperature |
| Contrabass | CO2 |
| Violins | Precipitation |
| Flute | Dust |
| French Horns | Smoke |
| Xylophone | Lightning |
| Glockenspiel | Snowfall |

### Can I download the music?

Yes! After playback, click the Download button to save as MP3, WAV, or MIDI.

---

## Technical

### What browsers are supported?

- Chrome (recommended)
- Firefox
- Safari
- Edge

All modern browsers with Web Audio API support.

### Does it work on mobile?

Yes, but desktop provides a better experience for exploring the data. The touch interface is fully functional.

### How accurate is the data?

We use official NASA data sources:
- GISTEMP for global temperatures (updated monthly)
- POWER API for regional climate data (updated daily)

The sonification accurately represents the data values.

### Can I use this offline?

Not currently. The app requires an internet connection to fetch data from the backend server.

---

## Accessibility

### Is this accessible to screen reader users?

Yes! The app is designed with accessibility as a core feature:
- Full keyboard navigation
- Screen reader support (VoiceOver, NVDA, JAWS)
- ARIA labels and live regions
- Audio transcript with data tables

### What keyboard shortcuts are available?

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ← → | Seek |
| Home/End | Jump to start/end |
| ↑ ↓ | Volume |
| M | Mute |
| ? | Show shortcuts |

### Is there a text alternative to the audio?

Yes! Click "Audio Transcript" to see:
- Explanation of the sonification
- Complete data table
- Frequency mapping

---

## Development

### What technology stack is used?

- **Frontend**: React, TypeScript, Web Audio API, Vite
- **Backend**: FastAPI, Python, NumPy
- **Audio**: MIDI, SoundFont, VSCO samples
- **Deployment**: Docker, GitHub Actions

### How do I run it locally?

```bash
# Quick start with Docker
git clone https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment
docker compose up
```

See the [Quick Start](../getting-started/quickstart.md) guide.

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See the [Contributing Guide](../developer-guide/contributing.md).

### Where can I report bugs?

Open an issue on the [GitHub repository](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues).

---

## Sonification

### How is temperature mapped to pitch?

Linear mapping from data range to frequency range:
- Minimum value → 220 Hz (A3)
- Maximum value → 880 Hz (A5)

Example: +1.5°C anomaly (near max) → ~800 Hz (high pitch)

### Why use music instead of simple tones?

1. **Multiple channels**: Different instruments can represent different variables simultaneously
2. **Emotional impact**: Music creates a connection to the data
3. **Accessibility**: Music is universally understood
4. **Engagement**: More pleasant to listen to

### Can I customize the sonification?

Yes, through the API you can adjust:
- Musical key (C, D, etc.)
- Scale (major, minor, pentatonic)
- Tempo (BPM)
- Style (data-faithful or musical)

### What's the difference between "data" and "musical" style?

- **Data style**: Every note directly represents data. No embellishment.
- **Musical style**: Adds intro, climax, chord progressions, and orchestration for a more musical experience.

---

## Data

### How current is the data?

| Source | Update Frequency | Typical Lag |
|--------|------------------|-------------|
| GISTEMP | Monthly | ~2 months |
| POWER | Daily | ~1 day |

### What time periods are available?

- **GISTEMP**: 1880 to present (monthly)
- **POWER**: Varies by location (typically 1981-present)

### Can I use my own data?

The API accepts custom data through the cells/positions parameters. Full custom dataset upload is planned for a future version.

---

## Project

### What is the NASA Space Apps Challenge?

The world's largest annual global hackathon, organized by NASA. Teams around the world create solutions using open NASA data.

### Who built this?

A team from HEIG-VD (Switzerland):
- Zmoos Leo
- Ferrari Teo
- Izadmehr Yasaman
- Walther Simon
- Egger Magali
- Fleurimont Clarisse Estelle

### Is this open source?

Yes! All code is available on [GitHub](https://github.com/The-Earth-Information-Jukebox-HEIG-VD).

---

## Still Have Questions?

- Open a [GitHub Discussion](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/discussions)
- Check the full [Documentation](../index.md)
- Read the [API Reference](../api/reference.md)
