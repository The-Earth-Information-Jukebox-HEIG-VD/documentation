# Frequently Asked Questions

Common questions about Earth Information Jukebox.

---

## General

### What is Earth Information Jukebox?

Earth Information Jukebox is a project that transforms NASA climate data into music through a process called sonification. Eleven datasets (temperature, CO2, rain, snow, lightning, fires, night lights, sea ice, vegetation, carbon monoxide, ocean plankton) each play their own instrument: higher values sound higher or louder. The app itself is called **EarthChestra**; "Earth Information Jukebox" is the project and NASA Space Apps challenge name.

### Who is this for?

- **Visually impaired users**: The primary audience - people who cannot access visual climate charts
- **Educators**: A new way to teach about climate change
- **General public**: An engaging way to experience climate data
- **Researchers**: An alternative data exploration method

### Is this a real NASA project?

This project was created for the NASA Space Apps Challenge 2026 hackathon. It uses real NASA data (GISTEMP temperature anomalies, GPM IMERG rain and snow, ISS LIS lightning, Earth at Night lights, MODIS fires, vegetation and ocean chlorophyll, MOPITT carbon monoxide) and the NSIDC Sea Ice Index, but is developed by an independent team from HEIG-VD.

---

## Using the App

### Why can't I hear anything?

1. **No zone selected**: Play stays disabled until you pick a zone on the globe or in the list view
2. **No track enabled**: Press **Sounds** (or **Choose sounds**) and enable at least one instrument in "What do you want to hear?"
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
| Trombones | Fires | 2002-2026 |
| Timpani | Lightning | 2017-2023 |
| Synth pad | Night lights (one value per year) | 2012-2023 |
| Bowed glass | Sea ice | 1979-2026 |
| Clarinet | Vegetation (NDVI) | 2000-2026 |
| Bassoon | Carbon monoxide | 2000-2024 |
| Vibraphone | Ocean plankton (chlorophyll) | 2002-2026 |

The list shown in the app comes from the backend (`GET /api/instruments`). In another music style the instruments change (`GET /api/instruments?genre=...`).

### Can I download the music?

Not from the webapp. The Docker image sets `JUKEBOX_FULL_API=0`, so the deployed backend only serves the webapp's endpoints. A backend run from source serves the engine's full API by default (`JUKEBOX_FULL_API=1`), whose `POST /api/compose` returns MIDI, per-instrument MIDI stems and rendered MP3/WAV files.

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
- MODIS for fires, vegetation (NDVI, Terra) and ocean chlorophyll (Aqua)
- MOPITT (on NASA Terra) for carbon monoxide
- NSIDC Sea Ice Index for sea ice

Each instrument plays the mean of its dataset over the selected zone, one bar per month.

### Can I use this offline?

No. All audio is composed by the sonification backend; there is no in-browser fallback. Without the backend, the app shows a "backend unavailable" error. A local Docker Compose deployment runs entirely on your machine.

---

## Accessibility

### Is this accessible to screen reader users?

Yes! The app is designed with accessibility as a core feature:
- Full keyboard navigation
- Built for screen readers (semantic HTML, labels and announcements)
- ARIA labels and live regions (the value being played is announced, e.g. "+1.2 °C vs normal")
- A list view as an alternative to the 3D globe

### What keyboard shortcuts are available?

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ← → | Seek backward/forward |
| Home/End | Jump to start/end |
| M | Mute/unmute |
| Esc | Back to zone selection, or close a dialog |

In vinyl mode, ← → go to the previous or next groove. The **How to use** page lists every shortcut.

### Is there a text alternative to the audio?

Partly. The How to use and About pages explain how data maps to sound, and the live region announces the current value of the main track while playing. The globe and the data graph also have hidden data tables for screen readers.

---

## Development

### What technology stack is used?

- **Frontend**: React 19, TypeScript, Vite 6, react-globe.gl (three.js), i18next, Web Audio API (playback of MP3 chunks)
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
    The pre-built GHCR images are public (latest releases: `1.4.0` for webapp and datasets, `1.4.1` for sonification): a plain `docker compose up -d` pulls them instead of building.

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

In the default data-faithful style, a triangle marks unusually hot months and a woodblock unusually cold ones. The tempo of each bar follows the global CO2 of its month (the genre's tempo x0.8 in 1880, about x1.23 today), so the music speeds up over the decades.

### Why use music instead of simple tones?

1. **Multiple channels**: Different instruments can represent different variables simultaneously
2. **Emotional impact**: Music creates a connection to the data
3. **Accessibility**: Music is universally understood
4. **Engagement**: More pleasant to listen to

### Can I customize the sonification?

In the webapp you choose the zone, the instrument tracks, the start date, one month year after year (**Months**), and the music style: the orchestra, realistic sounds, or one of seven genres (ragtime, swing, rock'n'roll, funk, synth-pop, house, trap). The engine's own `POST /api/compose` endpoint (development only, `JUKEBOX_FULL_API=1`) can also adjust:
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
| Temperature anomaly (GISTEMP) | 1880-01 → 2025-12 (shown from 1920-01 in the app) | Monthly |
| Rain (GPM IMERG) | 2000-06 → 2026-11 | Monthly |
| Snow (GPM IMERG) | 2000-06 → 2026-11 | Monthly |
| CO2 | 2002-09 → 2022-03 | Monthly |
| Lightning (ISS LIS) | 2017-03 → 2023-07 | Monthly, 55°S-55°N only |
| Fires (MODIS) | 2002-07 → 2026-11 | Monthly (days of the month with a fire) |
| Night lights (Earth at Night) | 2012 → 2023 | Yearly |
| Sea ice (NSIDC Sea Ice Index) | 1979-01 → 2026-10 | Monthly, no 1987-12 and 1988-01 |
| Vegetation (MODIS Terra NDVI) | 2000-03 → 2026-10 | Monthly, land only |
| Carbon monoxide (MOPITT) | 2000-04 → 2024-10 | Monthly, 20 months missing at the source |
| Ocean plankton (MODIS Aqua chlorophyll) | 2002-07 → 2026-10 | Monthly, sea only |

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
    All repositories are public, but none has a license file yet: the code can be read, not reused.

---

## Still Have Questions?

- Open a [GitHub Issue](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues)
- Check the full [Documentation](../index.md)
- Read the [API Reference](../api/reference.md)
