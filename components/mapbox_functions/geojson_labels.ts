import { Map as MapboxMap } from "mapbox-gl";

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
function highLightLabel(map: MapboxMap, labels: GeoJsonLabels[], darkmode: boolean, name?: string) {
    labels.forEach((label) => {
        if (!map.getLayer(label.id)) return;
        const icon = darkmode ? label.icons.white.id : label.icons.dark.id;
        const txtColor = darkmode ? '#ffffff' : '#000000';
        const haloColor= darkmode ? '#000000' : '#ffffff';

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

export {type GeoJsonLabels, type Icon,
    addGeoJsonLabels, reload_json_labels,
    highLightLabel, setDarkmodeToLabels};

