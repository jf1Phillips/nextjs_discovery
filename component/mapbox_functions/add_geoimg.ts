import { Map as MapBoxMap } from "mapbox-gl";

export default function addGeoImg(url_given: string, map: MapBoxMap)
{
    const layers = map.getStyle().layers;
    const url = (url_given.includes("es.png")) ? "/geo_map_fr.png" : url_given;

    layers.forEach(layer => {
        if (layer.id.includes("road") || layer.id.includes("label") || layer.id.includes("geo_map")) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
    });
    if (!map.getSource(url)) {
        map.addSource(url, {
            type: 'image',
            url: url,
            coordinates: [
                [33.6751210, 33.7012944],
                [36.6274031, 33.7012944],
                [36.6274031, 31.1730673],
                [33.6751210, 31.1730673],
            ]
        });
    }
    if (!map.getLayer(url)) {
        map.addLayer({
            id: url,
            type: 'raster',
            source: url,
            paint: {
                'raster-opacity': 0.9,
            }
        });
    } else {
        map.setLayoutProperty(url, 'visibility', 'visible');
    }
}
