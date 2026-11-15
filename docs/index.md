# Earth Information Jukebox

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ♪ ♫  EARTH INFORMATION JUKEBOX  ♫ ♪                      ║
    ║                                                               ║
    ║         Making Climate Data Audible for Everyone              ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
```

**NASA Space Apps Challenge 2026** - Transforming NASA Earth Information Center climate visualizations into orchestral audio (sonification).

---

## What is Earth Information Jukebox?

Earth Information Jukebox makes climate data **audible**. Its app, **EarthChestra**, converts eleven climate datasets (temperature anomalies, CO2, rain, snow, fires, lightning, night lights, sea ice, vegetation, carbon monoxide and ocean plankton) into music to create an accessible way to experience and understand climate change.

- **Higher values** sound **higher** in pitch, and **more of something** sounds **louder**
- The **tempo** follows the global CO2 of each month, so the music speeds up over the decades
- An **orchestra** brings the climate variables to life: one instrument per dataset (eight other music styles are on offer, including realistic sounds)

Pick a zone on the globe (a continent, country, ocean or sea), choose which sounds to hear, and press Play. The backend composes the orchestra from NASA gridded data for that zone and streams it as 30-second MP3 chunks, while the globe draws the raw dataset values month by month. In vinyl mode, the globe becomes a record and the needle travels across places, through time, or both.

!!! info "Why Sonification?"
    Traditional climate visualizations - charts, maps, animations - are inaccessible to blind and visually impaired people. Sound provides an alternative pathway to understanding data.

---

## Quick Navigation

<div class="grid cards" markdown>

-   :material-clock-fast:{ .lg .middle } **Quick Start**

    ---

    Get the application running locally in 5 minutes

    [:octicons-arrow-right-24: Quick Start](getting-started/quickstart.md)

-   :material-architecture:{ .lg .middle } **Architecture**

    ---

    Understand how the system is designed

    [:octicons-arrow-right-24: Architecture](development/overview.md)

-   :material-api:{ .lg .middle } **API Reference**

    ---

    Complete REST API documentation

    [:octicons-arrow-right-24: API Reference](api/reference.md)

-   :material-wheelchair-accessibility:{ .lg .middle } **Accessibility**

    ---

    WCAG 2.1 AA compliance and features

    [:octicons-arrow-right-24: Accessibility](user-guide/accessibility.md)

</div>

---

## The Orchestra

Each climate variable is assigned an instrument (the live list comes from `GET /api/instruments`):

| Variable | Instrument | Role | Data |
|----------|------------|------|------|
| Temperature anomaly | Piano | Chords (harmony), always playing | 1880-01 → 2025-12 |
| CO2 | Contrabass | Bass line, always playing | 2002-09 → 2022-03 |
| Rain | Violins | Melody | 2000-06 → 2026-11 |
| Snow | Glockenspiel | Melody | 2000-06 → 2026-11 |
| Fires | Trombones | Swell, below the chords | 2002-07 → 2026-11 |
| Lightning | Timpani | Percussion (thunder) | 2017-03 → 2023-07 |
| Night lights | Synth pad | Swell (one value per year, fading through the year) | 2012 → 2023 |
| Sea ice | Bowed glass | Melody, high and sustained; silent over land and warm seas | 1979-01 → 2026-10 |
| Vegetation (NDVI) | Clarinet | Melody; land only, silent over deserts | 2000-03 → 2026-10 |
| Carbon monoxide | Bassoon | Swell, louder with more pollution | 2000-04 → 2024-10 |
| Ocean plankton (chlorophyll) | Vibraphone | Strokes per beat, log scale; sea only | 2002-07 → 2026-10 |

!!! note
    The composition engine also defines Flute (dust) and French Horns (smoke) voices, but no real data is served for them.

---

## Repositories

| Repository | Description |
|------------|-------------|
| [webapp](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp) | React frontend: 3D globe, track selection, chunk playback (Web Audio API) |
| [sonification](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/sonification) | FastAPI backend + music composition engine (server-side MP3 rendering) |
| [datasets](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/datasets) | Pre-processed NASA data: one `.npy` per month on a 720×1440 (0.25°) grid |
| [data_processing](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/data_processing) | Scripts that extract the NASA sources onto the common grid |
| [deployment](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment) | Docker Compose orchestration |
| [documentation](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/documentation) | This documentation |

!!! note
    All repositories are public, but none has a license file yet: the code can be read, not reused.

---

## Team

| Name | Role |
|------|------|
| Egger Magali | Data Processing |
| Ferrari Téo | Sonification |
| Fleurimont Clarisse Estelle | Frontend, DevOps & Deployment |
| Izadmehr Yasaman | Data Processing |
| Walther Simon | Data Processing |
| Zmoos Léo | Sonification |

See the [Team](about/team.md) page.

*HEIG-VD - NASA Space Apps Challenge 2026*
