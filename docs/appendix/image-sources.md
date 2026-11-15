# Image sources

Every image shown in the EarthChestra webapp, how the app uses it, and where it comes from.

---

## Key event photos

**How they are used:** each card in the **Key events** section starts with a photo of the event. The photo has alt text in English, French and German. At the bottom of the card, a credit line names the source, written as *Photo: Author · licence*. The line links to the image page on Wikimedia Commons and opens in a new tab.

**Where they come from:** all photos are free images from [Wikimedia Commons](https://commons.wikimedia.org/). The originals are kept in `webapp/res/img/Selected_Ones/`, and the licence of each one was checked on its Commons page (see `CREDITS_selected.md` in the same folder). The app ships resized copies (1200 px wide) in `webapp/src/assets/events/`. The Yakutia wildfires and Hunga Tonga files are animated GIFs, and the app shows one still frame of each. This keeps the page light and avoids looping animation, which WCAG 2.2.2 (Pause, Stop, Hide) asks for.

| Event | What the image shows | Source · licence | File in the app |
|---|---|---|---|
| Russian heatwave and drought (2010) | Moscow's Cathedral of Christ the Saviour in smog | [Alexander Annenkov · CC BY 2.0](https://commons.wikimedia.org/?curid=133623470) | `russian-heatwave-2010.jpg` |
| US drought (2012) | Aerial view of drought-hit farmland in Colorado | [Lance Cheung / USDA · public domain](https://commons.wikimedia.org/?curid=133641515) | `us-drought-2012.jpg` |
| Arctic sea ice record low (2012) | A polar bear on thin sea ice | [Mario Hoppmann / NASA Goddard · CC BY 2.0](https://commons.wikimedia.org/?curid=51567523) | `arctic-sea-ice-2012.jpg` |
| Indonesia peat fires (2015) | Satellite view of smoke over southern Borneo | [NASA (MODIS) · public domain](https://commons.wikimedia.org/?curid=145365930) | `indonesia-peat-fires-2015.jpg` |
| Godzilla El Niño (2015–16) | Bleached coral on a reef | [Vardhan Patankar · CC BY-SA 4.0](https://commons.wikimedia.org/?curid=62822698) | `el-nino-2015.jpg` |
| Hurricane Harvey, Texas (2017) | Aerial view of flooded land | [U.S. CBP · public domain](https://commons.wikimedia.org/?curid=66504466) | `hurricane-harvey-2017.jpg` |
| Beast from the East, UK (2018) | Regent's Park, London, in the snowstorm | [Irid Escent · CC BY-SA 2.0](https://commons.wikimedia.org/?curid=74041521) | `beast-from-the-east-2018.jpg` |
| Black Summer, SE Australia (2019–20) | A koala road sign in a burnt forest near Mallacoota | [Cazz · public domain](https://commons.wikimedia.org/?curid=94183729) | `black-summer-2019.jpg` |
| California wildfires (2020) | The Bay Bridge and San Francisco under an orange sky | [Christopher Michel · CC BY 2.0](https://commons.wikimedia.org/?curid=93996320) | `california-wildfires-2020.jpg` |
| Storm Filomena, Madrid (2021) | The Cibeles fountain under snow | [Benjamín Núñez González · CC BY-SA 4.0](https://commons.wikimedia.org/?curid=98690648) | `storm-filomena-2021.jpg` |
| Winter storm Uri, Texas (2021) | Satellite view of snow-covered Texas | [NOAA (GOES-16) · public domain](https://commons.wikimedia.org/?curid=99906253) | `winter-storm-uri-2021.jpg` |
| Yakutia wildfires, Siberia (2021) | Satellite view of smoke over Siberia (still frame of an animation) | [NOAA · public domain](https://commons.wikimedia.org/?curid=149079773) | `yakutia-wildfires-2021.jpg` |
| Hunga Tonga eruption (2022) | Satellite view of the eruption's ash cloud (still frame of an animation) | [CSU/CIRA & JMA · public domain](https://commons.wikimedia.org/?curid=164581269) | `hunga-tonga-2022.jpg` |
| Pakistan floods (2022) | A village in floodwater | [Julien Harneis · CC BY-SA 2.0](https://commons.wikimedia.org/?curid=134976704) | `pakistan-floods-2022.jpg` |
| Europe drought (2022) | The dried-up Leysse river in Chambéry, France | [Florian Pépellin · CC BY-SA 4.0](https://commons.wikimedia.org/?curid=121223773) | `europe-drought-2022.jpg` |
| Antarctic sea ice record low (2023) | An emperor penguin and its chick on sea ice | [Brocken Inaglory · CC BY-SA 4.0](https://commons.wikimedia.org/?curid=3490530) | `antarctic-sea-ice-2023.jpg` |
| Quebec wildfires, eastern Canada (2023) | Sentinel satellite view of fires in Quebec | [P. Markuse / Copernicus · CC BY 2.0](https://commons.wikimedia.org/?curid=133607904) | `quebec-wildfires-2023.jpg` |
| NWT and Alberta wildfires, western Canada (2023) | Sentinel satellite view of a fire in the Northwest Territories | [P. Markuse / Copernicus · CC BY 2.0](https://commons.wikimedia.org/?curid=132479970) | `nwt-alberta-wildfires-2023.jpg` |
| Storm Daniel, Libya (2023) | Satellite view of the storm over the Mediterranean | [NASA (VIIRS) · public domain](https://commons.wikimedia.org/?curid=137274236) | `storm-daniel-2023.jpg` |
| UAE and Oman floods (2024) | Dubai after the heavy rain | [Zizup · CC0](https://commons.wikimedia.org/?curid=148969642) | `uae-oman-floods-2024.jpg` |
| Amazon fires (2024) | Satellite view of smoke over South America | [NASA (MODIS) · public domain](https://commons.wikimedia.org/?curid=151936981) | `amazon-fires-2024.jpg` |
| Arctic winter ice record low (2025) | Aerial view of the sea-ice edge (NASA ARCSIX campaign) | [Gary Banziger / NASA Langley · public domain](https://commons.wikimedia.org/?curid=179332082) | `arctic-winter-ice-2025.jpg` |

!!! note "Credit is shown for every photo"
    Only the CC BY and CC BY-SA licences require a credit. We show one on every card anyway, including public-domain and CC0 images, so all cards look the same and every image can be traced to its source.

---

## Logo and app icons

**Source:** the EarthChestra logo (a vinyl record with the Earth as its label) was made by the team. Every file below is derived from it. The tonearm on the animated logo is drawn in SVG by the code (`SpinningLogo.tsx`), not taken from an image.

| File(s) in `webapp/` | How it is used |
|---|---|
| `design/logo-source.png`, `logo-crop.png`, `logo-with-arm.png`, `logo-arm.svg` | Design masters. `design/make-icons.py` regenerates the icons from them. They are not served to users. |
| `public/logo-96.webp`, `logo-96.png` | Logo in the header, with the animated tonearm |
| `public/logo-320.webp`, `logo-320.png` | Logo on the About page and the loading screen |
| `public/favicon.ico`, `favicon-32.png` | Browser tab icon |
| `public/apple-touch-icon.png` | Icon when the app is added to an iPhone or iPad home screen |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Icons of the installed app (listed in `site.webmanifest`) |
| `public/og-image.png` | Preview image when a link to the app is shared on social media (`og:image`) |

---

## Globe textures

**How they are used:** the 3D globe (`GlobeView.tsx`) and the vinyl mode globe (`VinylGlobeView.tsx`) load two textures stored in the webapp under `public/textures/`. Both paths are set once in `src/components/visualization/globeTextures.ts`. The globe is drawn by [react-globe.gl](https://github.com/vasturiano/react-globe.gl) (three.js); the library itself provides no texture.

| File | How it is used | Source |
|---|---|---|
| `public/textures/earth-blue-marble-ng.jpg` (4096 × 2048) | Surface of the globe (land, oceans, ice) | NASA Blue Marble Next Generation (Reto Stöckli, NASA Earth Observatory), layer `BlueMarble_NextGeneration` of [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/). Public domain. |
| `public/textures/earth-elevation-aster.png` (2048 × 1024) | Relief (bump map) that shades the mountains | Elevation from ASTER GDEM (NASA/METI/AIST/Japan Spacesystems and U.S./Japan ASTER Science Team), layer `ASTER_GDEM_Color_Index` of NASA GIBS. Free to use with attribution. |

Both images are the whole world in the equirectangular projection (−180° to 180°, 90°N to 90°S) and were downloaded on 15 November 2026 through the GIBS WMS (`wms/epsg4326/best`).

**How the relief map was made.** GIBS only serves ASTER elevation as a coloured image, so each colour was mapped back to its elevation with the layer's published colour table (`colormaps/v1.3/ASTER_GDEM_Color_Index.xml`, 255 classes from 1 m to 8,401 m). The result is a grayscale height map: ocean and no-data = black, brightness = (elevation / 8,401 m)^0.8. ASTER has gaps over Antarctica and stops at 83°S. Gaps inside the ice sheet were filled from neighbouring heights (only where Blue Marble shows ice), and the cap south of 83°S gets one flat height (the median of the last 2° of data, about 1,800 m), slightly blurred at the seam. The bump map only shades the surface, so these fills do not change any data the app plays.

!!! note "Previous textures"
    Until November 2026 the globe loaded `earth-blue-marble.jpg` and `earth-topology.png` from unpkg (example images of the [three-globe](https://github.com/vasturiano/three-globe) library). Their origin and licence were not documented, so they were replaced by the NASA images above, which also removes the dependency on a CDN at runtime.

---

## Interface icons

All other icons in the interface are inline SVG drawn in the code: play, dataset and theme icons, among others. No third-party icon files are used.
