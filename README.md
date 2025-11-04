# Interactive Historical Map — The Ancient Near East

This project is an **interactive Mapbox map** designed to explore the Ancient Near East across different eras, featuring **historical layers**, **dynamic labels**, **contextual popups**, and a **light/dark mode**.
The site allows free navigation, visualization of overlaid historical maps, and access to detailed geographic information.

---

## Main Features

### Interactive Map

* Free navigation (zoom, pan, clicks).
* Responsive minimalist interface.

### Historical Layers

Two ancient maps are integrated:

1. **PEF Map (1880)**
2. **Hans J. Hopfen Map (1975)**

They are overlaid on the modern map and can be individually toggled on or off via the interface.

### Labels and Points of Interest

* Labels are loaded from GeoJSON files.
* Some labels include **special popups** (dynamic HTML content).
* When a specific chapter is active, the corresponding label is **highlighted in orange**.

### Light/Dark Mode

* Dynamic switching between *Mapbox Light* and *Mapbox Dark* styles.
* Label icons and text automatically adapt (color, halo, contrast).

### Visual Effects

* Optional **animated rain** and **3D terrain** effects, toggleable via the interface.

---

## Architecture

The core of the project is based on two main files:

| File                               | Role                                                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `./components/get_map.tsx`         | Main React component displaying the map and handling user interactions.                                                 |
| `./components/mapbox_functions.ts` | Module containing all utility functions to manipulate the Mapbox map (add labels, images, roads, visual effects, etc.). |

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/jf1Phillips/nextjs_discovery.git
cd nextjs_discovery/

# 2. Install dependencies
npm install

# 3. Add your Mapbox key
echo "NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_TOKEN_HERE" > .env.local

# 4. Start the development server
npm run dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

---

## Module `mapbox_functions.ts`

This module acts as a **custom Mapbox library**, reusable in other projects.
It exposes a main object `mapboxTools` containing numerous documented functions.

---

### List of Exported Functions

#### `addGeoJsonLabels(map, labels)`

Adds labels from GeoJSON files with automatic icon management (`dark`, `white`, `selected`).

```ts
function addGeoJsonLabels(map: MapboxMap, labels: GeoJsonLabels[]): void
```

#### `setDarkmodeToLabels(map, labels)`

Updates label colors and icons according to the active light or dark mode.

```ts
function setDarkmodeToLabels(map: MapboxMap, labels: GeoJsonLabels[]): void
```

#### `highLightLabel(map, labels, name?)`

Highlights one or several labels by name, or resets all labels.

```ts
function highLightLabel(map: MapboxMap, labels: GeoJsonLabels[], name?: string | string[]): void
```

#### `reload_json_labels(map, labels)`

Completely reloads GeoJSON labels (removes and reimports layers).

```ts
function reload_json_labels(map: MapboxMap | null, labels: GeoJsonLabels[]): void
```

#### `addGeoImg(map, geoImgArray)`

Adds historical maps (image or raster tiles) to the map.

```ts
function addGeoImg(map: MapboxMap, imgs: GeoImg[]): void
```

#### `addRoads(path, map)`

Adds a GeoJSON file containing roads to the map.

```ts
function addRoads(path: string, map: MapboxMap): void
```

#### `addRain(map, clear?)`

Displays a rain effect on the map (or removes it if `clear = true`).

```ts
function addRain(map: MapboxMap, clear?: boolean): void
```

#### `set3dTerrain(map, clear?)`

Enables or disables 3D terrain rendering.

```ts
function set3dTerrain(map: MapboxMap, clear?: boolean): void
```

#### `add_popup(map, labels)`

Attaches dynamic popups to the corresponding labels.

```ts
function add_popup(map: MapboxMap, labels: GeoJsonLabels[]): void
```

#### `get_location(map, marker, enable, setBtn, watchId)`

Tracks the user’s location and displays a GPS marker.

```ts
function get_location(
    map: MapboxMap | null,
    marker: Marker | null,
    enable: boolean,
    setBtn: (b: boolean) => void,
    watchId: { current: number | null }
): void
```

---

## Navigation & Interface

The interface includes:

* ☰ button — opens the layer panel.
* 🌑 / 🔆 — toggles light/dark mode.
* '+' / '−' — zoom controls.
* 3D / 2D — toggles terrain rendering.
* 🌧️ / ☀️ — toggles rain effect.
* ↻ — reloads GeoJSON labels.
* ⊕ — activates user geolocation.

---

## Main Types

### `GeoJsonLabels`

Defines a geographic label structure:

```ts
type GeoJsonLabels = {
  url: string;
  id: string;
  icons: {
    white: { id: string, url: string };
    dark: { id: string, url: string };
    selected: { id: string, url: string };
  };
};
```

### `GeoImg`

Defines an image or raster layer structure:

```ts
type GeoImg =
  | { type: "image", url: string, id: string, coord: Coords, opacity?: number }
  | { type: "raster", url: string, id: string, bounds: [number, number, number, number], opacity?: number };
```
