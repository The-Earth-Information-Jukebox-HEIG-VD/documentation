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
| Vite `/api` proxy | `vite.config.ts` | Only used when `VITE_API_URL` is relative (`/api`): forwards to `http://localhost:8000` (fixed in the file) |
| `VITE_DATA_URL` | optional | Base URL of the dataset files (default `/data`), read by `services/volumeData.ts` |
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
│   ├── sonificationApi.ts      # Typed client for /api/zones/zone-data, /zones/series, /zones/groove,
│   │                           # /instruments, /genres, /health
│   ├── volumeData.ts           # Lists and reads datasets under /data/ (Range requests)
│   └── vinylApi.ts             # Vinyl mode: grooves on /zones/groove, travel 'time' on /zones/zone-data
├── hooks/
│   ├── useSonification.ts      # React interface to ChunkPlayer
│   ├── useInstruments.ts       # Track list from GET /api/instruments
│   ├── useZoneDataFrames.ts    # Raw dataset values of the zone, month by month
│   ├── useZoneSeries.ts        # Monthly series of the zone for the data graph (POST /api/zones/series)
│   ├── usePlaybackPosition.ts  # External store for the fine playback position (~10 Hz)
│   ├── useMusicStyle.ts        # Chosen music style (genre), from GET /api/genres, kept in localStorage
│   ├── useLocalStorageBoolean.ts / useLocalStorageString.ts # Preferences in localStorage
│   ├── useCompactOnScroll.ts   # Compact sticky header once the page is scrolled
│   ├── usePlayerBarHeight.ts   # Keeps --player-bar-height equal to the real player bar height
│   ├── usePlayerShortcuts.ts   # Global player keys (used by the vinyl player bar)
│   ├── useVinylSettings.ts / useVinylSonification.ts  # Vinyl mode
│   └── useHashRoute.ts         # #home / #how-to-use / #about routing
├── data/
│   ├── datasetRegistry.ts      # The 11 globe layers: files, display ranges, units, track ids
│   ├── trackColors.ts          # One colour per dataset, dark and light palettes (track dot, graph line, globe spots)
│   ├── keyMoments.ts           # The 15 key events (El Niño, wildfires, floods, storms, Hunga Tonga)
│   ├── vinylPresets.ts         # The 11 ready-made record centres (vinyl mode)
│   └── zones/                  # Continents, countries, water bodies (GeoJSON)
├── components/
│   ├── visualization/          # GlobeView, ListView, useSpotLayer + flowSpots (playback spots);
│   │                           # VinylGlobeView, VinylRecordView, VinylChunkTable
│   ├── player/                 # AudioPlayerEnhanced, Timeline, DatePicker, MonthTravelControl,
│   │                           # SeriesChart, VolumeControl, PositionDisplay; VinylPlayerBar
│   ├── controls/               # TrackPanel, StyleSelector, ViewModeToggle, ZoneViewSelector,
│   │                           # LanguageSelector, InfoTooltip; ExperienceModeSwitch, VinylControls
│   ├── moments/                # Key events section and cards
│   ├── howto/                  # How to use page (#how-to-use)
│   ├── about/                  # About page (#about)
│   └── layout/                 # Header, Footer, Navigation, ThemeToggle, SpinningLogo
├── contexts/                   # AccessibilityContext, ThemeContext, ViewModeContext, ExperienceModeContext
├── i18n/                       # EN / FR / DE (common.json, player.json, howto.json)
├── utils/                      # npy reader, zone cells, zoneMask (compact `mask`), geometry, reading formatter, vinylGeometry, regionName
├── types/                      # tracks.ts, zones.ts, ...
├── App.tsx
└── main.tsx
```

The live UI is `AudioPlayerEnhanced` (with `Timeline`, `DatePicker`, `MonthTravelControl` and the optional `SeriesChart`) + `GlobeView`/`ListView` + `TrackPanel` + `StyleSelector` + `KeyMomentsSection` in Time travel, and `VinylControls` + `VinylGlobeView`/`VinylRecordView` + `VinylPlayerBar` in Vinyl. Pages are chosen by the URL hash (`useHashRoute`): `#home`, `#how-to-use` (`HowToPage`) and `#about` (`AboutPage`).

### Visual identity

The palette comes from the logo (the Earth drawn as a vinyl record; source in `webapp/design/logo-source.png`, web sizes in `webapp/public/`). Tokens live in `src/styles/variables.css`:

| Token | Dark theme | Light theme | Use |
|---|---|---|---|
| `--color-primary` | `#f5d078` (label yellow) | `#f5d078` | buttons and selected fills (in light, selected fills add a navy `--selected-ring`) |
| `--color-on-primary` | `#071327` | `#071327` | text and icons on a yellow fill (never white) |
| `--color-primary-text` | `#f5d078` | `#7a5500` | the rare yellow-as-text use (yellow fails as text on white) |
| `--color-link` | `#fbe3a6` | `#2e5598` | links |
| `--color-focus` | `#f5d078` | `#2e5598` | the 3px `:focus-visible` ring |
| `--color-secondary` | `#4a6fc7` (ocean blue) | `#4a6fc7` | graphics only; `--color-secondary-text` (`#8ea8e6` / `#2e5598`) for blue text |
| `--color-land` | `#5a8c7c` (land green) | `#3f7a66` | graphics; `--color-land-text` (`#8fc3ae` / `#2f6b57`) for text |
| `--color-background` / `--color-surface` | `#071327` / `#0f203e` | `#f6f7fb` / `#ffffff` | page and panels (dark: the logo's ocean, darkened) |

**Animated logo.** The header and the About page show the logo through `SpinningLogo` (`components/layout/SpinningLogo.tsx` / `.css`): the vinyl Earth with a gramophone tonearm (an inline SVG, `aria-hidden`) resting beside it. Once on mount, in pure CSS, the arm swings onto the record, the record turns once, then the arm swings back to rest (about 3 s). It plays once per page load in the header and each time the About page opens. The image is decorative (`alt=""`; the surrounding link or heading names it). With `prefers-reduced-motion: reduce` or the app's `.reduced-motion` class, nothing moves: the logo stays still with the arm at rest. The loading screen shown while translations load (`main.tsx`) uses it too, and the documentation site's header has the same animated arm.

Areas are separated by surface tone and spacing, not borders. Borders remain only on form controls (`--color-control-border`, at least 3:1), on data marks and in high contrast mode. Track colours (`data/trackColors.ts`, one palette per theme, see [Light and dark themes](#light-and-dark-themes)) are data, not brand: the lightning yellow is close to the label yellow, so selected states next to track dots stay neutral.

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

Typed client for the backend (types are the exact shapes of `sonification/backend/FRONTEND_API.md`; the file header cites v2.10, the backend is at v2.14, whose later additions are new datasets and the CO2 tempo, with no change to the request shapes). The selected points are sent as a compact `mask` (`utils/zoneMask.ts`: 0.1° bit grid, deflate via `CompressionStream`, base64; a few kB instead of up to 14 MB) whenever the browser can build one, otherwise as `points`:

- `fetchZoneData(request, signal?)` → `POST /api/zones/zone-data` (`ZoneDataRequest`: `zone_id`, `zone_name`, `dataset_ids[]`, `points` or `mask`, `time_period`, `aggregation: "mean"`, optional `genre` and `step: "year"`; `ZoneDataResponse`: `dataset_ids` actually combined, `time_period`, `next_time_period`, `audio_data`, `duration_s`, `bar_starts_s`, `values` per dataset, `point_count`)
- `fetchZoneSeries(request, signal?)` → `POST /api/zones/series` (`ZoneSeriesRequest`: `dataset_ids[]`, `points`; `ZoneSeriesResponse`: `series` per dataset with `units`, `anomaly`, `start`, `yearly`, `values`, plus `missing`)
- `fetchGroove(request, signal?)` → `POST /api/zones/groove` (vinyl mode)
- `fetchInstruments(genre?)` → `GET /api/instruments` (instrument names in that genre)
- `fetchGenres()` → `GET /api/genres` (the Music style menu)
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
- Times the months inside a chunk with `bar_starts_s`: since the tempo follows the CO2, a 30 s chunk holds about 8 months in 1880 and 12 to 13 today, and bars are not all the same length
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

Builds the track list at runtime from `GET /api/instruments?genre=...` (and `/api/health` for the `preparing_data` flag). Each `Track` carries the dataset id, instrument name, role, availability, whether it is always playing, units, data period and its colour (from `data/trackColors.ts`). By default only the temperature track is on.

### StyleSelector and useMusicStyle

`components/controls/StyleSelector.tsx`, the **Music style** select above the track panel. `useMusicStyle` loads the genres from `GET /api/genres` and keeps the choice in `localStorage` (`earth-jukebox-music-style`, fallback `orchestra`). The options are grouped: **Recommended** (`RECOMMENDED_STYLES`: orchestra and realistic) and **Just for fun** (the others, in server order), with an `InfoTooltip` explaining why. The chosen `genre` is sent with every zone-data and groove request.

### MonthTravelControl

`components/player/MonthTravelControl.tsx`, the **Months** select in the player: **Every month** or **Only July** (and so on). With one month chosen, `ChunkPlayer` requests the chunks with `step: "year"` (one bar per year; helpers `withMonth`, `monthOccurrence`, `snapToMonth` in `sonificationApi.ts`), the timeline, date, globe and graph show that month of each year, and `Shift` + arrows on the timeline move one year.

### KeyMomentsSection

`components/moments/`, the **Key events** cards under the globe, from `data/keyMoments.ts` (15 events, each with a dataset, a peak month or range, zones and an optional photo with alt text). With a zone selected only its events are listed. Playing a card selects the zone if needed, keeps only the event's dataset on and seeks to a month before the event; "Playing now" marks the card while the music is inside its dates.

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
  role: string;          // harmony, bass, melody, percussion, swell, rhythm
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

In vinyl mode `usePlayerShortcuts` maps `←` `→` to the previous / next groove and `Home` / `End` to the first / last.

The Timeline slider handles its own keys when focused: `←` `→` (2%), `Shift` + `←` `→` (one month), `PageUp` / `PageDown` (one year forward / back), `Home` `End`. The skip buttons seek by 10% of the timeline.

!!! note "No `?` help dialog"
    There is no keyboard shortcuts dialog, so `?` does nothing.

---

## Vinyl mode

An **experience switch** (`ExperienceModeSwitch`, toggle buttons with `aria-pressed`) above the globe chooses between **Time travel** (`'zones'`: one zone through the years) and **Vinyl** (`'vinyl'`: the globe becomes a record). The choice is kept by `ExperienceModeContext` in `localStorage` (`earth-jukebox-experience-mode`); switching pauses the other mode's playback and announces the change. Both modes share the track selection of `TrackPanel` and the music style.

- **Geometry** (`utils/vinylGeometry.ts`, pure maths): the globe is seen from above a centre point. A needle starts 70° from the centre and spirals in to 2°; one side has 10 grooves (`VINYL_CHUNKS`) of 30 s, one turn per groove (5 minutes per side). `groovePath` gives the points the needle crosses during groove k (10 bars of 3 s, up to 4 points per bar).
- **Settings** (`useVinylSettings`, `VinylControls`): the month the record plays (or starts from), clamped to the months covered by the enabled tracks with a notice when clamped; the centre, from one of 11 presets (`data/vinylPresets.ts`: North and South Pole, six continents, Pacific, Atlantic and Indian Ocean; default Europe), an exact latitude / longitude, or a click on the globe; how **the needle travels** (radio group): `space` (one date, across places), `time` (one place, the months go by) or `both` (across places, the date moving on by `month` or `year` per groove). Changing the month, the centre, the travel mode, the step or the style lifts the needle back to the rim.
- **API** (`services/vinylApi.ts`): `space` and `both` call `POST /api/zones/groove` (`fetchGroove`) with the groove's path and the date (in `both`, one date per groove), plus the `genre`; the answer is 30 s of audio and one stop per point, `stops[i]` playing from `i * stop_seconds`, on one global scale per dataset. The groove endpoint has no "next" cursor: the frontend asks for groove k + 1 itself. `time` calls `POST /api/zones/zone-data` on a small disc around the centre (`GROOVE_RADIUS_DEG` = 2°) and chains the chunks with `next_time_period`, like Time travel.
- **Playback** (`useVinylSonification`, `VinylPlayerBar`): a second `ChunkPlayer`, with grooves mapped onto synthetic periods so chaining, prefetch and abort are reused. The bar has play / pause, previous / next groove and a groove slider (1 to 10); global keys come from `usePlayerShortcuts` (arrows: previous / next groove, `Home` / `End`: first / last).
- **Views**: `VinylGlobeView` (globe view) rotates the globe canvas under a fixed tonearm and draws a trail of spots under the needle (`useTrailSpotLayer`, `vinylTrail.ts`); `VinylRecordView` (list view, no WebGL) draws a schematic record and shows `VinylChunkTable` as a visible table; `VinylChunkTable` is the text alternative, one row per groove with its start, end, date, the region it crosses (`utils/regionName.ts`) and the values heard.

Tests exist for `VinylControls`, `VinylPlayerBar`, `VinylGlobeView`, `useVinylSettings`, `useVinylSonification`, `vinylApi`, `vinylTrail` and `vinylGeometry`.

---

## Internationalization

The interface is available in English, French and German (`src/i18n/locales/{en,fr,de}/`, namespaces `common`, `player` and `howto`). The language is detected from the browser and can be changed with the selector in the header. Add every new string to all three locales.

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
