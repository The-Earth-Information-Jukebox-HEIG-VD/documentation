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

**EarthChestra**, the Earth Information Jukebox project's app, transforms NASA climate data into sound. Pick a zone on the globe and an 11-instrument orchestra plays its data month by month: higher values sound higher or louder, and the tempo speeds up with the global CO2 of each month. One instrument per dataset:

| Variable | Instrument | Role |
|----------|------------|------|
| Temperature anomaly | Piano | Chords (harmony), always playing |
| CO2 | Contrabass | Bass line, always playing |
| Rain | Violins | Melody |
| Snow | Glockenspiel | Melody |
| Lightning | Timpani | Percussion (thunder) |
| Fires | Trombones | Swell |
| Night lights | Synth pad | Swell (yearly) |
| Sea ice | Bowed glass | Melody, high and sustained |
| Vegetation (NDVI) | Clarinet | Melody, land only |
| Carbon monoxide | Bassoon | Swell |
| Ocean plankton (chlorophyll) | Vibraphone | Strokes per beat, sea only (log scale) |

The same data can also be played in seven other music styles (ragtime, swing, rock'n'roll, funk, synth-pop, house, trap) or as realistic sounds (rain, fire, thunder, a heartbeat), and in a vinyl mode where the globe becomes a record.

## Quick Links

- [Documentation](https://the-earth-information-jukebox-heig-vd.github.io/documentation) - Full project documentation
- [Quick Start](https://the-earth-information-jukebox-heig-vd.github.io/documentation/getting-started/quickstart/) - Get running in 5 minutes

## Repositories

| Repository | Description |
|------------|-------------|
| [webapp](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp) | React frontend with Web Audio API |
| [sonification](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/sonification) | FastAPI backend + music composition engine |
| [datasets](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/datasets) | Pre-processed NASA climate data |
| [data_processing](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/data_processing) | Scripts that extract the NASA sources onto the common grid |
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

## AI assistance

This project (EarthChestra and its documentation) was developed with the help of AI assistants, Google Gemini and Anthropic Claude. In this repository they were used for:

- **Research and information gathering:** background on NASA climate datasets, sonification and accessibility.
- **Data analysis and interpretation:** explaining the datasets and their sound mappings in the documentation.
- **Coding, debugging and troubleshooting:** the MkDocs configuration of the documentation site.
- **Writing, editing and translating:** the user guide, developer and deployment pages, including translating content written by the team.

The team checked what the AI suggested and is responsible for the content of this repository. The same applies to every repository listed above; each one's README describes how AI was used there.

## License

This project is developed for the NASA Space Apps Challenge 2026.
