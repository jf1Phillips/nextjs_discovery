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
npm run build && npm run start
```

The site will be available at [http://localhost:3000](http://localhost:3000).

---
