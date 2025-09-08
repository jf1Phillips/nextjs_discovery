"use client";

import { useEffect, useRef, use } from "react";
import mapboxgl, {LngLat, Map as MapboxMap} from "mapbox-gl";
import "@/styles/globals.css";
import get_loc from "@/script/get_loc";
import "mapbox-gl/dist/mapbox-gl.css";
import json_load from "./json_load";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
const idbulding: string = "3dbuilding";

type MapArgType = {
    x: number;
    y: number;
    zoom: number;
    zoom2 : number;
    reset ?: number;
    darkMode ?: boolean;
    relief ?: boolean;
};

export function add_marker(long: number, lat: number, map: MapboxMap, str: string): void {
    const popup = new mapboxgl.Popup({offset: 10})
    .setHTML(`<p>${str}</p>`);
    const div_marker: HTMLDivElement = document.createElement('div');
    div_marker.className = "marker mt-[-15px] bg-[url(/img/map_pin.png)] bg-cover w-[30px] h-[30px] cursor-pointer";
    const marker = new mapboxgl.Marker(div_marker).setLngLat([long, lat]).addTo(map);

    marker.setPopup(popup);
}

function add3dbuilding(map: MapboxMap, remove: boolean)
{
        if (map.getLayer(idbulding))
            map.removeLayer(idbulding);
        if (remove)
            return;
        map.addLayer({
            'id': idbulding,
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 1.0
            }
        });
}

function set3dTerrain(map: MapboxMap, remove: boolean) {
    const id_terrain: string = "3d_terrain";

    add3dbuilding(map, remove);
    map.setTerrain(null);
    map.easeTo({pitch: 60, duration: 1000});
    if (remove) {
        map.easeTo({pitch: 0, duration: 1000});
        return;
    }
    if (!map.getSource(id_terrain)) {
        map.addSource(id_terrain, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 512,
        });
    }
    map.setTerrain({source: id_terrain, exaggeration: 1.5});
}

export default function MapDisplay({ x, y, zoom, zoom2, reset, darkMode, relief }: MapArgType
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
        if (!map.current || !zoom2) return;
        var new_zoom = map.current.getZoom();

        console.log(new_zoom, zoom2);
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
            set3dTerrain(map.current, !relief);
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
