# Data Processing

Pipeline for extracting and processing NASA climate data.

---

## Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  NASA APIs  │────▶│   Extract   │────▶│   Process   │────▶│   Output    │
│             │     │             │     │             │     │             │
│  GISTEMP    │     │  Download   │     │  Regrid     │     │  NPZ files  │
│  POWER      │     │  Parse      │     │  Normalize  │     │  JSON meta  │
│  NetCDF     │     │  Validate   │     │  Fill gaps  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Extraction Scripts

### GISTEMP Extraction

```python
# simulation/extract_gistemp.py
import asyncio
import numpy as np
from src.nasa.gistemp import GISTEMPClient

async def extract_gistemp(start_year: int, end_year: int):
    """Extract GISTEMP data to intensity map."""
    client = GISTEMPClient()

    # Fetch data
    data = await client.fetch_global_temperatures(start_year, end_year)

    # Create intensity map (global mean, replicated spatially)
    n_frames = len(data)
    intensity_map = np.zeros((n_frames, 180, 360), dtype=np.float32)

    for i, point in enumerate(data):
        # Replicate global mean across all cells
        intensity_map[i, :, :] = point.anomaly

    # Save
    times = [f"{d.year}-{d.month:02d}" for d in data]
    np.savez_compressed(
        "simulation/output/gistemp.npz",
        values=intensity_map,
        times=np.array(times)
    )

    # Save metadata
    import json
    with open("simulation/output/gistemp.json", "w") as f:
        json.dump({
            "variable": "global_temperature_anomaly",
            "label": "Global Temperature Anomaly",
            "units": "degC",
            "min_value": -0.5,
            "max_value": 2.0,
            "grid": [180, 360],
            "frames": n_frames,
            "source": "NASA GISTEMP",
            "real_data": True,
        }, f, indent=2)

if __name__ == "__main__":
    asyncio.run(extract_gistemp(2020, 2024))
```

### POWER API Extraction

```python
# simulation/extract_power.py
import asyncio
import numpy as np
from src.nasa.power import POWERClient

async def extract_power_grid(
    start_year: int,
    end_year: int,
    parameters: list[str],
    resolution: float = 1.0
):
    """Extract POWER data to intensity maps."""
    client = POWERClient()

    # Grid dimensions
    n_lat = int(180 / resolution)
    n_lon = int(360 / resolution)

    # Calculate number of months
    n_frames = (end_year - start_year + 1) * 12

    # Initialize maps for each parameter
    maps = {param: np.full((n_frames, n_lat, n_lon), np.nan) for param in parameters}

    # Sample grid (rate limited)
    lats = np.linspace(-89.5, 89.5, n_lat)
    lons = np.linspace(-179.5, 179.5, n_lon)

    for i, lat in enumerate(lats):
        for j, lon in enumerate(lons):
            try:
                data = await client.fetch_monthly_data(
                    latitude=lat,
                    longitude=lon,
                    start_year=start_year,
                    end_year=end_year,
                    parameters=parameters
                )

                for param in parameters:
                    if param in data:
                        maps[param][:, i, j] = data[param]

            except Exception as e:
                print(f"Failed at ({lat}, {lon}): {e}")

            # Rate limit
            await asyncio.sleep(2)  # 30 req/min

    # Save each parameter
    for param, values in maps.items():
        np.savez_compressed(
            f"simulation/output/{param.lower()}.npz",
            values=values,
            times=generate_month_strings(start_year, end_year)
        )

def generate_month_strings(start_year: int, end_year: int) -> np.ndarray:
    months = []
    for year in range(start_year, end_year + 1):
        for month in range(1, 13):
            months.append(f"{year}-{month:02d}")
    return np.array(months)
```

### NetCDF Extraction

```python
# simulation/extract_netcdf.py
import netCDF4 as nc
import numpy as np

def extract_from_netcdf(filepath: str, variable: str):
    """Extract data from NetCDF file."""
    with nc.Dataset(filepath, 'r') as ds:
        # Get dimensions
        time = ds.variables['time'][:]
        lat = ds.variables['lat'][:]
        lon = ds.variables['lon'][:]

        # Get data
        data = ds.variables[variable][:]

        # Handle fill values
        if hasattr(data, 'mask'):
            data = data.filled(np.nan)

    return data, time, lat, lon
```

---

## Processing Steps

### 1. Regridding

Convert to standard 1° grid:

```python
from scipy.interpolate import RegularGridInterpolator

def regrid_to_1deg(data: np.ndarray, src_lat: np.ndarray, src_lon: np.ndarray):
    """Regrid data to 1-degree resolution."""
    # Target grid
    dst_lat = np.arange(-89.5, 90.5, 1.0)
    dst_lon = np.arange(-179.5, 180.5, 1.0)

    # Create interpolator for each time step
    regridded = np.zeros((data.shape[0], 180, 360))

    for t in range(data.shape[0]):
        interp = RegularGridInterpolator(
            (src_lat, src_lon),
            data[t],
            bounds_error=False,
            fill_value=np.nan
        )

        # Interpolate to target grid
        dst_points = np.array(np.meshgrid(dst_lat, dst_lon, indexing='ij'))
        dst_points = dst_points.reshape(2, -1).T
        regridded[t] = interp(dst_points).reshape(180, 360)

    return regridded
```

### 2. Gap Filling

Fill missing values:

```python
from scipy.ndimage import generic_filter

def fill_gaps(data: np.ndarray, max_gap: int = 5):
    """Fill small gaps with interpolation."""
    filled = data.copy()

    for t in range(data.shape[0]):
        frame = filled[t]
        mask = np.isnan(frame)

        if np.any(mask):
            # Use spatial interpolation
            filled[t] = fill_spatial_gaps(frame)

    # Temporal interpolation for remaining gaps
    for i in range(data.shape[1]):
        for j in range(data.shape[2]):
            series = filled[:, i, j]
            if np.any(np.isnan(series)):
                filled[:, i, j] = interpolate_series(series)

    return filled

def fill_spatial_gaps(frame: np.ndarray) -> np.ndarray:
    """Fill gaps using neighbor averaging."""
    def nanmean_filter(values):
        return np.nanmean(values)

    return generic_filter(
        frame,
        nanmean_filter,
        size=3,
        mode='nearest'
    )
```

### 3. Normalization

Normalize to 0-1 range:

```python
def normalize_data(data: np.ndarray, min_val: float = None, max_val: float = None):
    """Normalize data to 0-1 range."""
    if min_val is None:
        min_val = np.nanmin(data)
    if max_val is None:
        max_val = np.nanmax(data)

    normalized = (data - min_val) / (max_val - min_val)

    # Clip to 0-1
    return np.clip(normalized, 0, 1)
```

### 4. Quality Control

Validate data:

```python
def validate_data(data: np.ndarray, metadata: dict) -> list[str]:
    """Validate data against expected ranges."""
    issues = []

    # Check shape
    expected_frames = metadata.get('frames')
    if expected_frames and data.shape[0] != expected_frames:
        issues.append(f"Expected {expected_frames} frames, got {data.shape[0]}")

    # Check range
    min_val = metadata.get('min_value')
    max_val = metadata.get('max_value')
    if min_val and np.nanmin(data) < min_val * 0.9:
        issues.append(f"Values below expected minimum: {np.nanmin(data)}")
    if max_val and np.nanmax(data) > max_val * 1.1:
        issues.append(f"Values above expected maximum: {np.nanmax(data)}")

    # Check for excessive NaN
    nan_ratio = np.isnan(data).sum() / data.size
    if nan_ratio > 0.1:
        issues.append(f"High NaN ratio: {nan_ratio:.1%}")

    return issues
```

---

## Simulation Data

For demo and testing, generate simulated data:

```bash
python simulation/simulate_variables.py \
  --scenario both \
  --warming 0.5 \
  --years 2 \
  --frames 24
```

### Simulation Script

```python
# simulation/simulate_variables.py
import numpy as np
import argparse

def simulate_temperature(n_frames: int, warming_rate: float):
    """Simulate temperature data with warming trend."""
    base = np.random.randn(180, 360) * 10  # Base pattern
    trend = np.linspace(0, warming_rate, n_frames)
    seasonal = np.sin(np.linspace(0, 2*np.pi, n_frames)) * 5

    data = np.zeros((n_frames, 180, 360))
    for t in range(n_frames):
        data[t] = base + trend[t] + seasonal[t] + np.random.randn(180, 360)

    return data

def simulate_precipitation(n_frames: int):
    """Simulate precipitation data."""
    # Tropical belt with higher precipitation
    lat_factor = np.exp(-((np.arange(180) - 90) ** 2) / 1000)
    lat_factor = lat_factor[:, np.newaxis]

    data = np.zeros((n_frames, 180, 360))
    for t in range(n_frames):
        data[t] = np.random.exponential(5, (180, 360)) * lat_factor

    return data
```

---

## Running the Pipeline

### Full Extraction

```bash
# Extract all real data
python simulation/build_realistic_dataset.py

# Or run individual extractors
python simulation/extract_gistemp.py
python simulation/extract_power.py
```

### Verification

```bash
# Verify output files
python -c "
import numpy as np
data = np.load('simulation/output/temperature.npz')
print(f'Shape: {data[\"values\"].shape}')
print(f'Range: {data[\"values\"].min():.2f} to {data[\"values\"].max():.2f}')
print(f'Frames: {len(data[\"times\"])}')
"
```

---

## Output Directory Structure

```
simulation/output/
├── temperature.npz        # Surface temperature
├── temperature.json       # Metadata
├── precipitation.npz      # Rainfall
├── precipitation.json
├── co2.npz               # CO2 concentration
├── co2.json
├── snowfall.npz          # Snow accumulation
├── snowfall.json
├── dust.npz              # Atmospheric dust
├── dust.json
├── smoke.npz             # Wildfire smoke
├── smoke.json
└── lightning.npz         # Lightning frequency
    lightning.json
```

---

## Next Steps

- [Data Sources](sources.md) - NASA APIs
- [Data Formats](formats.md) - File specifications
