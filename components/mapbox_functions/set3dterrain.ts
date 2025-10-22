import { Map as MapboxMap } from "mapbox-gl";

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
export default function set3dTerrain(map: MapboxMap, remove: boolean) {
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
