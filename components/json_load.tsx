import {Map as MapboxMap} from "mapbox-gl";

interface Lang {
    fr: string,
    [key: string]: string,
}

interface Points {
    latlong: [number, number],
    link: string,
    name: Lang,
};

interface json_data {
    points: Points[],
};

async function get_json_data(file_name: string): Promise<json_data | undefined> {
    try {
        const response = await fetch(file_name);
        if (!response.ok) {
            return undefined;
        }
        const json: json_data = await response.json();
        return json;
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export const lerp = (a: number, b: number, t: number) => a + t * (b - a);
export const invlerp = (a: number, b: number, v: number) => (v - a) / (b - a);
export const remap = (
    v: number,
    oMin: number,
    oMax: number,
    rMin: number,
    rMax: number
) => lerp(rMin, rMax, invlerp(oMin, oMax, v));

export default function json_load(file: string, lang: string, map: MapboxMap, index_off: number, move ?: boolean) {
    get_json_data(file).then(response => {
        if (!response)
            return;
        const latlong: number[] = response.points[index_off].latlong;
        const center = map.getCenter();
        const dist = haversine(latlong[0], latlong[1], center.lat, center.lng);
        // add_marker(latlong[1], latlong[0], map, response.points[index_off].name[langage], true);
        if (!move) return;
        const zoom = Math.max(map.getZoom() - remap(dist, 0, 2000, 1, 5), 2);
        const wait = remap(dist, 0, 2000, 200, 2000);
        const time_out = zoom == 2 ? 0 : wait;
        if (zoom != 2)
            map.easeTo({zoom: zoom, duration: wait,});
        setTimeout(() => {
            map.easeTo({zoom: 10,
            center: [latlong[1], latlong[0]],
            duration: wait})}, time_out);
    });
}
