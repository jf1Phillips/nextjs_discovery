import { Map as MapBoxMap } from "mapbox-gl";
import { GEOMAP_FOLDER, GEOMAP_NAME } from "../get_map";

export function addRoads(url_given: string, map: MapBoxMap)
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

export type Coords = [[number, number], [number, number], [number, number], [number, number]];
const default_coord: Coords =
[
    [33.6791210, 33.6868944],
    [36.6262031, 33.6868944],
    [36.6262031, 31.1730673],
    [33.6791210, 31.1730673],
];

export default function addGeoImg(url_given: string, map: MapBoxMap, coords ?: Coords)
{
    const url = (url_given.includes("es.jpg")) ? `${GEOMAP_FOLDER}/${GEOMAP_NAME}fr.jpg` : url_given;
    const coordinates: Coords = !coords ? default_coord : coords;

    if (!map.getSource(url)) {
        map.addSource(url, {
            type: 'image',
            url: url,
            coordinates: coordinates,
        });
    }
    if (!map.getLayer(url)) {
        map.addLayer({
            id: url,
            type: 'raster',
            source: url,
            paint: {
                'raster-opacity': !coords ? 0.5 : 0.0,
            }
        });
    }
}
