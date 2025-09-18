import {Map as MapboxMap} from "mapbox-gl";
import { remove_marker, add_marker } from "./get_map";

async function get_json_data(file_name: string): Promise<any | undefined> {
    try {
        const response = await fetch(file_name);
        if (!response.ok) {
            return undefined;
        }
        const json: any = await response.json();
        return json;
    } catch (error) {
        return undefined;
    }
}

export default function json_load(file: string, lang: string, map: MapboxMap, index_off: number) {
    remove_marker(true);
    get_json_data(file).then(response => {
        if (!response)
            return;
        const longlat: number[] = response.points[index_off].latlong;
        const langage: string = response.points[index_off].name[lang] ? lang : "fr";
        map.easeTo({
            zoom: 5,
            duration: 1000,
        });
        setTimeout(() => {
            add_marker(longlat[1], longlat[0], map, response.points[index_off].name[langage], true);
            map.easeTo({zoom: 10,
            center: [longlat[1], longlat[0]],
            duration: 1500})}, 1000);
    });
}
