# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ AudioPlayer  │  │DataVisualizer│  │    DataSelector      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                │                      │               │
│         └────────────────┴──────────────────────┘               │
│                          │                                      │
│              ┌───────────┴───────────┐                          │
│              │   useSonification()   │                          │
│              └───────────────────────┘                          │
│                          │                                      │
│              ┌───────────┴───────────┐                          │
│              │  SonificationEngine   │ ◄── Web Audio API        │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  /climate/*  │  │/sonification │  │     /health          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                │                                      │
│  ┌──────┴──────┐  ┌──────┴──────┐                              │
│  │GISTEMPClient│  │AudioGenerator│                              │
│  │ POWERClient │  │ DataMapper   │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                           │
                    External APIs
                           │
┌─────────────────────────────────────────────────────────────────┐
│                      NASA Data Sources                           │
├─────────────────────────────────────────────────────────────────┤
│  GISTEMP API        POWER API           SVS GSFC                │
│  (Temperature)      (Climate)           (Visualizations)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ NASA APIs   │────▶│   Backend   │────▶│  Frontend   │────▶│    User     │
│             │     │ Processing  │     │   Audio     │     │  Hears It   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     Data              Fetch &              Render             Play/
   Sources           Compose               Audio             Explore
```

### Step-by-Step

1. **User selects dataset** → `DataSelector` → state update
2. **Fetch data** → Backend API → NASA APIs → parsed response
3. **Load into engine** → `useSonification` → `SonificationEngine.loadData()`
4. **Play** → `SonificationEngine.play()` → Web Audio oscillators
5. **Progress updates** → callback → React state → UI update

---

## Sonification Pipeline

The core transformation from data to sound:

```
Raw Data          Normalized         Frequencies        Audio
┌─────────┐      ┌───────────┐      ┌───────────┐     ┌─────────┐
│ +1.54°C │      │   0.85    │      │  780 Hz   │     │  ♪ ♪ ♪  │
│ +0.82°C │  →   │   0.42    │  →   │  520 Hz   │  →  │ (sound) │
│ -0.15°C │      │   0.00    │      │  220 Hz   │     │         │
└─────────┘      └───────────┘      └───────────┘     └─────────┘
```

### Mapping Formula

```
frequency = minFreq + (normalizedValue × (maxFreq - minFreq))
```

Where:
- `minFreq` = 220 Hz (A3)
- `maxFreq` = 880 Hz (A5)
- `normalizedValue` = (value - min) / (max - min)

---

## Components

### Frontend Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `AudioPlayer` | Play/pause/seek controls | `isPlaying`, `progress`, `onPlay` |
| `DataVisualizer` | Bar chart of data | `data`, `currentIndex` |
| `DataSelector` | Choose dataset | `selected`, `onChange` |
| `InfoPanel` | Current data point | `dataPoint`, `unit` |

### Backend Modules

| Module | Purpose | External Deps |
|--------|---------|---------------|
| `nasa/gistemp.py` | Fetch GISTEMP data | httpx |
| `nasa/power.py` | Fetch POWER API data | httpx |
| `sonification/mappings.py` | Data-to-sound mapping | numpy |
| `sonification/generator.py` | WAV file generation | scipy, soundfile |
| `music/orchestra.py` | Instrument orchestration | tinysoundfont |

---

## Key Design Decisions

### Web Audio API vs. Pre-rendered Audio

**Choice**: Web Audio API for real-time synthesis

**Why**:
- Interactive seeking without re-downloading
- Configurable parameters (pitch, tempo, volume)
- No large file downloads
- Immediate playback

**Trade-off**: More complex client-side code, but better user experience

### FastAPI Backend vs. Static Data

**Choice**: FastAPI with NASA API clients

**Why**:
- Fresh data from NASA sources
- Caching for performance
- Future extensibility (computer vision, more datasets)
- Centralized data processing

**Trade-off**: Requires running a server, but enables real-time data

### Linear vs. Logarithmic Frequency Mapping

**Choice**: Linear for simplicity, musical scale option available

**Why**:
- Direct data representation
- Easy to understand (2x value ≠ 2x pitch)
- Musical mode quantizes to scales

**Trade-off**: Less perceptually uniform, but more intuitive

### React State vs. Audio Engine State

**Choice**: Engine manages its own state, React subscribes via callbacks

**Why**:
- Audio timing is critical (sub-millisecond)
- React re-renders would introduce latency
- Clean separation of concerns

**Trade-off**: Two sources of truth, but necessary for audio quality

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI framework |
| Frontend | TypeScript | Type safety |
| Frontend | Vite | Build tool |
| Frontend | Web Audio API | Real-time audio |
| Backend | FastAPI | REST API |
| Backend | Python 3.12 | Language |
| Backend | NumPy | Data processing |
| Backend | SciPy | Audio generation |
| Audio | MIDI | Musical scores |
| Audio | SoundFont / VSCO | Instrument samples |
| Data | NASA APIs | Climate data |
| Deploy | Docker | Containerization |
| Deploy | GitHub Actions | CI/CD |

---

## Repositories

| Repository | Contents |
|------------|----------|
| `webapp` | React frontend |
| `sonification` | FastAPI backend + music engine |
| `datasets` | Pre-processed data files |
| `deployment` | Docker Compose configuration |
| `documentation` | This documentation |

---

## Next Steps

- [Frontend Architecture](frontend.md)
- [Backend Architecture](backend.md)
- [Sonification Pipeline](sonification.md)
- [Deployment Architecture](deployment.md)
