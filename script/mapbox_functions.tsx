import { CreateHTMLPopup } from "@/components/popup_generator";
import mapboxgl, { Map as MapboxMap, LngLatLike, MapMouseEvent, Marker, FilterSpecification, LngLat } from "mapbox-gl";
import { createRoot } from "react-dom/client";

var darkmode: boolean = false;

const mapboxTools = {
    /** {@link addGeoJsonLabels} */
    addGeoJsonLabels,
    /** {@link reload_json_labels} */
    reload_json_labels,
    /** {@link setDarkmodeToLabels} */
    setDarkmodeToLabels,
    /** {@link setDarkModeToMap} */
    setDarkModeToMap,
    /** {@link addGeoImg} */
    addGeoImg,
    /** {@link add_popup} */
    add_popup,
    /** {@link set3dTerrain} */
    set3dTerrain,
    /** {@link addRoads} */
    addRoads,
    /** {@link addRain} */
    addRain,
    /** {@link get_location} */
    get_location,
    /** {@link highLightLabel} */
    highLightLabel,
    /** {@link setWaterColor} */
    filterGestion,
    /** {@link filterGestion} */
    setWaterColor,
    get darkmode() {
        return darkmode;
    },
    set darkmode(value: boolean) {
        darkmode = value;
    }
};

export default mapboxTools;

/**
 * Represents a GeoJSON resource used to display a label on the map.
 *
 * This resource contains only:
 * - the URL of the GeoJSON file;
 * - a unique identifier used to reference this label in the map
 *   or within the application logic.
 *
 * @property url - The URL to the GeoJSON file.
 * @property id - A unique identifier for the label resource.
 *
 * @example
 * const cityLabel: GeoJsonLabels = {
 *   url: "/geoJson_files/city_label.geojson",
 *   id: "city_label_1"
 * };
 */
type GeoJsonLabels = {
    url: string;
    id: string;
};

/**
 * Represents a custom GeoJSON Feature used to display a point on the map.
 *
 * This Feature includes:
 * - a geometry of type `Point` with coordinates `[longitude, latitude]`;
 * - properties controlling the label display, icons, and zoom behavior.
 *
 * @property type - Must always be `"Feature"`, according to the GeoJSON specification.
 *
 * @property geometry - Describes the position of the point:
 *   - `type`: Always `"Point"`.
 *   - `coordinates`: An array `[longitude, latitude]`.
 *
 * @property properties - Metadata associated with the point:
 *   - `fr`: The French display name.
 *   - `jsx`: A JSX version of the label (e.g., for React rendering).
 *   - `icon`: The default icon ID or URL.
 *   - `icon_darkmode`: The icon for the darkmode (optional).
 *   - `icon_selected`: The icon ID or URL used when the point is selected.
 *   - `min_zoom` *(optional)*: Minimum zoom level required for the point to be displayed.
 *
 * @example
 * const feature: CustomFeature = {
 *   type: "Feature",
 *   geometry: {
 *     type: "Point",
 *     coordinates: [2.3522, 48.8566] // Longitude, Latitude
 *   },
 *   properties: {
 *     fr: "Paris",
 *     jsx: "<p>Paris</p>",
 *     icon: "city_default",
 *     icon_selected: "city_selected",
 *     min_zoom: 10
 *   }
 * };
 */
type CustomFeature = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [number, number],
    },
    properties: {
        fr: string,
        jsx: string,
        icon: string,
        icon_darkmode?: string,
        icon_selected: string,
        min_zoom?: number,
    },
};


/**
 * Represents a custom GeoJSON collection containing multiple features.
 *
 * This structure follows the standard GeoJSON `FeatureCollection` format.
 * It groups together multiple custom point features (`CustomFeature`) used for
 * displaying markers on a map or for other application logic.
 *
 * @property type - Must always be `"FeatureCollection"`, following the GeoJSON specification.
 *
 * @property features - An array of custom features
 * ({@link CustomFeature}) representing each point or element within the collection.
 *
 * @example
 * const cities: CustomGeoJson = {
 *   type: "FeatureCollection",
 *   features: [
 *     {
 *       type: "Feature",
 *       geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
 *       properties: {
 *         fr: "Paris",
 *         jsx: "<b>Paris</b>",
 *         icon: "city_default",
 *         icon_selected: "city_selected",
 *         min_zoom: 8
 *       }
 *     }
 *   ]
 * };
 */
type CustomGeoJson = {
    type: "FeatureCollection",
    features: CustomFeature[],
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
 * @param labels - An array of {@link GeoJsonLabels} representing the labels to update.
 *
 * @example
 * setDarkmodeToLabels(map, [cityLabel]);
 * // This will set the label text to white, the halo to black, and use the white icon.
 */
function setDarkmodeToLabels(map: MapboxMap, labels: GeoJsonLabels[]): void {
    labels.forEach((label) => {
        if (!map.getLayer(label.id)) return;
        map.setPaintProperty(label.id, 'text-color',
            darkmode ? '#ffffff' : '#000000');
        map.setPaintProperty(label.id, 'text-halo-color',
            darkmode ? '#000000' : '#ffffff');
        map.setLayoutProperty(label.id, "icon-image",
            darkmode ? ['coalesce', ['get', 'icon_darkmode'], ['get', 'icon']] : ['get', 'icon']
        );
    });
}

/**------------------------------------------------------------------------------------- */
/**                                    SET WATER COLOR                                   */
/**------------------------------------------------------------------------------------- */

/**
 * Bathymetry color stops for ocean depths.
 *
 * This interface defines color mappings for two modes:
 * - whitemode: suitable for light-themed maps
 * - darkmode: suitable for dark-themed maps
 *
 * Each mode is represented as a flat array of numbers and strings, where each
 * number indicates a depth in meters and the following string is the corresponding color.
 * Example: [200, "#78bced", 1000, "#3d9cd4", ...]
 */
interface Bathymetry {
    /**
     * Color stops for light-themed maps.
     * Format: [depth1, color1, depth2, color2, ...]
     * Example: [200, "#78bced", 1000, "#3d9cd4"]
     */
    whitemode: (number | string)[];
    /**
     * Color stops for dark-themed maps.
     * Format: [depth1, color1, depth2, color2, ...]
     * Example: [200, "#213e4e", 1000, "#1c3341"]
     */
    darkmode: (number | string)[];
}

/**
 * Predefined bathymetry color mappings.
 *
 * These values can be used in Mapbox GL JS or similar mapping libraries
 * to interpolate colors based on ocean depth.
 */
const bathymetryColors: Bathymetry = {
    // Light-themed color palette for ocean depths
    whitemode: [
        200, '#78bced',   // shallow water
        1000, '#3d9cd4',  // medium depth
        3000, '#2874a6',  // deep water
        9000, '#15659f',  // very deep water
    ],
    // Dark-themed color palette for ocean depths
    darkmode: [
        200, '#213e4e',   // shallow water (dark)
        1000, '#1c3341',  // medium depth (dark)
        3000, '#152530',  // deep water (dark)
        9000, '#010405',  // very deep water (almost black)
    ],
};

/**
 * Sets the water color layer on a Mapbox map according to ocean depth.
 *
 * This function adds a vector source and a fill layer to represent ocean
 * depth using color interpolation. It supports both light and dark modes.
 *
 * If the layer already exists, it updates the `fill-color` paint property
 * with the new color stops.
 *
 * @param map - The Mapbox map instance on which to add or update the water layer.
 *
 * @example
 * // Light mode
 * mapboxTools.darkmode = false;
 * setWaterColor(map);
 *
 * @example
 * // Dark mode
 * mapboxTools.darkmode = true;
 * setWaterColor(map);
 *
 * @remarks
 * The function uses the `bathymetryColors` object for color stops:
 * - `whitemode` is used when darkmode is false
 * - `darkmode` is used when darkmode is true
 *
 * The color interpolation uses the Mapbox `interpolate` expression with
 * the `min_depth` property from the `mapbox-bathymetry-v2` vector source.
 */
function setWaterColor(map: MapboxMap) {
    const idWaterLayer: string = "ocean-depth";
    const colors: (number | string)[] = darkmode ? bathymetryColors.darkmode : bathymetryColors.whitemode;

    if (!map.getSource(idWaterLayer)) {
        map.addSource(idWaterLayer, {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-bathymetry-v2'
        });
    }
    if (!map.getLayer(idWaterLayer)) {
        map.addLayer({
            id: idWaterLayer,
            type: 'fill',
            source: idWaterLayer,
            'source-layer': 'depth',
            filter: ['>', ['get', 'min_depth'], 0],
            paint: {
                'fill-color': [
                    'interpolate', ['linear'], ['get', 'min_depth'],
                    ...colors
                ],
                'fill-opacity': 1.0,
            }
        }, "hillshade");
    } else {
        map.setPaintProperty(idWaterLayer, 'fill-color', [
            'interpolate', ['linear'], ['get', 'min_depth'],
            ...colors
        ]);
    }
}

export { setWaterColor };
/*****************************************************************************************/


/**------------------------------------------------------------------------------------- */
/**                              SET DARKMODE TO MAP                                     */
/**------------------------------------------------------------------------------------- */

/**
 * Defines the set of color values used to style different categories of layers
 * in the map when switching between dark mode and light mode.
 *
 * Each property corresponds to a major visual component of the map, such as
 * water, buildings, parks, roads, text, and borders.
 *
 * This type is used by `setDarkModeToMap()` to apply the correct color palette
 * depending on the selected theme.
 *
 * @property background - Main land/background color of the map.
 * @property water - Color applied to water bodies (lakes, rivers, seas).
 * @property park - Color applied to parks, forests, and natural green areas.
 * @property building - Color applied to building polygons or 3D extrusions.
 * @property road - Color used for primary and major roads.
 * @property roadMinor - Color used for secondary, minor, or residential roads.
 * @property border - Color applied to administrative borders or boundaries.
 * @property text - Default color for text labels on symbol layers.
 * @property textHalo - Color for the halo around text labels.
 */
type LayerStyleInclude = {
    background: string,
    water: string,
    park: string,
    building: string,
    road: string,
    roadMinor: string,
    border: string,
    text: string,
    textHalo: string,
}

/**
 * Sets the water color layer on a Mapbox map according to ocean depth.
 *
 * This function adds a vector source and a fill layer to represent ocean
 * depth using color interpolation. It supports both light and dark modes.
 *
 * This function is used internally by {@link setDarkModeToMap} to update
 * the water layer when switching between light and dark map themes.
 *
 * If the layer already exists, it updates the `fill-color` paint property
 * with the new color stops.
 *
 * @param map - The Mapbox map instance on which to add or update the water layer.
 *
 * @example
 * // Light mode
 * mapboxTools.darkmode = false;
 * setWaterColor(map);
 *
 * @example
 * // Dark mode
 * mapboxTools.darkmode = true;
 * setWaterColor(map);
 *
 * @remarks
 * The function uses the `bathymetryColors` object for color stops:
 * - `whitemode` is used when darkmode is false
 * - `darkmode` is used when darkmode is true
 *
 * The color interpolation uses the Mapbox `interpolate` expression with
 * the `min_depth` property from the `mapbox-bathymetry-v2` vector source.
 */
function setDarkModeToMap(map: MapboxMap): void {
    const layers = map.getStyle().layers;
    if (!layers) return;
    setWaterColor(map);

    // Couleurs du mode sombre
    const darkColors: LayerStyleInclude = {
        background: '#343332',      // Fond principal (terre)
        water: '#213e4e',           // Eau
        park: '#1e3a1e',            // Parcs et espaces verts
        building: '#2a2a3e',        // Bâtiments
        road: '#6E6E6E',            // Routes principales
        roadMinor: '#8a8a8a',       // Routes secondaires
        border: '#1A1A1A',          // Bordures/limites
        text: '#e0e0e0',            // Texte
        textHalo: '#1a1a2e',        // Halo du texte
    };
    // Couleurs du mode clair
    const lightColors: LayerStyleInclude = {
        background: '#f8f8f8',      // Fond principal (terre)
        water: '#78bced',           // Eau
        park: '#c8e6c9',            // Parcs et espaces verts
        building: '#e0e0e0',        // Bâtiments
        road: '#c9c9c9',            // Routes principales
        roadMinor: '#cfcfcf',       // Routes secondaires
        border: '#d0d0d0',          // Bordures/limites
        text: '#333333',            // Texte
        textHalo: '#ffffff',        // Halo du texte
    };
    const colors: LayerStyleInclude = darkmode ? darkColors : lightColors;

    if (map.getLayer('land')) {
        map.setPaintProperty('land', 'background-color', colors.background);
    }
    layers.forEach(layer => {
        try {
            if (layer.id.includes('water')) {
                if (layer.type === 'fill') {
                    map.setPaintProperty(layer.id, 'fill-color', colors.water);
                } else if (layer.type === 'line') {
                    map.setPaintProperty(layer.id, 'line-color', colors.water);
                }
            }
            if (layer.id.includes('park') || layer.id.includes('landuse') || layer.id.includes('natural')) {
                if (layer.type === 'fill') {
                    map.setPaintProperty(layer.id, 'fill-color', colors.park);
                }
            }
            if (layer.id.includes('building')) {
                if (layer.type === 'fill') {
                    map.setPaintProperty(layer.id, 'fill-color', colors.building);
                } else if (layer.type === 'fill-extrusion') {
                    map.setPaintProperty(layer.id, 'fill-extrusion-color', colors.building);
                }
            }
            if (layer.id.includes('road') || layer.id.includes('street') || layer.id.includes('highway')) {
                if (layer.type === 'line') {
                    const color = layer.id.includes('primary') || layer.id.includes('highway')
                        ? colors.road
                        : colors.roadMinor;
                    map.setPaintProperty(layer.id, 'line-color', color);
                }
            }
            if (layer.id.includes('border') || layer.id.includes('boundary') || layer.id.includes('admin')) {
                if (layer.type === 'line') {
                    map.setPaintProperty(layer.id, 'line-color', colors.border);
                }
            }
            if (layer.type === 'symbol') {
                map.setPaintProperty(layer.id, 'text-color', colors.text);
                map.setPaintProperty(layer.id, 'text-halo-color', colors.textHalo);
            }
        } catch (error) {
            console.log(error);
        }
    });
}

/*****************************************************************************************/

const PIN_LABELS_FOLDER: string = "/img/pin/"
const loadedIcons = new Set<string>();

/**
 * Loads all icons referenced in a given GeoJSON label file into the Mapbox map.
 *
 * This is an **internal helper function** (not exported) used to ensure that
 * all icons required by the features inside a label's GeoJSON file are properly
 * loaded before being used by the map.
 *
 * The function:
 * - fetches the GeoJSON file associated with the label,
 * - extracts all icon names (`icon` and `icon_selected`) from each feature,
 * - prevents duplicate loading by checking a global `loadedIcons` set,
 * - loads missing icons using `map.loadImage`,
 * - adds them to the Mapbox style using `map.addImage`,
 * - waits for all asynchronous image loads to complete.
 *
 * @param map - The Mapbox map instance where icons should be registered.
 * @param label - A label configuration containing the URL of the associated GeoJSON file.
 *
 * @throws If the GeoJSON file cannot be fetched.
 *
 * @example
 * // This function is used internally when initializing label layers.
 * await loadIcons(map, cityLabel);
 */

async function loadIcons(map: MapboxMap, label: GeoJsonLabels): Promise<void> {
    const response = await fetch(label.url);
    if (!response.ok) throw new Error("Error fetch " + label.url);
    const geojson: CustomGeoJson = await response.json();
    const promises: Promise<void>[] = [];

    geojson.features.forEach((feature) => {
        const icons = [
            feature.properties.icon,
            feature.properties.icon_selected,
            feature.properties.icon_darkmode,
        ];

        icons.forEach((icon) => {
            if (!icon) return;
            if (loadedIcons.has(icon)) return;
            loadedIcons.add(icon);
            const url = PIN_LABELS_FOLDER + icon;
            const p = new Promise<void>((resolve, reject) => {
                map.loadImage(url, (err, img) => {
                    if (err) return reject(err);
                    if (img && !map.hasImage(icon)) {
                        map.addImage(icon, img!);
                    }
                    resolve();
                });
            });
            promises.push(p);
        });
    });
    await Promise.all(promises);
}


const filtersMemory: Map<string, Record<string, FilterSpecification>> = new Map();

/**
 * Manages and applies filters on a specified Mapbox layer.
 *
 * This function keeps track of multiple independent filters per layer
 * using an internal memory map. Each filter is stored under a `filterKey`,
 * allowing different parts of the application to add, update, or remove
 * their own filters without overriding others.
 *
 * @param map - The Mapbox map instance.
 * @param layerId - The ID of the Mapbox layer to apply filters to.
 * @param filterKey - A unique key identifying the filter to set or remove.
 * @param filter - The filter expression to apply.  
 *                If `null`, the filter corresponding to `filterKey` is removed.
 *
 * How it works:
 * - Ensures a filter store exists for the given `layerId`.
 * - Adds, updates, or deletes a filter under the provided `filterKey`.
 * - Rebuilds the combined filter:
 *     - No filters → `null` (removes filter on the layer)
 *     - One filter → applies that single filter directly
 *     - Multiple filters → wraps them in an `"all"` filter (logical AND)
 * - Applies the resulting filter to the Mapbox layer if it exists.
 *  * ---
 * ### Examples
 *
 * #### 1. Add a new filter
 * ```ts
 * filterGestion(map, "my-layer", "onlyRed", ["==", ["get", "color"], "red"]);
 * ```
 * #### 2. Modify an existing filter (same `filterKey`)
 * ```ts
 * filterGestion(map, "my-layer", "onlyRed", ["==", ["get", "color"], "blue"]);
 * ```
 * #### 3. Remove a filter
 * ```ts
 * filterGestion(map, "my-layer", "onlyRed", null);
 * ```
 */
function filterGestion(map: MapboxMap, layerId: string, filterKey: string, filter: FilterSpecification | null): void {
    if (!filtersMemory.has(layerId)) {
        filtersMemory.set(layerId, {});
    }

    const layerFilters = filtersMemory.get(layerId)!;
    if (filter === null) {
        delete layerFilters[filterKey];
    } else {
        layerFilters[filterKey] = filter;
    }
    const filters = Object.values(layerFilters);
    const combinedFilter = filters.length === 0 ? null :
        filters.length === 1 ? filters[0] :
            ['all', ...filters];

    if (map.getLayer(layerId)) {
        map.setFilter(layerId, combinedFilter);
    }
}


/**
 * Adds GeoJSON-based label layers to a Mapbox map and ensures the icons used by
 * those labels are loaded beforehand.
 *
 * This function processes each {@link GeoJsonLabels} entry by:
 * 1. Fetching the corresponding GeoJSON file and loading all icons referenced
 *    inside its features (via `loadIcons`, an internal helper).
 * 2. Creating a GeoJSON source with the label's ID if it does not already exist.
 * 3. Adding a default `symbol` layer for the label if it is not yet present.
 *    - The default layer uses the feature’s `icon` property for the marker.
 *    - Text labels use the `fr` property.
 *    - Sizes (text and icon) adapt dynamically based on zoom levels.
 *
 * The function also creates a secondary *highlighted* layer (with `-highlighted`
 * appended to the ID) that:
 * - Displays the `icon_selected` variant;
 * - Uses distinct text colors for highlighting;
 * - Remains hidden by default until its filter is updated externally.
 *
 * Layer behavior includes:
 * - Icon overlap enabled;
 * - Text halo and color styling;
 * - Zoom-based visibility via `min_zoom` feature property.
 *
 * @param map - The Mapbox map instance where layers will be added.
 * @param labels - An array of {@link GeoJsonLabels}, each containing a URL to
 *                 a GeoJSON file and a unique ID used for both the source and layers.
 *
 * @example
 * addGeoJsonLabels(map, [
 *   {
 *     url: "/geoJson_files/cities.geojson",
 *     id: "cities_label"
 *   }
 * ]);
 */
function addGeoJsonLabels(map: MapboxMap, labels: GeoJsonLabels[]): void {
    labels.forEach((label) => {
        loadIcons(map, label).then(() => {
            if (!map.getSource(label.id)) {
                map.addSource(label.id, { type: "geojson", data: label.url });
            }
            if (!map.getLayer(label.id)) {
                map.addLayer({
                    id: label.id,
                    type: 'symbol',
                    source: label.id,
                    layout: {
                        'icon-image': ['get', 'icon'],
                        'icon-allow-overlap': true,
                        'text-field': ['get', 'fr'],
                        'symbol-z-order': 'source',
                        'symbol-sort-key': 0,
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
                    },
                });
                filterGestion(map, label.id, "zoom", ['>=', ['zoom'],
                    ['coalesce', ['get', 'min_zoom'], 0]
                ]);
            }
            const highlightedLayerId = `${label.id}-highlighted`;
            if (!map.getLayer(highlightedLayerId)) {
                const sourceLayer = map.getLayer(label.id);
                map.addLayer({
                    id: highlightedLayerId,
                    type: 'symbol',
                    source: label.id,
                    layout: {
                        ...sourceLayer?.layout,
                        'icon-image': ['get', 'icon_selected'],
                    },
                    paint: {
                        ...sourceLayer?.paint,
                        'text-color': "#e56c00",
                        'text-halo-color': "#ffffff",
                    },
                });
                filterGestion(map, highlightedLayerId, "get_fr", ["==", "fr", ""]);
            }
        });
    });
}

/**
 * Highlights one or more specific labels on the map, or resets all labels to match the current dark mode style.
 *
 * If one or more label names are provided, this function visually highlights all matching labels
 * by changing their icon and text colors. If no name is provided, all labels are reset
 * to their default appearance according to the `darkmode` setting.
 *
 * @param map - The Mapbox map instance where the labels are displayed.
 * @param labels - An array of {@link GeoJsonLabels} representing the labels to update.
 * @param name - *(Optional)* A single label name or an array of names to highlight.
 *               Each name corresponds to the `"fr"` property in the GeoJSON features.
 *               If omitted, all labels are reset to normal.
 *
 * @example
 * // Highlight a single label named "Paris"
 * highLightLabel(map, labels, "Paris");
 *
 * @example
 * // Highlight multiple labels
 * highLightLabel(map, labels, ["Paris", "Lyon", "Marseille"]);
 *
 * @example
 * // Reset all labels to match the dark mode style
 * highLightLabel(map, labels);
 */
function highLightLabel(map: MapboxMap, labels: GeoJsonLabels[], name?: string | string[]): void {
    labels.forEach((label) => {
        const highlightedLayerId = `${label.id}-highlighted`;
        if (!map.getLayer(label.id) || !map.getLayer(highlightedLayerId)) return;
        if (name === undefined) {
            setDarkmodeToLabels(map, [label]);
            filterGestion(map, highlightedLayerId, "get_fr", ["==", "fr", ""]);
            return;
        }
        const nameArray = typeof name === "string" ? [name] : name;
        filterGestion(map, highlightedLayerId, "get_fr", ['in', 'fr', ...nameArray]);
    });
}

/**
 * Reloads GeoJSON-based label layers on a Mapbox map.
 *
 * This function removes any existing layers and sources associated with the
 * given {@link GeoJsonLabels}, then re-adds them by calling `addGeoJsonLabels`.
 * It is useful when label data changes, when the underlying GeoJSON files are
 * updated, or when icons referenced inside those files need to be refreshed.
 *
 * If the `map` parameter is `null`, the function exits without performing any action.
 *
 * @param map - The Mapbox map instance on which the label layers should be reloaded.
 *              If `null`, the function does nothing.
 * @param labels - An array of {@link GeoJsonLabels} defining the GeoJSON resources
 *                 and IDs to reload.
 *
 * @example
 * reload_json_labels(map, [
 *   {
 *     url: "/geoJson_files/city_label.geojson",
 *     id: "city_label_1"
 *   }
 * ]);
 */
function reload_json_labels(map: MapboxMap | null, labels: GeoJsonLabels[]): void {
    if (!map) return;
    labels.forEach((label) => {
        if (map.getLayer(label.id)) map.removeLayer(label.id);
        if (map.getLayer(`${label.id}-highlighted`)) map.removeLayer(`${label.id}-highlighted`);
        if (map.getSource(label.id)) map.removeSource(label.id);
    });
    addGeoJsonLabels(map, labels);
}

export {
    type GeoJsonLabels, type CustomFeature, type CustomGeoJson,
    addGeoJsonLabels, reload_json_labels, filterGestion,
    highLightLabel, setDarkmodeToLabels, setDarkModeToMap,
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
};

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
        /** Geographic bounding box of the image in [minLng, minLat, maxLng, maxLat] order. */
        bounds: [number, number, number, number],
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
 *     bounds: [33.6803545, 31.1732927, 36.6260058, 33.7008169],
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
                    bounds: geomap.bounds,
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
 *
 * @internal
 * This function is meant to be used internally by {@link add_popup}.
 */
function handler(map: MapboxMap, e: MapMouseEvent): void {
    if (!e.features || !e.features.length) return;
    const feature = e.features[0];
    if (!feature.properties || feature.geometry.type !== 'Point') return;

    const coords: LngLatLike = feature.geometry.coordinates as LngLatLike;
    const popup = new mapboxgl.Popup({ anchor: "bottom", closeButton: false, offset: [0, -30] })
        .setLngLat(coords);

    const popupNode = document.createElement("div");
    const root = createRoot(popupNode);
    popup.setHTML("<p></p>");
    root.render(
        <CreateHTMLPopup
            name={feature.properties["fr"]}
            lnglat={coords as [number, number]}
            img_url={feature.properties["img"]}
            description={feature.properties["description"]}
            links={JSON.parse(feature.properties["links_more"] ? feature.properties["links_more"] : "[]")}
        />
    );
    popup.once("open", () => {
        const popup_el = document.querySelector(".mapboxgl-popup");
        const popup_content = document.querySelector(".mapboxgl-popup-content") as HTMLDivElement;
        const popup_anchor = document.querySelector('.mapboxgl-popup-tip') as HTMLDivElement;
        if (!popup_el || !popup_anchor || !popup_content) return;

        popup_el.appendChild(popupNode);
        (popup_el as HTMLDivElement).style.alignItems = "center";
        popup_anchor.style.display = "none";
        popup_content.style.display = "none";
    });
    popup.addTo(map);
}


/**
 * Attaches interactive popups to each GeoJSON label layer on the map.
 *
 * When a user clicks on a label, this function:
 * 1. Displays a styled popup showing either basic text or a rendered JSX component.
 * 2. Automatically closes any previously opened popup to ensure only one is visible at a time.
 *
 * Each label layer is assigned its own click handler, which is safely replaced
 * if one already exists — preventing duplicate event bindings.
 *
 * @param map - The Mapbox map instance.
 * @param labels - An array of {@link GeoJsonLabels} representing the label layers to attach popups to.
 *
 * @example
 * // Add popups to all label layers
 * add_popup(map, labels);
 */
function add_popup(map: MapboxMap, labels: GeoJsonLabels[]): void {
    labels.forEach((label) => {
        const ids = [
            label.id,
            `${label.id}-highlighted`
        ];
        ids.forEach((id) => {
            const oldHandler = labelHandlers.get(id);
            if (oldHandler) {
                map.off("click", id, oldHandler);
                labelHandlers.delete(id);
            }
            const newHandler = (e: MapMouseEvent) => handler(map, e);
            labelHandlers.set(id, newHandler);
            map.on("click", id, newHandler);
        });
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
                8, 0, 10, 1.0],
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
 * Represents the state of the user's geolocation tracking.
 *
 * @property enabled - Whether real-time geolocation tracking is currently active.
 * @property pos - The latest known geographic coordinates of the user.
 * @property pos.lng - Longitude of the user’s position.
 * @property pos.lat - Latitude of the user’s position.
 *
 * @example
 * const loc: LocType = {
 *     enabled: true,
 *     pos: { lng: 2.35, lat: 48.85 }
 * };
 */
type LocType = {
    enabled: boolean,
    pos: { lng: number, lat: number }
};

/**
 * Manages real-time user geolocation tracking on a Mapbox map.
 *
 * This function either:
 * - **starts tracking** the user's position when `loc.enabled === true`, or
 * - **stops tracking** when `loc.enabled === false`.
 *
 * When enabled, it continuously updates a Mapbox `Marker` so it follows the
 * user’s live coordinates using `navigator.geolocation.watchPosition()`.
 *
 * @param map - The Mapbox map instance. If `null`, the function safely aborts.
 * @param marker - A React ref holding the current user position `Marker`.
 *                 The marker is created on first position update, then reused.
 * @param loc - The current geolocation state object. Only `loc.enabled` is used to
 *              decide whether tracking should be active or disabled.
 * @param setLoc - React state setter used to update geolocation availability
 *                 and the user’s latest known coordinates.
 * @param watchId - A React ref storing the ID returned by `watchPosition()`,
 *                  allowing the function to avoid multiple watchers and properly
 *                  clear the existing one when tracking is disabled.
 *
 * @example
 * // Enable geolocation tracking
 * get_location(map, markerRef, { enabled: true, pos: { lng: 0, lat: 0 } }, setLoc, watchIdRef);
 *
 * @example
 * // Disable geolocation tracking
 * get_location(map, markerRef, { enabled: false, pos: { lng: 0, lat: 0 } }, setLoc, watchIdRef);
 *
 * @remarks
 * - Ensures **only one active geolocation watcher** exists at a time.
 * - When disabled, the function **removes the marker**, clears the watcher,
 *   and updates state accordingly.
 * - Requests high-accuracy positioning (GPS when available).
 * - Automatically detects unavailable geolocation or permission denial.
 * - Uses `{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }` for
 *   fresh and precise location updates.
 */
function get_location(
    map: MapboxMap | null,
    marker: React.RefObject<Marker | null>,
    loc: LocType,
    setLoc: (val: LocType | ((prev: LocType) => LocType)) => void,
    watchId: React.RefObject<number | null>
): void {
    if (!map) return;
    if (!navigator.geolocation) return;

    if (!loc.enabled) {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
        setLoc((prev) => ({ ...prev, enabled: false }));
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
            setLoc({ enabled: true, pos: { lng: coord[0], lat: coord[1] } });
        },
            (error) => {
                console.log("Error location: ", error);
                available = false;
                setLoc((prev) => ({ ...prev, enabled: false }));
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            });
        if (available) watchId.current = tmp;
    }
}

export { get_location, type LocType };
/*****************************************************************************************/
