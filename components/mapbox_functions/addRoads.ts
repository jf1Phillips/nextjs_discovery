import { Map as MapBoxMap } from "mapbox-gl";

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
export default function addRoads(url_given: string, map: MapBoxMap)
{
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
