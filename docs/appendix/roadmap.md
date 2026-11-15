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

---

## Short Term (Next Release)

### In Progress

- [ ] Vinyl experience mode, frontend: one month played across the globe like a record (webapp work in progress, still simulated on `POST /api/zones/zone-data`; to be switched to `POST /api/zones/groove`, which the backend serves since API v2.6)

### Enhanced Data Sources

- [ ] Data for the engine's dust (Flute) and smoke (French Horns) voices
- [ ] Real-time data updates
- [ ] More climate variables (sea level, ice extent)

### Improved Audio

- [ ] VSCO samples by default
- [ ] More instrument options
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
- [ ] Guided tours for new users
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
- [x] Timeline with key climate moments
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
- [ ] Compare historical events to data
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

## Priorities

We prioritize features based on:

1. **Accessibility impact**: Does this help visually impaired users?
2. **User demand**: Is this frequently requested?
3. **Feasibility**: Can we implement this well?
4. **Alignment**: Does this fit the project mission?

---

## Feedback

Have ideas for features? Let us know:

- [GitHub Issues](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues) - Bug reports, feature requests and general discussion

---

*This roadmap is a living document and will be updated as the project evolves.*
