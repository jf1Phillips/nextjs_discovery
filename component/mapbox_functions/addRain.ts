import {Map as MapboxMap} from "mapbox-gl";

export default function addRain(map: MapboxMap, remove_rain ?: boolean)
{
    if (remove_rain) {
        map.setRain(null);
    } else if (!map.getRain()){
        map.setRain({
            density: ['interpolate', ['linear'], ['zoom'],
                11, 0.0, 13, 0.8],
            intensity: 1.0,
            color: '#a8adbc',
            opacity: 0.7,
            vignette: ['interpolate', ['linear'], ['zoom'],
                11, 0.0, 13, 0.8],
            'vignette-color': '#464646',
            direction: [0, 80],
            'droplet-size': [2.6, 18.2],
            'distortion-strength': 0.7,
            'center-thinning': 0
        });
    }
}
