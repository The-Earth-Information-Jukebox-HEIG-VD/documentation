# Testing Guide

Comprehensive guide for testing Earth Information Jukebox.

---

## Overview

We use multiple testing strategies:

| Type | Tool | Purpose |
|------|------|---------|
| Unit Tests | Vitest/pytest | Test individual functions |
| Integration Tests | Testing Library | Test component interactions |
| Accessibility Tests | jest-axe/axe-core | WCAG compliance |
| End-to-End Tests | Playwright | Full user flows |

---

## Frontend Testing

### Setup

```bash
cd webapp
npm install
npm run test
```

### Unit Tests

Test individual functions and utilities:

```typescript
// src/audio/utils.test.ts
import { describe, it, expect } from 'vitest';
import { valueToFrequency, normalizeValue } from './utils';

describe('valueToFrequency', () => {
  it('maps minimum value to minimum frequency', () => {
    expect(valueToFrequency(0, 0, 100, 220, 880)).toBe(220);
  });

  it('maps maximum value to maximum frequency', () => {
    expect(valueToFrequency(100, 0, 100, 220, 880)).toBe(880);
  });

  it('maps mid value to mid frequency', () => {
    expect(valueToFrequency(50, 0, 100, 220, 880)).toBe(550);
  });
});

describe('normalizeValue', () => {
  it('normalizes to 0-1 range', () => {
    expect(normalizeValue(-40, -40, 50)).toBe(0);
    expect(normalizeValue(50, -40, 50)).toBe(1);
    expect(normalizeValue(5, -40, 50)).toBeCloseTo(0.5);
  });
});
```

### Component Tests

Test React components:

```typescript
// src/components/AudioPlayer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AudioPlayer } from './AudioPlayer';

const mockData = [
  { year: 2020, value: 1.02, unit: '°C' },
  { year: 2021, value: 0.85, unit: '°C' },
];

describe('AudioPlayer', () => {
  it('renders play button', () => {
    render(<AudioPlayer data={mockData} />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('toggles to pause when playing', async () => {
    render(<AudioPlayer data={mockData} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    expect(await screen.findByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('displays current data point', () => {
    render(<AudioPlayer data={mockData} />);
    expect(screen.getByText(/2020/)).toBeInTheDocument();
  });

  it('calls onProgress callback', () => {
    const onProgress = vi.fn();
    render(<AudioPlayer data={mockData} onProgress={onProgress} />);

    // Simulate playback progress
    // ...
  });
});
```

### Hook Tests

Test custom hooks:

```typescript
// src/hooks/useSonification.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSonification } from './useSonification';

describe('useSonification', () => {
  const mockData = [
    { year: 2020, value: 1.0, unit: '°C' },
    { year: 2021, value: 1.2, unit: '°C' },
  ];

  it('initializes with default state', () => {
    const { result } = renderHook(() => useSonification(mockData));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.volume).toBe(0.7);
  });

  it('updates isPlaying when play is called', async () => {
    const { result } = renderHook(() => useSonification(mockData));

    await act(async () => {
      await result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);
  });
});
```

### Mocking Web Audio API

```typescript
// test/mocks/webAudio.ts
export const mockAudioContext = () => {
  const oscillator = {
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
  };

  const gainNode = {
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
  };

  return {
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode),
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    state: 'running',
    currentTime: 0,
  };
};

// In test setup
beforeEach(() => {
  window.AudioContext = vi.fn().mockImplementation(mockAudioContext);
});
```

---

## Accessibility Testing

### Automated Tests with jest-axe

```typescript
// src/components/AudioPlayer.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AudioPlayer } from './AudioPlayer';

expect.extend(toHaveNoViolations);

describe('AudioPlayer Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<AudioPlayer data={mockData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA attributes', () => {
    render(<AudioPlayer data={mockData} />);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label');

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin');
    expect(slider).toHaveAttribute('aria-valuemax');
    expect(slider).toHaveAttribute('aria-valuenow');
  });

  it('has visible focus indicators', () => {
    const { container } = render(<AudioPlayer data={mockData} />);

    const button = screen.getByRole('button');
    button.focus();

    // Check computed styles for focus indicator
    const styles = window.getComputedStyle(button);
    expect(styles.outline).not.toBe('none');
  });
});
```

### Running Accessibility Tests

```bash
# Run all a11y tests
npm run test:a11y

# Run with detailed output
npm run test:a11y -- --reporter=verbose
```

### Development-Time Checks

axe-core runs automatically in development:

```typescript
// src/main.tsx (development only)
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

Check browser console for violations.

---

## Backend Testing

### Setup

```bash
cd sonification/backend
source venv/bin/activate
pip install pytest pytest-asyncio pytest-cov
pytest
```

### Unit Tests

```python
# tests/test_mappings.py
import pytest
import numpy as np
from music.mappings import value_to_pitch, normalize_array

def test_value_to_pitch():
    # Min value → min pitch
    assert value_to_pitch(0.0, (48, 84)) == 48

    # Max value → max pitch
    assert value_to_pitch(1.0, (48, 84)) == 84

    # Mid value → mid pitch
    assert value_to_pitch(0.5, (48, 84)) == 66

def test_normalize_array():
    values = np.array([-40, 5, 50])
    normalized = normalize_array(values, -40, 50)

    np.testing.assert_array_almost_equal(
        normalized,
        [0.0, 0.5, 1.0]
    )
```

### Async Tests

```python
# tests/test_clients.py
import pytest
from src.nasa.gistemp import GISTEMPClient

@pytest.mark.asyncio
async def test_gistemp_fetch():
    client = GISTEMPClient()
    data = await client.fetch_global_temperatures(
        start_year=2020,
        end_year=2022
    )

    assert len(data) > 0
    assert all(hasattr(d, 'year') for d in data)
    assert all(hasattr(d, 'anomaly') for d in data)
```

### API Integration Tests

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_compose_minimal():
    response = client.post("/api/compose", json={
        "zone": "global",
        "audio": False,  # Skip audio for speed
    })
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "score" in data
    assert data["score"]["n_bars"] > 0

def test_compose_invalid_zone():
    response = client.post("/api/compose", json={
        "zone": "atlantis"
    })
    assert response.status_code == 422
    assert "not found" in response.json()["detail"].lower()

def test_sonify_with_points():
    response = client.post("/api/sonify", json={
        "zone_id": "test",
        "points": [{"lat": 46.5, "lng": 6.5}],
        "time_period": "2024-03",
        "duration_s": 10,
    })
    assert response.status_code == 200
    data = response.json()
    assert "audio_data" in data
    assert "next_time_period" in data
```

### Fixtures

```python
# tests/conftest.py
import pytest
import numpy as np

@pytest.fixture
def sample_intensity_map():
    """Create sample intensity map for testing."""
    return np.random.rand(12, 180, 360)

@pytest.fixture
def sample_compose_request():
    """Standard compose request for testing."""
    return {
        "zone": "switzerland",
        "start": "2024-01",
        "end": "2024-06",
        "audio": False,
    }

@pytest.fixture
def mock_gistemp_data():
    """Mock GISTEMP temperature data."""
    from dataclasses import dataclass

    @dataclass
    class TempAnomaly:
        year: int
        month: int
        anomaly: float

    return [
        TempAnomaly(2020, 1, 1.02),
        TempAnomaly(2020, 2, 1.15),
        # ...
    ]
```

---

## End-to-End Testing

### Setup Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### E2E Tests

```typescript
// e2e/sonification.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Sonification Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('can play sonification', async ({ page }) => {
    // Wait for app to load
    await expect(page.getByRole('main')).toBeVisible();

    // Click play
    await page.getByRole('button', { name: /play/i }).click();

    // Verify playing state
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();

    // Wait for progress
    await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', /.+/);
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab to play button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Space to play
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();

    // Arrow to seek
    await page.keyboard.press('ArrowRight');
  });

  test('accessibility scan passes', async ({ page }) => {
    const accessibilityScanResults = await page.accessibility.snapshot();
    // Custom assertions on accessibility tree
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test sonification.spec.ts
```

---

## Coverage

### Frontend Coverage

```bash
npm run test -- --coverage
```

Coverage report in `coverage/` directory.

### Backend Coverage

```bash
pytest --cov=backend --cov-report=html
```

Coverage report in `htmlcov/` directory.

### Coverage Thresholds

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run test:a11y

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: pytest --cov
```

---

## Best Practices

### Test Naming

```typescript
// Describe what, not how
describe('AudioPlayer', () => {
  it('pauses playback when pause button is clicked', () => {});
  it('displays current year during playback', () => {});
  it('announces state changes to screen readers', () => {});
});
```

### Arrange-Act-Assert

```typescript
it('updates progress when seeking', () => {
  // Arrange
  const { result } = renderHook(() => useSonification(mockData));

  // Act
  act(() => {
    result.current.seek(50);
  });

  // Assert
  expect(result.current.progress).toBe(50);
});
```

### Test Isolation

```typescript
// Each test should be independent
beforeEach(() => {
  // Reset state
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup
});
```

---

## Next Steps

- [Frontend Guide](frontend.md)
- [Backend Guide](backend.md)
- [Contributing Guide](contributing.md)
