"use client";

import { useEffect, useRef, use } from "react";
import mapboxgl, {Map as MapboxMap} from "mapbox-gl";
import "@/styles/globals.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function MapDisplay({ x, y, zoom }:
    { x: number; y: number; zoom: number }
) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<MapboxMap | null>(null);

    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current as HTMLDivElement,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [x, y],
            zoom: zoom,
        });
    }, [x, y, zoom]);
    return (
        <div
            className="rounded-[10] overflow-hidden"
            ref={mapContainer}
            style={{ width: "70%", height: "500px" }}
        />
    );
}
