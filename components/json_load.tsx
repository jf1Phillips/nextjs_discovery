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

interface LoadProperties {
    label: GeoJsonLabels,
    index: number,
    move: boolean,
    zoom_level: number,
    draw_circle: boolean,
};

export default function json_load(map: MapboxMap, properties: LoadProperties) {
    get_json_data(properties.label.url).then(response => {
        if (!response || !response.features || !response.features.length)
            return;
        const feature: Feature = response.features[properties.index];
        highLightLabel(map, [properties.label], feature.properties.fr);
        if (!properties.move) return;
        const coord: [number, number] = feature.geometry.coordinates;
        map.flyTo({center: coord, zoom: properties.zoom_level});
    });
}
