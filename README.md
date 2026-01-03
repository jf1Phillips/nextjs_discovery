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
* For popups, there is a function that allows **automatic** popup creation using a small set of information contained in the **GeoJSON** files.
* When a specific chapter is active, the corresponding label is **highlighted in orange**.

### Light/Dark Mode

* Dynamic switching between *Mapbox Light* and *Mapbox Dark* styles.
* Label icons and text automatically adapt (color, halo, contrast).

### Visual Effects

* Optional **3D terrain** effects, toggleable via the interface.

---

## Architecture

The core of the project is based on two main files:

| File                               | Role                                                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `./components/get_map.tsx`         | Main React component displaying the map and handling user interactions.                                                 |
| `./components/mapbox_functions.ts` | Module containing all utility functions to manipulate the Mapbox map (add labels, images, roads, visual effects, etc.). |
| `./components/json_load.tsx` | Function that allows loading a specific location within a chapter using a given index (for example, from a GeoJSON file containing 10 locations, it is possible to retrieve and highlight location number 5). This functionality is not directly tied to the API and is intended to be adapted as needed. |

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

# Python script

All Python files are located in the `./python_script/` directory and are divided into three subfolders:
* `./python_script/conv_script/`: directory containing all scripts used to convert data, for example converting a CSV file into a GeoJSON file.
* `./python_script/event_data/`: directory containing JSON files retrieved via scraping and storing event data (Marian apparitions, etc.). `all_event.json` contains all events, `event_with_coordinates.json` contains all events with coordinates, and `event_without_coordinates.json` contains events for which no coordinates were found.
* `./python_script/scrap_script/`: this directory contains all scripts used to scrape websites.
* `./python_script/src_files/`: this directory contains various source files that are useful when working with the Python scripts.

## Script de conversion

### `put_float_to_coordinates.py`
Converts latitude and longitude values into floating-point numbers. The input file must contain `latitude` and `longitude` fields. This script was used on `./python_script/event_data/all_event.json` because, after merging, about half of the latitude and longitude values were strings instead of floats.
```bash
# Usage
python put_float_to_coordinates.py "input_file.json"
```

### `csv_to_geoJson.py`
Converts the `city_labels_and_urls.csv` file into a GeoJSON file. This script also includes custom descriptions for "Bethsaida" and "Gomorrah?" in order to provide more detailed popups.
```bash
# Usage (you must be at the project root)
cd ./python_script/ && python conv_script/csv_to_geoJson.py city_labels_and_urls.csv
```
### `conv_img_to_tif.py`
Adds geographic coordinates to an image by converting it into a `.tif` file (thus avoiding the need to use QGIS). The coordinates must be specified directly in the file via the `bounds` variable, as well as the input file (which must be in WebP format) and the output file.

```python
# Replace these lines at the end of the file with the information you want.
webp_file = "pef_1880_map.webp"
tif_file = "pef_1880_map.tif"

# bounds : (left, bottom, right, top)
bounds = (34.120542941238725 + 0.008,
            31.10529446421723 - 0.0058,
            35.7498100593699 + 0.008,
            33.46703792406347 + 0.003) # lon_min, lat_min, lon_max, lat_max

webp_to_geotiff(webp_file, tif_file, bounds=bounds)
```
Then execute it in the terminal.
```bash
python conv_img_to_tif.py
```
### `merge_city_label.py`
This file merges `city_label.csv` and `maria_valtorta_parse_data.csv` to create `city_labels_and_urls.csv`. It allows adding locations that have a source (URL with a description of the place) so that, using `csv_to_geoJson.py`, more information can be included. The script needs improvement, as it currently does not handle duplicates properly (for example, "Masada, Massada" and "Masada").
```bash
# Usage (you must be at the project root)
cd python_script/ && python merge_city_label.py
```

# Image and tiles
To add large maps to Mapbox, here is the process I followed. First, you need to obtain the coordinates of the map and convert it into a `.tif` file. For this, I used QGIS, which allows you to georeference an image and then export it as a `.tif` file. If you already know the coordinates of the map edges, you can use the Python file `conv_img_to_tif.py`. After that, there are two ways to display the map:
* First, you can directly add it using the `addGeoImg` function from the `mapbox_functions.tsx` file (in this case, there is no need to convert the file to `.tif`).
```ts
addGeoImg(map, [
  {
    id: "overlay-image",
    type: "image",
    url: "https://example.com/image.png",
    coord: [
      [-74, 40.7],
      [-74, 40.8],
      [-73.9, 40.8],
      [-73.9, 40.7]
    ]
  }
]);
```
The advantages of this method are that it is quite fast to add and the image can be edited directly. However, for a large image, the projection on the map will not be very accurate, likely due to the curvature of the map. As a result, the top and bottom may appear slightly stretched. Additionally, large maps can be very heavy in file size, which can cause long loading times.
* To address this issue, you can use the `./utils/conv.sh` file. You need to specify the following data in the file header:
```bash
# Input: the .tif file you previously converted
INPUT="pef_1880_map.tif"
# Output directory
OUTPUT_DIR="public/tiles"
```
You must specify an output directory because the image will be converted into tiles, creating multiple folders and subfolders containing the tiles needed for each zoom level, with different quality. At very low zoom levels (distant view), there will be few tiles and their quality will be low to save resources. This script generates the tiles and then converts all tiles into WebP files to save as much space as possible. As a result, the final folder with all the tiles will be smaller than the original GeoJSON file.
Then you can add it using the `addGeoImg` function from the `mapbox_functions.tsx` file in the following way:
```ts
addGeoImg(map, [
  {
    id: "satellite-layer",
    type: "raster",
    url: "https://example.com/tiles/{z}/{x}/{y}.webp",
    opacity: 0.7
    bounds: [33.6803545, 31.1732927, 36.6260058, 33.7008169],
  }]);
```
It is important to specify the map boundaries because otherwise, if you are in an area outside the map (for example, viewing Paris while the map is in Australia), Mapbox will try to load tiles that do not exist, resulting in many error messages. The `bounds` variable defines the area where the map is located, which prevents errors caused by nonexistent tiles.
