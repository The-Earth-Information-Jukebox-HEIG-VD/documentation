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

Earth Information Jukebox makes climate data **audible**. By converting temperature anomalies, CO2 levels, precipitation, and other climate variables into musical tones, we create an accessible way to experience and understand climate change.

- **Warmer years** sound **higher** in pitch
- **Cooler years** sound **lower** in pitch
- An **8-instrument orchestra** brings different climate variables to life

!!! info "Why Sonification?"
    285 million people worldwide are visually impaired. Traditional climate visualizations - charts, maps, animations - are inaccessible to them. Sound provides an alternative pathway to understanding data.

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

    [:octicons-arrow-right-24: Architecture](architecture/overview.md)

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

Each climate variable is assigned an instrument:

| Variable | Instrument | Role |
|----------|------------|------|
| Temperature | Piano | Chords (harmony) |
| CO2 | Contrabass | Bass line |
| Precipitation | Violins | Melody |
| Dust | Flute | Melody |
| Smoke | French Horns | Melody |
| Lightning | Xylophone | Accents |
| Snowfall | Glockenspiel | Melody |

---

## Repositories

| Repository | Description |
|------------|-------------|
| [webapp](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp) | React frontend with Web Audio API |
| [sonification](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/sonification) | FastAPI backend + music composition engine |
| [datasets](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/datasets) | Pre-processed NASA climate data |
| [deployment](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment) | Docker Compose orchestration |
| [documentation](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/documentation) | This documentation |

---

## Team

| Name | Role |
|------|------|
| Zmoos Leo | Team Member |
| Ferrari Teo | Team Member |
| Izadmehr Yasaman | Team Member |
| Walther Simon | Team Member |
| Egger Magali | Team Member |
| Fleurimont Clarisse Estelle | Team Member |

*HEIG-VD - NASA Space Apps Challenge 2026*
