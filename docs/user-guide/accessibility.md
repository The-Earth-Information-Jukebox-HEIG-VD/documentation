# Accessibility

Earth Information Jukebox is designed to be accessible to all users, including those with visual impairments, motor disabilities, and other accessibility needs.

---

## Our Commitment

This project exists to make climate data accessible to the **285 million visually impaired people** worldwide. Accessibility is not an afterthought - it's our core mission.

We follow **WCAG 2.1 AA** guidelines and actively test with assistive technologies.

---

## Keyboard Navigation

### Full Keyboard Access

Every feature is accessible via keyboard. No mouse required.

| Key | Action |
|-----|--------|
| `Tab` | Move to next interactive element |
| `Shift + Tab` | Move to previous element |
| `Enter` / `Space` | Activate buttons and links |
| `Arrow keys` | Navigate within components |
| `Escape` | Close modals and dialogs |

### Playback Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` Arrow | Seek backward 5% |
| `→` Arrow | Seek forward 5% |
| `Home` | Jump to beginning |
| `End` | Jump to end |
| `↑` Arrow | Volume up |
| `↓` Arrow | Volume down |
| `M` | Mute / Unmute |

### Help

Press `?` at any time to see all keyboard shortcuts.

---

## Screen Reader Support

### Tested With

- **VoiceOver** (macOS/iOS)
- **NVDA** (Windows)
- **JAWS** (Windows)

### What Screen Readers Announce

- Page title and current section
- All interactive elements with their purpose
- Current playback state (playing, paused, stopped)
- Data values as they play
- Status changes via live regions

### Landmarks

The page uses semantic landmarks:

```
<header> - Page header with title and navigation
<main>   - Primary content area
<nav>    - Navigation menus
<footer> - Page footer
```

Navigate by landmark using your screen reader:

- **VoiceOver**: VO + U → Landmarks
- **NVDA**: D (next landmark)
- **JAWS**: R (region/landmark list)

---

## Audio Transcript

For users who cannot hear the sonification, we provide a complete **Audio Transcript**:

### What's Included

1. **Explanation of the sonification**:
   - How data maps to sound
   - What each instrument represents
   - Time period covered

2. **Complete data table**:
   ```
   Year    | Temperature | Frequency | Trend
   --------|-------------|-----------|-------
   2020    | +1.02°C     | 680 Hz    | ▲
   2021    | +0.85°C     | 620 Hz    | ▼
   2022    | +0.89°C     | 635 Hz    | ▲
   2023    | +1.17°C     | 720 Hz    | ▲
   2024    | +1.54°C     | 880 Hz    | ▲
   ```

3. **Summary narrative**:
   > "This sonification covers global temperature anomalies from 2020 to 2024. The overall trend is warming, with 2024 reaching the highest anomaly of +1.54°C, represented by the highest pitch."

### Accessing the Transcript

1. Click the **"Audio Transcript"** button below the player
2. Or press `T` to toggle the transcript panel

---

## Visual Accessibility

### Color Contrast

All text meets WCAG AA requirements:

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **UI components**: 3:1 minimum contrast ratio

### Not Relying on Color Alone

Information is never conveyed by color alone:

- Icons accompany color indicators
- Text labels supplement color coding
- Patterns and shapes provide additional distinction

### Focus Indicators

All focusable elements have visible focus indicators:

```css
:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
```

### Reduced Motion

Respects the `prefers-reduced-motion` system setting:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

To enable:
- **macOS**: System Preferences → Accessibility → Display → Reduce motion
- **Windows**: Settings → Ease of Access → Display → Show animations
- **Browser**: Developer tools → Rendering → prefers-reduced-motion

---

## Audio Accessibility

### Volume Control

- Adjustable volume slider
- Keyboard shortcuts for volume (↑ ↓ M)
- Remembers your volume preference

### Playback Control

- Play, pause, stop controls
- Seekable progress bar
- Adjustable playback speed

### No Autoplay

Audio never plays automatically. You must explicitly start playback, giving you control over when sound begins.

---

## Form Accessibility

### Labeled Inputs

All form inputs have associated labels:

```html
<label for="zone-select">Select Region</label>
<select id="zone-select">...</select>
```

### Error Messages

Form errors are:
- Clearly described in text
- Associated with the relevant input
- Announced by screen readers

### Instructions

Clear instructions are provided before form inputs.

---

## Data Visualization Accessibility

### Charts and Graphs

Visual charts include:

1. **Hidden data tables** for screen readers:
   ```html
   <table class="sr-only" aria-label="Temperature data table">
     ...
   </table>
   ```

2. **Text descriptions** of trends and patterns

3. **Keyboard navigation** through data points

### Current Value Announcements

As the sonification plays, the current data value is announced via an ARIA live region:

```html
<div aria-live="polite" aria-atomic="true">
  Now playing: 2023, Temperature anomaly: +1.17°C
</div>
```

---

## Testing Accessibility

### Manual Testing

We regularly test with:

1. **Keyboard only**: Navigate entire app without mouse
2. **Screen readers**: VoiceOver, NVDA, JAWS
3. **Zoom**: Page works at 200% zoom
4. **Color contrast**: Verified with browser tools

### Automated Testing

- **axe-core** checks run during development
- **jest-axe** tests in our test suite
- **ESLint jsx-a11y** rules in linting

### How to Report Issues

Found an accessibility barrier? Please help us fix it:

1. Open an issue on [GitHub](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues)
2. Describe:
   - What you were trying to do
   - What assistive technology you use
   - What happened vs. what you expected
3. We prioritize accessibility issues

---

## WCAG 2.1 AA Compliance

### Perceivable

- [x] Text alternatives for non-text content
- [x] Captions and transcripts for audio
- [x] Content adaptable (semantic HTML)
- [x] Distinguishable (color contrast, resize)

### Operable

- [x] Keyboard accessible
- [x] Enough time (pause, stop, adjust)
- [x] No seizure-inducing content
- [x] Navigable (skip links, focus order)

### Understandable

- [x] Readable (language set)
- [x] Predictable (consistent navigation)
- [x] Input assistance (error identification)

### Robust

- [x] Compatible (valid HTML, ARIA)

---

## Settings for Accessibility

Access via the Settings menu:

### Visual Settings

- **High Contrast Mode**: Increases contrast for better visibility
- **Large Text**: Increases base font size
- **Reduce Motion**: Disables animations

### Audio Settings

- **Slower Playback**: Reduces tempo for easier comprehension
- **Volume Normalization**: Evens out loud and quiet parts

### Navigation Settings

- **Focus Mode**: Highlights current focus more prominently
- **Simplified Interface**: Hides non-essential elements

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [Keyboard Accessibility Guide](https://webaim.org/techniques/keyboard/)

---

## Contact

For accessibility questions or to report barriers:

- GitHub Issues: [webapp/issues](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues)
- Label your issue with `accessibility`
