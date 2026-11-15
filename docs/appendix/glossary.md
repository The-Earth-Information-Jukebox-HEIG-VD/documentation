# Glossary

Key terms used in Earth Information Jukebox.

---

## A

### Anomaly
A deviation from a reference value or baseline. In climate data, temperature anomalies are differences from a historical average (e.g., 1951-1980 for GISTEMP).

### ARIA
Accessible Rich Internet Applications. A set of attributes that define ways to make web content more accessible to people with disabilities.

### AudioContext
The Web Audio API's central object for generating and processing audio. Must be created after user interaction due to browser autoplay policies.

---

## B

### Baseline
A reference period used for comparison. GISTEMP uses 1951-1980 as the baseline for temperature anomalies.

### BPM (Beats Per Minute)
The tempo of music, measuring how many beats occur in one minute. Each music style has its own reference tempo (76 BPM for the orchestra and the realistic mode, 96 to 150 for the other genres). By default the tempo of each bar is that reference x0.8 to x1.25, following the global CO2 of the bar's month (see [Tempo](#tempo)).

---

## C

### Chunk
A 30-second MP3 returned by `POST /api/zones/zone-data` (the webapp's call) or `POST /api/sonify`, covering about 8 months of data in 1880 and 12 to 13 today (one bar per month; the tempo rises with the CO2, so later chunks hold more bars). The response also gives `duration_s`, `bar_starts_s` (the start second of each bar) and `next_time_period`, the start of the next chunk; the webapp plays the chunks back to back.

### Carbon Monoxide (CO)
A gas from fires and traffic. The dataset is the MOPITT total column (10^18 molecules/cm²), played by the bassoon above the clean background (1.4 × 10^18).

### Chlorophyll
Chlorophyll-a in the ocean (mg/m³), a measure of plankton, from MODIS Aqua. Played by the vibraphone on a log scale (each tenfold step is the same pitch step); sea only.

### Common Grid
The team's shared map grid: 720×1440 pixels of 0.25° covering the whole globe (row 0 = 90°N, column 0 = 180°W). Every dataset uses it, so the same `[row, column]` is the same place in every dataset.

### CORS (Cross-Origin Resource Sharing)
A security mechanism that allows resources on a web page to be requested from another domain. The backend sets `JUKEBOX_CORS=*` to allow all origins in development.

### Climax
In musical style compositions, the section highlighting the most anomalous or dramatic moment in the data.

---

## D

### Data Sonification
See [Sonification](#sonification).

### Data Style
The default composition style of the engine (and the only one the webapp uses): every note comes from the data, one bar per month, no intro.

---

## E

### Eras
An optional engine mode (`"eras": true`) in which each bar takes the musical style of its date, from a Romantic orchestra before 1910 to modern pop and trap from 2010. Not used by the webapp, and not combined with a genre.

### EarthChestra
The name of the app (webapp title). "Earth Information Jukebox" is the name of the project and of the NASA Space Apps challenge it answers.

---

## F

### FastAPI
A modern, high-performance Python web framework used for the backend API.

### Frame
A single time step in the intensity map data. In the current datasets one frame is one month (night lights: one yearly map repeated for its 12 months).

---

## G

### Genre
See [Music Style](#music-style).

### GISTEMP
GISS Surface Temperature Analysis. NASA's estimate of global surface temperature change, maintained by the Goddard Institute for Space Studies.

### GPM IMERG
Global Precipitation Measurement, Integrated Multi-satellitE Retrievals for GPM. NASA's precipitation product, source of the rain and snow datasets.

### Groove
In vinyl mode, one turn of the needle's spiral: 30 seconds of music. A record has ten grooves. The webapp sends the path of each groove to `POST /api/zones/groove`.

### Grid
The spatial resolution of data. A 1° grid means data is available at 1-degree latitude/longitude intervals (180×360 cells globally). The datasets are stored on a 0.25° grid (720×1440, see [Common Grid](#common-grid)); the backend resamples them to 1° or 2° for composition.

---

## I

### Intensity Map
A 3D array (time × latitude × longitude) containing climate variable values. The primary data format for sonification.

### ISS LIS
Lightning Imaging Sensor on the International Space Station. Source of the lightning dataset (via NASA SVS), observed between 55°S and 55°N only.

### Intro
In musical style, an opening section where instruments enter one by one, introducing listeners to the orchestra.

---

## M

### MOPITT
Measurements Of Pollution In The Troposphere, an instrument of the Canadian Space Agency on NASA's Terra satellite. Source of the carbon monoxide dataset.

### Music Style
How the data is played, chosen in the webapp's **Music style** menu and sent as `genre`: `orchestra` (default), `realistic` (the sound of each phenomenon), or one of seven genres (`ragtime`, `swing`, `rocknroll`, `funk`, `synthpop`, `house`, `trap`). The list comes from `GET /api/genres`.

### MIDI (Musical Instrument Digital Interface)
A technical standard for communicating musical information. MIDI files contain note data but no actual audio.

### MkDocs
A static site generator for documentation, using Markdown files. We use MkDocs Material theme.

---

## N

### NDVI
Normalized Difference Vegetation Index, from -0.2 to 1: how green the land is. From MODIS Terra; played by the clarinet, silent over deserts and the sea.

### NSIDC Sea Ice Index
The National Snow and Ice Data Center's monthly sea ice concentration, source of the sea ice dataset (% of each cell covered by ice, 1979 onwards).

### NPY
NumPy's single-array file format. The `datasets` repository stores one `.npy` per month and per dataset (720×1440).

### NPZ
NumPy's archive format for saving multiple arrays. Used by the backend for the intensity maps it prepares from the `.npy` files (written uncompressed since API v2.5, for faster reading).

### Normalization
Scaling values to a standard range (typically 0-1) for consistent processing.

---

## O

### Orchestra
The collection of instruments assigned to different climate variables. Each variable has a specific instrument and role.

---

## P

### Palette
A predefined mapping of variables to instruments. "Orchestra" is the default; "auto" selects regional instruments.

### Pitch
The perceived frequency of a sound. Higher values in data map to higher pitches.

### Presence
A 0-1 value indicating how strongly a phenomenon is present (e.g., rainfall intensity). Affects note velocity.

---

## Q

### Quantization
In music, snapping pitches to a specific scale (major, minor, pentatonic) rather than using all chromatic notes.

---

## R

### Realistic Mode
The `realistic` music style: no instruments, each dataset is heard as the sound of what it is (rain, campfire, thunder, city traffic, street-lamp hum, crickets, singing ice, bubbles), with a heartbeat at the CO2's tempo. Recordings are free (CC0, public domain, CC BY); some sounds are synthesised.

### React
A JavaScript library for building user interfaces, used for the frontend.

### Role
An instrument's function in the orchestra: melody (lead), harmony (chords), or bass (low notes).

---

## S

### Scale
A set of musical notes arranged by pitch. Common scales include major (happy), minor (sad), and pentatonic (simple, consonant).

### Score
A complete musical composition, including all instruments, notes, timing, and metadata.

### Sonification
The use of non-speech audio to convey information. In this project, mapping climate data values to musical properties (pitch, volume, etc.).

### SoundFont
A file format containing samples of musical instruments, used for rendering MIDI to audio.

### Stems
Individual audio tracks for each instrument, allowing mixing and isolation.

### SVS
Scientific Visualization Studio. NASA's facility for creating visualizations of scientific data.

---

## T

### Tempo
The speed of music, measured in BPM (beats per minute). By default (API v2.13) the tempo of each bar follows the global CO2 of its month: the style's tempo x0.8 at 290 ppm (1880) to about x1.23 today, so the music speeds up over the decades. The engine can follow the zone's temperature instead (`tempo_source: "temperature"`). In vinyl Space and Both the tempo is fixed.

### Tension
A 0-1 value indicating how anomalous or dramatic a moment is in the data. Higher tension can trigger minor mode or more intense instrumentation.

### TypeScript
A typed superset of JavaScript used for the frontend, providing better tooling and error checking.

---

## V

### Vinyl Mode
The webapp's second way to listen: the globe becomes a record centred on a place. The needle travels across places (Space), through time on one place (Time), or both, with the date moving on by a month or a year per groove.

### Velocity
In MIDI, the force or speed of a note (0-127). Higher velocity = louder sound.

### Vitest
A testing framework for JavaScript/TypeScript, used for frontend testing.

### VSCO (Virtual Symphony Chamber Orchestra)
A free collection of orchestral samples used for high-quality audio rendering.

---

## W

### WAV
Waveform Audio File Format. An uncompressed audio format with highest quality but larger file size.

### WCAG
Web Content Accessibility Guidelines. International standards for web accessibility. We target WCAG 2.1 AA compliance.

### Web Audio API
A browser API for processing and synthesizing audio in web applications. The webapp uses it only to decode and schedule the MP3 chunks rendered by the backend.

---

## Z

### Zone
A geographic region for sonification. In the webapp, a continent, country, ocean or sea picked on the globe or in the list view; its grid points are sent to `/api/zones/zone-data`. The engine's `/api/compose` endpoint also accepts preset zones (e.g. "switzerland", "india") or a custom bounding box.

---

## Acronyms

| Acronym | Expansion |
|---------|-----------|
| A11Y | Accessibility (a + 11 letters + y) |
| API | Application Programming Interface |
| BPM | Beats Per Minute |
| CI/CD | Continuous Integration / Continuous Deployment |
| CORS | Cross-Origin Resource Sharing |
| CSS | Cascading Style Sheets |
| GISS | Goddard Institute for Space Studies |
| GPM | Global Precipitation Measurement |
| HEIG-VD | Haute Ecole d'Ingénierie et de Gestion du Canton de Vaud |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| IMERG | Integrated Multi-satellitE Retrievals for GPM |
| ISS | International Space Station |
| JSON | JavaScript Object Notation |
| LIS | Lightning Imaging Sensor |
| MIDI | Musical Instrument Digital Interface |
| MODIS | Moderate Resolution Imaging Spectroradiometer |
| MOPITT | Measurements Of Pollution In The Troposphere |
| MP3 | MPEG-1 Audio Layer III |
| NASA | National Aeronautics and Space Administration |
| NDVI | Normalized Difference Vegetation Index |
| NPY | NumPy array file |
| NPZ | NumPy Zip archive |
| NSIDC | National Snow and Ice Data Center |
| PCM | Pulse-Code Modulation |
| REST | Representational State Transfer |
| SVS | Scientific Visualization Studio |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |
| VSCO | Virtual Symphony Chamber Orchestra |
| WAV | Waveform Audio File Format |
| WCAG | Web Content Accessibility Guidelines |
