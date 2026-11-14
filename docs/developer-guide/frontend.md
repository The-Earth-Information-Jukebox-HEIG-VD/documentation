# Frontend Developer Guide

Guide for developing the React frontend.

---

## Setup

```bash
cd webapp
npm install
npm run dev
```

Development server runs at http://localhost:5173 with hot module replacement.

---

## Project Structure

```
webapp/src/
├── audio/
│   ├── SonificationEngine.ts   # Core Web Audio engine
│   └── useSonification.ts      # React hook
├── components/
│   ├── AudioPlayer.tsx         # Playback controls
│   ├── DataVisualizer.tsx      # Data visualization
│   ├── DataSelector.tsx        # Dataset/region selection
│   ├── KeyboardShortcuts.tsx   # Keyboard help modal
│   └── AudioTranscript.tsx     # Accessibility transcript
├── hooks/
│   └── useKeyboardShortcuts.ts
├── types/
│   └── index.ts                # TypeScript interfaces
├── api/
│   └── client.ts               # API client
├── App.tsx
└── main.tsx
```

---

## Key Patterns

### Web Audio Initialization

Browsers require user interaction before audio plays:

```typescript
// ❌ Will be suspended
const ctx = new AudioContext();

// ✅ Initialize on user action
const handlePlay = async () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  // Now safe to play
};
```

### Engine vs. React State

The `SonificationEngine` owns playback state. React subscribes via callbacks:

```typescript
// In SonificationEngine
private callbacks = {
  onProgress: (index: number) => void,
  onStateChange: (isPlaying: boolean) => void,
};

// In React component
useEffect(() => {
  engine.callbacks.onProgress = (index) => {
    setProgress(index);
    setCurrentDataPoint(data[index]);
  };
}, [engine]);
```

**Why?** Audio timing is sub-millisecond sensitive. React re-renders would introduce latency.

### Hooks Pattern

Use the `useSonification` hook for React integration:

```typescript
function AudioPlayer({ data }: { data: ClimateDataPoint[] }) {
  const {
    play,
    pause,
    stop,
    seek,
    setVolume,
    isPlaying,
    progress,
    volume,
  } = useSonification(data);

  return (
    <div>
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <input
        type="range"
        value={progress}
        onChange={(e) => seek(Number(e.target.value))}
      />
    </div>
  );
}
```

---

## Component Development

### Creating a New Component

1. Create the component file:

```typescript
// src/components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  value: number;
  onChange: (value: number) => void;
}

export const MyComponent: FC<MyComponentProps> = ({ value, onChange }) => {
  return (
    <div role="region" aria-label="My component">
      {/* Component content */}
    </div>
  );
};
```

2. Add tests:

```typescript
// src/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent value={50} onChange={() => {}} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
```

3. Add accessibility tests:

```typescript
// src/components/MyComponent.a11y.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent value={50} onChange={() => {}} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Accessibility Requirements

Every component must:

1. **Semantic HTML**: Use proper elements (`<button>`, `<input>`, not `<div onClick>`)

2. **ARIA labels**: Label interactive elements

   ```tsx
   <button aria-label="Play sonification">
     <PlayIcon aria-hidden="true" />
   </button>
   ```

3. **Keyboard support**: Handle keyboard events

   ```tsx
   <div
     role="button"
     tabIndex={0}
     onClick={handleClick}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         handleClick();
       }
     }}
   >
   ```

4. **Focus management**: Ensure logical focus order

5. **Live regions**: Announce dynamic content

   ```tsx
   <div aria-live="polite">{status}</div>
   ```

---

## API Integration

### API Client

```typescript
// src/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchSonification(request: SonifyRequest) {
  const response = await fetch(`${API_BASE}/api/sonify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

### Using the API

```typescript
function SonificationPlayer() {
  const [audioData, setAudioData] = useState<string | null>(null);

  const handleGenerate = async () => {
    const result = await fetchSonification({
      zone_id: 'france',
      time_period: '2024-03',
      duration_s: 30,
    });

    setAudioData(result.audio_data);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      {audioData && (
        <audio src={`data:audio/mpeg;base64,${audioData}`} controls />
      )}
    </div>
  );
}
```

---

## Testing

### Unit Tests

```bash
npm run test
```

Test files should be co-located with components:

```
components/
├── AudioPlayer.tsx
├── AudioPlayer.test.tsx
└── AudioPlayer.a11y.test.tsx
```

### Testing Audio

Use mocked Web Audio API:

```typescript
// Mock AudioContext
beforeEach(() => {
  window.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
    }),
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: { setValueAtTime: jest.fn() },
    }),
    destination: {},
    resume: jest.fn().mockResolvedValue(undefined),
    state: 'running',
  }));
});
```

### Accessibility Tests

```bash
npm run test:a11y
```

Uses `jest-axe` for automated checks.

---

## Styling

### CSS Modules

Components use CSS Modules:

```typescript
// AudioPlayer.tsx
import styles from './AudioPlayer.module.css';

<button className={styles.playButton}>
```

### CSS Variables

Use CSS custom properties for theming:

```css
:root {
  --color-primary: #2563eb;
  --color-text: #1f2937;
  --color-background: #ffffff;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}
```

### Focus Styles

Always include visible focus styles:

```css
.button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none;
    transition: none;
  }
}
```

---

## State Management

### Local State

Use React hooks for component state:

```typescript
const [isPlaying, setIsPlaying] = useState(false);
const [progress, setProgress] = useState(0);
```

### Shared State

For shared state, use Context:

```typescript
const SonificationContext = createContext<SonificationContextType | null>(null);

export function SonificationProvider({ children }) {
  const [data, setData] = useState<ClimateDataPoint[]>([]);
  const engine = useRef(new SonificationEngine());

  return (
    <SonificationContext.Provider value={{ data, setData, engine }}>
      {children}
    </SonificationContext.Provider>
  );
}
```

---

## Error Handling

### Error Boundaries

Wrap components in error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorFallback />}>
  <AudioPlayer data={data} />
</ErrorBoundary>
```

### API Errors

Handle API errors gracefully:

```typescript
try {
  const result = await fetchSonification(request);
  setData(result);
} catch (error) {
  setError('Failed to generate sonification. Please try again.');
  console.error('Sonification error:', error);
}
```

---

## Performance

### Memoization

Use `useMemo` and `useCallback` for expensive operations:

```typescript
const frequencies = useMemo(
  () => data.map(point => valueToFrequency(point.value)),
  [data]
);

const handlePlay = useCallback(() => {
  engine.current.play();
}, []);
```

### Lazy Loading

Lazy load heavy components:

```typescript
const DataVisualizer = lazy(() => import('./DataVisualizer'));

<Suspense fallback={<Loading />}>
  <DataVisualizer data={data} />
</Suspense>
```

---

## Debugging

### Development Tools

- **React DevTools**: Inspect component tree
- **Web Audio Inspector**: Debug audio graph (Chrome)
- **axe DevTools**: Check accessibility

### Logging

Use console groups for audio debugging:

```typescript
console.group('Sonification');
console.log('Data points:', data.length);
console.log('Duration:', duration);
console.log('Frequency range:', [minFreq, maxFreq]);
console.groupEnd();
```

---

## Next Steps

- [Architecture: Frontend](../architecture/frontend.md)
- [Testing Guide](testing.md)
- [Contributing Guide](contributing.md)
