# Frontend Development

The frontend is a React application using TypeScript and the Web Audio API.

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
├── App.tsx
└── main.tsx
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test` | Run all tests |
| `npm run test:a11y` | Run accessibility tests |

---

## Core Components

### SonificationEngine

The heart of the audio system:

```typescript
class SonificationEngine {
  private audioContext: AudioContext | null = null;
  private data: ClimateDataPoint[] = [];
  private isPlaying: boolean = false;

  async initialize(): Promise<void>;
  loadData(data: ClimateDataPoint[]): void;
  play(): void;
  pause(): void;
  stop(): void;
  seek(index: number): void;
  setVolume(volume: number): void;

  // Callbacks for React
  onProgress: (index: number) => void;
  onStateChange: (isPlaying: boolean) => void;
}
```

### useSonification Hook

React-friendly interface:

```typescript
function useSonification(data: ClimateDataPoint[]) {
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

---

## Key Patterns

### Web Audio Initialization

Browsers require user interaction before audio plays:

```typescript
// Initialize on user action
const handlePlay = async () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
};
```

### Engine vs React State

The engine owns playback state. React subscribes via callbacks:

```typescript
useEffect(() => {
  engine.callbacks.onProgress = (index) => {
    setProgress(index);
    setCurrentDataPoint(data[index]);
  };
}, [engine]);
```

**Why?** Audio timing is sub-millisecond sensitive. React re-renders would introduce latency.

---

## Type Definitions

```typescript
interface ClimateDataPoint {
  year: number;
  month?: number;
  value: number;
  unit: string;
}

interface SonificationConfig {
  minFrequency: number;  // Default: 220 Hz
  maxFrequency: number;  // Default: 880 Hz
  noteDuration: number;
  playbackSpeed: number;
}
```

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

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` `→` | Seek |
| `Home` / `End` | Jump to start/end |
| `?` | Show shortcuts |

---

## Styling

- Use CSS Modules for component styles
- Use CSS custom properties for theming
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
