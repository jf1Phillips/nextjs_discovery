import { Map as MapboxMap } from "mapbox-gl";

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
