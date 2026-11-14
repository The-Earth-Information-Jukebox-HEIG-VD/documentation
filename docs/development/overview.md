# Development Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  GlobeView / │  │AudioPlayer-  │  │ TrackSelector        │  │
│  │  ListView    │  │Enhanced      │  │ (SlidingPanel)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│        │                  │                                     │
│        │        ┌─────────┴─────────┐                           │
│        │        │  useSonification  │                           │
│        │        └─────────┬─────────┘                           │
│        │        ┌─────────┴─────────┐                           │
│        │        │    ChunkPlayer    │ ◄── Web Audio API         │
│        │        └───────────────────┘     (decodeAudioData)     │
│  useZoneDataFrames ── reads /data/*.npy (HTTP Range)            │
└─────────────────────────────────────────────────────────────────┘
         │ /data/                      │ /api (HTTP/JSON)
         │                             │
┌────────┴──────────┐   ┌──────────────┴──────────────────────────┐
│ Datasets volume   │   │            Backend (FastAPI)             │
│ (nginx / Vite dev │   │  GET  /api/health      /api/instruments  │
│  plugin)          │   │  POST /api/zones/zone-data → 30 s MP3    │
└───────────────────┘   │  Music engine composes the orchestra     │
                        └──────────────────────────────────────────┘
```

The browser never synthesizes sound itself: the backend composes and renders the whole orchestra, and the webapp only plays the audio chunks it returns. **There is no offline fallback**: without the backend, no sound is produced and the UI shows a "sound server cannot be reached" error.

See `sonification/backend/FRONTEND_API.md` for the exact contract of the webapp's calls.

---

## Data Flow

1. **Page load** → `useInstruments` calls `GET /api/instruments` (and `/api/health`) to build the track list
2. **User selects a zone** (globe or list) → the zone's grid points are stored; Play becomes available
3. **Play** → `useSonification` → `ChunkPlayer` sends `POST /api/zones/zone-data` with the zone points, the enabled tracks (`dataset_ids`) and a time period
4. **Decode and play** → the response carries 30 s of MP3 (base64) and `next_time_period`; `ChunkPlayer` decodes it with `decodeAudioData` and plays it
5. **Chaining** → at 20% of the current chunk, the next one is prefetched with `next_time_period`; it is scheduled to start exactly `duration_s` after the previous one (the reverb tail overlaps), so playback is gapless. `next_time_period: null` means the end of the data
6. **Progress updates** → `onProgress` / `onChunk` callbacks → React state → timeline, year display, screen reader announcements
7. **Globe** → during playback, `useZoneDataFrames` reads the raw dataset values of the zone (month by month) from `/data/` and the globe draws them as coloured dots

Seeking, changing the zone or toggling a track aborts in-flight requests and restarts from the new position.

---

## Sonification Pipeline

```
Selected zone      Backend /api/zones/zone-data Browser
┌─────────────┐   ┌──────────────────────┐    ┌──────────────────┐
│ grid points │   │ aggregate values     │    │ decodeAudioData  │
│ + tracks    │ → │ map to notes, mix    │ →  │ schedule chunk N │
│ + period    │   │ orchestra → 30 s MP3 │    │ + prefetch N+1   │
└─────────────┘   └──────────────────────┘    └──────────────────┘
```

The mapping (warmer → higher, which instrument plays which dataset, scales and tempo) is defined in the backend; see the [sonification documentation](sonification.md) for the algorithms.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19, TypeScript, Vite 6 | UI framework |
| Frontend | react-globe.gl / three.js | 3D globe |
| Frontend | react-i18next | EN / FR / DE interface |
| Frontend | Web Audio API | Decoding and scheduling of server audio |
| Backend | FastAPI, Python | REST API, music engine |
| Data | NASA datasets (`.npy` monthly maps) | Climate data |
| Deploy | Docker (nginx + backend), GitHub Actions | Image build and publish |

---

## Repositories

| Repository | Contents |
|------------|----------|
| `webapp` | React frontend |
| `sonification` | FastAPI backend + music engine |
| `datasets` | Pre-processed data files |
| `data_processing` | Scripts that prepare the datasets |
| `deployment` | Docker Compose configuration |
| `documentation` | This documentation |

---

## Key Design Decisions

### Server-side Composition vs. Browser Synthesis
- **Choice**: The backend renders the music; the browser plays 30 s MP3 chunks
- **Why**: Real instrument sounds and richer composition than oscillators could give, one mixed file per request, and the same music engine for every client
- **Trade-off**: A running backend is required; there is no offline mode and no per-track volume (the server returns one mixed file)

### React State vs. Audio Engine State
- **Choice**: `ChunkPlayer` is a plain class that owns playback state outside React; `useSonification` mirrors it via callbacks
- **Why**: Audio scheduling is timing-critical, React re-renders must not interfere

### Raw Dataset Values on the Globe
- **Choice**: The browser reads the `.npy` maps directly from `/data/` with HTTP Range requests (only the rows of the selected zone)
- **Why**: The globe shows the real values behind the sound without another API; served by nginx in production and by a Vite dev plugin locally
