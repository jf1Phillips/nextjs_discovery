import { GeoJsonLabels, highLightLabel, setEnvironment } from "@/script/mapbox_functions";
import { Map as MapboxMap } from "mapbox-gl";

interface Feature {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [number, number],
    },
    properties: {
        fr: string,
        [key: string]: string,
    },
};

interface GeoJsonScheme {
    type: "FeatureCollection",
    features: Feature[],
};

const geoJsonMemory: Map<string, GeoJsonScheme> = new Map();

async function get_json_data(file_name: string): Promise<GeoJsonScheme | undefined> {
    try {
        if (!geoJsonMemory.has(file_name)) {
            const response  = await fetch(file_name);
            if (!response.ok) {
                return undefined;
            }
            const data: GeoJsonScheme = await response.json();
            geoJsonMemory.set(file_name, data);
        }
        const scheme: GeoJsonScheme | undefined = geoJsonMemory.get(file_name);
        return scheme;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

/**
 * Creates a square bounding box around a central point
 * @param coord - [longitude, latitude] of the central point
 * @param sizeKm - Size of the square in kilometers (radius from center to edge)
 * @returns bounds in format [[west, south], [east, north]]
 * 
 * @example
 * // Create a 50km radius square around Jerusalem
 * const bounds = createBoundsAroundPoint([35.2137, 31.7683], 50);
 * // Returns: [[34.6137, 31.3183], [35.8137, 32.2183]]
 */
function createBoundsAroundPoint(
    coord: [number, number], 
    sizeKm: number = 50
): [[number, number], [number, number]] {
    const [lng, lat] = coord;
    const latDelta = sizeKm / 111;
    const lngDelta = sizeKm / (111 * Math.cos(lat * Math.PI / 180));

    return [
        [lng - lngDelta, lat - latDelta],
        [lng + lngDelta, lat + latDelta]
    ];
}

interface BaseLoadProperties {
    label: GeoJsonLabels,
    index: number,
    move: boolean,
    zoom_level: number,
};

type LoadProperties =
    | (BaseLoadProperties & {
        draw_circle: false,
    })
    | (BaseLoadProperties & {
        draw_circle: true,
        radius: number,
    });

export default function json_load(map: MapboxMap, properties: LoadProperties) {
    get_json_data(properties.label.url).then(response => {
        if (!response || !response.features || !response.features.length)
            return;
        const feature: Feature = response.features[properties.index];
        const coord: [number, number] = feature.geometry.coordinates;

        // const modulo = properties.index % 5;
        // setEnvironment(map, {
        //     snow: modulo == 1,
        //     wind: modulo == 2 || modulo == 4,
        //     rain: modulo == 3 || modulo == 4,
        //     bounds: createBoundsAroundPoint(coord, 1)
        // });

        highLightLabel(map, [properties.label], feature.properties.fr);
        if (!properties.move) return;
        map.flyTo({ center: coord, zoom: properties.zoom_level });
    });
}
