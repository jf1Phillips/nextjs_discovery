import mapboxgl, { Map as MapboxMap, LngLatLike, MapMouseEvent, Marker } from "mapbox-gl";
import ReactDOMServer from 'react-dom/server';
import JSXLabels, { DicoJsx } from "./jsxdico";

const mapboxTools = {
    addGeoJsonLabels,
    reload_json_labels,
    setDarkmodeToLabels,
    addGeoImg,
    add_popup,
    set3dTerrain,
    addRoads,
    addRain,
    get_location,
    highLightLabel,
};

export default mapboxTools;

/**------------------------------------------------------------------------------------- */
/**                                 GEOJSON LABELS                                       */
/**------------------------------------------------------------------------------------- */

/**
 * Represents a single icon resource.
 *
 * @property url - The URL of the icon image.
 * @property id - A unique identifier for the icon.
 */
type Icon = {
    url: string;
    id: string;
}

/**
 * Represents a GeoJSON label resource with associated icons.
 *
 * Each label has a GeoJSON URL, a unique identifier, and a set of icons
 * representing different visual states.
 *
 * @property url - The URL to the GeoJSON file for this label.
 * @property id - A unique identifier for this label resource.
 * @property icons - An object containing icons for different states:
 *   - `white`: The default white icon.
 *   - `dark`: The dark variant of the icon.
 *   - `selected`: The icon displayed when the label is selected.
 *
 * @example
 * const cityLabel: GeoJsonLabels = {
 *   url: "/geoJson_files/city_label.geojson",
 *   id: "city_label_1",
 *   icons: {
 *     white: { id: "pinWhite", url: "/icons/pin_white.png" },
 *     dark: { id: "pinDark", url: "/icons/pin_dark.png" },
 *     selected: { id: "pinSelected", url: "/icons/pin_selected.png" }
 *   }
 * };
 */
type GeoJsonLabels = {
    url: string;
    id: string;
    icons: {
        white: Icon;
        dark: Icon;
        selected: Icon;
    };
};

/**
 * Updates the visual appearance of GeoJSON label layers on a Mapbox map
 * according to the dark mode setting.
 *
 * For each label in `labels`, if the layer exists on the map, this function:
 * - Sets the `text-color` to white or black depending on `darkmode`.
 * - Sets the `text-halo-color` to provide contrast against the text.
 * - Switches the `icon-image` to the appropriate icon variant (`white` or `dark`).
 *
 * @param map - The Mapbox map instance on which the label layers exist.
 * @param labels - An array of `GeoJsonLabels` representing the labels to update.
 * @param darkmode - A boolean indicating whether dark mode is enabled (`true`) or not (`false`).
 *
 * @example
 * setDarkmodeToLabels(map, [cityLabel], true);
 * // This will set the label text to white, the halo to black, and use the white icon.
 */
function setDarkmodeToLabels(map: MapboxMap, labels: GeoJsonLabels[], darkmode: boolean): void {
    labels.forEach((label) => {
        if (!map.getLayer(label.id)) return;
        map.setPaintProperty(label.id, 'text-color',
            darkmode ? '#ffffff' : '#000000');
        map.setPaintProperty(label.id, 'text-halo-color',
            darkmode ? '#000000' : '#ffffff');
        map.setLayoutProperty(label.id, 'icon-image',
            darkmode ? label.icons.white.id : label.icons.dark.id);
    });
}

/**
 * Adds GeoJSON label layers to a Mapbox map and ensures their icons are loaded.
 *
 * This function iterates over an array of `GeoJsonLabels` and for each label:
 * 1. Loads the associated icons (`white`, `dark`, `selected`) if they are not already loaded.
 * 2. Adds a GeoJSON source for the label if it does not exist.
 * 3. Adds a Mapbox `symbol` layer for the label if it does not exist, using the `dark` icon by default.
 * 
 * The layer is configured with:
 * - Icon and text sizing based on zoom levels.
 * - Text offsets, anchors, and font settings.
 * - Overlapping icons allowed.
 * - Default paint properties (text and icon color, halo, opacity).
 *
 * @param map - The Mapbox map instance to which the labels will be added.
 * @param labels - An array of `GeoJsonLabels`, each containing a URL, a unique ID, and icons for different states.
 *
 * @example
 * addGeoJsonLabels(map, [
 *   {
 *     url: "/geoJson_files/city_label.geojson",
 *     id: "city_label_1",
 *     icons: {
 *       dark: { id: "pinDark", url: "/icons/pin_dark.png" },
 *       white: { id: "pinWhite", url: "/icons/pin_white.png" },
 *       selected: { id: "pinSelected", url: "/icons/pin_selected.png" }
 *     }
 *   }
 * ]);
 */
function addGeoJsonLabels(map: MapboxMap, labels: GeoJsonLabels[]): void {
    const loadingIcons = new Set<string>();

    labels.forEach((label) => {
        Object.values(label.icons).forEach((icon) => {
            if (map.hasImage(icon.id) || loadingIcons.has(icon.id)) return;
            loadingIcons.add(icon.id);
            map.loadImage(icon.url, (error, image) => {
                if (error || !image) return;
                if (!map.hasImage(icon.id))
                    map.addImage(icon.id, image);
            });
        });

        if (!map.getSource(label.id)) {
            map.addSource(label.id, { type: "geojson", data: label.url });
        }
        if (!map.getLayer(label.id)) {
            map.addLayer({
                id: label.id,
                type: 'symbol',
                source: label.id,
                layout: {
                    'icon-image': label.icons.dark.id,
                    'icon-allow-overlap': true,
                    'text-field': ['get', 'fr'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': ['interpolate', ['linear'], ['zoom'], 8, 13, 15, 50],
                    'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.4, 15, 1.7],
                    'text-offset': [0, -1.8],
                    'icon-anchor': 'bottom',
                    'text-anchor': 'bottom',
                },
                paint: {
                    'text-color': '#000000',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 1,
                    'text-opacity': 1.0,
                    'icon-opacity': 1.0,
                }
            });
        }
    });
}

/**
 * Highlights a specific label on the map, or resets all labels to match the current dark mode style.
 *
 * If a label name is provided, this function visually highlights the matching label
 * by changing its icon and text colors. If no name is provided, all labels are reset
 * to their default appearance according to the `darkmode` setting.
 *
 * @param map - The Mapbox map instance where the labels are displayed.
 * @param labels - An array of `GeoJsonLabels` representing the labels to update.
 * @param darkmode - A boolean indicating whether the map is currently in dark mode.
 *                   Determines which icons and text colors to use.
 * @param name - *(Optional)* The name of the label to highlight, corresponding to the `"fr"` property
 *               in the GeoJSON feature. If omitted, all labels are reset to normal.
 *
 * @example
 * // Highlight a specific label named "Paris"
 * highLightLabel(map, labels, true, "Paris");
 *
 * @example
 * // Reset all labels to match the dark mode style
 * highLightLabel(map, labels, true);
 */
function highLightLabel(map: MapboxMap, labels: GeoJsonLabels[], darkmode: boolean, name?: string): void {
    labels.forEach((label) => {
        if (!map.getLayer(label.id)) return;
        const icon = darkmode ? label.icons.white.id : label.icons.dark.id;
        const txtColor = darkmode ? '#ffffff' : '#000000';
        const haloColor = darkmode ? '#000000' : '#ffffff';

        if (!name) {
            setDarkmodeToLabels(map, [label], darkmode);
            return;
        }
        map.setLayoutProperty(label.id, 'icon-image', [
            "case",
            ["==", ["get", "fr"], name],
            label.icons.selected.id,
            icon
        ]);
        map.setPaintProperty(label.id, "text-color", [
            "case",
            ["==", ["get", "fr"], name],
            "#e56c00",
            txtColor
        ]);
        map.setPaintProperty(label.id, "text-halo-color", [
            "case",
            ["==", ["get", "fr"], name],
            "#ffffff",
            haloColor
        ]);
    });
}

/**
 * Reloads GeoJSON label layers on a Mapbox map.
 *
 * This function removes existing layers and sources for each label in `labels`,
 * then re-adds them using `addGeoJsonLabels`. Useful for refreshing label data
 * or updating icons.
 *
 * @param map - The Mapbox map instance on which to reload the labels. If `null`, the function does nothing.
 * @param labels - An array of `GeoJsonLabels` representing the labels to reload.
 *
 * @example
 * reload_json_labels(map, [
 *   {
 *     url: "/geoJson_files/city_label.geojson",
 *     id: "city_label_1",
 *     icons: {
 *       dark: { id: "pinDark", url: "/icons/pin_dark.png" },
 *       white: { id: "pinWhite", url: "/icons/pin_white.png" },
 *       selected: { id: "pinSelected", url: "/icons/pin_selected.png" }
 *     }
 *   }
 * ]);
 */
function reload_json_labels(map: MapboxMap | null, labels: GeoJsonLabels[]): void {
    if (!map) return;
    labels.forEach((label) => {
        if (map.getLayer(label.id)) map.removeLayer(label.id);
        if (map.getSource(label.id)) map.removeSource(label.id);
    });
    addGeoJsonLabels(map, labels);
}

export {
    type GeoJsonLabels, type Icon,
    addGeoJsonLabels, reload_json_labels,
    highLightLabel, setDarkmodeToLabels
};
/*****************************************************************************************/


/**------------------------------------------------------------------------------------- */
/**                                    ADD GEO IMG                                       */
/**------------------------------------------------------------------------------------- */

/**
 * Geographic coordinates of an image placed on a map.
 *
 * Each element represents a corner of the image, in the following order:
 * - [0]: top-left corner
 * - [1]: top-right corner
 * - [2]: bottom-right corner
 * - [3]: bottom-left corner
 *
 * Each pair follows the `[longitude, latitude]` format.
 */
type Coords = [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
];

/**
 * Common properties shared by all geographic image types.
 */
type BaseGeoImg = {
    /** Resource URL (image or raster). */
    url: string,
    /** Unique identifier for this resource. */
    id: string,
    /** Optional opacity value, between 0 (fully transparent) and 1 (fully opaque). */
    opacity?: number,
}

/**
 * Represents a geographic image resource.
 *
 * This type can represent two different kinds of resources:
 *
 * - **Image overlay** (`type: "image"`)
 *   An image placed on the map using specific geographic coordinates
 *   that define its corners (`coord`).
 *
 * - **Raster layer** (`type: "raster"`)
 *   A tiled raster source, typically used for maps or aerial imagery.
 *
 * Both variants share common properties defined in `BaseGeoImg`:
 * - `url`: the resource URL (image or raster)
 * - `id`: a unique identifier for this resource
 * - `opacity` (optional): transparency between `0` (transparent) and `1` (opaque)
 */
type GeoImg =
    | (BaseGeoImg & {
        /** Type discriminator — indicates this is a single image overlay. */
        type: "image",
        /** Geographic coordinates of the four corners of the image. */
        coord: Coords,
    })
    | (BaseGeoImg & {
        /** Type discriminator — indicates this is a raster layer. */
        type: "raster",
    });

/**
 * Adds geographic images or raster layers to a Mapbox map.
 *
 * This function iterates over an array of `GeoImg` objects and adds each one
 * as a Mapbox source and layer, if it does not already exist on the map.
 *
 * - For `type: "image"`: adds a single image overlay using geographic coordinates.
 * - For `type: "raster"`: adds a raster tile source with zoom levels 6–13.
 *
 * The layers are inserted below the first label layer found (`admin` labels)
 * if such a layer exists, to ensure proper rendering order.
 *
 * @param map - The Mapbox map instance to add the images to.
 * @param geoImgArray - An array of geographic images or raster layers to add.
 *
 * @example
 * ```ts
 * addGeoImg(map, [
 *   {
 *     id: "satellite-layer",
 *     type: "raster",
 *     url: "https://example.com/tiles/{z}/{x}/{y}.png",
 *     opacity: 0.7
 *   },
 *   {
 *     id: "overlay-image",
 *     type: "image",
 *     url: "https://example.com/image.png",
 *     coord: [
 *       [-74, 40.7],
 *       [-74, 40.8],
 *       [-73.9, 40.8],
 *       [-73.9, 40.7]
 *     ]
 *   }
 * ]);
 * ```
 */
function addGeoImg(map: MapboxMap, geoImgArray: GeoImg[]): void {
    const labelLayers = map.getStyle().layers.filter(l => l.id.includes('admin'));
    const firstLabel = labelLayers.length ? labelLayers[0].id : undefined;

    geoImgArray.forEach((geomap) => {
        if (!map.getSource(geomap.id)) {
            if (geomap.type === "raster") {
                map.addSource(geomap.id, {
                    type: "raster",
                    tiles: [
                        geomap.url
                    ],
                    tileSize: 256,
                    minzoom: 6,
                    maxzoom: 13,
                });
            }
            if (geomap.type === "image") {
                map.addSource(geomap.id, {
                    type: "image",
                    url: geomap.url,
                    coordinates: geomap.coord,
                });
            }
        }
        if (!map.getLayer(geomap.id)) {
            map.addLayer({
                id: geomap.id,
                type: "raster",
                source: geomap.id,
                paint: {
                    "raster-opacity": geomap.opacity ? geomap.opacity : 0.0,
                }
            }, firstLabel);
        }
    });
}

export { type GeoImg, type Coords, type BaseGeoImg, addGeoImg };
/*****************************************************************************************/


/**------------------------------------------------------------------------------------- */
/**                                    ADD POPUP                                         */
/**------------------------------------------------------------------------------------- */

const labelHandlers = new Map<string, (e: MapMouseEvent) => void>();

/**
 * Handles the click event for a specific label layer, highlighting the label and
 * displaying an interactive popup with optional JSX content.
 *
 * @param map - The Mapbox map instance.
 * @param e - The Mapbox mouse event triggered by a user click.
 * @param label - The specific {@link GeoJsonLabels} entry that was clicked.
 * @param darkmode - Whether the map is currently in dark mode (affects highlight colors and icons).
 *
 * @internal
 * This function is meant to be used internally by {@link add_popup}.
 */
function handler(map: MapboxMap, e: MapMouseEvent, label: GeoJsonLabels, darkmode: boolean): void {
    if (!e.features || !e.features.length) return;
    const feature = e.features[0];
    if (!feature.properties || feature.geometry.type !== 'Point') return;

    const labelTXT = feature.properties['fr'];
    highLightLabel(map, [label], darkmode, labelTXT);

    // if the label is in the dico
    const dicoEntry: DicoJsx | undefined = JSXLabels.find(e => e.town === labelTXT);

    const coords = feature.geometry.coordinates as LngLatLike;
    const popup = new mapboxgl.Popup({ anchor: "bottom", closeButton: false, offset: [0, -30] })
        .setLngLat(coords);
    if (!dicoEntry) {
        popup.setHTML(`<p style="font-weight:bold;font-size:20px;">${labelTXT}</p>`)
    } else {
        const html_str: string = ReactDOMServer.renderToString(dicoEntry.jsx);
        popup.setHTML(html_str);
        popup.setOffset([-20, -30]);
        popup.once("open", () => {
            const popup_el = document.querySelector('.mapboxgl-popup-content') as HTMLDivElement;

            popup_el.classList.add(
                'flex',
                'flex-col',
                'items-center',
                `w-[280px]`,
                'max-h-[500px]',
                'overflow-y-auto',
                'text-white');
            popup_el.style.backgroundColor = 'rgb(26, 18, 31)';
            popup_el.style.scrollbarWidth = 'thin';
            popup_el.style.scrollbarColor = '#616161 #2a2a2a';
        });
    }
    // Reset highlight when popup closes
    popup.once('close', () => highLightLabel(map, [label], darkmode));
    // Hide the popup anchor triangle
    popup.once("open", () => {
        const popup_anchor = document.querySelector('.mapboxgl-popup-tip') as HTMLDivElement;
        popup_anchor.style.display = "none";
    });
    popup.addTo(map);
}


/**
 * Attaches interactive popups to each GeoJSON label layer on the map.
 *
 * When a user clicks on a label, this function:
 * 1. Highlights the clicked label using {@link highLightLabel}.
 * 2. Displays a styled popup showing either basic text or a rendered JSX component.
 * 3. Automatically resets the label’s highlight when the popup closes.
 *
 * Each label layer is assigned its own click handler, which is safely replaced
 * if one already exists — preventing duplicate event bindings.
 *
 * @param map - The Mapbox map instance.
 * @param labels - An array of {@link GeoJsonLabels} representing the label layers to attach popups to.
 * @param darkmode - Whether the map is currently in dark mode (affects colors and icons).
 *
 * @example
 * // Add popups to all label layers
 * add_popup(map, labels, true);
 *
 * @remarks
 * - Popups are dynamically styled with Tailwind-like utility classes for layout and colors.
 * - If a JSX component is associated with a label (`JSXLabels`), it is rendered to HTML using ReactDOMServer.
 * - The label highlight resets when the popup is closed.
 */
function add_popup(map: MapboxMap, labels: GeoJsonLabels[], darkmode: boolean): void {
    labels.forEach((label) => {
        const oldHandler = labelHandlers.get(label.id);
        if (oldHandler) {
            map.off("click", label.id, oldHandler);
        }
        const newHandler = (e: MapMouseEvent) => handler(map, e, label, darkmode);
        labelHandlers.set(label.id, newHandler);
        map.on("click", label.id, newHandler);
    });
}
export { add_popup };
/*****************************************************************************************/


/**------------------------------------------------------------------------------------- */
/**                                  SET 3D TERRAIN                                      */
/**------------------------------------------------------------------------------------- */

/**
 * Enables or disables 3D terrain and building visualization on the Mapbox map.
 *
 * When activated, this function:
 * - Applies a 3D pitch animation for better visual perspective.
 * - Loads and sets a raster digital elevation model (DEM) as terrain data.
 * - Adds a 3D extrusion layer for buildings.
 * - Adds a hillshade layer to simulate realistic shadows and lighting.
 *
 * When disabled (`remove = true`), it:
 * - Removes the terrain, hillshade, and building layers.
 * - Smoothly resets the map pitch to a flat view.
 *
 * @param map - The Mapbox map instance.
 * @param remove - Whether to remove the 3D terrain and restore a flat map view.
 *
 * @example
 * // Enable 3D terrain
 * set3dTerrain(map, false);
 *
 * // Disable 3D terrain and return to flat mode
 * set3dTerrain(map, true);
 *
 * @remarks
 * - The terrain source uses Mapbox’s `mapbox.terrain-rgb` DEM tileset.
 * - Building data is fetched from the `"composite"` source (default Mapbox Streets style).
 * - A smooth pitch animation is applied when toggling terrain for a better user experience.
 * - The function safely checks for existing sources and layers before adding or removing them.
 */
function set3dTerrain(map: MapboxMap, remove: boolean): void {
    const id_building: string = "3dbuilding";
    const id_shadow: string = "shadow_layer";
    const id_terrain: string = "terrain_to_shadow";

    map.easeTo({ pitch: 60, duration: 1000 });
    if (remove) {
        map.setTerrain(null);
        map.easeTo({ pitch: 0, duration: 1000 });
        if (map.getLayer(id_shadow)) map.removeLayer(id_shadow);
        if (map.getLayer(id_building)) map.removeLayer(id_building);
        return;
    }
    if (!map.getSource(id_terrain)) {
        map.addSource(id_terrain, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 512,
        });
    }
    if (!map.getLayer(id_building)) {
        map.addLayer({
            'id': id_building,
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 1.0
            }
        });
    }
    if (!map.getLayer(id_shadow)) {
        map.addLayer({
            id: id_shadow,
            type: 'hillshade',
            source: id_terrain,
            layout: {},
            paint: {
                'hillshade-shadow-color': '#473B24',
                'hillshade-highlight-color': '#F8E8D0',
                'hillshade-accent-color': '#BBA67A',
                'hillshade-exaggeration': 1.0
            }
        }, 'water');
    }
    if (!map.getTerrain()) {
        map.setTerrain({ source: id_terrain, exaggeration: 1.5 });
    }
}

export { set3dTerrain };
/*****************************************************************************************/


/**------------------------------------------------------------------------------------- */
/**                                    ADD ROADS                                         */
/**------------------------------------------------------------------------------------- */

/**
 * Adds a GeoJSON road layer to the Mapbox map.
 *
 * This function loads a GeoJSON file containing road data and displays it
 * as a line layer on the map. It automatically checks whether the source
 * and layer already exist to prevent duplicate additions.
 *
 * @param url_given - The URL or path to the GeoJSON file containing road data.
 *                    Used both as the source data and the unique layer identifier.
 * @param map - The Mapbox map instance where the road layer will be added.
 *
 * @example
 * // Add a road network from a GeoJSON file
 * addRoads("/geoJson_files/roads.geojson", map);
 *
 * @remarks
 * - The function draws roads as smooth gray lines (`#8a898b`) with rounded joins and caps.
 * - Line width is fixed at `2px` with full opacity.
 * - If the same source or layer already exists, it will not be re-added.
 * - The provided URL is used as both the source name and layer ID.
 */
function addRoads(url_given: string, map: MapboxMap): void {
    if (!map.getSource(url_given)) {
        map.addSource(url_given, {
            type: 'geojson',
            data: url_given
        });
    }
    if (!map.getLayer(url_given)) {
        map.addLayer({
            id: url_given,
            type: 'line',
            source: url_given,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#8a898b',
                'line-width': 2,
                'line-opacity': 1.0,
            }
        });
    }
}

export { addRoads };
/*****************************************************************************************/


/**------------------------------------------------------------------------------------- */
/**                                    ADD RAIN                                          */
/**------------------------------------------------------------------------------------- */

/**
 * Adds or removes a rain effect on the map.
 *
 * If `remove_rain` is true, the current rain effect is removed.
 * Otherwise, if no rain is active, it creates a new one with
 * predefined visual properties such as density, color, and direction.
 *
 * @param map - The Mapbox map instance to modify.
 * @param remove_rain - Optional flag to remove the rain effect.
 *
 * @example
 * // Add a rain effect
 * addRain(map);
 *
 * // Remove the rain effect
 * addRain(map, true);
 */
function addRain(map: MapboxMap, remove_rain?: boolean): void {
    if (remove_rain) {
        map.setRain(null);
    } else if (!map.getRain()) {
        map.setRain({
            density: ['interpolate', ['linear'], ['zoom'],
                9, 0.0, 13, 0.8],
            intensity: 1.0,
            color: '#a8adbc',
            opacity: 0.7,
            vignette: ['interpolate', ['linear'], ['zoom'],
                9, 0.0, 13, 0.8],
            'vignette-color': '#464646',
            direction: [0, 80],
            'droplet-size': [2.6, 18.2],
            'distortion-strength': 0.7,
            'center-thinning': 0
        });
    }
}

export { addRain };
/*****************************************************************************************/


/**------------------------------------------------------------------------------------- */
/**                                  GET LOCATION                                        */
/**------------------------------------------------------------------------------------- */

/**
 * Toggles real-time user geolocation tracking on a Mapbox map.
 *
 * When activated, this function continuously updates a marker to follow
 * the user's current position using the browser's Geolocation API.
 * When disabled, it stops tracking, removes the marker, and clears the active watch.
 *
 * @param map - The Mapbox map instance, or `null` if the map is not initialized.
 * @param marker - A React ref holding the current Mapbox `Marker` used to display the user’s position.
 * @param loc - A boolean flag indicating whether location tracking should be active (`true`) or disabled (`false`).
 * @param setLoc - A React state setter used to update the `loc` state when location availability changes.
 * @param watchId - A React ref storing the ID of the active geolocation watch (if any), allowing cleanup or restart.
 *
 * @example
 * // Enable geolocation tracking
 * get_location(map, markerRef, true, setLoc, watchIdRef);
 *
 * @example
 * // Disable geolocation tracking
 * get_location(map, markerRef, false, setLoc, watchIdRef);
 *
 * @remarks
 * - Uses `navigator.geolocation.watchPosition()` to continuously track position.
 * - Ensures only one active watcher exists at a time (cleans up existing watchers before starting new ones).
 * - Automatically removes the user marker and stops watching when `loc` is set to `false`.
 * - Requests high-accuracy positioning with a 5-second timeout and zero cache age.
 * - Safe-guards against missing browser geolocation support.
 */
function get_location(
    map: MapboxMap | null,
    marker: React.RefObject<Marker | null>,
    loc: boolean,
    setLoc: React.Dispatch<React.SetStateAction<boolean>>,
    watchId: React.RefObject<number | null>
) : void
{
    if (!map) return;
    if (!navigator.geolocation) return;

    if (!loc) {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
        setLoc(false);
        return;
    }
    if (watchId.current === null) {
        let available: boolean = true;
        const tmp: number = navigator.geolocation.watchPosition((p) => {
            const coord: [number, number] = [p.coords.longitude, p.coords.latitude];

            if (!marker.current) {
                marker.current = new Marker()
                    .setLngLat(coord).addTo(map);
            } else {
                marker.current.setLngLat(coord);
            }
            setLoc(true);
        },
        (error) => {
            console.log("Error location: ", error);
            available = false;
            setLoc(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
        if (available) watchId.current = tmp;
    }
}

export {get_location};
/*****************************************************************************************/
