"use client";

import { useEffect, useRef, use } from "react";
import mapboxgl, {Map as MapboxMap} from "mapbox-gl";
import "@/styles/globals.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapArgType = {
    x: number;
    y: number;
    zoom: number;
    reset: number;
}

export default function MapDisplay({ x, y, zoom, reset }: MapArgType
) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<MapboxMap | null>(null);

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current as HTMLDivElement,
                style: "mapbox://styles/mapbox/dark-v10",
                center: [x, y],
                zoom: zoom,
                projection: 'globe',
            });
        } else {
            map.current.easeTo({
                center: [x % 90, y % 90],
                zoom: zoom,
                duration: 1000,
                easing: function(t) {
                    return t;
                }
            })
        }
    }, [x, y, zoom, reset]);
    return (
        <div
            className="overflow-hidden"
            ref={mapContainer}
            style={{ width: "100%", height: "500px" }}
        />
    );
}
