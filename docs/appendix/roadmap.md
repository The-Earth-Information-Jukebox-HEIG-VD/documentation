# Roadmap

Future plans and features for Earth Information Jukebox and its app, EarthChestra.

---

## Current Status

### Completed (v1.0)

- [x] Core sonification engine (server-side composition, MP3 rendering)
- [x] Common 0.25° grid (720×1440) for all datasets, one `.npy` per month
- [x] GISTEMP temperature anomaly data (1880-2025)
- [x] GPM IMERG rain and snow (2000-2026)
- [x] ISS LIS lightning (2017-2023) and Earth at Night lights (2012-2023), extracted from NASA SVS
- [x] CO2 maps (2002-2022)
- [x] Multiple instruments (orchestra), datasets lined up by date
- [x] 30-second chunked playback in the browser (Web Audio API), with seamless chaining and prefetch
- [x] 3D globe and list view for zone selection (continents, countries, oceans, seas)
- [x] Raw dataset values drawn on the globe during playback
- [x] Track selection from `GET /api/instruments`
- [x] Key climate moments on the timeline
- [x] Interface in English, French and German
- [x] Keyboard navigation
- [x] Screen reader support (live announcements)
- [x] Docker images and Docker Compose deployment (local build)
- [x] API documentation

### Completed (v1.1)

- [x] Docker images published to GHCR (`v1.1.0` tags in `webapp`, `sonification`, `datasets`)
- [x] Wildfire sonification (MODIS fires 2002-2026, Trombones)
- [x] Interactive data graph of the selected zone (`POST /api/zones/series`, with text summary and table)
- [x] "Go to a date" picker (year + month)
- [x] Deployment behind Traefik with HTTPS, on a small server (host-folder data) or behind an existing Traefik
- [x] The webapp sends the selected zone as a compact `mask` instead of `points` (backend API v2.5)
- [x] Globe playback as flowing spots drawn on the GPU (instead of 3D cylinders)
- [x] Vinyl mode backend: `POST /api/zones/groove` (API v2.6, a path in space at one fixed date)

### Completed (v1.2)

- [x] Vinyl mode in the webapp: the globe becomes a record (10 grooves of 30 s), played through `POST /api/zones/groove`
- [x] Vinyl travel modes: Space (one date, across places), Time (one place, through the months, on `POST /api/zones/zone-data`) and Both (a month or a year per groove)
- [x] Music styles: orchestra, realistic sounds and seven genres (API v2.8, `GET /api/genres`), recommended styles first in the menu
- [x] Tempo that follows the data (API v2.9), genre in vinyl mode and exact chunk timing (`duration_s`, `bar_starts_s`, API v2.10)
- [x] Sound on iPhone with the silent switch on

### Completed (v1.3)

- [x] Logo-derived palette and visual identity, light and dark themes
- [x] 15 key events as cards under the globe (El Niño, wildfires, floods, storms, Hunga Tonga)
- [x] Month travel: one month year after year (`"step": "year"`, API v2.12)
- [x] Sea ice (NSIDC Sea Ice Index 1979-2026, bowed glass, API v2.11)
- [x] Global CO2 sets the tempo in every genre (API v2.13; sonification `v1.3.2`)
- [x] Vegetation (MODIS NDVI, clarinet), carbon monoxide (MOPITT, bassoon) and ocean plankton (MODIS Aqua chlorophyll, vibraphone) (API v2.14; datasets `v1.3.0`, sonification `v1.3.2`)
- [x] Realistic mode: the heartbeat is the CO2 track's sound (API v2.15)

### Completed (v1.4)

- [x] How to use page (`#how-to-use`) in the webapp
- [x] Animated logo (`SpinningLogo`): a gramophone tonearm swings onto the vinyl Earth, the record turns once, the arm swings back; still with reduced motion. Also on the loading screen and in the documentation site header
- [x] Realistic mode: the temperature is heard as city traffic (API v2.16, sonification `v1.4.1`)

### On `main`, not yet tagged

- [x] 22 key events (9 added: Russian heatwave, US drought, Arctic sea ice 2012, Beast from the East, Europe drought, Antarctic sea ice 2023, NWT–Alberta wildfires, Amazon fires 2024, Arctic winter ice 2025; the 2009–10 and 2023–24 El Niño cards removed), each listing the datasets that show it
- [x] Globe textures from NASA (Blue Marble Next Generation and ASTER elevation), served by the webapp instead of a CDN

---

## Short Term (Next Release)

### Enhanced Data Sources

- [ ] Data for the engine's dust (Flute) and smoke (French Horns) voices
- [ ] Real-time data updates
- [ ] More climate variables (sea level, land ice)

### Improved Audio

- [ ] VSCO samples by default
- [x] More instrument options (nine music styles)
- [ ] Custom instrument mapping
- [x] Concert-hall reverb in the rendering
- [ ] Spatial audio
- [ ] Variable playback speed

### User Experience

- [ ] Save/load compositions
- [ ] Share compositions via URL
- [ ] User accounts and preferences
- [ ] Audio transcript (how data maps to sound, per instrument)
- [ ] Keyboard shortcuts help dialog on `?`
- [x] A How to use page for new users
- [ ] Interactive guided tours
- [ ] Mobile-optimized interface

---

## Medium Term

### Advanced Sonification

- [x] Multi-variable compositions (hear multiple variables together)
- [ ] Comparison mode (two regions or time periods side-by-side)
- [ ] Custom mapping configurations
- [ ] Time-stretching (speed up/slow down without pitch change)
- [ ] Loop sections

### Visualization

- [x] Synchronized map visualization (the globe draws the zone's data month by month with the music)
- [x] Key events linked to the timeline
- [x] Interactive data chart (Graph toggle in the player)
- [ ] Visual representation of current pitch

### Accessibility

- [ ] More screen reader optimizations
- [ ] Haptic feedback (vibration patterns on mobile)
- [ ] Audio descriptions of data trends
- [x] Multiple language support (EN/FR/DE)

### Education

- [ ] Guided lessons about climate change
- [ ] Explanation panels for data context
- [x] Compare historical events to data (key events cards)
- [ ] More key events
- [ ] Teacher mode with classroom features

---

## Long Term Vision

### Data Integration

- [ ] Full SVS visualization sonification
- [ ] Computer vision for extracting data from videos
- [ ] User-uploaded custom datasets
- [ ] Real-time satellite data feeds

### Platform Expansion

- [ ] Native mobile apps (iOS/Android)
- [ ] Desktop application
- [ ] Embeddable widget for websites
- [ ] API for third-party integrations

### Community Features

- [ ] Composition sharing platform
- [ ] User-created instrument mappings
- [ ] Community-contributed datasets
- [ ] Discussion forums

### Research Applications

- [ ] Export for scientific analysis
- [ ] Pattern detection in audio
- [ ] Machine learning for trend identification
- [ ] Academic collaboration tools

---

## Technical Improvements

### Performance

- [ ] WebAssembly audio processing
- [ ] Service worker for offline support
- [x] Progressive loading of large datasets (the globe downloads only the rows covering the zone, with HTTP Range requests)
- [ ] CDN for audio files

### Infrastructure

- [ ] Kubernetes deployment
- [ ] Auto-scaling
- [ ] Global edge deployment
- [ ] Real-time WebSocket updates

### Developer Experience

- [ ] Plugin system for custom instruments
- [ ] Comprehensive test suite
- [x] Automated accessibility checks (jest-axe tests, eslint-plugin-jsx-a11y)
- [ ] API client libraries (JS, Python)

---

## How to Contribute

We welcome contributions in any of these areas:

1. **Pick an item** from the roadmap
2. **Open an issue** to discuss the approach
3. **Submit a PR** with your implementation

See the [Contributing Guide](../development/contributing.md) for details.

---

## Feedback

Have ideas for features? Let us know:

- [GitHub Issues](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues) - Bug reports, feature requests and general discussion

---

*This roadmap is a living document and will be updated as the project evolves.*
