import { Map as MapBoxMap } from "mapbox-gl";

export default function addGeoImg(url: string, map: MapBoxMap, id ?: string)
{
    const default_id: string = 'geoimage';
    const id_source: string = id ? id : default_id;
    const id_layer: string = id ? id : default_id;

    const layers = map.getStyle().layers;

    console.log(layers);
    layers.forEach(layer => {
        if (layer.id.includes("road") || layer.id.includes("label")) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
    });
    if (!map.getSource(id_source)) {
        map.addSource(id_source, {
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
    if (!map.getLayer(id_layer)) {
        map.addLayer({
            id: id_layer,
            type: 'raster',
            source: id_source,
            paint: {
                'raster-opacity': 0.9,
            }
        });
    }
}
