"use client";

import { useEffect, useRef } from "react";
import mapboxgl, {Map} from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function MapNbr ({
    params,
}: {
    params: {id: string}
}) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<Map | null>(null);

    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current as HTMLDivElement,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [2.3522, 48.8566],
            zoom: 10,
        });


    }, []);
    return (
        <>
            <p>Map nbr {params.id}</p>
            <div ref={mapContainer}></div>
        </>
    )
}
