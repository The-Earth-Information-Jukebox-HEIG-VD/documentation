# EarthChestra - Pitch Script

NASA Space Apps Challenge 2026 - project: Earth Information Jukebox (NASA Earth Information Center visualizations made audible).
App name: **EarthChestra**. Target length: **3:30** (hard limit 5:00). Speakers: one narrator, one driver at the keyboard (or one person doing both).

| Time | Section | Length |
|---|---|---|
| 0:00 | 1. Hook | 30 s |
| 0:30 | 2. Problem | 30 s |
| 1:00 | 3. Live demo | 1:50 |
| 2:50 | 4. Under the hood | 25 s |
| 3:15 | 5. Impact and what's next | 25 s |
| 3:40 | 6. Close | 15 s |

Total about 3:55 spoken at a calm pace; cut the optional lines (marked *optional*) to land on 3:30.

---

## Before you go on stage (setup)

- Backend running (`cd sonification && uvicorn backend.app:app --port 8000`), or the deployed server. The app has **no offline fallback**: no server means no sound and a "The sound server cannot be reached" error.
- Wait until `GET /api/health` no longer says `preparing_data: true` (a few minutes after a cold start). Otherwise the Sounds panel shows "The server is still preparing its data".
- Open the app once and play 10 seconds of the demo zone, so the server has already read that zone (the first request for a new zone takes about a second; the same request again is immediate).
- Browser at 100% zoom, volume tested on the venue speakers, one user click done before the demo (browsers block audio until a click).
- Keep the Sounds panel open and the Graph toggle off at the start.
- Backup: a screen recording of the full demo with sound.
- Hook clip: record 8-10 seconds of **Temperature + CO2 for a warming zone** beforehand (or just use the live app); keep it on a second tab.

---

## 1. HOOK (0:00 - 0:30)

> "Close your eyes for a moment."

[Play 8 seconds of the prepared clip: piano chords climbing, contrabass underneath.]

> "That was not a film score. That was the temperature of a continent, month after month, played by a piano. The higher the note, the warmer it was."
>
> "For blind and visually impaired people, most of the climate data we see every day is invisible."

*Fallback if audio fails:* say the hook lines, then go straight to the demo and start playing as early as possible.

---

## 2. PROBLEM (0:30 - 1:00)

> "NASA's Earth Information Center turns satellite data into striking visualizations: temperature maps, rain, wildfires, night lights. They are beautiful, but they only work if you can see them."
>
> "And even if you can see, a map shows you one moment. How do you feel forty years of change in one place?"
>
> "So we asked: what if the planet had a soundtrack, and what if everyone could press play?"

---

## 3. LIVE DEMO (1:00 - 2:50)

> "This is EarthChestra, our entry for the Earth Information Jukebox challenge. Every NASA dataset becomes an instrument in an orchestra."

### Step 1 - Pick a place (1:00, 15 s)

**Do:** Show the globe. Point out that Play is disabled and the player says "Select a zone on the globe to play". Click a zone (for example **Africa**, or **France** after switching the selector to countries).

**Say:**
> "We start with a place, not a dataset. Click any continent, country, ocean or sea. Nothing plays until you choose, so you always know what you are listening to."

*Optional:* mention the zone selector offers continents, countries and oceans and seas.

### Step 2 - Choose the sounds (1:15, 25 s)

**Do:** Point to the **"What do you want to hear?"** panel. Tick Temperature, Rain and one more (Fires or Lightning). Point at the counter ("3 tracks selected").

**Say:**
> "Eleven datasets, eleven instruments: temperature is piano chords, CO2 a contrabass, rain violins, snow a glockenspiel, lightning timpani, fires trombones, night lights a synth pad, sea ice bowed glass, vegetation a clarinet, carbon monoxide a bassoon and ocean plankton a vibraphone."
>
> "Everything except temperature and CO2 only plays when it is there. Heavy rain makes the violins repeat faster, more lightning means more timpani strokes, and the trombones swell with the fires."

### Step 3 - Play (1:40, 35 s)

**Do:** Press **Play**. The globe switches to playback: the selected zone's data appears as coloured dots, one colour per dataset, and a legend lists the datasets with their instrument. Let it play about 20 seconds.

**Say:**
> "The server averages each dataset over your zone, month by month, and every month becomes one bar of music. Higher values play higher notes, measured against the zone's own range, so the same value always gives the same note."
>
> "On the globe the dots follow the music: the stronger the value, the bigger the dot. Where a dataset has no data for a date, its instrument simply stays silent."
>
> "Listen to the tempo too: it follows the CO2 in the atmosphere, so the music speeds up as the decades go by."

*Listen cue:* let the audience hear one full 30-second piece boundary; pieces play back to back without a gap.

### Step 4 - Travel in time (2:15, 20 s)

**Do:** Drag the timeline (or press the arrow keys, Home or End) to jump. Click **"Go to a date"**, pick a year and month, press Go. Optional: press Play on one of the **Key events** cards under the globe (for example Black Summer 2019, or the 2015 super El Niño): it selects the zone and the dataset and starts just before the event.

**Say:**
> "The timeline goes back to 1920. Use it, or go straight to any month. Jump to the 1950s, then to last year: you hear the piano climb."

### Step 5 - See the data too (2:35, 10 s)

**Do:** Toggle **Graph**. A line per enabled dataset for the zone appears above the timeline, synchronised with the playhead.

**Say:**
> "For sighted users and for teaching, the Graph shows the same numbers the music is made from. Each line has its own scale."

### Step 6 - Accessibility (2:45, 5 s inside the demo, expanded in section 5)

**Do:** Press **Space** to pause, **M** to mute, **Escape** to return to zone selection. If time allows, switch to List View.

**Say:**
> "Everything works from the keyboard. Space plays, arrows move through time, M mutes, Escape goes back to the zone choice."

*Fallback if the app fails mid-demo:* switch to the backup recording and say "Here is the same flow recorded this morning."

---

## 4. UNDER THE HOOD (2:50 - 3:15)

> "The app is React and TypeScript. The music is composed on the server: a Python service averages the NASA data over your zone, writes an orchestral score, and renders it to 30-second MP3 pieces, about eight to thirteen months each as the tempo rises with the CO2, that the browser plays back to back through the Web Audio API."
>
> "Our data: NASA GISTEMP temperature anomalies since 1880, GPM IMERG rain and snow, MODIS fires, vegetation and ocean chlorophyll, MOPITT carbon monoxide, ISS LIS lightning, NASA SVS Earth at Night lights, the NSIDC sea ice index since 1979, and CO2. Everything runs with Docker Compose."

---

## 5. IMPACT AND WHAT'S NEXT (3:15 - 3:40)

> "Accessibility is built in, not added on. Every control works from the keyboard. Changes are announced to screen readers, for example 'Now playing 2015: plus 1.4 degrees versus normal'. The graph and the globe values also exist as data tables. The List View is a screen-reader-friendly alternative to the globe, and the app respects reduced motion. We aim for WCAG 2.1 AA, and the interface is available in English, French and German."
>
> "It is also a teaching tool: students can hear a warming trend in a minute."

*Optional:*
> "There is also a vinyl mode: the globe becomes a record, and the needle travels across places, through time, or both. And if the orchestra is not your style, the same data plays as rain, fire and thunder, or as swing, funk or house."

*Optional:*
> "And more Earth Information Center datasets: the architecture is one instrument per dataset."

---

## 6. CLOSE (3:40 - 3:55)

> "The Earth has a story to tell. Now everyone can hear it. Thank you. We are happy to take questions."

[Leave the app on the globe, with the URL visible.]

---

## JUDGE Q&A

Answers use only what the app does today. If you are unsure of a number, say so and point to the About page ("Data sources", "Under the hood").

### What NASA data do you use, and for what period?
> "Eleven datasets, mostly NASA: GISTEMP temperature anomaly, monthly, 1880 to 2025 (the app's timeline starts in 1920), against the 1951-1980 baseline. GPM IMERG for rain and snow, June 2000 onwards. MODIS fires, July 2002 onwards (days of the month with a fire). ISS LIS lightning, March 2017 to July 2023. NASA SVS Earth at Night lights, one map per year, 2012 to 2023. CO2 monthly, September 2002 to March 2022, extracted by our team, completed with the world CO2 record (Law Dome ice cores, Mauna Loa) from 1875 to last month. NSIDC Sea Ice Index, 1979 onwards. MODIS Terra vegetation index from 2000 and MODIS Aqua ocean chlorophyll from 2002. MOPITT carbon monoxide on NASA Terra, 2000 to 2024. Zone outlines are from Natural Earth."

### Where does the audio come from? Do you synthesize it in the browser?
> "No. The backend composes it: it averages each dataset over the selected points, writes a MIDI score and renders it to a 30-second MP3, base64 encoded. The browser decodes and schedules the pieces with the Web Audio API. The frontend only plays; it never makes up a note."

### How do you map data to sound?
> "Value to pitch within a register per instrument, scaled on the whole series of that zone, so the same value is always the same note. One bar per month. For intermittent phenomena (everything except temperature and CO2) the amount also controls how present the instrument is: louder, denser rhythm, or swelling. The tempo follows the global CO2 of each month, so the music speeds up over the decades. Missing data means silence, never an invented value."

### Is the mapping scientifically honest? Is a note comparable across zones?
> "Within one zone, yes: the scale comes from that zone's own range. Between two zones the same note does not mean the same value; the app is a way to explore trends and patterns, not a measuring instrument. The exact values are always available in the data tables and the announcements."

### How accurate is it compared to a visualization?
> "We have not run a user study. The literature on sonification reports that listeners can follow trends by ear; our claim is narrower: it gives non-visual access that did not exist for these dashboards. The graph and tables give the exact numbers."

### Is it really accessible to blind users?
> "It is designed for it, but it has not yet been evaluated by blind users, and we say so. What exists: keyboard shortcuts, live announcements of the zone and the current value, a List View alternative to the globe, data tables for the globe and the graph, visible focus, reduced-motion support, high-contrast and colour-blind-safe options."

### Why did you choose an orchestra?
> "One instrument per dataset lets you hear several variables at once and tell them apart, and music is engaging, which encourages exploration. Temperature is the piano because it is the harmonic foundation, CO2 the contrabass because it is the quiet, low presence under everything."

### What happens without the server, or offline?
> "No sound. The music is composed server-side, and the UI shows a clear 'sound server cannot be reached' message with a retry. For the demo we ran it on a prepared machine." (Be honest: this is a trade-off for richer music and a single source of truth.)

### How does it scale? What is the deployment?
> "Docker Compose: nginx serving the React app, the FastAPI music service, and a container that installs the datasets. A zone is sent as a compressed bitmap, 2 to 4 kB even for an ocean. The first request for a new zone takes about a second; following pieces and repeated requests are served from memory."

### Why the 0.25 degree grid and averaged maps? Isn't that coarse?
> "All datasets are put on one 0.25 degree grid so a place has the same position in every dataset; the server then averages on 1 degree maps (2 degrees for temperature). Fine for continents, countries and seas; it is not meant for city-scale analysis."

### What are the limits today?
> "Datasets end at different dates (lightning 2023, carbon monoxide 2024; the CO2 maps end in 2022 and the world CO2 record fills in after), so some instruments fall silent; two engine voices, dust and smoke, exist but no data is served for them yet; and it needs the server."

### How did your team work?
> "Six R&D collaborators at HEIG-VD in Switzerland: Magali Egger, Yasaman Izadmehr and Simon Walther on data processing, Teo Ferrari and Leo Zmoos on sonification (Teo also drew the data spots on the globe), and Clarisse Estelle Fleurimont on frontend, DevOps and deployment, backend API work and the documentation. We worked together on GitHub and used Claude agents to assist on specialised tasks."

### Open source and reuse?
> "The project is on GitHub (The-Earth-Information-Jukebox-HEIG-VD). Adding a dataset means adding its data and an instrument entry in the orchestra table; the app discovers tracks from the server."

---

## Final checklist

- [ ] Server up and warmed, health check clean
- [ ] Audio tested on venue speakers, one click done before starting
- [ ] Backup recording ready, hook clip ready
- [ ] Demo zone and three tracks chosen in advance (suggested: Temperature, Rain, Fires)
- [ ] Rehearsed five times, timed to 3:30
- [ ] Vinyl mode and music styles: shown only if time allows (optional line in section 5)
- [ ] Questions outside the script: answer from the About page content
