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

This project was created for the NASA Space Apps Challenge 2026 hackathon. It uses real NASA data (GISTEMP temperature anomalies, GPM IMERG rain and snow, ISS LIS lightning, Earth at Night lights) but is developed by an independent team from HEIG-VD.

---

## Using the App

### Why can't I hear anything?

1. **No zone selected**: Play stays disabled until you pick a zone on the globe or in the list view
2. **No track enabled**: Open "Audio tracks" and enable at least one instrument
3. **Backend unavailable**: All audio is composed by the sonification backend. If it is not running, the player shows a "backend unavailable" error and there is no sound (no offline fallback)
4. **Data still loading**: Right after the backend starts, it prepares its datasets for a few minutes; tracks show as preparing until then
5. **No data for the period**: Each instrument is silent for months its dataset does not cover (e.g. lightning only exists for 2017-2023)
6. **System volume / headphones**: Check your volume settings and output device

### How do I select a region?

1. Choose the zone type: continents, countries, or oceans & seas
2. Click a zone on the 3D globe
3. Or switch to the list view and select a zone with the keyboard (Enter to select, arrow keys to expand/collapse groups)

### What do the different instruments mean?

| Instrument | Represents | Data available |
|------------|------------|----------------|
| Piano (chords) | Temperature anomaly | 1880-2025 |
| Contrabass | CO2 | 2002-2022 |
| Violins | Rain | 2000-2026 |
| Glockenspiel | Snow | 2000-2026 |
| Xylophone | Lightning | 2017-2023 |
| Harp | Night lights (one value per year) | 2012-2023 |

The list shown in the app comes from the backend (`GET /api/instruments`).

### Can I download the music?

Not from the webapp. The deployed backend only serves the webapp's endpoints. Developers can enable the engine's full API (`JUKEBOX_FULL_API=1`), whose `POST /api/compose` returns MIDI, per-instrument MIDI stems and rendered MP3/WAV files.

---

## Technical

### What browsers are supported?

- Chrome (recommended)
- Firefox
- Safari
- Edge

All modern browsers with Web Audio API and WebGL support (WebGL is needed for the 3D globe; the list view works without it).

### Does it work on mobile?

It runs in mobile browsers, but desktop provides a better experience for exploring the globe.

!!! note
    The mobile experience has not been formally tested.

### How accurate is the data?

We use NASA data sources, put on one common 0.25° grid by the team:
- GISTEMP v4 for temperature anomalies (2° grid)
- GPM IMERG for rain and snow
- ISS LIS (via NASA SVS) for lightning
- Earth at Night (NASA SVS) for night lights
- CO2 maps extracted by the team (outline pixels of the source picture are removed by the backend)

Each instrument plays the mean of its dataset over the selected zone, one bar per month.

### Can I use this offline?

No. All audio is composed by the sonification backend; there is no in-browser fallback. Without the backend, the app shows a "backend unavailable" error. A local Docker Compose deployment runs entirely on your machine.

---

## Accessibility

### Is this accessible to screen reader users?

Yes! The app is designed with accessibility as a core feature:
- Full keyboard navigation
- Screen reader support (VoiceOver, NVDA, JAWS)
- ARIA labels and live regions (the value being played is announced, e.g. "+1.2 °C vs normal")
- A list view as an alternative to the 3D globe

### What keyboard shortcuts are available?

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ← → | Seek backward/forward |
| Home/End | Jump to start/end |
| M | Mute/unmute |
| Esc | Close panels and dialogs |

### Is there a text alternative to the audio?

Partly. The About page explains how data maps to sound, and the live region announces the current value of the main track while playing.

!!! note
    An `AudioTranscript` component (explanation and data table) exists in the webapp code but is not currently shown in the interface.

---

## Development

### What technology stack is used?

- **Frontend**: React, TypeScript, Vite, react-globe.gl (three.js), i18next, Web Audio API (playback of MP3 chunks)
- **Backend**: FastAPI, Python, NumPy
- **Audio**: MIDI, VSCO 2 CE samples, GeneralUser GS SoundFont, MP3
- **Deployment**: Docker, Docker Compose

### How do I run it locally?

```bash
# Quick start with Docker: clone the repositories side by side
# (webapp, sonification, datasets, deployment), then build locally
cd deployment
cp .env.example .env   # make sure VITE_API_URL=/api is set
./scripts/run-local.sh
```

!!! note
    The pre-built GHCR images are not published yet, so a plain `docker compose up` cannot pull them; build the images locally as above.

See the [Quick Start](../getting-started/quickstart.md) guide.

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See the [Contributing Guide](../development/contributing.md).

### Where can I report bugs?

Open an issue on the [GitHub repository](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues).

---

## Sonification

### How is temperature mapped to pitch?

The backend maps each value to a MIDI note within the instrument's pitch range (piano chords: notes 48-72, C3 to C5), snapped to the musical scale. The range is scaled on the whole series of the selected zone, so the highest anomaly of the zone gives the highest chord and the same value always gives the same note, across chunks.

In the default data-faithful style, a triangle marks unusually hot months and a woodblock unusually cold ones.

### Why use music instead of simple tones?

1. **Multiple channels**: Different instruments can represent different variables simultaneously
2. **Emotional impact**: Music creates a connection to the data
3. **Accessibility**: Music is universally understood
4. **Engagement**: More pleasant to listen to

### Can I customize the sonification?

In the webapp you choose the zone, the instrument tracks and the start date. The engine's own `POST /api/compose` endpoint (development only, `JUKEBOX_FULL_API=1`) can also adjust:
- Musical key (C, D, etc.)
- Scale (major, minor, pentatonic)
- Tempo (BPM)
- Style (data-faithful or musical)

### What's the difference between "data" and "musical" style?

- **Data style** (default, used by the webapp): Every note directly represents data. No embellishment.
- **Musical style**: Adds intro, climax, chord progressions, and orchestration for a more musical experience.

---

## Data

### How current is the data?

The data is a snapshot stored in the `datasets` repository; it is not updated live. New months are added by re-running the `data_processing` scripts.

### What time periods are available?

| Dataset | Period | Time step |
|---------|--------|-----------|
| Temperature anomaly (GISTEMP) | 1880-01 → 2025-12 | Monthly |
| Rain (GPM IMERG) | 2000-06 → 2026-11 | Monthly |
| Snow (GPM IMERG) | 2000-06 → 2026-11 | Monthly |
| CO2 | 2002-09 → 2022-03 | Monthly |
| Lightning (ISS LIS) | 2017-03 → 2023-07 | Monthly, 55°S-55°N only |
| Night lights (Earth at Night) | 2012 → 2023 | Yearly |

A wildfire dataset (MODIS, 2002-07 → 2026-11) is in the `datasets` repository but is not sonified yet.

### Can I use my own data?

Not through the app. You can send any set of points (latitude/longitude) to `POST /api/sonify`. To add a dataset, put a folder of monthly 720×1440 `.npy` files in the `datasets` repository and add a recipe to `backend/prepare_data.py` in the sonification repository.

---

## Project

### What is the NASA Space Apps Challenge?

The world's largest annual global hackathon, organized by NASA. Teams around the world create solutions using open NASA data.

### Who built this?

A team from HEIG-VD (Switzerland):
- Egger Magali
- Ferrari Téo
- Fleurimont Clarisse Estelle
- Izadmehr Yasaman
- Walther Simon
- Zmoos Léo

See the [Team](../about/team.md) page.

### Is this open source?

The code is hosted in the [The-Earth-Information-Jukebox-HEIG-VD](https://github.com/The-Earth-Information-Jukebox-HEIG-VD) GitHub organization.

!!! note
    At the time of writing, the code repositories are private and have no license file; only the documentation repository is public.

---

## Still Have Questions?

- Open a [GitHub Issue](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues)
- Check the full [Documentation](../index.md)
- Read the [API Reference](../api/reference.md)
