"use client";

import SelectLang from "@/component/select_option";
import ZoomInOut from "@/component/zoom_in_out";
import DarkMode from "@/component/darkmode";
import React, { useState, useRef, useEffect, JSX } from "react";
import mapboxgl, {Map as MapboxMap} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";
import set3dTerrain from "./mapbox_functions/set3dterrain";
import addBunker from "./mapbox_functions/addBunker";
import addGeoImg from "./mapbox_functions/add_geoimg";
import get_loc from "@/script/get_loc";
import atoi from "@/script/atoi";
import json_load from "./json_load";
import addRain from "./mapbox_functions/addRain";

const markers: mapboxgl.Marker[] = [];
const custom_rm: mapboxgl.Marker[] = [];

export function add_marker(long: number, lat: number, map: MapboxMap, str: string, rm ?: boolean): void
{
    const popup = new mapboxgl.Popup({offset: 10})
        .setHTML(`<p>${str}</p>`);
    const div_marker: HTMLDivElement = document.createElement('div');
    div_marker.className = "marker mt-[-15px] bg-[url(/img/map_pin.png)] bg-cover w-[30px] h-[30px] cursor-pointer";
    const marker = new mapboxgl.Marker(div_marker).setLngLat([long, lat]).addTo(map);

    marker.setPopup(popup);
    markers.push(marker);
    if (rm)
        custom_rm.push(marker);
}

export function remove_marker(custom ?: boolean): void
{
    if (custom) {
        custom_rm.forEach(marker => {marker.remove()});
        custom_rm.length = 0;
        return;
    }
    markers.forEach(marker => {marker.remove()});
    markers.length = 0;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type MapVar = {
    zoom: number;
    long: number;
    lat: number;
    style_nbr: number;
    enabled: boolean;
    lang: string;
    relief: boolean;
    rain: boolean;
};

const DEFAULT_VALUE: MapVar = {
    zoom: 1,
    long: 2.35522,
    lat: 48.8566,
    style_nbr: 0,
    enabled: false,
    lang: "fr",
    relief: false,
    rain: false,
};

export default function GetMapboxMap (
    {def_zoom, enbl, setEnbl, textNbr}:
    {def_zoom: number, enbl: boolean, setEnbl: React.Dispatch<React.SetStateAction<boolean>>, textNbr: number}
): JSX.Element
{
    const [state, setState] = useState<MapVar>(({...DEFAULT_VALUE, zoom: def_zoom}));
    const [prevNbr, setPrevNbr] = useState<number>(1);
    const map = useRef<MapboxMap | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const style: string[] = ["mapbox://styles/mapbox/light-v10", "mapbox://styles/mapbox/dark-v10"];

    const add_all_things = (new_state: MapVar) => {
        if (!map.current) return;
        remove_marker();
        addBunker(map.current);
        add_marker(2.10, 48.15, map.current, "Personal bunker");
        get_loc().then(location => {
            if (!location || !map.current) return;
            add_marker(location.long, location.lat, map.current, "your location");
        });
        add_marker(DEFAULT_VALUE.long, DEFAULT_VALUE.lat, map.current, "paris");
        json_load("/json_files/test.json", new_state.lang, map.current, textNbr);
        addGeoImg(`/geo_map_${new_state.lang}.png`, map.current);
        map.current?.setPaintProperty('water', 'fill-color', new_state.enabled ? 'rgba(14, 15, 99, 1)': 'rgba(14, 122, 155, 1)');
        set3dTerrain(map.current, !state.relief);
        addRain(map.current, !state.rain);
    }

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: container.current as HTMLDivElement,
                style: style[state.style_nbr],
                projection: 'globe',
                zoom: state.zoom,
                center: [state.long, state.lat],
            });
            map.current.once("style.load", () => add_all_things(state));
        }
    }, []);

    if (prevNbr != textNbr && map.current) {
        setPrevNbr(textNbr);
        console.log("OKOK");
        json_load("/json_files/test.json", state.lang, map.current, textNbr, true);
    }

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
        setEnbl(!enbl);
        setState(prev => {
            const new_state: MapVar = {
                ...prev,
                style_nbr: (prev.style_nbr + 1) % style.length,
                enabled: !prev.enabled,
            };
            map.current?.setStyle(style[new_state.style_nbr]);
            map.current?.once("style.load", () => add_all_things(new_state));
            return new_state;
        });
    }

    const zoomInOut = (z: "in" | "out") => {
        map.current?.easeTo({
            zoom: map.current.getZoom() + (z == "in" ? 1 : -1),
            duration: 300,
        });
    };

    const changeLang = (lang: string) => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        json_load("/json_files/test.json", lang, map.current, textNbr);
        addGeoImg(`/geo_map_${lang}.png`, map.current);
        setState(prev => ({
            ...prev,
            lang: lang,
        }));
    };

    const setRelief = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        set3dTerrain(map.current, state.relief);
        setState(prev => ({...prev, relief: !prev.relief}));
    };

    const setRain = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        addRain(map.current, state.rain);
        setState(prev => ({...prev, rain: !prev.rain}));
    }

    return (<>
        <button className={`absolute w-[22px] h-[22px] mt-[120px] ml-[100px] duration-300 text-[15px] rounded-[2px]
                    ${state.enabled ? "bg-darkMode text-whiteMode" : "bg-whiteMode text-darkMode"}`}
                onClick={setRelief}>
                    {state.relief ? "2d" : "3d"}</button>
        <button className={`absolute w-[22px] h-[22px] mt-[120px] ml-[132px] duration-300 text-[15px] rounded-[2px]
                    ${state.enabled ? "bg-darkMode" : "bg-whiteMode"}`}
                onClick={setRain}>
                    {!state.rain ? "🌧️" : "☀️"}</button>
        <SelectLang setSelected={changeLang} darkmode={state.enabled}/>
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
