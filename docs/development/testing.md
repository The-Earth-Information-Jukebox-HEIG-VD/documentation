# Testing Guide

Guide for testing Earth Information Jukebox.

---

## Overview

| Type | Tool | Where | Purpose |
|------|------|-------|---------|
| Unit tests | Vitest | `webapp/src/**/*.test.ts(x)` | Functions, hooks, `ChunkPlayer`, API client |
| Component tests | Vitest + Testing Library | `webapp/src/components/**` | Component behaviour |
| Accessibility tests | jest-axe | inside component tests | WCAG checks |
| Backend tests | pytest | `sonification/backend`, `sonification/simulation` | API and data preparation |
| Runtime a11y checks | axe-core (dev only) | browser console | Violations while developing |

!!! note "Not set up yet"
    There are no end-to-end tests (Playwright is not installed), no coverage tooling or thresholds, and no CI workflow that runs the tests. The only GitHub Actions workflow in `webapp` builds and publishes the Docker image.

---

## Frontend Testing

### Running the tests

```bash
cd webapp
npm install
npm run test            # Vitest in watch mode
npx vitest run          # single run (currently 16 files, 112 tests)
npx vitest run src/audio/ChunkPlayer.test.ts   # one file
```

Vitest runs in a `jsdom` environment with globals enabled; the setup file is `src/test/setup.ts`. Tests are discovered with the pattern `src/**/*.{test,spec}.{ts,tsx,...}`.

### Test setup (`src/test/setup.ts`)

The setup file:

- registers the `jest-axe` matcher `toHaveNoViolations`
- mocks `window.matchMedia` and `localStorage`
- replaces `window.AudioContext` with `MockAudioContext`, which implements `decodeAudioData`, `createBufferSource`, gain and filter nodes; created buffer sources are collected in `MockAudioContext.sources` so tests can check what was scheduled and when

The backend is never called in tests: `ChunkPlayer` takes an injectable `fetchChunk` function and the API client is tested with a mocked `fetch`.

### What is covered

| Test file | Covers |
|-----------|--------|
| `audio/ChunkPlayer.test.ts` | Chaining via `next_time_period`, scheduling at `duration_s`, prefetch, completion on `null` |
| `services/sonificationApi.test.ts` | Request/response handling, `ApiError` kinds, FastAPI `detail` parsing |
| `hooks/useInstruments.test.ts` | Track list built from `/api/instruments` |
| `hooks/useZoneDataFrames.test.ts` | Month-by-month dataset loading |
| `utils/npy.test.ts`, `zoneCells.test.ts`, `reading.test.ts`, `zoneName.test.ts` | `.npy` parsing, zone grid cells, value formatting, zone names |
| `components/player/AudioPlayerEnhanced.test.tsx` | Blocked Play, live regions, axe |
| `components/panels/TrackSelector.test.tsx` | Track panel (unavailable tracks, badges), axe |
| `components/visualization/GlobeView.test.tsx`, `ListViewWater.test.tsx` | Globe and list views, axe |
| `components/ZoneViewSelector.test.tsx`, `data/zones/zones.test.ts` | Zone selector, zone data |
| `components/AudioPlayer.test.tsx`, `DataVisualizer.test.tsx` | Legacy components (not mounted in the app) |

### Unit test example: ChunkPlayer

`ChunkPlayer` receives its network function, so the whole chunk chain can be tested without a server:

```typescript
import { ChunkPlayer } from './ChunkPlayer';
import { MockAudioContext } from '../test/setup';

const fetchChunk = vi.fn(async (req: ZoneDataRequest) =>
  req.time_period === '1950-01' ? chunk('1950-01', '1960-01') : chunk('1960-01', null)
);
const player = new ChunkPlayer({ fetchChunk });
player.onComplete = onComplete;
player.setParams({ zoneId: 'europe', zoneName: 'Europe', points, datasetIds: ['temperature'] });

await player.play('1950-01');
expect(MockAudioContext.sources).toHaveLength(1);
player.tick();   // drive the progress/prefetch clock without timers
```

### Component test example: accessibility

```typescript
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../i18n';
import { AudioPlayerEnhanced } from './AudioPlayerEnhanced';

describe('AudioPlayerEnhanced accessibility', () => {
  it('blocked Play stays focusable and is described', async () => {
    const { container } = render(<AudioPlayerEnhanced {...base} playDisabled />);
    const play = screen.getByRole('button', { name: /play sonification/i });
    expect(play).toHaveAttribute('aria-disabled', 'true');
    expect(play).toHaveAccessibleDescription(/select a zone/i);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

Import `'../../i18n'` in component tests so translated labels resolve.

---

## Filtered Test Scripts

Two scripts filter by **test name** (`--testNamePattern`), not by folder:

```bash
npm run test:audio   # tests whose name contains "audio" (currently 4 tests)
npm run test:a11y    # tests whose name contains "accessibility" (currently 27 tests)
```

So `test:a11y` only runs tests inside a `describe` (or `it`) whose name contains the word `accessibility`, for example `describe('AudioPlayerEnhanced accessibility', ...)`. **Keep that word in the name of new accessibility tests**, otherwise they are skipped by this script. The match is case-sensitive.

Add `-- --reporter=verbose` for detailed output:

```bash
npm run test:a11y -- --reporter=verbose
```

---

## Accessibility Testing

### Automated (jest-axe)

Run `axe` on the rendered container and assert `toHaveNoViolations()` (see the example above). Automated checks catch only part of WCAG: also complete the manual checklist in the [Accessibility guide](../user-guide/accessibility.md) (keyboard, screen reader, contrast, reduced motion).

### Development-time checks

`@axe-core/react` runs automatically in development (`src/main.tsx`):

```typescript
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

Check the browser console for violations while using the app. `npm run lint` also enforces the `jsx-a11y` rules.

---

## Backend Testing

The backend tests are plain pytest files next to the code (no `tests/` directory):

| File | Covers |
|------|--------|
| `sonification/backend/test_api.py` | End-to-end API tests with FastAPI's `TestClient` (health, options, datasets, compose, sonify...) |
| `sonification/backend/test_prepare_data.py` | Data preparation |
| `sonification/simulation/test_build_monthly_dataset.py` | Monthly dataset builder |

```bash
cd sonification
pip install -r requirements.txt     # includes pytest and httpx
python -m pytest backend/test_api.py -q
python -m pytest backend simulation -q
```

`test_api.py` can also be run directly with `python backend/test_api.py`. It uses a temporary cache directory (`JUKEBOX_CACHE_DIR`) and picks datasets from `GET /api/datasets`, so the datasets must be available (the first test asserts at least one dataset exists; see `sonification/README.md` for how to generate them).

Minimal example, in the style of the existing tests:

```python
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"
```

The `/api/zones/zone-data` contract the webapp uses (request, `next_time_period`, errors) is documented in `sonification/backend/FRONTEND_API.md`.

---

## Best Practices

### Test Naming

```typescript
// Describe what, not how
describe('AudioPlayerEnhanced accessibility', () => {
  it('blocked Play stays focusable and says why when activated', () => {});
  it('says "end of data" when finished', () => {});
});
```

Remember the `accessibility` keyword for tests that should run with `npm run test:a11y`.

### Isolation

- Never call the real backend: inject `fetchChunk` or mock `fetch`
- Reset shared mocks between tests, for example `MockAudioContext.sources.length = 0` in `beforeEach`
- Wrap state updates in `act(...)`; some legacy tests still print `act` warnings

---

## Next Steps

- [Frontend Guide](frontend.md)
- [Backend Guide](backend.md)
- [Contributing Guide](contributing.md)
