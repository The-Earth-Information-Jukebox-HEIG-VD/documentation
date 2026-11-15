# Mission: Accessible Climate Data

## The Problem

### Climate Data is Visual

NASA's Earth Information Center produces stunning visualizations of climate data:

- Temperature anomaly maps
- Sea level rise animations
- Greenhouse gas concentration charts
- Ice sheet extent timelines

These visualizations are powerful tools for understanding climate change. But they rely entirely on **sight**.

### People Left Out

For blind and visually impaired people, traditional climate visualizations are inaccessible. Charts, maps, and animations cannot convey information to someone who cannot see them.

---

## Our Solution: Sonification

### What is Sonification?

**Sonification** is the use of non-speech audio to convey information. Just as data visualization maps data to visual properties (color, position, size), sonification maps data to auditory properties:

| Visual Property | Auditory Property |
|-----------------|-------------------|
| Height (y-axis) | Pitch |
| Color intensity | Volume |
| Size | Duration |
| Category | Instrument/timbre |

### Why Music?

We chose to present climate data as **orchestral music** for several reasons:

1. **Intuitive mapping**: Higher values = higher pitch feels natural
2. **Multi-channel**: Multiple instruments can represent multiple variables simultaneously
3. **Emotional impact**: Music creates an emotional connection to the data
4. **Accessibility**: Music is universally understood across cultures
5. **Engagement**: Listening to music is enjoyable, encouraging exploration

---

## The Orchestra of Climate

We assign each climate variable to an orchestral instrument:

| Variable | Instrument | Why This Pairing |
|----------|------------|------------------|
| **Temperature** | Piano (chords) | Foundation of climate, foundation of harmony |
| **CO2** | Contrabass | Deep, underlying presence like greenhouse gases |
| **Rain** | Violins | Flowing, expressive like rainfall |
| **Snow** | Glockenspiel | Crystalline, delicate |
| **Fires** | Trombones | Brass that swells and holds, louder with more fires |
| **Lightning** | Timpani | Thunder: more flashes, more hits |
| **Night lights** | Synth pad | The only electronic sound for the only human-made signal, renewed each year then fading |
| **Sea ice** | Bowed glass | High and glassy; the summer lows get quieter as the ice is lost |
| **Vegetation (NDVI)** | Clarinet | A woodwind line that rises every spring and falls every autumn |
| **Carbon monoxide** | Bassoon | A low reed that swells with pollution above the clean background |
| **Ocean plankton** | Vibraphone | Struck strokes, more of them in a bloom (log scale) |

Flute (dust) and French Horns (smoke) voices also exist in the composition engine, but no data is served for them yet.

The orchestra is the default music style. A realistic mode plays the sound of each phenomenon instead (rain, fire, thunder, crickets, singing ice, and for CO2 a heartbeat that speeds up with the CO2), and seven other genres are there for fun.

---

## Design Principles

### 1. Accessibility First

Every feature is designed with accessibility in mind:

- Full keyboard navigation
- Screen reader compatibility (live announcements of the value being played)
- WCAG 2.1 AA as the target
- A list view as an alternative to the globe for zone selection

### 2. Scientific Accuracy

The sonification accurately represents the data:

- Real NASA data, averaged over the selected zone
- One bar of music per month of data (or per year, when one month is heard year after year)
- The tempo follows the global CO2 of each month, so the music speeds up over the decades
- Each instrument is scaled on the whole series of the zone, so the same value always gives the same note
- Datasets are lined up by date; an instrument is silent where it has no data

### 3. User Control

Users have full control over the experience:

- Play, pause, seek, play key climate events
- Select a zone (continent, country, ocean or sea)
- Choose which instrument tracks to hear
- Choose a music style, a light or dark theme, and the language
- Adjust the overall volume

### 4. Educational Value

The experience teaches about climate:

- A How to use page explains each control, and an About page explains the mapping between data and sound
- Info tooltips provide context
- Key climate moments link historical events to the timeline

---

## Join Us

Climate data accessibility is just the beginning. If you're interested in:

- Contributing to the project
- Applying sonification to other datasets
- Improving accessibility features

Check out our [Contributing Guide](../development/contributing.md) and join us on [GitHub](https://github.com/The-Earth-Information-Jukebox-HEIG-VD).
