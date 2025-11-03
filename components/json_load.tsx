import { GeoJsonLabels, highLightLabel } from "@/script/mapbox_functions";
import {Map as MapboxMap} from "mapbox-gl";

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

async function get_json_data(file_name: string): Promise<GeoJsonScheme | undefined> {
    try {
        const response = await fetch(file_name);
        if (!response.ok) {
            return undefined;
        }
        const json: GeoJsonScheme = await response.json();
        return json;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export default function json_load(map: MapboxMap, label: GeoJsonLabels, index_off: number, move ?: boolean) {
    get_json_data(label.url).then(response => {
        if (!response || !response.features || !response.features.length)
            return;
        const feature: Feature = response.features[index_off];
        const coord: [number, number] = feature.geometry.coordinates;
        highLightLabel(map, [label], feature.properties.fr);
        if (!move) return;
        map.flyTo({center: coord, zoom: 13});
    });
}
