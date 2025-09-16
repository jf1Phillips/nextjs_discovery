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

export default function json_load(file: string, lang: string, map: MapboxMap) {
    remove_marker(true);
    get_json_data(file).then(response => {
        if (!response)
            return;
        var it: number = 0;
        for (const i in response.points) {
            if (it >= 20)
                break;
            const longlat: number[] = response.points[i].latlong;
            const langage: string = response.points[i].name[lang] ? lang : "fr";
            add_marker(longlat[1], longlat[0], map, response.points[i].name[langage], true);
            ++it;
        }
    });
}
