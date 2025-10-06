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
                'line-color': '#ff0000',
                'line-width': 2
            }
        });
    }
}

export default function addGeoImg(url_given: string, map: MapBoxMap)
{
    const layers = map.getStyle().layers;
    const url = (url_given.includes("es.png")) ? `${GEOMAP_FOLDER}/${GEOMAP_NAME}fr.png` : url_given;

    layers.forEach(layer => {
        if (layer.id.includes("road") || layer.id.includes("label") || layer.id.includes("geo_map")) {
            if (layer.id == url) {
                map.setLayoutProperty(layer.id, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
        }
    });
    if (!map.getSource(url)) {
        map.addSource(url, {
            type: 'image',
            url: url,
            coordinates: [
                [33.6791210, 33.6868944],
                [36.6262031, 33.6868944],
                [36.6262031, 31.1730673],
                [33.6791210, 31.1730673],
            ]
        });
    }
    if (!map.getLayer(url)) {
        map.addLayer({
            id: url,
            type: 'raster',
            source: url,
            paint: {
                'raster-opacity': 0.5,
            }
        });
    }
}
