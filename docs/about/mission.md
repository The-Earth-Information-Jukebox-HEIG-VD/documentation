# Mission: Accessible Climate Data

## The Problem

### Climate Data is Visual

NASA's Earth Information Center produces stunning visualizations of climate data:

- Temperature anomaly maps
- Sea level rise animations
- Greenhouse gas concentration charts
- Ice sheet extent timelines

These visualizations are powerful tools for understanding climate change. But they rely entirely on **sight**.

### 285 Million People Excluded

According to the World Health Organization (2010 global estimate):

- **285 million** people worldwide are visually impaired
- **39 million** are blind
- **246 million** have low vision

For these individuals, traditional climate visualizations are inaccessible. Charts, maps, and animations cannot convey information to someone who cannot see them.

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
| **Lightning** | Xylophone | Sharp, percussive strikes |
| **Night lights** | Harp | One held note per year, like the slow glow of cities |

Flute (dust) and French Horns (smoke) voices also exist in the composition engine, but no data is served for them yet.

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
- One bar of music per month of data
- Each instrument is scaled on the whole series of the zone, so the same value always gives the same note
- Datasets are lined up by date; an instrument is silent where it has no data

### 3. User Control

Users have full control over the experience:

- Play, pause, seek, jump to key climate moments
- Select a zone (continent, country, ocean or sea)
- Choose which instrument tracks to hear
- Adjust the overall volume

### 4. Educational Value

The experience teaches about climate:

- An About page explains the mapping between data and sound
- Info tooltips provide context
- Key climate moments link historical events to the timeline

---

## Impact

### Who Benefits?

1. **Visually impaired users**: Primary beneficiaries who can now access climate data
2. **Educators**: New tool for teaching about climate change
3. **Researchers**: Alternative data exploration method
4. **General public**: Engaging way to understand climate trends

### Broader Vision

Earth Information Jukebox demonstrates that:

- Data accessibility is achievable
- Multiple senses can convey information
- Climate communication can be innovative
- Technology can bridge accessibility gaps

We hope this project inspires others to consider accessibility in data presentation and scientific communication.

---

## Join Us

Climate data accessibility is just the beginning. If you're interested in:

- Contributing to the project
- Applying sonification to other datasets
- Improving accessibility features

Check out our [Contributing Guide](../development/contributing.md) and join us on [GitHub](https://github.com/The-Earth-Information-Jukebox-HEIG-VD).
