# Frontend Architecture

The frontend is a React application using TypeScript and the Web Audio API for real-time sound synthesis.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework with hooks |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Web Audio API | Real-time audio synthesis |
| Vitest | Testing framework |
| ESLint + Prettier | Code quality |

---

## Directory Structure

```
webapp/
├── src/
│   ├── audio/
│   │   ├── SonificationEngine.ts    # Core audio engine
│   │   └── useSonification.ts       # React hook
│   ├── components/
│   │   ├── AudioPlayer.tsx          # Playback controls
│   │   ├── DataVisualizer.tsx       # Data visualization
│   │   ├── DataSelector.tsx         # Dataset selection
│   │   ├── KeyboardShortcuts.tsx    # Keyboard help modal
│   │   └── AudioTranscript.tsx      # Accessibility text
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts  # Keyboard handling
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── public/
├── tests/
└── package.json
```

---

## Core Components

### SonificationEngine

The heart of the audio system. Manages Web Audio API oscillators, playback state, and data-to-frequency mapping.

```typescript
class SonificationEngine {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private data: ClimateDataPoint[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;

  // Initialize audio context (must be triggered by user interaction)
  async initialize(): Promise<void>;

  // Load climate data for sonification
  loadData(data: ClimateDataPoint[]): void;

  // Playback controls
  play(): void;
  pause(): void;
  stop(): void;
  seek(index: number): void;

  // Configuration
  setVolume(volume: number): void;
  setPlaybackSpeed(speed: number): void;

  // Callbacks for React integration
  onProgress: (index: number) => void;
  onStateChange: (isPlaying: boolean) => void;
  onComplete: () => void;
}
```

**Key Design Principle**: The engine owns playback state, not React. This prevents re-render latency from affecting audio timing.

### useSonification Hook

React-friendly interface to the SonificationEngine:

```typescript
function useSonification(data: ClimateDataPoint[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const engineRef = useRef<SonificationEngine | null>(null);

  return {
    play,
    pause,
    stop,
    seek,
    setVolume,
    isPlaying,
    progress,
    volume,
  };
}
```

### AudioPlayer

The playback control UI:

```tsx
<div role="region" aria-label="Audio player">
  <button onClick={isPlaying ? pause : play}>
    {isPlaying ? <PauseIcon /> : <PlayIcon />}
  </button>

  <input
    type="range"
    value={progress}
    onChange={(e) => seek(Number(e.target.value))}
    aria-label="Playback progress"
  />

  <span aria-live="polite">{currentDataPoint.year}: {currentDataPoint.value}°C</span>
</div>
```

---

## Type Definitions

```typescript
// types/index.ts

interface ClimateDataPoint {
  year: number;
  month?: number;
  value: number;
  unit: string;
}

interface SonificationConfig {
  minFrequency: number;  // Default: 220 Hz (A3)
  maxFrequency: number;  // Default: 880 Hz (A5)
  noteDuration: number;  // milliseconds
  playbackSpeed: number; // multiplier
}

interface ClimateDataset {
  id: string;
  name: string;
  description: string;
  data: ClimateDataPoint[];
  source: 'gistemp' | 'power' | 'svs';
}
```

---

## Audio Architecture

### Web Audio API Graph

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Oscillator  │────▶│  GainNode   │────▶│ Destination │
│  (tone)     │     │  (volume)   │     │ (speakers)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Initialization Pattern

Browsers require user interaction before audio can play:

```typescript
// ❌ Bad: Autoplay will fail
const ctx = new AudioContext(); // Created in suspended state

// ✅ Good: Initialize on user action
button.onclick = async () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  // Now audio can play
};
```

### Data-to-Frequency Mapping

```typescript
function valueToFrequency(
  value: number,
  min: number,
  max: number,
  minFreq: number = 220,
  maxFreq: number = 880
): number {
  const normalized = (value - min) / (max - min);
  return minFreq + normalized * (maxFreq - minFreq);
}
```

---

## State Management

### Engine State vs React State

```
┌─────────────────────────────────────────────────────────┐
│                    SonificationEngine                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Internal State (truth for audio):               │   │
│  │ - isPlaying: boolean                            │   │
│  │ - currentIndex: number                          │   │
│  │ - playbackStartTime: number                     │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                    callbacks                            │
│                         ▼                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   React Components                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ State (for UI only):                            │   │
│  │ - isPlaying: boolean (mirrors engine)           │   │
│  │ - progress: number (mirrors engine)             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

React state is updated via callbacks from the engine, ensuring the UI reflects the actual audio state without introducing latency.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` | Seek backward 5% |
| `→` | Seek forward 5% |
| `Home` | Jump to beginning |
| `End` | Jump to end |
| `?` | Show keyboard shortcuts |
| `Escape` | Close modal |

Implementation:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        seek(Math.max(0, progress - 5));
        break;
      case 'ArrowRight':
        seek(Math.min(100, progress + 5));
        break;
      // ...
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [progress, togglePlayPause, seek]);
```

---

## Testing

### Unit Tests

```typescript
// SonificationEngine.test.ts
describe('SonificationEngine', () => {
  it('maps data values to frequencies correctly', () => {
    const engine = new SonificationEngine();
    engine.loadData([{ year: 2020, value: 1.5, unit: '°C' }]);

    const freq = engine.valueToFrequency(1.5, -0.5, 1.5);
    expect(freq).toBe(880); // Max frequency for max value
  });

  it('initializes audio context on play', async () => {
    const engine = new SonificationEngine();
    await engine.play();
    expect(engine.isInitialized()).toBe(true);
  });
});
```

### Accessibility Tests

```typescript
// AudioPlayer.a11y.test.tsx
describe('AudioPlayer Accessibility', () => {
  it('has accessible play button', () => {
    render(<AudioPlayer data={mockData} />);
    const button = screen.getByRole('button', { name: /play/i });
    expect(button).toBeInTheDocument();
  });

  it('announces state changes', async () => {
    render(<AudioPlayer data={mockData} />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
```

---

## Performance Considerations

1. **Minimize re-renders**: Use `useCallback` and `useMemo` for audio callbacks
2. **Web Worker**: Consider moving heavy data processing to a worker
3. **Lazy loading**: Load data on demand, not all at once
4. **Audio buffer**: Pre-compute frequencies for smooth playback

---

## Next Steps

- [Backend Architecture](backend.md)
- [Sonification Pipeline](sonification.md)
- [Frontend Developer Guide](../developer-guide/frontend.md)
