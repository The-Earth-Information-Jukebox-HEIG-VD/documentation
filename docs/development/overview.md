# Development Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ AudioPlayer  │  │DataVisualizer│  │    DataSelector      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
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

1. **User selects dataset** → `DataSelector` → state update
2. **Fetch data** → Backend API → NASA APIs → parsed response
3. **Load into engine** → `useSonification` → `SonificationEngine.loadData()`
4. **Play** → `SonificationEngine.play()` → Web Audio oscillators
5. **Progress updates** → callback → React state → UI update

---

## Sonification Pipeline

```
Raw Data          Normalized         Frequencies        Audio
┌─────────┐      ┌───────────┐      ┌───────────┐     ┌─────────┐
│ +1.54°C │      │   0.85    │      │  780 Hz   │     │  ♪ ♪ ♪  │
│ +0.82°C │  →   │   0.42    │  →   │  520 Hz   │  →  │ (sound) │
│ -0.15°C │      │   0.00    │      │  220 Hz   │     │         │
└─────────┘      └───────────┘      └───────────┘     └─────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, TypeScript, Vite | UI framework |
| Frontend | Web Audio API | Real-time audio |
| Backend | FastAPI, Python 3.12 | REST API |
| Backend | NumPy, SciPy | Data processing |
| Audio | MIDI, SoundFont, VSCO | Instrument samples |
| Data | NASA APIs | Climate data |
| Deploy | Docker, GitHub Actions | CI/CD |

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

## Key Design Decisions

### Web Audio API vs. Pre-rendered Audio
- **Choice**: Web Audio API for real-time synthesis
- **Why**: Interactive seeking, configurable parameters, no large file downloads

### React State vs. Audio Engine State
- **Choice**: Engine manages its own state, React subscribes via callbacks
- **Why**: Audio timing is critical, React re-renders would introduce latency
