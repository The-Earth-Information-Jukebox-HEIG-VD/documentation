# NASA Data Sources

Overview of NASA climate data sources used in Earth Information Jukebox.

---

## GISTEMP (Global Surface Temperature Analysis)

**Source**: NASA Goddard Institute for Space Studies (GISS)
**URL**: https://data.giss.nasa.gov/gistemp/

### What It Contains

- Monthly global mean surface temperature anomalies
- Data from 1880 to present
- Anomalies relative to 1951-1980 baseline

### Data Format

```csv
Year,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,J-D,D-N,DJF,MAM,JJA,SON
2024,154,176,168,132,118,146,151,147,141,135,128,138,...
```

!!! info "Value Units"
    Values are in **0.01°C** (hundredths of degrees).
    Example: `154` = **+1.54°C** anomaly

### API Usage

```python
from src.nasa.gistemp import GISTEMPClient

client = GISTEMPClient()
data = await client.fetch_global_temperatures(
    start_year=2020,
    end_year=2024
)

for point in data:
    print(f"{point.year}: {point.anomaly}°C")
```

### Sonification Mapping

| Temperature | Musical Representation |
|-------------|----------------------|
| -0.5°C (cool) | Low pitch (220 Hz) |
| 0.0°C (baseline) | Mid pitch (550 Hz) |
| +1.5°C (warm) | High pitch (880 Hz) |

---

## POWER API (Prediction Of Worldwide Energy Resources)

**Source**: NASA Langley Research Center
**URL**: https://power.larc.nasa.gov/api/

### What It Contains

- Location-specific climate parameters
- Solar irradiance, temperature, precipitation, wind
- Hourly, daily, monthly, or climatology data

### Available Parameters

| Code | Description | Unit |
|------|-------------|------|
| `T2M` | Temperature at 2 meters | °C |
| `T2M_MAX` | Maximum temperature | °C |
| `T2M_MIN` | Minimum temperature | °C |
| `PRECTOTCORR` | Precipitation | mm/day |
| `WS2M` | Wind speed at 2 meters | m/s |
| `RH2M` | Relative humidity | % |
| `ALLSKY_SFC_SW_DWN` | Solar irradiance | W/m² |

### API Usage

```python
from src.nasa.power import POWERClient

client = POWERClient()
data = await client.fetch_monthly_data(
    latitude=37.7749,
    longitude=-122.4194,
    start_year=2020,
    end_year=2024,
    parameters=["T2M", "PRECTOTCORR"]
)
```

### Rate Limits

!!! warning "Rate Limiting"
    - Maximum 30 requests per minute
    - Cache responses for demo reliability
    - Use bulk endpoints when possible

---

## SVS (Scientific Visualization Studio)

**Source**: NASA Goddard Space Flight Center
**URL**: https://svs.gsfc.nasa.gov/

### What It Contains

- High-quality visualizations of NASA data
- Video animations of climate phenomena
- Image sequences for frame-by-frame analysis

### Focus Areas (Earth Information Center)

1. Sea Level Rise
2. Wildfires
3. Greenhouse Gases
4. Air Quality
5. Biodiversity
6. Arctic/Antarctic Ice
7. Freshwater
8. Sustainable Energy
9. Agriculture

### Integration (Future)

```python
# Planned: Download and analyze visualization frames
from src.nasa.svs import SVSClient

client = SVSClient()
frames = await client.download_visualization(
    viz_id="12345",
    resolution="1080p"
)

# Extract intensity data from frames
for frame in frames:
    intensity = extract_color_intensity(frame)
    # Map to audio parameters
```

---

## Data for Sonification

### Temperature → Pitch Mapping

```
Data Value    Normalized    Frequency
─────────────────────────────────────
-0.5°C        0.00          220 Hz (A3)
 0.0°C        0.50          550 Hz
+1.5°C        1.00          880 Hz (A5)
```

### Recommended Sonification Approach

| Data Source | Use Case | Instrument |
|-------------|----------|------------|
| GISTEMP | Long-term temperature trends | Piano (chords) |
| POWER | Regional climate exploration | Multiple |
| SVS | Visual synchronization | Full orchestra |

### Multi-Variable Mapping

| Variable | Instrument | Audio Property |
|----------|------------|----------------|
| Temperature | Piano | Pitch |
| Precipitation | Violins | Intensity |
| CO2 | Contrabass | Depth |
| Wind | Flute | Tremolo |

---

## Data Freshness

| Source | Update Frequency | Lag |
|--------|------------------|-----|
| GISTEMP | Monthly | ~2 months |
| POWER | Daily | ~1 day |
| SVS | Varies | Varies |

---

## Caching Strategy

```python
# Data is cached locally for reliability
CACHE_DIR = Path("data/raw")

async def fetch_with_cache(url: str, cache_key: str) -> dict:
    cache_file = CACHE_DIR / f"{cache_key}.json"

    if cache_file.exists():
        age = time.time() - cache_file.stat().st_mtime
        if age < 86400:  # 24 hours
            return json.loads(cache_file.read_text())

    data = await fetch(url)
    cache_file.write_text(json.dumps(data))
    return data
```

---

## Next Steps

- [Data Formats](formats.md) - File specifications
- [Data Processing](processing.md) - Processing pipeline
