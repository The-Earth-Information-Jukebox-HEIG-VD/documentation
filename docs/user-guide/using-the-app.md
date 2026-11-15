# Using the App

A guide for end users of **EarthChestra**, the Earth Information Jukebox project's app.

---

## Getting Started

### Open the Application

Open the deployed instance, or run it locally (see the [Quick Start](../getting-started/quickstart.md)). The app needs its sound server (backend) to be running: without it nothing can play and the player shows "The sound server cannot be reached".

!!! note "Demo URL"
    The previously documented address (`earth-jukebox.vercel.app`) could not be confirmed from the code or deployment files. Use the address given by the team or the Docker deployment.

### Enable Audio

!!! warning "Browser Audio Policy"
    Modern browsers require a user interaction (click/tap/key press) before audio can play.
    Audio starts when you press the Play button (or Space), which satisfies this rule.

### Language

Use the language selector in the header to switch between English, French and German. The initial language follows your browser.

---

## Main Interface

```
┌──────────────────────────────────────────────────────────────┐
│  EarthChestra                     Home  About     [Language]  │
├──────────────────────────────────────────────────────────────┤
│  [Time travel | Vinyl]  [Globe | List]  [Continents | ...]   │
│  ┌────────────────┐ ┌──────────────────────────────────────┐ │
│  │ What do you    │ │                                      │ │
│  │ want to hear?  │ │   3D globe  (or the List view)       │ │
│  │ [x] Temperature│ │   Click a zone to select it          │ │
│  │ [ ] Rain  ...  │ │                                      │ │
│  └────────────────┘ └──────────────────────────────────────┘ │
│  Key Climate Moments:  [1880] [1934] ...  (jump to a moment)  │
├──────────────────────────────────────────────────────────────┤
│  (data graph, when Graph is on)                               │
│  [⏮] [▶] [⏭] [Mar 1998] 1880 ───●───── 2025 🔊━━ [Graph] [Sounds 1]│
└──────────────────────────────────────────────────────────────┘
```

The player bar stays at the bottom of every page (including About), so audio can always be paused.

!!! note "Time travel and Vinyl"
    The **Time travel / Vinyl** switch at the top chooses the experience. This guide describes **Time travel** (one zone, the music travels through the years), the finished mode. **Vinyl** (one month played across the globe like a record) is still in development: see [Frontend: vinyl experience mode](../development/frontend.md#in-development-vinyl-experience-mode).

---

## Selecting Data

### Choose a Zone

1. Choose the **view**: **Globe View** (3D globe) or **List View** (an accessible list/table of zones, recommended with screen readers). If your browser has no WebGL, the List view is used.
2. Choose the **kind of zone**: **Continents**, **Countries** or **Oceans & seas**.
3. **Select a zone**: click it on the globe, or activate it in the list (Tab to it, then Enter or Space). The selection is announced to screen readers.

Play stays disabled until a zone is selected ("Select a zone on the globe to play"). There is no free-form area drawing: you pick predefined zones.

### Choose the Sounds (datasets)

The **What do you want to hear?** panel sits next to the globe. Its heading is a Show/Hide button that collapses the list to a short summary ("N tracks selected"); the **Sounds** button at the right of the player (with a badge showing how many tracks are on) shows or hides the same panel, and moves the focus to the first track when it opens it. The panel is part of the page, not a dialog, and the app remembers whether it was open. Switch several tracks on to hear different measurements together, each with its own instrument; while playing, a small animated bar marks the tracks that are sounding.

For each track the panel shows:

- the dataset name and the **instrument** that plays it
- the **period** covered ("From 1880 to 2025")
- "only when present" for instruments that are silent when their phenomenon is absent (rain, snow, lightning, fires, night lights)
- tracks the server has no data for are greyed out and marked "Not available on the server"

The track list comes from the server, so it can change as new data is added. Temperature is on by default. At least one track must be on to play; with none, the player shows a **Choose sounds** link that opens the panel.

### Choose the Music Style

The **Music style** menu above the sounds list chooses how the data is played. **Orchestra** (the default) and **Realistic sounds** (the sound of each phenomenon: rain, fire, thunder, a heartbeat for the temperature) are grouped as **Recommended** (hover the (i) next to the label to read why): they are the styles we worked on most, and they carry the climate message most clearly. The other styles (ragtime, swing, rock'n'roll, funk, synth-pop, house, trap) are under **Just for fun**: the same data, in another genre, to play with.

### Choose the Time

There is no duration field. The timeline always spans the period covered by the enabled tracks (for temperature, 1880 to 2025):

- click or drag the **timeline** to jump to a year
- press the **date** shown left of the timeline (for example "Mar 1998") to open **Go to a date**: choose a year and a month, then **Go** (months after the last data month are disabled; **Close** or Escape closes it without moving)
- use the **Key Climate Moments** cards to jump to a historical event
- playback starts from the beginning (or from where you seeked) and plays through the years, 30 seconds of music at a time

---

## Playback Controls

### Basic Controls

| Control | Action |
|---------|--------|
| ▶ / ⏸ Play / Pause | Start or pause playback (Play needs a zone and at least one track) |
| ⏮ / ⏭ Skip | Jump backward / forward by 10% of the timeline |
| Date | Opens **Go to a date** (year + month) |
| Timeline | Click or drag to seek; with the keyboard, focus it and use the keys below |
| 🔊 Volume | Volume slider and mute button |
| Graph | Show / hide the data graph above the player |
| Sounds | Show / hide the "What do you want to hear?" panel |

There is no Stop button: pause, then seek to the start (Home) to begin again. There is also no per-track volume, because the server mixes all tracks into a single audio stream.

When you press Play, the globe zooms to your zone and draws the **real dataset values** behind the sound as coloured spots (bigger where the value is higher; below-normal temperature is a ring), growing and shrinking month by month in step with the music. A legend lists the datasets with their value ranges, and a table with the same values is available to screen readers. Use **Change zone** (or Escape) to go back to zone selection; this pauses playback.

### One Month Through the Years

The **Months** selector in the player chooses what the timeline plays: **Every month** (the default), or one month only, for example **Only July**, to follow July from 1880 to 2025 with the tracks you enabled. The timeline, the date, the globe and the data graph then show that month of each year (one point per year on the graph, and a table of that month's values for screen readers); `Shift` + `←` / `→` on the timeline moves one year. The app remembers the choice.

Each bar of music is then one year: the instruments are scaled on that month over all the years, so a warmer July is a higher note than a colder July.

### The Data Graph

Press **Graph** in the player to show a chart of the data you are hearing, above the timeline and on the same time axis. It draws one line per enabled track for the selected zone, in the track's colour and with its own dash pattern; each line uses its own scale, and anomalies (temperature) mark "0 = normal". Night lights, a yearly value, are drawn as steps. The legend gives each line's value at the playback position, or at the date you hover on the chart or the timeline; clicking the chart seeks there. Screen readers get a text summary (the lowest and highest value of each line, with their dates) and a table of yearly averages. The graph needs a zone and at least one track; the app remembers whether it was on.

If audio takes a moment to load you see "Loading audio for 1950…". If the server fails, an error appears with a **Retry** button. When the data ends you see "End of the data reached."

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause (when no button is focused) |
| `←` Arrow | Seek backward (2% of the timeline) |
| `→` Arrow | Seek forward (2% of the timeline) |
| `Home` | Jump to beginning |
| `End` | Jump to end |
| `M` | Mute / Unmute |
| `Esc` | Leave the playback view of the globe (back to zone selection), or close **Go to a date** |

When the **timeline** is focused it also accepts `Shift` + `←` / `→` (one month back / forward; one year with a single month chosen in **Months**) and `Page Down` / `Page Up` (one year back / forward). When the volume slider is focused, the arrow keys change the volume. Shortcuts are ignored while you type in a field or while a dialog is open.

!!! note
    A `?` keyboard-help dialog exists in the code but is not currently displayed, so `?` has no effect.

---

## Understanding the Sound

### What You Hear

The music represents climate data for the zone you selected:

- **Higher pitch** = higher value (for temperature: warmer than the 1951-1980 average)
- **Lower pitch** = lower value (cooler)
- **Different instruments** = different climate variables
- Some instruments only sound while their phenomenon is present (for example rain or lightning)

The exact mapping is computed by the server; see the [sonification documentation](../development/sonification.md).

### The Orchestra

The instrument for each track is shown in the track panel. The server currently provides:

| Instrument | Represents |
|------------|------------|
| Piano (chords) | Temperature, the harmonic foundation |
| Contrabass | CO2, the deep bass line |
| Violins (melody) | Precipitation |
| Glockenspiel (melody) | Snowfall |
| Timpani | Lightning (thunder: more flashes, more hits) |
| Trombones | Fires, swelling and holding below the piano |
| Synth pad | Night lights (one value per year, fading through the year) |

Which of these are available depends on the data loaded on the server, and each has its own period (for example CO2 2002 to 2022, fires 2002 to 2026, lightning 2017 to 2023).

---

## What the Screen Shows While Playing

- **Year**: the current year is shown next to the timeline; the timeline's year labels run from the first to the last year of the enabled tracks.
- **Reading**: the value of the current 30-second chunk (for example "+1.2 °C vs normal") is announced to screen readers as "Now playing 1998: ...". With several tracks on, the first enabled track's value is announced.
- **Globe legend**: per dataset, a colour, the name and the range of values in your zone for the current month ("no data for this date" when the dataset does not cover it).

---

## Audio Transcript, Download and Settings

The following features of earlier versions are **not available** in the current app: audio transcript panel, audio download (MP3/WAV/MIDI), settings dialog (tempo, key, scale, style, audio engine), info panel and `?` help.

For a text alternative to the globe, use the **List View**; during playback, the globe's data table and the announced readings give the values in text form. The app respects your system's **reduced motion** preference.

!!! note "Accessibility options"
    The code contains options for a dyslexia-friendly font, a colour-blind-safe palette and high contrast, but no screen currently exposes them.

---

## Tips for Best Experience

### Audio Quality

- Use headphones for best audio quality
- Ensure volume is at a comfortable level
- Try different zones and time periods

### Exploration

- Compare different zones to hear geographic differences
- Turn several tracks on to hear how variables interact
- Use the Key Climate Moments to jump to notable years

### Accessibility

- Use keyboard shortcuts for efficient navigation
- Use the List View with a screen reader
- See the [Accessibility guide](accessibility.md)

---

## Troubleshooting

### No Sound

1. Select a zone first: Play is disabled until you do
2. Make sure at least one track is on in the track panel
3. Check system volume and the volume/mute control
4. If you see "The sound server cannot be reached", the backend is not running or not reachable: start it or try again later
5. "The server is still preparing its data": wait a moment and press **Retry**
6. Try a different browser (Chrome/Firefox recommended)

### "There is no data for this area and period"

Try another zone or seek to a different year; some datasets cover only a few years (see the period in the track panel).

### Slow Loading

1. The first request for a zone and period can take a few seconds because the server composes the music; the following chunk is prefetched while you listen
2. Check your internet connection

### Playback Issues

1. Pause and resume
2. Press **Retry** if an error is shown
3. Refresh the page if needed

---

## Next Steps

- [Accessibility Features](accessibility.md) - Detailed accessibility guide
- [API Reference](../api/reference.md) - For developers
