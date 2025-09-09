import mapboxgl, {LngLat, Map as MapboxMap} from "mapbox-gl";
const idbulding: string = "3dbuilding";

function add3dbuilding(map: MapboxMap, remove: boolean)
{
        if (map.getLayer(idbulding))
            map.removeLayer(idbulding);
        if (remove)
            return;
        map.addLayer({
            'id': idbulding,
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

function putShaddow(map: MapboxMap, remove: boolean) {
    const id_shadow: string = "shadow_layer";
    const id_terrain: string = "terrain_to_shadow";

    if (map.getLayer(id_shadow))
        map.removeLayer(id_shadow);
    if (remove) return;
    if (!map.getSource(id_terrain)) {
        map.addSource(id_terrain, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 512,
        });
    }
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

export default function set3dTerrain(map: MapboxMap, remove: boolean) {
    const id_terrain: string = "3d_terrain";

    add3dbuilding(map, remove);
    map.setTerrain(null);
    map.easeTo({pitch: 60, duration: 1000});
    putShaddow(map, remove);
    if (remove) {
        map.easeTo({pitch: 0, duration: 1000});
        return;
    }
    if (!map.getSource(id_terrain)) {
        map.addSource(id_terrain, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 512,
        });
    }
    map.setTerrain({source: id_terrain, exaggeration: 1.5});
}
