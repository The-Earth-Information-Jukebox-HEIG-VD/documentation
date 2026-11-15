# Frontend Development

The frontend, **EarthChestra** (the Earth Information Jukebox project's app), is a React 19 + TypeScript application built with Vite. It plays the music composed by the backend through the Web Audio API and draws the selected zone's data on a 3D globe.

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
│   ├── ChunkPlayer.ts          # Plays the server's 30 s chunks (outside React)
│   └── iosAudioUnlock.ts       # iOS: plays Web Audio despite the silent switch (audio session "playback")
├── services/
│   ├── sonificationApi.ts      # Typed client for /api/zones/zone-data, /zones/series, /instruments, /health
│   ├── volumeData.ts           # Lists and reads datasets under /data/ (Range requests)
│   └── vinylApi.ts             # Vinyl mode (in development, simulated on zone-data)
├── hooks/
│   ├── useSonification.ts      # React interface to ChunkPlayer
│   ├── useInstruments.ts       # Track list from GET /api/instruments
│   ├── useZoneDataFrames.ts    # Raw dataset values of the zone, month by month
│   ├── useZoneSeries.ts        # Monthly series of the zone for the data graph (POST /api/zones/series)
│   ├── usePlaybackPosition.ts  # External store for the fine playback position (~10 Hz)
│   ├── useLocalStorageBoolean.ts # Boolean preference in localStorage (panel open, graph on)
│   ├── useCompactOnScroll.ts   # Compact sticky header once the page is scrolled
│   ├── usePlayerBarHeight.ts   # Keeps --player-bar-height equal to the real player bar height
│   ├── usePlayerShortcuts.ts   # Global player keys (used by the vinyl player bar)
│   ├── useVinylSettings.ts / useVinylSonification.ts  # Vinyl mode (in development)
│   └── useHashRoute.ts         # #home / #about routing
├── data/
│   ├── datasetRegistry.ts      # Known datasets: display ranges, track ids
│   ├── trackColors.ts          # One colour per dataset (track dot, graph line, globe spots)
│   ├── keyMoments.ts           # Key climate moments on the timeline
│   ├── vinylPresets.ts         # Ready-made record centres (vinyl mode)
│   └── zones/                  # Continents, countries, water bodies (GeoJSON)
├── components/
│   ├── visualization/          # GlobeView, ListView, useSpotLayer + flowSpots (playback spots);
│   │                           # VinylGlobeView, VinylRecordView, VinylChunkTable
│   ├── player/                 # AudioPlayerEnhanced, Timeline, DatePicker, SeriesChart,
│   │                           # VolumeControl, PositionDisplay; VinylPlayerBar
│   ├── controls/               # TrackPanel, ViewModeToggle, ZoneViewSelector, LanguageSelector,
│   │                           # InfoTooltip; ExperienceModeSwitch, VinylControls
│   ├── moments/                # Key moments section
│   └── layout/ about/          # Header, Footer, Navigation, About page
├── contexts/                   # AccessibilityContext, ViewModeContext, ExperienceModeContext
├── i18n/                       # EN / FR / DE (common.json, player.json)
├── utils/                      # npy reader, zone cells, zoneMask (compact `mask`), geometry, reading formatter, vinylGeometry, regionName
├── types/                      # tracks.ts, zones.ts, ...
├── App.tsx
└── main.tsx
```

The live UI is `AudioPlayerEnhanced` (with `Timeline`, `DatePicker` and the optional `SeriesChart`) + `GlobeView`/`ListView` + `TrackPanel`.

### Visual identity

The palette comes from the logo (the Earth drawn as a vinyl record; source in `webapp/design/logo-source.png`, web sizes in `webapp/public/`). Tokens live in `src/styles/variables.css`:

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#f5d078` (label yellow) | buttons, links, focus ring, selected fills |
| `--color-on-primary` | `#0a0e17` | text and icons on a yellow fill (never white) |
| `--color-secondary` | `#4a6fc7` (ocean blue) | graphics only; `--color-secondary-text` `#8ea8e6` for blue text |
| `--color-land` | `#5a8c7c` (land green) | graphics; `--color-land-text` `#8fc3ae` for text |
| `--color-background` / `--color-surface` | `#071327` / `#0f203e` | deep ocean blue (the logo's ocean, darkened) for the page and panels |

Areas are separated by surface tone and spacing, not borders. Borders remain only on form controls (`--color-control-border`, at least 3:1), on data marks and in high contrast mode. Track colours (`data/trackColors.ts`) are data, not brand: the lightning yellow is close to the label yellow, so selected states next to track dots stay neutral.

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

Typed client for the backend (types are the exact shapes of `sonification/backend/FRONTEND_API.md`; the file header cites v2.5; the backend is at v2.6, whose addition, `POST /api/zones/groove`, this client does not call). The selected points are sent as a compact `mask` (`utils/zoneMask.ts`: 0.1° bit grid, deflate via `CompressionStream`, base64; a few kB instead of up to 14 MB) whenever the browser can build one, otherwise as `points`:

- `fetchZoneData(request, signal?)` → `POST /api/zones/zone-data` (`ZoneDataRequest`: `zone_id`, `zone_name`, `dataset_ids[]`, `points`, `time_period`, `aggregation: "mean"`; `ZoneDataResponse`: `dataset_ids` actually combined, `time_period`, `next_time_period`, `audio_data`, `values` per dataset, `point_count`)
- `fetchZoneSeries(request, signal?)` → `POST /api/zones/series` (`ZoneSeriesRequest`: `dataset_ids[]`, `points`; `ZoneSeriesResponse`: `series` per dataset with `units`, `anomaly`, `start`, `yearly`, `values`, plus `missing`)
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

`useSonification` also returns `positionStore` (the fine position, read with `usePlaybackPosition` so only the components that need it re-render ~10 times a second), `timelineEnd`, `chunkValues` (values of every enabled track for the audible chunk) and `mainTrackId`.

### useInstruments Hook

Builds the track list at runtime from `GET /api/instruments` (and `/api/health` for the `preparing_data` flag). Each `Track` carries the dataset id, instrument name, role, availability, whether it is always playing, units, data period and its colour (from `data/trackColors.ts`). By default only the temperature track is on.

### TrackPanel

`components/controls/TrackPanel.tsx`, the inline "What do you want to hear?" section beside the globe. One toggle button (`aria-pressed`) per dataset with its colour dot, name, instrument, period and "only when present" note; animated bars mark the tracks sounding in the current chunk. The heading is a disclosure button (`aria-expanded`); the player's **Sounds** button toggles the same state (persisted with `useLocalStorageBoolean`, key `earth-jukebox-tracks-open`) and focuses the first row when opening.

### DatePicker

`components/player/DatePicker.tsx`, the date badge left of the timeline. A non-modal popover (`role="dialog"`) with Year and Month selects; months after the last data month are disabled. Focus goes to the Year select on open and back to the trigger on Go, Close or `Escape`; tabbing or clicking outside closes it. After Go it announces "Jumped to ...".

### SeriesChart and useZoneSeries

`useZoneSeries` calls `POST /api/zones/series` for the selected points and enabled tracks while the graph is on, and caches each series at module level by an area hash. `SeriesChart` draws one SVG line per track on the Timeline's axis (own scale per line, fixed dash pattern per track id, steps for yearly data), shares the hover position with the Timeline, seeks on click, and provides a text summary (`role="img"` label) and a visually hidden table of yearly means. The **Graph** toggle is persisted under `earth-jukebox-player-graph`.

### useZoneDataFrames Hook

While the globe is in playback mode, loads the raw values of the selected zone for the month being played, for the datasets matching the enabled tracks. It uses `volumeData.ts` and `utils/npy.ts` to read the `.npy` files under `/data/` with HTTP Range requests (only the rows of the zone). Zones are capped at 3000 grid cells (`MAX_ZONE_CELLS`).

`GlobeView` then removes the zone polygons and draws these values as **flowing spots** (`useSpotLayer`, layout in `flowSpots.ts`): each dataset scatters its own spots over the zone in its colour, the spot's area grows with the value and there is no spot below a threshold; close spots merge into patches with a faint light halo; temperature below normal is a ring, above normal a filled spot, so the value does not depend on colour alone. Spots are flat discs on the sphere drawn by the GPU as instanced three.js meshes (one per dataset, plus a ring mesh and a halo mesh), so an animation step only rewrites one matrix per spot. Sizes ease from one month to the next, with no easing under `prefers-reduced-motion`. A visually hidden table gives the same values.

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
  role: string;          // harmony, bass, melody, percussion, swell
  available: boolean;    // the server lists only datasets it has data for
  alwaysPlaying: boolean; // false: only audible while the phenomenon is present
  period: { start: string; end: string } | null;
  units: string | null;
  color: string;
  defaultEnabled: boolean;
  // ... see webapp/src/types/tracks.ts
}

interface TrackState { id: string; enabled: boolean }
```

`ZoneDataRequest` / `ZoneDataResponse` / `ZoneSeriesRequest` / `ZoneSeriesResponse` / `InstrumentInfo` are defined in `services/sonificationApi.ts`.

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

The app announces the current reading ("Now playing 1998: +0.6 °C vs normal"), loading, errors and the selected zone through permanently mounted `aria-live` regions. The List view is the screen-reader-friendly alternative to the globe, and the globe's data spots have a table equivalent.

---

## Keyboard Shortcuts

Implemented in `AudioPlayerEnhanced.tsx` (global, ignored while typing in a field, on a focused slider or button for Space, or while a dialog is open):

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` `→` | Seek backward / forward 2% of the timeline |
| `Home` / `End` | Jump to start / end |
| `M` | Mute / Unmute |
| `Esc` | On the globe's playback view, return to zone selection (`GlobeView`); closes the date picker (`DatePicker`) |

The Timeline slider handles its own keys when focused: `←` `→` (2%), `Shift` + `←` `→` (one month), `PageUp` / `PageDown` (one year forward / back), `Home` `End`. The skip buttons seek by 10% of the timeline.

!!! note "No `?` help dialog"
    There is no keyboard shortcuts dialog, so `?` does nothing.

---

## In development: vinyl experience mode

!!! warning "Not finished"
    Vinyl mode is work in progress, present only in the webapp's working tree (uncommitted files). The backend now serves its endpoint, `POST /api/zones/groove` (API v2.6, see the [API reference](../api/reference.md#post-apizonesgroove)), but the work-in-progress webapp code does not call it yet: the sound is still a simulation, and the details below may change.

An **experience switch** (`ExperienceModeSwitch`, toggle buttons with `aria-pressed`) above the globe chooses between **Time travel** (`'zones'`, the mode described on this page: one zone through the years) and **Vinyl** (`'vinyl'`: one month, the music spirals across the globe like a record). The choice is kept by `ExperienceModeContext` in `localStorage` (`earth-jukebox-experience-mode`); switching pauses the other mode's playback and announces the change. Both modes share the track selection of `TrackPanel`.

What the current files do:

- **Geometry** (`utils/vinylGeometry.ts`, pure maths): the globe is seen from above a centre point. A needle starts 70° from the centre and spirals in to 2°; one side has 10 chunks (`VINYL_CHUNKS`) of 30 s, one turn per chunk (5 minutes per side).
- **Settings** (`useVinylSettings`, `VinylControls`): the month the record plays (clamped to the months covered by the enabled tracks, with a notice when clamped) and its centre, from a preset (`data/vinylPresets.ts`: poles, continents, oceans; default Europe), exact latitude / longitude, or a click on the globe.
- **Playback** (`useVinylSonification`, `VinylPlayerBar`): a second `ChunkPlayer`, with grooves mapped onto synthetic periods so chaining, prefetch and abort are reused. The bar has play / pause, previous / next groove and a groove slider (1 to 10); global keys come from `usePlayerShortcuts`. Changing the centre or the month lifts the needle back to the rim.
- **API** (`services/vinylApi.ts`): a planned contract `POST /api/vinyl/vinyl-data` (`dataset_ids`, `time_period`, `center`, `chunk_index` → one groove of audio, `next_chunk_index`, `path`, `values`) is written down but **never served**: the backend implemented `POST /api/zones/groove` instead (a fixed date, the `path` of points the needle crosses, `points_per_bar`, `radius_deg` → audio + `stops` with the values under the needle, on one global scale). `vinylApi.ts` does not call it yet; `fetchVinylChunk` simulates a groove with `POST /api/zones/zone-data` on the band of cells it sweeps: it plays the chosen month and the 9 after it, and the mean over the band rather than the cell under the needle (the reported `values` are those of the chosen month).
- **Views**: `VinylGlobeView` (globe view) rotates the globe canvas under a fixed tonearm; `VinylRecordView` (list view, no WebGL) draws a schematic record and shows `VinylChunkTable` as a visible table; `VinylChunkTable` is the text alternative, one row per groove with its start, end, the region it crosses (`utils/regionName.ts`) and the values heard.

Tests exist for `VinylControls`, `VinylPlayerBar`, `VinylGlobeView`, `useVinylSonification`, `vinylApi` and `vinylGeometry`.

---

## Internationalization

The interface is available in English, French and German (`src/i18n/locales/{en,fr,de}/`, namespaces `common` and `player`). The language is detected from the browser and can be changed with the selector in the header. Add every new string to all three locales.

---

## Styling

- Plain CSS files next to each component, with custom properties (`src/styles/variables.css`) for theming
- Always include visible focus styles
- Respect `prefers-reduced-motion`

### Light and dark themes

- `variables.css` defines every color token twice: under `:root, [data-theme="dark"]` (the original dark values) and under `[data-theme="light"]`. Components only use `var(--…)`, so they follow the theme without changes.
- `ThemeContext` (`src/contexts/ThemeContext.tsx`) stores the preference (`system`, `light` or `dark`) under the `localStorage` key `earth-jukebox-theme`, resolves `system` with `matchMedia('(prefers-color-scheme: dark)')`, and sets `data-theme` on `<html>` and the `theme-color` meta tag. `useTheme()` exposes `{ preference, resolvedTheme, toggle }`.
- A small inline script in `index.html` sets `data-theme` before the first paint, so the page never flashes the wrong theme.
- Theme-specific helper tokens: `--color-primary-text` (yellow on dark, dark gold `#7a5500` on light, for the rare yellow-as-text use), `--color-link` / `--color-link-hover` (ocean blue `#2e5598` on light, because yellow fails as text on white) and `--color-focus` (the 3px `:focus-visible` outline: yellow on dark, ocean blue on light). Light text tokens are checked at >= 4.5:1 on every light surface (background `#f6f7fb`, surface `#ffffff`, hover `#eceff5`, active `#dfe4ee`).
- **Dark island:** the globe stage (`.globe-view`, `.vinyl-view`) and the vinyl record SVG carry `data-theme="dark"`. Because custom properties cascade, everything inside it (tooltips, legend, controls) resolves the dark tokens, even in the light theme. The three.js colors (atmosphere, grooves, caps) cannot read CSS variables and stay as constants.
- **Data colors** come from `src/data/trackColors.ts`: `trackColor(id, surface)` returns the dark or light palette. Use `resolvedTheme` for page surfaces (track panel, data graph) and always `'dark'` for anything drawn on the globe stage. Validate any palette change with the dataviz validator (`--mode light --surface "#f6f7fb" --pairs all`, and `--mode dark --surface "#1a1f2e"`).
- `.high-contrast` is scoped as `:root.high-contrast` so it overrides both themes.

```css
.button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .animated { animation: none; }
}
```
