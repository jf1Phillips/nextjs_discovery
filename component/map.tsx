"use client";

import { useEffect, useRef, use } from "react";
import mapboxgl, {Map as MapboxMap} from "mapbox-gl";
import "@/styles/globals.css";
import get_loc from "@/script/get_loc";
import "mapbox-gl/dist/mapbox-gl.css";

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

            map.current.on("load", () => {
                if (!map.current)
                    return;
                get_loc().then(location => {
                    if (!location || !map.current)
                        return;
                    new mapboxgl.Marker().
                        setLngLat([location.long, location.lat])
                        .addTo(map.current);
                });
                new mapboxgl.Marker()
                    .setLngLat([x, y])
                    .addTo(map.current);
            });
        } else {
            const new_x = x % 90;
            const new_y = y % 180;

            map.current.easeTo({
                center: [new_x, new_y],
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
