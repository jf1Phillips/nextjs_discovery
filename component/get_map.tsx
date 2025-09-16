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
import set3dTerrain from "./mapbox_functions/set3dterrain";
import addBunker from "./mapbox_functions/addBunker";
import addGeoImg from "./mapbox_functions/add_geoimg";
import { add_marker, remove_marker } from "@/component/map";
import get_loc from "@/script/get_loc";
import atoi from "@/script/atoi";
import { stat } from "fs";
import json_load from "./json_load";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapVar = {
    zoom: number;
    long: number;
    lat: number;
    style_nbr: number;
    enabled: boolean;
};

const DEFAULT_VALUE: MapVar = {
    zoom: 1,
    long: 2.35522,
    lat: 48.8566,
    style_nbr: 0,
    enabled: false,
};

export default function GetMapboxMap (): JSX.Element
{
    const [state, setState] = useState<MapVar>(DEFAULT_VALUE);
    const [selected, setSelected] = useState<string>("fr");
    const map = useRef<MapboxMap | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const style: string[] = ["mapbox://styles/mapbox/light-v10", "mapbox://styles/mapbox/dark-v10"];

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: container.current as HTMLDivElement,
                style: style[state.style_nbr],
                projection: 'globe',
                zoom: state.zoom,
                center: [state.long, state.lat],
            });
            map.current.on("style.load", () => {
                if (!map.current) return;
                remove_marker();
                addBunker(map.current);
                addGeoImg("/geo_map_fr.png", map.current);
                add_marker(2.10, 48.15, map.current, "Personal bunker");
                get_loc().then(location => {
                    if (!location || !map.current) return;
                    add_marker(location.long, location.lat, map.current, "your location");
                });
                add_marker(DEFAULT_VALUE.long, DEFAULT_VALUE.lat, map.current, "paris");
                json_load("/json_files/test.json", "fr", map.current);
            });
            map.current.once("style.load", () => {
                map.current?.setPaintProperty('water', 'fill-color', 'rgba(14, 122, 155, 1)');
            });
        }
    });

    const submitEvent = (event: React.FormEvent) => {
        event.preventDefault();
        const target: HTMLFormElement = event.target as HTMLFormElement;
        const newZoom = atoi(target.zoom.value, DEFAULT_VALUE.zoom);
        const newLat = atoi(target.lat.value, DEFAULT_VALUE.lat);
        const newLong = atoi(target.long.value, DEFAULT_VALUE.long);

        setState(prev => ({
            ...prev,
            zoom: newZoom,
            lat: newLat,
            long: newLong,
        }));
        map.current?.easeTo({
            zoom: newZoom,
            center: [newLong, newLat],
            duration: 1000,
        });
    };

    const changeMode = () => {
        setState(prev => {
            const new_state: MapVar = {
                ...prev,
                style_nbr: (prev.style_nbr + 1) % style.length,
                enabled: !prev.enabled,
            };
            map.current?.setStyle(style[new_state.style_nbr]);
            map.current?.once("style.load", () => {
                map.current?.setPaintProperty('water', 'fill-color', new_state.enabled ? 'rgba(14, 15, 99, 1)': 'rgba(14, 122, 155, 1)');
            });
            return new_state;
        });
    }

    const zoomInOut = (z: "in" | "out") => {
        map.current?.easeTo({
            zoom: map.current.getZoom() + (z == "in" ? 1 : -1),
            duration: 300,
        });
    };

    return (<>
        <SelectLang selected={selected} setSelected={setSelected} darkmode={state.enabled}/>
        <ZoomInOut enabled={state.enabled} setZoom={zoomInOut} />
        <DarkMode enabled={state.enabled} changeMode={changeMode} className="absolute ml-[calc(100%-60px)] mt-[120px]"/>
        <form className="text-customWhite flex flex-col items-center justify-center mt-4"
                onSubmit={submitEvent}>
            <div className="flex flex-row gap-x-[10vw]">
                <div className="flex flex-col items-center">
                    <label className="mb-[5px]">Zoom</label>
                    <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                            type="text" name="zoom" defaultValue={state.zoom.toString()}/>
                </div>
                <div className="flex flex-col items-center">
                    <label className="mb-[5px]">Lat</label>
                    <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                            type="text" name="lat" defaultValue={state.lat.toString()}/>
                </div>
                <div className="flex flex-col items-center">
                    <label className="mb-[5px]">Long</label>
                    <input className="outline-none border-solid border-[2px] rounded-full bg-customGrey2 text-center w-[100px]"
                            type="text" name="long" defaultValue={state.long.toString()}/>
                </div>
            </div>
            <button className="
                    rounded-full bg-customGrey2 w-[80px] mt-[30px] h-[30px] border-customGrey2
                    hover:bg-customGrey2Hover hover:border-[2px] hover:border-solid hover:border-customGrey2
                    transition-all duration-200 ease-in-out"
                type="submit">View</button>
        </form>
        <div className="mt-[30px] flex items-center justify-center w-full">
            <div
                className="overflow-hidden"
                ref={container}
                style={{ width: "100%", height: "calc(100vh - 165px)" }}/>
        </div>
    </>)
}
