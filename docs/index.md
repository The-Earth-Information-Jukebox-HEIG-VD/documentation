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

Earth Information Jukebox makes climate data **audible**. Its app, **EarthChestra**, converts temperature anomalies, CO2 levels, rain, snow, fires, lightning and night lights into music to create an accessible way to experience and understand climate change.

- **Warmer years** sound **higher** in pitch
- **Cooler years** sound **lower** in pitch
- An **orchestra** brings the climate variables to life: one instrument per dataset

Pick a zone on the globe (a continent, country, ocean or sea), choose which sounds to hear, and press Play. The backend composes the orchestra from NASA gridded data for that zone and streams it as 30-second MP3 chunks, while the globe draws the raw dataset values month by month.

!!! info "Why Sonification?"
    An estimated 285 million people worldwide are visually impaired (WHO, 2010). Traditional climate visualizations - charts, maps, animations - are inaccessible to them. Sound provides an alternative pathway to understanding data.

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
| Temperature anomaly | Piano | Chords (harmony) | 1880-01 → 2025-12 |
| CO2 | Contrabass | Bass line | 2002-09 → 2022-03 |
| Rain | Violins | Melody | 2000-06 → 2026-11 |
| Snow | Glockenspiel | Melody | 2000-06 → 2026-11 |
| Fires | Trombones | Swell, below the chords | 2002-07 → 2026-11 |
| Lightning | Timpani | Percussion (thunder) | 2017-03 → 2023-07 |
| Night lights | Synth pad | Swell (one value per year, fading through the year) | 2012 → 2023 |

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
    At the time of writing, the code repositories are private and have no license file; only the documentation repository is public.

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
