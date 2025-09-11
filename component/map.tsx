"use client";

import { useEffect, useRef, use } from "react";
import mapboxgl, {Map as MapboxMap} from "mapbox-gl";
import "@/styles/globals.css";
import get_loc from "@/script/get_loc";
import "mapbox-gl/dist/mapbox-gl.css";
import json_load from "./json_load";
import set3dTerrain from "./mapbox_functions/set3dterrain";
import addRain from "./mapbox_functions/addRain";
import addBunker from "./mapbox_functions/addBunker";
import addGeoImg from "./mapbox_functions/add_geoimg";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

const get_img: string = "/only_road.png";

type MapArgType = {
    x: number;
    y: number;
    zoom: number;
    zoom2 : number;
    reset ?: number;
    darkMode ?: boolean;
    relief ?: boolean;
    rain ?: boolean;
};

export function add_marker(long: number, lat: number, map: MapboxMap, str: string): void {
    const popup = new mapboxgl.Popup({offset: 10})
        .setHTML(`<p>${str}</p>`);
    const div_marker: HTMLDivElement = document.createElement('div');
    div_marker.className = "marker mt-[-15px] bg-[url(/img/map_pin.png)] bg-cover w-[30px] h-[30px] cursor-pointer";
    const marker = new mapboxgl.Marker(div_marker).setLngLat([long, lat]).addTo(map);

    marker.setPopup(popup);
}

export default function MapDisplay({ x, y, zoom, zoom2, reset, darkMode, relief, rain }: MapArgType
) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<MapboxMap | null>(null);
    const anc_zoom = useRef<number>(zoom2);
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

            map.current.once("load", () => {
                if (!map.current)
                    return;
                set3dTerrain(map.current, !relief);
                addBunker(map.current);
                addGeoImg(get_img, map.current);
                add_marker(2.10, 48.15, map.current, "Personal bunker");
                map.current.setPaintProperty('water', 'fill-color', 'rgba(14, 122, 155, 1)');
                json_load("/json_files/test.json", "fr", map.current);
                get_loc().then(location => {
                    if (!location || !map.current)
                        return;
                    add_marker(location.long, location.lat, map.current, "your location");
                });
                add_marker(x, y, map.current, "paris");
            });
        } else {
            const new_x: number = x % 90;
            const new_y: number = y % 90;

            map.current.easeTo({
                center: [new_x, new_y],
                zoom: zoom,
                duration: 1000
            });
        }
    }, [x, y, zoom, reset]);

    useEffect(() => {
        if (!map.current) return;
        if (map.current.isStyleLoaded())
            addRain(map.current, !rain);
    }, [rain, darkMode]);

    useEffect(() => {
        if (!map.current || !zoom2) return;
        var new_zoom = map.current.getZoom();

        if (anc_zoom.current > zoom2) {
            new_zoom -= 1;
        }
        else if (anc_zoom.current < zoom2) {
            new_zoom += 1;
        }
        anc_zoom.current = zoom2;
        map.current.easeTo({zoom: new_zoom, duration: 200});
    }, [zoom2]);

    useEffect(() => {
        if (!map.current) return;
        map.current.setStyle(style);
        map.current.once("style.load", () => {
            if (!map.current) return;
            addRain(map.current, !rain);
            addBunker(map.current);
            set3dTerrain(map.current, !relief);
            addGeoImg(get_img, map.current);
            map.current.setPaintProperty('water', 'fill-color', darkMode ? 'rgba(14, 15, 99, 1)': 'rgba(14, 122, 155, 1)');
        });
    }, [darkMode]);

    useEffect(() => {
        if (!map.current) return;
        if (!map.current.isStyleLoaded()) {
            map.current.once("style.load", () => {
                if (!map.current) return;
                set3dTerrain(map.current, !relief);
            });
        } else {
            set3dTerrain(map.current, !relief);
        }
    }, [relief]);

    return (
        <div
            className="overflow-hidden"
            ref={mapContainer}
            style={{ width: "100%", height: "calc(100vh - 165px)" }}
        />
    );
}
