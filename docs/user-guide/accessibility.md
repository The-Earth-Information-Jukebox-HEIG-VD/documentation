# Accessibility

**EarthChestra**, the Earth Information Jukebox project's app, is designed to be accessible to all users, including those with visual impairments, motor disabilities, and other accessibility needs.

---

## Our Commitment

This project exists to make climate data accessible to the **285 million visually impaired people** worldwide. Accessibility is not an afterthought - it's our core mission.

We target **WCAG 2.1 AA** and check the interface with automated tools (axe-core, jest-axe, ESLint `jsx-a11y`) and manual keyboard and screen-reader testing.

!!! note
    Some items below are still in progress. Features that are not yet available in the interface are marked as such.

---

## Keyboard Navigation

### Full Keyboard Access

The player, the "What do you want to hear?" panel, the date picker, the data graph toggle, zone selection (list view) and the language menu can all be used with the keyboard.

| Key | Action |
|-----|--------|
| `Tab` | Move to next interactive element |
| `Shift + Tab` | Move to previous element |
| `Enter` / `Space` | Activate the focused button or link |
| `Arrow keys` | Move within sliders and menus |
| `Escape` | Close the language menu and the **Go to a date** popover; leave the globe's playback view and return to zone selection (the track panel is not a dialog and does not close with `Escape`) |

A **Skip to content** link is the first focusable element on the page.

### Playback Shortcuts

These shortcuts work anywhere on the page, except while focus is in a text field, a select, a slider or a dialog (such as the date picker), while a modal is open, or when a modifier key (`Ctrl`, `Cmd`, `Alt`) is held.

| Key | Action |
|-----|--------|
| `Space` | Play / Pause (when a button is focused, `Space` activates that button instead) |
| `←` Arrow | Seek backward 2% |
| `→` Arrow | Seek forward 2% |
| `Home` | Jump to beginning |
| `End` | Jump to end |
| `M` | Mute / Unmute |

The timeline slider (focused) supports `←` / `→` (2% step), `Shift` + `←` / `→` (one month), `Page Down` / `Page Up` (one year back / forward), `Home` and `End`. The volume slider is a native range input: use `←` / `→` (or `↑` / `↓`) for 5% steps once it is focused. There are also skip back / forward buttons ("Skip back 10%", "Skip forward 10%"), each moving 10% of the timeline.

### Play button when no zone is selected

Until a zone is selected (and at least one track is enabled), the Play button is `aria-disabled` rather than removed from the tab order. A hint explains why (for example "select a zone first") and is linked to the button with `aria-describedby`. Activating Play while blocked announces the same hint through a live region. Pause is never disabled.

### Help

There is no keyboard shortcuts dialog yet: `?` does nothing. The shortcuts are listed on this page.

---

## Screen Reader Support

### Tested With

- **VoiceOver** (macOS)
- **NVDA** (Windows)

Other screen readers should work but are not regularly tested.

### What Screen Readers Announce

- Skip link and page structure (landmarks)
- All interactive elements with an accessible name; icon-only buttons have `aria-label`, icons are `aria-hidden`
- Play / pause state: the button label switches between "Play" and "Pause"
- Timeline and volume as sliders with `aria-valuenow` and a spoken `aria-valuetext` (year, volume percent)
- The date button ("Go to a date, currently Mar 1998") and, after **Go**, where playback jumped ("Jumped to March 1998")
- The number of selected sounds on the **Sounds** button ("Sounds: 2 selected") and its expanded / collapsed state
- Selected zone ("zone selected")
- Loading, error and end-of-data messages
- Data values while playing, for example "now playing: ... year" (see [Current Value Announcements](#current-value-announcements))

Announcements are translated (English, French, German) and the values are phrased to be read aloud, not just displayed.

### Landmarks

The page uses semantic landmarks:

```
<header> - Page header (banner)
<nav>    - Main navigation
<main>   - Primary content area (id="main-content", target of the skip link)
<footer> - Page footer
```

Navigate by landmark using your screen reader:

- **VoiceOver**: VO + U → Landmarks
- **NVDA**: D (next landmark)
- **JAWS**: R (region/landmark list)

---

## Audio Transcript

There is no separate audio transcript yet (no "Audio Transcript" button, no `T` shortcut). The text alternatives are the live announcements of the current value, the hidden data tables of the globe and the graph, and the About page, which explains how data maps to sound.

---

## Visual Accessibility

### Color Contrast

The design targets WCAG AA ratios:

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **UI components**: 3:1 minimum contrast ratio

A **high contrast** theme (black background, white text, 2px borders) and a **color-blind safe** palette with ▲ / ▼ warm / cool markers exist as CSS modes, but there is no settings menu to switch them on yet (see [Accessibility Settings](#settings-for-accessibility)). Contrast has not been formally audited for every screen.

### Not Relying on Color Alone

- The globe legend, the track panel and the data graph use text labels next to colors; graph lines also differ by dash pattern
- Track availability and "only when present" are shown as text
- Warm / cool markers (▲ / ▼) are available in color-blind mode

### Focus Indicators

All focusable elements get a visible focus ring:

```css
:focus-visible {
  outline: 3px solid var(--color-primary); /* #f5d078, the logo's label yellow */
  outline-offset: 2px;
}
```

In high contrast mode the ring is a 4px yellow outline. On touch devices (`pointer: coarse`) buttons and inputs have a 44x44px minimum target size.

### Reduced Motion

Animations are switched off when the system setting `prefers-reduced-motion: reduce` is on (the app also reads it on load and follows changes), and the globe respects it too:

```css
.reduced-motion,
.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

To enable:
- **macOS**: System Settings → Accessibility → Display → Reduce motion
- **Windows**: Settings → Accessibility → Visual effects → Animation effects
- **Browser**: Developer tools → Rendering → prefers-reduced-motion

---

## Audio Accessibility

### Volume Control

- Volume slider with a spoken value ("volume ... percent") and a mute button
- `M` toggles mute from anywhere
- The volume is not saved between visits

### Playback Control

- Play / pause button, skip backward / forward buttons
- Seekable timeline slider (keyboard and mouse), also `Home` / `End`
- There is no stop button, playback speed control or per-track volume. The server returns a single mixed file, so only the master volume can be changed

### How Audio Is Delivered

The sonification is composed by the backend and played as 30-second MP3 chunks. A short loading message ("loading ...") is shown while a chunk is requested; it is spoken only the first time, or when loading takes more than one second. If the backend is unreachable, an error message (`role="alert"`) appears with a **Retry** button. After activating Retry, keyboard focus moves to the Play button so it is not lost.

### No Autoplay

Audio never plays automatically. You must explicitly start playback, giving you control over when sound begins.

---

## Controls and Forms

### Labeled Controls

Controls have accessible names (visible label or `aria-label`), including the volume slider, the timeline, the track toggle buttons (`aria-pressed`, named by dataset and instrument, with the period as description), the **Graph** toggle (`aria-pressed`) and the zone type toggle buttons (`aria-pressed`).

### Dialogs and Panels

The **"What do you want to hear?"** panel is an inline section of the page, not a modal. Its heading is a disclosure button (`aria-expanded`, `aria-controls`) that hides the list and leaves a visible "N tracks selected" summary; the player's **Sounds** button carries the same `aria-expanded` state, and when it opens the panel it moves focus to the first track. Its live region (loading, "server preparing", "no track selected") stays mounted while the panel is collapsed. `Escape` does not close it.

**Go to a date** is a non-modal popover (`role="dialog"` labelled by its "Go to a date" heading) opened from the date button (`aria-haspopup="dialog"`, `aria-expanded`). Focus moves to the Year select when it opens; it holds native Year and Month selects (months after the last data month are disabled) and **Close** / **Go** buttons. `Escape` or **Close** returns focus to the date button; tabbing out or clicking outside closes it. Playback shortcuts are ignored inside it.

The shortcuts help dialog, once mounted, traps focus. While a modal is open, playback shortcuts are disabled.

### Error Messages

Errors (backend unavailable, track list failed, dataset loading failed) are shown as text and announced (`role="alert"`). Unavailable tracks are disabled with the reason displayed.

---

## Data Visualization Accessibility

### Globe and List View

The globe canvas has a text description (`role="img"` with a label), and the overlay controls stay reachable. Zones can also be chosen from a **list view**, which is fully keyboard operable; use the view toggle to switch.

During playback the globe also has a visually hidden table (caption with the zone and month) of the values it draws.

### Vinyl Mode (in development)

In **Vinyl** mode the player bar has the same Play / Pause and Sounds buttons; the shortcuts above apply, but `←` / `→` move to the previous / next groove and `Home` / `End` to the first / last. The groove slider is a native range input with a label ("Groove k of n") and a spoken value (groove, elapsed and total time, plus the date when the date moves). The record image is `role="img"` with a label (centre and month), and a visually hidden table with a caption lists the values of the playing chunk. `Escape` has no function in this mode.

#### Music style

The **Music style** control (above the sounds list, in both modes) is a native labelled `<select>`. The description of the chosen style is its hint, read after the name (`aria-describedby`). Choosing a style is announced once, politely ("Music style: Funk"); a style restored from your last visit or a reloaded list is not announced. The global player keys (Space, arrows, Home/End, M) are ignored while the select has focus, so the arrows and letters pick a style. The styles are in two labelled groups, **Recommended** (Orchestra and Realistic sounds) and **Just for fun** (the others), which screen readers announce as group names. The (i) button next to the label (hover, focus or click; Escape closes it) says why, and the same text is part of the select's description: the recommended styles are the ones the team worked on most and carry the climate message most clearly; with a fun style selected it adds that the changes in the data are easier to hear with the recommended ones. In zone mode, changing the style keeps your place: the music goes on from the current month in the new style. In vinyl mode it restarts the record from the edge.

#### What the needle travels through

The fieldset **"The needle travels through"** has three radio buttons, each with a short name (Space, Time, Both) and its explanation as a description:

- **Space**: one date, the needle crosses places.
- **Time**: one place, the months go by. The needle stays on the centre.
- **Both**: the needle crosses places and the date moves on each groove. A **"The date moves on by"** select (one month or one year per groove) appears only in this case; otherwise it is removed from the page, so it is neither focusable nor read by screen readers.

Arrow keys on the radios change the radio, not the groove (global shortcuts ignore form fields). Changing the choice restarts the record from the edge, as the group's description says. When the date moves, the first fieldset is called "Starting month".

The real date is available as text in several places: the player bar ("Date: April 2020"), the caption on the globe, the slider's spoken value, a **Date** column in the hidden table (a range such as "March 2020 to November 2020" when a groove covers several months), and the announcement of each groove ("Groove 3 of 12, May 2020, near the Sahara: ..."). The announcement is made once per groove (about every 30 seconds), never on each month, and the visible date is not a live region, so it does not interrupt you.

In Time mode the globe shows no moving trail, only one spot on the centre, whose colour and size follow the first selected dataset that has a value. Its text alternative is the record's label ("the needle stays on the centre ... a spot at the centre shows the data") and the hidden table, which has every value. The spot does not move or animate, so it is the same with reduced motion; the spot is never the only carrier of information.

### Data Graph

The **Graph** toggle in the player shows a chart of the selected zone's data (`SeriesChart`). Its text alternatives:

- the SVG is `role="img"` with a **text summary** as its label: the zone, the period, the datasets, the note that each line has its own scale, and for each line its lowest and highest value with their dates;
- a visually hidden **table** "Yearly average of each dataset in the selected area", one row per year and one column per dataset ("No data" where a dataset has none);
- a visible legend with each line's name and value at the playback (or hover) date; lines differ by colour **and** dash pattern;
- loading, empty and error states as text (errors with `role="alert"` and a **Retry** button).

### Current Value Announcements

While playing, the current value is announced through a persistent `aria-live="polite"` region (it stays in the page so that updates are reliably spoken):

```html
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  Now playing: <value with units>, <year>
</div>
```

When several tracks are enabled, the value is prefixed by the main track's name. Anomalies are phrased in words ("above" / "below" the baseline) rather than symbols so they read well aloud.

---

## Testing Accessibility

### Manual Testing

We regularly test with:

1. **Keyboard only**: Navigate entire app without mouse
2. **Screen readers**: VoiceOver, NVDA
3. **Zoom** and **color contrast**: checked with browser tools

### Automated Testing

- **axe-core** (`@axe-core/react`) logs violations to the browser console in development
- **jest-axe** checks in the component tests (for example the player)
- **ESLint** with the `jsx-a11y` recommended rules (`npm run lint`)

```bash
cd webapp
npm run lint        # includes jsx-a11y
npm run test        # all tests
npm run test:a11y   # tests whose name contains "accessibility"
```

### How to Report Issues

Found an accessibility barrier? Please help us fix it:

1. Open an issue on [GitHub](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp/issues)
2. Describe:
   - What you were trying to do
   - What assistive technology you use
   - What happened vs. what you expected
3. We prioritize accessibility issues

---

## WCAG 2.1 AA Status

Work in progress, not a certified conformance claim.

### Perceivable

- [x] Text alternatives for icons, the globe canvas and the data graph (summary + table)
- [ ] Transcript for the audio (component written, not yet mounted)
- [x] Content adaptable (semantic HTML, landmarks)
- [ ] Distinguishable (AA contrast targeted, not fully audited)

### Operable

- [x] Keyboard accessible
- [x] Pause available at all times; no autoplay
- [x] Visible focus; skip link
- [x] Reduced motion respected

### Understandable

- [x] Interface available in English, French and German
- [x] Error messages in text, announced to screen readers
- [x] Page language: `index.html` starts as `en`, and the `lang` attribute follows the selected language (English, French, German)

### Robust

- [x] Native elements and ARIA checked by axe and `jsx-a11y`

---

## Settings for Accessibility

The app stores accessibility preferences in the browser (`localStorage`) and applies them as CSS classes on the page: **high contrast**, **dyslexia-friendly font**, **color-blind mode** and **reduced motion** (initialised from the system setting).

!!! note
    These options exist in the code and translations, but there is currently **no settings menu** in the interface to change them. Use your operating system's reduced motion setting. Slower playback, volume normalization, focus mode and simplified interface are not implemented.

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
