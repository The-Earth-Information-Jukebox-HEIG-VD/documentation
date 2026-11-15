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

**NASA Space Apps Challenge 2026** - Transforming NASA Earth Information Center climate visualizations into orchestral audio (sonification), making climate data accessible to 285 million visually impaired people worldwide.

> *"Hear the Earth's story through music"*

## What is this?

**EarthChestra**, the Earth Information Jukebox project's app, transforms NASA climate data into sound. Temperature anomalies become musical tones: warmer years sound higher, cooler years lower. A 7-instrument orchestra, one instrument per dataset, brings climate variables to life:

| Variable | Instrument | Role |
|----------|------------|------|
| Temperature | Piano | Chords (harmony) |
| CO2 | Contrabass | Bass line |
| Precipitation (rain) | Violins | Melody |
| Snowfall | Glockenspiel | Melody |
| Lightning | Timpani | Percussion (thunder) |
| Fires | Trombones | Swell |
| Night lights | Synth pad | Swell (yearly) |

## Quick Links

- [Documentation](https://the-earth-information-jukebox-heig-vd.github.io/documentation) - Full project documentation
- [Quick Start](https://the-earth-information-jukebox-heig-vd.github.io/documentation/getting-started/quickstart/) - Get running in 5 minutes

## Repositories

| Repository | Description |
|------------|-------------|
| [webapp](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp) | React frontend with Web Audio API |
| [sonification](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/sonification) | FastAPI backend + music composition engine |
| [datasets](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/datasets) | Pre-processed NASA climate data |
| [deployment](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment) | Docker Compose orchestration |
| [documentation](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/documentation) | This documentation |

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

## Local Documentation Preview

```bash
# Install MkDocs Material
pip install mkdocs-material

# Serve documentation locally
mkdocs serve

# Visit http://127.0.0.1:8001 (port 8000 is left to the sonification API)
```

## License

This project is developed for the NASA Space Apps Challenge 2026.
