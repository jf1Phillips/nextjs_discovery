import { Map as MapboxMap } from "mapbox-gl";

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
function addRain(map: MapboxMap, remove_rain?: boolean) {
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

export {addRain};
