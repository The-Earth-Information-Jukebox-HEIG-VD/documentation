# Frontend Development

The frontend is a React 19 + TypeScript application built with Vite. It plays the music composed by the backend through the Web Audio API and draws the selected zone's data on a 3D globe.

!!! warning "The backend is required"
    The webapp has no offline fallback. Without the sonification backend there is no sound and the UI shows a "sound server cannot be reached" error. Start it with `cd sonification && uvicorn backend.app:app --port 8000` (see the [Backend guide](backend.md)).

---

## Setup

```bash
cd webapp
npm install
npm run dev
```

The development server runs at http://localhost:5173 with hot module replacement.

### Configuration

| Setting | Where | Purpose |
|---------|-------|---------|
| `VITE_API_URL` | `.env.development` (dev), Docker build arg (prod, default `/api`) | Base URL of the backend API. In dev the browser calls the backend directly (default `http://localhost:8000/api`). Without it the client uses `/api` |
| `.env.development.local` | gitignored | Override `VITE_API_URL` when your backend runs on another port |
| `JUKEBOX_API_URL` | shell, read by `vite.config.ts` | Target of the Vite `/api` proxy (default `http://localhost:8000`), used when `VITE_API_URL` is not set |
| `VITE_DATA_URL` | optional | Base URL of the dataset files (default `/data`) |
| `JUKEBOX_DATA_DIR` | shell, read by `vite.config.ts` | Folder served at `/data/` in dev (default `../datasets/data`, i.e. the `datasets` repository) |

In production, nginx serves the build, proxies `/api/` to the `backend` container and serves the datasets volume at `/data/` (see [Docker](../deployment/docker.md)).

---

## Project Structure

```
webapp/src/
├── audio/
│   └── ChunkPlayer.ts          # Plays the server's 30 s chunks (outside React)
├── services/
│   ├── sonificationApi.ts      # Typed client for /api/zones/zone-data, /instruments, /health
│   └── volumeData.ts           # Lists and reads datasets under /data/ (Range requests)
├── hooks/
│   ├── useSonification.ts      # React interface to ChunkPlayer
│   ├── useInstruments.ts       # Track list from GET /api/instruments
│   ├── useZoneDataFrames.ts    # Raw dataset values of the zone, month by month
│   └── useHashRoute.ts         # #home / #about routing
├── data/
│   ├── datasetRegistry.ts      # Known datasets: colours, display ranges, track ids
│   ├── keyMoments.ts           # Key climate moments on the timeline
│   └── zones/                  # Continents, countries, water bodies (GeoJSON)
├── components/
│   ├── visualization/          # GlobeView, ListView
│   ├── player/                 # AudioPlayerEnhanced, Timeline, VolumeControl, PositionDisplay
│   ├── panels/                 # SlidingPanel, TrackSelector, TrackCheckbox
│   ├── controls/               # ViewModeToggle, ZoneViewSelector, LanguageSelector, InfoTooltip
│   ├── moments/                # Key moments section
│   ├── layout/ about/          # Header, Footer, Navigation, About page
│   └── (legacy, not mounted)   # AudioPlayer, DataVisualizer, DataSelector, InfoPanel,
│                               # KeyboardShortcuts, AudioTranscript
├── contexts/                   # AccessibilityContext, ViewModeContext
├── i18n/                       # EN / FR / DE (common.json, player.json)
├── utils/                      # npy reader, zone cells, geometry, reading formatter
├── types/                      # tracks.ts, zones.ts, ...
├── App.tsx
└── main.tsx
```

!!! note "Legacy components"
    `AudioPlayer`, `DataVisualizer`, `DataSelector`, `InfoPanel`, `KeyboardShortcuts`, `AudioTranscript` and `useAudioContext` still exist in the repository but `App.tsx` does not use them. The live UI is `AudioPlayerEnhanced` + `GlobeView`/`ListView` + `TrackSelector`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Type-check (`tsc`) then production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (including jsx-a11y rules, zero warnings allowed) |
| `npm run test` | Run tests with Vitest (watch mode; use `npx vitest run` for a single run) |
| `npm run test:audio` | Tests whose name contains `audio` |
| `npm run test:a11y` | Tests whose name contains `accessibility` |

---

## Core Modules

### sonificationApi.ts

Typed client for the backend (types are the exact shapes of `sonification/backend/FRONTEND_API.md`, v2.1):

- `fetchZoneData(request, signal?)` → `POST /api/zones/zone-data` (`ZoneDataRequest`: `zone_id`, `zone_name`, `dataset_ids[]`, `points`, `time_period`, `aggregation: "mean"`; `ZoneDataResponse`: `dataset_ids` actually combined, `time_period`, `next_time_period`, `audio_data`, `values` per dataset, `point_count`)
- `fetchInstruments()` → `GET /api/instruments`
- `fetchHealth()` → `GET /api/health`
- `ApiError` with a `kind` (`backendUnavailable`, `serverPreparing`, `noDataForPeriod`, `unknown`); it reads the FastAPI `{detail}` body
- helpers to convert between fractional years and `YYYY-MM` periods

The embedded base64 `audio_data` is played as is (the deployed backend returns no `audio_url`). Requests time out after 30 s.

### ChunkPlayer

A plain class that owns playback state outside React:

```typescript
class ChunkPlayer {
  // Audio context is created on the first play() (autoplay policy)
  play(...): void;
  pause(): void;
  seek(...): void;
  setVolume(volume: number): void;
  // Callbacks for React
  onProgress; onStateChange; onChunk; onError; onComplete;
}
```

- Decodes each chunk with `decodeAudioData`
- Schedules chunk N+1 at `chunkStart + duration_s` so the MP3 reverb tail overlaps (gapless)
- Prefetches the next chunk once the current one is 20% played, using `next_time_period` (`null` = end of data → `onComplete`)
- A failed prefetch is retried quietly with exponential backoff (up to 3 times); the error only surfaces if the audio runs out
- Aborts in-flight requests when the user seeks or changes the zone or the tracks

### useSonification Hook

React interface over `ChunkPlayer`:

```typescript
const {
  play, pause, retry, seek, seekToYear, setVolume, setTrackEnabled,
  isPlaying, status,            // 'idle' | 'loading' | 'playing' | 'error'
  error, hasEnded, canPlay,
  position, progress, currentYear, chunkYear, yearRange,
  currentValue, units, isAnomaly,
  trackStates,
} = useSonification({ tracks, points, zoneId, zoneName });
```

There is no per-track volume (the server returns one mixed file); `setVolume` sets the master volume. `canPlay` is false when no zone or no track is selected.

### useInstruments Hook

Builds the track list at runtime from `GET /api/instruments` (and `/api/health` for the `preparing_data` flag). Each `Track` carries the dataset id, instrument name, availability, data period and whether the data is real or simulated. Tracks the server has no data for are shown disabled. By default only the temperature track is on.

### useZoneDataFrames Hook

While the globe is in playback mode, loads the raw values of the selected zone for the month being played, for the datasets matching the enabled tracks. It uses `volumeData.ts` and `utils/npy.ts` to read the `.npy` files under `/data/` with HTTP Range requests (only the rows of the zone). Zones are capped at 3000 grid cells (`MAX_ZONE_CELLS`).

---

## Key Patterns

### Web Audio Initialization

Browsers require user interaction before audio plays. `ChunkPlayer` creates the `AudioContext` on the first `play()` call, which comes from the Play button or the Space shortcut.

### Player vs React State

`ChunkPlayer` owns playback state and timing; `useSonification` subscribes through callbacks and exposes React state. Audio scheduling is timing-critical and must not depend on React re-renders.

### Play Disabled Until a Zone Is Selected

No zone is selected at start. Play is `aria-disabled` with a hint ("Select a zone on the globe to play"); activating it announces the hint to screen readers. Pause is always available (WCAG 1.4.2).

---

## Type Definitions

```typescript
// types/tracks.ts
interface Track {
  id: string;            // dataset_id sent in dataset_ids to POST /api/zones/zone-data
  label: string;
  instrument: string;    // e.g. "Piano (chords)"
  available: boolean;    // false: no data on the server
  realData: boolean;     // false: simulated
  period: { start: string; end: string } | null;
  units: string | null;
  color: string;
  defaultEnabled: boolean;
  // ... see webapp/src/types/tracks.ts
}

interface TrackState { id: string; enabled: boolean }
```

`ZoneDataRequest` / `ZoneDataResponse` / `InstrumentInfo` are defined in `services/sonificationApi.ts`.

---

## Accessibility Requirements

Every component must:

1. **Semantic HTML**: Use `<button>`, `<input>`, not `<div onClick>`
2. **ARIA labels**: Label interactive elements
3. **Keyboard support**: Handle keyboard events
4. **Focus management**: Ensure logical focus order
5. **Live regions**: Announce dynamic content

```tsx
<button aria-label="Play sonification">
  <PlayIcon aria-hidden="true" />
</button>
```

The app announces the current reading ("Now playing 1998: +0.6 °C vs normal"), loading, errors and the selected zone through permanently mounted `aria-live` regions. The List view is the screen-reader-friendly alternative to the globe, and the globe's data dots have a table equivalent.

---

## Keyboard Shortcuts

Implemented in `AudioPlayerEnhanced.tsx` (global, ignored while typing in a field, on a focused slider or button for Space, or while a dialog is open):

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` `→` | Seek backward / forward 2% of the timeline |
| `Home` / `End` | Jump to start / end |
| `M` | Mute / Unmute |
| `Esc` | Close the track panel; on the globe, return to zone selection |

The Timeline slider handles `←` `→` `Home` `End` itself when focused. The skip buttons seek by 10% of the timeline.

!!! note "No `?` help dialog"
    A `KeyboardShortcuts` modal component (`?`) exists but is not mounted in `App.tsx`, so `?` currently does nothing.

---

## Internationalization

The interface is available in English, French and German (`src/i18n/locales/{en,fr,de}/`, namespaces `common` and `player`). The language is detected from the browser and can be changed with the selector in the header. Add every new string to all three locales.

---

## Styling

- Plain CSS files next to each component, with custom properties (`src/styles/variables.css`) for theming
- Always include visible focus styles
- Respect `prefers-reduced-motion`

```css
.button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .animated { animation: none; }
}
```
