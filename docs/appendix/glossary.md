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
The tempo of music, measuring how many beats occur in one minute. Default is 76 BPM.

---

## C

### CORS (Cross-Origin Resource Sharing)
A security mechanism that allows resources on a web page to be requested from another domain. The backend sets `JUKEBOX_CORS=*` to allow all origins in development.

### Climax
In musical style compositions, the section highlighting the most anomalous or dramatic moment in the data.

---

## D

### Data Sonification
See [Sonification](#sonification).

---

## F

### FastAPI
A modern, high-performance Python web framework used for the backend API.

### Frame
A single time step in the intensity map data. One frame might represent a day, week, or month depending on the dataset.

---

## G

### GISTEMP
GISS Surface Temperature Analysis. NASA's estimate of global surface temperature change, maintained by the Goddard Institute for Space Studies.

### Grid
The spatial resolution of data. A 1° grid means data is available at 1-degree latitude/longitude intervals (180×360 cells globally).

---

## I

### Intensity Map
A 3D array (time × latitude × longitude) containing climate variable values. The primary data format for sonification.

### Intro
In musical style, an opening section where instruments enter one by one, introducing listeners to the orchestra.

---

## M

### MIDI (Musical Instrument Digital Interface)
A technical standard for communicating musical information. MIDI files contain note data but no actual audio.

### MkDocs
A static site generator for documentation, using Markdown files. We use MkDocs Material theme.

---

## N

### NPZ
NumPy's compressed archive format for saving multiple arrays. Used for storing intensity maps.

### Normalization
Scaling values to a standard range (typically 0-1) for consistent processing.

---

## O

### Oscillator
In Web Audio API, a node that generates periodic waveforms (sine, square, sawtooth) used for synthesizing tones.

### Orchestra
The collection of instruments assigned to different climate variables. Each variable has a specific instrument and role.

---

## P

### Palette
A predefined mapping of variables to instruments. "Orchestra" is the default; "auto" selects regional instruments.

### Pitch
The perceived frequency of a sound. Higher values in data map to higher pitches.

### POWER API
Prediction Of Worldwide Energy Resources. NASA's API for location-specific climate data.

### Presence
A 0-1 value indicating how strongly a phenomenon is present (e.g., rainfall intensity). Affects note velocity.

---

## Q

### Quantization
In music, snapping pitches to a specific scale (major, minor, pentatonic) rather than using all chromatic notes.

---

## R

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
The speed of music, measured in BPM (beats per minute).

### Tension
A 0-1 value indicating how anomalous or dramatic a moment is in the data. Higher tension can trigger minor mode or more intense instrumentation.

### TypeScript
A typed superset of JavaScript used for the frontend, providing better tooling and error checking.

---

## V

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
A browser API for processing and synthesizing audio in web applications.

---

## Z

### Zone
A geographic region for sonification (e.g., "global", "switzerland", "india"). Can be preset or custom-defined.

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
| HEIG-VD | Haute Ecole d'Ingenierie et de Gestion du Canton de Vaud |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| JSON | JavaScript Object Notation |
| MIDI | Musical Instrument Digital Interface |
| NASA | National Aeronautics and Space Administration |
| NPZ | NumPy Zip (compressed archive) |
| PCM | Pulse-Code Modulation |
| REST | Representational State Transfer |
| SVS | Scientific Visualization Studio |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |
| WAV | Waveform Audio File Format |
| WCAG | Web Content Accessibility Guidelines |
