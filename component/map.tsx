"use client";

import { useEffect, useRef, use } from "react";
import mapboxgl, {Map as MapboxMap} from "mapbox-gl";
import "@/styles/globals.css";
import get_loc from "@/script/get_loc";
import "mapbox-gl/dist/mapbox-gl.css";
import json_load from "./json_load";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapArgType = {
    x: number;
    y: number;
    zoom: number;
    reset: number;
    darkMode: boolean;
};

export function add_marker(long: number, lat: number, map: MapboxMap, str: string): void {
    const marker = new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);
    const popup = new mapboxgl.Popup()
        .setHTML(`<p>${str}</p>`);
    marker.setPopup(popup);
}

export default function MapDisplay({ x, y, zoom, reset, darkMode = false }: MapArgType
) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<MapboxMap | null>(null);
    const style: string = !darkMode ? "mapbox://styles/mapbox/light-v10" : "mapbox://styles/mapbox/dark-v10";

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current as HTMLDivElement,
                style: style,
                center: [x, y],
                zoom: zoom,
                projection: 'globe',
            });

            map.current.on("load", () => {
                if (!map.current)
                    return;
                json_load("/json_files/test.json", map.current);
                get_loc().then(location => {
                    if (!location || !map.current)
                        return;
                    add_marker(location.long, location.lat, map.current, "your location");
                });
                add_marker(x, y, map.current, "paris");
            });
        } else {
            const new_x = x % 90;
            const new_y = y % 90;

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

    useEffect(() => {
        if (!map.current) {
            return;
        }
        map.current.setStyle(style);
    }, [darkMode]);

    return (
        <div
            className="overflow-hidden"
            ref={mapContainer}
            style={{ width: "100%", height: "500px" }}
        />
    );
}
