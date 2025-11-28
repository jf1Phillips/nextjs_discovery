import { useState } from 'react';
import { Map as MapboxMap } from 'mapbox-gl';

type SearchBarProps = {
    map: MapboxMap,
    className?: string,
    enabled?: boolean,
};

async function fetchSearchResults(query: string): Promise<[number, number] | null> {
    const url = "https://nominatim.openstreetmap.org/search";
    const params = new URLSearchParams({
        q: query,
        format: "json",
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            headers: {
                "User-Agent": "Nominatim-Test-Koa/1.0 (+https://www.solidarite-logement.org)",
                "Accept-Language": "fr",
            },
        });
        if (!response.ok) {
            return null;
        }
        const data: { lat: string; lon: string }[] = await response.json();
        console.log("Search results:", data);
        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            return [lat, lon];
        }
        return null;
    } catch (error) {
        console.error("Error fetching search results:", error);
        return null;
    }
}

export default function SearchBar(
    { className, enabled, map }: SearchBarProps
): React.JSX.Element {
    const [search, setSearch] = useState<string>("");
    const [error, setError] = useState<boolean>(false);

    const handleSubmit = () => {
        fetchSearchResults(search).then((coords) => {
            if (coords && map) {
                map.flyTo({
                    center: [coords[1], coords[0]],
                    zoom: 12,
                });
                setError(false);
            } else {
                setError(true);
            }
        });
    };

    return (<>
        <div className={className}>
            <input
                type="text"
                value={search}
                onChange={(e) => {setSearch(e.target.value); setError(false);}}
                onKeyDown={(e) => { e.key === "Enter" && handleSubmit()}}
                placeholder="Rechercher un lieu..."
                className={`h-[35px] px-4 py-2 border border-gray-300
                    rounded-lg focus:outline-none focus:border-gray-500
                    duration-300
                    ${enabled ? `bg-bgWhiteMode ${error ? "text-[#cf3535]" : "text-white"}` :
                                `bg-bgDarkMode ${error ? "text-[#cf3535]" : "text-black"}`}`}
            />
        </div>
    </>);
}