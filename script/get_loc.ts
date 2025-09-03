import atoi from "./atoi";

type fetch_data = {
    loc: string;
}

export default async function get_loc(): Promise<{ lat: number, long: number } | undefined> {
    try {
        const response = await fetch('https://ipinfo.io/json');
        if (!response.ok) {
            return undefined;
        }
        const data: fetch_data = await response.json();
        const location = data.loc.split(',');
        const lat: number = atoi(location[0]);
        const long: number = atoi(location[1]);

        return {lat , long};
    } catch (error) {
        return undefined;
    }
}
