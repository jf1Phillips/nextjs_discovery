import {Map as MapboxMap} from "mapbox-gl";

export default function addBunker(map: MapboxMap)
{
    const bunker_id: string = "bunker_id";

    if (!map.getSource(bunker_id)) {
        map.addSource(bunker_id, {
            type: 'geojson',
            data: '/geoJson_files/france_building.geojson'
        });
    }
    if (!map.getLayer('batiments-3d')) {
        map.addLayer({
            'id': 'batiments-3d',
            'source': bunker_id,
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 6,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 1.0
            }
        });
    }
}
