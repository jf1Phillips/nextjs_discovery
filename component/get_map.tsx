"use client";

import { JSX } from "react";
import SelectLang from "@/component/select_option";
import ZoomInOut from "@/component/zoom_in_out";
import DarkMode from "@/component/darkmode";
import MapDisplay from "@/component/map";
import React, { useState, useRef, useEffect } from "react";
import mapboxgl, {Map as MapboxMap} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapVar = {
    zoom: number;
    long: number;
    lat: number;
};

const DEFAULT_VALUE: MapVar = {
    zoom: 1,
    long: 2.35522,
    lat: 48.8566,
};

export default function GetMapboxMap (): JSX.Element
{
    const [state, setState] = useState<MapVar>(DEFAULT_VALUE);
    const map = useRef<MapboxMap | null>(null);
    const container = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: container.current as HTMLDivElement,
            });
        }
    });

    return (<>
        <div className="mt-[30px] flex items-center justify-center w-full">
            <div
                className="overflow-hidden"
                ref={container}
                style={{ width: "100%", height: "calc(100vh - 165px)" }}/>
        </div>
    </>)
}
